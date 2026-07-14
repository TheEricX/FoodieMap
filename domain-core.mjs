function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, Number(value) || 0));
}

export function createDomainModel({ translate = (key) => key, now = () => Date.now() } = {}) {
  function normalizeDish(item = {}) {
    return {
      id: String(item.id ?? ""),
      restaurant_id: String(item.restaurant_id || ""),
      name: String(item.name || translate("detail.dishName")),
      dish_status: ["liked", "tried"].includes(item.dish_status) ? item.dish_status : "tried",
      rating: clamp(item.rating, 0, 5),
      image_url: String(item.image_url || ""),
      notes: String(item.notes || ""),
    };
  }

  function normalizeRestaurant(item = {}) {
    return {
      id: String(item.id ?? ""),
      name: String(item.name || translate("spot.untitled")),
      address: String(item.address || ""),
      lat: Number(item.lat),
      lng: Number(item.lng),
      google_url: String(item.google_url || item.googleUrl || `https://www.google.com/maps?q=${item.lat},${item.lng}`),
      status: ["visited", "want_to_go", "favorite"].includes(item.status) ? item.status : "want_to_go",
      visit_count: Math.max(0, Number(item.visit_count ?? item.visitCount ?? 0) || 0),
      personal_rating: clamp(item.personal_rating ?? item.rating, 0, 5),
      notes: String(item.notes || ""),
      dishes: Array.isArray(item.dishes) ? item.dishes.map(normalizeDish) : [],
      created_at: item.created_at ?? item.createdAt ?? now(),
      updated_at: item.updated_at ?? item.updatedAt ?? now(),
    };
  }

  function normalizeList(item = {}) {
    return {
      id: String(item.id ?? ""),
      owner_user_id: String(item.owner_user_id || ""),
      owner: item.owner || null,
      title: String(item.title || translate("list.choose")),
      description: String(item.description || ""),
      visibility: item.visibility === "public" ? "public" : "private",
      cover_image_url: String(item.cover_image_url || ""),
      copy_count: Math.max(0, Number(item.copy_count || 0)),
      item_count: Math.max(0, Number(item.item_count || 0)),
      created_at: Number(item.created_at || 0),
      updated_at: Number(item.updated_at || 0),
      published_at: item.published_at ? Number(item.published_at) : null,
      items: Array.isArray(item.items)
        ? item.items.map((entry) => ({
            id: String(entry.id ?? ""),
            list_id: String(entry.list_id || ""),
            restaurant_id: String(entry.restaurant_id || ""),
            note: String(entry.note || ""),
            sort_order: Number(entry.sort_order || 0),
            created_at: Number(entry.created_at || 0),
            restaurant: entry.restaurant ? normalizeRestaurant(entry.restaurant) : null,
          }))
        : undefined,
    };
  }

  function normalizeRecipe(item = {}) {
    return {
      id: String(item.id || ""),
      title: String(item.title || translate("recipes.formTitle")),
      ingredients: String(item.ingredients || ""),
      steps: String(item.steps || ""),
      notes: String(item.notes || ""),
      rating: clamp(item.rating, 0, 5),
      cooked_at: Number(item.cooked_at || 0),
      image_url: String(item.image_url || ""),
      created_at: Number(item.created_at || 0),
      updated_at: Number(item.updated_at || 0),
    };
  }

  function normalizeSharePack(item = {}) {
    return {
      token: String(item.token || ""),
      title: String(item.title || translate("sharePack.title")),
      description: String(item.description || ""),
      owner: item.owner || null,
      share_url: String(item.share_url || ""),
      qr_url: String(item.qr_url || ""),
      created_at: Number(item.created_at || 0),
      items: Array.isArray(item.items)
        ? item.items.map((entry) => ({
            id: String(entry.id || ""),
            note: String(entry.note || ""),
            sort_order: Number(entry.sort_order || 0),
            restaurant: entry.restaurant ? normalizeRestaurant({ ...entry.restaurant, dishes: entry.dishes || [] }) : null,
            dishes: Array.isArray(entry.dishes) ? entry.dishes.map(normalizeDish) : [],
          }))
        : [],
    };
  }

  function normalizeSharePackSummary(item = {}) {
    return {
      token: String(item.token || ""),
      title: String(item.title || translate("sharePack.title")),
      description: String(item.description || ""),
      created_at: Number(item.created_at || 0),
      item_count: Number(item.item_count || 0),
      share_url: String(item.share_url || ""),
      qr_url: String(item.qr_url || ""),
      card_url: String(item.card_url || ""),
    };
  }

  function normalizeRecipeShare(item = {}) {
    return {
      token: String(item.token || ""),
      owner: item.owner || null,
      share_url: String(item.share_url || ""),
      qr_url: String(item.qr_url || ""),
      card_url: String(item.card_url || ""),
      created_at: Number(item.created_at || 0),
      recipe: normalizeRecipe(item.recipe || {}),
    };
  }

  return {
    normalizeDish,
    normalizeRestaurant,
    normalizeList,
    normalizeRecipe,
    normalizeSharePack,
    normalizeSharePackSummary,
    normalizeRecipeShare,
  };
}

export function findById(items, id) {
  return items.find((item) => String(item.id) === String(id)) ?? null;
}

export function upsertById(items, value) {
  const index = items.findIndex((item) => String(item.id) === String(value.id));
  if (index < 0) return [value, ...items];
  return items.map((item, itemIndex) => (itemIndex === index ? value : item));
}

export function orderByIds(items, ids) {
  const order = ids.map(String);
  const rank = new Map(order.map((id, index) => [id, index]));
  return [...items].sort((left, right) => {
    const leftRank = rank.has(String(left.id)) ? rank.get(String(left.id)) : Number.MAX_SAFE_INTEGER;
    const rightRank = rank.has(String(right.id)) ? rank.get(String(right.id)) : Number.MAX_SAFE_INTEGER;
    return leftRank - rightRank;
  });
}

export function sortDiscoveryLists(items, mode = "popular") {
  return [...items].sort((left, right) => {
    if (mode === "recent") return Number(right.published_at || 0) - Number(left.published_at || 0);
    return Number(right.copy_count || 0) - Number(left.copy_count || 0)
      || Number(right.item_count || 0) - Number(left.item_count || 0);
  });
}

export function selectVisibleItem(items, visibleItems, selectedId) {
  return findById(items, selectedId) ?? visibleItems[0] ?? items[0] ?? null;
}
