const GOOGLE_MAPS_HELP = "推荐复制 Google Maps 浏览器地址栏里的完整链接；短分享链接会由本地服务自动展开。";
const LOCATION_DENIED_HELP = "定位权限已被浏览器拒绝。请点地址栏左侧图标 > 定位 > 允许或询问，然后再点 Use My Location。";
const LIST_FILTER_ORDER_KEY = "foodiemap:list-filter-order";
const MAP_ZOOM_MIN = 0.65;
const MAP_ZOOM_MAX = 2.8;
const MAP_ZOOM_STEP = 0.18;
const FOOD_PLACEHOLDERS = [
  { icon: "🍜", top: "#f4c49d", bottom: "#fff7ed", accent: "#96694c" },
  { icon: "🥘", top: "#dce6af", bottom: "#fffaf4", accent: "#7a8450" },
  { icon: "🍰", top: "#f7d8cd", bottom: "#fff8f0", accent: "#b58a6b" },
  { icon: "🥗", top: "#cfe5cf", bottom: "#fffdf8", accent: "#556030" },
  { icon: "🍣", top: "#f4dfb8", bottom: "#fffaf4", accent: "#d4a373" },
  { icon: "☕", top: "#ead8c9", bottom: "#fff8f0", accent: "#68442d" },
];

const demoRestaurants = [
  {
    id: "demo-hachi",
    name: "Hachi Ramen",
    address: "131 Beecroft Rd, Toronto",
    lat: 43.7682,
    lng: -79.4139,
    google_url: "https://www.google.com/maps?q=43.7682,-79.4139",
    status: "visited",
    visit_count: 3,
    personal_rating: 4.9,
    notes: "汤底浓郁，适合寒冷晚上。队伍可能有点久。",
    dishes: [
      { id: "demo-dish-1", name: "Tonkotsu", dish_status: "liked", rating: 4.9, image_url: "", notes: "" },
      { id: "demo-dish-2", name: "Gyoza", dish_status: "tried", rating: 4.4, image_url: "", notes: "" },
    ],
  },
  {
    id: "demo-onigiri",
    name: "Onigiri Corner",
    address: "100 Queen St W, Toronto",
    lat: 43.6535,
    lng: -79.3839,
    google_url: "https://www.google.com/maps?q=43.6535,-79.3839",
    status: "want_to_go",
    visit_count: 0,
    personal_rating: 4.5,
    notes: "想试明太子饭团和抹茶。",
    dishes: [{ id: "demo-dish-3", name: "Mentaiko", dish_status: "liked", rating: 4.5, image_url: "", notes: "" }],
  },
  {
    id: "demo-matcha",
    name: "Matcha Mornings",
    address: "30 Carlton St, Toronto",
    lat: 43.6618,
    lng: -79.3817,
    google_url: "https://www.google.com/maps?q=43.6618,-79.3817",
    status: "favorite",
    visit_count: 2,
    personal_rating: 4.8,
    notes: "甜品稳定，适合周末下午。",
    dishes: [{ id: "demo-dish-4", name: "Matcha Latte", dish_status: "liked", rating: 4.8, image_url: "", notes: "" }],
  },
];

const systemLists = [
  { key: "all", title: "All Spots", eyebrow: "EVERYTHING", icon: "◎", description: "Every restaurant saved on your map.", filter: "all" },
  { key: "visited", title: "Visited", eyebrow: "BEEN THERE", icon: "🍴", description: "Places you have already tried.", filter: "visited" },
  { key: "want_to_go", title: "Want to Go", eyebrow: "NEXT UP", icon: "⌑", description: "Restaurants waiting for a first visit.", filter: "want_to_go" },
  { key: "favorite", title: "Favorites", eyebrow: "LOVED", icon: "♥", description: "Your favorite spots in one quick list.", filter: "favorite" },
];

let restaurants = [];
let currentUser = null;
let currentLocation = null;
let activeFilter = "all";
let selectedRestaurantId = null;
let isSpotCardOpen = true;
let editingRestaurantId = null;
let shortLinkResolveTimer = null;
let shareToken = getShareToken();
let shareData = null;
let activeView = getInitialView();
let lists = [];
let discoveryLists = [];
let selectedListId = null;
let activeMyListKey = "system:all";
let selectedDiscoveryListId = null;
let editingListId = null;
let addSpotsListId = null;
let discoverySort = "popular";
let mapZoom = 1;
let isDetailAddDishOpen = false;
let activeDetailRestaurantId = null;
let detailCloseTimer = null;

const DISH_AUTOSAVE_DELAY = 700;
const REVIEW_AUTOSAVE_DELAY = 700;
const editingDetailDishIds = new Set();
const dishAutosaveTimers = new Map();
let reviewAutosaveTimer = null;
let isRenderingSpotDetail = false;

const elements = {
  topbar: document.querySelector(".topbar"),
  sidebar: document.querySelector(".sidebar"),
  searchInput: document.querySelector("#searchInput"),
  locateButton: document.querySelector("#locateButton"),
  mapLocateButton: document.querySelector("#mapLocateButton"),
  settingsButton: document.querySelector("#settingsButton"),
  loginButton: document.querySelector("#loginButton"),
  openAddPanel: document.querySelector("#openAddPanel"),
  pasteAddButton: document.querySelector("#pasteAddButton"),
  pasteStatus: document.querySelector("#pasteStatus"),
  exportButton: document.querySelector("#exportButton"),
  importButton: document.querySelector("#importButton"),
  importFile: document.querySelector("#importFile"),
  resetButton: document.querySelector("#resetButton"),
  closeAddPanel: document.querySelector("#closeAddPanel"),
  addDialog: document.querySelector("#addDialog"),
  restaurantForm: document.querySelector("#restaurantForm"),
  googleUrlInput: document.querySelector('input[name="googleUrl"]'),
  formModeLabel: document.querySelector("#formModeLabel"),
  formTitle: document.querySelector("#formTitle"),
  saveSpotButton: document.querySelector("#saveSpotButton"),
  formHelp: document.querySelector("#formHelp"),
  dishEditor: document.querySelector("#dishEditor"),
  dishEditorList: document.querySelector("#dishEditorList"),
  dishNameInput: document.querySelector("#dishNameInput"),
  dishStatusInput: document.querySelector("#dishStatusInput"),
  dishRatingInput: document.querySelector("#dishRatingInput"),
  addDishButton: document.querySelector("#addDishButton"),
  settingsDialog: document.querySelector("#settingsDialog"),
  settingsForm: document.querySelector("#settingsForm"),
  closeSettings: document.querySelector("#closeSettings"),
  googleApiKey: document.querySelector("#googleApiKey"),
  cuteMap: document.querySelector("#cuteMap"),
  mapZoomOut: document.querySelector("#mapZoomOut"),
  mapZoomIn: document.querySelector("#mapZoomIn"),
  mapZoomReset: document.querySelector("#mapZoomReset"),
  mapZoomLabel: document.querySelector("#mapZoomLabel"),
  markersLayer: document.querySelector("#markersLayer"),
  emptyMap: document.querySelector("#emptyMap"),
  locationStatus: document.querySelector("#locationStatus"),
  mapCategoryEyebrow: document.querySelector("#mapCategoryEyebrow"),
  mapCategoryTitle: document.querySelector("#mapCategoryTitle"),
  mapCategorySummary: document.querySelector("#mapCategorySummary"),
  recentList: document.querySelector("#recentList"),
  placeCount: document.querySelector("#placeCount"),
  countAll: document.querySelector("#countAll"),
  countVisited: document.querySelector("#countVisited"),
  countWant: document.querySelector("#countWant"),
  countFavorite: document.querySelector("#countFavorite"),
  spotCard: document.querySelector("#spotCard"),
  spotCardTab: document.querySelector("#spotCardTab"),
  spotCardTabName: document.querySelector("#spotCardTabName"),
  spotName: document.querySelector("#spotName"),
  spotDistance: document.querySelector("#spotDistance"),
  spotRating: document.querySelector("#spotRating"),
  spotStatus: document.querySelector("#spotStatus"),
  spotNotes: document.querySelector("#spotNotes"),
  spotDishes: document.querySelector("#spotDishes"),
  openGoogleMaps: document.querySelector("#openGoogleMaps"),
  openSpotDetail: document.querySelector("#openSpotDetail"),
  closeCard: document.querySelector("#closeCard"),
  editSpot: document.querySelector("#editSpot"),
  shareSpot: document.querySelector("#shareSpot"),
  deleteSpot: document.querySelector("#deleteSpot"),
  spotDetailDialog: document.querySelector("#spotDetailDialog"),
  spotDetailForm: document.querySelector("#spotDetailForm"),
  closeSpotDetail: document.querySelector("#closeSpotDetail"),
  detailSpotName: document.querySelector("#detailSpotName"),
  detailSpotMeta: document.querySelector("#detailSpotMeta"),
  detailStatus: document.querySelector("#detailStatus"),
  detailDishName: document.querySelector("#detailDishName"),
  detailDishStatus: document.querySelector("#detailDishStatus"),
  detailDishRating: document.querySelector("#detailDishRating"),
  detailDishImage: document.querySelector("#detailDishImage"),
  detailDishImageName: document.querySelector("#detailDishImageName"),
  detailDishNotes: document.querySelector("#detailDishNotes"),
  detailAddDishPanel: document.querySelector("#detailAddDishPanel"),
  detailAddDishToggle: document.querySelector("#detailAddDishToggle"),
  detailAddDish: document.querySelector("#detailAddDish"),
  detailCancelDish: document.querySelector("#detailCancelDish"),
  detailDishList: document.querySelector("#detailDishList"),
  shareDialog: document.querySelector("#shareDialog"),
  shareForm: document.querySelector("#shareForm"),
  closeShareDialog: document.querySelector("#closeShareDialog"),
  shareDishList: document.querySelector("#shareDishList"),
  shareUrlInput: document.querySelector("#shareUrlInput"),
  createShareButton: document.querySelector("#createShareButton"),
  copyShareButton: document.querySelector("#copyShareButton"),
  navLinks: document.querySelectorAll("[data-view]"),
  viewPanels: document.querySelectorAll("[data-view-panel]"),
  mapView: document.querySelector("#mapView"),
  listsView: document.querySelector("#listsView"),
  discoveryView: document.querySelector("#discoveryView"),
  createListButton: document.querySelector("#createListButton"),
  sidebarListFilters: document.querySelector("#sidebarListFilters"),
  myListDetail: document.querySelector("#myListDetail"),
  discoveryGrid: document.querySelector("#discoveryGrid"),
  discoveryDetail: document.querySelector("#discoveryDetail"),
  listDialog: document.querySelector("#listDialog"),
  listForm: document.querySelector("#listForm"),
  listFormMode: document.querySelector("#listFormMode"),
  listFormTitle: document.querySelector("#listFormTitle"),
  listFormHelp: document.querySelector("#listFormHelp"),
  saveListButton: document.querySelector("#saveListButton"),
  closeListDialog: document.querySelector("#closeListDialog"),
  addSpotsDialog: document.querySelector("#addSpotsDialog"),
  closeAddSpotsDialog: document.querySelector("#closeAddSpotsDialog"),
  addSpotsSearch: document.querySelector("#addSpotsSearch"),
  addSpotsList: document.querySelector("#addSpotsList"),
};

boot();

async function boot() {
  bindEvents();
  await loadMe();
  if (shareToken) {
    activeView = "my-map";
    await loadSharePage(shareToken);
  } else {
    await loadRestaurants();
    await loadLists();
    await loadDiscoveryLists();
  }
  setActiveView(activeView, { push: false });
  checkShortLinkService();
  requestLocation();
}

