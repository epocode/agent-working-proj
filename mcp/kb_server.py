#!/usr/bin/env python3
"""本地知识库 MCP server：对 knowledge/*.md 做 BM25 检索。

设计要点（演示用，避免引入向量库依赖）：
  * 文档按 Markdown 的 `##` 小节切块，块级检索，返回可引用的 doc_id。
  * 中文按「单字 + 二元组」切词，英文/数字按词切分；BM25 打分。
  * 工具：search_knowledge / read_document / list_documents
  * 资源：kb://docs/<doc_id>（让支持 resources 的客户端直接读原文）

换成向量检索只需要替换 search() 的内部实现，MCP 接口完全不变。
"""

import json
import math
import os
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from mcp_base import MCPServer, log, text_result  # noqa: E402

KB_DIR = Path(os.environ.get("KB_DIR") or (Path(__file__).resolve().parent.parent / "knowledge"))
MAX_READ_CHARS = 20000

CJK_RE = re.compile(r"[\u4e00-\u9fff]")
TOKEN_RE = re.compile(r"[A-Za-z0-9_.:/-]+|[\u4e00-\u9fff]+")


def tokenize(text):
    tokens = []
    for match in TOKEN_RE.finditer(text):
        piece = match.group(0)
        if CJK_RE.match(piece):
            # 中文：单字（召回）+ 二元组（精度）
            tokens.extend(piece)
            tokens.extend(piece[i:i + 2] for i in range(len(piece) - 1))
        else:
            tokens.append(piece.lower())
    return tokens


def parse_title(text, fallback):
    for line in text.splitlines():
        if line.startswith("# "):
            return line[2:].strip()
    return fallback


def split_chunks(text):
    """按二级标题切块；保留标题行，方便模型定位。"""
    chunks = []
    heading = "概述"
    buf = []
    for line in text.splitlines():
        if line.startswith("## "):
            if buf:
                chunks.append((heading, "\n".join(buf).strip()))
            heading = line[3:].strip()
            buf = [line]
        else:
            buf.append(line)
    if buf:
        chunks.append((heading, "\n".join(buf).strip()))
    return [(h, t) for h, t in chunks if t]


