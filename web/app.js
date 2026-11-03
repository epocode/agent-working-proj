/* Nebula Agent — Codex app-server demo 前端。
 * 无框架：接 SSE，把 app-server 的 item 事件渲染成聊天流。 */

const $ = (id) => document.getElementById(id);

const state = {
  snapshot: null,
  items: new Map(), // itemId -> { item, el, body, output, foot }
  approvals: new Map(),
  approvalQueue: [],
  currentApproval: null,
  busy: false,
  protocol: [],
  seenNotices: new Set(),
};

const hero = $("hero");
const messages = $("messages");
const input = $("input");
const sendBtn = $("btn-send");

/* ------------------------------------------------------------------ markdown */

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function inlineMd(text) {
  const codes = [];
  let out = text.replace(/`([^`]+)`/g, (_, code) => {
    codes.push(code);
    return `\u0000${codes.length - 1}\u0000`;
  });
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
  out = out.replace(
    /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,
    '<a href="$2" target="_blank" rel="noreferrer">$1</a>',
  );
  out = out.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${codes[Number(i)]}</code>`);
  return out;
}

function renderMarkdown(md) {
  const src = String(md ?? "").replace(/\r\n/g, "\n");
  const lines = src.split("\n");
  const html = [];
  let i = 0;

  const isBlockStart = (line) =>
    /^\s*(```|#{1,6}\s|>\s?|[-*+]\s+|\d+\.\s+|---+\s*$)/.test(line) ||
    (line.includes("|") && (lines[i + 1] || "").match(/^\s*\|?[\s:|-]+\|?\s*$/));

  while (i < lines.length) {
    const line = lines[i];

    if (/^```/.test(line)) {
      const lang = line.slice(3).trim();
      const buf = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]);
      i++;
      html.push(
        `<pre><code class="lang-${escapeHtml(lang)}">${escapeHtml(buf.join("\n"))}</code></pre>`,
      );
      continue;
    }

    if (/^\s*$/.test(line)) {
      i++;
      continue;
    }

    if (/^#{1,6}\s+/.test(line)) {
      const level = line.match(/^#+/)[0].length;
      html.push(`<h${level}>${inlineMd(escapeHtml(line.replace(/^#+\s+/, "")))}</h${level}>`);
      i++;
      continue;
    }

    if (/^---+\s*$/.test(line)) {
      html.push("<hr />");
      i++;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) buf.push(lines[i++].replace(/^>\s?/, ""));
      html.push(`<blockquote>${inlineMd(escapeHtml(buf.join(" ")))}</blockquote>`);
      continue;
    }

    if (/^[-*+]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*+]\s+/.test(lines[i])) {
        items.push(inlineMd(escapeHtml(lines[i].replace(/^[-*+]\s+/, ""))));
        i++;
      }
      html.push(`<ul>${items.map((x) => `<li>${x}</li>`).join("")}</ul>`);
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(inlineMd(escapeHtml(lines[i].replace(/^\d+\.\s+/, ""))));
        i++;
      }
      html.push(`<ol>${items.map((x) => `<li>${x}</li>`).join("")}</ol>`);
      continue;
    }

    if (line.includes("|") && (lines[i + 1] || "").match(/^\s*\|?[\s:|-]+\|?\s*$/)) {
      const splitRow = (row) =>
        row
          .trim()
          .replace(/^\|/, "")
          .replace(/\|$/, "")
          .split("|")
          .map((c) => c.trim());
      const head = splitRow(line);
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].includes("|")) rows.push(splitRow(lines[i++]));
      html.push(
        `<table><thead><tr>${head
          .map((c) => `<th>${inlineMd(escapeHtml(c))}</th>`)
          .join("")}</tr></thead><tbody>${rows
          .map((r) => `<tr>${r.map((c) => `<td>${inlineMd(escapeHtml(c))}</td>`).join("")}</tr>`)
          .join("")}</tbody></table>`,
      );
      continue;
    }

    const buf = [];
    while (i < lines.length && !/^\s*$/.test(lines[i]) && !isBlockStart(lines[i])) {
      if (buf.length && /^#{1,6}\s/.test(lines[i])) break;
      buf.push(lines[i++]);
    }
    if (!buf.length) {
      buf.push(lines[i++]);
    }
    html.push(`<p>${inlineMd(escapeHtml(buf.join("\n"))).replace(/\n/g, "<br />")}</p>`);
  }

  return html.join("\n");
}

