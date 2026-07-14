import { test, expect } from "./fixtures.mjs";

test("@responsive published list flows through Discovery and copies back into My Lists", async ({ signedInPage: page }) => {
  const suffix = Date.now().toString(36);
  const title = `E2E Discovery ${suffix}`;
  const restaurantResponse = await page.request.post("/api/restaurants", { data: {
    name: `E2E Discovery Spot ${suffix}`,
    address: "Toronto",
    lat: 43.6532,
    lng: -79.3832,
    google_url: "https://www.google.com/maps?q=43.6532,-79.3832",
    status: "want_to_go",
    visit_count: 0,
    personal_rating: 4.2,
    notes: "Discovery domain view test"
  }});
  expect(restaurantResponse.ok()).toBeTruthy();
  const restaurant = (await restaurantResponse.json()).restaurant;

  const listResponse = await page.request.post("/api/lists", { data: {
    title,
    description: "Published from the domain view regression test",
    cover_image_url: ""
  }});
  expect(listResponse.ok()).toBeTruthy();
  const list = (await listResponse.json()).list;
  expect((await page.request.post(`/api/lists/${list.id}/items`, { data: { restaurant_id: restaurant.id } })).ok()).toBeTruthy();
  expect((await page.request.patch(`/api/lists/${list.id}`, { data: { visibility: "public" } })).ok()).toBeTruthy();

  await page.reload();
  await page.waitForLoadState("networkidle");
  await page.locator('[data-view="discovery"]:visible').first().click();
  const card = page.locator("#discoveryGrid [data-list-id]", { hasText: title });
  await expect(card).toBeVisible();
  await card.click();
  await expect(page.locator("#discoveryDetail h2")).toHaveText(title);
  await page.locator("#discoveryDetail [data-copy-public]").click();
  await expect(page.locator("#listsView")).toBeVisible();
  await expect(page.locator("#myListDetail h2")).toHaveText(title);
});

test("@responsive custom list manage actions edit and delete through the shared template", async ({ signedInPage: page }) => {
  const suffix = Date.now().toString(36);
  const title = `E2E Manage ${suffix}`;
  const updatedTitle = `${title} Updated`;
  const listResponse = await page.request.post("/api/lists", { data: {
    title,
    description: "List management regression",
    cover_image_url: ""
  }});
  expect(listResponse.ok()).toBeTruthy();
  const list = (await listResponse.json()).list;

  await page.reload();
  await page.waitForLoadState("networkidle");
  await page.locator('[data-view="my-lists"]:visible').first().click();
  const mobile = await page.locator("body").getAttribute("data-layout") === "mobile";
  if (mobile) {
    await page.locator("#mobileMyListDrawer > summary").click();
    await page.locator(`[data-mobile-my-list-id="${list.id}"]`).click();
  } else {
    await page.locator(`[data-sidebar-list-id="${list.id}"]`).click();
  }
  await expect(page.locator("#myListDetail h2")).toHaveText(title);

  await page.locator("#myListDetail .manage-list-menu > summary").click();
  await page.locator('#myListDetail [data-list-action="edit"]').click();
  await page.locator('#listForm input[name="title"]').fill(updatedTitle);
  await page.locator("#saveListButton").click();
  await expect(page.locator("#myListDetail h2")).toHaveText(updatedTitle);

  await page.locator("#myListDetail .manage-list-menu > summary").click();
  await page.locator('#myListDetail [data-list-action="delete"]').click();
  await expect(page.locator("#confirmDialog")).toBeVisible();
  await page.locator("[data-confirm-accept]").click();
  await expect(page.locator("#myListDetail h2")).not.toHaveText(updatedTitle);
});
