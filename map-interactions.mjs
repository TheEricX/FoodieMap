import { clampMapPan } from "./map-geometry.mjs";

const INTERACTIVE_SELECTOR = ".spot-card, .spot-card-tab, .map-zoom-controls, .restaurant-marker, .me-marker, a, button, input, textarea, select";

export function createMapInteractionController({
  target,
  minZoom = 0.65,
  maxZoom = 2.8,
  zoomStep = 0.18,
  panLimitRatio = 0.42,
  onZoomChange = () => {},
  onPanChange = () => {},
} = {}) {
  if (!target) throw new Error("A map target is required");

  let zoom = 1;
  let pan = { x: 0, y: 0 };
  let panDrag = null;
  let gestureStartZoom = null;

  function bounds() {
    const rect = target.getBoundingClientRect();
    return { width: rect.width, height: rect.height, limitRatio: panLimitRatio };
  }

  function applyPan() {
    target.style.setProperty("--map-pan-x", `${Math.round(pan.x)}px`);
    target.style.setProperty("--map-pan-y", `${Math.round(pan.y)}px`);
    onPanChange({ ...pan });
  }

  function applyZoom() {
    target.style.setProperty("--map-zoom", zoom.toFixed(2));
    onZoomChange(zoom);
  }

  function setPan(x, y, { force = false } = {}) {
    const next = clampMapPan(x, y, bounds());
    if (!force && Math.abs(next.x - pan.x) < 0.5 && Math.abs(next.y - pan.y) < 0.5) return false;
    pan = next;
    applyPan();
    return true;
  }

  function setZoom(value, { force = false } = {}) {
    const next = Math.max(minZoom, Math.min(maxZoom, Number(value) || 1));
    if (!force && Math.abs(next - zoom) < 0.005) return false;
    zoom = next;
    applyZoom();
    return true;
  }

  function isInteractive(event) {
    return Boolean(event.target.closest(INTERACTIVE_SELECTOR));
  }

  function onWheel(event) {
    if (isInteractive(event)) return;
    event.preventDefault();
    const delta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
    const factor = Math.exp(-delta * (event.ctrlKey ? 0.01 : 0.0018));
    setZoom(zoom * factor);
  }

  function onGestureStart(event) {
    if (isInteractive(event)) return;
    gestureStartZoom = zoom;
    event.preventDefault();
  }

  function onGestureChange(event) {
    if (gestureStartZoom == null) return;
    event.preventDefault();
    setZoom(gestureStartZoom * Number(event.scale || 1));
  }

  function onGestureEnd(event) {
    gestureStartZoom = null;
    event?.preventDefault?.();
  }

  function onPointerDown(event) {
    if (event.button != null && event.button !== 0) return;
    if (isInteractive(event)) return;
    panDrag = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: pan.x,
      originY: pan.y,
    };
    target.classList.add("is-panning");
    target.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  }

  function onPointerMove(event) {
    if (!panDrag || event.pointerId !== panDrag.pointerId) return;
    setPan(panDrag.originX + event.clientX - panDrag.startX, panDrag.originY + event.clientY - panDrag.startY);
    event.preventDefault();
  }

  function stopPan(event) {
    if (event && (!panDrag || event.pointerId !== panDrag.pointerId)) return;
    if (panDrag) target.releasePointerCapture?.(panDrag.pointerId);
    panDrag = null;
    target.classList.remove("is-panning");
  }

  function bind() {
    target.addEventListener("wheel", onWheel, { passive: false });
    target.addEventListener("pointerdown", onPointerDown);
    target.addEventListener("pointermove", onPointerMove);
    target.addEventListener("pointerup", stopPan);
    target.addEventListener("pointercancel", stopPan);
    target.addEventListener("gesturestart", onGestureStart);
    target.addEventListener("gesturechange", onGestureChange);
    target.addEventListener("gestureend", onGestureEnd);
    setPan(0, 0, { force: true });
    setZoom(1, { force: true });
  }

  function destroy() {
    target.removeEventListener("wheel", onWheel);
    target.removeEventListener("pointerdown", onPointerDown);
    target.removeEventListener("pointermove", onPointerMove);
    target.removeEventListener("pointerup", stopPan);
    target.removeEventListener("pointercancel", stopPan);
    target.removeEventListener("gesturestart", onGestureStart);
    target.removeEventListener("gesturechange", onGestureChange);
    target.removeEventListener("gestureend", onGestureEnd);
    stopPan();
  }

  return {
    bind,
    destroy,
    center: () => setPan(0, 0),
    zoomIn: () => setZoom(zoom + zoomStep),
    zoomOut: () => setZoom(zoom - zoomStep),
    resetZoom: () => setZoom(1),
    recenterWithinBounds: () => setPan(pan.x, pan.y, { force: true }),
    getState: () => ({ zoom, pan: { ...pan } }),
  };
}