class KnowledgeBase:
    def __init__(self, root):
        self.root = root
        self.docs = {}      # doc_id -> {id,title,path,text}
        self.chunks = []    # {doc_id,title,heading,text,tokens}
        self.df = Counter()
        self.postings = defaultdict(list)  # token -> [(chunk_idx, tf)]
        self.avgdl = 1.0
        self.loaded = False

    def load(self):
        if self.loaded:
            return
        self.loaded = True
        if not self.root.exists():
            log(f"knowledge dir not found: {self.root}")
            return
        for path in sorted(self.root.rglob("*.md")):
            text = path.read_text(encoding="utf-8")
            doc_id = path.stem
            self.docs[doc_id] = {
                "id": doc_id,
                "title": parse_title(text, doc_id),
                "path": str(path),
                "text": text,
            }
            for heading, chunk_text in split_chunks(text):
                self.chunks.append({
                    "doc_id": doc_id,
                    "title": self.docs[doc_id]["title"],
                    "heading": heading,
                    "text": chunk_text,
                })
        lengths = []
        for idx, chunk in enumerate(self.chunks):
            tokens = tokenize(chunk["text"])
            tf = Counter(tokens)
            lengths.append(len(tokens))
            for token, count in tf.items():
                self.postings[token].append((idx, count))
                self.df[token] += 1
        self.avgdl = (sum(lengths) / len(lengths)) if lengths else 1.0
        log(f"indexed {len(self.docs)} docs / {len(self.chunks)} chunks, {len(self.df)} terms")

    def search(self, query, top_k=4):
        self.load()
        q_tokens = [t for t in tokenize(query) if t.strip()]
        if not q_tokens or not self.chunks:
            return []
        weights = Counter(q_tokens)
        n = len(self.chunks)
        k1, b = 1.2, 0.75
        scores = defaultdict(float)
        for token, q_weight in weights.items():
            postings = self.postings.get(token)
            if not postings:
                continue
            idf = math.log(1 + (n - self.df[token] + 0.5) / (self.df[token] + 0.5))
            for idx, tf in postings:
                dl = len(tokenize(self.chunks[idx]["text"]))
                denom = tf + k1 * (1 - b + b * dl / self.avgdl)
                scores[idx] += q_weight * idf * (tf * (k1 + 1) / denom)
        results = []
        for idx, score in sorted(scores.items(), key=lambda kv: kv[1], reverse=True)[:top_k]:
            chunk = self.chunks[idx]
            results.append({
                "doc_id": chunk["doc_id"],
                "title": chunk["title"],
                "heading": chunk["heading"],
                "score": round(score, 3),
                "snippet": self.snippet(chunk["text"], query),
            })
        return results

    @staticmethod
    def snippet(text, query, width=420):
        flat = " ".join(text.split())
        # 优先截取包含完整查询串的位置（中文查询很常见）
        pos = flat.find(query.strip()) if query.strip() else -1
        if pos < 0:
            first = tokenize(query)
            for token in first:
                pos = flat.find(token)
                if pos >= 0:
                    break
        if pos < 0:
            return flat[:width] + ("…" if len(flat) > width else "")
        start = max(0, pos - width // 3)
        return ("…" if start > 0 else "") + flat[start:start + width] + (
            "…" if start + width < len(flat) else ""
        )


KB = KnowledgeBase(KB_DIR)


class KnowledgeServer(MCPServer):
    name = "nebula-kb"
    version = "0.1.0"
    instructions = (
        "Nebula 内部知识库。先 search_knowledge 找相关小节，再用 read_document 读全文；"
        "回答时用 [doc_id] 标注来源。"
    )

    def tools(self):
        return [
            {
                "name": "search_knowledge",
                "title": "检索知识库",
                "description": (
                    "按关键词检索 Nebula 内部知识库（BM25），返回最相关的小节、摘要片段和 doc_id。"
                    "支持中英文；query 用名词短语效果最好。"
                ),
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "query": {"type": "string", "description": "检索词，例如「发布流程 灰度」"},
                        "top_k": {"type": "integer", "description": "返回条数，默认 4", "minimum": 1, "maximum": 10},
                    },
                    "required": ["query"],
                },
                "annotations": {"readOnlyHint": True, "openWorldHint": False},
            },
            {
                "name": "read_document",
                "title": "读取文档",
                "description": "按 doc_id 读取知识库中的完整 Markdown 文档（超长会截断）。",
                "inputSchema": {
                    "type": "object",
                    "properties": {"doc_id": {"type": "string", "description": "文档 id，例如 nebula-release-process"}},
                    "required": ["doc_id"],
                },
                "annotations": {"readOnlyHint": True, "openWorldHint": False},
            },
            {
                "name": "list_documents",
                "title": "列出文档",
                "description": "列出知识库全部文档的 doc_id、标题和小节名。",
                "inputSchema": {"type": "object", "properties": {}},
                "annotations": {"readOnlyHint": True, "openWorldHint": False},
            },
        ]

    def call_tool(self, name, arguments):
        KB.load()
        if name == "search_knowledge":
            query = str(arguments.get("query") or "").strip()
            top_k = int(arguments.get("top_k") or 4)
            top_k = max(1, min(top_k, 10))
            hits = KB.search(query, top_k)
            payload = {
                "query": query,
                "results": hits,
                "note": "用 doc_id 调 read_document 获取细节；回答时标注 [doc_id]。" if hits else "没有命中，可换关键词或 list_documents。",
            }
            return text_result(
                json.dumps(payload, ensure_ascii=False, indent=2),
                structuredContent={"results": hits},
            )

        if name == "read_document":
            doc_id = str(arguments.get("doc_id") or "").strip()
            doc = KB.docs.get(doc_id)
            if not doc:
                return text_result(
                    f"未找到文档 {doc_id!r}。可用文档：{', '.join(sorted(KB.docs))}",
                    isError=True,
                )
            text = doc["text"]
            truncated = len(text) > MAX_READ_CHARS
            if truncated:
                text = text[:MAX_READ_CHARS] + "\n\n…（已截断，请按小节检索）"
            return text_result(
                f"# {doc['title']}  [doc_id={doc_id}]\n\n{text}"
                + ("\n\n(truncated)" if truncated else "")
            )

        if name == "list_documents":
            docs = []
            for doc_id, doc in sorted(KB.docs.items()):
                headings = [c["heading"] for c in KB.chunks if c["doc_id"] == doc_id]
                docs.append({"doc_id": doc_id, "title": doc["title"], "headings": headings})
            return text_result(json.dumps({"documents": docs}, ensure_ascii=False, indent=2))

        return text_result(f"未知工具：{name}", isError=True)

    def resources(self):
        KB.load()
        return [
            {
                "uri": f"kb://docs/{doc_id}",
                "name": doc["title"],
                "mimeType": "text/markdown",
                "description": f"Nebula 知识库文档 {doc_id}",
            }
            for doc_id, doc in sorted(KB.docs.items())
        ]

    def read_resource(self, uri):
        KB.load()
        prefix = "kb://docs/"
        if not uri or not uri.startswith(prefix):
            return None
        doc = KB.docs.get(uri[len(prefix):])
        if not doc:
            return None
        return {"uri": uri, "mimeType": "text/markdown", "text": doc["text"]}


if __name__ == "__main__":
    KnowledgeServer().serve()
