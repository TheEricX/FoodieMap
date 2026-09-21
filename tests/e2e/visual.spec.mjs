import { test, expect } from "./fixtures.mjs";

const STABLE_PLACEHOLDER = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 180'%3E%3Crect width='240' height='180' rx='28' fill='%23eef0df'/%3E%3Ccircle cx='120' cy='90' r='52' fill='%23fffdf8'/%3E%3Cpath d='M78 104h84M88 84h64' stroke='%23687653' stroke-width='12' stroke-linecap='round'/%3E%3C/svg%3E";

async function stabilizeGeneratedFoodImages(page) {
  await page.locator('img[src^="data:image/svg+xml"]').evaluateAll((images, source) => {
    images.forEach((image) => {
      image.src = source;
    });
  }, STABLE_PLACEHOLDER);
}

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
  await stabilizeGeneratedFoodImages(page);
  await expect(page.locator("#mapView")).toHaveScreenshot("signed-in-map-controls.png", { animations: "disabled" });
});

test("@responsive @visual deep-sea theme keeps the map readable", async ({ signedInPage: page }) => {
  const created = await page.request.post("/api/restaurants", { data: {
    name: "Night Dive Noodles",
    address: "Toronto",
    lat: 43.6532,
    lng: -79.3832,
    google_url: "https://maps.apple.com/?ll=43.6532,-79.3832&q=Night%20Dive%20Noodles",
    status: "favorite",
    visit_count: 2,
    personal_rating: 4.8,
    notes: "A late-night bowl after the last dive."
  }});
  expect(created.ok()).toBeTruthy();
  await page.evaluate(() => localStorage.setItem("foodiemap:theme", "deep-dive"));
  await page.reload();
  await page.waitForLoadState("networkidle");
  await stabilizeGeneratedFoodImages(page);
  await expect(page.locator("html")).toHaveAttribute("data-theme", "deep-dive");
  await expect(page.locator("#mapView")).toHaveScreenshot("deep-sea-map-theme.png", { animations: "disabled" });
});

test("@responsive @visual izakaya theme keeps the map readable", async ({ signedInPage: page }) => {
  const created = await page.request.post("/api/restaurants", { data: {
    name: "Kurenai Yakitori",
    address: "Toronto",
    lat: 43.6532,
    lng: -79.3832,
    google_url: "https://maps.apple.com/?ll=43.6532,-79.3832&q=Kurenai%20Yakitori",
    status: "favorite",
    visit_count: 3,
    personal_rating: 4.7,
    notes: "Warm lanterns, charcoal skewers, and a late-night counter seat."
  }});
  expect(created.ok()).toBeTruthy();
  await page.evaluate(() => localStorage.setItem("foodiemap:theme", "izakaya"));
  await page.reload();
  await page.waitForLoadState("networkidle");
  await stabilizeGeneratedFoodImages(page);
  await expect(page.locator("html")).toHaveAttribute("data-theme", "izakaya");
  await expect(page.locator("#mapView")).toHaveScreenshot("izakaya-map-theme.png", { animations: "disabled" });
});

test("@responsive @visual party-island theme keeps the map readable", async ({ signedInPage: page }) => {
  const created = await page.request.post("/api/restaurants", { data: {
    name: "Rainbow Pier Pizza",
    address: "Toronto",
    lat: 43.6532,
    lng: -79.3832,
    google_url: "https://maps.apple.com/?ll=43.6532,-79.3832&q=Rainbow%20Pier%20Pizza",
    status: "want_to_go",
    visit_count: 1,
    personal_rating: 4.6,
    notes: "Bright tables, a breezy patio, and a good place for a group lunch."
  }});
  expect(created.ok()).toBeTruthy();
  await page.evaluate(() => localStorage.setItem("foodiemap:theme", "party-island"));
  await page.reload();
  await page.waitForLoadState("networkidle");
  await stabilizeGeneratedFoodImages(page);
  await expect(page.locator("html")).toHaveAttribute("data-theme", "party-island");
  await expect(page.locator("#mapView")).toHaveScreenshot("party-island-map-theme.png", { animations: "disabled" });
});

