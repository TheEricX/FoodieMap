export const UI_BREAKPOINTS = Object.freeze({
  mobileMax: 900,
  compactDesktopMax: 1380
});

export const PRIMARY_VIEWS = Object.freeze(["my-map", "my-lists", "recipes", "discovery"]);

const VIEW_META = Object.freeze({
  "my-map": { section: "map", mobileAction: "add-spot" },
  "my-lists": { section: "lists", mobileAction: "create-list" },
  recipes: { section: "recipes", mobileAction: "add-recipe" },
  discovery: { section: "discovery", mobileAction: "filter" },
  login: { section: "account", mobileAction: null },
  settings: { section: "account", mobileAction: null }
});

export function classifyLayoutMode(width) {
  const safeWidth = Number.isFinite(Number(width)) ? Number(width) : UI_BREAKPOINTS.mobileMax + 1;
  if (safeWidth <= UI_BREAKPOINTS.mobileMax) return "mobile";
  if (safeWidth <= UI_BREAKPOINTS.compactDesktopMax) return "compact-desktop";
  return "desktop";
}

export function createInitialUiModel(width = UI_BREAKPOINTS.mobileMax + 1) {
  return {
    layout: classifyLayoutMode(width),
    activeView: "my-map",
    openSurface: null
  };
}

export function reduceUiState(state, event) {
  const current = state || createInitialUiModel();
  if (!event || typeof event.type !== "string") return current;
  if (event.type === "viewport.changed") {
    return { ...current, layout: classifyLayoutMode(event.width) };
  }
  if (event.type === "view.changed") {
    return { ...current, activeView: String(event.view || "my-map"), openSurface: null };
  }
  if (event.type === "surface.opened") {
    return { ...current, openSurface: event.surface || null };
  }
  if (event.type === "surface.closed") {
    return { ...current, openSurface: null };
  }
  return current;
}

export function viewPresentation(view, layout) {
  const meta = VIEW_META[view] || { section: "other", mobileAction: null };
  return {
    ...meta,
    navigation: layout === "mobile" ? "bottom" : "top",
    detail: layout === "mobile" ? "sheet" : "panel",
    editor: layout === "mobile" ? "task" : "modal"
  };
}

export function surfacePresentation(layout, surface = "modal") {
  if (layout === "mobile") return surface === "detail" ? "mobile-sheet" : "mobile-task";
  return surface === "detail" ? "desktop-drawer" : "desktop-modal";
}

export function minimumTargetSize(layout) {
  return layout === "mobile" ? 44 : 38;
}

export function normalizeSearchTerm(value) {
  return String(value || "").trim().toLocaleLowerCase();
}

export function filterBySearch(items, term, searchableText) {
  const query = normalizeSearchTerm(term);
  if (!query) return [...items];
  return items.filter((item) => normalizeSearchTerm(searchableText(item)).includes(query));
}

export function validateTitle(value, { maxLength = 180 } = {}) {
  const title = String(value || "").trim();
  if (!title) return { valid: false, value: "", reason: "required" };
  if (title.length > maxLength) return { valid: false, value: title, reason: "too-long" };
  return { valid: true, value: title, reason: null };
}
