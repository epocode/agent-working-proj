import { EventEmitter } from "node:events";
import path from "node:path";
import { CodexClient } from "./codex-client.mjs";
import {
  CODEX_HOME,
  DEVELOPER_INSTRUCTIONS,
  SKILLS_DIR,
  WORKSPACE,
  buildMcpServers,
} from "./config.mjs";

const APPROVAL_TIMEOUT_MS = 10 * 60 * 1000;

/**
 * Agent —— 把 Codex app-server 的 thread/turn/item 协议包装成一个会话对象。
 *
 * 它做四件事：
 *   1. 握手：initialize / initialized / skills/extraRoots/set
 *   2. 会话：thread/start（注入 MCP 配置、技能根目录、开发者指令）
 *   3. 回合：turn/start，并把流式 notification 归一化成 UI 事件
 *   4. 审批：把 server 发起的请求挂起，等 Web UI 决策后回写 result
 */
export class Agent extends EventEmitter {
  constructor() {
    super();
    this.client = null;
    this.events = [];
    this.seq = 0;
    this.protocol = [];

    this.phase = "booting";
    this.error = null;
    this.threadId = null;
    this.turnId = null;
    this.items = new Map();
    this.usage = null;

    this.models = [];
    this.skills = [];
    this.mcpServers = [];
    this.approvals = new Map(); // 内部 id -> pending
    this.approvalSeq = 0;

    this.settings = {
      model: null,
      effort: "medium",
      approvalPolicy: "on-request",
      sandbox: "workspace-write",
    };

    this.debug = process.env.DEBUG_CODEX === "1";
  }

  // ---------------------------------------------------------------- lifecycle

