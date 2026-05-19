const STORAGE_KEY = "gourmet-map-restaurants";
const SETTINGS_KEY = "gourmet-map-settings";
const GOOGLE_MAPS_HELP =
  "推荐复制 Google Maps 浏览器地址栏里的完整链接；短分享链接可能需要先在浏览器打开后再复制。";
const SHORT_LINK_HELP =
  "这是 Google Maps 短链接，网页无法直接读取跳转后的坐标。请先在浏览器打开它，再复制地址栏里的完整 maps/place 链接粘回来。";
const SERVER_HELP =
  "短链服务未连接。请停止当前服务，改用：python3 server.py 5174，然后打开 http://localhost:5174";

const demoRestaurants = [
  {
    id: crypto.randomUUID(),
    name: "Hachi Ramen",
    address: "131 Beecroft Rd, Toronto",
    lat: 43.7682,
    lng: -79.4139,
    googleUrl: "https://www.google.com/maps?q=43.7682,-79.4139",
    status: "visited",
    rating: 4.9,
    notes: "汤底浓郁，适合寒冷晚上。队伍可能有点久。",
    dishes: ["Tonkotsu", "Gyoza"],
    createdAt: Date.now() - 200000,
  },
  {
    id: crypto.randomUUID(),
    name: "Onigiri Corner",
    address: "100 Queen St W, Toronto",
    lat: 43.6535,
    lng: -79.3839,
    googleUrl: "https://www.google.com/maps?q=43.6535,-79.3839",
    status: "want_to_go",
    rating: 4.5,
    notes: "想试明太子饭团和抹茶。",
    dishes: ["Mentaiko", "Matcha"],
    createdAt: Date.now() - 100000,
  },
  {
    id: crypto.randomUUID(),
    name: "Matcha Mornings",
    address: "30 Carlton St, Toronto",
    lat: 43.6618,
    lng: -79.3817,
    googleUrl: "https://www.google.com/maps?q=43.6618,-79.3817",
    status: "favorite",
    rating: 4.8,
    notes: "甜品稳定，适合周末下午。",
    dishes: ["Matcha Latte", "Roll Cake"],
    createdAt: Date.now() - 50000,
  },
];

let restaurants = loadRestaurants();
let settings = loadSettings();
let currentLocation = null;
let activeFilter = "all";
let selectedRestaurantId = restaurants[0]?.id ?? null;
let editingRestaurantId = null;
let shortLinkResolveTimer = null;
let quickPasteMode = false;
let shortLinkServiceAvailable = false;

const elements = {
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
  settingsDialog: document.querySelector("#settingsDialog"),
  settingsForm: document.querySelector("#settingsForm"),
  closeSettings: document.querySelector("#closeSettings"),
  googleApiKey: document.querySelector("#googleApiKey"),
  markersLayer: document.querySelector("#markersLayer"),
  emptyMap: document.querySelector("#emptyMap"),
  locationStatus: document.querySelector("#locationStatus"),
  recentList: document.querySelector("#recentList"),
  placeCount: document.querySelector("#placeCount"),
  countAll: document.querySelector("#countAll"),
  countVisited: document.querySelector("#countVisited"),
  countWant: document.querySelector("#countWant"),
  countFavorite: document.querySelector("#countFavorite"),
  cuteMap: document.querySelector("#cuteMap"),
  spotCard: document.querySelector("#spotCard"),
  spotName: document.querySelector("#spotName"),
  spotDistance: document.querySelector("#spotDistance"),
  spotRating: document.querySelector("#spotRating"),
  spotStatus: document.querySelector("#spotStatus"),
  spotNotes: document.querySelector("#spotNotes"),
  spotDishes: document.querySelector("#spotDishes"),
  openGoogleMaps: document.querySelector("#openGoogleMaps"),
  closeCard: document.querySelector("#closeCard"),
  editSpot: document.querySelector("#editSpot"),
  deleteSpot: document.querySelector("#deleteSpot"),
};

boot();

function boot() {
  elements.googleApiKey.value = settings.googleApiKey ?? "";
  bindEvents();
  render();
  checkShortLinkService();
  requestLocation();
}

