#!/usr/bin/env python3
"""笔记 MCP server：演示"有副作用的工具 + 人工审批"。

save_note 会写 demo-data/notes.json。这个 MCP server 在 Codex 的配置里是
`default_tools_approval_mode = "prompt"`，所以模型每次调用都会触发
`mcpServer/elicitation/request`，由宿主 UI 决定 accept / decline。
"""

import json
import os
import re
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from mcp_base import MCPServer, log, text_result  # noqa: E402

NOTES_FILE = Path(
    os.environ.get("NOTES_FILE") or (Path(__file__).resolve().parent.parent / "demo-data" / "notes.json")
)


def slugify(text):
    slug = re.sub(r"[^\w\u4e00-\u9fff-]+", "-", text.strip()).strip("-")
    return slug[:40] or "note"


def load_notes():
    if not NOTES_FILE.exists():
        return []
    try:
        data = json.loads(NOTES_FILE.read_text(encoding="utf-8"))
        return data.get("notes", [])
    except (json.JSONDecodeError, OSError) as exc:
        log(f"failed to read notes: {exc}")
        return []


def save_notes(notes):
    NOTES_FILE.parent.mkdir(parents=True, exist_ok=True)
    tmp = NOTES_FILE.with_suffix(".tmp")
    tmp.write_text(json.dumps({"notes": notes}, ensure_ascii=False, indent=2), encoding="utf-8")
    tmp.replace(NOTES_FILE)


class NotesServer(MCPServer):
    name = "nebula-notes"
    version = "0.1.0"
    instructions = "保存 Nebula 项目的长期笔记。save_note 会写入本地文件，需要用户审批。"

    def tools(self):
        return [
            {
                "name": "save_note",
                "title": "保存笔记",
                "description": "把一段结论保存为本地笔记（带标题）。写入前会请求用户审批。",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "title": {"type": "string", "description": "笔记标题"},
                        "content": {"type": "string", "description": "笔记正文，使用 Markdown"},
                        "tags": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "可选标签",
                        },
                    },
                    "required": ["title", "content"],
                },
                "annotations": {"readOnlyHint": False, "destructiveHint": False, "openWorldHint": False},
            },
            {
                "name": "list_notes",
                "title": "列出笔记",
                "description": "列出已保存的笔记（标题、时间、id）。",
                "inputSchema": {"type": "object", "properties": {}},
                "annotations": {"readOnlyHint": True},
            },
        ]

    def call_tool(self, name, arguments):
        if name == "save_note":
            title = str(arguments.get("title") or "").strip()
            content = str(arguments.get("content") or "").strip()
            tags = arguments.get("tags") or []
            if not title or not content:
                return text_result("title 和 content 都不能为空", isError=True)
            notes = load_notes()
            note = {
                "id": f"{int(time.time())}-{slugify(title)}",
                "title": title,
                "content": content,
                "tags": [str(t) for t in tags],
                "createdAt": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
            }
            notes.append(note)
            save_notes(notes)
            log(f"saved note: {note['id']}")
            return text_result(
                f"已保存笔记「{title}」（id={note['id']}），当前共 {len(notes)} 条。",
                structuredContent={"id": note["id"], "total": len(notes)},
            )

        if name == "list_notes":
            notes = load_notes()
            items = [
                {"id": n["id"], "title": n["title"], "createdAt": n.get("createdAt")}
                for n in notes
            ]
            return text_result(
                json.dumps({"notes": items, "file": str(NOTES_FILE)}, ensure_ascii=False, indent=2)
            )

        return text_result(f"未知工具：{name}", isError=True)


if __name__ == "__main__":
    NotesServer().serve()
