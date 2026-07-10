import { test, expect } from "./fixtures.mjs";

test("@smoke app assets and health endpoint load with expected types", async ({ request }) => {
  const expected = new Map([
    ["/api/health", "application/json"],
    ["/app.js", "text/javascript"],
    ["/location-core.mjs", "text/javascript"],
    ["/styles.css", "text/css"]
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

test("@smoke authenticated navigation works after startup and reload", async ({ signedInPage: page }) => {
  for (const [view, panel] of [
    ["my-map", "#mapView"],
    ["my-lists", "#listsView"],
    ["recipes", "#recipesView"],
    ["discovery", "#discoveryView"]
  ]) {
    await page.locator(`[data-view="${view}"]:visible`).first().click();
    await expect(page.locator(panel)).toBeVisible();
    await expect(page.locator(`[data-view="${view}"].active:visible`)).toHaveCount(1);
  }
  await page.reload();
  await page.waitForLoadState("networkidle");
  await page.locator('[data-view="my-map"]:visible').first().click();
  await expect(page.locator("#mapView")).toBeVisible();
});

test("@staging staging reports PostgreSQL and GCS", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.ok()).toBeTruthy();
  const health = await response.json();
  expect(health).toMatchObject({ ok: true, database: "postgresql", storage: "gcs" });
});