function bindEvents() {
  elements.locateButton.addEventListener("click", requestLocation);
  elements.mapLocateButton.addEventListener("click", requestLocation);
  elements.openAddPanel.addEventListener("click", openCreateDialog);
  elements.pasteAddButton.addEventListener("click", pasteAndAddFromClipboard);
  elements.closeAddPanel.addEventListener("click", closeRestaurantDialog);
  elements.addDialog.addEventListener("close", () => {
    if (!editingRestaurantId) resetRestaurantForm();
  });
  elements.settingsButton.addEventListener("click", () => elements.settingsDialog.showModal());
  elements.closeSettings.addEventListener("click", () => elements.settingsDialog.close());
  elements.exportButton.addEventListener("click", exportRestaurants);
  elements.importButton.addEventListener("click", () => elements.importFile.click());
  elements.importFile.addEventListener("change", importRestaurants);
  elements.resetButton.addEventListener("click", resetDemoData);
  elements.loginButton.addEventListener("click", () => {
    elements.loginButton.textContent = elements.loginButton.textContent === "ME" ? "YOU" : "ME";
  });
  elements.closeCard.addEventListener("click", () => {
    selectedRestaurantId = null;
    renderSpotCard();
  });
  elements.editSpot.addEventListener("click", openEditDialog);
  elements.deleteSpot.addEventListener("click", deleteSelectedRestaurant);
  elements.searchInput.addEventListener("input", render);
  elements.googleUrlInput.addEventListener("input", autofillFromGoogleMapsUrl);

  document.querySelectorAll(".filter-item").forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter;
      document.querySelectorAll(".filter-item").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      render();
    });
  });

  elements.settingsForm.addEventListener("submit", (event) => {
    event.preventDefault();
    settings.googleApiKey = elements.googleApiKey.value.trim();
    saveSettings();
    elements.settingsDialog.close();
  });

  elements.restaurantForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = getRestaurantPayload();

    try {
      elements.formHelp.textContent = "正在解析位置...";
      const coordinates = await resolveCoordinates(payload);
      const restaurant = {
        id: editingRestaurantId || crypto.randomUUID(),
        ...payload,
        ...coordinates,
        googleUrl: payload.googleUrl || `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`,
        createdAt: editingRestaurantId
          ? restaurants.find((item) => item.id === editingRestaurantId)?.createdAt || Date.now()
          : Date.now(),
        updatedAt: Date.now(),
      };
      restaurants = editingRestaurantId
        ? restaurants.map((item) => (item.id === editingRestaurantId ? restaurant : item))
        : [restaurant, ...restaurants];
      selectedRestaurantId = restaurant.id;
      saveRestaurants();
      resetRestaurantForm();
      elements.addDialog.close();
      render();
    } catch (error) {
      elements.formHelp.textContent = error.message;
    }
  });
}

function openCreateDialog() {
  resetRestaurantForm();
  elements.addDialog.showModal();
}

function openEditDialog() {
  const selected = restaurants.find((restaurant) => restaurant.id === selectedRestaurantId);
  if (!selected) return;

  editingRestaurantId = selected.id;
  elements.formModeLabel.textContent = "EDIT_SPOT";
  elements.formTitle.textContent = "Edit Bite";
  elements.saveSpotButton.textContent = "Update Spot";
  elements.formHelp.textContent = "更新后会覆盖当前餐厅记录。";

  const form = elements.restaurantForm.elements;
  form.id.value = selected.id;
  form.name.value = selected.name || "";
  form.address.value = selected.address || "";
  form.googleUrl.value = selected.googleUrl || "";
  form.lat.value = selected.lat ?? "";
  form.lng.value = selected.lng ?? "";
  form.status.value = selected.status || "visited";
  form.rating.value = selected.rating ?? 0;
  form.dishes.value = (selected.dishes || []).join(", ");
  form.notes.value = selected.notes || "";
  elements.addDialog.showModal();
}

function closeRestaurantDialog() {
  elements.addDialog.close();
  resetRestaurantForm();
}

function resetRestaurantForm() {
  quickPasteMode = false;
  editingRestaurantId = null;
  elements.restaurantForm.reset();
  elements.formModeLabel.textContent = "NEW_SPOT";
  elements.formTitle.textContent = "Save a Bite";
  elements.saveSpotButton.textContent = "Save Spot";
  elements.formHelp.textContent =
    GOOGLE_MAPS_HELP;
}

