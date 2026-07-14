import { escapeMarkup } from "./ui-components.mjs";

function escapeAttribute(value) {
  return escapeMarkup(value);
}

export function createViewTemplates({
  translate,
  formatDate,
  recipeImageUrl,
  restaurantImageUrl,
  statusLabel,
  accentVariant,
}) {
  function recipeRow(recipe, selectedId = null) {
    return `
      <article class="recipe-row ${String(recipe.id) === String(selectedId) ? "selected" : ""}" data-recipe-id="${escapeAttribute(recipe.id)}">
        <img class="recipe-thumb" src="${escapeAttribute(recipeImageUrl(recipe))}" alt="" loading="lazy" />
        <div class="recipe-row-main">
          <strong>${escapeMarkup(recipe.title)}</strong>
          <small>☆ ${Number(recipe.rating || 0).toFixed(1)} · ${recipe.cooked_at ? formatDate(recipe.cooked_at) : formatDate(recipe.updated_at)}</small>
          <p>${escapeMarkup(recipe.ingredients || translate("recipes.noIngredients"))}</p>
        </div>
      </article>
    `;
  }

  function recipeDetail(recipe) {
    return `
      <article class="recipe-detail-card">
        <img class="recipe-hero-image" src="${escapeAttribute(recipeImageUrl(recipe))}" alt="" />
        <div class="list-view-head">
          <div>
            <p class="eyebrow">${escapeMarkup(translate("recipes.eyebrow"))}</p>
            <h2>${escapeMarkup(recipe.title)}</h2>
            <div class="compact-meta">
              <span>☆ ${Number(recipe.rating || 0).toFixed(1)}</span>
              <span>${recipe.cooked_at ? formatDate(recipe.cooked_at) : formatDate(recipe.updated_at)}</span>
            </div>
          </div>
        </div>
        <div class="detail-actions">
          <button class="secondary-button" type="button" data-edit-recipe>${escapeMarkup(translate("button.edit"))}</button>
          <button class="secondary-button" type="button" data-share-recipe>${escapeMarkup(translate("button.share"))}</button>
          <button class="outline-button danger" type="button" data-delete-recipe>${escapeMarkup(translate("button.delete"))}</button>
        </div>
        <section class="recipe-note-section">
          <p class="eyebrow">${escapeMarkup(translate("recipes.ingredients"))}</p>
          <p>${escapeMarkup(recipe.ingredients || translate("recipes.noIngredients")).replace(/\n/g, "<br />")}</p>
        </section>
        <section class="recipe-note-section">
          <p class="eyebrow">${escapeMarkup(translate("recipes.steps"))}</p>
          <p>${escapeMarkup(recipe.steps || translate("recipes.noSteps")).replace(/\n/g, "<br />")}</p>
        </section>
        ${recipe.notes ? `<section class="recipe-note-section"><p class="eyebrow">${escapeMarkup(translate("recipes.notes"))}</p><p>${escapeMarkup(recipe.notes).replace(/\n/g, "<br />")}</p></section>` : ""}
      </article>
    `;
  }

  function restaurantThumb(restaurant) {
    return `
      <span class="recent-thumb ${escapeAttribute(restaurant.status)}">
        <img src="${escapeAttribute(restaurantImageUrl(restaurant))}" alt="">
      </span>
    `;
  }

  function restaurantRow(restaurant, options = {}) {
    const accent = accentVariant(restaurant.id);
    return `
      <article class="spot-row accent-${escapeAttribute(accent)}" data-restaurant-id="${escapeAttribute(restaurant.id)}">
        <span class="row-tape" aria-hidden="true"></span>
        ${restaurantThumb(restaurant)}
        <div class="spot-row-main">
          <div class="spot-row-title">
            <strong>${escapeMarkup(restaurant.name)}</strong>
            <span class="tag-pill ${escapeAttribute(restaurant.status)}">${escapeMarkup(statusLabel(restaurant.status))}</span>
          </div>
          <small>${options.body || ""}</small>
          ${options.note ? `<p>${escapeMarkup(options.note)}</p>` : ""}
        </div>
        ${options.actions ? `<div class="spot-row-actions">${options.actions}</div>` : ""}
      </article>
    `;
  }

  function listCover(list) {
    return list.cover_image_url
      ? `<span class="list-cover image-cover"><img src="${escapeAttribute(list.cover_image_url)}" alt=""></span>`
      : `<span class="list-cover">${list.visibility === "public" ? "🍜" : "▦"}</span>`;
  }

  return { recipeRow, recipeDetail, restaurantRow, restaurantThumb, listCover };
}
