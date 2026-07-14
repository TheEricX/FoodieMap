export function createConfirmController({ document }) {
  const dialog = document.querySelector("#confirmDialog");
  const title = dialog?.querySelector("[data-confirm-title]");
  const message = dialog?.querySelector("[data-confirm-message]");
  const cancelButton = dialog?.querySelector("[data-confirm-cancel]");
  const acceptButton = dialog?.querySelector("[data-confirm-accept]");
  let resolvePending = null;

  function finish(accepted) {
    if (!resolvePending) return;
    const resolve = resolvePending;
    resolvePending = null;
    if (dialog.open) dialog.close();
    resolve(accepted);
  }

  dialog?.addEventListener("cancel", (event) => {
    event.preventDefault();
    finish(false);
  });
  dialog?.addEventListener("click", (event) => {
    if (event.target === dialog) finish(false);
  });
  cancelButton?.addEventListener("click", () => finish(false));
  acceptButton?.addEventListener("click", () => finish(true));

  function ask({
    title: nextTitle,
    message: nextMessage,
    cancelLabel = "Cancel",
    confirmLabel = "Continue",
    tone = "default",
  }) {
    if (!dialog || !title || !message || !cancelButton || !acceptButton) {
      return Promise.resolve(false);
    }
    if (resolvePending) finish(false);
    title.textContent = nextTitle;
    message.textContent = nextMessage;
    cancelButton.textContent = cancelLabel;
    acceptButton.textContent = confirmLabel;
    acceptButton.classList.toggle("danger", tone === "danger");
    dialog.dataset.tone = tone;
    dialog.showModal();
    return new Promise((resolve) => {
      resolvePending = resolve;
      window.requestAnimationFrame(() => acceptButton.focus());
    });
  }

  return { ask };
}
