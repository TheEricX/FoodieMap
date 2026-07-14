import {
  PRIMARY_VIEWS,
  createInitialUiModel,
  reduceUiState,
  surfacePresentation,
  viewPresentation
} from "./ui-core.mjs";

export function createUiShell({ window, document, onLayoutChange = () => {} }) {
  let model = createInitialUiModel(window.innerWidth);
  const media = window.matchMedia("(max-width: 900px)");

  function applyLayout() {
    document.documentElement.dataset.layout = model.layout;
    document.body.dataset.layout = model.layout;
    document.body.dataset.navigation = viewPresentation(model.activeView, model.layout).navigation;
    const navigationAvailable = PRIMARY_VIEWS.includes(model.activeView);
    document.querySelectorAll('[data-shell="desktop"]').forEach((shell) => {
      shell.hidden = model.layout === "mobile" || !navigationAvailable;
      shell.setAttribute("aria-hidden", String(shell.hidden));
    });
    document.querySelectorAll('[data-shell="mobile"]').forEach((shell) => {
      shell.hidden = model.layout !== "mobile" || !navigationAvailable;
      shell.setAttribute("aria-hidden", String(shell.hidden));
    });
    document.querySelectorAll("dialog").forEach((dialog) => {
      const kind = dialog.classList.contains("detail-drawer") ? "detail" : "modal";
      dialog.dataset.presentation = surfacePresentation(model.layout, kind);
    });
    document.querySelectorAll(".form-actions").forEach((actions) => {
      actions.dataset.uiComponent = "action-bar";
    });
    document.querySelectorAll(".empty-panel").forEach((panel) => {
      panel.dataset.uiComponent = "empty-state";
    });
  }

  function updateViewport() {
    const previous = model.layout;
    model = reduceUiState(model, { type: "viewport.changed", width: window.innerWidth });
    applyLayout();
    if (previous !== model.layout) onLayoutChange(model.layout, previous);
  }

  function setActiveView(view) {
    model = reduceUiState(model, { type: "view.changed", view });
    applyLayout();
    document.querySelectorAll("[data-view]").forEach((link) => {
      const active = link.dataset.view === view;
      link.classList.toggle("active", active);
      if (active) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  }

  function start() {
    applyLayout();
    media.addEventListener?.("change", updateViewport);
    window.addEventListener("resize", updateViewport, { passive: true });
  }

  function stop() {
    media.removeEventListener?.("change", updateViewport);
    window.removeEventListener("resize", updateViewport);
  }

  return {
    start,
    stop,
    setActiveView,
    getModel: () => ({ ...model })
  };
}
