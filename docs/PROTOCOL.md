# 接入原理：Codex app-server 协议与 Demo 实现

这份文档解释 `Nebula Agent` 背后的协议细节。读完你应该能自己实现一个 app-server 客户端，
或者把这里的模式迁移到别的产品里。

> 验证版本：`codex-cli 0.166.0`。app-server 仍标记为 experimental，字段可能随版本变化；
> 依赖前建议用 `codex app-server generate-json-schema --out ./schema` 生成 schema 对照。

## 1. app-server 是什么，和 `codex exec` 有什么区别

`codex` 是一个 agent 产品，但它的能力分成两层：

- **agent runtime / 模型循环**：调模型、维护上下文、执行工具、跑沙箱、处理审批、压缩历史。
- **客户端**：TUI、IDE 插件、`codex exec`，以及你自己写的宿主。

`codex app-server` 把第一层通过 JSON-RPC 暴露出来，客户端只负责交互。和 `codex exec` 相比：

| | `codex exec` | `codex app-server` |
| --- | --- | --- |
| 形态 | 一次性命令 | 长驻进程 / 会话 |
| 输出 | 进程 stdout | 结构化 notification 流 |
| 工具调用 | 内部处理，结果混在文本里 | `item` 事件，可单独渲染 |
| 审批 | 终端交互 | server 反向 request，宿主自定义 UI |
| 工具扩展 | 配置文件 | 按会话注入 MCP + 动态工具 |
| 适用 | CI、脚本 | 产品、IDE、Web、桌面客户端 |

所以本 demo 的“接入原理”其实是一句话：**用 JSON-RPC 把 Codex 当 agent 后端，宿主做前端和策略**。

## 2. 传输与消息类型

- 传输：子进程的 stdin/stdout（也可以 `--listen unix://...` / `ws://...`）。
- 帧格式：**一行一个 JSON 对象**（JSONL / NDJSON）。
- 协议：JSON-RPC 2.0，三个方向：

| 类型 | 特征 | 例子 |
| --- | --- | --- |
| client → server request | 有 `id`，等 response | `thread/start`、`turn/start` |
| client → server notification | 无 `id` | `initialized` |
| server → client notification | 无 `id` | `item/agentMessage/delta` |
| server → client request | 有 `id`，等宿主回应 | `item/commandExecution/requestApproval` |

注意最后一行：**server 也会发 request**。如果你的客户端只处理 response，遇到审批就会卡死。
请求 `id` 两个方向各自独立，不要混用。

## 3. 握手

```json
// → 
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{
  "clientInfo":{"name":"nebula-demo","title":"Nebula Demo","version":"0.1.0"},
  "capabilities":{"experimentalApi":true}
}}

// ←
{"jsonrpc":"2.0","id":1,"result":{
  "userAgent":"nebula-demo/0.166.0 (Ubuntu 22.4.0; x86_64) ...",
  "codexHome":"/path/to/.codex-home",
  "platformFamily":"unix",
  "platformOs":"linux"
}}

// →
{"jsonrpc":"2.0","method":"initialized"}
```

`capabilities.experimentalApi = true` 才会开放 `skills/*` 等实验方法；生产客户端要评估稳定性。

## 4. 数据模型：thread / turn / item

- **thread**：一次会话（一段上下文、一个 cwd、一套模型/沙箱设置）。有稳定 `threadId`，
  会持久化到 `CODEX_HOME/sessions/...jsonl`。
- **turn**：一次用户输入触发的完整 agent 回合。从 `turn/started` 到 `turn/completed`。
- **item**：回合里的原子事件。所有 UI 都是 item 的渲染结果。

本 demo 订阅并渲染的 item 类型：

| item.type | 关键字段 | UI 表现 |
| --- | --- | --- |
| `agentMessage` | `text`, `phase`（`commentary` / `final_answer`） | 正文；进度/最终回答 |
| `reasoning` | `summary[]`, `content[]` | 可折叠“思考过程” |
| `commandExecution` | `command`, `cwd`, `status`, `aggregatedOutput`, `exitCode`, `durationMs` | 命令卡片 + 实时输出 |
| `fileChange` | `changes[{path, kind:{type}, diff}]`, `status` | diff 卡片 |
| `mcpToolCall` | `server`, `tool`, `arguments`, `status`, `result.content`, `error` | MCP 调用卡片 |
| `plan` | `text` | 计划卡片 |
| `webSearch` | `action` | 搜索卡片（demo 未启用） |

其他类型（`imageView`、`subAgentActivity`、`contextCompaction` 等）可以忽略或扩展。

## 5. 创建会话

```json
{"jsonrpc":"2.0","id":2,"method":"thread/start","params":{
  "cwd":"/repo/workspace",
  "approvalPolicy":"on-request",
  "sandbox":"workspace-write",
  "model":"gpt-6.1-sol",
  "developerInstructions":"你是 Nebula 助手……",
  "config":{
    "mcp_servers":{
      "kb":{"command":"python3","args":["mcp/kb_server.py"],"default_tools_approval_mode":"approve"},
      "notes":{"command":"python3","args":["mcp/notes_server.py"],"default_tools_approval_mode":"prompt"}
    }
  }
}}
```

