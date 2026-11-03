import { spawn } from "node:child_process";
import { EventEmitter } from "node:events";
import readline from "node:readline";

/**
 * CodexClient —— 对 `codex app-server` 的最小 JSON-RPC 2.0 客户端。
 *
 * 传输：stdin/stdout，每行一个 JSON 对象（JSONL / NDJSON）。
 * 方向：
 *   client -> server : request（有 id，期待 response）、notification（无 id）
 *   server -> client : notification（无 id）、request（有 id，例如审批/提问）
 *
 * 关键点：这是双向协议。客户端不只是"调接口"，还要充当 server 的
 * 回调端，处理 commandExecution/fileChange 审批、MCP elicitation、
 * request_user_input 等 server 发起的请求。
 */
export class CodexClient extends EventEmitter {
  constructor({ codexBin = "codex", args = [], cwd, env } = {}) {
    super();
    this.codexBin = codexBin;
    this.args = args;
    this.cwd = cwd;
    this.env = env;
    this.child = null;
    this.nextId = 1;
    this.pending = new Map(); // id -> {resolve, reject, timer, method}
    this.closed = false;
    this.stderrTail = [];
  }

  start() {
    if (this.child) return;
    const fullArgs = ["app-server", ...this.args];
    this.child = spawn(this.codexBin, fullArgs, {
      cwd: this.cwd,
      env: this.env,
      stdio: ["pipe", "pipe", "pipe"],
    });

    this.child.on("error", (err) => {
      this.emit("error", new Error(`无法启动 codex: ${err.message}`));
      this.#failAll(err);
    });

    this.child.on("exit", (code, signal) => {
      this.closed = true;
      const err = new Error(`codex app-server exited (code=${code}, signal=${signal})`);
      this.emit("exit", { code, signal, stderr: this.stderrTail.join("") });
      this.#failAll(err);
    });

    this.child.stderr.on("data", (chunk) => {
      const text = chunk.toString("utf8");
      this.stderrTail.push(text);
      if (this.stderrTail.length > 200) this.stderrTail.shift();
      this.emit("stderr", text);
    });

    const rl = readline.createInterface({ input: this.child.stdout });
    rl.on("line", (line) => this.#onLine(line));
  }

  #onLine(line) {
    if (!line.trim()) return;
    let msg;
    try {
      msg = JSON.parse(line);
    } catch {
      this.emit("stderr", `[non-json stdout] ${line.slice(0, 500)}\n`);
      return;
    }

    // 1) 对我们请求的应答
    if (msg.id !== undefined && msg.id !== null && msg.method === undefined) {
      const entry = this.pending.get(msg.id);
      if (!entry) return;
      this.pending.delete(msg.id);
      clearTimeout(entry.timer);
      if (msg.error) {
        const err = new Error(msg.error.message || "JSON-RPC error");
        err.code = msg.error.code;
        err.data = msg.error.data;
        entry.reject(err);
      } else {
        entry.resolve(msg.result);
      }
      return;
    }

    // 2) server 发来的请求（审批、用户输入、动态工具调用……）
    if (msg.method && msg.id !== undefined && msg.id !== null) {
      this.emit("rpc", { dir: "in-request", method: msg.method, id: msg.id });
      this.emit("serverRequest", { id: msg.id, method: msg.method, params: msg.params || {} });
      return;
    }

    // 3) server 通知（流式事件）
    if (msg.method) {
      this.emit("rpc", { dir: "in", method: msg.method, id: null });
      this.emit("notification", { method: msg.method, params: msg.params || {} });
    }
  }

  request(method, params = {}, { timeoutMs = 120000 } = {}) {
    if (!this.child || this.closed) return Promise.reject(new Error("codex app-server 未运行"));
    const id = this.nextId++;
    this.emit("rpc", { dir: "out", method, id });
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`请求超时: ${method} (${timeoutMs}ms)`));
      }, timeoutMs);
      this.pending.set(id, { resolve, reject, timer, method });
      this.#write({ jsonrpc: "2.0", id, method, params });
    });
  }

  notify(method, params) {
    if (!this.child || this.closed) return;
    this.emit("rpc", { dir: "out", method, id: null });
    const msg = { jsonrpc: "2.0", method };
    if (params !== undefined) msg.params = params;
    this.#write(msg);
  }

  respond(id, result) {
    this.emit("rpc", { dir: "out-response", method: "result", id });
    this.#write({ jsonrpc: "2.0", id, result });
  }

  respondError(id, code, message) {
    this.emit("rpc", { dir: "out-response", method: "error", id });
    this.#write({ jsonrpc: "2.0", id, error: { code, message } });
  }

  #write(obj) {
    if (!this.child || this.closed || !this.child.stdin.writable) return;
    this.child.stdin.write(JSON.stringify(obj) + "\n");
  }

  #failAll(err) {
    for (const [, entry] of this.pending) {
      clearTimeout(entry.timer);
      entry.reject(err);
    }
    this.pending.clear();
  }

  stop() {
    if (!this.child) return;
    this.closed = true;
    this.#failAll(new Error("client stopped"));
    this.child.stdin.end();
    const child = this.child;
    setTimeout(() => {
      if (!child.killed) child.kill("SIGTERM");
    }, 1500).unref();
    this.child = null;
  }
}