function bindEvents() {
  elements.locateButton.addEventListener("click", requestLocation);
  elements.mapLocateButton?.addEventListener("click", requestLocation);
  elements.loginButton.addEventListener("click", handleLoginButton);
  elements.openAddPanel.addEventListener("click", openCreateDialog);
  elements.pasteAddButton.addEventListener("click", pasteAndAddFromClipboard);
  elements.closeAddPanel.addEventListener("click", closeRestaurantDialog);
  elements.closeCard.addEventListener("click", () => {
    isSpotCardOpen = false;
    renderSpotCard();
  });
  elements.spotCardTab.addEventListener("click", () => {
    isSpotCardOpen = true;
    renderSpotCard();
  });
  elements.openSpotDetail.addEventListener("click", openSpotDetail);
  elements.closeSpotDetail.addEventListener("click", closeSpotDetail);
  elements.spotDetailDialog.addEventListener("click", closeSpotDetailFromBackdrop);
  elements.spotDetailForm.addEventListener("submit", saveDetailRestaurant);
  elements.spotDetailForm.querySelectorAll("[data-detail-review-field]").forEach((field) => {
    field.addEventListener("input", scheduleDetailReviewAutosave);
    field.addEventListener("change", scheduleDetailReviewAutosave);
  });
  elements.spotDetailForm.querySelectorAll("[data-detail-review-status]").forEach((button) => {
    button.addEventListener("click", () => setDetailReviewStatus(button.dataset.detailReviewStatus));
  });
  elements.detailAddDishToggle.addEventListener("click", () => setDetailAddDishOpen(!isDetailAddDishOpen));
  elements.detailAddDish.addEventListener("click", addDishFromDetail);
  elements.detailCancelDish.addEventListener("click", cancelDetailDishAdd);
  bindDetailFileDropzone(elements.detailDishImage.closest("[data-detail-file-dropzone]"), elements.detailDishImage, {
    onFileSelected: () => updateDetailDishImageName(),
  });
  document.querySelectorAll("[data-detail-dish-status]").forEach((button) => {
    button.addEventListener("click", () => setDetailDishStatus(button.dataset.detailDishStatus));
  });
  elements.editSpot.addEventListener("click", openEditDialog);
  elements.shareSpot.addEventListener("click", openShareDialog);
  elements.deleteSpot.addEventListener("click", deleteSelectedRestaurant);
  elements.searchInput.addEventListener("input", render);
  elements.navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      setActiveView(link.dataset.view);
    });
  });
  window.addEventListener("hashchange", () => setActiveView(getInitialView(), { push: false }));
  window.addEventListener("scroll", updateTopbarElevation, { passive: true });
  [elements.sidebar, elements.mapView, elements.listsView, elements.discoveryView].forEach((scrollArea) => {
    scrollArea?.addEventListener("scroll", updateTopbarElevation, { passive: true });
  });
  elements.createListButton.addEventListener("click", openCreateListDialog);
  elements.closeListDialog.addEventListener("click", () => closeListDialog());
  elements.listForm.addEventListener("submit", saveListFromForm);
  elements.closeAddSpotsDialog.addEventListener("click", () => elements.addSpotsDialog.close());
  elements.addSpotsSearch.addEventListener("input", renderAddSpotsDialog);
  elements.cuteMap.addEventListener("wheel", handleMapWheel, { passive: false });
  elements.mapZoomOut.addEventListener("click", () => setMapZoom(mapZoom - MAP_ZOOM_STEP));
  elements.mapZoomIn.addEventListener("click", () => setMapZoom(mapZoom + MAP_ZOOM_STEP));
  elements.mapZoomReset.addEventListener("click", () => setMapZoom(1));
  document.querySelectorAll("[data-discovery-sort]").forEach((button) => {
    button.addEventListener("click", () => {
      discoverySort = button.dataset.discoverySort;
      document.querySelectorAll("[data-discovery-sort]").forEach((item) => item.classList.toggle("active", item === button));
      renderDiscoveryView();
    });
  });
  elements.googleUrlInput.addEventListener("input", autofillFromGoogleMapsUrl);
  elements.restaurantForm.addEventListener("submit", saveRestaurantFromForm);
  elements.addDishButton.addEventListener("click", addDishFromEditor);
  elements.closeShareDialog.addEventListener("click", () => elements.shareDialog.close());
  elements.shareForm.addEventListener("submit", createShareLink);
  elements.copyShareButton.addEventListener("click", copyShareLink);
  elements.exportButton.addEventListener("click", exportRestaurants);
  elements.importButton.addEventListener("click", () => alert("云端版本暂不导入本地 JSON。"));
  elements.resetButton.addEventListener("click", resetDemoData);
  elements.settingsButton.addEventListener("click", () => elements.settingsDialog.showModal());
  elements.closeSettings.addEventListener("click", () => elements.settingsDialog.close());
  elements.settingsForm.addEventListener("submit", (event) => {
    event.preventDefault();
    elements.settingsDialog.close();
  });

  document.querySelectorAll(".filter-item").forEach((button) => {
    button.addEventListener("click", () => {
      setActiveCategory(`system:${button.dataset.filter}`);
      syncFilterButtons();
      selectFirstVisibleRestaurant();
      render();
    });
  });
}

function syncFilterButtons() {
  document.querySelectorAll(".filter-item").forEach((item) => {
    item.classList.toggle("active", activeMyListKey === `system:${item.dataset.filter}`);
  });
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers ?? {}),
    },
  });
  if (response.status === 401) {
    throw new Error("请先使用 Google 登录。");
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail || data.error || "请求失败。");
  }
  return data;
}

async function loadMe() {
  try {
    const data = await api("/api/me");
    currentUser = data.user;
  } catch {
    currentUser = null;
  }
  renderAuth();
}

function renderAuth() {
  elements.loginButton.textContent = currentUser ? shortUserName(currentUser) : "Sign in";
  elements.loginButton.title = currentUser ? `${currentUser.email}，点击退出登录` : "使用 Google 登录";
  elements.pasteStatus.textContent = currentUser
    ? "复制 Google Maps 链接后点 Paste & Add。"
    : "当前是演示模式。登录后可保存云端数据、上传图片和分享。";
}

async function handleLoginButton() {
  if (!currentUser) {
    window.location.href = `/auth/google/login?next=${encodeURIComponent(location.pathname + location.search)}`;
    return;
  }
  if (!confirm(`退出 ${currentUser.email} 吗？`)) return;
  await api("/auth/logout", { method: "POST" });
  currentUser = null;
  restaurants = demoRestaurants.map(cloneRestaurant);
  lists = [];
  selectedListId = null;
  activeMyListKey = "system:all";
  activeFilter = "all";
  selectedRestaurantId = restaurants[0]?.id ?? null;
  renderAuth();
  render();
}

async function loadRestaurants() {
  if (!currentUser) {
    restaurants = demoRestaurants.map(cloneRestaurant);
  } else {
    const data = await api("/api/restaurants");
    restaurants = data.restaurants.map(normalizeRestaurant);
  }
  selectedRestaurantId = restaurants[0]?.id ?? null;
  isSpotCardOpen = Boolean(selectedRestaurantId);
  render();
}

async function loadLists() {
  if (!currentUser) {
    lists = [];
    selectedListId = null;
    return;
  }
  const data = await api("/api/lists");
  lists = data.lists.map(normalizeList);
  selectedListId = selectedListId && lists.some((list) => list.id === selectedListId) ? selectedListId : lists[0]?.id ?? null;
  if (activeMyListKey.startsWith("custom:") && !lists.some((list) => `custom:${list.id}` === activeMyListKey)) {
    setActiveCategory("system:all");
  }
}

async function loadListDetail(listId) {
  const data = await api(`/api/lists/${listId}`);
  const list = normalizeList(data.list);
  lists = lists.map((item) => (item.id === list.id ? list : item));
  if (!lists.some((item) => item.id === list.id)) lists = [list, ...lists];
  setActiveCategory(`custom:${list.id}`);
  return list;
}

async function loadDiscoveryLists() {
  const data = await api("/api/discovery/lists");
  discoveryLists = data.lists.map(normalizeList);
  selectedDiscoveryListId =
    selectedDiscoveryListId && discoveryLists.some((list) => list.id === selectedDiscoveryListId)
      ? selectedDiscoveryListId
      : discoveryLists[0]?.id ?? null;
}

async function loadDiscoveryDetail(listId) {
  const data = await api(`/api/discovery/lists/${listId}`);
  const list = normalizeList(data.list);
  discoveryLists = discoveryLists.map((item) => (item.id === list.id ? list : item));
  if (!discoveryLists.some((item) => item.id === list.id)) discoveryLists = [list, ...discoveryLists];
  selectedDiscoveryListId = list.id;
  return list;
}

async function loadSharePage(token) {
  const data = await api(`/api/share/${token}`);
  shareData = data.share;
  restaurants = [normalizeRestaurant({ ...shareData.restaurant, dishes: shareData.dishes })];
  selectedRestaurantId = restaurants[0].id;
  isSpotCardOpen = true;
  document.querySelector(".brand span:last-child").textContent = "Shared Bite";
  elements.openAddPanel.textContent = "＋ Add to My List";
  elements.openAddPanel.onclick = addSharedRestaurant;
  elements.pasteAddButton.hidden = true;
  elements.shareSpot.disabled = true;
  elements.editSpot.disabled = true;
  elements.deleteSpot.disabled = true;
  elements.pasteStatus.textContent = "朋友分享给你的店铺。可以预览，登录后一键加入自己的列表。";
  render();
}

function requireLogin() {
  if (currentUser) return true;
  if (confirm("这个操作需要 Google 登录。现在登录吗？")) {
    window.location.href = `/auth/google/login?next=${encodeURIComponent(location.pathname + location.search)}`;
  }
  return false;
}

async function addSharedRestaurant() {
  if (!shareToken || !requireLogin()) return;
  const data = await api(`/api/share/${shareToken}/add`, { method: "POST" });
  window.location.href = "/";
  return data;
}

function openCreateDialog() {
  if (shareToken) {
    addSharedRestaurant();
    return;
  }
  if (!requireLogin()) return;
  resetRestaurantForm();
  elements.dishEditor.hidden = true;
  elements.addDialog.showModal();
}

function openEditDialog() {
  if (!requireLogin()) return;
  const selected = selectedRestaurant();
  if (!selected) return;

  editingRestaurantId = selected.id;
  elements.formModeLabel.textContent = "EDIT_SPOT";
  elements.formTitle.textContent = "Edit Bite";
  elements.saveSpotButton.textContent = "Update Spot";
  elements.formHelp.textContent = "可以更新店铺记录，也可以在下方维护菜品和图片。";
  fillRestaurantForm(selected);
  renderDishEditor(selected);
  elements.dishEditor.hidden = false;
  elements.addDialog.showModal();
}

function fillRestaurantForm(restaurant) {
  const form = elements.restaurantForm.elements;
  form.id.value = restaurant.id;
  form.name.value = restaurant.name || "";
  form.address.value = restaurant.address || "";
  form.googleUrl.value = restaurant.google_url || "";
  form.lat.value = restaurant.lat ?? "";
  form.lng.value = restaurant.lng ?? "";
  form.status.value = restaurant.status || "want_to_go";
  form.personalRating.value = restaurant.personal_rating ?? 0;
  form.visitCount.value = restaurant.visit_count ?? 0;
  form.notes.value = restaurant.notes || "";
}

function closeRestaurantDialog() {
  elements.addDialog.close();
  resetRestaurantForm();
}

function resetRestaurantForm() {
  editingRestaurantId = null;
  elements.restaurantForm.reset();
  elements.formModeLabel.textContent = "NEW_SPOT";
  elements.formTitle.textContent = "Save a Bite";
  elements.saveSpotButton.textContent = "Save Spot";
  elements.formHelp.textContent = GOOGLE_MAPS_HELP;
  elements.dishEditor.hidden = true;
  elements.dishEditorList.innerHTML = "";
}

async function saveRestaurantFromForm(event) {
  event.preventDefault();
  if (!requireLogin()) return;
  const payload = getRestaurantPayload();
  try {
    elements.formHelp.textContent = "正在保存...";
    const coordinates = await resolveCoordinates(payload);
    const body = {
      name: payload.name,
      address: payload.address,
      lat: coordinates.lat,
      lng: coordinates.lng,
      google_url: payload.google_url || `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`,
      status: payload.status,
      visit_count: payload.visit_count,
      personal_rating: payload.personal_rating,
      notes: payload.notes,
    };
    const data = editingRestaurantId
      ? await api(`/api/restaurants/${editingRestaurantId}`, { method: "PATCH", body: JSON.stringify(body) })
      : await api("/api/restaurants", { method: "POST", body: JSON.stringify(body) });
    upsertRestaurant(data.restaurant);
    selectedRestaurantId = data.restaurant.id;
    isSpotCardOpen = true;
    if (!editingRestaurantId) {
      resetRestaurantForm();
      elements.addDialog.close();
    } else {
      editingRestaurantId = data.restaurant.id;
      fillRestaurantForm(data.restaurant);
      renderDishEditor(data.restaurant);
      elements.formHelp.textContent = "已保存。";
    }
    render();
  } catch (error) {
    elements.formHelp.textContent = error.message;
  }
}

function getRestaurantPayload() {
  const form = new FormData(elements.restaurantForm);
  const rating = Number(form.get("personalRating") ?? 0);
  const visitCount = Number(form.get("visitCount") ?? 0);
  return {
    name: String(form.get("name") ?? "").trim(),
    address: String(form.get("address") ?? "").trim(),
    google_url: String(form.get("googleUrl") ?? "").trim(),
    lat: String(form.get("lat") ?? "").trim(),
    lng: String(form.get("lng") ?? "").trim(),
    status: String(form.get("status") ?? "want_to_go"),
    personal_rating: Number.isFinite(rating) ? Math.max(0, Math.min(5, rating)) : 0,
    visit_count: Number.isFinite(visitCount) ? Math.max(0, Math.floor(visitCount)) : 0,
    notes: String(form.get("notes") ?? "").trim(),
  };
}