/* --------------------------------------------------------------------- utils */

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined && text !== null) node.textContent = String(text);
  return node;
}

function toast(message, kind = "", ms = 4200) {
  const node = el("div", `toast ${kind}`, message);
  $("toasts").appendChild(node);
  setTimeout(() => node.remove(), ms);
}

function shortId(id, n = 8) {
  return id ? `${String(id).slice(0, n)}…` : "—";
}

let autoStick = true;

function nearBottom() {
  return messages.scrollHeight - messages.scrollTop - messages.clientHeight < 140;
}

function scrollToBottom(force = false) {
  if (force || autoStick) {
    requestAnimationFrame(() => {
      messages.scrollTop = messages.scrollHeight;
    });
  }
}

function ensureHeroGone() {
  if (hero.parentNode) hero.remove();
}

function clearChat(showHero = false) {
  messages.innerHTML = "";
  state.items.clear();
  if (showHero) messages.appendChild(hero);
}

function fmtTokens(n) {
  if (!n) return "0";
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

const STATUS_TEXT = {
  inProgress: "运行中",
  completed: "完成",
  failed: "失败",
  declined: "已拒绝",
  pending: "等待中",
};

/* ------------------------------------------------------------------- event flow */

function connect() {
  const es = new EventSource("/api/events");
  es.onmessage = (event) => {
    let data;
    try {
      data = JSON.parse(event.data);
    } catch {
      return;
    }
    if (data.type === "snapshot") {
      onSnapshot(data);
      return;
    }
    applyEvent(data, false);
  };
  es.onerror = () => {
    // EventSource 会自动重连；这里只提示
    setPhase("error", "连接断开，重连中");
  };
}

function onSnapshot({ snapshot, events }) {
  state.snapshot = snapshot;
  state.busy = snapshot.phase === "busy";
  state.approvals.clear();
  state.approvalQueue = [];
  state.currentApproval = null;
  hideApproval();
  state.protocol = (snapshot.protocol || []).slice();

  clearChat(false);
  for (const event of events || []) applyEvent(event, true);

  if (!messages.children.length) messages.appendChild(hero);
  for (const approval of snapshot.approvals || []) enqueueApproval(approval);

  renderHeader();
  renderSidebar();
  renderProtocol();
  scrollToBottom(true);
}

function applyEvent(ev, replay) {
  switch (ev.type) {
    case "reset": {
      clearChat(false);
      messages.appendChild(hero);
      state.items.clear();
      state.approvals.clear();
      state.approvalQueue = [];
      state.currentApproval = null;
      hideApproval();
      if (!replay) setBusy(true);
      return;
    }
    case "state": {
      if (replay) return;
      refreshState();
      return;
    }
    case "user": {
      ensureHeroGone();
      const wrap = el("div", "msg-user");
      wrap.appendChild(el("div", "bubble", ev.text));
      messages.appendChild(wrap);
      scrollToBottom(true);
      return;
    }
    case "item": {
      upsertItem(ev.item, replay);
      return;
    }
    case "item_completed": {
      upsertItem(ev.item, replay);
      return;
    }
    case "delta": {
      appendDelta(ev);
      return;
    }
    case "output": {
      appendOutput(ev);
      return;
    }
    case "approval": {
      if (replay) return;
      enqueueApproval(ev.approval);
      return;
    }
    case "approval_resolved": {
      if (replay) return;
      state.approvals.delete(ev.id);
      if (state.currentApproval?.id === ev.id) {
        hideApproval();
        nextApproval();
      }
      toast(`审批已${ev.decision === "accept" ? "允许" : ev.decision === "cancel" ? "取消" : "拒绝"}：${ev.title || ""}`);
      return;
    }
    case "turn_started": {
      setBusy(true);
      return;
    }
    case "turn_completed": {
      setBusy(false);
      if (ev.turn?.status === "failed") {
        toast(ev.turn?.error?.message || "回合失败", "error");
      }
      refreshState();
      return;
    }
    case "usage": {
      if (state.snapshot) {
        state.snapshot.usage = ev.usage;
        renderUsage();
      }
      return;
    }
    case "error": {
      appendSystem(ev.message, "errorline");
      toast(ev.message, "error");
      return;
    }
    case "notice": {
      if (replay) return;
      if (state.seenNotices.has(ev.message)) return;
      state.seenNotices.add(ev.message);
      setTimeout(() => state.seenNotices.delete(ev.message), 8000);
      appendSystem(ev.message, "notice");
      return;
    }
    case "log": {
      console.info("[agent]", ev.message);
      return;
    }
    case "rpc": {
      if (replay) return;
      state.protocol.push(ev.rpc);
      if (state.protocol.length > 60) state.protocol.shift();
      appendRpc(ev.rpc);
      return;
    }
    default:
      return;
  }
}

function appendSystem(text, cls) {
  // 空状态时只弹 toast，避免把 hero 挤走
  if (hero.parentNode) return;
  messages.appendChild(el("div", cls, text));
  scrollToBottom();
}

let refreshTimer = null;
function refreshState() {
  clearTimeout(refreshTimer);
  refreshTimer = setTimeout(async () => {
    try {
      const res = await fetch("/api/state");
      if (!res.ok) return;
      state.snapshot = await res.json();
      state.busy = state.snapshot.phase === "busy";
      renderHeader();
      renderSidebar();
    } catch {
      /* ignore */
    }
  }, 120);
}

function setBusy(busy) {
  state.busy = busy;
  renderHeader();
  syncComposer();
}

/* ------------------------------------------------------------------ chat items */

function upsertItem(item, replay) {
  const existing = state.items.get(item.id);
  if (!existing) {
    ensureHeroGone();
    const entry = createCard(item);
    if (!entry) return;
    state.items.set(item.id, entry);
    messages.appendChild(entry.el);
    scrollToBottom(replay);
  }
  updateCard(item);
}

function createCard(item) {
  switch (item.type) {
    case "agentMessage":
      return createAgentCard(item);
    case "reasoning":
      return createReasoningCard(item);
    case "commandExecution":
    case "mcpToolCall":
    case "fileChange":
    case "webSearch":
    case "plan":
      return createToolCard(item);
    default:
      return null;
  }
}

function createAgentCard(item) {
  const isCommentary = item.phase === "commentary";
  const wrap = el("article", `msg agent ${isCommentary ? "commentary" : "final"}`);
  const head = el("div", "msg-head");
  head.appendChild(el("span", "avatar", "N"));
  head.appendChild(el("span", "msg-label", "Nebula"));
  head.appendChild(el("span", "phase-badge", isCommentary ? "进度" : "最终回答"));
  wrap.appendChild(head);
  const body = el("div", "md-body streaming");
  wrap.appendChild(body);
  return { item, el: wrap, body, raw: item.text || "" };
}

function createReasoningCard(item) {
  const details = el("details", "reasoning");
  const summary = el("summary", "", "思考过程");
  const body = el("div", "reasoning-body");
  details.appendChild(summary);
  details.appendChild(body);
  return { item, el: details, body, raw: (item.summary || []).join("\n\n") };
}

function createToolCard(item) {
  const kind =
    item.type === "commandExecution"
      ? "command"
      : item.type === "mcpToolCall"
        ? "mcp"
        : item.type === "fileChange"
          ? "file"
          : item.type === "plan"
            ? "plan"
            : "other";
  const card = el("article", `tool kind-${kind}`);
  const head = el("div", "tool-head");
  head.appendChild(el("span", "tool-icon", kind === "mcp" ? "M" : kind === "command" ? "$" : kind === "file" ? "±" : "•"));
  const grow = el("div", "grow");
  const title = el("div", "tool-title");
  const sub = el("div", "tool-sub");
  grow.appendChild(title);
  grow.appendChild(sub);
  head.appendChild(grow);
  const status = el("span", "tool-status", "");
  head.appendChild(status);
  card.appendChild(head);

  const output = el("pre", "tool-body");
  card.appendChild(output);

  const foot = el("div", "tool-foot");
  foot.hidden = true;
  card.appendChild(foot);

  const entry = { item, el: card, title, sub, status, output, foot, raw: "" };
  if (item.type === "commandExecution") {
    title.textContent = "执行命令";
    sub.textContent = (item.command || "").slice(0, 160);
  } else if (item.type === "mcpToolCall") {
    title.textContent = `${item.server} · ${item.tool}`;
    sub.textContent = compactArgs(item.arguments);
  } else if (item.type === "fileChange") {
    title.textContent = "修改文件";
    sub.textContent = (item.changes || []).map((c) => c.path).join(", ") || "apply_patch";
  } else if (item.type === "plan") {
    title.textContent = "执行计划";
    sub.textContent = "";
    output.textContent = item.text || "";
  } else if (item.type === "webSearch") {
    title.textContent = "网络搜索";
    sub.textContent = JSON.stringify(item.action || "").slice(0, 120);
  }
  updateCard(item);
  return entry;
}

function compactArgs(args) {
  if (!args || typeof args !== "object") return "";
  return Object.entries(args)
    .map(([k, v]) => `${k}=${typeof v === "string" ? v : JSON.stringify(v)}`)
    .join("  ")
    .slice(0, 160);
}

function updateCard(item) {
  const entry = state.items.get(item.id);
  if (!entry) return;
  entry.item = item;
  const status = item.status || (item.type === "agentMessage" ? "completed" : "");

  if (item.type === "agentMessage") {
    entry.raw = item.text || entry.raw;
    entry.body.textContent = entry.raw;
    entry.body.classList.add("streaming");
    if (status === "completed" || item.type === "agentMessage") {
      // item 完成后会再进来一次，用完整文本渲染 markdown
      if (item.text !== undefined && item.text !== "") {
        entry.body.innerHTML = renderMarkdown(item.text);
        entry.body.classList.remove("streaming");
      }
    }
    if (item.phase === "commentary") {
      entry.el.classList.add("commentary");
      entry.el.querySelector(".phase-badge").textContent = "进度";
    }
    return;
  }

  if (item.type === "reasoning") {
    const text = (item.summary && item.summary.length ? item.summary.join("\n\n") : entry.raw) || "";
    entry.body.textContent = text;
    return;
  }

  const statusKey = item.status || "inProgress";
  entry.status.textContent = STATUS_TEXT[statusKey] || statusKey;
  entry.status.className = `tool-status ${statusKey}`;

  if (item.type === "commandExecution") {
    entry.sub.textContent = (item.command || "").slice(0, 160);
    const out = item.aggregatedOutput || entry.raw || "";
    entry.output.textContent = out.length > 8000 ? out.slice(0, 8000) + "\n…（截断）" : out;
    entry.foot.hidden = false;
    entry.foot.textContent = [
      item.exitCode !== undefined && item.exitCode !== null ? `exit ${item.exitCode}` : "",
      item.durationMs ? `${item.durationMs} ms` : "",
      item.cwd ? item.cwd : "",
    ]
      .filter(Boolean)
      .join(" · ");
    if (!out) entry.output.textContent = "（等待输出…）";
    return;
  }

  if (item.type === "mcpToolCall") {
    entry.sub.textContent = compactArgs(item.arguments);
    const chunks = [];
    if (item.result?.content) {
      for (const c of item.result.content) {
        if (c.type === "text") chunks.push(c.text);
        else chunks.push(`[${c.type}]`);
      }
    }
    if (item.error) chunks.push(`错误：${item.error.message || JSON.stringify(item.error)}`);
    let text = chunks.join("\n") || (statusKey === "inProgress" ? "调用中…" : "（无输出）");
    if (text.length > 6000) text = text.slice(0, 6000) + "\n…（截断，完整内容见协议日志）";
    entry.output.textContent = text;
    entry.foot.hidden = false;
    entry.foot.textContent = [
      item.durationMs ? `${item.durationMs} ms` : "",
      item.result?.isError ? "isError" : "",
    ]
      .filter(Boolean)
      .join(" · ");
    return;
  }

  if (item.type === "fileChange") {
    entry.sub.textContent = (item.changes || [])
      .map((c) => spanKind(c.kind))
      .join(" ");
    entry.output.textContent = "";
    const changes = item.changes || [];
    if (!changes.length) {
      entry.output.textContent = "（补丁已应用）";
    }
    for (const change of changes) {
      entry.output.appendChild(el("div", "diff-file", `--- ${change.path}`));
      for (const line of (change.diff || "").split("\n")) {
        const cls = line.startsWith("+++") || line.startsWith("---")
          ? ""
          : line.startsWith("+")
            ? "diff-add"
            : line.startsWith("-")
              ? "diff-del"
              : line.startsWith("@@")
                ? "diff-hunk"
                : "";
        entry.output.appendChild(el("span", `diff-line ${cls}`, line));
      }
    }
    entry.foot.hidden = false;
    entry.foot.textContent = `${changes.length} 个文件`;
    return;
  }

  if (item.type === "plan") {
    entry.output.textContent = item.text || "";
  }
}

function spanKind(kind) {
  const type = typeof kind === "string" ? kind : kind?.type;
  const map = { add: "新增", delete: "删除", update: "更新" };
  return map[type] || type || "修改";
}

function appendDelta(ev) {
  const entry = state.items.get(ev.itemId);
  if (!entry) return;
  if (ev.channel === "agent") {
    entry.raw = (entry.raw || "") + ev.delta;
    entry.body.textContent = entry.raw;
    entry.body.classList.add("streaming");
  } else if (ev.channel === "reasoning") {
    entry.raw = (entry.raw || "") + ev.delta;
    entry.body.textContent = entry.raw;
  }
  scrollToBottom();
}

function appendOutput(ev) {
  const entry = state.items.get(ev.itemId);
  if (!entry) return;
  entry.raw = (entry.raw || "") + ev.delta;
  if (entry.raw.length < 9000) entry.output.textContent = entry.raw;
  scrollToBottom();
}

/* ------------------------------------------------------------------ approvals */

function enqueueApproval(approval) {
  if (!approval || state.approvals.has(approval.id)) return;
  state.approvals.set(approval.id, approval);
  state.approvalQueue.push(approval);
  if (!state.currentApproval) nextApproval();
  renderHeader();
}

function nextApproval() {
  const next = state.approvalQueue.shift();
  if (!next) {
    state.currentApproval = null;
    hideApproval();
    return;
  }
  state.currentApproval = next;
  const labels = { command: "命令执行", file: "文件修改", mcp: "MCP 工具", permissions: "权限" };
  $("apr-kind").textContent = labels[next.kind] || "审批";
  $("apr-title").textContent = next.title || "需要批准";
  const d = next.detail || {};
  const toolName = d.toolName || "";
  $("apr-body").textContent =
    next.kind === "mcp"
      ? `MCP 服务器 ${d.server || ""} 请求调用工具${toolName ? ` ${toolName}` : ""}。允许后才会真正执行。`
      : next.body || "";
  $("apr-detail").textContent = formatApprovalDetail(next);
  $("apr-session").hidden = !(next.kind === "command" || next.kind === "file");
  $("approval-overlay").hidden = false;
  renderHeader();
}

function formatApprovalDetail(approval) {
  const d = approval.detail || {};
  if (approval.kind === "mcp") {
    const lines = [`server: ${d.server || "?"}`, `tool: ${d.toolName || "?"}`];
    if (Array.isArray(d.tool)) {
      lines.push("参数:");
      for (const item of d.tool) lines.push(`  ${item.display_name || item.name}: ${item.value}`);
    }
    if (d.description) lines.push(`说明: ${d.description}`);
    return lines.join("\n");
  }
  if (approval.kind === "command") {
    return [d.cwd ? `cwd: ${d.cwd}` : "", d.reason ? `reason: ${d.reason}` : ""].filter(Boolean).join("\n");
  }
  if (approval.kind === "file") {
    return d.grantRoot ? `授予根目录写入：${d.grantRoot}` : "";
  }
  return JSON.stringify(d, null, 2);
}

function hideApproval() {
  $("approval-overlay").hidden = true;
}

async function decide(decision) {
  const approval = state.currentApproval;
  if (!approval) return;
  const buttons = [$("apr-accept"), $("apr-decline"), $("apr-session")];
  buttons.forEach((b) => (b.disabled = true));
  try {
    const res = await fetch("/api/approval", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: approval.id, decision }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) toast(data.error || "审批失败", "error");
  } catch (err) {
    toast(`审批请求失败：${err.message}`, "error");
  } finally {
    buttons.forEach((b) => (b.disabled = false));
    state.approvals.delete(approval.id);
    state.currentApproval = null;
    hideApproval();
    nextApproval();
    refreshState();
  }
}

