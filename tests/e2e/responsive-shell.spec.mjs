import { test, expect } from "./fixtures.mjs";

test("desktop topbar stays inside the viewport across breakpoint widths", async ({ signedInPage: page }) => {
  for (const width of [1101, 1180, 1280, 1380, 1440, 1720]) {
    await page.setViewportSize({ width, height: 760 });
    await page.waitForTimeout(50);
    const layout = await page.locator(".topbar").evaluate((topbar) => {
      const avatar = topbar.querySelector(".avatar");
      const actions = topbar.querySelector(".top-actions");
      const topbarBox = topbar.getBoundingClientRect();
      const avatarBox = avatar.getBoundingClientRect();
      const actionsBox = actions.getBoundingClientRect();
      return {
        clientWidth: topbar.clientWidth,
        scrollWidth: topbar.scrollWidth,
        topbarLeft: topbarBox.left,
        topbarRight: topbarBox.right,
        actionsLeft: actionsBox.left,
        actionsRight: actionsBox.right,
        avatarLeft: avatarBox.left,
        avatarRight: avatarBox.right,
        viewportWidth: document.documentElement.clientWidth
      };
    });
    expect(layout.scrollWidth, `topbar overflow at ${width}px`).toBeLessThanOrEqual(layout.clientWidth + 1);
    expect(layout.topbarLeft).toBeGreaterThanOrEqual(0);
    expect(layout.topbarRight).toBeLessThanOrEqual(layout.viewportWidth);
    expect(layout.actionsLeft).toBeGreaterThanOrEqual(layout.topbarLeft);
    expect(layout.actionsRight).toBeLessThanOrEqual(layout.topbarRight);
    expect(layout.avatarLeft).toBeGreaterThanOrEqual(layout.topbarLeft);
    expect(layout.avatarRight).toBeLessThanOrEqual(layout.topbarRight);
  }
});
