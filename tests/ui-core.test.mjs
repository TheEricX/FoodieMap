import test from "node:test";
import assert from "node:assert/strict";

import {
  classifyLayoutMode,
  createInitialUiModel,
  filterBySearch,
  minimumTargetSize,
  reduceUiState,
  surfacePresentation,
  validateTitle,
  viewPresentation
} from "../ui-core.mjs";

test("layout modes use one decision-complete breakpoint model", () => {
  assert.equal(classifyLayoutMode(390), "mobile");
  assert.equal(classifyLayoutMode(900), "mobile");
  assert.equal(classifyLayoutMode(901), "compact-desktop");
  assert.equal(classifyLayoutMode(1380), "compact-desktop");
  assert.equal(classifyLayoutMode(1381), "desktop");
});

test("shared search and title validation are presentation-independent", () => {
  const items = [{ name: "Tokyo Ramen" }, { name: "Toronto Tacos" }];
  assert.deepEqual(filterBySearch(items, " ramen ", (item) => item.name), [items[0]]);
  assert.deepEqual(validateTitle("  Dinner list  "), { valid: true, value: "Dinner list", reason: null });
  assert.equal(validateTitle(" ").reason, "required");
});

test("UI state clears transient surfaces when the active view changes", () => {
  let state = createInitialUiModel(390);
  state = reduceUiState(state, { type: "surface.opened", surface: "recipe-editor" });
  state = reduceUiState(state, { type: "view.changed", view: "recipes" });
  assert.equal(state.activeView, "recipes");
  assert.equal(state.openSurface, null);
});

test("mobile and desktop share content but choose different containers", () => {
  assert.equal(viewPresentation("my-map", "mobile").navigation, "bottom");
  assert.equal(viewPresentation("my-map", "desktop").navigation, "top");
  assert.equal(surfacePresentation("mobile", "modal"), "mobile-task");
  assert.equal(surfacePresentation("desktop", "modal"), "desktop-modal");
  assert.equal(minimumTargetSize("mobile"), 44);
});