/* ------------------------------------------------------------------- rendering */

function setPhase(kind, text) {
  const dot = $("phase-dot");
  dot.className = `dot ${kind}`;
  $("phase-text").textContent = text;
}

function renderHeader() {
  const snap = state.snapshot;
  if (!snap) return;
  const pending = state.approvals.size > 0;
  let kind = "ready";
  let text = "就绪";
  if (snap.phase === "booting") {
    kind = "busy";
    text = "启动中";
  } else if (snap.phase === "error") {
    kind = "error";
    text = "错误";
  } else if (snap.phase === "closed") {
    kind = "error";
    text = "已关闭";
  } else if (pending) {
    kind = "busy";
    text = "等待审批";
  } else if (state.busy) {
    kind = "busy";
    text = "运行中";
  }
  setPhase(kind, text);
  $("thread-short").textContent = `thread ${shortId(snap.threadId)}`;
  $("btn-stop").hidden = !state.busy;
  $("busy-hint").textContent = pending
    ? "有操作等待你的审批"
    : state.busy
      ? "Agent 正在运行…"
      : "";
  syncComposer();
}

function syncComposer() {
  const snap = state.snapshot;
  const ready = snap && snap.phase === "ready" && !state.busy;
  input.disabled = !snap || snap.phase === "booting";
  sendBtn.disabled = !ready;
}