function autofillFromGoogleMapsUrl() {
  const form = elements.restaurantForm.elements;
  const googleUrl = elements.googleUrlInput.value.trim();
  if (isGoogleMapsShortLink(googleUrl)) {
    elements.formHelp.textContent = "正在展开 Google Maps 短链接...";
    setPasteStatus("正在展开 Google Maps 短链接...");
    window.clearTimeout(shortLinkResolveTimer);
    shortLinkResolveTimer = window.setTimeout(() => resolveShortGoogleMapsLink(googleUrl, quickPasteMode), 450);
    return;
  }

  const parsed = parseGoogleMapsUrl(googleUrl);
  if (!parsed) return;

  const nameWasEmpty = !form.name.value.trim();
  if (parsed.name && nameWasEmpty) {
    form.name.value = parsed.name;
  }

  if (parsed.lat != null && parsed.lng != null) {
    form.lat.value = parsed.lat;
    form.lng.value = parsed.lng;
    elements.formHelp.textContent = parsed.name
      ? "已从 Google Maps 链接识别店名和坐标。"
      : "已从 Google Maps 链接识别坐标。";
    setPasteStatus(elements.formHelp.textContent);
    if (quickPasteMode) {
      addParsedRestaurantWithConfirmation({ ...parsed, url: googleUrl });
    }
  } else if (parsed.name && nameWasEmpty) {
    elements.formHelp.textContent = "已从 Google Maps 链接识别店名，但没有找到坐标。";
    setPasteStatus(elements.formHelp.textContent);
  }
}

async function resolveShortGoogleMapsLink(url, confirmAfterResolve = false) {
  const form = elements.restaurantForm.elements;
  if (elements.googleUrlInput.value.trim() !== url) return;

  if (!shortLinkServiceAvailable) {
    elements.formHelp.textContent = SERVER_HELP;
    setPasteStatus(SERVER_HELP);
    return;
  }

  try {
    const endpoint = new URL("/api/resolve-google-link", window.location.origin);
    endpoint.searchParams.set("url", url);
    const response = await fetch(endpoint);
    const data = await response.json();
    if (!response.ok || !data.url) throw new Error(data.error || `短链展开接口返回 ${response.status}`);

    elements.googleUrlInput.value = data.url;
    elements.formHelp.textContent = "短链接已展开，正在识别店名和坐标...";
    setPasteStatus(elements.formHelp.textContent);
    const parsed = parseGoogleMapsUrl(data.url);
    if (parsed?.lat != null && parsed?.lng != null) {
      autofillFormFromParsed(parsed);
      if (confirmAfterResolve) addParsedRestaurantWithConfirmation({ ...parsed, url: data.url });
      return;
    }
    autofillFromGoogleMapsUrl();
  } catch (error) {
    const message = `${error.message || SHORT_LINK_HELP}。${SERVER_HELP}`;
    elements.formHelp.textContent = message;
    setPasteStatus(message);
  }
}

async function pasteAndAddFromClipboard() {
  quickPasteMode = true;
  setPasteStatus("正在读取剪贴板...");
  elements.pasteAddButton.textContent = "Reading...";

  if (!navigator.clipboard?.readText) {
    openPasteFallback("当前浏览器不支持直接读取剪贴板。请在链接框按 Cmd+V。");
    return;
  }

  try {
    const clipboardText = (await navigator.clipboard.readText()).trim();
    const googleUrl = extractGoogleMapsUrl(clipboardText);
    if (!googleUrl) {
      openPasteFallback("剪贴板里没有识别到 Google Maps 链接。请在链接框按 Cmd+V。");
      return;
    }

    elements.pasteAddButton.textContent = "Parsing...";
    setPasteStatus("已读取剪贴板，正在识别链接...");
    const parsed = await parseAnyGoogleMapsLink(googleUrl);
    if (parsed?.lat == null || parsed?.lng == null) {
      openPasteFallback("没有从链接里识别到坐标。请确认复制的是 Google Maps 餐厅链接。");
      return;
    }

    addParsedRestaurantWithConfirmation(parsed);
  } catch (error) {
    openPasteFallback(error.message || "读取剪贴板失败。请在链接框按 Cmd+V。");
  } finally {
    elements.pasteAddButton.textContent = "Paste & Add";
  }
}

