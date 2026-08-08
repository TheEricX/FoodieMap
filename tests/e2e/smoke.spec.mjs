import { test, expect } from "./fixtures.mjs";

test("@smoke app assets and health endpoint load with expected types", async ({ request }) => {
  const expected = new Map([
    ["/api/health", "application/json"],
    ["/app.js", "text/javascript"],
    ["/i18n.mjs", "text/javascript"],
    ["/map-link-core.mjs", "text/javascript"],
    ["/map-geometry.mjs", "text/javascript"],
    ["/map-interactions.mjs", "text/javascript"],
    ["/location-core.mjs", "text/javascript"],
    ["/ui-core.mjs", "text/javascript"],
    ["/ui-shell.mjs", "text/javascript"],
    ["/ui-dialogs.mjs", "text/javascript"],
    ["/ui-components.mjs", "text/javascript"],
    ["/ui-swipe-dismiss.mjs", "text/javascript"],
    ["/data-client.mjs", "text/javascript"],
    ["/domain-core.mjs", "text/javascript"],
    ["/view-templates.mjs", "text/javascript"],
    ["/list-view-templates.mjs", "text/javascript"],
    ["/account-share-templates.mjs", "text/javascript"],
    ["/form-templates.mjs", "text/javascript"],
    ["/map-view-templates.mjs", "text/javascript"],
    ["/styles.css", "text/css"],
    ["/ui-tokens.css", "text/css"],
    ["/ui-shell.css", "text/css"]
  ]);
  for (const [path, contentType] of expected) {
    const response = await request.get(path);
    expect(response.ok(), `${path} did not load`).toBeTruthy();
    expect(response.headers()["content-type"]).toContain(contentType);
  }
});

test("@smoke signed-out startup shows login without protected API errors", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await expect(page.locator("#loginView")).toBeVisible();
});

test("@smoke auth resolution keeps the protected app behind a stable loading gate", async ({ page }) => {
  let releaseSession;
  let sessionRequestStarted;
  const sessionRequest = new Promise((resolve) => { sessionRequestStarted = resolve; });
  await page.route("**/api/me", async (route) => {
    sessionRequestStarted();
    await new Promise((resolve) => { releaseSession = resolve; });
    await route.fulfill({ contentType: "application/json", body: JSON.stringify({ user: null }) });
  });

  const navigation = page.goto("/");
  await sessionRequest;
  await expect(page.locator("#bootGate")).toBeVisible();
  await expect(page.locator(".layout")).toBeHidden();
  releaseSession();
  await navigation;
  await expect(page.locator("#loginView")).toBeVisible();
  await expect(page.locator("#bootGate")).toBeHidden();
});

test("@smoke signed-out landing keeps authentication choices focused", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await expect(page.locator("#loginPageGoogle")).toBeVisible();
  await expect(page.locator("#loginPageEmail")).toBeVisible();
  await expect(page.locator("#loginView button")).toHaveCount(2);
  await page.locator("#loginPageEmail").click();
  await expect(page.locator("#authDialog")).toBeVisible();
  await expect(page.locator("[data-auth-panel=code]")).toBeVisible();
  await expect(page.locator("[data-auth-password-mode=register]")).toBeVisible();
});

test("@smoke authenticated navigation works after startup and reload", async ({ signedInPage: page }, testInfo) => {
  const shell = testInfo.project.name === "mobile" ? ".mobile-bottom-nav" : ".desktop-primary-nav";
  for (const [view, panel] of [
    ["my-map", "#mapView"],
    ["my-lists", "#listsView"],
    ["recipes", "#recipesView"],
    ["discovery", "#discoveryView"]
  ]) {
    const navigationView = view === "my-lists" ? "my-map" : view;
    await page.locator(`[data-view="${view}"]:visible`).first().click();
    await expect(page.locator(panel)).toBeVisible();
    await expect(page.locator(`${shell} [data-view="${navigationView}"]`)).toHaveClass(/active/);
    await expect(page.locator(`${shell} [data-view="${navigationView}"]`)).toHaveAttribute("aria-current", "page");
  }
  await page.reload();
  await page.waitForLoadState("networkidle");
  await page.locator('[data-view="my-map"]:visible').first().click();
  await expect(page.locator("#mapView")).toBeVisible();
});

test("@smoke language selection persists through reload", async ({ signedInPage: page }) => {
  await page.locator("#languageMenu > summary").click();
  await page.locator('[data-language-option="zh"]').click();
  await expect(page.locator('[data-place-nav]:visible').first()).toHaveText("我的地点");
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await page.reload();
  await page.waitForLoadState("networkidle");
  await expect(page.locator('[data-place-nav]:visible').first()).toHaveText("我的地点");
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
});

test("@staging staging reports PostgreSQL and GCS", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.ok()).toBeTruthy();
  const health = await response.json();
  expect(health).toMatchObject({ ok: true, database: "postgresql", storage: "gcs" });
});
