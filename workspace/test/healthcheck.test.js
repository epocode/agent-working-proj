import test from "node:test";
import assert from "node:assert/strict";
import { healthcheck, formatReport } from "../src/healthcheck.js";

test("returns ok for a service", () => {
  const result = healthcheck({ service: "svc_demo" });
  assert.equal(result.status, "ok");
  assert.equal(result.service, "svc_demo");
  assert.equal(result.timeoutMs, 1000);
});

test("requires service name", () => {
  assert.throws(() => healthcheck({}), /service is required/);
});

test("formats a report", () => {
  const result = healthcheck({ service: "svc_demo", timeoutMs: 250 });
  assert.equal(formatReport(result), "[OK] svc_demo (timeout=250ms)");
});