function openPasteFallback(message) {
  setPasteStatus(message);
  openCreateDialog();
  quickPasteMode = true;
  elements.formHelp.textContent = message;
  window.setTimeout(() => elements.googleUrlInput.focus(), 0);
  elements.pasteAddButton.textContent = "Paste & Add";
}

function autofillFormFromParsed(parsed) {
  const form = elements.restaurantForm.elements;
  if (parsed.name && !form.name.value.trim()) form.name.value = parsed.name;
  form.lat.value = parsed.lat;
  form.lng.value = parsed.lng;
  elements.formHelp.textContent = parsed.name
    ? "已从 Google Maps 链接识别店名和坐标。"
    : "已从 Google Maps 链接识别坐标。";
  setPasteStatus(elements.formHelp.textContent);
}

function addParsedRestaurantWithConfirmation(parsed) {
  quickPasteMode = false;
  const name = parsed.name || prompt("已识别坐标，但没有识别到店名。请输入店名：", "");
  if (!name) {
    setPasteStatus("已取消添加。");
    return;
  }

  const confirmed = confirm(`添加这家餐厅吗？\n\n${name}\n${parsed.lat}, ${parsed.lng}`);
  if (!confirmed) {
    setPasteStatus("已取消添加。");
    return;
  }

  const restaurant = {
    id: crypto.randomUUID(),
    name,
    address: "",
    lat: parsed.lat,
    lng: parsed.lng,
    googleUrl: parsed.url || `https://www.google.com/maps?q=${parsed.lat},${parsed.lng}`,
    status: "want_to_go",
    rating: 4.5,
    notes: "",
    dishes: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  restaurants = [restaurant, ...restaurants];
  selectedRestaurantId = restaurant.id;
  saveRestaurants();
  if (elements.addDialog.open) elements.addDialog.close();
  render();
  setPasteStatus(`已添加：${name}`);
}

function setPasteStatus(message) {
  elements.pasteStatus.textContent = message;
}

function extractGoogleMapsUrl(text) {
  const match = String(text).match(
    /https?:\/\/(?:www\.google\.[^\s/]+\/maps|maps\.google\.[^\s/]+|maps\.app\.goo\.gl|goo\.gl\/maps)[^\s)]*/i,
  );
  return match?.[0] || "";
}

async function parseAnyGoogleMapsLink(url) {
  if (isGoogleMapsShortLink(url)) {
    if (!shortLinkServiceAvailable) throw new Error(SERVER_HELP);
    const endpoint = new URL("/api/resolve-google-link", window.location.origin);
    endpoint.searchParams.set("url", url);
    const response = await fetch(endpoint);
    const data = await response.json();
    if (!response.ok || !data.url) throw new Error(data.error || SHORT_LINK_HELP);
    const parsed = parseGoogleMapsUrl(data.url);
    return parsed ? { ...parsed, url: data.url } : null;
  }

  const parsed = parseGoogleMapsUrl(url);
  return parsed ? { ...parsed, url } : null;
}

async function checkShortLinkService() {
  try {
    const response = await fetch("/api/health", { cache: "no-store" });
    const data = await response.json();
    shortLinkServiceAvailable = Boolean(response.ok && data.ok);
    setPasteStatus(
      shortLinkServiceAvailable
        ? "短链服务已连接。复制 Google Maps 链接后点 Paste & Add。"
        : SERVER_HELP,
    );
  } catch {
    shortLinkServiceAvailable = false;
    setPasteStatus(SERVER_HELP);
  }
}

function getRestaurantPayload() {
  const form = new FormData(elements.restaurantForm);
  const rating = Number(form.get("rating") ?? 0);
  return {
    name: String(form.get("name") ?? "").trim(),
    address: String(form.get("address") ?? "").trim(),
    googleUrl: String(form.get("googleUrl") ?? "").trim(),
    lat: parseOptionalNumber(form.get("lat")),
    lng: parseOptionalNumber(form.get("lng")),
    status: String(form.get("status") ?? "visited"),
    rating: Number.isFinite(rating) ? Math.max(0, Math.min(5, rating)) : 0,
    dishes: String(form.get("dishes") ?? "")
      .split(",")
      .map((dish) => dish.trim())
      .filter(Boolean),
    notes: String(form.get("notes") ?? "").trim(),
  };
}

function loadRestaurants() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(demoRestaurants));
    return demoRestaurants;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return demoRestaurants;
  }
}

