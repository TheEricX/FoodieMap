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

test("@mobile selected-map tab clears the centred bottom navigation", async ({ signedInPage: page }) => {
  await page.setViewportSize({ width: 430, height: 932 });
  const created = await page.request.post("/api/restaurants", { data: {
    name: "Mobile navigation clearance",
    address: "Toronto",
    lat: 43.6532,
    lng: -79.3832,
    google_url: "https://maps.apple.com/?ll=43.6532,-79.3832&q=Mobile%20navigation%20clearance",
    status: "want_to_go",
    visit_count: 0,
    personal_rating: 0,
    notes: ""
  }});
  expect(created.ok()).toBeTruthy();
  await page.reload();
  await page.waitForLoadState("networkidle");
  await expect(page.locator("#spotCardTab")).toBeVisible();

  const layout = await page.evaluate(() => {
    const rect = (selector) => {
      const box = document.querySelector(selector).getBoundingClientRect();
      return { left: box.left, right: box.right, top: box.top, bottom: box.bottom, width: box.width };
    };
    const nav = rect(".mobile-bottom-nav");
    const links = Array.from(document.querySelectorAll(".mobile-bottom-nav a")).map((link) => {
      const box = link.getBoundingClientRect();
      return { left: box.left, width: box.width };
    });
    return { nav, tab: rect("#spotCardTab"), links };
  });
  expect(layout.tab.bottom).toBeLessThanOrEqual(layout.nav.top - 28);
  expect(layout.links).toHaveLength(3);
  expect(Math.abs(layout.links[0].left - layout.nav.left - 5)).toBeLessThanOrEqual(1);
  expect(Math.abs(layout.links[0].width - layout.links[1].width)).toBeLessThanOrEqual(1);
  expect(Math.abs(layout.links[1].width - layout.links[2].width)).toBeLessThanOrEqual(1);
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
  await page.locator("#toggleRestaurantDetails").tap();
  const addFormLayout = await page.locator("#restaurantForm").evaluate((form) => {
    const content = form.querySelector(".restaurant-form-content");
    const actions = form.querySelector(".form-actions");
    const lastField = form.querySelector('[name="notes"]');
    content.scrollTop = content.scrollHeight;
    return {
      contentCanScroll: content.scrollHeight > content.clientHeight,
      actionsTop: actions.getBoundingClientRect().top,
      actionsBottom: actions.getBoundingClientRect().bottom,
      lastFieldBottom: lastField.getBoundingClientRect().bottom,
      viewportHeight: window.innerHeight,
    };
  });
  expect(addFormLayout.contentCanScroll).toBeTruthy();
  expect(addFormLayout.lastFieldBottom).toBeLessThanOrEqual(addFormLayout.actionsTop - 12);
  expect(addFormLayout.actionsBottom).toBeLessThanOrEqual(addFormLayout.viewportHeight + 1);
  await page.locator("#closeAddPanel").tap();
  await page.locator("#emptyMapPasteButton").tap();
  await expect(page.locator("#addDialog")).toBeVisible();
});

