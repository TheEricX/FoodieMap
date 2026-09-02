const DEFAULT_INTERACTIVE_SELECTOR = "button, input, textarea, select, a";

export function createSwipeDismissController({
  surface,
  dragTarget,
  handles = [],
  horizontalTargets = [],
  horizontalDirection = null,
  isEnabled = () => true,
  onDismiss = async () => true,
  closeDistance = 110,
  horizontalCloseDistance = 96,
  lockDistance = 12,
  dismissDelay = 0,
  interactiveSelector = DEFAULT_INTERACTIVE_SELECTOR,
} = {}) {
  if (!surface || !dragTarget) throw new Error("A dialog surface and drag target are required");

  let drag = null;

  function resetStyles() {
    dragTarget.classList.remove("is-dragging", "is-dragging-horizontal", "is-dismissing", "is-dismissing-horizontal");
    dragTarget.style.removeProperty("--sheet-drag-y");
    dragTarget.style.removeProperty("--sheet-drag-x");
  }

  function reset() {
    drag = null;
    resetStyles();
  }

  function start(event, axis = "vertical") {
    if (!surface.open || !isEnabled()) return;
    if (drag) return;
    if (event.button != null && event.button !== 0) return;
    if (event.target?.closest?.(interactiveSelector)) return;
    drag = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      axis,
      lastDistance: 0,
      locked: false,
    };
    try {
      dragTarget.setPointerCapture?.(event.pointerId);
    } catch {
      // Synthetic events and some embedded browsers do not expose an active pointer capture target.
    }
  }

  const startVertical = (event) => start(event, "vertical");
  const startHorizontal = (event) => start(event, "horizontal");

  function move(event) {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const rawDeltaX = event.clientX - drag.startX;
    const rawDeltaY = event.clientY - drag.startY;
    const isHorizontal = drag.axis === "horizontal";
    const delta = isHorizontal
      ? (horizontalDirection === "right" ? Math.max(0, rawDeltaX) : Math.max(0, -rawDeltaX))
      : Math.max(0, rawDeltaY);
    const crossDelta = isHorizontal ? Math.abs(rawDeltaY) : Math.abs(rawDeltaX);
    if (!drag.locked) {
      if (delta < lockDistance && crossDelta < lockDistance) return;
      if (crossDelta > delta) {
        reset();
        return;
      }
      drag.locked = true;
      dragTarget.classList.add("is-dragging");
      if (isHorizontal) dragTarget.classList.add("is-dragging-horizontal");
    }
    drag.lastDistance = delta;
    dragTarget.style.setProperty(isHorizontal ? "--sheet-drag-x" : "--sheet-drag-y", `${isHorizontal && horizontalDirection !== "right" ? -delta : delta}px`);
    event.preventDefault();
  }

  async function finish(event) {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const pointerId = drag.pointerId;
    const axis = drag.axis;
    const shouldDismiss = drag.lastDistance >= (axis === "horizontal" ? horizontalCloseDistance : closeDistance);
    drag = null;
    try {
      dragTarget.releasePointerCapture?.(pointerId);
    } catch {
      // Releasing a pointer that the browser already cancelled is safe to ignore.
    }
    dragTarget.classList.remove("is-dragging", "is-dragging-horizontal");
    if (!shouldDismiss) {
      resetStyles();
      return;
    }
    const dismissed = await onDismiss();
    if (!dismissed) {
      resetStyles();
      return;
    }
    if (dismissDelay > 0) {
      dragTarget.classList.add(axis === "horizontal" ? "is-dismissing-horizontal" : "is-dismissing");
      window.setTimeout(resetStyles, dismissDelay);
    } else {
      resetStyles();
    }
  }

  function bind() {
    handles.forEach((handle) => handle?.addEventListener("pointerdown", startVertical));
    if (horizontalDirection) horizontalTargets.forEach((target) => target?.addEventListener("pointerdown", startHorizontal));
    dragTarget.addEventListener("pointermove", move);
    dragTarget.addEventListener("pointerup", finish);
    dragTarget.addEventListener("pointercancel", reset);
  }

  function destroy() {
    handles.forEach((handle) => handle?.removeEventListener("pointerdown", startVertical));
    if (horizontalDirection) horizontalTargets.forEach((target) => target?.removeEventListener("pointerdown", startHorizontal));
    dragTarget.removeEventListener("pointermove", move);
    dragTarget.removeEventListener("pointerup", finish);
    dragTarget.removeEventListener("pointercancel", reset);
    reset();
  }

  return { bind, destroy, reset };
}