function saveRestaurants() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(restaurants));
}

function loadSettings() {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY)) ?? {};
  } catch {
    return {};
  }
}

function saveSettings() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function exportRestaurants() {
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    restaurants,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `gourmet-map-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

async function importRestaurants(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    const content = await file.text();
    const parsed = JSON.parse(content);
    const imported = Array.isArray(parsed) ? parsed : parsed.restaurants;
    if (!Array.isArray(imported)) throw new Error("JSON 里没有 restaurants 数组。");

    const normalized = imported.map(normalizeRestaurant).filter(Boolean);
    if (!normalized.length) throw new Error("没有可导入的餐厅。");

    restaurants = mergeRestaurants(normalized, restaurants);
    selectedRestaurantId = restaurants[0]?.id ?? null;
    saveRestaurants();
    render();
  } catch (error) {
    alert(`导入失败：${error.message}`);
  } finally {
    elements.importFile.value = "";
  }
}

function resetDemoData() {
  if (!confirm("要把本地数据重置为演示数据吗？当前保存的餐厅会被覆盖。")) return;
  restaurants = demoRestaurants.map((restaurant) => ({ ...restaurant, id: crypto.randomUUID() }));
  selectedRestaurantId = restaurants[0]?.id ?? null;
  saveRestaurants();
  render();
}

function requestLocation() {
  if (!navigator.geolocation) {
    setFallbackLocation("浏览器不支持定位，使用多伦多市中心作为临时位置。");
    return;
  }

  elements.locationStatus.textContent = "正在获取当前位置...";
  navigator.geolocation.getCurrentPosition(
    (position) => {
      currentLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      elements.locationStatus.textContent = `当前位置 ${currentLocation.lat.toFixed(3)}, ${currentLocation.lng.toFixed(3)}`;
      render();
    },
    () => setFallbackLocation("定位被拒绝，使用多伦多市中心作为临时位置。"),
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
  );
}

function setFallbackLocation(message) {
  currentLocation = { lat: 43.6532, lng: -79.3832 };
  elements.locationStatus.textContent = message;
  render();
}

async function resolveCoordinates(payload) {
  const manualCoordinates = validateCoordinates(payload.lat, payload.lng);
  if (manualCoordinates) return manualCoordinates;

  if (isGoogleMapsShortLink(payload.googleUrl)) {
    throw new Error(SHORT_LINK_HELP);
  }

  const fromUrl = parseGoogleMapsUrl(payload.googleUrl);
  if (fromUrl?.lat != null && fromUrl?.lng != null) {
    return { lat: fromUrl.lat, lng: fromUrl.lng };
  }

  if (!payload.address) {
    throw new Error("请填写地址，或粘贴包含坐标的 Google Maps 链接。");
  }

  if (!settings.googleApiKey) {
    throw new Error("这个链接没有可解析坐标。请在设置里填写 Google Geocoding API Key，或粘贴带坐标的 Google Maps 链接。");
  }

  const endpoint = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  endpoint.searchParams.set("address", payload.address);
  endpoint.searchParams.set("key", settings.googleApiKey);

  const response = await fetch(endpoint);
  const data = await response.json();
  const result = data.results?.[0]?.geometry?.location;

  if (!response.ok || !result) {
    throw new Error(data.error_message || "地址转坐标失败，请检查地址或 Google API Key。");
  }

  return { lat: result.lat, lng: result.lng };
}

function parseGoogleMapsUrl(url) {
  if (!url) return null;
  const decodedUrl = safeDecodeUrl(url.replace(/\+/g, " "));
  const name = parseGoogleMapsPlaceName(decodedUrl);
  const patterns = [
    /@(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,
    /[?&]q=(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,
    /[?&]query=(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,
    /[?&]destination=(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,
    /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/,
    /ll=(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,
  ];

  for (const pattern of patterns) {
    const match = decodedUrl.match(pattern);
    if (match) {
      return { name, lat: Number(match[1]), lng: Number(match[2]) };
    }
  }

  return name ? { name } : null;
}

function isGoogleMapsShortLink(url) {
  return /^https?:\/\/(?:maps\.app\.goo\.gl|goo\.gl\/maps)\//i.test(String(url).trim());
}

function safeDecodeUrl(url) {
  try {
    return decodeURIComponent(url);
  } catch {
    return url;
  }
}

function parseGoogleMapsPlaceName(decodedUrl) {
  const placeMatch = decodedUrl.match(/\/maps\/place\/([^/?#]+)/);
  if (!placeMatch) return "";
  return placeMatch[1]
    .replace(/\+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function validateCoordinates(lat, lng) {
  const hasLat = lat !== null;
  const hasLng = lng !== null;
  if (!hasLat && !hasLng) return null;
  if (
    !hasLat ||
    !hasLng ||
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    throw new Error("经纬度格式不正确，请填写有效纬度 -90 到 90、经度 -180 到 180。");
  }
  return { lat, lng };
}

function parseOptionalNumber(value) {
  const text = String(value ?? "").trim();
  if (!text) return null;
  const number = Number(text);
  return Number.isFinite(number) ? number : NaN;
}

function normalizeRestaurant(item) {
  if (!item || typeof item !== "object") return null;
  const lat = Number(item.lat);
  const lng = Number(item.lng);
  if (!item.name || !Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  return {
    id: String(item.id || crypto.randomUUID()),
    name: String(item.name).trim(),
    address: String(item.address || "").trim(),
    lat,
    lng,
    googleUrl: String(item.googleUrl || `https://www.google.com/maps?q=${lat},${lng}`),
    status: ["visited", "want_to_go", "favorite"].includes(item.status) ? item.status : "visited",
    rating: Math.max(0, Math.min(5, Number(item.rating) || 0)),
    notes: String(item.notes || ""),
    dishes: Array.isArray(item.dishes) ? item.dishes.map(String).filter(Boolean) : [],
    createdAt: Number(item.createdAt) || Date.now(),
    updatedAt: Number(item.updatedAt) || Date.now(),
  };
}