test("@mobile empty favorites explains the state and recovers to all places", async ({ signedInPage: page }) => {
  const created = await page.request.post("/api/restaurants", { data: {
    name: "Not a favorite yet",
    address: "Toronto",
    lat: 43.6532,
    lng: -79.3832,
    google_url: "https://maps.apple.com/?ll=43.6532,-79.3832&q=Not%20a%20favorite%20yet",
    status: "want_to_go",
    visit_count: 0,
    personal_rating: 0,
    notes: ""
  }});
  expect(created.ok()).toBeTruthy();
  await page.reload();
  await page.waitForLoadState("networkidle");

  await page.locator('.mobile-map-bar [data-filter="favorite"]').tap();
  await expect(page.locator("#emptyMap")).toBeVisible();
  await expect(page.locator("#emptyMapTitle")).toHaveText("No favorites yet");
  await expect(page.locator("#emptyMapBody")).toContainText("Mark a place as Favorite");
  await expect(page.locator("#emptyMapViewAllButton")).toBeVisible();
  await page.locator("#emptyMapViewAllButton").tap();
  await expect(page.locator("#emptyMap")).toBeHidden();
  await expect(page.locator('.mobile-map-bar [data-filter="all"]')).toHaveClass(/active/);
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

test("@mobile restaurant detail uses browser history so an edge-back gesture closes it", async ({ signedInPage: page }) => {
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
  await expect(page).toHaveURL(new RegExp(`spot=${restaurant.id}`));
  await page.goBack();
  await expect(page.locator("#spotDetailDialog")).toBeHidden();
  await expect(page).not.toHaveURL(/(?:\?|&)spot=/);
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

test("@mobile an incoming Maps link opens a prefilled quick capture", async ({ signedInPage: page }) => {
  const mapUrl = "https://www.google.com/maps/place/Gui+Gui+Korean+skewer+BBQ,+5935+Yonge+St,+North+York,+ON+M2M+2E4/@43.7891,-79.4168,15z";
  await page.goto(`/?import-map=${encodeURIComponent(mapUrl)}`);
  await page.waitForLoadState("networkidle");
  await expect(page.locator("#addDialog")).toBeVisible();
  await expect(page.locator('#restaurantForm input[name="googleUrl"]')).toHaveValue(mapUrl);
  await expect(page.locator('#restaurantForm input[name="name"]')).toHaveValue("Gui Gui Korean skewer BBQ");
  await expect(page.locator("#quickCaptureIntro")).toContainText("Maps link was sent");
  await expect(page).not.toHaveURL(/import-map/);
});

test("@mobile a restored confirmation dialog is cleared when the page becomes visible", async ({ signedInPage: page }) => {
  const restoredDialogs = await page.evaluate(() => {
    const dialogIds = ["confirmDialog", "spotDetailDialog"];
    return dialogIds.filter((id) => {
      const dialog = document.querySelector(`#${id}`);
      dialog.showModal();
      window.dispatchEvent(new PageTransitionEvent("pageshow", { persisted: true }));
      return dialog.open;
    });
  });
  expect(restoredDialogs).toEqual([]);
  await expect(page.locator("#confirmDialog")).toBeHidden();
  await expect(page.locator("#spotDetailDialog")).toBeHidden();
});

test("@mobile map choice is a compact bottom sheet", async ({ signedInPage: page }) => {
  await page.setViewportSize({ width: 430, height: 932 });
  await page.evaluate(() => document.querySelector("#mapChoiceDialog").showModal());
  const layout = await page.locator("#mapChoiceDialog .map-choice-card").evaluate((card) => {
    const bounds = card.getBoundingClientRect();
    return {
      bottom: bounds.bottom,
      height: bounds.height,
      viewportHeight: window.innerHeight,
    };
  });
  expect(Math.abs(layout.bottom - layout.viewportHeight)).toBeLessThanOrEqual(1);
  expect(layout.height).toBeLessThanOrEqual(290);
  await expect(page.locator("#openGoogleMapChoice")).toBeVisible();
  await expect(page.locator("#openAppleMapChoice")).toBeVisible();
  await page.locator("#closeMapChoiceDialog").tap();
  await expect(page.locator("#mapChoiceDialog")).toBeHidden();
});

test("@mobile new recipe is a compact sheet and expands into one scrollable editor", async ({ signedInPage: page }) => {
  await page.setViewportSize({ width: 430, height: 932 });
  await page.locator('[data-view="recipes"]:visible').first().tap();
  await page.locator("#openRecipeDialog").tap();
  const compactLayout = await page.locator("#recipeForm").evaluate((form) => {
    const bounds = form.getBoundingClientRect();
    const details = form.querySelector("#toggleRecipeDetails").getBoundingClientRect();
    return { bottom: bounds.bottom, height: bounds.height, viewportHeight: window.innerHeight, detailsHeight: details.height };
  });
  expect(Math.abs(compactLayout.bottom - compactLayout.viewportHeight)).toBeLessThanOrEqual(1);
  expect(compactLayout.height).toBeLessThanOrEqual(500);
  expect(compactLayout.detailsHeight).toBeLessThanOrEqual(48);

  await page.locator("#toggleRecipeDetails").tap();
  const expandedLayout = await page.locator("#recipeForm .recipe-form-body").evaluate((body) => ({
    clientHeight: body.clientHeight,
    scrollHeight: body.scrollHeight,
    overflowY: getComputedStyle(body).overflowY,
  }));
  expect(expandedLayout.scrollHeight).toBeGreaterThan(expandedLayout.clientHeight);
  expect(expandedLayout.overflowY).toBe("auto");
});

test("@mobile Map and List share one compact places toolbar on iPhone 16 Pro Max", async ({ signedInPage: page }) => {
  await page.setViewportSize({ width: 430, height: 932 });
  const mapToolbar = await page.locator("#mapView .mobile-place-view-switcher").evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { left: rect.left, width: rect.width };
  });
  await page.locator('[data-view="my-lists"]:visible').first().tap();
  const layout = await page.evaluate(() => {
    const bounds = (selector) => {
      const rect = document.querySelector(selector).getBoundingClientRect();
      return { left: rect.left, right: rect.right, width: rect.width, center: rect.left + rect.width / 2 };
    };
    return {
      viewportWidth: window.innerWidth,
      quickCapture: bounds("#mobileQuickCaptureButton"),
      switcher: bounds("#listsView .place-view-switcher"),
      map: bounds('#listsView [data-place-view="my-map"]'),
      list: bounds('#listsView [data-place-view="my-lists"]'),
    };
  });
  expect(layout.quickCapture.right).toBeLessThanOrEqual(layout.viewportWidth);
  expect(layout.switcher.left).toBeGreaterThanOrEqual(0);
  expect(layout.switcher.right).toBeLessThanOrEqual(layout.viewportWidth);
  expect(Math.abs(layout.switcher.left - mapToolbar.left)).toBeLessThanOrEqual(1);
  expect(Math.abs(layout.switcher.width - mapToolbar.width)).toBeLessThanOrEqual(1);
  expect(Math.abs(layout.map.width - layout.list.width)).toBeLessThanOrEqual(1);
  expect(Math.abs(layout.map.center + layout.list.center - 2 * layout.switcher.center)).toBeLessThanOrEqual(1);
  const hiddenTitle = await page.locator("#listsView .place-list-header > div:first-child").evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  });
  expect(hiddenTitle.width).toBeLessThanOrEqual(1);
  expect(hiddenTitle.height).toBeLessThanOrEqual(1);
  await expect(page.locator("#myListDetail [data-view-system-map]")).toBeHidden();
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
    expect(layout.actionsLeft).toBeLessThanOrEqual(1);
    expect(layout.actionsRight).toBeGreaterThanOrEqual(layout.viewportWidth - 1);
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
    top: card.getBoundingClientRect().top,
    bottom: card.getBoundingClientRect().bottom,
    viewport: document.documentElement.clientWidth,
    viewportHeight: window.innerHeight,
    scrollWidth: document.documentElement.scrollWidth
  }));
  expect(confirmLayout.left).toBeGreaterThanOrEqual(0);
  expect(confirmLayout.right).toBeLessThanOrEqual(confirmLayout.viewport);
  expect(confirmLayout.scrollWidth).toBeLessThanOrEqual(confirmLayout.viewport);
  expect(confirmLayout.bottom).toBe(confirmLayout.viewportHeight);
  expect(confirmLayout.top).toBeGreaterThan(0);
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

