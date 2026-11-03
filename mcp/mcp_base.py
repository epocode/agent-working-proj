#!/usr/bin/env python3
"""极简 MCP stdio server 基类（只依赖 Python 标准库）。

MCP（Model Context Protocol）的 stdio 传输和 Codex app-server 一样：
stdin/stdout 上逐行 JSON-RPC 2.0。区别是这里的"客户端"是 Codex 本身，
它会把 tools/list 的结果交给模型，并在模型调用工具时执行 tools/call。

这个基类实现 initialize / ping / tools/list / tools/call /
resources/list / resources/read，子类只需实现 tools() 和 call_tool()。
"""

import json
import os
import sys
import time
import traceback


def log(*args):
    # 注意：stdout 被 JSON-RPC 占用，日志只能写 stderr。
    msg = " ".join(str(a) for a in args)
    sys.stderr.write(f"[{time.strftime('%H:%M:%S')}] {msg}\n")
    sys.stderr.flush()


class MCPServer:
    name = "mcp-server"
    version = "0.1.0"
    instructions = ""

    # ------------------------------------------------------------- overrides
    def tools(self):
        """返回 MCP tool 定义列表。"""
        return []

    def call_tool(self, name, arguments):
        """执行工具，返回 MCP CallToolResult 的 dict。"""
        raise NotImplementedError

    def resources(self):
        """返回 MCP resource 列表（可选）。"""
        return []

    def read_resource(self, uri):
        """读取 resource，返回 {uri, mimeType, text}；不支持则返回 None。"""
        return None

    # ------------------------------------------------------------- machinery
    def send(self, obj):
        sys.stdout.write(json.dumps(obj, ensure_ascii=False) + "\n")
        sys.stdout.flush()

    def reply(self, msg_id, result):
        self.send({"jsonrpc": "2.0", "id": msg_id, "result": result})

    def error(self, msg_id, code, message):
        self.send({"jsonrpc": "2.0", "id": msg_id, "error": {"code": code, "message": message}})

    def handle(self, msg):
        method = msg.get("method")
        msg_id = msg.get("id")
        params = msg.get("params") or {}

        # 通知（无 id）不需要回复
        if msg_id is None:
            return

        if method == "initialize":
            requested = params.get("protocolVersion") or "2024-11-05"
            self.reply(msg_id, {
                "protocolVersion": requested,
                "capabilities": {
                    "tools": {"listChanged": False},
                    "resources": {"subscribe": False, "listChanged": False},
                },
                "serverInfo": {"name": self.name, "version": self.version},
                "instructions": self.instructions,
            })
        elif method == "ping":
            self.reply(msg_id, {})
        elif method == "tools/list":
            self.reply(msg_id, {"tools": self.tools()})
        elif method == "tools/call":
            name = params.get("name")
            arguments = params.get("arguments") or {}
            try:
                self.reply(msg_id, self.call_tool(name, arguments))
            except Exception as exc:  # 工具错误返回 isError，而不是 JSON-RPC error
                log(f"tool {name} failed: {exc}")
                traceback.print_exc(file=sys.stderr)
                self.reply(msg_id, {
                    "content": [{"type": "text", "text": f"工具执行失败：{exc}"}],
                    "isError": True,
                })
        elif method == "resources/list":
            try:
                self.reply(msg_id, {"resources": self.resources()})
            except Exception as exc:
                self.error(msg_id, -32603, str(exc))
        elif method == "resources/read":
            try:
                item = self.read_resource(params.get("uri"))
                if item is None:
                    self.error(msg_id, -32602, f"unknown resource: {params.get('uri')}")
                else:
                    self.reply(msg_id, {"contents": [item]})
            except Exception as exc:
                self.error(msg_id, -32603, str(exc))
        elif method in ("resources/templates/list", "prompts/list"):
            key = "resourceTemplates" if method.startswith("resources") else "prompts"
            self.reply(msg_id, {key: []})
        elif method in ("notifications/initialized", "logging/setLevel"):
            return
        else:
            self.error(msg_id, -32601, f"method not found: {method}")

    def serve(self):
        log(f"{self.name} started (pid={os.getpid()})")
        for line in sys.stdin:
            line = line.strip()
            if not line:
                continue
            try:
                msg = json.loads(line)
            except json.JSONDecodeError:
                log(f"invalid JSON: {line[:200]}")
                continue
            try:
                self.handle(msg)
            except Exception as exc:
                log(f"handler crashed: {exc}")
                traceback.print_exc(file=sys.stderr)
                if msg.get("id") is not None:
                    self.error(msg["id"], -32603, str(exc))


def text_result(text, **extra):
    """构造纯文本 CallToolResult。"""
    result = {"content": [{"type": "text", "text": text}]}
    result.update(extra)
    return result
