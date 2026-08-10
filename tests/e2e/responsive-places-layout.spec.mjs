import { test, expect } from "./fixtures.mjs";

const mobileWidths = [320, 375, 390, 430, 768];

test("@responsive places controls stay singular, reachable, and inside every mobile viewport", async ({ signedInPage: page }) => {
  const created = await page.request.post("/api/restaurants", { data: {
    name: "Responsive layout spot",
    address: "Toronto",
    lat: 43.6532,
    lng: -79.3832,
    google_url: "https://maps.apple.com/?ll=43.6532,-79.3832&q=Responsive%20layout%20spot",
    status: "want_to_go",
    visit_count: 0,
    personal_rating: 0,
    notes: ""
  }});
  expect(created.ok()).toBeTruthy();

  for (const width of mobileWidths) {
    await page.setViewportSize({ width, height: 844 });
    await page.reload();
    await page.waitForLoadState("networkidle");
    await expect(page.locator('[data-place-view="my-lists"]:visible')).toHaveCount(1);
    await expect(page.locator('[data-place-view="my-map"]:visible')).toHaveCount(1);
    await expect(page.locator("#locateButton")).toBeHidden();

    const layout = await page.evaluate(() => {
      const rect = (selector) => document.querySelector(selector)?.getBoundingClientRect();
      const map = rect("#cuteMap");
      const nav = rect(".mobile-bottom-nav");
      const controls = rect(".map-zoom-controls");
      const add = rect("#mobileQuickCaptureButton");
      return {
        viewport: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        map,
        nav,
        controls,
        add,
      };
    });
    expect(layout.scrollWidth).toBeLessThanOrEqual(layout.viewport + 1);
    expect(layout.map.left).toBeGreaterThanOrEqual(0);
    expect(layout.map.right).toBeLessThanOrEqual(layout.viewport);
    expect(layout.controls.left).toBeGreaterThanOrEqual(layout.map.left);
    expect(layout.controls.top).toBeGreaterThanOrEqual(layout.map.top);
    expect(layout.controls.right).toBeLessThanOrEqual(layout.map.right);
    expect(layout.nav.left).toBeGreaterThanOrEqual(0);
    expect(layout.nav.right).toBeLessThanOrEqual(layout.viewport);
    expect(layout.add.height).toBeGreaterThanOrEqual(40);
  }
});

test("@responsive @cross-browser mobile list filters never overlap saved-place content", async ({ signedInPage: page }) => {
  const created = await page.request.post("/api/restaurants", { data: {
    name: "Mobile list geometry spot",
    address: "Toronto",
    lat: 43.6532,
    lng: -79.3832,
    google_url: "https://maps.apple.com/?ll=43.6532,-79.3832&q=Mobile%20list%20geometry%20spot",
    status: "want_to_go",
    visit_count: 0,
    personal_rating: 0,
    notes: ""
  }});
  expect(created.ok()).toBeTruthy();

  for (const width of mobileWidths) {
    await page.setViewportSize({ width, height: 844 });
    await page.reload();
    await page.waitForLoadState("networkidle");
    await page.locator('[data-place-view="my-lists"]:visible').click();
    await expect(page.locator("#listsView")).toBeVisible();

    const layout = await page.evaluate(() => {
      const rect = (selector) => document.querySelector(selector)?.getBoundingClientRect();
      const header = rect("#listsView .place-list-header");
      const filters = rect("#listsView .mobile-list-bar");
      const detail = rect("#myListDetail");
      const nav = rect(".mobile-bottom-nav");
      return {
        viewport: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        header,
        filters,
        detail,
        nav,
        documentScrollHeight: document.documentElement.scrollHeight,
        detailOverflow: getComputedStyle(document.querySelector("#myListDetail")).overflowY,
      };
    });

    expect(layout.scrollWidth).toBeLessThanOrEqual(layout.viewport + 1);
    expect(layout.filters.top).toBeGreaterThanOrEqual(layout.header.bottom + 7);
    expect(layout.detail.top).toBeGreaterThanOrEqual(layout.filters.bottom + 7);
    expect(layout.detailOverflow).toBe("visible");
    expect(layout.documentScrollHeight).toBeGreaterThan(layout.nav.bottom);
  }
});

test("@responsive desktop preserves one places switcher without mobile controls", async ({ signedInPage: page }) => {
  for (const width of [1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.reload();
    await page.waitForLoadState("networkidle");
    await expect(page.locator('[data-place-view="my-lists"]:visible')).toHaveCount(1);
    await expect(page.locator(".mobile-place-view-switcher")).toBeHidden();
    await expect(page.locator(".mobile-bottom-nav")).toBeHidden();
  }
});