async function addDishFromEditor() {
  if (!editingRestaurantId || !requireLogin()) return;
  const name = elements.dishNameInput.value.trim();
  if (!name) {
    elements.formHelp.textContent = "请输入菜品名称。";
    return;
  }
  const data = await api(`/api/restaurants/${editingRestaurantId}/dishes`, {
    method: "POST",
    body: JSON.stringify({
      name,
      dish_status: elements.dishStatusInput.value,
      rating: Number(elements.dishRatingInput.value || 0),
      notes: "",
    }),
  });
  const restaurant = selectedRestaurant();
  restaurant.dishes = [data.dish, ...(restaurant.dishes ?? [])];
  elements.dishNameInput.value = "";
  renderDishEditor(restaurant);
  render();
}

function renderDishEditor(restaurant) {
  const dishes = restaurant.dishes ?? [];
  if (!dishes.length) {
    elements.dishEditorList.innerHTML = '<p class="form-help">还没有菜品记录。</p>';
    return;
  }
  elements.dishEditorList.innerHTML = dishes.map(dishEditorTemplate).join("");
  elements.dishEditorList.querySelectorAll("[data-dish-action]").forEach((button) => {
    button.addEventListener("click", () => handleDishAction(button));
  });
  elements.dishEditorList.querySelectorAll(".dish-image-input").forEach((input) => {
    input.addEventListener("change", () => uploadDishImage(input));
  });
}

function dishEditorTemplate(dish) {
  return `
    <article class="dish-editor-item" data-dish-id="${dish.id}">
      ${dish.image_url ? `<img src="${escapeHtml(dish.image_url)}" alt="">` : '<div class="dish-image-placeholder">IMG</div>'}
      <div class="dish-editor-fields">
        <input data-field="name" value="${escapeAttribute(dish.name)}" />
        <div class="dish-form-grid compact">
          <select data-field="dish_status">
            <option value="liked" ${dish.dish_status === "liked" ? "selected" : ""}>Liked</option>
            <option value="tried" ${dish.dish_status === "tried" ? "selected" : ""}>Tried</option>
          </select>
          <input data-field="rating" type="number" min="0" max="5" step="0.1" value="${Number(dish.rating || 0)}" />
          <input class="dish-image-input" type="file" accept="image/jpeg,image/png,image/webp" />
        </div>
        <textarea data-field="notes" rows="2" placeholder="这道菜的想法">${escapeHtml(dish.notes || "")}</textarea>
      </div>
      <div class="dish-editor-actions">
        <button class="secondary-button" type="button" data-dish-action="save">Save</button>
        <button class="secondary-button danger" type="button" data-dish-action="delete">Delete</button>
      </div>
    </article>
  `;
}

async function handleDishAction(button) {
  const item = button.closest(".dish-editor-item");
  const dishId = item.dataset.dishId;
  if (button.dataset.dishAction === "delete") {
    if (!confirm("删除这个菜品吗？")) return;
    await api(`/api/dishes/${dishId}`, { method: "DELETE" });
    removeDish(dishId);
    return;
  }
  const body = {
    name: item.querySelector('[data-field="name"]').value.trim(),
    dish_status: item.querySelector('[data-field="dish_status"]').value,
    rating: Number(item.querySelector('[data-field="rating"]').value || 0),
    notes: item.querySelector('[data-field="notes"]').value.trim(),
  };
  const data = await api(`/api/dishes/${dishId}`, { method: "PATCH", body: JSON.stringify(body) });
  replaceDish(data.dish);
}

async function uploadDishImage(input) {
  const item = input.closest(".dish-editor-item");
  const file = input.files?.[0];
  if (!file) return;
  const compressed = await compressImage(file);
  const form = new FormData();
  form.append("image", compressed, compressed.name);
  const data = await api(`/api/dishes/${item.dataset.dishId}/image`, { method: "POST", body: form });
  replaceDish(data.dish);
}

