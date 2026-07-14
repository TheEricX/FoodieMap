import { escapeMarkup } from "./ui-components.mjs";

const attr = escapeMarkup;

export function createAccountShareTemplates({
  translate,
  formatDate,
  recipeImageUrl,
  restaurantThumb,
  emptyState,
  shortUserName,
  adminPlanLabel,
  adminStatusLabel,
  authMethodLabel,
}) {
  const text = (key, params) => escapeMarkup(translate(key, params));

  function sharePackHistory(pack) {
    return `
      <article class="share-pack-history-card">
        <a class="share-pack-history-poster" href="${attr(pack.card_url)}" target="_blank" rel="noreferrer" aria-label="${attr(translate("button.openImage"))}">
          <img src="${attr(pack.card_url)}" alt="${attr(translate("sharePack.cardAlt"))}" loading="lazy" data-share-pack-card-image />
        </a>
        <div class="share-pack-history-main">
          <div>
            <strong>${escapeMarkup(pack.title)}</strong>
            <small>${text("count.spots", { count: pack.item_count })} · ${escapeMarkup(formatDate(pack.created_at))}</small>
          </div>
          <p>${escapeMarkup(pack.description || translate("list.noDescription"))}</p>
          <div class="share-pack-history-actions">
            <button class="share-pack-history-action" type="button" data-copy-share-pack="${attr(pack.share_url)}">${text("button.copy")}</button>
            <a class="share-pack-history-action" href="${attr(pack.card_url)}" target="_blank" rel="noreferrer">${text("sharePack.imageAction")}</a>
            <a class="share-pack-history-action" href="${attr(pack.share_url)}" target="_blank" rel="noreferrer">${text("sharePack.previewAction")}</a>
            <button class="share-pack-history-action danger" type="button" data-revoke-share-pack="${attr(pack.token)}">${text("sharePack.revokeAction")}</button>
          </div>
        </div>
      </article>
    `;
  }

  function sharePackPublicItem(item) {
    const restaurant = item.restaurant;
    if (!restaurant) return "";
    return `
      <article class="share-pack-public-card">
        ${restaurantThumb(restaurant)}
        <div class="share-pack-public-main">
          <div class="spot-row-title">
            <strong>${escapeMarkup(restaurant.name)}</strong>
            <span class="tag-pill want_to_go">☆ ${Number(restaurant.personal_rating || 0).toFixed(1)}</span>
          </div>
          <small>${escapeMarkup(restaurant.address || translate("discovery.addressHidden"))}</small>
          ${item.note ? `<p>${escapeMarkup(item.note)}</p>` : ""}
          <div class="share-pack-public-dishes">
            ${(item.dishes || []).map((dish) => `
              <span>
                ${dish.image_url ? `<img src="${attr(dish.image_url)}" alt="">` : ""}
                ${escapeMarkup(dish.name)} · ☆ ${Number(dish.rating || 0).toFixed(1)}
              </span>
            `).join("")}
          </div>
          <button class="icon-link" type="button" data-open-map-restaurant="${attr(restaurant.id)}">${text("button.openMaps")}</button>
        </div>
      </article>
    `;
  }

  function sharePackPublicPage(data) {
    const owner = data.owner?.name || translate("discovery.foodie");
    return `
      <div class="share-pack-public-head">
        <div>
          <p class="eyebrow">${text("sharePack.previewEyebrow")}</p>
          <h1>${escapeMarkup(data.title)}</h1>
          <p>${escapeMarkup(data.description || translate("list.noDescription"))}</p>
          <div class="meta-row compact-meta">
            <span>${text("sharePack.byOwner", { name: owner })}</span>
            <span>${text("count.spots", { count: data.items.length })}</span>
          </div>
        </div>
        <button class="primary-button" type="button" data-add-share-pack>${text("button.addSharedPack")}</button>
      </div>
      <div class="share-pack-public-list">
        ${data.items.length ? data.items.map(sharePackPublicItem).join("") : emptyState(translate("sharePack.empty"), "")}
      </div>
    `;
  }

  function recipeSharePage(data) {
    const recipe = data.recipe;
    const owner = data.owner?.name || translate("discovery.foodie");
    return `
      <div class="share-pack-public-head">
        <div>
          <p class="eyebrow">${text("recipes.previewEyebrow")}</p>
          <h1>${escapeMarkup(recipe.title)}</h1>
          <p>${text("recipes.byOwner", { name: owner })}</p>
          <div class="meta-row compact-meta">
            <span>☆ ${Number(recipe.rating || 0).toFixed(1)}</span>
            <span>${escapeMarkup(recipe.cooked_at ? formatDate(recipe.cooked_at) : formatDate(data.created_at))}</span>
          </div>
        </div>
        <button class="primary-button" type="button" data-add-recipe-share>${text("recipes.saveShared")}</button>
      </div>
      <article class="recipe-detail-card public-recipe-card">
        <img class="recipe-hero-image" src="${attr(recipeImageUrl(recipe))}" alt="" />
        <section class="recipe-note-section">
          <p class="eyebrow">${text("recipes.ingredients")}</p>
          <p>${escapeMarkup(recipe.ingredients || translate("recipes.noIngredients")).replace(/\n/g, "<br />")}</p>
        </section>
        <section class="recipe-note-section">
          <p class="eyebrow">${text("recipes.steps")}</p>
          <p>${escapeMarkup(recipe.steps || translate("recipes.noSteps")).replace(/\n/g, "<br />")}</p>
        </section>
        ${recipe.notes ? `<section class="recipe-note-section"><p class="eyebrow">${text("recipes.notes")}</p><p>${escapeMarkup(recipe.notes).replace(/\n/g, "<br />")}</p></section>` : ""}
      </article>
    `;
  }

  function adminUserRow(user) {
    const limitLabel = user.restaurant_limit == null
      ? translate("admin.unlimited")
      : translate("admin.limit", { count: user.restaurant_count, limit: user.restaurant_limit });
    const authLabel = translate("admin.authMethods", { methods: authMethodLabel(user.auth_methods || []) });
    const statusClass = `admin-status-${attr(user.account_status)}`;
    const id = attr(user.id);
    return `
      <article class="admin-user-row ${statusClass}" data-admin-user-id="${id}">
        <div class="admin-user-main">
          <div class="admin-user-avatar">${escapeMarkup(shortUserName(user))}</div>
          <div>
            <div class="admin-user-title"><strong>${escapeMarkup(user.name || user.email)}</strong></div>
            <small>${escapeMarkup(user.email)}</small>
            <div class="admin-user-meta">
              <span>${text("admin.restaurants", { count: user.restaurant_count })}</span>
              <span>${text("admin.lists", { count: user.list_count })}</span>
              <span>${text("admin.publicLists", { count: user.public_list_count })}</span>
              <span>${escapeMarkup(limitLabel)}</span>
              <span>${escapeMarkup(authLabel)}</span>
            </div>
            <div class="admin-user-meta muted">
              <span>${text("admin.created", { date: formatDate(user.created_at) })}</span>
              <span>${text("admin.updated", { date: formatDate(user.updated_at) })}</span>
            </div>
          </div>
        </div>
        <div class="admin-user-state">
          <span class="tag-pill ${user.plan === "paid" ? "favorite" : "want_to_go"}">${escapeMarkup(adminPlanLabel(user.plan))}</span>
          <span class="tag-pill ${user.account_status === "active" ? "visited" : user.account_status === "suspended" ? "want_to_go" : "favorite"}">${escapeMarkup(adminStatusLabel(user.account_status))}</span>
        </div>
        <div class="admin-user-actions">
          <button class="secondary-button compact-action" type="button" data-admin-action="plan" data-user-id="${id}" data-next-plan="${user.plan === "paid" ? "free" : "paid"}">${text(user.plan === "paid" ? "admin.makeFree" : "admin.makePaid")}</button>
          ${user.account_status === "active"
            ? `<button class="secondary-button compact-action" type="button" data-admin-action="suspend" data-user-id="${id}">${text("admin.suspend")}</button>`
            : `<button class="secondary-button compact-action" type="button" data-admin-action="reactivate" data-user-id="${id}">${text("admin.reactivate")}</button>`}
          ${user.account_status === "deleted"
            ? `<button class="secondary-button compact-action" type="button" data-admin-action="restore" data-user-id="${id}">${text("admin.restore")}</button>`
            : `<button class="secondary-button compact-action danger" type="button" data-admin-action="delete" data-user-id="${id}">${text("admin.softDelete")}</button>`}
        </div>
      </article>
    `;
  }

  return { sharePackHistory, sharePackPublicItem, sharePackPublicPage, recipeSharePage, adminUserRow };
}
