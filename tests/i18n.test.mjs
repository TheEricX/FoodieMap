import test from "node:test";
import assert from "node:assert/strict";
import { normalizeLanguage, translate, translationKeys, translations } from "../i18n.mjs";

test("language normalization supports English and Chinese only", () => {
  assert.equal(normalizeLanguage("zh"), "zh");
  assert.equal(normalizeLanguage("en"), "en");
  assert.equal(normalizeLanguage("fr"), "en");
  assert.equal(normalizeLanguage(null), "en");
});

test("translations interpolate values and preserve zero", () => {
  assert.equal(translate("en", "count.visits", { count: 0 }), "0 visits");
  assert.equal(translate("zh", "count.visits", { count: 2 }), "2 次访问");
  assert.equal(translate("en", "admin.confirmPlan", { email: "a@example.test", plan: "Paid" }), "Set a@example.test to Paid?");
});

test("unknown keys fall back predictably", () => {
  assert.equal(translate("fr", "nav.map"), "Map");
  assert.equal(translate("zh", "missing.key"), "missing.key");
});

test("English and Chinese dictionaries have matching keys", () => {
  assert.deepEqual(translationKeys("zh").sort(), translationKeys("en").sort());
  assert.equal(Object.keys(translations.en).length, 513);
});
