import test from "node:test";
import assert from "node:assert/strict";

import { closeDialogSafely } from "../ui-dialogs.mjs";

test("safe dialog close falls back to removing a stuck open state", () => {
  let hasOpenAttribute = true;
  const dialog = {
    open: true,
    close() { throw new Error("Safari close transition failed"); },
    hasAttribute(name) { return name === "open" && hasOpenAttribute; },
    removeAttribute(name) {
      if (name === "open") {
        hasOpenAttribute = false;
        this.open = false;
      }
    },
  };

  assert.equal(closeDialogSafely(dialog), true);
  assert.equal(dialog.open, false);
  assert.equal(hasOpenAttribute, false);
});

test("safe dialog close is idempotent for an already closed dialog", () => {
  const dialog = {
    open: false,
    close() { throw new Error("close should not be called"); },
    hasAttribute() { return false; },
  };

  assert.equal(closeDialogSafely(dialog), true);
});
