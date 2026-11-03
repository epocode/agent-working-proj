/**
 * 极简健康检查工具，用于演示 Codex Agent 读写代码。
 * 真实项目里这里会真的去探测下游依赖。
 */
export function healthcheck({ service, timeoutMs = 1000 } = {}) {
  if (!service) {
    throw new Error("service is required");
  }
  return {
    service,
    status: "ok",
    checkedAt: new Date(0).toISOString(), // 固定时间，方便测试
    timeoutMs,
  };
}

export function formatReport(result) {
  return `[${result.status.toUpperCase()}] ${result.service} (timeout=${result.timeoutMs}ms)`;
}
