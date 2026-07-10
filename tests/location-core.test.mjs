import test from "node:test";
import assert from "node:assert/strict";

import {
  LOCATION_MODES,
  LOCATION_PHASES,
  classifyLocationAccuracy,
  createInitialLocationModel,
  createLocationController,
  formatDistance,
  haversineDistance,
  layoutBrowseMarkers,
  reduceLocationState,
  sortRestaurantsForLocationMode,
} from "../location-core.mjs";

test("location reducer enforces browse and failure invariants", () => {
  const ready = reduceLocationState(createInitialLocationModel(), {
    type: "LOCATE_SUCCESS",
    position: { lat: 43.65, lng: -79.38, accuracy: 30, obtainedAt: 100 },
  });
  assert.equal(ready.phase, LOCATION_PHASES.READY);
  assert.ok(ready.position);

  const browse = reduceLocationState(ready, { type: "CHOOSE_BROWSE" });
  assert.equal(browse.mode, LOCATION_MODES.BROWSE);
  assert.equal(browse.position, null);

  const denied = reduceLocationState(ready, { type: "LOCATE_FAILURE", phase: LOCATION_PHASES.DENIED });
  assert.equal(denied.phase, LOCATION_PHASES.DENIED);
  assert.equal(denied.position, null);

  const expired = reduceLocationState(ready, { type: "PERMISSION_CHANGE", permission: "prompt" });
  assert.equal(expired.phase, LOCATION_PHASES.IDLE);
  assert.equal(expired.position, null);
});

test("accuracy and distance presentation distinguish precise and approximate positions", () => {
  assert.equal(classifyLocationAccuracy(50), "precise");
  assert.equal(classifyLocationAccuracy(500), "approximate");
  assert.equal(classifyLocationAccuracy(2000), "low");
  assert.equal(formatDistance(0.651, 50), "650 m");
  assert.equal(formatDistance(2.35, 50), "2.4 km");
  assert.equal(formatDistance(2.35, 500), "≈ 2.4 km");
  assert.equal(formatDistance(18.4, 2000), "≈ 18 km");
});

test("haversine returns a known Toronto distance", () => {
  const distance = haversineDistance({ lat: 43.6532, lng: -79.3832 }, { lat: 43.6426, lng: -79.3871 });
  assert.ok(distance > 1.1 && distance < 1.4);
});

test("browse sorting uses updated time while nearby sorting uses distance", () => {
  const restaurants = [
    { id: "far", name: "Far", lat: 44, lng: -79, updated_at: "2026-07-10T10:00:00Z" },
    { id: "near", name: "Near", lat: 43.65, lng: -79.38, updated_at: "2026-07-09T10:00:00Z" },
  ];
  const browse = sortRestaurantsForLocationMode(restaurants, createInitialLocationModel());
  assert.deepEqual(browse.map((item) => item.id), ["far", "near"]);

  const nearbyState = reduceLocationState(createInitialLocationModel(), {
    type: "LOCATE_SUCCESS",
    position: { lat: 43.651, lng: -79.381, accuracy: 20, obtainedAt: 100 },
  });
  const nearby = sortRestaurantsForLocationMode(restaurants, nearbyState);
  assert.deepEqual(nearby.map((item) => item.id), ["near", "far"]);
});

test("browse marker layout is stable regardless of input order", () => {
  const first = layoutBrowseMarkers([{ id: "a" }, { id: "b" }, { id: "c" }], { width: 390, height: 700 });
  const second = layoutBrowseMarkers([{ id: "c" }, { id: "a" }, { id: "b" }], { width: 390, height: 700 });
  assert.deepEqual(first, second);
  first.forEach((point) => {
    assert.ok(point.x >= 7 && point.x <= 93);
    assert.ok(point.y >= 10 && point.y <= 90);
  });
});

test("controller bootstraps browse without querying permission", async () => {
  let permissionQueries = 0;
  const controller = createLocationController({
    gateway: {
      isSupported: () => true,
      queryPermission: async () => {
        permissionQueries += 1;
        return "granted";
      },
    },
    preferenceStore: { get: () => "browse", set: () => {} },
  });
  await controller.bootstrap();
  assert.equal(controller.getState().mode, LOCATION_MODES.BROWSE);
  assert.equal(permissionQueries, 0);
});

