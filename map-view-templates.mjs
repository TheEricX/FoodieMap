import { escapeMarkup } from "./ui-components.mjs";

const attr = escapeMarkup;
const listHook = {
  sidebar: "data-sidebar-list-id",
  mobileMap: "data-mobile-list-id",
  mobileLists: "data-mobile-my-list-id",
};

export function createMapViewTemplates({
  translate,
  restaurantThumb,
  restaurantImageUrl,
  statusLabel,
  visibilityLabel,
  shortMapName,
}) {
  const text = (key, params) => escapeMarkup(translate(key, params));

  function detailMeta(restaurant, distance = "") {
    return `
      <span>${escapeMarkup(statusLabel(restaurant.status))}</span>
      <span>☆ ${Number(restaurant.personal_rating || 0).toFixed(1)}</span>
      <span>${text("count.visits", { count: restaurant.visit_count || 0 })}</span>
      ${distance ? `<span>${escapeMarkup(distance)}</span>` : ""}
    `;
  }

  function listFilter(list, { active = false, variant = "sidebar" } = {}) {
    const hook = listHook[variant];
    if (!hook) throw new Error(`Unsupported list filter variant: ${variant}`);
    const draggable = variant === "sidebar" ? ' draggable="true"' : "";
    const handle = variant === "sidebar" ? '<span class="drag-handle" aria-hidden="true">⋮⋮</span>' : "";
    return `
      <button class="list-filter-item ${active ? "active" : ""}" type="button"${draggable} ${hook}="${attr(list.id)}">
        ${handle}
        <span class="list-filter-text">
          <strong>${escapeMarkup(list.title)}</strong>
          <small>${text("count.spots", { count: list.item_count || 0 })} · ${escapeMarkup(visibilityLabel(list.visibility))}</small>
        </span>
      </button>
    `;
  }

  function recentRestaurant(restaurant, meta) {
    return `
      <button class="recent-item" type="button" data-id="${attr(restaurant.id)}">
        ${restaurantThumb(restaurant)}
        <span>
          <strong>${escapeMarkup(restaurant.name)}</strong>
          <small>${escapeMarkup(meta)}</small>
        </span>
      </button>
    `;
  }

  function marker(restaurant, caption) {
    return `
      <span class="marker-photo">
        <img src="${attr(restaurantImageUrl(restaurant))}" alt="">
      </span>
      <span class="marker-caption">
        <strong>${escapeMarkup(shortMapName(restaurant.name))}</strong>
        <small>${escapeMarkup(caption)}</small>
      </span>
    `;
  }

  function spotDishes(restaurant) {
    return (restaurant.dishes || []).map((dish) => `
      <span class="dish-pill ${attr(dish.dish_status)}">
        ${dish.image_url ? `<img src="${attr(dish.image_url)}" alt="">` : ""}
        ${escapeMarkup(dish.name)} · ☆ ${Number(dish.rating || 0).toFixed(1)}
      </span>
    `).join("");
  }

  return { detailMeta, listFilter, recentRestaurant, marker, spotDishes };
}
