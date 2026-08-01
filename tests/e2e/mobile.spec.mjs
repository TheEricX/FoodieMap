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
          shellRight: shell.right,
          bottomNavLeft: document.querySelector(".mobile-bottom-nav").getBoundingClientRect().left,
          bottomNavRight: document.querySelector(".mobile-bottom-nav").getBoundingClientRect().right,
        };
      });
      expect(layout.scrollX).toBe(0);
      expect(layout.documentScrollWidth).toBeLessThanOrEqual(layout.viewportWidth + 1);
      expect(layout.shellLeft).toBeGreaterThanOrEqual(0);
      expect(layout.shellRight).toBeLessThanOrEqual(layout.viewportWidth);
      expect(Math.abs(layout.shellLeft - (layout.viewportWidth - layout.shellRight))).toBeLessThanOrEqual(1);
      expect(layout.bottomNavLeft).toBeGreaterThanOrEqual(0);
      expect(layout.bottomNavRight).toBeLessThanOrEqual(layout.viewportWidth);
      expect(Math.abs(layout.bottomNavLeft - (layout.viewportWidth - layout.bottomNavRight))).toBeLessThanOrEqual(1);
      await expect(page.locator(".desktop-primary-nav")).toBeHidden();
      await expect(page.locator(".mobile-bottom-nav")).toBeVisible();
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
});

test("@mobile hidden toast stays hidden and Discovery resets its inner scroll", async ({ signedInPage: page }) => {
  await expect(page.locator("#appToast")).toBeHidden();
  await page.locator('[data-view="discovery"]:visible').first().tap();
  const discoveryGrid = page.locator("#discoveryGrid");
  await expect(discoveryGrid).toHaveClass(/is-empty/);
  const horizontalOverflow = await discoveryGrid.evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
  }));
  expect(horizontalOverflow.scrollWidth).toBeLessThanOrEqual(horizontalOverflow.clientWidth);
  await discoveryGrid.evaluate((element) => {
    element.scrollLeft = 80;
  });
  await expect.poll(() => discoveryGrid.evaluate((element) => element.scrollLeft)).toBe(0);

  const discoveryLayout = page.locator("#discoveryView .discovery-layout");
  const canScrollDiscovery = await discoveryLayout.evaluate((element) => element.scrollHeight > element.clientHeight);
  if (canScrollDiscovery) {
    await discoveryLayout.evaluate((element) => {
      element.scrollTop = 80;
    });
    await expect.poll(() => discoveryLayout.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  }

  await page.locator('[data-view="my-map"]:visible').first().tap();
  await page.locator('[data-view="discovery"]:visible').first().tap();
  await expect.poll(() => discoveryLayout.evaluate((element) => element.scrollTop)).toBe(0);
  await expect(page.locator("#appToast")).toBeHidden();
});

test("@mobile recipe empty-state guidance is text, not a fake button", async ({ signedInPage: page }) => {
  await page.locator('[data-view="recipes"]:visible').first().tap();
  const emptyState = page.locator("#recipeList .empty-info-panel");
  await expect(emptyState).toBeVisible();
  await expect(emptyState.getByText("Add your first recipe")).toBeVisible();
  await expect(emptyState.getByText("Save a dish you cooked, then add a photo, ingredients, and steps.")).toBeVisible();
  await expect(emptyState.locator("button")).toHaveCount(0);
});

test("@mobile empty map prioritizes direct restaurant capture", async ({ signedInPage: page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator("#emptyMap")).toBeVisible();
  await expect(page.locator("#emptyMapAddButton")).toBeVisible();
  await expect(page.locator("#emptyMapPasteButton")).toBeVisible();
  await expect(page.locator(".mobile-map-bar")).toBeVisible();
  await expect(page.locator(".mobile-map-bar .mobile-place-view-switcher")).toBeVisible();
  await expect(page.locator(".mobile-map-bar .mobile-filter-chips")).toBeHidden();
  await expect(page.locator(".map-nearest-panel")).toBeHidden();
  await page.locator("#emptyMapAddButton").tap();
  await expect(page.locator("#addDialog")).toBeVisible();
  await page.locator("#closeAddPanel").tap();
  await page.locator("#emptyMapPasteButton").tap();
  await expect(page.locator("#addDialog")).toBeVisible();
});

test("@mobile recipes use a single-detail flow instead of stacked list and detail panes", async ({ signedInPage: page }) => {
  const create = await page.request.post("/api/recipes", { data: {
    title: "Mobile detail flow recipe",
    rating: 4.5,
    cooked_at: Math.floor(Date.now() / 1000),
    ingredients: "Eggs, noodles",
    steps: "Cook and serve",
    notes: ""
  }});
  expect(create.ok()).toBeTruthy();

  await page.locator('[data-view="recipes"]:visible').first().tap();
  await expect(page.locator("#recipeList [data-recipe-id]")).toHaveCount(1);
  await page.locator("#recipeList [data-recipe-id]").tap();

  await expect(page.locator("#recipesView")).toHaveClass(/mobile-detail-open/);
  await expect(page.locator("#recipesView .recipes-panel")).toBeHidden();
  await expect(page.locator("#recipeDetail")).toBeVisible();
  await expect(page.locator("[data-back-recipe-list]")).toBeVisible();

  await page.locator("[data-back-recipe-list]").tap();
  await expect(page.locator("#recipesView")).not.toHaveClass(/mobile-detail-open/);
  await expect(page.locator("#recipesView .recipes-panel")).toBeVisible();
});

test("@mobile restaurant marker opens the detail sheet and closes with one tap", async ({ signedInPage: page }) => {
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
  await expect(page.locator("#spotDetailDialog")).toBeVisible();
  await page.locator("#closeSpotDetail").tap();
  await expect(page.locator("#spotDetailDialog")).toBeHidden();
});

test("@mobile quick capture opens with only the essential restaurant fields", async ({ signedInPage: page }) => {
  await page.locator("#mobileQuickCaptureButton").tap();
  await expect(page.locator("#addDialog")).toBeVisible();
  await expect(page.locator("#restaurantAdvancedFields")).toBeHidden();
  await expect(page.locator('#restaurantForm select[name="status"]')).toHaveValue("want_to_go");
  await expect(page.locator('#restaurantForm input[name="personalRating"]')).toHaveValue("0");
  await page.locator("#toggleRestaurantDetails").tap();
  await expect(page.locator("#restaurantAdvancedFields")).toBeVisible();
});

test("@mobile list and recipe capture keep optional fields out of the first task", async ({ signedInPage: page }) => {
  await page.locator('[data-view="my-lists"]:visible').first().tap();
  await page.locator("#mobileMyListDrawer > summary").tap();
  await page.locator("#mobileMyListDrawer [data-mobile-create-list]").tap();
  await expect(page.locator("#listAdvancedFields")).toBeHidden();
  await page.locator("#toggleListDetails").tap();
  await expect(page.locator("#listAdvancedFields")).toBeVisible();
  await page.locator("#cancelListButton").tap();

  await page.locator('[data-view="recipes"]:visible').first().tap();
  await page.locator("#openRecipeDialog").tap();
  await expect(page.locator("#recipeAdvancedFields")).toBeHidden();
  await expect(page.locator('#recipeForm input[name="rating"]')).toHaveValue("0");
  await page.locator("#toggleRecipeDetails").tap();
  await expect(page.locator("#recipeAdvancedFields")).toBeVisible();
  await page.locator("#cancelRecipeButton").tap();
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
  await page.locator("#toggleRecipeDetails").tap();
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