async function compressImage(file) {
  if (file.size <= 800_000 && file.type === "image/webp") return file;
  const image = await createImageBitmap(file);
  const maxSide = 1400;
  const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  const context = canvas.getContext("2d");
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/webp", 0.82));
  return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.webp`, { type: "image/webp" });
}

function replaceDish(updatedDish, { rerender = true } = {}) {
  const restaurant = selectedRestaurant();
  if (!restaurant) return;
  const normalized = normalizeDish(updatedDish);
  restaurant.dishes = (restaurant.dishes ?? []).map((dish) => (dish.id === normalized.id ? normalized : dish));
  syncRestaurantReferences(restaurant);
  if (editingRestaurantId === restaurant.id) renderDishEditor(restaurant);
  if (rerender && elements.spotDetailDialog.open) renderSpotDetail(restaurant);
  render();
}

function removeDish(dishId) {
  const restaurant = selectedRestaurant();
  if (!restaurant) return;
  restaurant.dishes = (restaurant.dishes ?? []).filter((dish) => dish.id !== dishId);
  syncRestaurantReferences(restaurant);
  if (editingRestaurantId === restaurant.id) renderDishEditor(restaurant);
  if (elements.spotDetailDialog.open) renderSpotDetail(restaurant);
  render();
}

function openShareDialog() {
  if (!requireLogin()) return;
  const restaurant = selectedRestaurant();
  if (!restaurant) return;
  elements.shareUrlInput.value = "";
  const dishes = restaurant.dishes ?? [];
  elements.shareDishList.innerHTML = dishes.length
    ? dishes.map((dish) => `
        <label class="share-dish-item">
          <input type="checkbox" value="${dish.id}" ${dish.dish_status === "liked" ? "checked" : ""} />
          <span>${escapeHtml(dish.name)}</span>
          <small>☆ ${Number(dish.rating || 0).toFixed(1)} · ${dish.dish_status === "liked" ? "Liked" : "Tried"}</small>
        </label>
      `).join("")
    : '<p class="form-help">这家店还没有菜品。可以先编辑店铺添加菜品，再分享。</p>';
  elements.createShareButton.disabled = !dishes.length;
  elements.shareDialog.showModal();
}

async function createShareLink(event) {
  event.preventDefault();
  const restaurant = selectedRestaurant();
  const selectedIds = [...elements.shareDishList.querySelectorAll("input:checked")].map((input) => input.value);
  const data = await api(`/api/restaurants/${restaurant.id}/share`, {
    method: "POST",
    body: JSON.stringify({ selected_dish_ids: selectedIds }),
  });
  elements.shareUrlInput.value = data.share_url;
}

async function copyShareLink() {
  if (!elements.shareUrlInput.value) return;
  await navigator.clipboard.writeText(elements.shareUrlInput.value);
  elements.copyShareButton.textContent = "Copied";
  window.setTimeout(() => (elements.copyShareButton.textContent = "Copy"), 1200);
}

async function deleteSelectedRestaurant() {
  if (!requireLogin()) return;
  const selected = selectedRestaurant();
  if (!selected) return;
  if (!confirm(`确定删除「${selected.name}」吗？\n\n这会同时删除这家店的菜单和图片记录。`)) return;
  await api(`/api/restaurants/${selected.id}`, { method: "DELETE" });
  restaurants = restaurants.filter((restaurant) => restaurant.id !== selected.id);
  selectedRestaurantId = restaurants[0]?.id ?? null;
  isSpotCardOpen = Boolean(selectedRestaurantId);
  closeSpotDetail();
  render();
}

function openSpotDetail() {
  const selected = selectedRestaurant();
  if (!selected) return;
  renderSpotDetail(selected);
  clearTimeout(detailCloseTimer);
  elements.spotDetailDialog.classList.remove("is-open", "is-closing");
  if (!elements.spotDetailDialog.open) elements.spotDetailDialog.showModal();
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      elements.spotDetailDialog.classList.add("is-open");
    });
  });
}

function closeSpotDetail() {
  if (!elements.spotDetailDialog.open) return;
  clearTimeout(detailCloseTimer);
  elements.spotDetailDialog.classList.remove("is-open");
  elements.spotDetailDialog.classList.add("is-closing");
  detailCloseTimer = window.setTimeout(() => {
    elements.spotDetailDialog.classList.remove("is-closing");
    elements.spotDetailDialog.close();
  }, 240);
}

function closeSpotDetailFromBackdrop(event) {
  if (event.target !== elements.spotDetailDialog) return;
  const drawerCard = elements.spotDetailDialog.querySelector(".detail-drawer-card");
  const bounds = drawerCard.getBoundingClientRect();
  const clickedInsideDrawer =
    event.clientX >= bounds.left &&
    event.clientX <= bounds.right &&
    event.clientY >= bounds.top &&
    event.clientY <= bounds.bottom;
  if (!clickedInsideDrawer) closeSpotDetail();
}

function renderSpotDetail(restaurant = selectedRestaurant()) {
  if (!restaurant) return;
  if (activeDetailRestaurantId !== restaurant.id) {
    resetDetailDishUi();
    activeDetailRestaurantId = restaurant.id;
  }
  isRenderingSpotDetail = true;
  const form = elements.spotDetailForm.elements;
  form.restaurantId.value = restaurant.id;
  setDetailReviewStatus(restaurant.status || "want_to_go", { autosave: false });
  form.personalRating.value = Number(restaurant.personal_rating || 0).toFixed(1);
  form.visitCount.value = restaurant.visit_count || 0;
  form.notes.value = restaurant.notes || "";
  renderDetailHeader(restaurant);
  elements.detailStatus.textContent = currentUser ? "修改后会自动保存餐厅评价。" : "演示模式可查看；登录后可以保存评价、菜单和图片。";
  renderDetailAddDishState();
  renderDetailDishList(restaurant);
  isRenderingSpotDetail = false;
}

function renderDetailHeader(restaurant = selectedRestaurant()) {
  if (!restaurant) return;
  elements.detailSpotName.textContent = restaurant.name;
  elements.detailSpotMeta.innerHTML = `
    <span>${statusLabel(restaurant.status)}</span>
    <span>☆ ${Number(restaurant.personal_rating || 0).toFixed(1)}</span>
    <span>${restaurant.visit_count || 0} visits</span>
    <span>${distanceLabel(restaurant)}</span>
  `;
}

async function saveDetailRestaurant(event) {
  event.preventDefault();
  clearReviewAutosaveTimer();
  await saveDetailRestaurantReview({ rerenderDetail: false });
}

function getDetailReviewPayload() {
  const form = new FormData(elements.spotDetailForm);
  return {
    status: String(form.get("status") || "want_to_go"),
    personal_rating: clampRating(Number(form.get("personalRating") || 0)),
    visit_count: Math.max(0, Math.floor(Number(form.get("visitCount") || 0))),
    notes: String(form.get("notes") || "").trim(),
  };
}

function setDetailReviewStatus(status, { autosave = true } = {}) {
  const allowedStatuses = ["visited", "want_to_go", "favorite"];
  const nextStatus = allowedStatuses.includes(status) ? status : "want_to_go";
  elements.spotDetailForm.elements.status.value = nextStatus;
  elements.spotDetailForm.querySelectorAll("[data-detail-review-status]").forEach((button) => {
    button.classList.toggle("active", button.dataset.detailReviewStatus === nextStatus);
  });
  if (autosave) scheduleDetailReviewAutosave();
}

function scheduleDetailReviewAutosave() {
  if (isRenderingSpotDetail) return;
  if (!currentUser) {
    elements.detailStatus.textContent = "登录后会自动保存餐厅评价。";
    return;
  }
  clearReviewAutosaveTimer();
  elements.detailStatus.textContent = "正在自动保存餐厅评价...";
  reviewAutosaveTimer = window.setTimeout(() => {
    saveDetailRestaurantReview({ rerenderDetail: false }).catch(() => {});
  }, REVIEW_AUTOSAVE_DELAY);
}

function clearReviewAutosaveTimer() {
  if (reviewAutosaveTimer) clearTimeout(reviewAutosaveTimer);
  reviewAutosaveTimer = null;
}

async function saveDetailRestaurantReview({ rerenderDetail = false } = {}) {
  if (!requireLogin()) return;
  const restaurant = selectedRestaurant();
  if (!restaurant) return;
  const body = getDetailReviewPayload();
  try {
    elements.detailStatus.textContent = "正在自动保存餐厅评价...";
    const data = await api(`/api/restaurants/${restaurant.id}`, { method: "PATCH", body: JSON.stringify(body) });
    upsertRestaurant(data.restaurant);
    elements.detailStatus.textContent = "已自动保存餐厅评价。";
    render();
    if (rerenderDetail) renderSpotDetail(selectedRestaurant());
    else renderDetailHeader(selectedRestaurant());
  } catch (error) {
    elements.detailStatus.textContent = error.message;
    throw error;
  }
}

async function addDishFromDetail() {
  const restaurant = selectedRestaurant();
  if (!restaurant || !requireLogin()) return;
  const name = elements.detailDishName.value.trim();
  if (!name) {
    elements.detailStatus.textContent = "请输入菜品名称。";
    return;
  }
  try {
    elements.detailStatus.textContent = "正在添加菜单...";
    const data = await api(`/api/restaurants/${restaurant.id}/dishes`, {
      method: "POST",
      body: JSON.stringify({
        name,
        dish_status: elements.detailDishStatus.value,
        rating: clampRating(Number(elements.detailDishRating.value || 0)),
        notes: elements.detailDishNotes.value.trim(),
      }),
    });
    const added = await uploadOptionalDishImage(data.dish, elements.detailDishImage.files?.[0]);
    restaurant.dishes = [added, ...(restaurant.dishes ?? [])];
    syncRestaurantReferences(restaurant);
    clearDetailDishInputs();
    setDetailAddDishOpen(false);
    elements.detailStatus.textContent = "已添加菜单。";
    render();
    renderSpotDetail(restaurant);
  } catch (error) {
    elements.detailStatus.textContent = error.message;
  }
}

async function uploadOptionalDishImage(dish, file) {
  if (!file) return normalizeDish(dish);
  const compressed = await compressImage(file);
  const form = new FormData();
  form.append("image", compressed, compressed.name);
  const data = await api(`/api/dishes/${dish.id}/image`, { method: "POST", body: form });
  return normalizeDish(data.dish);
}

function clearDetailDishInputs() {
  elements.detailDishName.value = "";
  setDetailDishStatus("liked");
  elements.detailDishRating.value = "4.5";
  elements.detailDishImage.value = "";
  updateDetailDishImageName();
  elements.detailDishNotes.value = "";
}

function updateDetailDishImageName() {
  const file = elements.detailDishImage.files?.[0];
  elements.detailDishImageName.textContent = file ? file.name : "Click to upload or drag image here";
}

function bindDetailFileDropzone(zone, input, options = {}) {
  if (!zone || !input) return;
  input.addEventListener("change", () => {
    zone.classList.toggle("has-file", Boolean(input.files?.[0]));
    options.onFileSelected?.(input);
  });
  ["dragenter", "dragover"].forEach((eventName) => {
    zone.addEventListener(eventName, (event) => {
      event.preventDefault();
      zone.classList.add("is-dragging");
    });
  });
  ["dragleave", "drop"].forEach((eventName) => {
    zone.addEventListener(eventName, (event) => {
      event.preventDefault();
      zone.classList.remove("is-dragging");
    });
  });
  zone.addEventListener("drop", (event) => {
    const file = [...(event.dataTransfer?.files ?? [])].find((item) => item.type.startsWith("image/"));
    if (!file) return;
    const transfer = new DataTransfer();
    transfer.items.add(file);
    input.files = transfer.files;
    zone.classList.add("has-file");
    options.onFileSelected?.(input);
  });
}

function setDetailDishStatus(status) {
  const nextStatus = status === "tried" ? "tried" : "liked";
  elements.detailDishStatus.value = nextStatus;
  document.querySelectorAll("[data-detail-dish-status]").forEach((button) => {
    button.classList.toggle("active", button.dataset.detailDishStatus === nextStatus);
  });
}

function setDetailAddDishOpen(isOpen) {
  isDetailAddDishOpen = isOpen;
  renderDetailAddDishState();
  if (isOpen) elements.detailDishName.focus();
}

function renderDetailAddDishState() {
  elements.detailAddDishToggle.textContent = isDetailAddDishOpen ? "Close" : "+ Add Menu";
  elements.detailAddDishPanel.hidden = !isDetailAddDishOpen;
}

function cancelDetailDishAdd() {
  clearDetailDishInputs();
  setDetailAddDishOpen(false);
  elements.detailStatus.textContent = "已取消新增菜单。";
}

function resetDetailDishUi() {
  isDetailAddDishOpen = false;
  clearDetailDishInputs();
  clearReviewAutosaveTimer();
  editingDetailDishIds.clear();
  dishAutosaveTimers.forEach((timer) => clearTimeout(timer));
  dishAutosaveTimers.clear();
}

function renderDetailDishList(restaurant) {
  const dishes = restaurant.dishes ?? [];
  elements.detailDishList.innerHTML = dishes.length
    ? dishes.map(detailDishTemplate).join("")
    : emptyStateTemplate("还没有菜单记录。添加第一道菜后，可以给它评分、上传图片、写感想。", "");
  elements.detailDishList.querySelectorAll("[data-detail-dish-action]").forEach((button) => {
    button.addEventListener("click", () => handleDetailDishAction(button));
  });
  elements.detailDishList.querySelectorAll("[data-detail-dish-autosave]").forEach((field) => {
    field.addEventListener("input", () => scheduleDetailDishAutosave(field.closest(".detail-dish-card")));
    field.addEventListener("change", () => scheduleDetailDishAutosave(field.closest(".detail-dish-card")));
  });
  elements.detailDishList.querySelectorAll(".detail-dish-image-input").forEach((input) => {
    bindDetailFileDropzone(input.closest("[data-detail-file-dropzone]"), input, {
      onFileSelected: uploadDetailDishImage,
    });
  });
}

function detailDishTemplate(dish) {
  if (!editingDetailDishIds.has(String(dish.id))) return detailDishPreviewTemplate(dish);
  return detailDishEditTemplate(dish);
}

function detailDishPreviewTemplate(dish) {
  const notes = dish.notes?.trim();
  return `
    <article class="detail-dish-card preview" data-dish-id="${dish.id}">
      <div class="detail-dish-photo">
        ${dish.image_url ? `<img src="${escapeAttribute(dish.image_url)}" alt="">` : "<span>IMG</span>"}
      </div>
      <div class="detail-dish-body">
        <div class="detail-dish-summary">
          <div>
            <strong>${escapeHtml(dish.name)}</strong>
            <div class="detail-dish-meta">
              <span class="dish-status-pill">${dish.dish_status === "tried" ? "Tried" : "Liked"}</span>
              <span>☆ ${Number(dish.rating || 0).toFixed(1)}</span>
            </div>
          </div>
          <div class="detail-dish-actions">
            <button class="secondary-button compact-action" type="button" data-detail-dish-action="edit">Edit</button>
            <button class="secondary-button compact-action danger" type="button" data-detail-dish-action="delete">Delete</button>
          </div>
        </div>
        <p class="detail-dish-notes-preview">${notes ? escapeHtml(notes) : "还没有记录这道菜的感想。"}</p>
      </div>
    </article>
  `;
}

function detailDishEditTemplate(dish) {
  return `
    <article class="detail-dish-card editing" data-dish-id="${dish.id}">
      <div class="detail-dish-photo">
        ${dish.image_url ? `<img src="${escapeAttribute(dish.image_url)}" alt="">` : "<span>IMG</span>"}
      </div>
      <div class="detail-dish-body">
        <input data-field="name" data-detail-dish-autosave value="${escapeAttribute(dish.name)}" />
        <div class="detail-dish-controls">
          <select data-field="dish_status" data-detail-dish-autosave>
            <option value="liked" ${dish.dish_status === "liked" ? "selected" : ""}>Liked</option>
            <option value="tried" ${dish.dish_status === "tried" ? "selected" : ""}>Tried</option>
          </select>
          <input data-field="rating" data-detail-dish-autosave type="number" min="0" max="5" step="0.1" value="${Number(dish.rating || 0)}" />
          <label class="detail-file-dropzone compact" data-detail-file-dropzone>
            <input class="detail-dish-image-input" type="file" accept="image/jpeg,image/png,image/webp" hidden />
            <span class="detail-file-mark" aria-hidden="true">＋</span>
            <span>
              <strong>Replace photo</strong>
              <small>Click to upload or drag image here</small>
            </span>
          </label>
        </div>
        <textarea data-field="notes" data-detail-dish-autosave rows="3" placeholder="这道菜的感想">${escapeHtml(dish.notes || "")}</textarea>
        <div class="detail-dish-actions">
          <button class="secondary-button" type="button" data-detail-dish-action="done">Done</button>
          <button class="secondary-button danger" type="button" data-detail-dish-action="delete">Delete</button>
        </div>
      </div>
    </article>
  `;
}

async function handleDetailDishAction(button) {
  if (!requireLogin()) return;
  const item = button.closest(".detail-dish-card");
  const dishId = item.dataset.dishId;
  const action = button.dataset.detailDishAction;
  if (action === "edit") {
    editingDetailDishIds.add(String(dishId));
    renderDetailDishList(selectedRestaurant());
    return;
  }
  if (action === "done") {
    await finishDetailDishEdit(item);
    return;
  }
  if (action === "delete") {
    if (!confirm("删除这道菜吗？")) return;
    clearDishAutosaveTimer(dishId);
    await api(`/api/dishes/${dishId}`, { method: "DELETE" });
    editingDetailDishIds.delete(String(dishId));
    removeDish(dishId);
    elements.detailStatus.textContent = "已删除菜单。";
    return;
  }
}

function getDetailDishPayload(item) {
  return {
    name: item.querySelector('[data-field="name"]')?.value.trim() || "",
    dish_status: item.querySelector('[data-field="dish_status"]')?.value || "liked",
    rating: clampRating(Number(item.querySelector('[data-field="rating"]')?.value || 0)),
    notes: item.querySelector('[data-field="notes"]')?.value.trim() || "",
  };
}

function scheduleDetailDishAutosave(item) {
  if (!item || !requireLogin()) return;
  const dishId = item.dataset.dishId;
  clearDishAutosaveTimer(dishId);
  const body = getDetailDishPayload(item);
  if (!body.name) {
    elements.detailStatus.textContent = "菜品名称不能为空。";
    return;
  }
  elements.detailStatus.textContent = "正在保存菜单...";
  dishAutosaveTimers.set(
    String(dishId),
    window.setTimeout(() => saveDetailDish(item).catch(() => {}), DISH_AUTOSAVE_DELAY),
  );
}

function clearDishAutosaveTimer(dishId) {
  const key = String(dishId);
  const timer = dishAutosaveTimers.get(key);
  if (timer) clearTimeout(timer);
  dishAutosaveTimers.delete(key);
}

async function saveDetailDish(item, { rerender = false } = {}) {
  const dishId = item.dataset.dishId;
  clearDishAutosaveTimer(dishId);
  const body = getDetailDishPayload(item);
  if (!body.name) {
    elements.detailStatus.textContent = "菜品名称不能为空。";
    throw new Error("Dish name is required");
  }
  try {
    elements.detailStatus.textContent = "正在保存菜单...";
    const data = await api(`/api/dishes/${dishId}`, { method: "PATCH", body: JSON.stringify(body) });
    replaceDish(data.dish, { rerender });
    elements.detailStatus.textContent = "已自动保存菜单。";
  } catch (error) {
    elements.detailStatus.textContent = error.message;
    throw error;
  }
}

async function finishDetailDishEdit(item) {
  try {
    await saveDetailDish(item, { rerender: false });
    editingDetailDishIds.delete(String(item.dataset.dishId));
    renderDetailDishList(selectedRestaurant());
  } catch (error) {
    // Keep the card editable so the user can fix validation or retry.
  }
}

async function uploadDetailDishImage(input) {
  if (!requireLogin()) return;
  const item = input.closest(".detail-dish-card");
  const file = input.files?.[0];
  if (!file) return;
  try {
    elements.detailStatus.textContent = "正在上传图片...";
    const compressed = await compressImage(file);
    const form = new FormData();
    form.append("image", compressed, compressed.name);
    const data = await api(`/api/dishes/${item.dataset.dishId}/image`, { method: "POST", body: form });
    replaceDish(data.dish);
    elements.detailStatus.textContent = "已上传图片。";
  } catch (error) {
    elements.detailStatus.textContent = error.message;
  }
}

async function pasteAndAddFromClipboard() {
  if (!requireLogin()) return;
  try {
    const text = (await navigator.clipboard.readText()).trim();
    const googleUrl = extractGoogleMapsUrl(text);
    if (!googleUrl) throw new Error("剪贴板里没有 Google Maps 链接。");
    const parsed = await parseAnyGoogleMapsLink(googleUrl);
    const name = parsed.name || "New Spot";
    const duplicate = findDuplicateRestaurant({
      name,
      google_url: parsed.url || googleUrl,
      lat: parsed.lat,
      lng: parsed.lng,
    });
    let confirmedCreate = false;
    if (duplicate) {
      selectedRestaurantId = duplicate.id;
      isSpotCardOpen = true;
      render();
      const duplicateDistance = formatDistance(haversineDistance(duplicate, { lat: parsed.lat, lng: parsed.lng }));
      confirmedCreate = confirm(
        `已经找到很像的餐厅：\n\n「${duplicate.name}」\n${duplicate.address || "没有地址"}\n距离新链接坐标约 ${duplicateDistance}\n\n还要继续创建一个新的重复记录吗？`,
      );
      if (!confirmedCreate) {
        setPasteStatus(`已取消创建，已选中现有餐厅：${duplicate.name}`);
        return;
      }
    }
    if (!confirmedCreate && !confirm(`添加「${name}」到 Want to Go 吗？`)) return;
    const body = {
      name,
      address: "",
      lat: parsed.lat,
      lng: parsed.lng,
      google_url: parsed.url || googleUrl,
      status: "want_to_go",
      visit_count: 0,
      personal_rating: 0,
      notes: "",
    };
    const data = await api("/api/restaurants", { method: "POST", body: JSON.stringify(body) });
    upsertRestaurant(data.restaurant);
    selectedRestaurantId = data.restaurant.id;
    isSpotCardOpen = true;
    setPasteStatus(`已添加：${data.restaurant.name}`);
    render();
  } catch (error) {
    setPasteStatus(error.message);
  }
}

function setPasteStatus(message) {
  elements.pasteStatus.textContent = message;
}

async function autofillFromGoogleMapsUrl() {
  const form = elements.restaurantForm.elements;
  const googleUrl = elements.googleUrlInput.value.trim();
  if (isGoogleMapsShortLink(googleUrl)) {
    elements.formHelp.textContent = "正在展开 Google Maps 短链接...";
    window.clearTimeout(shortLinkResolveTimer);
    shortLinkResolveTimer = window.setTimeout(async () => {
      try {
        const parsed = await parseAnyGoogleMapsLink(googleUrl);
        form.googleUrl.value = parsed.url || googleUrl;
        form.name.value = parsed.name || form.name.value;
        form.lat.value = parsed.lat ?? form.lat.value;
        form.lng.value = parsed.lng ?? form.lng.value;
        elements.formHelp.textContent = "短链接已展开并填入坐标。";
      } catch (error) {
        elements.formHelp.textContent = error.message;
      }
    }, 450);
    return;
  }

  const parsed = parseGoogleMapsUrl(googleUrl);
  if (!parsed) {
    elements.formHelp.textContent = GOOGLE_MAPS_HELP;
    return;
  }
  if (parsed.name && !form.name.value.trim()) form.name.value = parsed.name;
  if (parsed.lat != null && parsed.lng != null) {
    form.lat.value = parsed.lat;
    form.lng.value = parsed.lng;
    elements.formHelp.textContent = "已从 Google Maps 链接识别坐标。";
  }
}

async function parseAnyGoogleMapsLink(url) {
  if (isGoogleMapsShortLink(url)) {
    const endpoint = new URL("/api/resolve-google-link", window.location.origin);
    endpoint.searchParams.set("url", url);
    const data = await api(endpoint.toString());
    url = data.url;
  }
  const parsed = parseGoogleMapsUrl(url);
  if (!parsed?.lat || !parsed?.lng) {
    throw new Error("没有从链接识别到坐标。请打开短链接后复制完整 Google Maps 地址栏链接。");
  }
  return { ...parsed, url };
}

async function checkShortLinkService() {
  try {
    await api("/api/health");
  } catch {
    setPasteStatus("后端服务未连接。请用 python3 server.py 5174 启动。");
  }
}

async function resolveCoordinates(payload) {
  const manual = validateCoordinates(payload.lat, payload.lng);
  if (manual) return manual;
  const parsed = await parseAnyGoogleMapsLink(payload.google_url);
  return { lat: parsed.lat, lng: parsed.lng };
}

function validateCoordinates(lat, lng) {
  const parsedLat = Number(lat);
  const parsedLng = Number(lng);
  if (Number.isFinite(parsedLat) && Number.isFinite(parsedLng) && Math.abs(parsedLat) <= 90 && Math.abs(parsedLng) <= 180) {
    return { lat: parsedLat, lng: parsedLng };
  }
  return null;
}

function parseGoogleMapsUrl(url) {
  if (!url) return null;
  let decoded = safeDecode(url);
  const atMatch = decoded.match(/@(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/);
  const bangMatch = decoded.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
  const queryMatch = decoded.match(/[?&](?:q|query|destination|ll)=(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/);
  const coordinates = atMatch || bangMatch || queryMatch;
  const name = parseGoogleMapsName(decoded);
  if (!coordinates) return name ? { name } : null;
  return { lat: Number(coordinates[1]), lng: Number(coordinates[2]), name };
}

function parseGoogleMapsName(url) {
  const match = url.match(/\/maps\/place\/([^/@?]+)/);
  return match ? safeDecode(match[1].replace(/\+/g, " ")).trim() : "";
}

function safeDecode(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function isGoogleMapsShortLink(url) {
  return /^https?:\/\/(?:maps\.app\.goo\.gl|goo\.gl\/maps)\//i.test(url);
}

function extractGoogleMapsUrl(text) {
  return text.match(/https?:\/\/(?:www\.google\.[^\s/]+\/maps|maps\.google\.[^\s/]+|maps\.app\.goo\.gl|goo\.gl\/maps)[^\s)]*/i)?.[0] ?? "";
}

async function getLocationPermissionState() {
  if (!navigator.permissions?.query) return "unknown";
  try {
    return (await navigator.permissions.query({ name: "geolocation" })).state;
  } catch {
    return "unknown";
  }
}

function setLocationButtonState(label, disabled = false) {
  if (elements.mapLocateButton) {
    elements.mapLocateButton.textContent = label;
    elements.mapLocateButton.disabled = disabled;
  }
  elements.locateButton.title = label;
  elements.locateButton.disabled = disabled;
}

async function requestLocation() {
  if (!navigator.geolocation) {
    setFallbackLocation("浏览器不支持定位，使用多伦多市中心作为临时位置。");
    return;
  }
  if ((await getLocationPermissionState()) === "denied") {
    setLocationButtonState("Retry Location");
    setFallbackLocation(LOCATION_DENIED_HELP);
    return;
  }
  setLocationButtonState("Locating...", true);
  elements.locationStatus.textContent = "正在获取当前位置...";
  navigator.geolocation.getCurrentPosition(
    (position) => {
      currentLocation = { lat: position.coords.latitude, lng: position.coords.longitude };
      elements.locationStatus.textContent = `当前位置 ${currentLocation.lat.toFixed(3)}, ${currentLocation.lng.toFixed(3)}`;
      setLocationButtonState("Use My Location");
      render();
    },
    (error) => {
      setLocationButtonState("Retry Location");
      setFallbackLocation(error.code === error.PERMISSION_DENIED ? LOCATION_DENIED_HELP : "暂时无法获取当前位置，使用多伦多市中心作为临时位置。");
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
  );
}

function setFallbackLocation(message) {
  currentLocation = { lat: 43.6532, lng: -79.3832 };
  elements.locationStatus.textContent = message;
  render();
}

function render() {
  renderViewShell();
  renderMapContext();
  renderCounts();
  syncFilterButtons();
  renderSidebarListFilters();
  renderRecentList();
  renderMarkers();
  renderSpotCard();
  renderListsView();
  renderDiscoveryView();
  updateTopbarElevation();
}

function getInitialView() {
  const hash = window.location.hash.replace("#", "");
  return ["my-map", "my-lists", "discovery"].includes(hash) ? hash : "my-map";
}

function setActiveView(view, options = {}) {
  if (!["my-map", "my-lists", "discovery"].includes(view)) view = "my-map";
  activeView = shareToken ? "my-map" : view;
  if (options.push !== false && window.location.hash !== `#${activeView}`) {
    window.location.hash = activeView;
  }
  if (activeView === "my-lists" && currentUser && !lists.length) {
    loadLists().then(render).catch((error) => alert(error.message));
  }
  if (activeView === "discovery" && !discoveryLists.length) {
    loadDiscoveryLists().then(render).catch((error) => alert(error.message));
  }
  render();
  requestAnimationFrame(updateTopbarElevation);
}

