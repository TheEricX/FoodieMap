import { escapeMarkup } from "./ui-components.mjs";

const attr = escapeMarkup;

export function createFormTemplates({
  translate,
  statusLabel,
  dishStatusLabel,
  restaurantThumb,
  emptyState,
}) {
  const text = (key, params) => escapeMarkup(translate(key, params));

  function integrationList(integrations = []) {
    if (!integrations.length) return `<p class="form-help">${text("settings.connectedEmpty")}</p>`;
    return integrations.map((item) => `
      <article class="integration-item">
        <div>
          <strong>${escapeMarkup(item.client_name)}</strong>
          <small>${(item.scopes || []).map(escapeMarkup).join(" · ")}</small>
        </div>
        <button class="secondary-button danger" type="button" data-revoke-integration="${attr(item.id)}">${text("settings.revoke")}</button>
      </article>
    `).join("");
  }

  function dishEditor(dish) {
    return `
      <article class="dish-editor-item" data-dish-id="${attr(dish.id)}">
        ${dish.image_url ? `<img src="${attr(dish.image_url)}" alt="">` : '<div class="dish-image-placeholder">IMG</div>'}
        <div class="dish-editor-fields">
          <input data-field="name" value="${attr(dish.name)}" />
          <div class="dish-form-grid compact">
            <select data-field="dish_status">
              <option value="liked" ${dish.dish_status === "liked" ? "selected" : ""}>${text("status.liked")}</option>
              <option value="tried" ${dish.dish_status === "tried" ? "selected" : ""}>${text("status.tried")}</option>
            </select>
            <input data-field="rating" type="number" min="0" max="5" step="0.1" value="${Number(dish.rating || 0)}" />
            <input class="dish-image-input" type="file" accept="image/jpeg,image/png,image/webp" />
          </div>
          <textarea data-field="notes" rows="2" placeholder="${attr(translate("detail.dishNotesPlaceholder"))}">${escapeMarkup(dish.notes || "")}</textarea>
        </div>
        <div class="dish-editor-actions">
          <button class="secondary-button" type="button" data-dish-action="save">${text("button.save")}</button>
          <button class="secondary-button danger" type="button" data-dish-action="delete">${text("button.delete")}</button>
        </div>
      </article>
    `;
  }

  function shareDishOption(dish) {
    return `
      <label class="share-dish-item">
        <input type="checkbox" value="${attr(dish.id)}" ${dish.dish_status === "liked" ? "checked" : ""} />
        <span>${escapeMarkup(dish.name)}</span>
        <small>☆ ${Number(dish.rating || 0).toFixed(1)} · ${escapeMarkup(dishStatusLabel(dish.dish_status))}</small>
      </label>
    `;
  }

  function sharePackRestaurantOption(restaurant) {
    const dishes = restaurant.dishes || [];
    return `
      <article class="share-pack-option" data-share-pack-restaurant="${attr(restaurant.id)}">
        <label class="share-pack-restaurant-check">
          <input type="checkbox" data-share-pack-restaurant-check value="${attr(restaurant.id)}" />
          <span>
            <strong>${escapeMarkup(restaurant.name)}</strong>
            <small>${escapeMarkup(restaurant.address || statusLabel(restaurant.status))}</small>
          </span>
        </label>
        <div class="share-pack-dishes">
          ${dishes.length ? dishes.map((dish) => `
            <label>
              <input type="checkbox" data-share-pack-dish value="${attr(dish.id)}" />
              <span>${escapeMarkup(dish.name)} · ☆ ${Number(dish.rating || 0).toFixed(1)}</span>
            </label>
          `).join("") : `<p>${text("detail.noMenu")}</p>`}
        </div>
      </article>
    `;
  }

  function detailDishPreview(dish) {
    const notes = dish.notes?.trim();
    return `
      <article class="detail-dish-card preview" data-dish-id="${attr(dish.id)}">
        <div class="detail-dish-photo">
          ${dish.image_url ? `<img src="${attr(dish.image_url)}" alt="">` : "<span>IMG</span>"}
        </div>
        <div class="detail-dish-body">
          <div class="detail-dish-summary">
            <div>
              <strong>${escapeMarkup(dish.name)}</strong>
              <div class="detail-dish-meta">
                <span class="dish-status-pill">${escapeMarkup(dishStatusLabel(dish.dish_status))}</span>
                <span>☆ ${Number(dish.rating || 0).toFixed(1)}</span>
              </div>
            </div>
            <div class="detail-dish-actions">
              <button class="secondary-button compact-action" type="button" data-detail-dish-action="edit">${text("button.edit")}</button>
              <button class="secondary-button compact-action danger" type="button" data-detail-dish-action="delete">${text("button.delete")}</button>
            </div>
          </div>
          <p class="detail-dish-notes-preview">${notes ? escapeMarkup(notes) : text("detail.noDishNotes")}</p>
        </div>
      </article>
    `;
  }

  function detailDishEdit(dish) {
    return `
      <article class="detail-dish-card editing" data-dish-id="${attr(dish.id)}">
        <div class="detail-dish-photo">
          ${dish.image_url ? `<img src="${attr(dish.image_url)}" alt="">` : "<span>IMG</span>"}
        </div>
        <div class="detail-dish-body">
          <input data-field="name" data-detail-dish-autosave value="${attr(dish.name)}" />
          <div class="detail-dish-controls">
            <select data-field="dish_status" data-detail-dish-autosave>
              <option value="liked" ${dish.dish_status === "liked" ? "selected" : ""}>${text("status.liked")}</option>
              <option value="tried" ${dish.dish_status === "tried" ? "selected" : ""}>${text("status.tried")}</option>
            </select>
            <input data-field="rating" data-detail-dish-autosave type="number" min="0" max="5" step="0.1" value="${Number(dish.rating || 0)}" />
            <label class="detail-file-dropzone compact" data-detail-file-dropzone>
              <input class="detail-dish-image-input" type="file" accept="image/jpeg,image/png,image/webp" hidden />
              <span class="detail-file-mark" aria-hidden="true">＋</span>
              <span><strong>${text("button.replacePhoto")}</strong><small>${text("detail.uploadHint")}</small></span>
            </label>
          </div>
          <textarea data-field="notes" data-detail-dish-autosave rows="3" placeholder="${attr(translate("detail.dishNotesPlaceholder"))}">${escapeMarkup(dish.notes || "")}</textarea>
          <div class="detail-dish-actions">
            <button class="secondary-button" type="button" data-detail-dish-action="done">${text("button.done")}</button>
            <button class="secondary-button danger" type="button" data-detail-dish-action="delete">${text("button.delete")}</button>
          </div>
        </div>
      </article>
    `;
  }

  function detailDish(dish, editing = false) {
    return editing ? detailDishEdit(dish) : detailDishPreview(dish);
  }

  function addSpotRow(restaurant, added = false) {
    return `
      <article class="add-spot-row">
        ${restaurantThumb(restaurant)}
        <div>
          <strong>${escapeMarkup(restaurant.name)}</strong>
          <small>☆ ${Number(restaurant.personal_rating || 0).toFixed(1)} · ${escapeMarkup(statusLabel(restaurant.status))}${added ? ` · ${text("list.inThisList")}` : ""}</small>
        </div>
        <button class="secondary-button ${added ? "danger" : ""}" type="button" ${added ? `data-remove-list-spot="${attr(restaurant.id)}"` : `data-add-list-spot="${attr(restaurant.id)}"`}>
          ${text(added ? "button.remove" : "button.add")}
        </button>
      </article>
    `;
  }

  return {
    integrationList,
    dishEditor,
    shareDishOption,
    sharePackRestaurantOption,
    detailDish,
    detailDishPreview,
    detailDishEdit,
    addSpotRow,
  };
}
