import { test, expect } from "./fixtures.mjs";

test("@mobile bottom navigation is single-tap responsive without horizontal overflow", async ({ signedInPage: page }) => {
  for (const width of [390, 430, 750]) {
    await page.setViewportSize({ width, height: 844 });
    await expect(page.locator("body")).toHaveAttribute("data-layout", "mobile");
    for (const [view, panel] of [
      ["my-lists", "#listsView"],
      ["recipes", "#recipesView"],
      ["discovery", "#discoveryView"],
      ["my-map", "#mapView"]
    ]) {
      await page.locator(`[data-view="${view}"]:visible`).first().tap();
      await expect(page.locator(panel)).toBeVisible();
      const layout = await page.evaluate(() => {
        window.scrollTo(100, 0);
        const shell = document.querySelector(".app-shell").getBoundingClientRect();
        return {
          scrollX: window.scrollX,
          documentScrollWidth: document.documentElement.scrollWidth,
          viewportWidth: document.documentElement.clientWidth,
          shellLeft: shell.left,
          shellRight: shell.right
        };
      });
      expect(layout.scrollX).toBe(0);
      expect(layout.documentScrollWidth).toBeLessThanOrEqual(layout.viewportWidth + 1);
      expect(layout.shellLeft).toBeGreaterThanOrEqual(0);
      expect(layout.shellRight).toBeLessThanOrEqual(layout.viewportWidth);
      await expect(page.locator(".desktop-primary-nav")).toBeHidden();
      await expect(page.locator(".mobile-bottom-nav")).toBeVisible();
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
});

test("@mobile recipe empty-state guidance is text, not a fake button", async ({ signedInPage: page }) => {
  await page.locator('[data-view="recipes"]:visible').first().tap();
  const emptyState = page.locator("#recipeList .empty-info-panel");
  await expect(emptyState).toBeVisible();
  await expect(emptyState.getByText("Add your first recipe")).toBeVisible();
  await expect(emptyState.getByText("Save a dish you cooked, then add a photo, ingredients, and steps.")).toBeVisible();
  await expect(emptyState.locator("button")).toHaveCount(0);
});

test("@mobile restaurant detail closes with one tap", async ({ signedInPage: page }) => {
  const create = await page.request.post("/api/restaurants", { data: {
    name: "E2E Mobile Close",
    address: "Toronto",
    lat: 43.6532,
    lng: -79.3832,
    google_url: "https://maps.apple.com/?ll=43.6532,-79.3832&q=E2E%20Mobile%20Close",
    status: "want_to_go",
    visit_count: 0,
    personal_rating: 0,
    notes: ""
  }});
  expect(create.ok()).toBeTruthy();
  const restaurant = (await create.json()).restaurant;
  await page.reload();
  await page.waitForLoadState("networkidle");
  await page.locator("#markersLayer .restaurant-marker").first().tap();
  const cardLayout = await page.locator("#spotCard").evaluate((card) => ({
    clientWidth: card.clientWidth,
    scrollWidth: card.scrollWidth,
    overflowX: getComputedStyle(card).overflowX,
    touchAction: getComputedStyle(card).touchAction
  }));
  expect(cardLayout.scrollWidth).toBeLessThanOrEqual(cardLayout.clientWidth);
  expect(["clip", "hidden"]).toContain(cardLayout.overflowX);
  expect(cardLayout.touchAction).toBe("pan-y");
  await page.locator("#openSpotDetail").tap();
  await expect(page.locator("#spotDetailDialog")).toBeVisible();
  await page.locator("#closeSpotDetail").tap();
  await expect(page.locator("#spotDetailDialog")).toBeHidden();
});

test("@mobile long form dialogs stay horizontally locked", async ({ signedInPage: page }) => {
  for (const width of [390, 720, 750, 844, 900]) {
    await page.setViewportSize({ width, height: 844 });
    await page.evaluate(() => document.querySelector("#recipeDialog").showModal());
    const layout = await page.locator("#recipeDialog").evaluate((dialog) => {
      window.scrollTo(100, 0);
      const card = dialog.querySelector(".modal-card");
      const actions = dialog.querySelector(".form-actions");
      const bounds = dialog.getBoundingClientRect();
      const actionBounds = actions.getBoundingClientRect();
      return {
        windowScrollX: window.scrollX,
        documentScrollWidth: document.documentElement.scrollWidth,
        viewportWidth: document.documentElement.clientWidth,
        dialogLeft: bounds.left,
        dialogRight: bounds.right,
        dialogWidth: bounds.width,
        actionsLeft: actionBounds.left,
        actionsRight: actionBounds.right,
        cardOverflowX: getComputedStyle(card).overflowX,
        cardTouchAction: getComputedStyle(card).touchAction
      };
    });
    expect(layout.windowScrollX).toBe(0);
    expect(layout.documentScrollWidth).toBeLessThanOrEqual(layout.viewportWidth);
    expect(layout.dialogLeft).toBe(0);
    expect(layout.dialogRight).toBe(layout.viewportWidth);
    expect(layout.dialogWidth).toBe(layout.viewportWidth);
    expect(layout.actionsLeft).toBe(0);
    expect(layout.actionsRight).toBe(layout.viewportWidth);
    expect(["clip", "hidden"]).toContain(layout.cardOverflowX);
    expect(layout.cardTouchAction).toBe("pan-y");
    await page.evaluate(() => document.querySelector("#recipeDialog").close());
  }

  await page.setViewportSize({ width: 390, height: 844 });
  const dialogs = [
    ["#addDialog", "#restaurantForm"],
    ["#listDialog", "#listForm"],
    ["#recipeDialog", "#recipeForm"],
    ["#settingsDialog", "#settingsForm"]
  ];
  for (const [dialogSelector, formSelector] of dialogs) {
    await page.evaluate((selector) => document.querySelector(selector).showModal(), dialogSelector);
    await expect(page.locator(dialogSelector)).toHaveAttribute("data-presentation", "mobile-task");
    const dimensions = await page.locator(formSelector).evaluate((form) => ({
      clientWidth: form.clientWidth,
      scrollWidth: form.scrollWidth,
      left: form.getBoundingClientRect().left,
      right: form.getBoundingClientRect().right,
      viewport: document.documentElement.clientWidth
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
    expect(dimensions.left).toBeGreaterThanOrEqual(0);
    expect(dimensions.right).toBeLessThanOrEqual(dimensions.viewport);
    await page.evaluate((selector) => document.querySelector(selector).close(), dialogSelector);
  }

  await page.evaluate(() => document.querySelector("#recipeDialog").showModal());
  const recipeForm = page.locator("#recipeForm");
  await recipeForm.locator('textarea[name="ingredients"]').fill("A".repeat(240));
  await expect(recipeForm.locator('textarea[name="ingredients"]')).toHaveCSS("resize", "none");
  const before = await recipeForm.evaluate((form) => ({ left: form.getBoundingClientRect().left, scrollLeft: form.scrollLeft }));
  await page.evaluate(() => {
    const dialog = document.querySelector("#recipeDialog");
    dialog.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
  await expect(page.locator("#recipeDialog")).toBeVisible();
  const after = await recipeForm.evaluate((form) => ({
    left: form.getBoundingClientRect().left,
    scrollLeft: form.scrollLeft,
    scrollWidth: form.scrollWidth,
    clientWidth: form.clientWidth
  }));
  expect(after.left).toBe(before.left);
  expect(after.scrollLeft).toBe(0);
  expect(after.scrollWidth).toBeLessThanOrEqual(after.clientWidth);
  await page.locator("#closeRecipeDialog").tap();
  await expect(page.locator("#confirmDialog")).toBeVisible();
  await page.locator("[data-confirm-cancel]").tap();
  await expect(page.locator("#recipeDialog")).toBeVisible();
  await expect(recipeForm.locator('textarea[name="ingredients"]')).toHaveValue("A".repeat(240));
  await page.locator("#closeRecipeDialog").tap();
  const confirmLayout = await page.locator("#confirmDialog .confirm-card").evaluate((card) => ({
    left: card.getBoundingClientRect().left,
    right: card.getBoundingClientRect().right,
    viewport: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth
  }));
  expect(confirmLayout.left).toBeGreaterThanOrEqual(0);
  expect(confirmLayout.right).toBeLessThanOrEqual(confirmLayout.viewport);
  expect(confirmLayout.scrollWidth).toBeLessThanOrEqual(confirmLayout.viewport);
  await page.locator("[data-confirm-accept]").tap();
  await expect(page.locator("#recipeDialog")).toBeHidden();
});

test("@mobile list task preserves unsaved input until discard is confirmed", async ({ signedInPage: page }) => {
  await page.locator('[data-view="my-lists"]:visible').first().tap();
  await page.locator("#mobileMyListDrawer > summary").tap();
  await page.locator("#mobileMyListDrawer [data-mobile-create-list]").tap();
  await page.locator('#listForm input[name="title"]').fill("Unsaved weekend list");
  await page.locator("#cancelListButton").tap();
  await expect(page.locator("#confirmDialog")).toBeVisible();
  await page.locator("[data-confirm-cancel]").tap();
  await expect(page.locator("#listDialog")).toBeVisible();
  await expect(page.locator('#listForm input[name="title"]')).toHaveValue("Unsaved weekend list");
  await page.locator("#cancelListButton").tap();
  await page.locator("[data-confirm-accept]").tap();
  await expect(page.locator("#listDialog")).toBeHidden();
});

test("@mobile recipe task swipe shares the same discard protection as the close button", async ({ signedInPage: page }) => {
  await page.locator('[data-view="recipes"]:visible').first().tap();
  await page.locator("#openRecipeDialog").tap();
  await page.locator('#recipeForm input[name="title"]').fill("Swipe discard check");
  await page.evaluate(() => {
    const head = document.querySelector("#recipeModalHead");
    const form = document.querySelector("#recipeForm");
    const pointer = (type, target, clientY) => target.dispatchEvent(new PointerEvent(type, {
      bubbles: true,
      pointerId: 31,
      button: 0,
      clientX: 120,
      clientY,
    }));
    pointer("pointerdown", head, 100);
    pointer("pointermove", form, 250);
    pointer("pointerup", form, 250);
  });
  await expect(page.locator("#confirmDialog")).toBeVisible();
  await page.locator("[data-confirm-cancel]").tap();
  await expect(page.locator("#recipeDialog")).toBeVisible();
  await expect(page.locator('#recipeForm input[name="title"]')).toHaveValue("Swipe discard check");
  await page.locator("#closeRecipeDialog").tap();
  await page.locator("[data-confirm-accept]").tap();
  await expect(page.locator("#recipeDialog")).toBeHidden();
});
