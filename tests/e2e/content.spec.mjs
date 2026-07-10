import { test, expect } from "./fixtures.mjs";

const onePixelPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64"
);

test("list and recipe content persists with image readback", async ({ signedInPage: page }) => {
  const restaurantResponse = await page.request.post("/api/restaurants", { data: {
    name: "E2E Content Spot",
    address: "Toronto",
    lat: 43.6532,
    lng: -79.3832,
    google_url: "https://maps.apple.com/?ll=43.6532,-79.3832&q=E2E",
    status: "favorite",
    visit_count: 1,
    personal_rating: 4.8,
    notes: "content lifecycle"
  }});
  expect(restaurantResponse.ok()).toBeTruthy();
  const restaurant = (await restaurantResponse.json()).restaurant;

  const listResponse = await page.request.post("/api/lists", {
    data: { title: "E2E Toronto Picks", description: "Automated list", cover_image_url: "" }
  });
  expect(listResponse.ok()).toBeTruthy();
  const list = (await listResponse.json()).list;
  const itemResponse = await page.request.post(`/api/lists/${list.id}/items`, {
    data: { restaurant_id: restaurant.id, note: "first choice" }
  });
  expect(itemResponse.ok()).toBeTruthy();

  const recipeResponse = await page.request.post("/api/recipes", { data: {
    title: "E2E Tomato Noodles",
    ingredients: "tomato\nnoodles",
    steps: "cook and combine",
    notes: "automation",
    rating: 4.6,
    cooked_at: 1783641600
  }});
  expect(recipeResponse.ok()).toBeTruthy();
  const recipe = (await recipeResponse.json()).recipe;
  const uploadResponse = await page.request.post(`/api/recipes/${recipe.id}/image`, {
    multipart: { image: { name: "recipe.png", mimeType: "image/png", buffer: onePixelPng } }
  });
  expect(uploadResponse.ok(), await uploadResponse.text()).toBeTruthy();
  const imageUrl = (await uploadResponse.json()).recipe.image_url;
  expect((await page.request.get(imageUrl)).ok()).toBeTruthy();

  await page.reload();
  await page.waitForLoadState("networkidle");
  await page.locator('[data-view="my-lists"]:visible').first().click();
  await expect(page.getByText("E2E Toronto Picks", { exact: true }).first()).toBeVisible();
  await page.locator('[data-view="recipes"]:visible').first().click();
  await expect(page.getByText("E2E Tomato Noodles", { exact: true }).first()).toBeVisible();
});

test("@responsive share actions keep generate and copy aligned in equal columns", async ({ signedInPage: page }) => {
  const actions = page.locator("#recipeShareForm .share-actions");
  await page.evaluate(() => document.querySelector("#recipeShareDialog").showModal());
  await expect(actions).toBeVisible();
  const [generateBox, copyBox] = await Promise.all([
    actions.locator("#createRecipeShareButton").boundingBox(),
    actions.locator("#copyRecipeShareButton").boundingBox()
  ]);
  expect(generateBox).not.toBeNull();
  expect(copyBox).not.toBeNull();
  expect(Math.abs(generateBox.y - copyBox.y)).toBeLessThanOrEqual(1);
  expect(Math.abs(generateBox.width - copyBox.width)).toBeLessThanOrEqual(1);
  expect(generateBox.height).toBeGreaterThanOrEqual(48);
});

test("@responsive mobile form actions stay aligned and compact", async ({ signedInPage: page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "Mobile action bar styling");
  await page.evaluate(() => document.querySelector("#listDialog").showModal());
  const cancel = page.locator("#cancelListButton");
  const save = page.locator("#saveListButton");
  const [cancelBox, saveBox, radius] = await Promise.all([
    cancel.boundingBox(),
    save.boundingBox(),
    save.evaluate((element) => getComputedStyle(element).borderRadius)
  ]);
  expect(cancelBox).not.toBeNull();
  expect(saveBox).not.toBeNull();
  expect(Math.abs(cancelBox.y - saveBox.y)).toBeLessThanOrEqual(1);
  expect(Math.abs(cancelBox.width - saveBox.width)).toBeLessThanOrEqual(1);
  expect(saveBox.height).toBeGreaterThanOrEqual(48);
  expect(saveBox.height).toBeLessThanOrEqual(56);
  expect(radius).toBe("16px");
});