function updateTopbarElevation() {
  const activePanel = document.querySelector(`[data-view-panel="${activeView}"]`);
  const documentScrollTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
  const activePanelScrollTop = activePanel?.scrollTop || 0;
  const sidebarScrollTop = elements.sidebar?.scrollTop || 0;
  const isElevated = Math.max(documentScrollTop, activePanelScrollTop, sidebarScrollTop) > 4;
  document.body.classList.toggle("is-topbar-elevated", isElevated);
}

function renderViewShell() {
  document.body.dataset.view = activeView;
  elements.viewPanels.forEach((panel) => {
    panel.hidden = panel.dataset.viewPanel !== activeView;
  });
  elements.navLinks.forEach((link) => link.classList.toggle("active", link.dataset.view === activeView));
  elements.searchInput.placeholder = {
    "my-map": "Search spots in this category...",
    "my-lists": "Search spots in this category...",
    discovery: "Search curated lists...",
  }[activeView];
}

function setActiveCategory(key) {
  activeMyListKey = key || "system:all";
  if (activeMyListKey.startsWith("system:")) {
    const systemKey = activeMyListKey.replace("system:", "");
    const definition = systemLists.find((list) => list.key === systemKey) ?? systemLists[0];
    activeMyListKey = `system:${definition.key}`;
    activeFilter = definition.filter;
    return;
  }
  if (activeMyListKey.startsWith("custom:")) {
    selectedListId = activeMyListKey.replace("custom:", "");
  }
}

function activeSystemListDefinition() {
  if (!activeMyListKey.startsWith("system:")) return null;
  const systemKey = activeMyListKey.replace("system:", "");
  return systemLists.find((list) => list.key === systemKey) ?? systemLists[0];
}

function activeCustomList() {
  if (!activeMyListKey.startsWith("custom:")) return null;
  return lists.find((list) => `custom:${list.id}` === activeMyListKey) ?? lists.find((list) => list.id === selectedListId) ?? null;
}

function activeCategoryMeta() {
  const systemDefinition = activeSystemListDefinition();
  if (systemDefinition) {
    return {
      eyebrow: "SMART LIST",
      title: systemDefinition.title,
      description: systemDefinition.description,
      count: restaurantsForSystemList(systemDefinition).length,
    };
  }

  const list = activeCustomList();
  if (list) {
    return {
      eyebrow: list.visibility === "public" ? "PUBLIC CUSTOM LIST" : "CUSTOM LIST",
      title: list.title,
      description: list.description || "Custom category from your saved restaurants.",
      count: list.item_count || list.items?.length || 0,
    };
  }

  return {
    eyebrow: "CUSTOM LIST",
    title: "Choose a list",
    description: "Select a custom list on the left to view its spots.",
    count: 0,
  };
}

function renderMapContext() {
  if (!elements.mapCategoryTitle) return;
  const meta = activeCategoryMeta();
  elements.mapCategoryEyebrow.textContent = "MAP VIEW · " + meta.eyebrow;
  elements.mapCategoryTitle.textContent = meta.title;
  elements.mapCategorySummary.textContent = `${meta.count} spots · sorted by distance from you`;
}

function restaurantsForActiveCategory() {
  const systemDefinition = activeSystemListDefinition();
  if (systemDefinition) return restaurantsForSystemList(systemDefinition);

  const list = activeCustomList();
  const ids = new Set((list?.items ?? []).map((item) => item.restaurant_id));
  return restaurants.filter((restaurant) => ids.has(restaurant.id));
}

function selectFirstVisibleRestaurant() {
  const visible = getVisibleRestaurants();
  if (!visible.length) {
    selectedRestaurantId = null;
    isSpotCardOpen = false;
    return;
  }
  if (!visible.some((restaurant) => restaurant.id === selectedRestaurantId)) {
    selectedRestaurantId = visible[0].id;
    isSpotCardOpen = true;
  }
}

function getVisibleRestaurants() {
  const term = activeView === "my-map" ? elements.searchInput.value.trim().toLowerCase() : "";
  return restaurantsForActiveCategory().filter((restaurant) => !term || restaurantSearchText(restaurant).includes(term));
}

function renderCounts() {
  elements.placeCount.textContent = `${restaurants.length} places`;
  elements.countAll.textContent = restaurants.length;
  elements.countVisited.textContent = restaurants.filter((item) => item.status === "visited").length;
  elements.countWant.textContent = restaurants.filter((item) => item.status === "want_to_go").length;
  elements.countFavorite.textContent = restaurants.filter((item) => item.status === "favorite").length;
}

function renderSidebarListFilters() {
  if (!elements.sidebarListFilters) return;
  if (!currentUser) {
    elements.sidebarListFilters.innerHTML = '<p class="sidebar-empty">Sign in to manage lists.</p>';
    return;
  }
  const ordered = orderedLists();
  elements.sidebarListFilters.innerHTML = ordered.length
    ? ordered.map((list) => `
        <button class="list-filter-item ${activeMyListKey === `custom:${list.id}` ? "active" : ""}" type="button" draggable="true" data-sidebar-list-id="${list.id}">
          <span class="drag-handle" aria-hidden="true">⋮⋮</span>
          <span class="list-filter-text">
            <strong>${escapeHtml(list.title)}</strong>
            <small>${list.item_count || 0} spots · ${visibilityLabel(list.visibility)}</small>
          </span>
        </button>
      `).join("")
    : '<p class="sidebar-empty">No custom lists yet.</p>';
  elements.sidebarListFilters.querySelectorAll("[data-sidebar-list-id]").forEach((button) => {
    button.addEventListener("click", async () => {
      setActiveCategory(`custom:${button.dataset.sidebarListId}`);
      syncFilterButtons();
      await ensureListDetail(selectedListId);
      selectFirstVisibleRestaurant();
      render();
    });
    button.addEventListener("dragstart", (event) => {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", button.dataset.sidebarListId);
      button.classList.add("dragging");
    });
    button.addEventListener("dragend", () => button.classList.remove("dragging"));
    button.addEventListener("dragover", (event) => {
      event.preventDefault();
      button.classList.add("drag-over");
    });
    button.addEventListener("dragleave", () => button.classList.remove("drag-over"));
    button.addEventListener("drop", (event) => {
      event.preventDefault();
      button.classList.remove("drag-over");
      reorderListFilter(event.dataTransfer.getData("text/plain"), button.dataset.sidebarListId);
    });
  });
}