关键参数：

- `cwd`：线程工作目录，也是 `workspace-write` 沙箱默认可写根。
- `sandbox`：`read-only` / `workspace-write` / `danger-full-access`，**线程级**，中途只能新建线程改。
- `approvalPolicy`：`untrusted` / `on-request` / `never`；可在 turn 级覆盖。
- `config`：任意 Codex 配置的深合并，这里用来注入 `mcp_servers`，避免改用户全局配置。
- `developerInstructions`：宿主追加的 system prompt，适合写产品约束和工具使用规范。

响应里会带回 `thread`、实际生效的 `model`、`sandbox`、`instructionSources` 等。

## 6. 发起回合与接收流

```json
{"jsonrpc":"2.0","id":3,"method":"turn/start","params":{
  "threadId":"01a1...",
  "input":[{"type":"text","text":"P0 的响应时限是多少？"}],
  "model":"gpt-6.1-sol",
  "effort":"medium",
  "approvalPolicy":"on-request"
}}
```

`turn/start` 很快返回 `{turn:{id,status:"inProgress",items:[]}}`，真正内容靠通知：

| 通知 | 载荷 | 用途 |
| --- | --- | --- |
| `turn/started` | `threadId`, `turn` | 标记忙碌 |
| `item/started` | `threadId`, `turnId`, `item` | 新建卡片 |
| `item/agentMessage/delta` | `itemId`, `delta` | 追加文本 |
| `item/reasoning/summaryTextDelta` | `itemId`, `delta` | 追加思考摘要 |
| `item/commandExecution/outputDelta` | `itemId`, `delta` | 命令输出流 |
| `item/completed` | `item`（含完整结果） | 收尾、替换成最终渲染 |
| `thread/tokenUsage/updated` | `tokenUsage.{total,last,modelContextWindow}` | 上下文用量 |
| `turn/completed` | `turn.status` / `turn.error` | 结束；可能 `failed`/`interrupted` |
| `error` / `warning` | `error.message` 等 | 错误提示 |

宿主不需要理解模型内部，只要把 item 画出来；需要“进度”时看 `phase=commentary`，
最终答案看 `phase=final_answer`。

## 7. server → 宿主的反向请求

这是接入的核心难点。宿主必须实现这些方法的处理，否则回合会挂起：

| 方法 | 何时出现 | 响应 |
| --- | --- | --- |
| `item/commandExecution/requestApproval` | 命令超出沙箱 / 需要网络或提权 | `{decision:"accept"}`、`acceptForSession`、`decline`、`cancel` |
| `item/fileChange/requestApproval` | 写工作区之外的路径 | 同上 |
| `mcpServer/elicitation/request` | MCP 工具审批 / 表单输入 | `{action:"accept",content:{...}}`、`decline`、`cancel` |
| `item/permissions/requestApproval` | 模型申请扩展权限 profile | `{permissions:{...},scope:"turn"}` |
| `item/tool/requestUserInput` | 模型反问用户（问卷） | `{answers:{<questionId>:{answers:[...]}}}` |
| `item/tool/call` | 宿主注册的 dynamic tool 被调用 | 自定义结果 |

MCP 工具审批的 `params._meta` 里带 `codex_approval_kind: "mcp_tool_call"`、
`tool_description`、`tool_params_display`，可以直接渲染成“哪个 server、哪个工具、什么参数”。
demo 从 `message` 里解析出工具名（`Allow the notes MCP server to run tool "save_note"?`）。

实现要点：

- **每个请求必须回应一次**，成功或错误（`respond` / `respondError`）。
- 挂起请求要有超时（demo 10 分钟自动 decline），否则页面关了会永久卡住。
- 用户可能同时收到多个请求，UI 要排队。
- `decision` 的取值随方法不同，不能统一映射；demo 里做了按方法的映射。

## 8. MCP 工具接入细节

app-server 在 `thread/start` 时读取 `config.mcp_servers`，为线程启动 MCP 进程并握手。
宿主可以观察：

- `mcpServer/startupStatus/updated`：`starting` / `ready` / `failed`。
- `mcpServerStatus/list`（带 `threadId`、`detail:"full"`）：返回每个 server 的
  `runtimeStatus`、`tools`（含 inputSchema、annotations）、`resources`、`toolsError`。
- 模型调用时产生 `mcpToolCall` item，`result.content[]` 是 MCP 原始内容。
- 宿主也可以**绕过模型**直接调用工具：

```json
{"jsonrpc":"2.0","id":9,"method":"mcpServer/tool/call","params":{
  "threadId":"01a1...",
  "server":"kb",
  "tool":"search_knowledge",
  "arguments":{"query":"回滚标准"}
}}
```

