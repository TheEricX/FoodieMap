import test from "node:test";
import assert from "node:assert/strict";
import { clampMapPan, foodPlaceholderUrl, getBearing, layoutRelativeMarkers, mapPoint } from "../map-geometry.mjs";

test("map pan remains inside the configured viewport limit", () => {
  assert.deepEqual(clampMapPan(90, -80, { width: 200, height: 100, limitRatio: 0.42 }), { x: 84, y: -42 });
  assert.deepEqual(clampMapPan("bad", null, { width: 200, height: 100 }), { x: 0, y: 0 });
});

test("bearings and relative marker points are deterministic", () => {
  assert.equal(Math.round(getBearing({ lat: 0, lng: 0 }, { lat: 1, lng: 0 })), 0);
  const point = mapPoint(5, 90, 2, 1);
  assert.equal(point.y, 50);
  assert.ok(point.x > 60);
});

test("relative marker layout avoids identical positions and stays in the stage", () => {
  const items = [{ id: "one", lat: 43.65, lng: -79.38 }, { id: "two", lat: 43.65, lng: -79.38 }];
  const layout = layoutRelativeMarkers(items, {
    currentLocation: { lat: 43.65, lng: -79.38 },
    width: 390,
    height: 680,
    distanceBetween: () => 0,
  });
  const first = layout.get("one");
  const second = layout.get("two");
  assert.notDeepEqual(first, second);
  for (const point of [first, second]) {
    assert.ok(point.x >= 7 && point.x <= 93);
    assert.ok(point.y >= 10 && point.y <= 90);
  }
});

test("food placeholders are stable SVG data URLs", () => {
  const first = foodPlaceholderUrl("restaurant-1", 2);
  assert.match(first, /^data:image\/svg\+xml;charset=UTF-8,/);
  assert.equal(first, foodPlaceholderUrl("restaurant-1", 2));
  assert.notEqual(first, foodPlaceholderUrl("restaurant-2", 3));
});
