#!/usr/bin/env node
/**
 * 准备工作：创建独立 CODEX_HOME，并把用户已有的登录凭证软链进来。
 * 这样 demo 不会读写 ~/.codex/config.toml，也不会污染你的 Codex 配置。
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { CODEX_HOME, DATA_DIR, ROOT, WORKSPACE } from "../src/config.mjs";

const ok = (msg) => console.log(`  \u2713 ${msg}`);
const warn = (msg) => console.log(`  ! ${msg}`);

function which(cmd) {
  const r = spawnSync(cmd, ["--version"], { encoding: "utf8" });
  return r.status === 0 ? r.stdout.trim().split("\n")[0] : null;
}

console.log("\nNebula demo — setup\n");

for (const dir of [CODEX_HOME, DATA_DIR, WORKSPACE]) {
  fs.mkdirSync(dir, { recursive: true });
}
ok(`runtime dirs ready: ${path.relative(ROOT, CODEX_HOME)}/, demo-data/, workspace/`);

const codexVersion = which("codex");
if (codexVersion) ok(`codex found: ${codexVersion}`);
else warn("codex not found on PATH — install Codex CLI first (https://github.com/openai/codex)");

const pyVersion = which("python3");
if (pyVersion) ok(`python3 found: ${pyVersion}`);
else warn("python3 not found — the kb/notes MCP servers need Python 3.10+");

const demoAuth = path.join(CODEX_HOME, "auth.json");
const userAuth = path.join(os.homedir(), ".codex", "auth.json");

let authState = "missing";
try {
  const st = fs.lstatSync(demoAuth);
  if (st.isSymbolicLink()) authState = fs.existsSync(demoAuth) ? "ok" : "broken";
  else authState = "ok";
} catch {
  /* missing */
}

if (authState === "ok") {
  ok("CODEX_HOME/auth.json already present");
} else if (fs.existsSync(userAuth)) {
  try {
    if (authState === "broken") fs.unlinkSync(demoAuth);
    fs.symlinkSync(userAuth, demoAuth);
    ok(`linked auth: ${path.relative(ROOT, demoAuth)} -> ~/.codex/auth.json`);
  } catch (err) {
    warn(`could not symlink auth: ${err.message}`);
  }
} else {
  warn("no ~/.codex/auth.json found.");
  console.log("    先运行 `codex login`（或在 .codex-home/auth.json 放置 OPENAI_API_KEY 凭据），再重新 setup。");
}

console.log(`
下一步:
  npm start            启动 demo UI (http://127.0.0.1:4317)
  npm run smoke        无头端到端冒烟测试（会真实调用模型，消耗额度）

可选环境变量:
  PORT=4317  DEMO_MODEL=gpt-5.1-codex-mini  CODEX_HOME=/tmp/codex-home  DEBUG_CODEX=1
`);