demo 侧栏的“知识库检索”就是这么实现的：同一个 MCP server，既服务模型，也服务宿主 UI。

审批策略：

- `default_tools_approval_mode: "approve"`：工具调用自动放行（适合只读检索）。
- `"prompt"`：每次调用都发 `mcpServer/elicitation/request`（适合写操作）。
- 还可用注解 `readOnlyHint` 等做更细的策略；生产环境建议按工具 + 参数做规则。

## 9. Skills 接入细节

技能是**文件系统约定**，不是 API 注册：

```
<root>/<skill-name>/SKILL.md
```

`SKILL.md` 的 frontmatter：

```markdown
---
name: release-checklist
description: 准备发布说明时使用。按固定五段结构产出。
---
正文……
```

宿主启动时调用：

```json
{"method":"skills/extraRoots/set","params":{"extraRoots":["/repo/skills"]}}
{"method":"skills/list","params":{"cwds":["/repo/workspace"],"forceReload":true}}
```

`skills/list` 返回每个技能的名字、description、路径、scope、是否 enabled。app-server 会把
技能元数据注入 system prompt；模型需要细节时自己读取文件（demo 中表现为
`commandExecution: cat .../SKILL.md`），所以技能正文不占常驻上下文。

注意：

- 路径必须是绝对路径；相对路径会被拒绝。
- 技能目录里没有 `SKILL.md` 不会被发现；`name` 建议与目录名一致。
- 账号插件/云技能也会出现在 `skills/list`，demo 只展示 `source` 为 project / system 的项。

## 10. 本地知识库：BM25 而不是向量库

demo 刻意不用向量库，原因：知识库接入的“缝”是 MCP 工具，检索算法是可替换的实现细节。
BM25 足够展示“检索 → 读全文 → 带引用回答”的完整链路，而且零依赖、可离线。

索引流程（`mcp/kb_server.py`）：

1. 递归读取 `knowledge/*.md`；
2. 按 `## ` 切 chunk，保留标题；
3. 中文切词：每个汉字一个 unigram + 相邻二元组；英文/数字按 `[A-Za-z0-9_.:/-]+`；
4. 统计 `df`、`tf`、平均长度；
5. 查询时对每个 chunk 计算：

```text
idf = ln(1 + (N - df + 0.5) / (df + 0.5))
score = Σ idf * tf*(k1+1) / (tf + k1*(1 - b + b*dl/avgdl))
k1 = 1.2, b = 0.75
```

返回 `doc_id / title / heading / score / snippet`。模型被要求在回答里写 `[doc_id]`，
这样“是否真的查了”一眼可验证。

升级路径：

- 换 embedding：保持 `search_knowledge(query, top_k)` 签名，内部换成向量检索；
- 混合检索：BM25 + 向量加权融合；
- 增量索引：文件 mtime + 缓存；
- 权限：在 MCP server 内按用户过滤文档，而不是在 prompt 里过滤。

## 11. 错误、超时与中断

- `turn/start` 在上一轮未结束时返回错误（demo 映射为 409）。宿主应在 UI 里禁用发送。
- `turn/completed.turn.status` 可能是 `failed` / `interrupted`，`turn.error` 带原因。
- `turn/interrupt`：宿主“停止”按钮调用它，server 会中止模型流和工具。
- 审批超时：demo 自动 decline；生产要记录“超时未处理”。
- JSON-RPC 错误：`{error:{code,message,data}}`，宿主应把 `message` 透传给用户。
- app-server 进程退出：client 应把 pending 请求全部 reject，并提示重连。

## 12. 安全模型

- **沙箱**：`workspace-write` 默认只能写 `cwd`；读通常更宽。`read-only` 下任何写入都需要审批。
- **审批**：沙箱拒绝的操作不会“悄悄重试”，而是变成 server → 宿主的审批请求。
- **CODEX_HOME 隔离**：demo 使用仓库内 `.codex-home/`，只软链 auth，避免污染用户配置。
- **网络**：demo 的线程默认无网络权限；需要联网的操作要么被沙箱拒绝，要么触发审批。
- **不要把 `danger-full-access` 暴露给不可信用户**；宿主是最后一道防线。

## 13. 排错

| 现象 | 可能原因 |
| --- | --- |
| `failed to initialize state runtime` | `CODEX_HOME` 不可写；换到可写目录 |
| MCP server 一直 starting | 命令/args/env 错、Python 依赖缺失、server 写了 stdout 非 JSON |
| 模型不调用工具 | 工具描述/schema 不清、approval 模式拦住了、developerInstructions 没约束 |
| 技能不出现 | `extraRoots` 不是绝对路径、缺 `SKILL.md`、frontmatter 不合法 |
| 回合卡在“运行中” | 宿主没回应 server request（审批/提问）；检查 `serverRequest` 分支 |
| 审批弹窗不出现 | UI 没订阅 SSE，或 approval 事件被 replay 逻辑吞掉 |

---

更上层的架构、场景和生产化建议见 [README](../README.md)。
