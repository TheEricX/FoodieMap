import test from "node:test";
import assert from "node:assert/strict";
import { createMapInteractionController } from "../map-interactions.mjs";

function createTarget() {
  const listeners = new Map();
  const classes = new Set();
  const properties = new Map();
  return {
    style: { setProperty: (key, value) => properties.set(key, value) },
    classList: { add: (name) => classes.add(name), remove: (name) => classes.delete(name) },
    addEventListener: (name, callback) => listeners.set(name, callback),
    removeEventListener: (name) => listeners.delete(name),
    getBoundingClientRect: () => ({ width: 320, height: 560 }),
    setPointerCapture() {},
    releasePointerCapture() {},
    dispatch(name, event) { listeners.get(name)?.(event); },
    properties,
    classes,
  };
}

function event(overrides = {}) {
  return {
    target: { closest: () => null },
    preventDefault() {},
    ...overrides,
  };
}

test("map interaction controller owns bounded pan and zoom state", () => {
  const target = createTarget();
  const zoomValues = [];
  const controller = createMapInteractionController({ target, onZoomChange: (zoom) => zoomValues.push(zoom) });
  controller.bind();

  controller.zoomIn();
  controller.zoomOut();
  target.dispatch("wheel", event({ deltaY: -120 }));
  target.dispatch("pointerdown", event({ pointerId: 1, clientX: 20, clientY: 20 }));
  target.dispatch("pointermove", event({ pointerId: 1, clientX: 900, clientY: 900 }));
  target.dispatch("pointerup", event({ pointerId: 1 }));

  const state = controller.getState();
  assert.ok(state.zoom >= 0.65 && state.zoom <= 2.8);
  assert.ok(Math.abs(state.pan.x) <= 320 * 0.42);
  assert.ok(Math.abs(state.pan.y) <= 560 * 0.42);
  assert.equal(target.properties.get("--map-zoom"), state.zoom.toFixed(2));
  assert.ok(zoomValues.length >= 3);
});

test("interactive controls do not start panning", () => {
  const target = createTarget();
  const controller = createMapInteractionController({ target });
  controller.bind();
  target.dispatch("pointerdown", event({ pointerId: 1, clientX: 10, clientY: 10, target: { closest: () => ({}) } }));
  target.dispatch("pointermove", event({ pointerId: 1, clientX: 200, clientY: 200 }));
  assert.deepEqual(controller.getState().pan, { x: 0, y: 0 });
});