function renderSidebar() {
  const snap = state.snapshot;
  if (!snap) return;

  $("s-phase").textContent =
    snap.phase === "ready" ? "就绪" : snap.phase === "busy" ? "运行中" : snap.phase;
  $("s-thread").textContent = shortId(snap.threadId, 14);
  $("s-thread").title = snap.threadId || "";
  $("s-cwd").textContent = snap.workspace ? snap.workspace.replace(/^.*\//, "…/") : "—";
  $("s-cwd").title = snap.workspace || "";
  renderUsage();

  const modelSelect = $("sel-model");
  const previousModel = modelSelect.value;
  modelSelect.innerHTML = "";
  for (const m of snap.models || []) {
    const opt = el("option", "", m.label || m.id);
    opt.value = m.id;
    opt.title = m.id;
    modelSelect.appendChild(opt);
  }
  modelSelect.value = snap.settings.model || previousModel;

  const model = (snap.models || []).find((m) => m.id === modelSelect.value);
  const effortSelect = $("sel-effort");
  effortSelect.innerHTML = "";
  const efforts = model?.efforts?.length ? model.efforts : [{ value: "medium", label: "medium" }];
  for (const e of efforts) {
    const opt = el("option", "", e.value);
    opt.value = e.value;
    if (e.description) opt.title = e.description;
    effortSelect.appendChild(opt);
  }
  effortSelect.value = snap.settings.effort || efforts[0].value;

  $("sel-approval").value = snap.settings.approvalPolicy || "on-request";
  $("sel-sandbox").value = snap.settings.sandbox || "workspace-write";

  const skills = (snap.skills || []).filter((s) => s.source === "project" || s.source === "system" || (!s.source && s.scope !== "plugin"));
  const userSkills = skills.filter((s) => s.source !== "system" && s.scope !== "system");
  const systemSkills = skills.filter((s) => s.source === "system" || s.scope === "system");
  $("skill-count").textContent = `${userSkills.length}/${skills.length}`;
  const skillsList = $("skills-list");
  skillsList.innerHTML = "";
  for (const skill of userSkills) skillsList.appendChild(skillNode(skill));
  if (systemSkills.length) {
    const details = el("details", "skill-system");
    details.appendChild(el("summary", "", `系统技能 (${systemSkills.length})`));
    for (const skill of systemSkills) details.appendChild(skillNode(skill));
    skillsList.appendChild(details);
  }

  const servers = snap.mcpServers || [];
  $("mcp-count").textContent = `${servers.filter((s) => s.status === "connected").length}/${servers.length}`;
  const mcpList = $("mcp-list");
  mcpList.innerHTML = "";
  for (const server of servers) {
    const card = el("div", "server");
    const head = el("div", "server-head");
    const dot = el("span", `dot ${server.status === "connected" ? "ready" : server.status === "failed" ? "error" : "busy"}`);
    head.appendChild(dot);
    head.appendChild(el("span", "", server.name));
    const count = el("span", "count", `${server.tools.length} 工具`);
    head.appendChild(count);
    card.appendChild(head);
    if (server.error) card.appendChild(el("div", "hint", server.error));
    const tools = el("div", "server-tools");
    for (const tool of server.tools) {
      const row = el("div", "server-tool");
      row.appendChild(el("b", "", tool.name));
      if (tool.description) row.appendChild(el("span", "", ` ${tool.description.slice(0, 70)}`));
      tools.appendChild(row);
    }
    card.appendChild(tools);
    mcpList.appendChild(card);
  }

  renderProtocol();
}

function skillNode(skill) {
  const node = el("div", "skill");
  const head = el("div", "skill-head");
  head.appendChild(el("span", "skill-name", skill.name));
  head.appendChild(el("span", `scope ${skill.scope}`, skill.scope));
  node.appendChild(head);
  if (skill.description) node.appendChild(el("div", "skill-desc", skill.description));
  node.title = skill.path || "";
  node.addEventListener("click", () => openSkill(skill));
  return node;
}

function renderUsage() {
  const usage = state.snapshot?.usage;
  if (!usage) {
    $("s-usage").textContent = "—";
    $("s-usage-bar").style.width = "0%";
    return;
  }
  const used = usage.total?.totalTokens || 0;
  const window = usage.modelContextWindow || 0;
  $("s-usage").textContent = window
    ? `${fmtTokens(used)} / ${fmtTokens(window)}`
    : fmtTokens(used);
  $("s-usage-bar").style.width = window ? `${Math.min(100, (used / window) * 100).toFixed(1)}%` : "0%";
}

function renderProtocol() {
  const list = $("rpc-list");
  list.innerHTML = "";
  for (const rpc of state.protocol.slice(-60)) list.appendChild(rpcRow(rpc));
  if (state.protocol.length) list.scrollTop = list.scrollHeight;
}

function appendRpc(rpc) {
  if ($("protocol-overlay").hidden) return;
  $("rpc-list").appendChild(rpcRow(rpc));
  const list = $("rpc-list");
  while (list.children.length > 60) list.firstChild.remove();
  list.scrollTop = list.scrollHeight;
}

function rpcRow(rpc) {
  const row = el("div", "rpc-row");
  const arrow =
    rpc.dir === "out" ? "→" : rpc.dir === "in" ? "←" : rpc.dir === "in-request" ? "←!" : "↩";
  row.appendChild(el("span", `rpc-dir ${rpc.dir}`, arrow));
  row.appendChild(el("span", "rpc-method", rpc.method));
  if (rpc.id !== undefined && rpc.id !== null) row.appendChild(el("span", "rpc-id", `#${rpc.id}`));
  return row;
}

/* --------------------------------------------------------------------- kb panel */

async function searchKb() {
  const query = $("kb-input").value.trim();
  if (!query) return;
  const btn = $("kb-search");
  btn.disabled = true;
  const results = $("kb-results");
  results.innerHTML = '<div class="hint">检索中…</div>';
  try {
    const res = await fetch("/api/mcp-call", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ server: "kb", tool: "search_knowledge", arguments: { query, top_k: 5 } }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) throw new Error(data.error || "检索失败");
    const hits = data.result?.structuredContent?.results || [];
    results.innerHTML = "";
    if (!hits.length) {
      results.appendChild(el("div", "hint", "没有命中，换个关键词试试。"));
      return;
    }
    for (const hit of hits) {
      const card = el("div", "kb-hit");
      const head = el("div", "kb-hit-head");
      head.appendChild(el("span", "", hit.doc_id));
      head.appendChild(el("span", "", `score ${hit.score}`));
      card.appendChild(head);
      card.appendChild(el("div", "kb-hit-head", hit.heading));
      card.appendChild(el("div", "kb-snippet", hit.snippet));
      card.addEventListener("click", () => openDoc(hit.doc_id));
      results.appendChild(card);
    }
  } catch (err) {
    results.innerHTML = "";
    results.appendChild(el("div", "hint", err.message));
  } finally {
    btn.disabled = false;
  }
}

