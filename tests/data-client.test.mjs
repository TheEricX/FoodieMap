import test from "node:test";
import assert from "node:assert/strict";
import { createDataClient } from "../data-client.mjs";

function clientFor(response, capture = () => {}) {
  return createDataClient({
    fetch: async (path, options) => {
      capture(path, options);
      return response;
    },
    messages: {
      loginRequired: () => "Sign in required",
      requestFailed: () => "Request failed",
    },
  });
}

test("data client applies JSON headers and returns parsed data", async () => {
  let request;
  const client = clientFor({ status: 200, ok: true, json: async () => ({ ok: true }) }, (path, options) => {
    request = { path, options };
  });
  assert.deepEqual(await client.request("/api/lists", { method: "POST", body: "{}" }), { ok: true });
  assert.equal(request.path, "/api/lists");
  assert.equal(request.options.headers["Content-Type"], "application/json");
});

test("data client maps authentication and API errors", async () => {
  const unauthorized = clientFor({ status: 401, ok: false, json: async () => ({}) });
  await assert.rejects(() => unauthorized.request("/api/me"), /Sign in required/);
  const invalid = clientFor({ status: 400, ok: false, json: async () => ({ detail: "Invalid title" }) });
  await assert.rejects(() => invalid.request("/api/lists"), /Invalid title/);
});
