const DEFAULT_INTERACTIVE_SELECTOR = "button, input, textarea, select, a";

export function createSwipeDismissController({
  surface,
  dragTarget,
  handles = [],
  isEnabled = () => true,
  onDismiss = async () => true,
  closeDistance = 110,
  lockDistance = 12,
  dismissDelay = 0,
  interactiveSelector = DEFAULT_INTERACTIVE_SELECTOR,
} = {}) {
  if (!surface || !dragTarget) throw new Error("A dialog surface and drag target are required");

  let drag = null;

  function resetStyles() {
    dragTarget.classList.remove("is-dragging", "is-dismissing");
    dragTarget.style.removeProperty("--sheet-drag-y");
  }

  function reset() {
    drag = null;
    resetStyles();
  }

  function start(event) {
    if (!surface.open || !isEnabled()) return;
    if (event.button != null && event.button !== 0) return;
    if (event.target.closest(interactiveSelector)) return;
    drag = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      lastY: 0,
      locked: false,
    };
    try {
      dragTarget.setPointerCapture?.(event.pointerId);
    } catch {
      // Synthetic events and some embedded browsers do not expose an active pointer capture target.
    }
  }

  function move(event) {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const deltaX = event.clientX - drag.startX;
    const deltaY = Math.max(0, event.clientY - drag.startY);
    if (!drag.locked) {
      if (deltaY < lockDistance && Math.abs(deltaX) < lockDistance) return;
      if (Math.abs(deltaX) > deltaY) {
        reset();
        return;
      }
      drag.locked = true;
      dragTarget.classList.add("is-dragging");
    }
    drag.lastY = deltaY;
    dragTarget.style.setProperty("--sheet-drag-y", `${deltaY}px`);
    event.preventDefault();
  }

  async function finish(event) {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const pointerId = drag.pointerId;
    const shouldDismiss = drag.lastY >= closeDistance;
    drag = null;
    try {
      dragTarget.releasePointerCapture?.(pointerId);
    } catch {
      // Releasing a pointer that the browser already cancelled is safe to ignore.
    }
    dragTarget.classList.remove("is-dragging");
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
      dragTarget.classList.add("is-dismissing");
      window.setTimeout(resetStyles, dismissDelay);
    } else {
      resetStyles();
    }
  }

  function bind() {
    handles.forEach((handle) => handle?.addEventListener("pointerdown", start));
    dragTarget.addEventListener("pointermove", move);
    dragTarget.addEventListener("pointerup", finish);
    dragTarget.addEventListener("pointercancel", reset);
  }

  function destroy() {
    handles.forEach((handle) => handle?.removeEventListener("pointerdown", start));
    dragTarget.removeEventListener("pointermove", move);
    dragTarget.removeEventListener("pointerup", finish);
    dragTarget.removeEventListener("pointercancel", reset);
    reset();
  }

  return { bind, destroy, reset };
}