function renderRecentList() {
  const recent = sortRestaurantsByDistance(getVisibleRestaurants()).slice(0, 5);
  elements.recentList.innerHTML = recent.length
    ? recent.map((restaurant) => `
        <button class="recent-item" data-id="${restaurant.id}">
          ${restaurantThumbTemplate(restaurant)}
          <span>
            <strong>${escapeHtml(restaurant.name)}</strong>
            <small>${distanceLabel(restaurant)} · ${statusLabel(restaurant.status)}</small>
          </span>
        </button>
      `).join("")
    : '<p class="empty-recent">没有匹配餐厅</p>';
  elements.recentList.querySelectorAll(".recent-item").forEach((item) => {
    item.addEventListener("click", () => {
      selectedRestaurantId = item.dataset.id;
      isSpotCardOpen = true;
      render();
      openSpotDetail();
    });
  });
}

function renderMarkers() {
  const visible = getVisibleRestaurants();
  elements.emptyMap.style.display = visible.length ? "none" : "grid";
  elements.markersLayer.innerHTML = "";
  updateMapZoomUi();
  if (!currentLocation) return;
  const layout = layoutMapMarkers(visible);
  visible.forEach((restaurant) => {
    const distance = haversineDistance(currentLocation, restaurant);
    const point = layout.get(restaurant.id) ?? { x: 50, y: 50 };
    const marker = document.createElement("button");
    marker.className = `restaurant-marker ${restaurant.status}${restaurant.id === selectedRestaurantId ? " selected" : ""}`;
    marker.style.left = `${point.x}%`;
    marker.style.top = `${point.y}%`;
    if (restaurant.id === selectedRestaurantId) marker.style.zIndex = "9";
    marker.innerHTML = `
      <span class="marker-photo">
        <img src="${escapeAttribute(restaurantImageUrl(restaurant))}" alt="">
      </span>
      <span class="marker-caption">
        <strong>${escapeHtml(shortMapName(restaurant.name))}</strong>
        <small>${formatDistance(distance)}</small>
      </span>
    `;
    marker.title = `${restaurant.name} - ${formatDistance(distance)}`;
    marker.addEventListener("click", () => {
      selectedRestaurantId = restaurant.id;
      isSpotCardOpen = true;
      render();
    });
    elements.markersLayer.appendChild(marker);
  });
}

function renderSpotCard() {
  const selected = selectedRestaurant();
  if (!selected) {
    elements.spotCard.hidden = true;
    elements.spotCardTab.hidden = true;
    return;
  }
  elements.spotCard.hidden = !isSpotCardOpen;
  elements.spotCardTab.hidden = isSpotCardOpen;
  elements.spotCardTabName.textContent = selected.name;
  const distance = currentLocation ? haversineDistance(currentLocation, selected) : null;
  elements.spotName.textContent = selected.name;
  elements.spotDistance.textContent = distance == null ? "等待定位" : formatDistance(distance);
  elements.spotRating.textContent = `☆ ${Number(selected.personal_rating || 0).toFixed(1)}`;
  elements.spotStatus.textContent = `${statusLabel(selected.status)} · ${selected.visit_count || 0} visits`;
  elements.spotNotes.textContent = selected.notes || selected.address || "还没有记录想法。";
  elements.spotDishes.innerHTML = renderSpotDishes(selected);
  elements.openGoogleMaps.href = selected.google_url || `https://www.google.com/maps?q=${selected.lat},${selected.lng}`;
  const ownedMode = Boolean(currentUser && !shareToken);
  elements.openSpotDetail.disabled = false;
  elements.editSpot.disabled = !ownedMode;
  elements.shareSpot.disabled = !ownedMode;
  elements.deleteSpot.disabled = !ownedMode;
}

function renderSpotDishes(restaurant) {
  const dishes = restaurant.dishes ?? [];
  if (!dishes.length) return "";
  return dishes.map((dish) => `
    <span class="dish-pill ${dish.dish_status}">
      ${dish.image_url ? `<img src="${escapeHtml(dish.image_url)}" alt="">` : ""}
      ${escapeHtml(dish.name)} · ☆ ${Number(dish.rating || 0).toFixed(1)}
    </span>
  `).join("");
}

function renderListsView() {
  if (!elements.myListDetail) return;
  const term = activeView === "my-lists" ? elements.searchInput.value.trim().toLowerCase() : "";

  if (activeMyListKey.startsWith("system:")) {
    const systemKey = activeMyListKey.replace("system:", "");
    const definition = systemLists.find((list) => list.key === systemKey) ?? systemLists[0];
    elements.myListDetail.innerHTML = systemListDetailTemplate(definition, term);
    bindSystemListDetailActions(definition);
    return;
  }

  if (!currentUser) {
    elements.myListDetail.innerHTML = emptyStateTemplate("Choose a smart list on the left, or sign in to manage custom lists.", "Sign in");
    elements.myListDetail.querySelector("[data-empty-action]")?.addEventListener("click", requireLogin);
    return;
  }
  const selected = lists.find((list) => `custom:${list.id}` === activeMyListKey) ?? lists.find((list) => list.id === selectedListId) ?? lists[0];
  if (selected && !selected.items) {
    ensureListDetail(selected.id).then(render).catch((error) => (elements.myListDetail.innerHTML = errorPanel(error.message)));
    elements.myListDetail.innerHTML = loadingPanel("Loading list...");
    return;
  }
  elements.myListDetail.innerHTML = selected ? myListDetailTemplate(selected, term) : emptyStateTemplate("Create a list, then add spots from your map.", "");
  bindMyListDetailActions(selected);
}

function renderDiscoveryView() {
  if (!elements.discoveryGrid) return;
  const term = activeView === "discovery" ? elements.searchInput.value.trim().toLowerCase() : "";
  const sorted = [...discoveryLists].sort((a, b) => {
    if (discoverySort === "recent") return Number(b.published_at || 0) - Number(a.published_at || 0);
    return Number(b.copy_count || 0) - Number(a.copy_count || 0) || Number(b.item_count || 0) - Number(a.item_count || 0);
  });
  const visible = sorted.filter((list) => listSearchText(list).includes(term));
  elements.discoveryGrid.innerHTML = visible.length
    ? visible.map((list) => listCardTemplate(list, list.id === selectedDiscoveryListId, "public")).join("")
    : emptyStateTemplate("No public lists yet. Publish a list from My Lists to seed Discovery.", "");
  elements.discoveryGrid.querySelectorAll("[data-list-id]").forEach((card) => {
    card.addEventListener("click", async () => {
      selectedDiscoveryListId = card.dataset.listId;
      await ensureDiscoveryDetail(selectedDiscoveryListId);
      render();
    });
  });
  const selected = discoveryLists.find((list) => list.id === selectedDiscoveryListId) ?? visible[0] ?? discoveryLists[0];
  if (selected && !selected.items) {
    ensureDiscoveryDetail(selected.id).then(render).catch((error) => (elements.discoveryDetail.innerHTML = errorPanel(error.message)));
    elements.discoveryDetail.innerHTML = loadingPanel("Loading public list...");
    return;
  }
  elements.discoveryDetail.innerHTML = selected ? discoveryDetailTemplate(selected) : emptyStateTemplate("Published lists will open here.", "");
  elements.discoveryDetail.querySelector("[data-copy-public]")?.addEventListener("click", copyPublicList);
}

function systemListCardTemplate(list, selected) {
  const spots = restaurantsForSystemList(list);
  return `
    <button class="system-list-card ${selected ? "selected" : ""}" type="button" data-system-list="${list.key}">
      <span class="system-list-icon">${list.icon}</span>
      <span>
        <strong>${escapeHtml(list.title)}</strong>
        <small>${escapeHtml(list.description)}</small>
      </span>
      <span class="system-list-count">${spots.length}</span>
    </button>
  `;
}

function systemListDetailTemplate(definition, term) {
  const spots = sortRestaurantsByDistance(restaurantsForSystemList(definition).filter((restaurant) => restaurantSearchText(restaurant).includes(term)));
  return `
    <div class="list-view-head">
      <div>
        <p class="eyebrow">${escapeHtml(definition.eyebrow)}</p>
        <h2>${escapeHtml(definition.title)}</h2>
        <p>${escapeHtml(definition.description)} Sorted by distance from your current location.</p>
      </div>
      <div class="list-view-meta">
        <span>${spots.length} spots</span>
        <span>Nearest first</span>
      </div>
    </div>
    <div class="detail-actions system-actions compact-actions">
      <button class="outline-button" type="button" data-view-system-map>Open on Map</button>
    </div>
    <div class="spot-row-list restaurant-list-mode">
      ${spots.length ? spots.map(systemSpotItemTemplate).join("") : emptyStateTemplate("No spots in this smart list yet.", "")}
    </div>
  `;
}

