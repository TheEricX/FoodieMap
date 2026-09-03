import { test, expect } from "./fixtures.mjs";

const onePixelPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64"
);

test("@responsive signed-out recipe share preview renders shared content", async ({ signedInPage: page }) => {
  const suffix = Date.now().toString(36);
  const title = `E2E Shared Recipe ${suffix}`;
  const recipeResponse = await page.request.post("/api/recipes", { data: {
    title,
    ingredients: "tomato\nnoodles",
    steps: "cook and combine",
    notes: "share preview regression",
    rating: 4.7,
    cooked_at: 1783641600
  }});
  expect(recipeResponse.ok()).toBeTruthy();
  const recipe = (await recipeResponse.json()).recipe;
  const shareResponse = await page.request.post(`/api/recipes/${recipe.id}/share`);
  expect(shareResponse.ok()).toBeTruthy();
  const share = await shareResponse.json();

  await page.context().clearCookies();
  await page.goto(share.share_url);
  await page.waitForLoadState("networkidle");
  await expect(page.locator("#recipeSharePage h1")).toHaveText(title);
  await expect(page.locator("#recipeSharePage [data-add-recipe-share]")).toBeVisible();
  await expect(page.locator("#recipeSharePage")).toContainText("tomato");
  const overflow = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth }));
  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.width + 1);
});

test("@responsive admin user template keeps plan and photo quota actions connected", async ({ page, account }) => {
  await page.goto("/admin");
  await page.locator("#adminUsernameInput").fill("e2e-admin");
  await page.locator("#adminPasswordInput").fill("e2e-admin-password");
  await page.locator("#adminLoginButton").click();
  await expect(page.locator("#adminView")).toBeVisible();
  const row = page.locator("#adminUserList .admin-user-row", { hasText: account.email });
  await expect(row).toBeVisible();
  const userId = await row.getAttribute("data-admin-user-id");
  const savePhotoLimit = async (value) => {
    await row.locator("[data-admin-image-limit]").fill(value);
    const responsePromise = page.waitForResponse((response) => (
      response.request().method() === "PATCH" && response.url().endsWith(`/api/admin/users/${userId}`)
    ));
    await row.locator('[data-admin-action="image-limit"]').click();
    const response = await responsePromise;
    expect(response.ok(), await response.text()).toBeTruthy();
  };
  await savePhotoLimit("2");
  await expect(row).toContainText("Photos 0/2");

  const login = await page.request.post("/auth/email/login", { data: {
    email: account.email,
    password: account.password
  }});
  expect(login.ok()).toBeTruthy();
  const createRecipe = async (title) => {
    const response = await page.request.post("/api/recipes", { data: {
      title,
      ingredients: "",
      steps: "",
      notes: "",
      rating: 0,
      cooked_at: 1788307200
    }});
    expect(response.ok()).toBeTruthy();
    return (await response.json()).recipe;
  };
  const firstRecipe = await createRecipe("Admin quota first image");
  const secondRecipe = await createRecipe("Admin quota blocked image");
  const uploadImage = (recipeId) => page.request.post(`/api/recipes/${recipeId}/image`, {
    multipart: { image: { name: "quota.png", mimeType: "image/png", buffer: onePixelPng } }
  });
  expect((await uploadImage(firstRecipe.id)).ok()).toBeTruthy();
  expect((await uploadImage(firstRecipe.id)).ok()).toBeTruthy();

  const restaurantResponse = await page.request.post("/api/restaurants", { data: {
    name: "Admin quota restaurant",
    address: "Toronto",
    lat: 43.6532,
    lng: -79.3832,
    google_url: "https://maps.apple.com/?ll=43.6532,-79.3832&q=Admin%20Quota",
    status: "want_to_go",
    visit_count: 0,
    personal_rating: 0,
    notes: ""
  }});
  expect(restaurantResponse.ok()).toBeTruthy();
  const restaurant = (await restaurantResponse.json()).restaurant;
  const dishResponse = await page.request.post(`/api/restaurants/${restaurant.id}/dishes`, { data: {
    name: "Admin quota dish",
    dish_status: "tried",
    rating: 0,
    notes: ""
  }});
  expect(dishResponse.ok()).toBeTruthy();
  const dish = (await dishResponse.json()).dish;
  const dishUpload = await page.request.post(`/api/dishes/${dish.id}/image`, {
    multipart: { image: { name: "quota-dish.png", mimeType: "image/png", buffer: onePixelPng } }
  });
  expect(dishUpload.ok()).toBeTruthy();

  const blockedUpload = await uploadImage(secondRecipe.id);
  expect(blockedUpload.status()).toBe(403);
  expect((await blockedUpload.json()).detail).toContain("Image upload limit reached: 2/2");

  await page.locator("#adminRefreshButton").click();
  await expect(row).toContainText("Photos 2/2");
  await row.locator('[data-admin-action="plan"]').click();
  await expect(page.locator("#confirmDialog")).toBeVisible();
  await page.locator("[data-confirm-accept]").click();
  await expect(row).toContainText("Paid");
  const resetResponsePromise = page.waitForResponse((response) => (
    response.request().method() === "PATCH" && response.url().endsWith(`/api/admin/users/${userId}`)
  ));
  await row.locator('[data-admin-action="image-limit-reset"]').click();
  const resetResponse = await resetResponsePromise;
  expect(resetResponse.ok(), await resetResponse.text()).toBeTruthy();
  await expect(row).toContainText("Photos 2/500");
  const quotaLayout = await row.locator(".admin-image-limit-control").evaluate((control) => ({
    right: control.getBoundingClientRect().right,
    rowRight: control.closest(".admin-user-row").getBoundingClientRect().right,
    documentWidth: document.documentElement.clientWidth,
    documentScrollWidth: document.documentElement.scrollWidth
  }));
  expect(quotaLayout.right).toBeLessThanOrEqual(quotaLayout.rowRight + 1);
  expect(quotaLayout.documentScrollWidth).toBeLessThanOrEqual(quotaLayout.documentWidth + 1);
});
