import { createHash } from "node:crypto";

import { test, expect } from "./fixtures.mjs";

function challenge(verifier) {
  return createHash("sha256").update(verifier).digest("base64url");
}

test("OAuth consent, connected app, and revocation complete the user flow", async ({ signedInPage: page }) => {
  const registeredResponse = await page.request.post("/oauth/register", { data: {
    client_name: "Playwright Agent",
    redirect_uris: ["http://127.0.0.1:9876/callback"],
    token_endpoint_auth_method: "none"
  }});
  expect(registeredResponse.status()).toBe(201);
  const registered = await registeredResponse.json();
  const verifier = "playwright-mcp-verifier-2026-with-sufficient-entropy";
  const params = new URLSearchParams({
    client_id: registered.client_id,
    redirect_uri: registered.redirect_uris[0],
    response_type: "code",
    scope: "restaurants:read lists:read recipes:read lists:write",
    state: "playwright-state",
    code_challenge: challenge(verifier),
    code_challenge_method: "S256",
    resource: "http://127.0.0.1:5197/mcp"
  });
  let callbackUrl = "";
  await page.route("http://127.0.0.1:9876/callback**", async (route) => {
    callbackUrl = route.request().url();
    await route.fulfill({ status: 200, contentType: "text/html", body: "Authorized" });
  });
  await page.goto(`/oauth/authorize?${params}`);
  await expect(page.getByRole("heading", { name: "Connect Playwright Agent" })).toBeVisible();
  await expect(page.getByText("Create private lists and add your restaurants")).toBeVisible();
  await page.getByRole("button", { name: "Allow access" }).click();
  await expect(page.getByText("Authorized")).toBeVisible();
  const callback = new URL(callbackUrl);
  expect(callback.searchParams.get("state")).toBe("playwright-state");

  const tokenResponse = await page.request.post("/oauth/token", { form: {
    grant_type: "authorization_code",
    client_id: registered.client_id,
    code: callback.searchParams.get("code"),
    redirect_uri: registered.redirect_uris[0],
    code_verifier: verifier
  }});
  expect(tokenResponse.ok(), await tokenResponse.text()).toBeTruthy();
  const tokens = await tokenResponse.json();

  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.locator("#settingsButton").click();
  await expect(page.getByText("Playwright Agent", { exact: true })).toBeVisible();
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Revoke" }).click();
  await expect(page.getByText("No AI apps are connected.")).toBeVisible();

  const rejected = await page.request.post("/mcp/", {
    headers: {
      Authorization: `Bearer ${tokens.access_token}`,
      Accept: "application/json, text/event-stream"
    },
    data: {
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: { protocolVersion: "2025-11-25", capabilities: {}, clientInfo: { name: "test", version: "1" } }
    }
  });
  expect(rejected.status()).toBe(401);
});
