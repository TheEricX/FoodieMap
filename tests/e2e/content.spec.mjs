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

test("@cross-browser recipe form saves an uploaded image", async ({ signedInPage: page }) => {
  await page.locator('[data-view="recipes"]:visible').first().click();
  await page.locator("#openRecipeDialog").click();
  await expect(page.locator("#recipeDialog")).toHaveAttribute("data-presentation", "desktop-modal");
  await expect(page).not.toHaveURL(/[?&]recipe-editor=/);
  await page.locator('#recipeForm input[name="title"]').fill("E2E Recipe Form Upload");
  await page.locator("#toggleRecipeDetails").click();
  await page.locator("#recipeImageInput").setInputFiles({
    name: "recipe-form.png",
    mimeType: "image/png",
    buffer: onePixelPng
  });

  const uploadResponse = page.waitForResponse((response) => (
    response.request().method() === "POST" && /\/api\/recipes\/[^/]+\/image$/.test(response.url())
  ));
  await page.locator("#saveRecipeButton").click();

  expect((await uploadResponse).ok()).toBeTruthy();
  await expect(page.locator("#recipeDialog")).toBeHidden();
  await expect(page.getByText("E2E Recipe Form Upload", { exact: true }).first()).toBeVisible();
});

test("@cross-browser recipe form saves a selected system image without upload", async ({ signedInPage: page }) => {
  await page.locator('[data-view="recipes"]:visible').first().click();
  await page.locator("#openRecipeDialog").click();
  await page.locator('#recipeForm input[name="title"]').fill("E2E Recipe System Icon");
  await page.locator("#toggleRecipeDetails").click();
  await expect(page.locator("#recipeIconPicker")).toBeVisible();
  await page.locator('#recipeIconPicker label:has(input[value="salad"])').click();
  await expect(page.locator('#recipeIconPicker input[value="salad"]')).toBeChecked();
  await expect(page.locator("#recipeImagePreview img")).toHaveAttribute("src", /^data:image\/svg\+xml/);

  const createResponse = page.waitForResponse((response) => (
    response.request().method() === "POST" && /\/api\/recipes$/.test(response.url())
  ));
  await page.locator("#saveRecipeButton").click();
  const payload = await (await createResponse).json();
  expect(payload.recipe.icon_key).toBe("salad");
  await expect(page.locator("#recipeDialog")).toBeHidden();
  const rowImage = page.locator("#recipeList [data-recipe-id]").filter({ hasText: "E2E Recipe System Icon" }).locator(".recipe-thumb");
  await expect(rowImage).toHaveAttribute("src", /^data:image\/svg\+xml/);
});

test("@cross-browser oversized photos are compressed below the upload limit", async ({ signedInPage: page }) => {
  const recipeResponse = await page.request.post("/api/recipes", { data: {
    title: "E2E Large Photo Compression",
    ingredients: "",
    steps: "",
    notes: "",
    rating: 0,
    cooked_at: 1788307200
  }});
  expect(recipeResponse.ok()).toBeTruthy();
  const recipe = (await recipeResponse.json()).recipe;

  const result = await page.evaluate(async (recipeId) => {
    const canvas = document.createElement("canvas");
    canvas.width = 1800;
    canvas.height = 1800;
    const context = canvas.getContext("2d");
    const pixels = context.createImageData(canvas.width, canvas.height);
    let seed = 0x12345678;
    for (let index = 0; index < pixels.data.length; index += 4) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      pixels.data[index] = seed & 255;
      pixels.data[index + 1] = (seed >>> 8) & 255;
      pixels.data[index + 2] = (seed >>> 16) & 255;
      pixels.data[index + 3] = 255;
    }
    context.putImageData(pixels, 0, 0);
    const sourceBlob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    const sourceFile = new File([sourceBlob], "large-photo.png", { type: "image/png" });
    const compressed = await window.compressImage(sourceFile);
    const form = new FormData();
    form.append("image", compressed, compressed.name);
    const response = await fetch(`/api/recipes/${recipeId}/image`, { method: "POST", body: form });
    return {
      originalSize: sourceFile.size,
      compressedSize: compressed.size,
      compressedType: compressed.type,
      uploadStatus: response.status,
      uploadBody: await response.text()
    };
  }, recipe.id);

  expect(result.originalSize).toBeGreaterThan(1_200_000);
  expect(result.compressedSize).toBeLessThanOrEqual(1_000_000);
  expect(["image/jpeg", "image/webp"]).toContain(result.compressedType);
  expect(result.uploadStatus, result.uploadBody).toBe(200);
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

test("@responsive restaurant share creates a QR card and anonymous preview", async ({ signedInPage: page, browser }) => {
  const restaurantResponse = await page.request.post("/api/restaurants", { data: {
    name: "E2E QR Share Spot",
    address: "100 Share St, Toronto",
    lat: 43.66,
    lng: -79.39,
    google_url: "https://www.google.com/maps?q=43.66,-79.39",
    status: "want_to_go",
    visit_count: 0,
    personal_rating: 4.7,
    notes: "share-card flow"
  }});
  expect(restaurantResponse.ok()).toBeTruthy();
  const restaurant = (await restaurantResponse.json()).restaurant;
  const dishResponse = await page.request.post(`/api/restaurants/${restaurant.id}/dishes`, { data: {
    name: "Sesame Noodles",
    dish_status: "liked",
    rating: 4.8,
    notes: "Order again"
  }});
  expect(dishResponse.ok()).toBeTruthy();

  await page.reload();
  await page.waitForLoadState("networkidle");
  await page.locator('[data-view="my-lists"]:visible').first().click();
  await page.locator(`[data-restaurant-id="${restaurant.id}"] [data-share-restaurant="${restaurant.id}"]`).click();
  await page.locator("#createShareButton").click();
  await expect(page.locator("#shareImageLink")).toBeVisible();
  const shareUrl = await page.locator("#shareUrlInput").inputValue();
  const cardHref = await page.locator("#openShareImage").getAttribute("href");
  expect(shareUrl).toContain("/share/");
  expect(cardHref).toContain("/api/share/");

  const cardResponse = await page.request.get(cardHref);
  expect(cardResponse.ok()).toBeTruthy();
  expect(cardResponse.headers()["content-type"]).toContain("image/png");

  const anonymousPage = await browser.newPage();
  await anonymousPage.goto(shareUrl);
  await anonymousPage.waitForLoadState("networkidle");
  await expect(anonymousPage.locator("#spotCard").getByText("E2E QR Share Spot", { exact: true })).toBeVisible();
  await expect(anonymousPage.locator("#spotCard").getByText("Sesame Noodles")).toBeVisible();
  await anonymousPage.close();
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
