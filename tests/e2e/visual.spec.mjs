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
