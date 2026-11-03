#!/usr/bin/env node
/**
 * 无头端到端冒烟测试：直接驱动 Agent（不经过 Web UI）。
 * 会真实调用模型，消耗少量额度。运行：npm run smoke
 *
 * 覆盖：握手 / thread / skills / MCP 检索 / 最终回答引用 / 直接调用 MCP 工具 / 审批。
 */
import fs from "node:fs";
import path from "node:path";
import { Agent } from "../src/agent.mjs";
import { DATA_DIR } from "../src/config.mjs";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let failures = 0;

function check(name, ok, extra = "") {
  console.log(`  ${ok ? "\u2713" : "\u2717"} ${name}${extra ? ` — ${extra}` : ""}`);
  if (!ok) failures++;
}

function waitForTurn(agent, timeoutMs = 240000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      agent.off("event", handler);
      reject(new Error("等待 turn 完成超时"));
    }, timeoutMs);
    const handler = (event) => {
      if (event.type !== "turn_completed") return;
      clearTimeout(timer);
      agent.off("event", handler);
      resolve(event.turn);
    };
    agent.on("event", handler);
  });
}

function collect(events) {
  const items = new Map();
  for (const event of events) {
    if (event.type === "item" || event.type === "item_completed") items.set(event.item.id, event.item);
  }
  return [...items.values()];
}

const agent = new Agent();
const events = [];
let autoApproved = 0;

agent.on("event", (event) => {
  events.push(event);
  if (event.type === "approval") {
    autoApproved++;
    console.log(`  [approval] ${event.approval.title} -> accept`);
    queueMicrotask(() => {
      try {
        agent.decideApproval(event.approval.id, "accept");
      } catch (err) {
        console.error("  [approval] 处理失败:", err.message);
      }
    });
  }
  if (event.type === "log") console.log(`  [agent] ${event.message}`);
  if (event.type === "error") console.error(`  [error] ${event.message}`);
});

try {
  console.log("\n1) 握手与会话");
  await agent.start();
  check("thread 已创建", Boolean(agent.threadId), agent.threadId || "");
  check("MCP kb 已连接", agent.mcpServers.some((s) => s.name === "kb" && s.status === "connected"));
  check(
    "项目技能被发现",
    agent.skills.some((s) => s.name === "release-checklist" && s.source === "project"),
  );

  console.log("\n2) 知识库检索回合");
  const turn1 = waitForTurn(agent);
  await agent.sendMessage("用知识库查一下 Nebula 的发布窗口和灰度节奏，给出来源 doc_id。");
  const result1 = await turn1;
  const items1 = collect(events);
  const kbCalls = items1.filter((i) => i.type === "mcpToolCall" && i.server === "kb" && i.status === "completed");
  const final1 = items1.filter((i) => i.type === "agentMessage" && i.phase === "final_answer").at(-1);
  check("回合完成", result1.status === "completed");
  check("调用了 kb MCP 工具", kbCalls.length > 0, `${kbCalls.length} 次`);
  check("回答引用了 doc_id", Boolean(final1?.text?.includes("nebula-release-process")));

  console.log("\n3) 宿主直接调用 MCP 工具");
  const direct = await agent.callMcpTool("kb", "search_knowledge", { query: "回滚标准 5xx", top_k: 3 });
  const hits = direct.structuredContent?.results || [];
  check("直调返回结果", hits.length > 0, hits[0] ? `${hits[0].doc_id} / ${hits[0].heading}` : "");

  console.log("\n4) MCP 写操作审批");
  const turn2 = waitForTurn(agent);
  await agent.sendMessage("把 Nebula 的发布窗口保存成笔记，标题「Smoke 测试笔记」。");
  const result2 = await turn2;
  check("回合完成", result2.status === "completed");
  check("触发了审批", autoApproved > 0, `${autoApproved} 次`);
  const notesFile = path.join(DATA_DIR, "notes.json");
  const notes = fs.existsSync(notesFile) ? JSON.parse(fs.readFileSync(notesFile, "utf8")).notes : [];
  check("笔记已落盘", notes.some((n) => n.title === "Smoke 测试笔记"));
} catch (err) {
  failures++;
  console.error("\n冒烟测试异常:", err.stack || err.message);
} finally {
  await agent.close();
}

await sleep(200);
console.log(failures === 0 ? "\n全部通过 \u2713\n" : `\n${failures} 项失败 \u2717\n`);
process.exit(failures === 0 ? 0 : 1);
