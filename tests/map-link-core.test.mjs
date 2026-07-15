import test from "node:test";
import assert from "node:assert/strict";
import {
  extractMapUrl,
  isAppleMapsUrl,
  isGoogleMapsUrl,
  isResolvableMapLink,
  normalizeResolvedMapPlace,
  parseMapUrl,
  sanitizeMapUrl,
  validateCoordinates,
} from "../map-link-core.mjs";

test("Google Maps URLs yield coordinates and place information", () => {
  const parsed = parseMapUrl("https://www.google.com/maps/place/Hachi+Ramen,+131+Beecroft+Rd,+Toronto/@43.7682,-79.4139,15z");
  assert.deepEqual(parsed, {
    lat: 43.7682,
    lng: -79.4139,
    name: "Hachi Ramen",
    address: "131 Beecroft Rd, Toronto",
  });
  assert.equal(isGoogleMapsUrl("https://www.google.com/maps?q=43.7,-79.4"), true);
});

test("Apple Maps URLs retain coordinates and distinguish name from address", () => {
  assert.deepEqual(parseMapUrl("https://maps.apple.com/?q=43.6532,-79.3832"), {
    provider: "apple",
    name: "",
    address: "43.6532,-79.3832",
    lat: 43.6532,
    lng: -79.3832,
  });
  assert.deepEqual(parseMapUrl("https://maps.apple.com/?q=Pho+Hung&ll=43.65,-79.38"), {
    provider: "apple",
    name: "Pho Hung",
    address: "",
    lat: 43.65,
    lng: -79.38,
  });
  assert.equal(isAppleMapsUrl("https://maps.apple.com/?q=Pho+Hung"), true);
});

test("pasted links are trimmed and short links are identified for server resolution", () => {
  assert.equal(sanitizeMapUrl(' "https://maps.apple.com/?q=Pho+Hung)." '), "https://maps.apple.com/?q=Pho+Hung");
  assert.equal(extractMapUrl("Try https://www.google.com/maps?q=43.6,-79.3)."), "https://www.google.com/maps?q=43.6,-79.3");
  assert.equal(isResolvableMapLink("https://maps.app.goo.gl/example"), true);
  assert.equal(isResolvableMapLink("https://maps.apple.com/?q=Pho"), false);
});

test("invalid coordinates and malformed provider URLs are rejected", () => {
  assert.equal(validateCoordinates(91, 0), null);
  assert.equal(validateCoordinates("43.6", "-79.3").lat, 43.6);
  assert.equal(parseMapUrl("https://example.test/?q=43,-79"), null);
  assert.equal(parseMapUrl("https://maps.apple.com/?ll=100,200"), null);
});

test("server-resolved places are normalized before merging", () => {
  assert.deepEqual(normalizeResolvedMapPlace({ lat: 43.6, lng: -79.3, name: " Cafe ", address: " Main St " }), {
    lat: 43.6,
    lng: -79.3,
    name: "Cafe",
    address: "Main St",
  });
  assert.equal(normalizeResolvedMapPlace({ lat: 200, lng: 1 }), null);
});
