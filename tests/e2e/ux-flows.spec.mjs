import { test, expect } from "./fixtures.mjs";

async function closeMobileSpotDetailIfOpen(page) {
  const mobile = await page.locator("body").getAttribute("data-layout") === "mobile";
  if (mobile && await page.locator("#spotDetailDialog").isVisible()) {
    await page.locator("#closeSpotDetail").click();
    await expect(page.locator("#spotDetailDialog")).toBeHidden();
  }
  return mobile;
}

async function openListPickerForRestaurant(page, title) {
  const mobile = await closeMobileSpotDetailIfOpen(page);
  const marker = page.locator(`#markersLayer .restaurant-marker[title*="${title}"]`);
  await marker.click();
  await page.locator(mobile ? "#detailAddToList" : "#spotAddToList").click();
  await expect(page.locator("#listPickerDialog")).toBeVisible();
}

async function openOwnedList(page, listId) {
  const mobile = await closeMobileSpotDetailIfOpen(page);
  await page.locator('[data-view="my-lists"]:visible').first().click();
  if (mobile) {
    await closeMobileSpotDetailIfOpen(page);
    await page.locator("#mobileMyListDrawer > summary").click();
    await page.locator(`[data-mobile-my-list-id="${listId}"]`).click();
  } else {
    await page.locator(`[data-sidebar-list-id="${listId}"]`).click();
  }
}

test("@responsive restaurant detail adds a spot to an existing or new list", async ({ signedInPage: page }) => {
  const suffix = Date.now().toString(36);
  const restaurantTitle = `E2E List Shortcut ${suffix}`;
  const existingListTitle = `E2E Existing ${suffix}`;
  const newListTitle = `E2E New ${suffix}`;
  const restaurantResponse = await page.request.post("/api/restaurants", { data: {
    name: restaurantTitle,
    address: "Toronto",
    lat: 43.6532,
    lng: -79.3832,
    google_url: "https://www.google.com/maps?q=43.6532,-79.3832",
    status: "want_to_go",
    visit_count: 0,
    personal_rating: 0,
    notes: ""
  }});
  expect(restaurantResponse.ok()).toBeTruthy();
  const restaurant = (await restaurantResponse.json()).restaurant;
  const listResponse = await page.request.post("/api/lists", { data: {
    title: existingListTitle,
    description: "",
    cover_image_url: ""
  }});
  expect(listResponse.ok()).toBeTruthy();
  const existingList = (await listResponse.json()).list;

  await page.reload();
  await page.waitForLoadState("networkidle");
  await openListPickerForRestaurant(page, restaurantTitle);
  await page.locator(`[data-add-restaurant-to-list="${existingList.id}"]`).click();
  await expect(page.locator("#appToast")).toBeVisible();
  const existingDetail = await page.request.get(`/api/lists/${existingList.id}`);
  expect(existingDetail.ok()).toBeTruthy();
  expect((await existingDetail.json()).list.items.map((item) => item.restaurant_id)).toContain(restaurant.id);

  await openListPickerForRestaurant(page, restaurantTitle);
  await page.locator("#createListForSpot").click();
  await page.locator('#listForm input[name="title"]').fill(newListTitle);
  await page.locator("#saveListButton").click();
  await expect(page.locator("#appToast")).toBeVisible();
  const allLists = await page.request.get("/api/lists");
  const newList = (await allLists.json()).lists.find((list) => list.title === newListTitle);
  expect(newList).toBeTruthy();
  const newDetail = await page.request.get(`/api/lists/${newList.id}`);
  expect((await newDetail.json()).list.items.map((item) => item.restaurant_id)).toContain(restaurant.id);
});

test("@responsive Lists exposes direct empty-list and publish actions", async ({ signedInPage: page }) => {
  const suffix = Date.now().toString(36);
  const listResponse = await page.request.post("/api/lists", { data: {
    title: `E2E Empty ${suffix}`,
    description: "",
    cover_image_url: ""
  }});
  expect(listResponse.ok()).toBeTruthy();
  const emptyList = (await listResponse.json()).list;

  await page.reload();
  await page.waitForLoadState("networkidle");
  await openOwnedList(page, emptyList.id);
  await page.locator("#myListDetail [data-empty-action]").click();
  await expect(page.locator("#addSpotsDialog")).toBeVisible();
  await page.locator("#closeAddSpotsDialog").click();

  const restaurantResponse = await page.request.post("/api/restaurants", { data: {
    name: `E2E Publish Shortcut ${suffix}`,
    address: "Toronto",
    lat: 43.6532,
    lng: -79.3832,
    google_url: "https://www.google.com/maps?q=43.6532,-79.3832",
    status: "want_to_go",
    visit_count: 0,
    personal_rating: 0,
    notes: ""
  }});
  const restaurant = (await restaurantResponse.json()).restaurant;
  const add = await page.request.post(`/api/lists/${emptyList.id}/items`, { data: { restaurant_id: restaurant.id } });
  expect(add.ok()).toBeTruthy();

  await page.reload();
  await page.waitForLoadState("networkidle");
  await openOwnedList(page, emptyList.id);
  await page.locator("#myListDetail .detail-actions [data-list-action=publish]").click();
  await expect(page.locator("#appToast")).toBeVisible();
  const discovery = await page.request.get("/api/discovery/lists");
  expect((await discovery.json()).lists.map((list) => list.id)).toContain(emptyList.id);
});

test("@responsive search explains its scope for each product area", async ({ signedInPage: page }) => {
  const cases = [
    ["my-map", /spots/i],
    ["my-lists", /list/i],
    ["recipes", /recipes/i],
    ["discovery", /curated lists/i],
  ];
  for (const [view, expectedPlaceholder] of cases) {
    await page.locator(`[data-view="${view}"]:visible`).first().click();
    await expect(page.locator("#searchInput")).toHaveAttribute("placeholder", expectedPlaceholder);
  }
});

test("@responsive search terms stay scoped to the active product area", async ({ signedInPage: page }) => {
  await page.locator("#searchInput").fill("map-only");
  await page.locator('[data-view="my-lists"]:visible').first().click();
  await expect(page.locator("#searchInput")).toHaveValue("");
  await page.locator("#searchInput").fill("lists-only");
  await page.locator('[data-view="my-map"]:visible').first().click();
  await expect(page.locator("#searchInput")).toHaveValue("map-only");
  await page.locator('[data-view="my-lists"]:visible').first().click();
  await expect(page.locator("#searchInput")).toHaveValue("lists-only");
});

test("@desktop recipes retain the parallel list and detail workspace", async ({ signedInPage: page }) => {
  test.skip((await page.locator("body").getAttribute("data-layout")) === "mobile", "Mobile uses the full-detail recipe flow.");
  const create = await page.request.post("/api/recipes", { data: {
    title: "Desktop parallel recipe",
    rating: 4,
    cooked_at: Math.floor(Date.now() / 1000),
    ingredients: "Pasta",
    steps: "Cook",
    notes: ""
  }});
  expect(create.ok()).toBeTruthy();

  await page.locator('[data-view="recipes"]:visible').first().click();
  await page.locator("#recipeList [data-recipe-id]").click();
  await expect(page.locator("#recipesView .recipes-panel")).toBeVisible();
  await expect(page.locator("#recipeDetail")).toBeVisible();
  await expect(page.locator("[data-back-recipe-list]")).toBeHidden();
});