function mergeRestaurants(incoming, existing) {
  const byId = new Map(existing.map((restaurant) => [restaurant.id, restaurant]));
  incoming.forEach((restaurant) => byId.set(restaurant.id, restaurant));
  return Array.from(byId.values()).sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0));
}

function render() {
  renderCounts();
  renderRecentList();
  renderMarkers();
  renderSpotCard();
}

function getVisibleRestaurants() {
  const query = elements.searchInput.value.trim().toLowerCase();
  return restaurants.filter((restaurant) => {
    const matchesFilter = activeFilter === "all" || restaurant.status === activeFilter;
    const matchesSearch = [restaurant.name, restaurant.address, restaurant.notes, ...(restaurant.dishes ?? [])]
      .join(" ")
      .toLowerCase()
      .includes(query);
    return matchesFilter && matchesSearch;
  });
}

function renderCounts() {
  elements.placeCount.textContent = `${restaurants.length} places`;
  elements.countAll.textContent = restaurants.length;
  elements.countVisited.textContent = restaurants.filter((item) => item.status === "visited").length;
  elements.countWant.textContent = restaurants.filter((item) => item.status === "want_to_go").length;
  elements.countFavorite.textContent = restaurants.filter((item) => item.status === "favorite").length;
}

function renderRecentList() {
  const recent = getVisibleRestaurants().slice(0, 3);
  if (!recent.length) {
    elements.recentList.innerHTML = '<p class="empty-recent">没有匹配餐厅</p>';
    return;
  }

  elements.recentList.innerHTML = recent
    .map(
      (restaurant) => `
        <button class="recent-item" data-id="${restaurant.id}">
          <span class="recent-thumb">${statusIcon(restaurant.status)}</span>
          <span>
            <strong>${escapeHtml(restaurant.name)}</strong>
            <small>☆ ${Number(restaurant.rating || 0).toFixed(1)}</small>
          </span>
          <span>♡</span>
        </button>
      `,
    )
    .join("");

  elements.recentList.querySelectorAll(".recent-item").forEach((item) => {
    item.addEventListener("click", () => {
      selectedRestaurantId = item.dataset.id;
      renderSpotCard();
    });
  });
}

