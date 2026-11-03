import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { Agent } from "./agent.mjs";
import { HOST, PORT, SKILLS_DIR, WEB_DIR } from "./config.mjs";

const agent = new Agent();
const clients = new Set();

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  res.end(body);
}

function readBody(req, limit = 1_000_000) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > limit) {
        reject(new Error("request body too large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error("invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}

function serveStatic(req, res, pathname) {
  const rel = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const filePath = path.resolve(WEB_DIR, rel);
  if (filePath !== WEB_DIR && !filePath.startsWith(WEB_DIR + path.sep)) {
    res.writeHead(403).end("forbidden");
    return;
  }
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "content-type": "text/plain; charset=utf-8" }).end("not found");
      return;
    }
    res.writeHead(200, {
      "content-type": MIME[path.extname(filePath)] || "application/octet-stream",
      "cache-control": "no-store",
    });
    res.end(data);
  });
}

function sseWrite(res, payload) {
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
}

function broadcast(event) {
  for (const res of clients) sseWrite(res, event);
}

agent.on("event", (event) => broadcast(event));
agent.on("log", (message) => {
  console.log(`[agent] ${message}`);
  broadcast({ type: "log", message });
});

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  const pathname = decodeURIComponent(url.pathname);

  try {
    if (req.method === "GET" && pathname === "/api/events") {
      res.writeHead(200, {
        "content-type": "text/event-stream; charset=utf-8",
        "cache-control": "no-cache, no-transform",
        connection: "keep-alive",
        "x-accel-buffering": "no",
      });
      res.write(": connected\n\n");
      // 先同步发快照（含历史事件），再加入广播集合，避免丢事件。
      sseWrite(res, { type: "snapshot", snapshot: agent.snapshot(), events: agent.events });
      clients.add(res);
      const heartbeat = setInterval(() => res.write(": ping\n\n"), 15000);
      req.on("close", () => {
        clearInterval(heartbeat);
        clients.delete(res);
      });
      return;
    }

    if (req.method === "GET" && pathname === "/api/state") {
      return sendJson(res, 200, agent.snapshot());
    }

    if (req.method === "GET" && pathname === "/api/health") {
      return sendJson(res, 200, { ok: true, phase: agent.phase, threadId: agent.threadId });
    }

    if (req.method === "POST" && pathname === "/api/message") {
      const body = await readBody(req);
      try {
        await agent.sendMessage(body.text);
        return sendJson(res, 200, { ok: true });
      } catch (err) {
        return sendJson(res, 409, { ok: false, error: err.message });
      }
    }

    if (req.method === "POST" && pathname === "/api/interrupt") {
      await agent.interrupt();
      return sendJson(res, 200, { ok: true });
    }

    if (req.method === "POST" && pathname === "/api/approval") {
      const body = await readBody(req);
      try {
        agent.decideApproval(body.id, body.decision);
        return sendJson(res, 200, { ok: true });
      } catch (err) {
        return sendJson(res, 400, { ok: false, error: err.message });
      }
    }

    if (req.method === "POST" && pathname === "/api/new-thread") {
      const body = await readBody(req);
      const allowed = ["model", "effort", "approvalPolicy", "sandbox"];
      const overrides = {};
      for (const key of allowed) if (body[key] !== undefined) overrides[key] = body[key];
      await agent.newThread(overrides);
      return sendJson(res, 200, { ok: true });
    }

    if (req.method === "POST" && pathname === "/api/settings") {
      const body = await readBody(req);
      const settings = agent.updateSettings(body);
      return sendJson(res, 200, { ok: true, settings });
    }

    if (req.method === "GET" && pathname === "/api/skill") {
      const name = String(url.searchParams.get("name") || "");
      if (!/^[a-zA-Z0-9._-]+$/.test(name)) return sendJson(res, 400, { ok: false, error: "invalid name" });
      const file = path.join(SKILLS_DIR, name, "SKILL.md");
      const full = path.resolve(file);
      if (!full.startsWith(SKILLS_DIR + path.sep)) {
        return sendJson(res, 400, { ok: false, error: "invalid path" });
      }
      try {
        const content = fs.readFileSync(full, "utf8");
        return sendJson(res, 200, { ok: true, name, content });
      } catch {
        return sendJson(res, 404, { ok: false, error: "skill not found" });
      }
    }

    if (req.method === "POST" && pathname === "/api/mcp-call") {
      const body = await readBody(req);
      try {
        const result = await agent.callMcpTool(body.server, body.tool, body.arguments || {});
        return sendJson(res, 200, { ok: true, result });
      } catch (err) {
        return sendJson(res, 400, { ok: false, error: err.message });
      }
    }

    if (req.method === "GET") return serveStatic(req, res, pathname);

    res.writeHead(405, { "content-type": "text/plain; charset=utf-8" }).end("method not allowed");
  } catch (err) {
    console.error("[http]", err);
    if (!res.headersSent) sendJson(res, 500, { ok: false, error: err.message });
    else res.end();
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Nebula demo: http://${HOST}:${PORT}`);
  console.log("正在启动 codex app-server ...");
  agent.start().catch((err) => {
    console.error("[agent] 启动失败:", err.message);
  });
});

async function shutdown(signal) {
  console.log(`\n收到 ${signal}，清理中 ...`);
  for (const res of clients) res.end();
  clients.clear();
  server.close();
  await agent.close();
  process.exit(0);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