test("@responsive @visual party-island Discovery uses its activity-board treatment", async ({ signedInPage: page }) => {
  await page.evaluate(() => localStorage.setItem("foodiemap:theme", "party-island"));
  await page.reload();
  await page.waitForLoadState("networkidle");
  await page.locator('[data-view="discovery"]:visible').click();
  await expect(page.locator("#discoveryView")).toBeVisible();
  await expect(page.locator("#discoveryView")).toHaveScreenshot("party-island-discovery.png", { animations: "disabled" });
});

test("@responsive @visual party-island settings keeps its themed action bar", async ({ signedInPage: page }) => {
  await page.evaluate(() => localStorage.setItem("foodiemap:theme", "party-island"));
  await page.reload();
  await page.waitForLoadState("networkidle");
  await page.locator("#settingsButton").click();
  await expect(page.locator("#settingsDialog")).toBeVisible();
  await expect(page.locator("#settingsForm")).toHaveScreenshot("party-island-settings.png", { animations: "disabled" });
});

test("@responsive @visual create-list form keeps a compact editing flow", async ({ signedInPage: page }, testInfo) => {
  await page.goto("/#my-lists");
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => localStorage.setItem("foodiemap:theme", "party-island"));
  await page.reload();
  await page.waitForLoadState("networkidle");
  if (testInfo.project.name === "visual-mobile") {
    await page.locator("#mobileMyListDrawer summary").click();
    await page.locator("#mobileMyListDrawer [data-mobile-create-list]").click();
  } else {
    await page.locator("#createListButton").click();
  }
  await expect(page.locator("#listDialog")).toBeVisible();
  await expect(page.locator("#listForm")).toHaveScreenshot("create-list-form.png", { animations: "disabled" });
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
  await stabilizeGeneratedFoodImages(page);
  const restaurantRow = page.locator(`[data-restaurant-id="${(await created.json()).restaurant.id}"]`);
  await restaurantRow.hover();
  await expect.poll(() => restaurantRow.evaluate((row) => getComputedStyle(row, "::after").content)).toBe("none");
  await expect(page.locator("#listsView")).toHaveScreenshot("saved-places-list-controls.png", { animations: "disabled" });
});

test("@responsive @visual restaurant journal keeps a clear editing hierarchy", async ({ signedInPage: page }) => {
  const created = await page.request.post("/api/restaurants", { data: {
    name: "Loon Fong Hotpot",
    address: "Toronto",
    lat: 43.6532,
    lng: -79.3832,
    google_url: "https://maps.apple.com/?ll=43.6532,-79.3832&q=Loon%20Fong%20Hotpot",
    status: "want_to_go",
    visit_count: 0,
    personal_rating: 0,
    notes: "A relaxed dinner spot for sharing a few dishes."
  }});
  expect(created.ok()).toBeTruthy();
  const restaurant = (await created.json()).restaurant;
  const dish = await page.request.post(`/api/restaurants/${restaurant.id}/dishes`, { data: {
    name: "Tomato broth",
    dish_status: "liked",
    rating: 4.5,
    notes: "Bright, savoury, and good with vegetables."
  }});
  expect(dish.ok()).toBeTruthy();
  await page.reload();
  await page.waitForLoadState("networkidle");
  await page.locator("#markersLayer .restaurant-marker").first().click();
  if (await page.locator("#openSpotDetail").isVisible()) {
    await page.locator("#openSpotDetail").click();
  }
  await expect(page.locator("#spotDetailDialog")).toBeVisible();
  await expect(page.locator("#spotDetailDialog")).toHaveScreenshot("restaurant-journal.png", { animations: "disabled" });
});
