import { test, expect } from "./fixtures.mjs";

test("@responsive @visual signed-out entry remains visually stable", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await expect(page.locator("#loginView")).toBeVisible();
  await expect(page).toHaveScreenshot("signed-out-entry.png", { animations: "disabled", fullPage: true });
});

test("@responsive @visual empty map capture panel remains visually stable", async ({ signedInPage: page }) => {
  await expect(page.locator("#emptyMap")).toBeVisible();
  await expect(page.locator("#mapView")).toHaveScreenshot("empty-map-capture.png", { animations: "disabled" });
});

test("@responsive @visual signed-in map keeps a compact mobile control hierarchy", async ({ signedInPage: page }) => {
  const created = await page.request.post("/api/restaurants", { data: {
    name: "Visual mobile map spot",
    address: "Toronto",
    lat: 43.6532,
    lng: -79.3832,
    google_url: "https://maps.apple.com/?ll=43.6532,-79.3832&q=Visual%20mobile%20map%20spot",
    status: "want_to_go",
    visit_count: 0,
    personal_rating: 0,
    notes: ""
  }});
  expect(created.ok()).toBeTruthy();
  await page.reload();
  await page.waitForLoadState("networkidle");
  await expect(page.locator("#mapView")).toHaveScreenshot("signed-in-map-controls.png", { animations: "disabled" });
});

test("@responsive @visual saved places keep filter controls clear of results", async ({ signedInPage: page }) => {
  const created = await page.request.post("/api/restaurants", { data: {
    name: "Visual saved place",
    address: "Toronto",
    lat: 43.6532,
    lng: -79.3832,
    google_url: "https://maps.apple.com/?ll=43.6532,-79.3832&q=Visual%20saved%20place",
    status: "want_to_go",
    visit_count: 0,
    personal_rating: 0,
    notes: ""
  }});
  expect(created.ok()).toBeTruthy();
  await page.reload();
  await page.waitForLoadState("networkidle");
  await page.locator('[data-place-view="my-lists"]:visible').click();
  await expect(page.locator("#listsView")).toHaveScreenshot("saved-places-list-controls.png", { animations: "disabled" });
});