function systemSpotItemTemplate(restaurant) {
  return restaurantRowTemplate(restaurant, {
    body: `${distanceLabel(restaurant)} · ☆ ${Number(restaurant.personal_rating || 0).toFixed(1)} · ${statusLabel(restaurant.status)} · ${restaurant.visit_count || 0} visits`,
    actions: `
      <button class="icon-link" type="button" data-open-spot="${restaurant.id}">Map</button>
      <a class="icon-link" href="${escapeAttribute(restaurant.google_url || `https://www.google.com/maps?q=${restaurant.lat},${restaurant.lng}`)}" target="_blank" rel="noreferrer">Google</a>
    `,
  });
}

function bindSystemListDetailActions(definition) {
  bindRestaurantRows(elements.myListDetail);
  elements.myListDetail.querySelector("[data-view-system-map]")?.addEventListener("click", () => {
    activeFilter = definition.filter;
    syncFilterButtons();
    setActiveView("my-map");
  });
  elements.myListDetail.querySelector("[data-create-list-from-system]")?.addEventListener("click", openCreateListDialog);
  elements.myListDetail.querySelectorAll("[data-open-spot]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedRestaurantId = button.dataset.openSpot;
      activeFilter = definition.filter;
      syncFilterButtons();
      isSpotCardOpen = true;
      setActiveView("my-map");
    });
  });
}

function listCardTemplate(list, selected, mode) {
  return `
    <button class="list-card ${selected ? "selected" : ""}" type="button" data-list-id="${list.id}">
      ${coverTemplate(list)}
      <span class="list-card-body">
        <strong>${escapeHtml(list.title)}</strong>
        <small>${escapeHtml(list.description || "No description yet.")}</small>
        <span class="list-meta-row">
          <span>${list.item_count || 0} spots</span>
          <span>${mode === "public" ? `${list.copy_count || 0} copies` : visibilityLabel(list.visibility)}</span>
        </span>
      </span>
    </button>
  `;
}

function myListDetailTemplate(list, term = "") {
  const isPublic = list.visibility === "public";
  const items = sortListItemsByDistance((list.items ?? []).filter((item) => {
    if (!term) return true;
    const restaurant = item.restaurant;
    return restaurant && (restaurantSearchText(restaurant).includes(term) || String(item.note || "").toLowerCase().includes(term));
  }));
  return `
    <div class="detail-head">
      ${coverTemplate(list)}
      <div>
        <p class="eyebrow">${isPublic ? "PUBLIC LIST" : "PRIVATE LIST"}</p>
        <h2>${escapeHtml(list.title)}</h2>
        <p>${escapeHtml(list.description || "No description yet.")}</p>
        <div class="meta-row compact-meta">
          <span>${list.item_count || 0} spots</span>
          <span>${visibilityLabel(list.visibility)}</span>
          <span>Updated ${formatDate(list.updated_at)}</span>
        </div>
      </div>
    </div>
    <div class="detail-actions">
      <button class="outline-button" type="button" data-list-action="map">Open on Map</button>
      <button class="outline-button" type="button" data-list-action="edit">Edit</button>
      <button class="outline-button" type="button" data-list-action="publish">${isPublic ? "Unpublish" : "Publish"}</button>
      <button class="outline-button" type="button" data-list-action="add">Add Spots</button>
      <button class="outline-button danger" type="button" data-list-action="delete">Delete List</button>
    </div>
    <div class="spot-row-list">
      ${items.length ? items.map((item) => ownedListItemTemplate(item)).join("") : emptyStateTemplate((list.items ?? []).length ? "No spots match this search." : "This list is empty. Add spots from your map.", "")}
    </div>
  `;
}

function discoveryDetailTemplate(list) {
  return `
    <div class="detail-head public-detail">
      ${coverTemplate(list)}
      <div>
        <p class="eyebrow">PUBLIC PICK</p>
        <h2>${escapeHtml(list.title)}</h2>
        <p>${escapeHtml(list.description || "No description yet.")}</p>
        <div class="meta-row compact-meta">
          <span>${list.item_count || 0} spots</span>
          <span>${list.copy_count || 0} copies</span>
          <span>by ${escapeHtml(list.owner?.name || "Foodie")}</span>
        </div>
      </div>
    </div>
    <button class="primary-button compact full" type="button" data-copy-public>Copy to My Lists</button>
    <div class="spot-row-list">
      ${(list.items ?? []).length ? sortListItemsByDistance(list.items).map((item) => publicListItemTemplate(item)).join("") : emptyStateTemplate("This public list has no visible spots.", "")}
    </div>
  `;
}

function ownedListItemTemplate(item) {
  const restaurant = item.restaurant;
  if (!restaurant) return "";
  return restaurantRowTemplate(restaurant, {
    body: `${distanceLabel(restaurant)} · ☆ ${Number(restaurant.personal_rating || 0).toFixed(1)} · ${statusLabel(restaurant.status)} · ${restaurant.visit_count || 0} visits`,
    note: item.note,
    actions: `
      <button class="icon-link" type="button" data-open-list-spot="${restaurant.id}">Map</button>
      <button class="icon-link danger-text" type="button" data-remove-list-spot="${restaurant.id}">Remove</button>
    `,
  });
}

function publicListItemTemplate(item) {
  const restaurant = item.restaurant;
  if (!restaurant) return "";
  return restaurantRowTemplate(restaurant, {
    body: `${distanceLabel(restaurant)} · ☆ ${Number(restaurant.personal_rating || 0).toFixed(1)} · ${escapeHtml(restaurant.address || "Address not shared")}`,
    actions: `
      <a class="icon-link" href="${escapeAttribute(restaurant.google_url || `https://www.google.com/maps?q=${restaurant.lat},${restaurant.lng}`)}" target="_blank" rel="noreferrer">Map</a>
    `,
  });
}

function restaurantRowTemplate(restaurant, options = {}) {
  const accent = accentVariant(restaurant.id);
  return `
    <article class="spot-row accent-${accent}" data-restaurant-id="${restaurant.id}">
      <span class="row-tape" aria-hidden="true"></span>
      ${restaurantThumbTemplate(restaurant)}
      <div class="spot-row-main">
        <div class="spot-row-title">
          <strong>${escapeHtml(restaurant.name)}</strong>
          <span class="tag-pill ${restaurant.status}">${statusLabel(restaurant.status)}</span>
        </div>
        <small>${options.body || ""}</small>
        ${options.note ? `<p>${escapeHtml(options.note)}</p>` : ""}
      </div>
      ${options.actions || ""}
    </article>
  `;
}

function restaurantThumbTemplate(restaurant) {
  return `
    <span class="recent-thumb ${restaurant.status}">
      <img src="${escapeAttribute(restaurantImageUrl(restaurant))}" alt="">
    </span>
  `;
}

function coverTemplate(list) {
  return list.cover_image_url
    ? `<span class="list-cover image-cover"><img src="${escapeAttribute(list.cover_image_url)}" alt=""></span>`
    : `<span class="list-cover">${list.visibility === "public" ? "🍜" : "▦"}</span>`;
}

function emptyStateTemplate(message, actionLabel) {
  return `
    <div class="empty-panel">
      <strong>${escapeHtml(message)}</strong>
      ${actionLabel ? `<button class="secondary-button" type="button" data-empty-action>${escapeHtml(actionLabel)}</button>` : ""}
    </div>
  `;
}

function loadingPanel(message) {
  return `<div class="empty-panel"><strong>${escapeHtml(message)}</strong></div>`;
}

function errorPanel(message) {
  return `<div class="empty-panel error"><strong>${escapeHtml(message)}</strong></div>`;
}

async function ensureListDetail(listId) {
  const list = lists.find((item) => item.id === listId);
  return list?.items ? list : loadListDetail(listId);
}

async function ensureDiscoveryDetail(listId) {
  const list = discoveryLists.find((item) => item.id === listId);
  return list?.items ? list : loadDiscoveryDetail(listId);
}

function bindMyListDetailActions(list) {
  if (!list) return;
  bindRestaurantRows(elements.myListDetail);
  elements.myListDetail.querySelector('[data-list-action="map"]')?.addEventListener("click", () => {
    setActiveCategory(`custom:${list.id}`);
    selectFirstVisibleRestaurant();
    setActiveView("my-map");
  });
  elements.myListDetail.querySelector('[data-list-action="edit"]')?.addEventListener("click", () => openEditListDialog(list));
  elements.myListDetail.querySelector('[data-list-action="publish"]')?.addEventListener("click", () => toggleListVisibility(list));
  elements.myListDetail.querySelector('[data-list-action="add"]')?.addEventListener("click", () => openAddSpotsDialog(list.id));
  elements.myListDetail.querySelector('[data-list-action="delete"]')?.addEventListener("click", () => deleteList(list));
  elements.myListDetail.querySelectorAll("[data-remove-list-spot]").forEach((button) => {
    button.addEventListener("click", () => removeSpotFromList(list.id, button.dataset.removeListSpot));
  });
  elements.myListDetail.querySelectorAll("[data-open-list-spot]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedRestaurantId = button.dataset.openListSpot;
      isSpotCardOpen = true;
      setActiveCategory(`custom:${list.id}`);
      setActiveView("my-map");
    });
  });
}

function bindRestaurantRows(container) {
  container.querySelectorAll("[data-restaurant-id]").forEach((row) => {
    row.addEventListener("click", (event) => {
      if (event.target.closest("a, button, input, select, textarea")) return;
      const restaurantId = row.dataset.restaurantId;
      if (!restaurants.some((restaurant) => restaurant.id === restaurantId)) return;
      selectedRestaurantId = restaurantId;
      isSpotCardOpen = true;
      render();
      openSpotDetail();
    });
  });
}

function openCreateListDialog() {
  if (!requireLogin()) return;
  editingListId = null;
  elements.listForm.reset();
  elements.listForm.elements.id.value = "";
  elements.listFormMode.textContent = "NEW_LIST";
  elements.listFormTitle.textContent = "Create List";
  elements.saveListButton.textContent = "Create List";
  elements.listFormHelp.textContent = "清单默认私密；发布后才会出现在 Discovery。";
  elements.listDialog.showModal();
}

function openEditListDialog(list) {
  editingListId = list.id;
  elements.listForm.reset();
  elements.listForm.elements.id.value = list.id;
  elements.listForm.elements.title.value = list.title;
  elements.listForm.elements.description.value = list.description || "";
  elements.listForm.elements.coverImageUrl.value = list.cover_image_url || "";
  elements.listFormMode.textContent = "EDIT_LIST";
  elements.listFormTitle.textContent = "Edit List";
  elements.saveListButton.textContent = "Update List";
  elements.listFormHelp.textContent = "修改会立即影响 My Lists；公开清单会同步更新 Discovery 展示。";
  elements.listDialog.showModal();
}

function closeListDialog() {
  elements.listDialog.close();
  editingListId = null;
  elements.listForm.reset();
}

async function saveListFromForm(event) {
  event.preventDefault();
  if (!requireLogin()) return;
  const form = new FormData(elements.listForm);
  const body = {
    title: String(form.get("title") ?? "").trim(),
    description: String(form.get("description") ?? "").trim(),
    cover_image_url: String(form.get("coverImageUrl") ?? "").trim(),
  };
  if (!body.title) {
    elements.listFormHelp.textContent = "请输入清单标题。";
    return;
  }
  try {
    elements.listFormHelp.textContent = "正在保存...";
    const data = editingListId
      ? await api(`/api/lists/${editingListId}`, { method: "PATCH", body: JSON.stringify(body) })
      : await api("/api/lists", { method: "POST", body: JSON.stringify(body) });
    const list = normalizeList(data.list);
    lists = editingListId ? lists.map((item) => (item.id === list.id ? list : item)) : [list, ...lists];
    selectedListId = list.id;
    activeMyListKey = `custom:${list.id}`;
    if (!editingListId) saveListFilterOrder([list.id, ...orderedLists().filter((item) => item.id !== list.id).map((item) => item.id)]);
    closeListDialog();
    setActiveView("my-lists");
  } catch (error) {
    elements.listFormHelp.textContent = error.message;
  }
}

async function toggleListVisibility(list) {
  if (!requireLogin()) return;
  if (list.visibility !== "public" && !list.item_count) {
    alert("至少添加一家餐厅后才能发布。");
    return;
  }
  const visibility = list.visibility === "public" ? "private" : "public";
  const data = await api(`/api/lists/${list.id}`, {
    method: "PATCH",
    body: JSON.stringify({ visibility }),
  });
  const updated = normalizeList(data.list);
  lists = lists.map((item) => (item.id === updated.id ? updated : item));
  await loadDiscoveryLists();
  render();
}

async function deleteList(list) {
  if (!requireLogin() || !confirm(`删除清单「${list.title}」吗？餐厅记录不会被删除。`)) return;
  await api(`/api/lists/${list.id}`, { method: "DELETE" });
  lists = lists.filter((item) => item.id !== list.id);
  selectedListId = lists[0]?.id ?? null;
  activeMyListKey = selectedListId ? `custom:${selectedListId}` : "system:all";
  await loadDiscoveryLists();
  render();
}

function openAddSpotsDialog(listId) {
  addSpotsListId = listId;
  elements.addSpotsSearch.value = "";
  renderAddSpotsDialog();
  elements.addSpotsDialog.showModal();
}

function renderAddSpotsDialog() {
  const list = lists.find((item) => item.id === addSpotsListId);
  if (!list) {
    elements.addSpotsList.innerHTML = emptyStateTemplate("Select a list first.", "");
    return;
  }
  const added = new Set((list.items ?? []).map((item) => item.restaurant_id));
  const term = elements.addSpotsSearch.value.trim().toLowerCase();
  const visible = restaurants.filter((restaurant) => {
    const haystack = [restaurant.name, restaurant.address, restaurant.notes].join(" ").toLowerCase();
    return !term || haystack.includes(term);
  });
  elements.addSpotsList.innerHTML = visible.length
    ? visible.map((restaurant) => `
        <article class="add-spot-row">
          ${restaurantThumbTemplate(restaurant)}
          <div>
            <strong>${escapeHtml(restaurant.name)}</strong>
            <small>☆ ${Number(restaurant.personal_rating || 0).toFixed(1)} · ${statusLabel(restaurant.status)}</small>
          </div>
          <button class="secondary-button" type="button" data-add-list-spot="${restaurant.id}" ${added.has(restaurant.id) ? "disabled" : ""}>
            ${added.has(restaurant.id) ? "Added" : "Add"}
          </button>
        </article>
      `).join("")
    : emptyStateTemplate("No restaurants match this search.", "");
  elements.addSpotsList.querySelectorAll("[data-add-list-spot]").forEach((button) => {
    button.addEventListener("click", () => addSpotToList(list.id, button.dataset.addListSpot));
  });
}

async function addSpotToList(listId, restaurantId) {
  const data = await api(`/api/lists/${listId}/items`, {
    method: "POST",
    body: JSON.stringify({ restaurant_id: restaurantId }),
  });
  const updated = normalizeList(data.list);
  lists = lists.map((item) => (item.id === updated.id ? updated : item));
  selectedListId = updated.id;
  activeMyListKey = `custom:${updated.id}`;
  renderAddSpotsDialog();
  render();
}

async function removeSpotFromList(listId, restaurantId) {
  const data = await api(`/api/lists/${listId}/items/${restaurantId}`, { method: "DELETE" });
  const updated = normalizeList(data.list);
  lists = lists.map((item) => (item.id === updated.id ? updated : item));
  selectedListId = updated.id;
  activeMyListKey = `custom:${updated.id}`;
  render();
}

async function copyPublicList() {
  if (!requireLogin()) return;
  const list = discoveryLists.find((item) => item.id === selectedDiscoveryListId);
  if (!list) return;
  const data = await api(`/api/discovery/lists/${list.id}/copy`, { method: "POST" });
  const copied = normalizeList(data.list);
  await loadRestaurants();
  await loadLists();
  await loadDiscoveryLists();
  selectedListId = copied.id;
  activeMyListKey = `custom:${copied.id}`;
  saveListFilterOrder([copied.id, ...orderedLists().filter((item) => item.id !== copied.id).map((item) => item.id)]);
  setActiveView("my-lists");
}

function selectedRestaurant() {
  return restaurants.find((restaurant) => restaurant.id === selectedRestaurantId) ?? null;
}

function restaurantsForSystemList(definition) {
  return restaurants.filter((restaurant) => definition.filter === "all" || restaurant.status === definition.filter);
}

function sortRestaurantsByDistance(items) {
  if (!currentLocation) return [...items];
  return [...items].sort((a, b) => haversineDistance(currentLocation, a) - haversineDistance(currentLocation, b));
}

function sortListItemsByDistance(items) {
  if (!currentLocation) return [...items];
  return [...items].sort((a, b) => {
    if (!a.restaurant || !b.restaurant) return a.restaurant ? -1 : 1;
    return haversineDistance(currentLocation, a.restaurant) - haversineDistance(currentLocation, b.restaurant);
  });
}

function distanceLabel(restaurant) {
  return currentLocation ? formatDistance(haversineDistance(currentLocation, restaurant)) : "Distance pending";
}

function accentVariant(value) {
  const text = String(value || "");
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash + text.charCodeAt(index) * (index + 1)) % 4;
  }
  return hash + 1;
}

function restaurantSearchText(restaurant) {
  return [restaurant.name, restaurant.address, restaurant.notes, ...(restaurant.dishes ?? []).map((dish) => dish.name)].join(" ").toLowerCase();
}

function upsertRestaurant(restaurant) {
  const normalized = normalizeRestaurant(restaurant);
  const index = restaurants.findIndex((item) => item.id === normalized.id);
  if (index >= 0) restaurants[index] = normalized;
  else restaurants = [normalized, ...restaurants];
  syncRestaurantReferences(normalized);
}

function syncRestaurantReferences(restaurant) {
  lists = lists.map((list) => ({
    ...list,
    items: Array.isArray(list.items)
      ? list.items.map((item) => (item.restaurant_id === restaurant.id ? { ...item, restaurant: normalizeRestaurant(restaurant) } : item))
      : list.items,
  }));
}

function findDuplicateRestaurant(candidate) {
  const candidateName = normalizePlaceName(candidate.name);
  const candidateUrlKey = googleMapsPlaceKey(candidate.google_url);
  const candidateCoordinates = validateCoordinates(candidate.lat, candidate.lng);
  return restaurants.find((restaurant) => {
    const sameUrl = candidateUrlKey && googleMapsPlaceKey(restaurant.google_url) === candidateUrlKey;
    if (sameUrl) return true;
    const restaurantCoordinates = validateCoordinates(restaurant.lat, restaurant.lng);
    const nearby =
      candidateCoordinates && restaurantCoordinates
        ? haversineDistance(restaurantCoordinates, candidateCoordinates) <= 0.03
        : false;
    if (!nearby) return false;
    const restaurantName = normalizePlaceName(restaurant.name);
    return candidateName && restaurantName && (candidateName === restaurantName || candidateName.includes(restaurantName) || restaurantName.includes(candidateName));
  }) ?? null;
}

function normalizePlaceName(name) {
  return String(name || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function googleMapsPlaceKey(url) {
  if (!url) return "";
  const parsed = parseGoogleMapsUrl(url);
  const name = normalizePlaceName(parsed?.name || "");
  if (parsed?.lat != null && parsed?.lng != null) {
    return `${name}|${Number(parsed.lat).toFixed(5)},${Number(parsed.lng).toFixed(5)}`;
  }
  return name ? `name:${name}` : "";
}

function normalizeRestaurant(item) {
  return {
    id: String(item.id),
    name: String(item.name || "Untitled Spot"),
    address: String(item.address || ""),
    lat: Number(item.lat),
    lng: Number(item.lng),
    google_url: String(item.google_url || item.googleUrl || `https://www.google.com/maps?q=${item.lat},${item.lng}`),
    status: ["visited", "want_to_go", "favorite"].includes(item.status) ? item.status : "want_to_go",
    visit_count: Math.max(0, Number(item.visit_count ?? item.visitCount ?? 0) || 0),
    personal_rating: Math.max(0, Math.min(5, Number(item.personal_rating ?? item.rating ?? 0) || 0)),
    notes: String(item.notes || ""),
    dishes: Array.isArray(item.dishes) ? item.dishes.map(normalizeDish) : [],
    created_at: item.created_at ?? item.createdAt ?? Date.now(),
    updated_at: item.updated_at ?? item.updatedAt ?? Date.now(),
  };
}

function normalizeDish(item) {
  return {
    id: String(item.id),
    restaurant_id: String(item.restaurant_id || ""),
    name: String(item.name || "Dish"),
    dish_status: ["liked", "tried"].includes(item.dish_status) ? item.dish_status : "tried",
    rating: Math.max(0, Math.min(5, Number(item.rating || 0))),
    image_url: String(item.image_url || ""),
    notes: String(item.notes || ""),
  };
}

function clampRating(value) {
  return Math.max(0, Math.min(5, Number.isFinite(value) ? value : 0));
}

function normalizeList(item) {
  return {
    id: String(item.id),
    owner_user_id: String(item.owner_user_id || ""),
    owner: item.owner || null,
    title: String(item.title || "Untitled List"),
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
          id: String(entry.id),
          list_id: String(entry.list_id),
          restaurant_id: String(entry.restaurant_id),
          note: String(entry.note || ""),
          sort_order: Number(entry.sort_order || 0),
          created_at: Number(entry.created_at || 0),
          restaurant: entry.restaurant ? normalizeRestaurant(entry.restaurant) : null,
        }))
      : undefined,
  };
}

