import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "./fixtures.mjs";

test("@accessibility @cross-browser signed-out entry has no detectable accessibility violations", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await expect(page.locator("#loginView")).toBeVisible();

  const results = await new AxeBuilder({ page })
    .include("#loginView")
    .analyze();

  expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
});
