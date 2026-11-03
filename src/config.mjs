import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(fileURLToPath(new URL("..", import.meta.url)));

// Codex app-server 的独立 CODEX_HOME，避免污染用户自己的 ~/.codex。
// 用 `CODEX_HOME=/path npm start` 可以指向别处。
export const CODEX_HOME = process.env.CODEX_HOME || path.join(ROOT, ".codex-home");

export const WEB_DIR = path.join(ROOT, "web");
export const KNOWLEDGE_DIR = path.join(ROOT, "knowledge");
export const SKILLS_DIR = path.join(ROOT, "skills");
export const DATA_DIR = path.join(ROOT, "demo-data");

// Codex 线程的工作目录。Agent 的 shell / 文件工具都被沙箱限制在这里（sandbox=workspace-write）。
export const WORKSPACE = process.env.DEMO_WORKSPACE || path.join(ROOT, "workspace");

export const HOST = process.env.HOST || "127.0.0.1";
export const PORT = Number(process.env.PORT || 4317);

// 写进 Codex system prompt 的开发者指令：约束模型的工具与技能使用方式。
export const DEVELOPER_INSTRUCTIONS = `你是「Nebula 助手」，一个用于演示 Codex app-server 接入原理的 Agent。

可用能力：
1. 内置工具：shell 命令、文件读写/补丁。它们运行在 workspace 目录，受 Codex 沙箱和审批策略约束。
2. MCP 服务器 kb：search_knowledge / read_document / list_documents，用于查询本地知识库。
3. MCP 服务器 notes：save_note / list_notes，用于保存长期笔记（保存操作需要用户审批）。
4. Skills：仓库 skills/ 目录下的技能说明。涉及公司流程、发布、调研时，先读取适用的 SKILL.md 并遵循。

行为要求：
- 回答 Nebula 产品、流程、发布代号等内部事实前，先用 kb.search_knowledge 检索；需要细节时用 kb.read_document。回答末尾用 [doc_id] 标注来源。
- 不要编造知识库中不存在的事实；检索不到就明确说明。
- 用户要求记录/保存结论时，调用 notes.save_note，并把要保存的内容写完整。
- 默认用中文回答，先给结论，再给关键依据。`;

export function buildMcpServers() {
  const python = process.env.PYTHON || "python3";
  return {
    kb: {
      command: python,
      args: [path.join(ROOT, "mcp", "kb_server.py")],
      env: { KB_DIR: KNOWLEDGE_DIR },
      // 只读检索工具自动放行，不再逐个弹审批；notes 服务器则保持 prompt。
      default_tools_approval_mode: "approve",
      startup_timeout_sec: 20,
    },
    notes: {
      command: python,
      args: [path.join(ROOT, "mcp", "notes_server.py")],
      env: { NOTES_FILE: path.join(DATA_DIR, "notes.json") },
      default_tools_approval_mode: "prompt",
      startup_timeout_sec: 20,
    },
  };
}