function listFilterOrder() {
  try {
    const parsed = JSON.parse(localStorage.getItem(LIST_FILTER_ORDER_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function saveListFilterOrder(ids) {
  localStorage.setItem(LIST_FILTER_ORDER_KEY, JSON.stringify(ids));
}

function orderedLists() {
  const order = listFilterOrder();
  const knownIds = new Set(lists.map((list) => list.id));
  const orderedIds = order.filter((id) => knownIds.has(id));
  const missing = lists.filter((list) => !orderedIds.includes(list.id));
  const byId = new Map(lists.map((list) => [list.id, list]));
  return [...orderedIds.map((id) => byId.get(id)).filter(Boolean), ...missing];
}

function reorderListFilter(sourceId, targetId) {
  if (!sourceId || !targetId || sourceId === targetId) return;
  const ids = orderedLists().map((list) => list.id);
  const from = ids.indexOf(sourceId);
  const to = ids.indexOf(targetId);
  if (from < 0 || to < 0) return;
  ids.splice(to, 0, ids.splice(from, 1)[0]);
  saveListFilterOrder(ids);
  render();
}

function listSearchText(list) {
  return [
    list.title,
    list.description,
    list.owner?.name,
    ...(list.items ?? []).map((item) => [item.restaurant?.name, item.restaurant?.address, item.note].join(" ")),
  ].join(" ").toLowerCase();
}

function visibilityLabel(visibility) {
  return visibility === "public" ? "Public" : "Private";
}

function formatDate(timestamp) {
  if (!timestamp) return "--";
  return new Date(timestamp * 1000).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function cloneRestaurant(restaurant) {
  return normalizeRestaurant(JSON.parse(JSON.stringify(restaurant)));
}

function resetDemoData() {
  if (currentUser) {
    alert("登录后数据保存在云端，不使用 Reset Demo。");
    return;
  }
  restaurants = demoRestaurants.map(cloneRestaurant);
  selectedRestaurantId = restaurants[0]?.id ?? null;
  isSpotCardOpen = Boolean(selectedRestaurantId);
  render();
}

function exportRestaurants() {
  const blob = new Blob([JSON.stringify({ restaurants }, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `foodiemap-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function getShareToken() {
  const match = location.pathname.match(/^\/share\/([^/]+)/);
  return match ? match[1] : "";
}

function shortUserName(user) {
  return (user.name || user.email || "ME").trim().slice(0, 2).toUpperCase();
}

function statusIcon(status) {
  return { visited: "🍴", want_to_go: "⌑", favorite: "♥" }[status] || "•";
}

function statusLabel(status) {
  return { visited: "Visited", want_to_go: "Want to Go", favorite: "Favorite" }[status] || "Unknown";
}

function shortName(name) {
  return name.length > 9 ? `${name.slice(0, 8)}...` : name;
}

function shortMapName(name) {
  return name.length > 18 ? `${name.slice(0, 17)}...` : name;
}

function formatDistance(distanceKm) {
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)} m`;
  return `${Math.round(distanceKm)} km`;
}

function handleMapWheel(event) {
  if (event.target.closest(".spot-card, .spot-card-tab, .map-zoom-controls")) return;
  event.preventDefault();
  const delta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
  const factor = Math.exp(-delta * 0.0018);
  setMapZoom(mapZoom * factor);
}

function setMapZoom(value) {
  const next = Math.max(MAP_ZOOM_MIN, Math.min(MAP_ZOOM_MAX, value));
  if (Math.abs(next - mapZoom) < 0.005) return;
  mapZoom = next;
  renderMarkers();
}

function updateMapZoomUi() {
  elements.cuteMap?.style.setProperty("--map-zoom", mapZoom.toFixed(2));
  if (elements.mapZoomLabel) elements.mapZoomLabel.textContent = `${Math.round(mapZoom * 100)}%`;
}

function layoutMapMarkers(items) {
  const bounds = elements.cuteMap?.getBoundingClientRect();
  const mapWidth = Math.max(320, bounds?.width || 900);
  const mapHeight = Math.max(320, bounds?.height || 560);
  const markerWidth = mapWidth < 720 ? 86 : 104;
  const markerHeight = mapWidth < 720 ? 104 : 126;
  const minDx = (markerWidth / mapWidth) * 100;
  const minDy = (markerHeight / mapHeight) * 100;
  const points = items.map((restaurant, index) => {
    const distance = currentLocation ? haversineDistance(currentLocation, restaurant) : 0;
    const bearing = currentLocation ? getBearing(currentLocation, restaurant) : index * 137;
    return {
      id: restaurant.id,
      ...mapPoint(distance, bearing, index),
    };
  });

  for (let pass = 0; pass < 10; pass += 1) {
    for (let a = 0; a < points.length; a += 1) {
      for (let b = a + 1; b < points.length; b += 1) {
        const first = points[a];
        const second = points[b];
        const dx = second.x - first.x;
        const dy = second.y - first.y;
        if (Math.abs(dx) >= minDx || Math.abs(dy) >= minDy) continue;
        const length = Math.hypot(dx, dy) || 1;
        const fallbackX = a % 2 ? 1 : -1;
        const fallbackY = b % 2 ? 1 : -1;
        const pushX = ((minDx - Math.abs(dx)) / 2 + 0.8) * (dx ? dx / length : fallbackX);
        const pushY = ((minDy - Math.abs(dy)) / 2 + 0.8) * (dy ? dy / length : fallbackY);
        first.x -= pushX;
        first.y -= pushY;
        second.x += pushX;
        second.y += pushY;
      }
    }
    points.forEach((point) => {
      point.x = Math.max(7, Math.min(93, point.x));
      point.y = Math.max(10, Math.min(90, point.y));
    });
  }

  return new Map(points.map((point) => [point.id, { x: point.x, y: point.y }]));
}

function restaurantImageUrl(restaurant) {
  const dishImage = (restaurant.dishes ?? []).find((dish) => dish.image_url)?.image_url;
  return dishImage || foodPlaceholderUrl(restaurant);
}

function foodPlaceholderUrl(restaurant) {
  const preset = FOOD_PLACEHOLDERS[accentVariant(restaurant.id) % FOOD_PLACEHOLDERS.length];
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 180">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="${preset.top}"/>
          <stop offset="1" stop-color="${preset.bottom}"/>
        </linearGradient>
        <pattern id="dots" width="18" height="18" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="3" r="1.2" fill="${preset.accent}" opacity=".16"/>
        </pattern>
      </defs>
      <rect width="240" height="180" rx="28" fill="url(#g)"/>
      <rect width="240" height="180" fill="url(#dots)"/>
      <circle cx="120" cy="92" r="54" fill="#fffaf4" opacity=".72"/>
      <text x="120" y="111" text-anchor="middle" font-size="62">${preset.icon}</text>
      <path d="M38 148 C80 132 148 168 202 143" fill="none" stroke="${preset.accent}" stroke-width="8" stroke-linecap="round" opacity=".28"/>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function haversineDistance(origin, destination) {
  const radius = 6371;
  const dLat = toRad(destination.lat - origin.lat);
  const dLng = toRad(destination.lng - origin.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(origin.lat)) * Math.cos(toRad(destination.lat)) * Math.sin(dLng / 2) ** 2;
  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getBearing(origin, destination) {
  const lat1 = toRad(origin.lat);
  const lat2 = toRad(destination.lat);
  const dLng = toRad(destination.lng - origin.lng);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

function mapPoint(distanceKm, bearing, index) {
  const maxDistance = 15;
  const radius = Math.min((distanceKm / maxDistance) * 38 * mapZoom, 44);
  const jitter = ((index % 5) - 2) * 1.1;
  const angle = toRad(bearing);
  return {
    x: 50 + Math.sin(angle) * radius + jitter,
    y: 50 - Math.cos(angle) * radius - jitter,
  };
}

function toRad(degrees) {
  return (degrees * Math.PI) / 180;
}

function toDeg(radians) {
  return (radians * 180) / Math.PI;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[character]);
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/`/g, "&#096;");
}