async function openDoc(docId) {
  try {
    const res = await fetch("/api/mcp-call", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ server: "kb", tool: "read_document", arguments: { doc_id: docId } }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) throw new Error(data.error || "读取失败");
    const text = data.result?.content?.[0]?.text || "";
    showDetail(docId, text);
  } catch (err) {
    toast(err.message, "error");
  }
}

async function openSkill(skill) {
  try {
    const res = await fetch(`/api/skill?name=${encodeURIComponent(skill.name)}`);
    const data = await res.json();
    if (!res.ok || !data.ok) throw new Error(data.error || "读取失败");
    const body = data.content.replace(/^---[\s\S]*?---\n/, "");
    showDetail(`技能 · ${skill.name}`, body);
  } catch (err) {
    showDetail(`技能 · ${skill.name}`, skill.description || err.message);
  }
}

function showDetail(title, markdown) {
  $("detail-title").textContent = title;
  $("detail-body").innerHTML = renderMarkdown(markdown);
  $("detail-overlay").hidden = false;
}

/* ---------------------------------------------------------------------- actions */

async function sendMessage(text) {
  const value = (text ?? input.value).trim();
  if (!value) return;
  if (!state.snapshot || state.snapshot.phase !== "ready" || state.busy) {
    toast("Agent 还没就绪，或上一轮仍在运行。", "error");
    return;
  }
  input.value = "";
  resizeInput();
  setBusy(true);
  try {
    const res = await fetch("/api/message", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: value }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) throw new Error(data.error || "发送失败");
  } catch (err) {
    toast(err.message, "error");
    setBusy(false);
  }
}

