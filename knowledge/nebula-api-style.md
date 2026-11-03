# Nebula API 设计规范

## 版本与路径

- 路径格式：`/api/v1/<resource>`，资源名用复数、小写、连字符。
- 破坏性变更必须升大版本；新增可选字段不算破坏性变更。
- 所有服务通过 `api.nebula.internal` 网关暴露，禁止直连。

## 错误响应

统一错误结构：

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "service svc_abc123 not found",
    "request_id": "req_01H...",
    "details": {}
  }
}
```

- `code` 使用大写下划线枚举，不要用自然语言。
- 4xx 表示调用方可修复的问题；5xx 表示服务端问题。
- 每个响应都必须带 `request_id`，方便跨服务追踪。

## 分页

- 使用游标分页：`?cursor=<opaque>&limit=50`。
- 响应包含 `next_cursor`，没有更多数据时为 `null`。
- 禁止使用 offset 分页，避免深分页性能问题。

## 幂等

- 所有写接口支持 `Idempotency-Key` 请求头，24 小时内相同 key 返回首次结果。
- 重试必须复用同一个 key。

## 超时与重试

- 客户端默认超时 3 秒，最多重试 2 次，指数退避（100ms、300ms）。
- 只对幂等请求重试；POST 创建类请求必须带 Idempotency-Key 才能重试。

## 可观测性

- 每个服务暴露 `/healthz`（存活）和 `/readyz`（就绪）。
- 关键路径必须打结构化日志，字段包含 `request_id`、`service_id`、`latency_ms`。