function renderMarkers() {
  const visible = getVisibleRestaurants();
  elements.emptyMap.style.display = visible.length ? "none" : "grid";
  elements.markersLayer.innerHTML = "";

  if (!currentLocation) return;

  visible.forEach((restaurant, index) => {
    const distance = haversineDistance(currentLocation, restaurant);
    const bearing = getBearing(currentLocation, restaurant);
    const point = mapPoint(distance, bearing, index);
    const marker = document.createElement("button");
    marker.className = `restaurant-marker ${restaurant.status}`;
    marker.style.left = `${point.x}%`;
    marker.style.top = `${point.y}%`;
    marker.innerHTML = `
      <span class="marker-icon">${statusIcon(restaurant.status)}</span>
      <small>${escapeHtml(shortName(restaurant.name))}</small>
      <small class="marker-distance">${formatDistance(distance)}</small>
    `;
    marker.title = `${restaurant.name} - ${formatDistance(distance)}`;
    marker.addEventListener("click", () => {
      selectedRestaurantId = restaurant.id;
      renderSpotCard();
    });
    elements.markersLayer.appendChild(marker);
  });
}

function renderSpotCard() {
  const selected = restaurants.find((restaurant) => restaurant.id === selectedRestaurantId);
  const hasSelection = Boolean(selected);

  if (!selected) {
    elements.spotName.textContent = "选择一家餐厅";
    elements.spotDistance.textContent = "-- km";
    elements.spotRating.textContent = "☆ --";
    elements.spotStatus.textContent = "--";
    elements.spotNotes.textContent = "点击地图上的餐厅图标查看详情。";
    elements.spotDishes.innerHTML = "";
    elements.openGoogleMaps.href = "#";
    elements.editSpot.disabled = true;
    elements.deleteSpot.disabled = true;
    return;
  }

  const distance = currentLocation ? haversineDistance(currentLocation, selected) : null;
  elements.spotName.textContent = selected.name;
  elements.spotDistance.textContent = distance == null ? "等待定位" : formatDistance(distance);
  elements.spotRating.textContent = `☆ ${Number(selected.rating || 0).toFixed(1)}`;
  elements.spotStatus.textContent = statusLabel(selected.status);
  elements.spotNotes.textContent = selected.notes || selected.address || "还没有记录想法。";
  elements.spotDishes.innerHTML = (selected.dishes ?? []).map((dish) => `<span>${escapeHtml(dish)}</span>`).join("");
  elements.openGoogleMaps.href = selected.googleUrl || `https://www.google.com/maps?q=${selected.lat},${selected.lng}`;
  elements.editSpot.disabled = !hasSelection;
  elements.deleteSpot.disabled = !hasSelection;
}

function deleteSelectedRestaurant() {
  const selected = restaurants.find((restaurant) => restaurant.id === selectedRestaurantId);
  if (!selected) return;
  if (!confirm(`删除「${selected.name}」吗？`)) return;

  restaurants = restaurants.filter((restaurant) => restaurant.id !== selected.id);
  selectedRestaurantId = restaurants[0]?.id ?? null;
  saveRestaurants();
  render();
}

function mapPoint(distanceKm, bearing, index) {
  const maxDistance = 15;
  const clampedDistance = Math.min(distanceKm, maxDistance);
  const radius = 18 + (clampedDistance / maxDistance) * 32;
  const jitter = ((index % 5) - 2) * 2.5;
  const angle = ((bearing - 90 + index * 18) * Math.PI) / 180;
  const x = 50 + Math.cos(angle) * (radius + jitter);
  const y = 50 + Math.sin(angle) * (radius + jitter);
  return {
    x: Math.max(8, Math.min(92, x)),
    y: Math.max(10, Math.min(90, y)),
  };
}

function haversineDistance(from, to) {
  const earthRadius = 6371;
  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);
  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(to.lat);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadius * c;
}

function getBearing(from, to) {
  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(to.lat);
  const dLng = toRadians(to.lng - from.lng);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return (toDegrees(Math.atan2(y, x)) + 360) % 360;
}

function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

function toDegrees(radians) {
  return (radians * 180) / Math.PI;
}

function formatDistance(distanceKm) {
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)} m`;
  return `${distanceKm.toFixed(distanceKm < 10 ? 1 : 0)} km`;
}

function statusIcon(status) {
  return {
    visited: "🍜",
    want_to_go: "🍙",
    favorite: "🍰",
  }[status] ?? "🍽";
}

function statusLabel(status) {
  return {
    visited: "Visited",
    want_to_go: "Want to Go",
    favorite: "Favorite",
  }[status] ?? "Saved";
}

function shortName(name) {
  return name.length > 10 ? `${name.slice(0, 9)}…` : name;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