async function newThread() {
  const hasMessages = messages.querySelector(".msg, .tool, .msg-user");
  if (hasMessages && !confirm("新建会话会清空当前对话，继续？")) return;
  const payload = {
    model: $("sel-model").value,
    effort: $("sel-effort").value,
    approvalPolicy: $("sel-approval").value,
    sandbox: $("sel-sandbox").value,
  };
  try {
    const res = await fetch("/api/new-thread", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) throw new Error(data.error || "新建失败");
    state.approvals.clear();
    state.approvalQueue = [];
    state.currentApproval = null;
    hideApproval();
    toast("已新建会话");
  } catch (err) {
    toast(err.message, "error");
  }
}

async function pushSettings() {
  const payload = {
    model: $("sel-model").value,
    effort: $("sel-effort").value,
    approvalPolicy: $("sel-approval").value,
    sandbox: $("sel-sandbox").value,
  };
  try {
    await fetch("/api/settings", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (state.snapshot) Object.assign(state.snapshot.settings, payload);
  } catch {
    /* ignore */
  }
}

/* ------------------------------------------------------------------------- init */

function resizeInput() {
  input.style.height = "auto";
  input.style.height = `${Math.min(input.scrollHeight, 180)}px`;
}

function bind() {
  sendBtn.addEventListener("click", () => sendMessage());
  input.addEventListener("input", resizeInput);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.isComposing) {
      e.preventDefault();
      sendMessage();
    }
  });

  for (const button of document.querySelectorAll("[data-prompt]")) {
    button.addEventListener("click", () => sendMessage(button.dataset.prompt));
  }

  $("btn-new").addEventListener("click", newThread);
  $("btn-stop").addEventListener("click", async () => {
    try {
      await fetch("/api/interrupt", { method: "POST" });
      toast("已请求中断");
    } catch {
      toast("中断失败", "error");
    }
  });
  $("btn-panel").addEventListener("click", () => document.querySelector(".shell").classList.toggle("panel-open"));
  $("btn-protocol").addEventListener("click", () => {
    $("protocol-overlay").hidden = false;
    renderProtocol();
  });
  $("protocol-close").addEventListener("click", () => ($("protocol-overlay").hidden = true));
  $("detail-close").addEventListener("click", () => ($("detail-overlay").hidden = true));

  for (const overlay of document.querySelectorAll(".overlay")) {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay && overlay.id !== "approval-overlay") overlay.hidden = true;
    });
  }

  $("sel-model").addEventListener("change", async () => {
    const snap = state.snapshot;
    const model = (snap?.models || []).find((m) => m.id === $("sel-model").value);
    if (model?.efforts?.length) {
      const effortSelect = $("sel-effort");
      effortSelect.innerHTML = "";
      for (const e of model.efforts) {
        const opt = el("option", "", e.value);
        opt.value = e.value;
        effortSelect.appendChild(opt);
      }
      const values = model.efforts.map((e) => e.value);
      effortSelect.value = values.includes("medium") ? "medium" : model.efforts[0].value;
    }
    await pushSettings();
  });
  $("sel-effort").addEventListener("change", pushSettings);
  $("sel-approval").addEventListener("change", pushSettings);
  $("sel-sandbox").addEventListener("change", async () => {
    await pushSettings();
    toast("沙箱变更会在「新建会话」后生效");
  });

  $("kb-search").addEventListener("click", searchKb);
  $("kb-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter") searchKb();
  });

  $("apr-accept").addEventListener("click", () => decide("accept"));
  $("apr-session").addEventListener("click", () => decide("acceptForSession"));
  $("apr-decline").addEventListener("click", () => decide("decline"));

  messages.addEventListener("scroll", () => {
    autoStick = nearBottom();
  });
}

function init() {
  bind();
  resizeInput();
  // ?preview=1：只渲染一次快照，不建立 SSE（便于无头截图/演示）
  if (new URLSearchParams(location.search).has("preview")) {
    fetch("/api/state")
      .then((r) => r.json())
      .then((snapshot) => onSnapshot({ snapshot, events: [] }))
      .catch((err) => toast(`加载失败：${err.message}`, "error"));
    return;
  }
  connect();
}

init();