test("controller does not prompt or locate on boot when permission is not granted", async () => {
  let locateCalls = 0;
  const controller = createLocationController({
    gateway: {
      isSupported: () => true,
      queryPermission: async () => "prompt",
      getCurrentPosition: async () => {
        locateCalls += 1;
      },
    },
    preferenceStore: { get: () => "nearby", set: () => {} },
  });
  await controller.bootstrap();
  assert.equal(controller.getState().phase, LOCATION_PHASES.IDLE);
  assert.equal(locateCalls, 0);
});

test("controller ignores a late success after the user chooses browse", async () => {
  let resolvePosition;
  const positionPromise = new Promise((resolve) => {
    resolvePosition = resolve;
  });
  const controller = createLocationController({
    gateway: {
      isSupported: () => true,
      queryPermission: async () => "prompt",
      getCurrentPosition: () => positionPromise,
    },
    preferenceStore: { get: () => null, set: () => {} },
    clock: { now: () => 1000 },
  });
  await controller.bootstrap();
  const locating = controller.requestNearby();
  controller.chooseBrowse();
  resolvePosition({ coords: { latitude: 43.65, longitude: -79.38, accuracy: 20 }, timestamp: 1000 });
  await locating;
  assert.equal(controller.getState().mode, LOCATION_MODES.BROWSE);
  assert.equal(controller.getState().position, null);
});

test("controller maps denied, unavailable and timeout without fallback coordinates", async () => {
  for (const [code, phase] of [
    [1, LOCATION_PHASES.DENIED],
    [2, LOCATION_PHASES.UNAVAILABLE],
    [3, LOCATION_PHASES.TIMEOUT],
  ]) {
    const controller = createLocationController({
      gateway: {
        isSupported: () => true,
        queryPermission: async () => "prompt",
        getCurrentPosition: async () => {
          throw { code };
        },
      },
      preferenceStore: { get: () => null, set: () => {} },
    });
    await controller.bootstrap();
    await controller.requestNearby();
    assert.equal(controller.getState().phase, phase);
    assert.equal(controller.getState().position, null);
  }
});

test("controller retries once after returning from browser settings", async () => {
  let permission = "denied";
  let locateCalls = 0;
  const controller = createLocationController({
    gateway: {
      isSupported: () => true,
      queryPermission: async () => permission,
      getCurrentPosition: async () => {
        locateCalls += 1;
        return { coords: { latitude: 43.65, longitude: -79.38, accuracy: 25 }, timestamp: 1000 };
      },
    },
    preferenceStore: { get: () => "nearby", set: () => {} },
    clock: { now: () => 1000 },
  });
  await controller.bootstrap();
  assert.equal(controller.getState().phase, LOCATION_PHASES.DENIED);
  controller.openSettingsHelp();
  permission = "granted";
  await controller.resume();
  assert.equal(locateCalls, 1);
  assert.equal(controller.getState().phase, LOCATION_PHASES.READY);
  await controller.resume();
  assert.equal(locateCalls, 1);
});

test("controller refreshes stale granted positions", async () => {
  let now = 1000;
  let locateCalls = 0;
  const controller = createLocationController({
    gateway: {
      isSupported: () => true,
      queryPermission: async () => "granted",
      getCurrentPosition: async () => {
        locateCalls += 1;
        return { coords: { latitude: 43.65, longitude: -79.38, accuracy: 25 }, timestamp: now };
      },
    },
    preferenceStore: { get: () => "nearby", set: () => {} },
    clock: { now: () => now },
  });
  await controller.bootstrap();
  assert.equal(locateCalls, 1);
  now += 4 * 60 * 1000;
  await controller.resume();
  assert.equal(locateCalls, 1);
  now += 2 * 60 * 1000;
  await controller.resume();
  assert.equal(locateCalls, 2);
});
