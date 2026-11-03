# Nebula Demo 工作区

这是 Codex Agent 的工作目录（`thread.cwd`）。Agent 的 shell、文件读写、apply_patch
都被沙箱限制在这个目录内（`sandbox = workspace-write`）。

## 内容

- `src/healthcheck.js`：一个很小的健康检查工具，用来演示 Agent 修改代码。
- `test/healthcheck.test.js`：用 `node --test` 运行的测试。
- `package.json`：只有 `npm test` 一个脚本，无第三方依赖。

## 试试

让 Agent：「给 healthcheck 增加 retries 参数（默认 2），补测试并运行 npm test」。
观察它如何读文件、打补丁、执行命令，以及工具调用如何以 `item` 事件流式返回。