  async start() {
    this.client = new CodexClient({
      codexBin: process.env.CODEX_BIN || "codex",
      // 关掉 ChatGPT app/connector 注入，避免无关工具污染演示
      args: ["-c", "features.apps=false"],
      cwd: WORKSPACE,
      env: {
        ...process.env,
        CODEX_HOME,
        RUST_LOG: process.env.RUST_LOG || "error",
      },
    });

    this.client.on("notification", (msg) => this.#onNotification(msg));
    this.client.on("serverRequest", (req) => this.#onServerRequest(req));
    this.client.on("rpc", (rpc) => this.#onRpc(rpc));
    this.client.on("stderr", (text) => {
      if (this.debug) process.stderr.write(`[codex] ${text}`);
    });
    this.client.on("error", (err) => this.#fatal(err.message));
    this.client.on("exit", (info) => {
      if (this.phase !== "closed") this.#fatal(`codex app-server 退出：${JSON.stringify(info)}`);
    });

    this.client.start();

    const init = await this.client.request(
      "initialize",
      {
        clientInfo: { name: "nebula-demo", title: "Nebula Demo", version: "0.1.0" },
        // 打开实验性 API，才能拿到 skills/* 等较新的方法
        capabilities: { experimentalApi: true },
      },
      { timeoutMs: 30000 },
    );
    this.client.notify("initialized");
    this.emit("log", `已连接 app-server：${init.userAgent || "codex"}`);

    // 把仓库里的 skills/ 目录注册成技能根目录。
    // Codex 会扫描 <root>/<skill-name>/SKILL.md，并把元数据注入 system prompt；
    // 模型需要细节时再自己读取 SKILL.md 正文（demo 中通过 shell cat 完成）。
    await this.client.request("skills/extraRoots/set", { extraRoots: [SKILLS_DIR] }, { timeoutMs: 15000 });

    await this.#loadModels();
    await this.#startThread();
    this.phase = "ready";
    this.#emit({ type: "state" });
  }

  async close() {
    this.phase = "closed";
    this.client?.stop();
  }

  async #loadModels() {
    try {
      const res = await this.client.request("model/list", {}, { timeoutMs: 20000 });
      this.models = (res.data || []).map((m) => {
        const id = m.id || m.model || m.slug;
        const rawEfforts = m.supportedReasoningEfforts || m.supported_reasoning_efforts || [];
        const efforts = rawEfforts.map((e) =>
          typeof e === "string"
            ? { value: e, label: e, description: "" }
            : {
                value: e.reasoningEffort || e.value,
                label: e.reasoningEffort || e.value,
                description: e.description || "",
              },
        );
        return {
          id,
          label: m.displayName || m.display_name || m.name || id,
          description: m.description || "",
          efforts,
          defaultEffort: m.defaultReasoningEffort || m.default_reasoning_effort || null,
        };
      });
      const preferred = process.env.DEMO_MODEL;
      const pick =
        this.models.find((m) => m.id === preferred) ||
        this.models.find((m) => m.id === "gpt-5.1-codex-mini") ||
        this.models[0];
      if (pick) {
        this.settings.model = pick.id;
        const values = pick.efforts.map((e) => e.value);
        if (values.includes("medium")) this.settings.effort = "medium";
        else if (pick.defaultEffort) this.settings.effort = pick.defaultEffort;
        else if (values[0]) this.settings.effort = values[0];
      }
    } catch (err) {
      this.emit("log", `model/list 失败（继续用默认模型）：${err.message}`);
    }
  }

  // ------------------------------------------------------------------ thread

  async #startThread() {
    const config = { mcp_servers: buildMcpServers() };
    const params = {
      cwd: WORKSPACE,
      approvalPolicy: this.settings.approvalPolicy,
      sandbox: this.settings.sandbox,
      developerInstructions: DEVELOPER_INSTRUCTIONS,
      config,
    };
    if (this.settings.model) params.model = this.settings.model;

    const res = await this.client.request("thread/start", params, { timeoutMs: 180000 });
    this.threadId = res.thread.id;
    this.turnId = null;
    this.items.clear();
    this.settings.model = res.model || this.settings.model;
    const sandboxType = res.sandbox?.type;
    if (sandboxType === "readOnly") this.settings.sandbox = "read-only";
    else if (sandboxType === "workspaceWrite") this.settings.sandbox = "workspace-write";
    else if (sandboxType === "dangerFullAccess") this.settings.sandbox = "danger-full-access";

    this.emit("log", `thread 已创建：${this.threadId}（cwd=${res.cwd}）`);
    await Promise.all([this.refreshSkills(), this.refreshMcpServers()]);
  }

  async newThread(overrides = {}) {
    if (this.turnId) await this.interrupt();
    Object.assign(this.settings, overrides);
    this.events = [];
    this.seq = 0;
    this.protocol = [];
    for (const approval of this.approvals.values()) clearTimeout(approval.timer);
    this.approvals.clear();
    this.usage = null;
    this.phase = "booting";
    this.#emit({ type: "reset" });
    try {
      await this.#startThread();
      this.phase = "ready";
    } catch (err) {
      this.phase = "error";
      this.error = err.message;
      this.#emit({ type: "error", message: `创建会话失败：${err.message}` });
    }
    this.#emit({ type: "state" });
  }

  updateSettings(patch = {}) {
    for (const key of ["model", "effort", "approvalPolicy", "sandbox"]) {
      if (patch[key] !== undefined && patch[key] !== null) this.settings[key] = patch[key];
    }
    this.#emit({ type: "state" });
    return { ...this.settings };
  }

  async refreshSkills() {
    try {
      const res = await this.client.request(
        "skills/list",
        { cwds: [WORKSPACE], forceReload: true },
        { timeoutMs: 30000 },
      );
      const entry = (res.data || []).find((d) => d.cwd === WORKSPACE) || (res.data || [])[0];
      this.skills = (entry?.skills || []).map((s) => ({
        name: s.name,
        description: s.description,
        path: s.path,
        scope: s.scope,
        enabled: s.enabled,
        // 区分仓库技能 / Codex 系统技能 / 账号插件技能（后者 demo 不展示）
        source: s.path && s.path.startsWith(SKILLS_DIR) ? "project" : s.scope === "system" ? "system" : "other",
      }));
      this.#emit({ type: "state" });
    } catch (err) {
      this.emit("log", `skills/list 失败：${err.message}`);
    }
  }

  async refreshMcpServers() {
    if (!this.threadId) return;
    try {
      const res = await this.client.request(
        "mcpServerStatus/list",
        { threadId: this.threadId, detail: "full" },
        { timeoutMs: 60000 },
      );
      this.mcpServers = (res.data || []).map((s) => ({
        name: s.name,
        status: s.runtimeStatus || "unknown",
        authStatus: s.authStatus,
        error: s.toolsError || null,
        tools: Object.values(s.tools || {}).map((t) => ({
          name: t.name,
          key: t.name,
          description: t.description,
          readOnly: t.annotations?.readOnlyHint ?? null,
        })),
        resources: (s.resources || []).length,
      }));
      this.#emit({ type: "state" });
    } catch (err) {
      this.emit("log", `mcpServerStatus/list 失败：${err.message}`);
    }
  }

  // -------------------------------------------------------------------- turn

  async sendMessage(text) {
    if (!this.threadId) throw new Error("会话尚未就绪");
    if (this.turnId) throw new Error("上一轮还在进行中");
    const trimmed = String(text || "").trim();
    if (!trimmed) throw new Error("消息为空");

    this.phase = "busy";
    this.error = null;
    this.#emit({ type: "user", text: trimmed });
    this.#emit({ type: "state" });

    const params = {
      threadId: this.threadId,
      input: [{ type: "text", text: trimmed }],
      approvalPolicy: this.settings.approvalPolicy,
    };
    if (this.settings.model) params.model = this.settings.model;
    if (this.settings.effort) params.effort = this.settings.effort;

    try {
      const res = await this.client.request("turn/start", params, { timeoutMs: 60000 });
      this.turnId = res.turn.id;
      this.#emit({ type: "state" });
      return res.turn;
    } catch (err) {
      this.phase = "ready";
      this.#emit({ type: "error", message: `启动回合失败：${err.message}` });
      this.#emit({ type: "state" });
      throw err;
    }
  }

  async interrupt() {
    if (!this.threadId || !this.turnId) return;
    try {
      await this.client.request(
        "turn/interrupt",
        { threadId: this.threadId, turnId: this.turnId },
        { timeoutMs: 20000 },
      );
    } catch (err) {
      this.#emit({ type: "notice", message: `中断失败：${err.message}` });
    }
  }

  // ---------------------------------------------------------------- approvals

  #onServerRequest({ id, method, params }) {
    const approval = this.#makeApproval(id, method, params);
    if (approval) {
      approval.timer = setTimeout(() => {
        if (!this.approvals.has(approval.id)) return;
        try {
          this.decideApproval(approval.id, "decline");
        } catch {
          /* ignore */
        }
      }, APPROVAL_TIMEOUT_MS);
      this.approvals.set(approval.id, approval);
      this.#emit({ type: "approval", approval: this.#publicApproval(approval) });
      this.#emit({ type: "state" });
      return;
    }
    this.#handleInternalServerRequest(id, method, params);
  }

  #makeApproval(rpcId, method, params) {
    const id = `apr-${++this.approvalSeq}`;
    const base = {
      id,
      rpcId,
      method,
      createdAt: Date.now(),
      timer: null,
      params,
    };

    if (method === "item/commandExecution/requestApproval") {
      return {
        ...base,
        kind: "command",
        title: "需要批准执行命令",
        body: params.command || "(未知命令)",
        detail: {
          cwd: params.cwd,
          reason: params.reason,
          commandActions: params.commandActions,
        },
      };
    }
    if (method === "item/fileChange/requestApproval") {
      return {
        ...base,
        kind: "file",
        title: "需要批准修改文件",
        body: params.reason || "Agent 想写入工作区之外的文件。",
        detail: { grantRoot: params.grantRoot },
      };
    }
    if (method === "mcpServer/elicitation/request") {
      const meta = params._meta || {};
      const isToolApproval = meta.codex_approval_kind === "mcp_tool_call";
      const match = /tool\s+"([^"]+)"/.exec(params.message || "");
      const toolName = meta.tool_name || match?.[1] || "";
      return {
        ...base,
        kind: "mcp",
        title: isToolApproval
          ? `需要批准调用 MCP 工具${toolName ? ` ${toolName}` : ""}`
          : "MCP 服务器请求输入",
        body: params.message || `允许 ${params.serverName} 执行操作？`,
        detail: {
          server: params.serverName,
          toolName,
          tool: meta.tool_params_display || meta.tool_params,
          description: meta.tool_description,
          schema: params.requestedSchema,
        },
      };
    }
    if (method === "applyPatchApproval" || method === "execCommandApproval") {
      return {
        ...base,
        kind: method === "applyPatchApproval" ? "file" : "command",
        title: method === "applyPatchApproval" ? "需要批准修改文件（legacy）" : "需要批准执行命令（legacy）",
        body: params.command || params.reason || "",
        detail: params,
      };
    }
    return null;
  }

  #handleInternalServerRequest(id, method, params) {
    switch (method) {
      case "item/tool/requestUserInput": {
        // demo 没做提问 UI，直接返回空答案，避免回合卡死
        this.client.respond(id, { answers: {} });
        this.#emit({ type: "notice", message: "Agent 请求用户输入；demo 返回了空答案。" });
        return;
      }
      case "item/permissions/requestApproval": {
        this.client.respondError(id, -32601, "permissions request is not supported by this demo");
        this.#emit({ type: "notice", message: "收到权限扩展请求；demo 拒绝了该请求。" });
        return;
      }
      case "item/tool/call": {
        this.client.respond(id, {
          success: false,
          contentItems: [{ type: "inputText", text: "demo 未注册动态工具" }],
        });
        return;
      }
      default:
        this.client.respondError(id, -32601, `unsupported server request: ${method}`);
        this.#emit({ type: "notice", message: `未处理的 server 请求：${method}` });
    }
  }

  decideApproval(approvalId, decision) {
    const approval = this.approvals.get(approvalId);
    if (!approval) throw new Error("审批请求不存在或已处理");
    clearTimeout(approval.timer);
    this.approvals.delete(approvalId);

    const result = this.#approvalResult(approval.method, decision);
    this.client.respond(approval.rpcId, result);
    this.#emit({
      type: "approval_resolved",
      id: approvalId,
      decision,
      title: approval.title,
    });
    this.#emit({ type: "state" });
  }

  #approvalResult(method, decision) {
    if (method === "mcpServer/elicitation/request") {
      const action = decision === "accept" ? "accept" : decision === "cancel" ? "cancel" : "decline";
      return action === "accept" ? { action, content: {} } : { action };
    }
    if (method === "applyPatchApproval" || method === "execCommandApproval") {
      const legacy =
        decision === "accept"
          ? "approved"
          : decision === "acceptForSession"
            ? "approved_for_session"
            : decision === "cancel"
              ? "abort"
              : "denied";
      return { decision: legacy };
    }
    // 新的 item/*/requestApproval 使用 CommandExecutionApprovalDecision / FileChangeApprovalDecision
    return { decision };
  }

  // ------------------------------------------------------------------- mcp ops

  async callMcpTool(server, tool, args) {
    if (!this.threadId) throw new Error("会话尚未就绪");
    const res = await this.client.request(
      "mcpServer/tool/call",
      { threadId: this.threadId, server, tool, arguments: args || {} },
      { timeoutMs: 120000 },
    );
    return res;
  }

  // ------------------------------------------------------------- notifications

  #onNotification({ method, params }) {
    switch (method) {
      case "item/started": {
        this.items.set(params.item.id, params.item);
        this.#emit({ type: "item", item: params.item });
        break;
      }
      case "item/completed": {
        this.items.set(params.item.id, params.item);
        this.#emit({ type: "item_completed", item: params.item });
        break;
      }
      case "item/agentMessage/delta": {
        this.#emit({ type: "delta", itemId: params.itemId, channel: "agent", delta: params.delta || "" });
        break;
      }
      case "item/reasoning/summaryTextDelta":
      case "item/reasoning/summaryPartAdded": {
        if (params.delta) {
          this.#emit({ type: "delta", itemId: params.itemId, channel: "reasoning", delta: params.delta });
        }
        break;
      }
      case "item/commandExecution/outputDelta": {
        this.#emit({ type: "output", itemId: params.itemId, channel: "command", delta: params.delta || "" });
        break;
      }
      case "item/fileChange/outputDelta": {
        this.#emit({ type: "output", itemId: params.itemId, channel: "file", delta: params.delta || "" });
        break;
      }
      case "item/mcpToolCall/progress": {
        this.#emit({ type: "progress", itemId: params.itemId, message: params.message || "" });
        break;
      }
      case "item/plan/delta": {
        this.#emit({ type: "plan_delta", itemId: params.itemId, delta: params.delta || "" });
        break;
      }
      case "turn/started": {
        this.turnId = params.turn?.id || this.turnId;
        this.phase = "busy";
        this.#emit({ type: "turn_started", turn: params.turn });
        this.#emit({ type: "state" });
        break;
      }
      case "turn/completed": {
        this.turnId = null;
        this.phase = params.turn?.status === "failed" ? "error" : "ready";
        this.#emit({ type: "turn_completed", turn: params.turn });
        if (params.turn?.error) {
          this.#emit({ type: "error", message: params.turn.error.message || String(params.turn.error) });
        }
        this.#emit({ type: "state" });
        break;
      }
      case "thread/status/changed": {
        const st = params.status || {};
        if (st.type === "active") this.phase = "busy";
        else if (st.type === "idle" && this.phase !== "booting") this.phase = "ready";
        this.#emit({ type: "state" });
        break;
      }
      case "thread/tokenUsage/updated": {
        this.usage = params.tokenUsage || null;
        this.#emit({ type: "usage", usage: this.usage });
        break;
      }
      case "mcpServer/startupStatus/updated": {
        if (params.status === "failed") {
          this.#emit({ type: "error", message: `MCP ${params.name} 启动失败：${params.error || "未知原因"}` });
        }
        this.#debouncedMcpRefresh();
        break;
      }
      case "skills/changed": {
        this.#debouncedSkillsRefresh();
        break;
      }
      case "error": {
        this.#emit({
          type: "error",
          message: params.error?.message || params.message || "未知错误",
        });
        break;
      }
      case "warning":
      case "configWarning":
      case "deprecationNotice": {
        this.#emit({ type: "notice", message: params.message || method });
        break;
      }
      case "serverRequest/resolved": {
        // server 侧确认某个请求已解决；通常我们已经处理过
        break;
      }
      default:
        break;
    }
  }

  #debouncedMcpRefresh = debounce(() => this.refreshMcpServers(), 600);
  #debouncedSkillsRefresh = debounce(() => this.refreshSkills(), 600);

  // ---------------------------------------------------------------- internals

  #onRpc(rpc) {
    // 协议面板只保留有信息量的方法，过滤掉高频流式事件
    if (
      rpc.dir === "in" &&
      /delta|moderationMetadata|rateLimits|readState|status\/changed|tokenUsage|startupStatus/.test(rpc.method)
    ) {
      return;
    }
    const entry = { ...rpc, ts: Date.now() };
    this.protocol.push(entry);
    if (this.protocol.length > 200) this.protocol.shift();
    this.#emit({ type: "rpc", rpc: entry });
  }

  #emit(event) {
    event.seq = ++this.seq;
    this.events.push(event);
    if (this.events.length > 2000) this.events.splice(0, this.events.length - 2000);
    this.emit("event", event);
  }

  #publicApproval(a) {
    return {
      id: a.id,
      kind: a.kind,
      title: a.title,
      body: a.body,
      detail: a.detail,
      createdAt: a.createdAt,
    };
  }

  #fatal(message) {
    if (this.phase === "closed") return;
    this.phase = "error";
    this.error = message;
    this.#emit({ type: "error", message });
    this.#emit({ type: "state" });
  }

  snapshot() {
    return {
      phase: this.phase,
      error: this.error,
      threadId: this.threadId,
      turnId: this.turnId,
      settings: { ...this.settings },
      workspace: WORKSPACE,
      codexHome: CODEX_HOME,
      models: this.models,
      skills: this.skills,
      mcpServers: this.mcpServers,
      usage: this.usage,
      approvals: [...this.approvals.values()].map((a) => this.#publicApproval(a)),
      protocol: this.protocol.slice(-60),
    };
  }
}

function debounce(fn, ms) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
