import { test, expect } from "./fixtures.mjs";

test("@mobile bottom navigation is single-tap responsive without horizontal overflow", async ({ signedInPage: page }) => {
  for (const [view, panel] of [
    ["my-lists", "#listsView"],
    ["recipes", "#recipesView"],
    ["discovery", "#discoveryView"],
    ["my-map", "#mapView"]
  ]) {
    await page.locator(`[data-view="${view}"]:visible`).first().tap();
    await expect(page.locator(panel)).toBeVisible();
  }
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test("@mobile restaurant detail closes with one tap", async ({ signedInPage: page }) => {
  const create = await page.request.post("/api/restaurants", { data: {
    name: "E2E Mobile Close",
    address: "Toronto",
    lat: 43.6532,
    lng: -79.3832,
    google_url: "https://maps.apple.com/?ll=43.6532,-79.3832&q=E2E%20Mobile%20Close",
    status: "want_to_go",
    visit_count: 0,
    personal_rating: 0,
    notes: ""
  }});
  expect(create.ok()).toBeTruthy();
  const restaurant = (await create.json()).restaurant;
  await page.reload();
  await page.waitForLoadState("networkidle");
  await page.locator("#markersLayer .restaurant-marker").first().tap();
  await page.locator("#openSpotDetail").tap();
  await expect(page.locator("#spotDetailDialog")).toBeVisible();
  await page.locator("#closeSpotDetail").tap();
  await expect(page.locator("#spotDetailDialog")).toBeHidden();
});
