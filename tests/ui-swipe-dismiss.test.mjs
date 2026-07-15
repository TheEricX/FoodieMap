import test from "node:test";
import assert from "node:assert/strict";
import { createSwipeDismissController } from "../ui-swipe-dismiss.mjs";

function fakeElement() {
  const listeners = new Map();
  const classes = new Set();
  const properties = new Map();
  return {
    open: true,
    classList: { add: (name) => classes.add(name), remove: (name) => classes.delete(name), contains: (name) => classes.has(name) },
    style: { setProperty: (key, value) => properties.set(key, value), removeProperty: (key) => properties.delete(key) },
    addEventListener: (name, callback) => listeners.set(name, callback),
    removeEventListener: (name) => listeners.delete(name),
    setPointerCapture() {},
    releasePointerCapture() {},
    dispatch(name, payload) { return listeners.get(name)?.(payload); },
    classes,
    properties,
  };
}

function pointer(overrides = {}) {
  return { pointerId: 1, clientX: 0, clientY: 0, target: { closest: () => null }, preventDefault() {}, ...overrides };
}

test("vertical swipe dismisses only after the configured threshold", async () => {
  const surface = fakeElement();
  const target = fakeElement();
  const handle = fakeElement();
  let dismissals = 0;
  const controller = createSwipeDismissController({ surface, dragTarget: target, handles: [handle], onDismiss: async () => { dismissals += 1; return true; } });
  controller.bind();

  handle.dispatch("pointerdown", pointer());
  target.dispatch("pointermove", pointer({ clientY: 60 }));
  await target.dispatch("pointerup", pointer({ clientY: 60 }));
  assert.equal(dismissals, 0);

  handle.dispatch("pointerdown", pointer());
  target.dispatch("pointermove", pointer({ clientY: 140 }));
  await target.dispatch("pointerup", pointer({ clientY: 140 }));
  assert.equal(dismissals, 1);
  assert.equal(target.properties.has("--sheet-drag-y"), false);
});

test("horizontal gestures and form controls do not start a dismiss gesture", () => {
  const surface = fakeElement();
  const target = fakeElement();
  const handle = fakeElement();
  const controller = createSwipeDismissController({ surface, dragTarget: target, handles: [handle] });
  controller.bind();
  handle.dispatch("pointerdown", pointer({ target: { closest: () => ({}) } }));
  target.dispatch("pointermove", pointer({ clientY: 150 }));
  assert.equal(target.classes.has("is-dragging"), false);
});
