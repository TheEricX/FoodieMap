import test from "node:test";
import assert from "node:assert/strict";
import { emptyStateTemplate, escapeMarkup, statusPanelTemplate } from "../ui-components.mjs";

test("shared UI templates escape content and distinguish actions from guidance", () => {
  assert.equal(escapeMarkup('<script>"x"</script>'), "&lt;script&gt;&quot;x&quot;&lt;/script&gt;");
  const guidance = emptyStateTemplate({ title: "No recipes", message: "Add one when ready" });
  assert.match(guidance, /empty-info-panel/);
  assert.doesNotMatch(guidance, /<button/);
  const actionable = emptyStateTemplate({ title: "No lists", actionLabel: "Create list" });
  assert.match(actionable, /data-empty-action/);
});

test("status panels expose semantic roles", () => {
  assert.match(statusPanelTemplate("Loading"), /role="status"/);
  assert.match(statusPanelTemplate("Failed", "error"), /role="alert"/);
});
