import { test, expect } from "./fixtures.mjs";

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

test("@responsive admin user template keeps plan actions connected", async ({ page, account }) => {
  await page.goto("/admin");
  await page.locator("#adminUsernameInput").fill("e2e-admin");
  await page.locator("#adminPasswordInput").fill("e2e-admin-password");
  await page.locator("#adminLoginButton").click();
  await expect(page.locator("#adminView")).toBeVisible();
  const row = page.locator("#adminUserList .admin-user-row", { hasText: account.email });
  await expect(row).toBeVisible();
  await row.locator('[data-admin-action="plan"]').click();
  await expect(page.locator("#confirmDialog")).toBeVisible();
  await page.locator("[data-confirm-accept]").click();
  await expect(row).toContainText("Paid");
});
