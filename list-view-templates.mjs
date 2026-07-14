import { escapeMarkup } from "./ui-components.mjs";

const attr = escapeMarkup;

export function createListViewTemplates({
  translate,
  emptyState,
  listCover,
  restaurantRow,
  restaurantsForSystemList,
  sortRestaurants,
  sortListItems,
  restaurantSearchText,
  systemListEyebrow,
  systemListTitle,
  systemListDescription,
  listSortDescription,
  isLocationReady,
  distanceLabel,
  statusLabel,
  visibilityLabel,
  formatDate,
}) {
  const text = (key, params) => escapeMarkup(translate(key, params));
  const meta = (...parts) => parts.filter(Boolean).map(escapeMarkup).join(" · ");

  function systemSpotItem(restaurant) {
    const id = attr(restaurant.id);
    return restaurantRow(restaurant, {
      body: meta(distanceLabel(restaurant), `☆ ${Number(restaurant.personal_rating || 0).toFixed(1)}`, statusLabel(restaurant.status), translate("count.visits", { count: restaurant.visit_count || 0 })),
      actions: `
        <button class="icon-link" type="button" data-open-spot="${id}">${text("button.map")}</button>
        <button class="icon-link" type="button" data-open-map-restaurant="${id}">${text("button.openMaps")}</button>
        <button class="icon-link danger-text" type="button" data-delete-spot="${id}">${text("button.delete")}</button>
      `,
    });
  }

  function systemListDetail(definition, term = "") {
    const spots = sortRestaurants(restaurantsForSystemList(definition).filter((restaurant) => restaurantSearchText(restaurant).includes(term)));
    return `
      <div class="list-view-head">
        <div>
          <p class="eyebrow">${escapeMarkup(systemListEyebrow(definition))}</p>
          <h2>${escapeMarkup(systemListTitle(definition))}</h2>
          <p>${escapeMarkup(systemListDescription(definition))} ${escapeMarkup(listSortDescription())}.</p>
        </div>
        <div class="list-view-meta">
          <span>${text("count.spots", { count: spots.length })}</span>
          <span>${text(isLocationReady() ? "sort.nearest" : "sort.recent")}</span>
        </div>
      </div>
      <div class="detail-actions system-actions compact-actions">
        <button class="outline-button" type="button" data-view-system-map>${text("button.openMap")}</button>
      </div>
      <div class="spot-row-list restaurant-list-mode">
        ${spots.length ? spots.map(systemSpotItem).join("") : emptyState(translate("list.noSmartSpots"), "")}
      </div>
    `;
  }

  function listCard(list, selected, mode) {
    return `
      <button class="list-card ${selected ? "selected" : ""}" type="button" data-list-id="${attr(list.id)}">
        ${listCover(list)}
        <span class="list-card-body">
          <strong>${escapeMarkup(list.title)}</strong>
          <small>${escapeMarkup(list.description || translate("list.noDescription"))}</small>
          <span class="list-meta-row">
            <span>${text("count.spots", { count: list.item_count || 0 })}</span>
            <span>${mode === "public" ? text("count.copies", { count: list.copy_count || 0 }) : escapeMarkup(visibilityLabel(list.visibility))}</span>
          </span>
        </span>
      </button>
    `;
  }

  function ownedListItem(item) {
    const restaurant = item.restaurant;
    if (!restaurant) return "";
    const id = attr(restaurant.id);
    return restaurantRow(restaurant, {
      body: meta(distanceLabel(restaurant), `☆ ${Number(restaurant.personal_rating || 0).toFixed(1)}`, statusLabel(restaurant.status), translate("count.visits", { count: restaurant.visit_count || 0 })),
      actions: `
        <button class="icon-link" type="button" data-open-spot="${id}">${text("button.map")}</button>
        <button class="icon-link" type="button" data-open-map-restaurant="${id}">${text("button.openMaps")}</button>
        <button class="icon-link danger-text" type="button" data-remove-list-spot="${id}">${text("button.remove")}</button>
      `,
    });
  }

  function publicListItem(item) {
    const restaurant = item.restaurant;
    if (!restaurant) return "";
    return restaurantRow(restaurant, {
      body: meta(distanceLabel(restaurant), `☆ ${Number(restaurant.personal_rating || 0).toFixed(1)}`, restaurant.address || translate("discovery.addressHidden")),
      actions: `<button class="icon-link" type="button" data-open-map-restaurant="${attr(restaurant.id)}">${text("button.openMaps")}</button>`,
    });
  }

  function myListDetail(list, term = "") {
    const isPublic = list.visibility === "public";
    const items = sortListItems((list.items ?? []).filter((item) => {
      if (!term) return true;
      const restaurant = item.restaurant;
      return restaurant && (restaurantSearchText(restaurant).includes(term) || String(item.note || "").toLowerCase().includes(term));
    }));
    return `
      <div class="list-view-head">
        <div>
          <p class="eyebrow">${text(isPublic ? "list.public" : "list.private")}</p>
          <h2>${escapeMarkup(list.title)}</h2>
          <p>${escapeMarkup(list.description || translate("list.noDescription"))}</p>
        </div>
        <div class="list-view-tools">
          <div class="list-view-meta">
            <span>${text("count.spots", { count: items.length })}</span>
            <span>${text(isLocationReady() ? "sort.nearest" : "sort.recent")}</span>
            <span>${escapeMarkup(visibilityLabel(list.visibility))}</span>
            <span>${text("list.updated", { date: formatDate(list.updated_at) })}</span>
          </div>
          <details class="manage-list-menu">
            <summary>${text("list.manage")}</summary>
            <div class="manage-list-actions">
              <button type="button" data-list-action="edit">${text("button.edit")}</button>
              <button type="button" data-list-action="publish">${text(isPublic ? "button.unpublish" : "button.publish")}</button>
              <button type="button" data-list-action="add">${text("button.addSpots")}</button>
              <button class="danger-text" type="button" data-list-action="delete">${text("button.deleteList")}</button>
            </div>
          </details>
        </div>
      </div>
      <div class="detail-actions system-actions compact-actions">
        <button class="outline-button" type="button" data-list-action="map">${text("button.openMap")}</button>
      </div>
      <div class="spot-row-list restaurant-list-mode">
        ${items.length ? items.map(ownedListItem).join("") : emptyState((list.items ?? []).length ? translate("list.noSearchResults") : translate("list.empty"), "")}
      </div>
    `;
  }

  function discoveryDetail(list) {
    const owner = list.owner?.name || translate("discovery.foodie");
    return `
      <div class="detail-head public-detail">
        ${listCover(list)}
        <div>
          <p class="eyebrow">${text("discovery.publicPick")}</p>
          <h2>${escapeMarkup(list.title)}</h2>
          <p>${escapeMarkup(list.description || translate("list.noDescription"))}</p>
          <div class="meta-row compact-meta">
            <span>${text("count.spots", { count: list.item_count || 0 })}</span>
            <span>${text("count.copies", { count: list.copy_count || 0 })}</span>
            <span>${text("discovery.byOwner", { name: owner })}</span>
          </div>
        </div>
      </div>
      <button class="primary-button compact full" type="button" data-copy-public>${text("button.copyToMyLists")}</button>
      <div class="spot-row-list">
        ${(list.items ?? []).length ? sortListItems(list.items).map(publicListItem).join("") : emptyState(translate("discovery.noVisible"), "")}
      </div>
    `;
  }

  return { systemListDetail, systemSpotItem, listCard, myListDetail, discoveryDetail, ownedListItem, publicListItem };
}