test("@mobile @cross-browser recipe editor keeps actions clear, closes after update, and supports left swipe", async ({ signedInPage: page }) => {
  await page.setViewportSize({ width: 430, height: 932 });
  let updateRequests = 0;
  page.on("request", (request) => {
    if (request.method() === "PATCH" && /\/api\/recipes\//.test(request.url())) updateRequests += 1;
  });
  const created = await page.request.post("/api/recipes", { data: {
    title: "Mobile editor original",
    rating: 4,
    cooked_at: Math.floor(Date.now() / 1000),
    ingredients: "Chicken, coconut milk, curry",
    steps: "Cook until tender",
    notes: "Keep the footer away from this note"
  }});
  expect(created.ok()).toBeTruthy();
  await page.reload();
  await page.waitForLoadState("networkidle");
  await page.locator('[data-view="recipes"]:visible').first().click();
  await page.locator("#recipeList [data-recipe-id]").filter({ hasText: "Mobile editor original" }).click();
  await page.locator("[data-edit-recipe]").click();

  const layout = await page.locator("#recipeForm").evaluate((form) => {
    const body = form.querySelector(".recipe-form-body");
    const actions = form.querySelector(".form-actions");
    body.scrollTop = body.scrollHeight;
    const bodyBox = body.getBoundingClientRect();
    const actionsBox = actions.getBoundingClientRect();
    const notesBox = form.elements.notes.getBoundingClientRect();
    return {
      bodyBottom: bodyBox.bottom,
      actionsTop: actionsBox.top,
      actionsBottom: actionsBox.bottom,
      notesBottom: notesBox.bottom,
      viewportHeight: window.innerHeight,
      bodyScrollable: body.scrollHeight > body.clientHeight
    };
  });
  expect(Math.abs(layout.bodyBottom - layout.actionsTop)).toBeLessThanOrEqual(1);
  expect(layout.notesBottom).toBeLessThanOrEqual(layout.actionsTop + 1);
  expect(layout.actionsBottom).toBeLessThanOrEqual(layout.viewportHeight + 1);
  expect(layout.bodyScrollable).toBeTruthy();

  await page.locator("#recipeDialog").evaluate((dialog) => {
    dialog.testNativeClose = dialog.close.bind(dialog);
    dialog.close = () => { throw new DOMException("Simulated Safari close failure", "InvalidStateError"); };
  });
  await page.locator('#recipeForm input[name="title"]').fill("Mobile editor updated");
  await page.locator("#saveRecipeButton").click();
  await expect(page.locator("#recipeDialog")).toBeHidden();
  await expect(page.locator("#recipeDetail")).toContainText("Mobile editor updated");
  expect(updateRequests).toBe(1);

  await page.locator("#recipeDialog").evaluate((dialog) => {
    dialog.close = dialog.testNativeClose;
    delete dialog.testNativeClose;
  });

  await page.locator("[data-edit-recipe]").click();
  await page.evaluate(() => {
    const body = document.querySelector("#recipeForm .recipe-form-body");
    const form = document.querySelector("#recipeForm");
    const pointer = (type, target, clientX) => target.dispatchEvent(new PointerEvent(type, {
      bubbles: true,
      pointerId: 41,
      button: 0,
      clientX,
      clientY: 420,
    }));
    pointer("pointerdown", body, 260);
    pointer("pointermove", form, 120);
    pointer("pointerup", form, 120);
  });
  await expect(page.locator("#recipeDialog")).toBeHidden();
});

test("@mobile recipe share is a compact sheet and reveals the generated result", async ({ signedInPage: page }) => {
  await page.setViewportSize({ width: 430, height: 932 });
  const created = await page.request.post("/api/recipes", { data: {
    title: "Mobile share sheet",
    rating: 4,
    cooked_at: Math.floor(Date.now() / 1000),
    ingredients: "Tomato, egg",
    steps: "Cook",
    notes: ""
  }});
  expect(created.ok()).toBeTruthy();
  await page.reload();
  await page.waitForLoadState("networkidle");
  await page.locator('[data-view="recipes"]:visible').first().tap();
  await page.locator("#recipeList [data-recipe-id]").filter({ hasText: "Mobile share sheet" }).tap();
  await page.locator("[data-share-recipe]").tap();

  const compact = await page.locator("#recipeShareForm").evaluate((form) => {
    const bounds = form.getBoundingClientRect();
    const buttons = [...form.querySelectorAll(".share-actions button:not([hidden])")].map((button) => button.getBoundingClientRect());
    return {
      bottom: bounds.bottom,
      height: bounds.height,
      viewportHeight: window.innerHeight,
      buttonHeights: buttons.map((button) => button.height)
    };
  });
  expect(Math.abs(compact.bottom - compact.viewportHeight)).toBeLessThanOrEqual(1);
  expect(compact.height).toBeLessThanOrEqual(380);
  expect(compact.buttonHeights.every((height) => height >= 48 && height <= 64)).toBeTruthy();
  await expect(page.locator("#copyRecipeShareButton")).toBeDisabled();

  await page.locator("#createRecipeShareButton").tap();
  await expect(page.locator("#recipeShareResult")).toBeVisible();
  await expect(page.locator("#recipeShareUrlInput")).not.toHaveValue("");
  await expect(page.locator("#recipeShareCardImage")).toHaveAttribute("src", /card\.png/);
  await expect(page.locator("#copyRecipeShareButton")).toBeEnabled();
  await expect(page.locator("#openRecipeShareImage")).toBeVisible();
  await expect(page.locator("#downloadRecipeShareImage")).toBeVisible();
});
