export function escapeMarkup(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function emptyStateTemplate({ title, message = "", actionLabel = "" }) {
  return `
    <div class="empty-panel${message ? " empty-info-panel" : ""}" data-ui-component="empty-state">
      <strong>${escapeMarkup(title)}</strong>
      ${message ? `<p>${escapeMarkup(message)}</p>` : ""}
      ${actionLabel ? `<button class="secondary-button" type="button" data-empty-action>${escapeMarkup(actionLabel)}</button>` : ""}
    </div>
  `;
}

export function statusPanelTemplate(message, tone = "default") {
  const className = tone === "error" ? "empty-panel error" : "empty-panel";
  return `<div class="${className}" data-ui-component="status-panel" role="${tone === "error" ? "alert" : "status"}"><strong>${escapeMarkup(message)}</strong></div>`;
}
