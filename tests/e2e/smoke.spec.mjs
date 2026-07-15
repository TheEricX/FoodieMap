import { test, expect } from "./fixtures.mjs";

test("@smoke app assets and health endpoint load with expected types", async ({ request }) => {
  const expected = new Map([
    ["/api/health", "application/json"],
    ["/app.js", "text/javascript"],
    ["/i18n.mjs", "text/javascript"],
    ["/location-core.mjs", "text/javascript"],
    ["/ui-core.mjs", "text/javascript"],
    ["/ui-shell.mjs", "text/javascript"],
    ["/ui-dialogs.mjs", "text/javascript"],
    ["/ui-components.mjs", "text/javascript"],
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

test("@smoke authenticated navigation works after startup and reload", async ({ signedInPage: page }, testInfo) => {
  const shell = testInfo.project.name === "mobile" ? ".mobile-bottom-nav" : ".desktop-primary-nav";
  for (const [view, panel] of [
    ["my-map", "#mapView"],
    ["my-lists", "#listsView"],
    ["recipes", "#recipesView"],
    ["discovery", "#discoveryView"]
  ]) {
    await page.locator(`[data-view="${view}"]:visible`).first().click();
    await expect(page.locator(panel)).toBeVisible();
    await expect(page.locator(`${shell} [data-view="${view}"]`)).toHaveClass(/active/);
    await expect(page.locator(`${shell} [data-view="${view}"]`)).toHaveAttribute("aria-current", "page");
  }
  await page.reload();
  await page.waitForLoadState("networkidle");
  await page.locator('[data-view="my-map"]:visible').first().click();
  await expect(page.locator("#mapView")).toBeVisible();
});

test("@smoke language selection persists through reload", async ({ signedInPage: page }) => {
  await page.locator("#languageMenu > summary").click();
  await page.locator('[data-language-option="zh"]').click();
  await expect(page.locator('a[data-view="my-map"]:visible').first()).toHaveText("地图");
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await page.reload();
  await page.waitForLoadState("networkidle");
  await expect(page.locator('a[data-view="my-map"]:visible').first()).toHaveText("地图");
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
});

test("@staging staging reports PostgreSQL and GCS", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.ok()).toBeTruthy();
  const health = await response.json();
  expect(health).toMatchObject({ ok: true, database: "postgresql", storage: "gcs" });
});
