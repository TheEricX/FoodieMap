import { test, expect } from "./fixtures.mjs";

test("@responsive places workspace keeps map and list as one task", async ({ signedInPage: page }) => {
  await expect(page.locator('[data-place-nav]:visible')).toHaveText(/My Places/);
  await expect(page.locator('[data-place-view="my-lists"]:visible')).toHaveCount(1);
  await expect(page.locator('[data-place-view="my-lists"]:visible').first()).toBeVisible();

  await page.locator('[data-place-view="my-lists"]:visible').first().click();
  await expect(page.getByRole("heading", { name: "Your saved places" })).toBeVisible();
  await expect(page.locator('[data-place-nav]:visible')).toHaveClass(/active/);

  await page.locator('[data-place-view="my-map"]:visible').first().click();
  await expect(page.locator("#mapView")).toBeVisible();
  await expect(page.locator('[data-place-view="my-map"]:visible')).toHaveCount(1);
  await expect(page.locator("#openAddPanel:visible, #mobileQuickCaptureButton:visible")).toBeVisible();
});

test("@responsive discovery is public-only and recipes have a labelled add action", async ({ signedInPage: page }) => {
  await page.locator('[data-view="discovery"]:visible').first().click();
  await expect(page.getByRole("button", { name: "Create Share Pack" })).toBeHidden();

  await page.locator('[data-view="recipes"]:visible').first().click();
  await expect(page.getByRole("button", { name: "+ Add recipe" })).toBeVisible();
});
