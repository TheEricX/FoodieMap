const LANGUAGE_KEY = "foodiemap:language";
const LIST_FILTER_ORDER_KEY = "foodiemap:list-filter-order";
const GOOGLE_GEOCODING_KEY = "foodiemap:google-geocoding-key";
const LOCATION_PREFERENCE_KEY = "foodiemap.locationMode.v1";
const LOCATION_CORE_URL = "/location-core.mjs?v=20260710-location";
const UI_CORE_URL = "/ui-core.mjs?v=20260712-shell";
const UI_SHELL_URL = "/ui-shell.mjs?v=20260712-shell";
const UI_DIALOGS_URL = "/ui-dialogs.mjs?v=20260714-dialogs";
const UI_COMPONENTS_URL = "/ui-components.mjs?v=20260714-components";
const UI_SWIPE_DISMISS_URL = "/ui-swipe-dismiss.mjs?v=20260714-swipe-dismiss";
const DATA_CLIENT_URL = "/data-client.mjs?v=20260714-client";
const DOMAIN_CORE_URL = "/domain-core.mjs?v=20260714-domain";
const VIEW_TEMPLATES_URL = "/view-templates.mjs?v=20260714-views";
const LIST_VIEW_TEMPLATES_URL = "/list-view-templates.mjs?v=20260714-lists";
const ACCOUNT_SHARE_TEMPLATES_URL = "/account-share-templates.mjs?v=20260714-account";
const FORM_TEMPLATES_URL = "/form-templates.mjs?v=20260714-forms";
const MAP_VIEW_TEMPLATES_URL = "/map-view-templates.mjs?v=20260714-map";
const I18N_URL = "/i18n.mjs?v=20260714-i18n";
const MAP_LINK_CORE_URL = "/map-link-core.mjs?v=20260714-map-links";
const MAP_GEOMETRY_URL = "/map-geometry.mjs?v=20260714-map-geometry";
const MAP_INTERACTIONS_URL = "/map-interactions.mjs?v=20260714-map-interactions";
const isAdminPortal = window.location.pathname.replace(/\/+$/, "") === "/admin";
const MAP_ZOOM_MIN = 0.65;
const MAP_ZOOM_MAX = 2.8;
const MAP_ZOOM_STEP = 0.18;
const MAP_PAN_LIMIT_RATIO = 0.42;
let currentLanguage = getInitialLanguage();
let i18nCore = null;

function getInitialLanguage() {
  try {
    const stored = localStorage.getItem(LANGUAGE_KEY);
    return stored === "zh" ? "zh" : "en";
  } catch {
    return "en";
  }
}

function t(key, params = {}) {
  return i18nCore?.translate(currentLanguage, key, params) ?? key;
}

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
    notes: "Rich broth, good for cold evenings. The line can be a little long.",
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
    notes: "Want to try the mentaiko rice ball and matcha.",
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
    notes: "Reliable desserts, good for a weekend afternoon.",
    dishes: [{ id: "demo-dish-4", name: "Matcha Latte", dish_status: "liked", rating: 4.8, image_url: "", notes: "" }],
  },
];

const systemLists = [
  { key: "all", icon: "◎", filter: "all" },
  { key: "visited", icon: "🍴", filter: "visited" },
  { key: "want_to_go", icon: "⌑", filter: "want_to_go" },
  { key: "favorite", icon: "♥", filter: "favorite" },
];

let restaurants = [];
let currentUser = null;
let currentAdmin = null;
let currentLocation = null;
let locationCore = null;
let locationController = null;
let locationState = null;
let locationUiReady = false;
let uiCore = null;
let uiShellController = null;
let confirmController = null;
let uiComponents = null;
let dataClient = null;
let domainCore = null;
let domainModel = null;
let viewTemplates = null;
let listViewTemplates = null;
let accountShareTemplates = null;
let formTemplates = null;
let mapViewTemplates = null;
let mapLinkCore = null;
let mapGeometry = null;
let activeFilter = "all";
let selectedRestaurantId = null;
let isSpotCardOpen = false;
let spotCardDragStart = null;
let suppressNextSpotCardOutsideClick = false;
let editingRestaurantId = null;
let shortLinkResolveTimer = null;
let shareToken = getShareToken();
let shareData = null;
let sharePackToken = getSharePackToken();
let sharePackData = null;
let recipeShareToken = getRecipeShareToken();
let recipeShareData = null;
let pendingAddSharePack = false;
let pendingAddRecipeShare = false;
let activeView = getInitialView();
let lists = [];
let discoveryLists = [];
let sharePacks = [];
let recipes = [];
let selectedRecipeId = null;
let editingRecipeId = null;
let selectedListId = null;
let activeMyListKey = "system:all";
let selectedDiscoveryListId = null;
let editingListId = null;
let addSpotsListId = null;
let discoverySort = "popular";
let adminUsers = [];
let adminLoadTimer = null;
let authPasswordMode = "login";
let authCodeCooldownTimer = null;
let authCodeCooldownUntil = 0;
let mapZoom = 1;
let mapInteractionController = null;
let isDetailAddDishOpen = false;
let activeDetailRestaurantId = null;
let detailCloseTimer = null;
let detailClosePointerAt = null;
let restaurantSwipeDismiss = null;
let recipeSwipeDismiss = null;
let listFormBaseline = "";
let recipeFormBaseline = "";

const DISH_AUTOSAVE_DELAY = 700;
const REVIEW_AUTOSAVE_DELAY = 700;
const PENDING_SHARE_PACK_LIST_KEY = "foodieMapPendingSharePackList";
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
  languageMenu: document.querySelector("#languageMenu"),
  languageLabel: document.querySelector("#languageLabel"),
  languageOptions: document.querySelectorAll("[data-language-option]"),
  loginButton: document.querySelector("#loginButton"),
  loginView: document.querySelector("#loginView"),
  loginPageGoogle: document.querySelector("#loginPageGoogle"),
  loginPagePassword: document.querySelector("#loginPagePassword"),
  loginPageCode: document.querySelector("#loginPageCode"),
  loginPageRegister: document.querySelector("#loginPageRegister"),
  authDialog: document.querySelector("#authDialog"),
  authForm: document.querySelector("#authForm"),
  closeAuthDialog: document.querySelector("#closeAuthDialog"),
  googleSignInButton: document.querySelector("#googleSignInButton"),
  authTabs: document.querySelectorAll("[data-auth-panel]"),
  authPanels: document.querySelectorAll("[data-auth-panel-view]"),
  authPasswordModeButtons: document.querySelectorAll("[data-auth-password-mode]"),
  authNameRow: document.querySelector("[data-auth-name-row]"),
  authPasswordRow: document.querySelector("[data-auth-password-row]"),
  authResetCodeRow: document.querySelector("[data-auth-reset-code-row]"),
  authNewPasswordRow: document.querySelector("[data-auth-new-password-row]"),
  authNameInput: document.querySelector("#authNameInput"),
  authEmailInput: document.querySelector("#authEmailInput"),
  authPasswordInput: document.querySelector("#authPasswordInput"),
  authResetCodeInput: document.querySelector("#authResetCodeInput"),
  authNewPasswordInput: document.querySelector("#authNewPasswordInput"),
  sendResetCodeButton: document.querySelector("#sendResetCodeButton"),
  passwordAuthButton: document.querySelector("#passwordAuthButton"),
  authCodeEmailInput: document.querySelector("#authCodeEmailInput"),
  authCodeInput: document.querySelector("#authCodeInput"),
  sendLoginCodeButton: document.querySelector("#sendLoginCodeButton"),
  verifyLoginCodeButton: document.querySelector("#verifyLoginCodeButton"),
  authStatusText: document.querySelector("#authStatusText"),
  openAddPanel: document.querySelector("#openAddPanel"),
  pasteAddButton: document.querySelector("#pasteAddButton"),
  mobileMapMenu: document.querySelector(".mobile-map-menu"),
  mobileActionButtons: document.querySelectorAll("[data-mobile-action]"),
  mobileListDrawer: document.querySelector("#mobileListDrawer"),
  mobileListFilters: document.querySelector("#mobileListFilters"),
  mobileMyListDrawer: document.querySelector("#mobileMyListDrawer"),
  mobileMyListFilters: document.querySelector("#mobileMyListFilters"),
  mobileListChips: document.querySelectorAll("[data-mobile-system-list]"),
  pasteStatus: document.querySelector("#pasteStatus"),
  exportButton: document.querySelector("#exportButton"),
  importButton: document.querySelector("#importButton"),
  importFile: document.querySelector("#importFile"),
  resetButton: document.querySelector("#resetButton"),
  closeAddPanel: document.querySelector("#closeAddPanel"),
  addDialog: document.querySelector("#addDialog"),
  restaurantForm: document.querySelector("#restaurantForm"),
  restaurantModalHead: document.querySelector("#restaurantForm .modal-head"),
  restaurantDragHandle: document.querySelector("#restaurantForm .modal-drag-handle"),
  googleUrlInput: document.querySelector('input[name="googleUrl"]'),
  formModeLabel: document.querySelector("#formModeLabel"),
  formTitle: document.querySelector("#formTitle"),
  cancelSpotButton: document.querySelector("#cancelSpotButton"),
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
  cancelSettings: document.querySelector("#cancelSettings"),
  googleApiKey: document.querySelector("#googleApiKey"),
  integrationList: document.querySelector("#integrationList"),
  cuteMap: document.querySelector("#cuteMap"),
  mapZoomOut: document.querySelector("#mapZoomOut"),
  mapZoomIn: document.querySelector("#mapZoomIn"),
  mapCenterButton: document.querySelector("#mapCenterButton"),
  mapZoomReset: document.querySelector("#mapZoomReset"),
  mapZoomLabel: document.querySelector("#mapZoomLabel"),
  meMarker: document.querySelector("#meMarker"),
  markersLayer: document.querySelector("#markersLayer"),
  emptyMap: document.querySelector("#emptyMap"),
  locationStatus: document.querySelector("#locationStatus"),
  locationPrompt: document.querySelector("#locationPrompt"),
  locationPromptTitle: document.querySelector("#locationPromptTitle"),
  locationPromptBody: document.querySelector("#locationPromptBody"),
  locationPrimaryAction: document.querySelector("#locationPrimaryAction"),
  locationBrowseAction: document.querySelector("#locationBrowseAction"),
  locationHelpDialog: document.querySelector("#locationHelpDialog"),
  locationHelpSteps: document.querySelector("#locationHelpSteps"),
  closeLocationHelp: document.querySelector("#closeLocationHelp"),
  locationHelpBrowse: document.querySelector("#locationHelpBrowse"),
  locationHelpRetry: document.querySelector("#locationHelpRetry"),
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
  mapChoiceDialog: document.querySelector("#mapChoiceDialog"),
  closeMapChoiceDialog: document.querySelector("#closeMapChoiceDialog"),
  mapChoiceName: document.querySelector("#mapChoiceName"),
  openGoogleMapChoice: document.querySelector("#openGoogleMapChoice"),
  openAppleMapChoice: document.querySelector("#openAppleMapChoice"),
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
  sharePackView: document.querySelector("#sharePackView"),
  sharePackPage: document.querySelector("#sharePackPage"),
  sharePackDialog: document.querySelector("#sharePackDialog"),
  sharePackForm: document.querySelector("#sharePackForm"),
  closeSharePackDialog: document.querySelector("#closeSharePackDialog"),
  sharePackHelp: document.querySelector("#sharePackHelp"),
  sharePackPicker: document.querySelector("#sharePackPicker"),
  sharePackResult: document.querySelector("#sharePackResult"),
  sharePackUrlInput: document.querySelector("#sharePackUrlInput"),
  sharePackCardImage: document.querySelector("#sharePackCardImage"),
  sharePackImageLink: document.querySelector("#sharePackImageLink"),
  createSharePackButton: document.querySelector("#createSharePackButton"),
  copySharePackButton: document.querySelector("#copySharePackButton"),
  openSharePackImage: document.querySelector("#openSharePackImage"),
  downloadSharePackImage: document.querySelector("#downloadSharePackImage"),
  recipesView: document.querySelector("#recipesView"),
  recipeList: document.querySelector("#recipeList"),
  recipeDetail: document.querySelector("#recipeDetail"),
  openRecipeDialog: document.querySelector("#openRecipeDialog"),
  recipeDialog: document.querySelector("#recipeDialog"),
  recipeForm: document.querySelector("#recipeForm"),
  recipeFormMode: document.querySelector("#recipeFormMode"),
  recipeFormTitle: document.querySelector("#recipeFormTitle"),
  recipeFormHelp: document.querySelector("#recipeFormHelp"),
  recipeImageInput: document.querySelector("#recipeImageInput"),
  recipeImageName: document.querySelector("#recipeImageName"),
  recipeImagePreview: document.querySelector("#recipeImagePreview"),
  cancelRecipeButton: document.querySelector("#cancelRecipeButton"),
  saveRecipeButton: document.querySelector("#saveRecipeButton"),
  closeRecipeDialog: document.querySelector("#closeRecipeDialog"),
  recipeShareDialog: document.querySelector("#recipeShareDialog"),
  recipeShareForm: document.querySelector("#recipeShareForm"),
  closeRecipeShareDialog: document.querySelector("#closeRecipeShareDialog"),
  recipeShareHelp: document.querySelector("#recipeShareHelp"),
  recipeShareResult: document.querySelector("#recipeShareResult"),
  recipeShareUrlInput: document.querySelector("#recipeShareUrlInput"),
  recipeShareCardImage: document.querySelector("#recipeShareCardImage"),
  recipeShareImageLink: document.querySelector("#recipeShareImageLink"),
  createRecipeShareButton: document.querySelector("#createRecipeShareButton"),
  copyRecipeShareButton: document.querySelector("#copyRecipeShareButton"),
  openRecipeShareImage: document.querySelector("#openRecipeShareImage"),
  downloadRecipeShareImage: document.querySelector("#downloadRecipeShareImage"),
  recipeShareView: document.querySelector("#recipeShareView"),
  recipeSharePage: document.querySelector("#recipeSharePage"),
  navLinks: document.querySelectorAll("[data-view]"),
  viewPanels: document.querySelectorAll("[data-view-panel]"),
  mapView: document.querySelector("#mapView"),
  listsView: document.querySelector("#listsView"),
  discoveryView: document.querySelector("#discoveryView"),
  openSharePackDialog: document.querySelector("#openSharePackDialog"),
  adminLoginView: document.querySelector("#adminLoginView"),
  adminLoginForm: document.querySelector("#adminLoginForm"),
  adminUsernameInput: document.querySelector("#adminUsernameInput"),
  adminPasswordInput: document.querySelector("#adminPasswordInput"),
  adminLoginStatus: document.querySelector("#adminLoginStatus"),
  adminView: document.querySelector("#adminView"),
  createListButton: document.querySelector("#createListButton"),
  sidebarListFilters: document.querySelector("#sidebarListFilters"),
  myListDetail: document.querySelector("#myListDetail"),
  discoveryGrid: document.querySelector("#discoveryGrid"),
  sharePackHistoryPanel: document.querySelector("#sharePackHistoryPanel"),
  sharePackHistoryList: document.querySelector("#sharePackHistoryList"),
  discoveryDetail: document.querySelector("#discoveryDetail"),
  listDialog: document.querySelector("#listDialog"),
  listForm: document.querySelector("#listForm"),
  listFormMode: document.querySelector("#listFormMode"),
  listFormTitle: document.querySelector("#listFormTitle"),
  listFormHelp: document.querySelector("#listFormHelp"),
  cancelListButton: document.querySelector("#cancelListButton"),
  saveListButton: document.querySelector("#saveListButton"),
  closeListDialog: document.querySelector("#closeListDialog"),
  addSpotsDialog: document.querySelector("#addSpotsDialog"),
  closeAddSpotsDialog: document.querySelector("#closeAddSpotsDialog"),
  addSpotsSearch: document.querySelector("#addSpotsSearch"),
  addSpotsList: document.querySelector("#addSpotsList"),
  adminRefreshButton: document.querySelector("#adminRefreshButton"),
  adminSearchInput: document.querySelector("#adminSearchInput"),
  adminStatusFilter: document.querySelector("#adminStatusFilter"),
  adminPlanFilter: document.querySelector("#adminPlanFilter"),
  adminStatusText: document.querySelector("#adminStatusText"),
  adminUserList: document.querySelector("#adminUserList"),
  adminLogoutButton: document.querySelector("#adminLogoutButton"),
};

loadBrowserCore();

async function loadBrowserCore() {
  try {
    const [loadedI18n, loadedLocationCore, loadedUiCore, loadedUiShell, loadedUiDialogs, loadedUiComponents, loadedUiSwipeDismiss, loadedDataClient, loadedDomainCore, loadedViewTemplates, loadedListViewTemplates, loadedAccountShareTemplates, loadedFormTemplates, loadedMapViewTemplates, loadedMapLinkCore, loadedMapGeometry, loadedMapInteractions] = await Promise.all([
      import(I18N_URL),
      import(LOCATION_CORE_URL),
      import(UI_CORE_URL),
      import(UI_SHELL_URL),
      import(UI_DIALOGS_URL),
      import(UI_COMPONENTS_URL),
      import(UI_SWIPE_DISMISS_URL),
      import(DATA_CLIENT_URL),
      import(DOMAIN_CORE_URL),
      import(VIEW_TEMPLATES_URL),
      import(LIST_VIEW_TEMPLATES_URL),
      import(ACCOUNT_SHARE_TEMPLATES_URL),
      import(FORM_TEMPLATES_URL),
      import(MAP_VIEW_TEMPLATES_URL),
      import(MAP_LINK_CORE_URL),
      import(MAP_GEOMETRY_URL),
      import(MAP_INTERACTIONS_URL)
    ]);
    i18nCore = loadedI18n;
    mapLinkCore = loadedMapLinkCore;
    mapGeometry = loadedMapGeometry;
    locationCore = loadedLocationCore;
    uiCore = loadedUiCore;
    locationState = locationCore.createInitialLocationModel();
    uiShellController = loadedUiShell.createUiShell({
      window,
      document,
      onLayoutChange: () => {
        setSpotCardOpenForCurrentViewport();
        render();
      }
    });
    uiShellController.start();
    confirmController = loadedUiDialogs.createConfirmController({ document });
    uiComponents = loadedUiComponents;
    dataClient = loadedDataClient.createDataClient({
      fetch: window.fetch.bind(window),
      messages: {
        loginRequired: () => t("api.loginRequired"),
        requestFailed: () => t("api.requestFailed"),
      },
    });
    domainCore = loadedDomainCore;
    domainModel = loadedDomainCore.createDomainModel({ translate: t });
    viewTemplates = loadedViewTemplates.createViewTemplates({
      translate: t,
      formatDate,
      recipeImageUrl,
      restaurantImageUrl,
      statusLabel,
      accentVariant,
    });
    listViewTemplates = loadedListViewTemplates.createListViewTemplates({
      translate: t,
      emptyState: emptyStateTemplate,
      listCover: coverTemplate,
      restaurantRow: restaurantRowTemplate,
      restaurantsForSystemList,
      sortRestaurants: sortRestaurantsByDistance,
      sortListItems: sortListItemsByDistance,
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
    });
    accountShareTemplates = loadedAccountShareTemplates.createAccountShareTemplates({
      translate: t,
      formatDate,
      recipeImageUrl,
      restaurantThumb: restaurantThumbTemplate,
      emptyState: emptyStateTemplate,
      shortUserName,
      adminPlanLabel,
      adminStatusLabel,
      authMethodLabel,
    });
    formTemplates = loadedFormTemplates.createFormTemplates({
      translate: t,
      statusLabel,
      dishStatusLabel,
      restaurantThumb: restaurantThumbTemplate,
      emptyState: emptyStateTemplate,
    });
    mapViewTemplates = loadedMapViewTemplates.createMapViewTemplates({
      translate: t,
      restaurantThumb: restaurantThumbTemplate,
      restaurantImageUrl,
      statusLabel,
      visibilityLabel,
      shortMapName,
    });
    mapInteractionController = loadedMapInteractions.createMapInteractionController({
      target: elements.cuteMap,
      minZoom: MAP_ZOOM_MIN,
      maxZoom: MAP_ZOOM_MAX,
      zoomStep: MAP_ZOOM_STEP,
      panLimitRatio: MAP_PAN_LIMIT_RATIO,
      onZoomChange: (zoom) => {
        mapZoom = zoom;
        updateMapZoomUi();
        if (locationUiReady) renderMarkers();
      },
    });
    restaurantSwipeDismiss = loadedUiSwipeDismiss.createSwipeDismissController({
      surface: elements.addDialog,
      dragTarget: elements.restaurantForm,
      handles: [elements.restaurantModalHead, elements.restaurantDragHandle],
      isEnabled: isMobileMapViewport,
      onDismiss: () => closeRestaurantDialog(),
    });
    recipeSwipeDismiss = loadedUiSwipeDismiss.createSwipeDismissController({
      surface: elements.recipeDialog,
      dragTarget: elements.recipeForm,
      handles: [document.querySelector("#recipeModalHead"), document.querySelector("#recipeDragHandle")],
      isEnabled: isMobileMapViewport,
      onDismiss: () => closeRecipeDialog(),
    });
    await boot();
  } catch (error) {
    showBootError(error);
  }
}

function showBootError(error) {
  console.error(error);
  const panel = document.createElement("section");
  panel.className = "startup-error";
  panel.setAttribute("role", "alert");
  panel.innerHTML = `
    <p>FOODIEMAP</p>
    <h1>FoodieMap couldn't start.</h1>
    <span>A required browser file did not load. Reload the page to try again.</span>
    <button type="button">Reload</button>
  `;
  panel.querySelector("button").addEventListener("click", () => window.location.reload());
  panel.title = error?.message || "Location module failed to load";
  document.body.appendChild(panel);
}

async function boot() {
  translateStaticDom();
  configureLocationController();
  bindEvents();
  mapInteractionController?.bind();
  restaurantSwipeDismiss?.bind();
  recipeSwipeDismiss?.bind();
  if (isAdminPortal) {
    document.body.classList.add("admin-portal");
    activeView = "admin-login";
    await loadAdminSession();
    setActiveView(currentAdmin ? "admin" : "admin-login", { push: false });
    return;
  }
  await loadMe();
  if (recipeShareToken) {
    activeView = "recipe-share";
    await loadRecipeSharePage(recipeShareToken);
  } else if (sharePackToken) {
    activeView = "share-pack";
    await loadSharePackPage(sharePackToken);
  } else if (shareToken) {
    activeView = "my-map";
    await loadSharePage(shareToken);
  } else if (!currentUser) {
    activeView = "login";
  } else {
    await loadRestaurants();
    await loadLists();
    await loadRecipes();
    await loadDiscoveryLists();
    await loadSharePacks();
  }
  setActiveView(activeView, { push: false });
  checkShortLinkService();
  await locationController.bootstrap();
  locationUiReady = true;
  render();
}

function bindEvents() {
  elements.locateButton.addEventListener("click", handleLocationPrimaryAction);
  elements.mapLocateButton?.addEventListener("click", handleLocationPrimaryAction);
  elements.locationPrimaryAction?.addEventListener("click", handleLocationPrimaryAction);
  elements.locationBrowseAction?.addEventListener("click", chooseLocationBrowseMode);
  elements.closeLocationHelp?.addEventListener("click", closeLocationHelpDialog);
  elements.locationHelpBrowse?.addEventListener("click", chooseLocationBrowseMode);
  elements.locationHelpRetry?.addEventListener("click", retryLocationAfterSettings);
  elements.locationHelpDialog?.addEventListener("close", () => locationController?.closeSettingsHelp());
  elements.locationHelpDialog?.addEventListener("click", (event) => {
    if (event.target === elements.locationHelpDialog) closeLocationHelpDialog();
  });
  elements.loginButton.addEventListener("click", handleLoginButton);
  elements.loginPageGoogle?.addEventListener("click", startGoogleSignIn);
  elements.loginPagePassword?.addEventListener("click", () => openAuthDialog("password", "login"));
  elements.loginPageCode?.addEventListener("click", () => openAuthDialog("code"));
  elements.loginPageRegister?.addEventListener("click", () => openAuthDialog("password", "register"));
  elements.authForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const codePanelOpen = [...elements.authPanels].some((panel) => panel.dataset.authPanelView === "code" && !panel.hidden);
    if (codePanelOpen) {
      verifyLoginCode();
    } else {
      submitPasswordAuth();
    }
  });
  elements.closeAuthDialog?.addEventListener("click", closeAuthDialog);
  elements.googleSignInButton?.addEventListener("click", startGoogleSignIn);
  elements.authTabs.forEach((button) => {
    button.addEventListener("click", () => setAuthPanel(button.dataset.authPanel));
  });
  elements.authPasswordModeButtons.forEach((button) => {
    button.addEventListener("click", () => setAuthPasswordMode(button.dataset.authPasswordMode));
  });
  elements.passwordAuthButton?.addEventListener("click", submitPasswordAuth);
  elements.sendResetCodeButton?.addEventListener("click", requestPasswordResetCode);
  elements.sendLoginCodeButton?.addEventListener("click", requestLoginCode);
  elements.verifyLoginCodeButton?.addEventListener("click", verifyLoginCode);
  elements.openAddPanel.addEventListener("click", openCreateDialog);
  elements.pasteAddButton.addEventListener("click", pasteAndAddFromClipboard);
  elements.mobileActionButtons.forEach((button) => {
    button.addEventListener("click", () => {
      closeMobileMenuDetails(elements.mobileMapMenu);
      if (button.dataset.mobileAction === "new-spot") openCreateDialog();
      if (button.dataset.mobileAction === "paste-add") pasteAndAddFromClipboard();
    });
  });
  elements.mobileListChips.forEach((button) => {
    button.addEventListener("click", () => {
      setActiveCategory(`system:${button.dataset.mobileSystemList}`);
      syncFilterButtons();
      selectFirstVisibleRestaurant();
      render();
    });
  });
  document.addEventListener("pointerdown", closeMobileMenusFromOutside);
  document.addEventListener("pointerdown", closeMobileSpotCardFromOutside, true);
  document.addEventListener("click", suppressMobileSpotCardOutsideClick, true);
  document.addEventListener("keydown", closeMobileOverlaysFromKeyboard);
  elements.spotCard.addEventListener("pointerdown", startMobileSpotCardDrag);
  elements.spotCard.addEventListener("pointerup", finishMobileSpotCardDrag);
  elements.spotCard.addEventListener("pointercancel", cancelMobileSpotCardDrag);
  elements.closeAddPanel.addEventListener("click", () => closeRestaurantDialog());
  elements.cancelSpotButton?.addEventListener("click", () => closeRestaurantDialog());
  elements.closeCard.addEventListener("click", () => {
    setSpotCardOpen(false, { render: true });
  });
  elements.spotCardTab.addEventListener("click", () => {
    setSpotCardOpen(true, { render: true });
  });
  elements.openGoogleMaps?.addEventListener("click", () => openMapChoice(selectedRestaurant()));
  elements.closeMapChoiceDialog?.addEventListener("click", () => elements.mapChoiceDialog?.close());
  elements.mapChoiceDialog?.addEventListener("click", (event) => {
    if (event.target === elements.mapChoiceDialog) elements.mapChoiceDialog.close();
  });
  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-open-map-restaurant]");
    if (!trigger) return;
    const restaurant = findRestaurantById(trigger.dataset.openMapRestaurant);
    if (!restaurant) return;
    event.preventDefault();
    openMapChoice(restaurant);
  });
  elements.openSpotDetail.addEventListener("click", openSpotDetail);
  elements.closeSpotDetail.addEventListener("pointerup", closeSpotDetailFromPointer);
  elements.closeSpotDetail.addEventListener("click", closeSpotDetailFromClick);
  elements.closeSpotDetail.addEventListener("keydown", closeSpotDetailFromKeyboard);
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
  window.addEventListener("focus", resumeLocationController);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") resumeLocationController();
  });
  window.addEventListener("scroll", updateTopbarElevation, { passive: true });
  window.addEventListener("resize", recenterMapPanWithinBounds);
  [elements.sidebar, elements.mapView, elements.listsView, elements.discoveryView, elements.recipesView, elements.adminView].forEach((scrollArea) => {
    scrollArea?.addEventListener("scroll", updateTopbarElevation, { passive: true });
  });
  elements.createListButton.addEventListener("click", openCreateListDialog);
  document.querySelectorAll("[data-mobile-create-list]").forEach((button) => {
    button.addEventListener("click", () => {
      closeMobileMenuDetails(elements.mobileListDrawer);
      closeMobileMenuDetails(elements.mobileMyListDrawer);
      openCreateListDialog();
    });
  });
  elements.closeListDialog.addEventListener("click", () => closeListDialog());
  elements.cancelListButton?.addEventListener("click", () => closeListDialog());
  elements.listForm.addEventListener("submit", saveListFromForm);
  elements.closeAddSpotsDialog.addEventListener("click", () => elements.addSpotsDialog.close());
  elements.addSpotsSearch.addEventListener("input", renderAddSpotsDialog);
  elements.mapZoomOut.addEventListener("click", () => mapInteractionController?.zoomOut());
  elements.mapZoomIn.addEventListener("click", () => mapInteractionController?.zoomIn());
  elements.mapCenterButton?.addEventListener("click", centerMapOnUser);
  elements.mapZoomReset.addEventListener("click", () => mapInteractionController?.resetZoom());
  elements.meMarker?.addEventListener("click", centerMapOnUser);
  document.querySelectorAll("[data-discovery-sort]").forEach((button) => {
    button.addEventListener("click", () => {
      discoverySort = button.dataset.discoverySort;
      document.querySelectorAll("[data-discovery-sort]").forEach((item) => item.classList.toggle("active", item === button));
      renderDiscoveryView();
    });
  });
  elements.openSharePackDialog?.addEventListener("click", openSharePackDialog);
  elements.openRecipeDialog?.addEventListener("click", () => openRecipeDialog());
  elements.closeRecipeDialog?.addEventListener("click", () => closeRecipeDialog());
  elements.cancelRecipeButton?.addEventListener("click", () => closeRecipeDialog());
  elements.recipeDialog?.addEventListener("click", (event) => {
    if (event.target === elements.recipeDialog && !isMobileMapViewport()) closeRecipeDialog();
  });
  elements.recipeForm?.addEventListener("submit", saveRecipeFromForm);
  elements.recipeImageInput?.addEventListener("change", updateRecipeImageName);
  bindDetailFileDropzone(elements.recipeImageInput?.closest("[data-recipe-file-dropzone]"), elements.recipeImageInput, {
    onFileSelected: updateRecipeImageName,
  });
  elements.closeRecipeShareDialog?.addEventListener("click", () => elements.recipeShareDialog?.close());
  elements.recipeShareDialog?.addEventListener("click", (event) => {
    if (event.target === elements.recipeShareDialog) elements.recipeShareDialog.close();
  });
  elements.recipeShareForm?.addEventListener("submit", createRecipeShare);
  elements.copyRecipeShareButton?.addEventListener("click", copyRecipeShareLink);
  elements.googleUrlInput.addEventListener("input", autofillFromMapsUrl);
  elements.googleUrlInput.addEventListener("change", autofillFromMapsUrl);
  elements.googleUrlInput.addEventListener("paste", () => window.setTimeout(autofillFromMapsUrl, 0));
  elements.restaurantForm.addEventListener("submit", saveRestaurantFromForm);
  elements.addDishButton.addEventListener("click", addDishFromEditor);
  elements.closeShareDialog.addEventListener("click", () => elements.shareDialog.close());
  elements.shareForm.addEventListener("submit", createShareLink);
  elements.copyShareButton.addEventListener("click", copyShareLink);
  elements.closeSharePackDialog?.addEventListener("click", () => elements.sharePackDialog.close());
  elements.sharePackForm?.addEventListener("submit", createSharePack);
  elements.copySharePackButton?.addEventListener("click", copySharePackLink);
  elements.exportButton.addEventListener("click", exportRestaurants);
  elements.importButton.addEventListener("click", () => alert(t("import.cloudOnly")));
  elements.resetButton.addEventListener("click", resetDemoData);
  elements.settingsButton.addEventListener("click", openSettingsDialog);
  elements.closeSettings.addEventListener("click", () => elements.settingsDialog.close());
  elements.cancelSettings?.addEventListener("click", () => elements.settingsDialog.close());
  elements.settingsForm.addEventListener("submit", saveSettings);
  elements.adminRefreshButton?.addEventListener("click", () => loadAdminUsers({ force: true }));
  elements.adminLoginForm?.addEventListener("submit", handleAdminLogin);
  elements.adminLogoutButton?.addEventListener("click", handleAdminLogout);
  elements.adminSearchInput?.addEventListener("input", scheduleAdminLoad);
  elements.adminStatusFilter?.addEventListener("change", () => loadAdminUsers({ force: true }));
  elements.adminPlanFilter?.addEventListener("change", () => loadAdminUsers({ force: true }));
  elements.languageOptions.forEach((button) => {
    button.addEventListener("click", () => setLanguage(button.dataset.languageOption));
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

async function openSettingsDialog() {
  elements.googleApiKey.value = getGoogleGeocodingKey();
  elements.settingsDialog.showModal();
  await loadIntegrations();
}

async function loadIntegrations() {
  if (!elements.integrationList) return;
  if (!currentUser) {
    elements.integrationList.innerHTML = `<p class="form-help">${escapeHtml(t("settings.connectedEmpty"))}</p>`;
    return;
  }
  try {
    const data = await api("/api/integrations");
    const integrations = data.integrations || [];
    elements.integrationList.innerHTML = formTemplates.integrationList(integrations);
    elements.integrationList.querySelectorAll("[data-revoke-integration]").forEach((button) => {
      button.addEventListener("click", async () => {
        const integration = integrations.find((item) => item.id === button.dataset.revokeIntegration);
        if (!integration || !(await confirmAction(t("settings.revokeConfirm", { name: integration.client_name }), {
          confirmLabel: t("settings.revoke"),
          tone: "danger",
        }))) return;
        await api(`/api/integrations/${integration.id}`, { method: "DELETE" });
        await loadIntegrations();
      });
    });
  } catch (error) {
    elements.integrationList.innerHTML = `<p class="form-help">${escapeHtml(error.message)}</p>`;
  }
}

function saveSettings(event) {
  event.preventDefault();
  try {
    localStorage.setItem(GOOGLE_GEOCODING_KEY, elements.googleApiKey.value.trim());
  } catch {
    // The app still works without persisted settings.
  }
  elements.formHelp.textContent = t("settings.saved");
  elements.settingsDialog.close();
}

function closeMobileMenuDetails(element) {
  if (!element?.hasAttribute("open")) return false;
  element.removeAttribute("open");
  return true;
}

function closeMobileTransientOverlays() {
  closeMobileMenuDetails(elements.mobileMapMenu);
  closeMobileMenuDetails(elements.mobileListDrawer);
  closeMobileMenuDetails(elements.mobileMyListDrawer);
  closeMobileMenuDetails(elements.languageMenu);
  closeOpenDetailsMenus(".manage-list-menu");
}

function closeMobileMenusFromOutside(event) {
  if (elements.languageMenu?.hasAttribute("open") && !elements.languageMenu.contains(event.target)) {
    closeMobileMenuDetails(elements.languageMenu);
  }
  if (elements.mobileMapMenu?.hasAttribute("open") && !elements.mobileMapMenu.contains(event.target)) {
    closeMobileMenuDetails(elements.mobileMapMenu);
  }
  if (elements.mobileListDrawer?.hasAttribute("open") && !elements.mobileListDrawer.contains(event.target)) {
    closeMobileMenuDetails(elements.mobileListDrawer);
  }
  if (elements.mobileMyListDrawer?.hasAttribute("open") && !elements.mobileMyListDrawer.contains(event.target)) {
    closeMobileMenuDetails(elements.mobileMyListDrawer);
  }
  document.querySelectorAll(".manage-list-menu[open]").forEach((menu) => {
    if (!menu.contains(event.target)) closeMobileMenuDetails(menu);
  });
}

function closeOpenDetailsMenus(selector) {
  document.querySelectorAll(selector).forEach((element) => closeMobileMenuDetails(element));
}

function closeMobileOverlaysFromKeyboard(event) {
  if (event.key !== "Escape") return;
  closeMobileTransientOverlays();
  if (isMobileMapViewport() && isSpotCardOpen) {
    setSpotCardOpen(false, { render: true });
  }
}

function setSpotCardOpen(open, options = {}) {
  isSpotCardOpen = Boolean(open);
  if (options.render) renderSpotCard();
}

function setSpotCardOpenForCurrentViewport() {
  setSpotCardOpen(Boolean(selectedRestaurantId) && !isMobileMapViewport());
}

function closeMobileSpotCardFromOutside(event) {
  if (!isMobileMapViewport() || !isSpotCardOpen || elements.spotCard.hidden) return;
  if (elements.spotCard.contains(event.target) || elements.spotCardTab.contains(event.target)) return;
  suppressNextSpotCardOutsideClick = true;
  setSpotCardOpen(false, { render: true });
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation?.();
}

function suppressMobileSpotCardOutsideClick(event) {
  if (!suppressNextSpotCardOutsideClick) return;
  suppressNextSpotCardOutsideClick = false;
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation?.();
}

function startMobileSpotCardDrag(event) {
  if (!isMobileMapViewport() || !isSpotCardOpen) return;
  spotCardDragStart = { x: event.clientX, y: event.clientY };
}

function finishMobileSpotCardDrag(event) {
  if (!spotCardDragStart) return;
  const deltaY = event.clientY - spotCardDragStart.y;
  const deltaX = Math.abs(event.clientX - spotCardDragStart.x);
  spotCardDragStart = null;
  if (deltaY < 56 || deltaX > 90) return;
  setSpotCardOpen(false, { render: true });
}

function cancelMobileSpotCardDrag() {
  spotCardDragStart = null;
}

function setLanguage(language) {
  const nextLanguage = language === "zh" ? "zh" : "en";
  if (nextLanguage === currentLanguage) {
    elements.languageMenu?.removeAttribute("open");
    return;
  }
  currentLanguage = nextLanguage;
  try {
    localStorage.setItem(LANGUAGE_KEY, currentLanguage);
  } catch {
    // Ignore storage failures; the current page can still switch language.
  }
  translateStaticDom();
  renderShareChrome();
  renderSharePackChrome();
  renderAuth();
  render();
  refreshOpenDialogLanguage();
  if (elements.spotDetailDialog.open) renderSpotDetail(selectedRestaurant());
  if (elements.addSpotsDialog.open) renderAddSpotsDialog();
  elements.languageMenu?.removeAttribute("open");
}

function refreshOpenDialogLanguage() {
  if (elements.addDialog.open) {
    elements.formModeLabel.textContent = editingRestaurantId ? t("spot.editMode") : t("spot.newMode");
    elements.formTitle.textContent = editingRestaurantId ? t("spot.editTitle") : t("spot.saveTitle");
    elements.saveSpotButton.textContent = editingRestaurantId ? t("spot.updateButton") : t("spot.saveButton");
    elements.formHelp.textContent = editingRestaurantId ? t("spot.editHelp") : t("maps.help");
  }
  if (elements.listDialog.open) {
    elements.listFormMode.textContent = editingListId ? t("list.editMode") : t("list.newMode");
    elements.listFormTitle.textContent = editingListId ? t("list.editTitle") : t("list.createTitle");
    elements.saveListButton.textContent = editingListId ? t("button.updateList") : t("button.createList");
    elements.listFormHelp.textContent = editingListId ? t("list.editHelp") : t("list.defaultPrivate");
  }
  if (elements.authDialog.open) {
    setAuthPasswordMode(authPasswordMode);
    updateLoginCodeCooldown();
  }
}

function translateStaticDom() {
  document.documentElement.lang = currentLanguage === "zh" ? "zh-CN" : "en";
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
    node.setAttribute("placeholder", t(node.dataset.i18nPlaceholder));
  });
  document.querySelectorAll("[data-i18n-title]").forEach((node) => {
    node.setAttribute("title", t(node.dataset.i18nTitle));
  });
  document.querySelectorAll("[data-i18n-alt]").forEach((node) => {
    node.setAttribute("alt", t(node.dataset.i18nAlt));
  });
  document.querySelectorAll("[data-i18n-aria-label]").forEach((node) => {
    node.setAttribute("aria-label", t(node.dataset.i18nAriaLabel));
  });
  if (elements.languageLabel) elements.languageLabel.textContent = t("language.short");
  elements.languageOptions?.forEach((button) => {
    const active = button.dataset.languageOption === currentLanguage;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function syncFilterButtons() {
  document.querySelectorAll(".filter-item").forEach((item) => {
    item.classList.toggle("active", activeMyListKey === `system:${item.dataset.filter}`);
  });
}

async function api(path, options = {}) {
  return dataClient.request(path, options);
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

async function loadAdminSession() {
  try {
    const data = await api("/api/admin/me");
    currentAdmin = data.admin;
    if (!data.configured && elements.adminLoginStatus) {
      elements.adminLoginStatus.textContent = t("admin.notConfigured");
    }
  } catch {
    currentAdmin = null;
  }
}

async function handleAdminLogin(event) {
  event.preventDefault();
  const username = elements.adminUsernameInput.value.trim();
  const password = elements.adminPasswordInput.value;
  if (!username || !password) {
    elements.adminLoginStatus.textContent = t("admin.loginMissing");
    return;
  }
  try {
    const data = await api("/auth/admin/login", { method: "POST", body: JSON.stringify({ username, password }) });
    currentAdmin = data.admin;
    elements.adminPasswordInput.value = "";
    await loadAdminUsers({ force: true });
    setActiveView("admin", { push: false });
  } catch (error) {
    elements.adminLoginStatus.textContent = error.message;
  }
}

async function handleAdminLogout() {
  await api("/auth/admin/logout", { method: "POST" });
  currentAdmin = null;
  adminUsers = [];
  setActiveView("admin-login", { push: false });
}

function renderAuth() {
  elements.loginButton.textContent = currentUser ? shortUserName(currentUser) : t("auth.signIn");
  elements.loginButton.title = currentUser ? t("auth.signOutTitle", { email: currentUser.email }) : t("auth.signInTitle");
  elements.loginButton.classList.toggle("is-signed-in", Boolean(currentUser));
  elements.pasteStatus.textContent = sharePackToken
    ? t("paste.shared")
    : shareToken
    ? t("paste.shared")
    : recipeShareToken
    ? t("paste.shared")
    : currentUser
    ? t("paste.help")
    : t("paste.demo");
}

function openAuthDialog(panel = "password", mode = "login") {
  setAuthPanel(panel);
  setAuthPasswordMode(mode);
  elements.authStatusText.textContent = t("auth.help");
  elements.authDialog?.showModal();
}

function closeAuthDialog() {
  elements.authDialog?.close();
}

function startGoogleSignIn() {
  window.location.href = `/auth/google/login?next=${encodeURIComponent(location.pathname + location.search + location.hash)}`;
}

async function handleLoginButton() {
  if (!currentUser) {
    openAuthDialog();
    return;
  }
  if (!(await confirmAction(t("auth.signOutConfirm", { email: currentUser.email }), {
    title: t("confirm.signOutTitle"),
    confirmLabel: t("button.signOut"),
  }))) return;
  await api("/auth/logout", { method: "POST" });
  currentUser = null;
  restaurants = [];
  lists = [];
  sharePacks = [];
  recipes = [];
  selectedListId = null;
  selectedRecipeId = null;
  activeMyListKey = "system:all";
  activeFilter = "all";
  selectedRestaurantId = null;
  renderAuth();
  if (!shareToken && !sharePackToken && !recipeShareToken) {
    setActiveView("login", { push: false });
  } else {
    render();
  }
}

function setAuthPanel(panel) {
  const nextPanel = panel === "code" ? "code" : "password";
  elements.authTabs.forEach((button) => {
    button.classList.toggle("active", button.dataset.authPanel === nextPanel);
  });
  elements.authPanels.forEach((section) => {
    section.hidden = section.dataset.authPanelView !== nextPanel;
  });
  if (elements.authStatusText) elements.authStatusText.textContent = t("auth.help");
}

function setAuthPasswordMode(mode) {
  authPasswordMode = ["register", "reset"].includes(mode) ? mode : "login";
  elements.authPasswordModeButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.authPasswordMode === authPasswordMode);
  });
  elements.authNameRow.hidden = authPasswordMode !== "register";
  elements.authPasswordRow.hidden = authPasswordMode === "reset";
  elements.authResetCodeRow.hidden = authPasswordMode !== "reset";
  elements.authNewPasswordRow.hidden = authPasswordMode !== "reset";
  elements.sendResetCodeButton.hidden = authPasswordMode !== "reset";
  elements.passwordAuthButton.textContent = {
    login: t("auth.loginButton"),
    register: t("auth.registerButton"),
    reset: t("auth.resetButton"),
  }[authPasswordMode];
  elements.authStatusText.textContent = t("auth.help");
}

function authEmailValue(input = elements.authEmailInput) {
  const email = input.value.trim();
  if (!email) throw new Error(t("auth.enterEmail"));
  return email;
}

async function refreshAfterAuth() {
  await loadMe();
  const oauthNext = new URLSearchParams(location.search).get("next");
  if (oauthNext?.startsWith("/oauth/authorize?") && !oauthNext.startsWith("//")) {
    location.assign(oauthNext);
    return;
  }
  if (pendingAddSharePack && sharePackToken) {
    closeAuthDialog();
    await addSharedPackToMyLists();
    return;
  }
  if (pendingAddRecipeShare && recipeShareToken) {
    closeAuthDialog();
    await addSharedRecipeToMyRecipes();
    return;
  }
  await loadRestaurants();
  await loadLists();
  await loadRecipes();
  await loadDiscoveryLists();
  await loadSharePacks();
  closeAuthDialog();
  if (activeView === "login") {
    setActiveView("my-map", { push: false });
  } else {
    render();
  }
}

async function submitPasswordAuth() {
  try {
    const email = authEmailValue();
    if (authPasswordMode === "login") {
      const password = elements.authPasswordInput.value;
      if (!password) throw new Error(t("auth.enterPassword"));
      await api("/auth/email/login", { method: "POST", body: JSON.stringify({ email, password }) });
    } else if (authPasswordMode === "register") {
      const password = elements.authPasswordInput.value;
      if (!password) throw new Error(t("auth.enterPassword"));
      await api("/auth/email/register", {
        method: "POST",
        body: JSON.stringify({ email, password, name: elements.authNameInput.value.trim() }),
      });
    } else {
      const code = elements.authResetCodeInput.value.trim();
      const password = elements.authNewPasswordInput.value;
      if (!code) throw new Error(t("auth.enterCode"));
      if (!password) throw new Error(t("auth.enterPassword"));
      await api("/auth/email/password-reset/confirm", {
        method: "POST",
        body: JSON.stringify({ email, code, password }),
      });
    }
    elements.authStatusText.textContent = t("auth.signedIn");
    await refreshAfterAuth();
  } catch (error) {
    elements.authStatusText.textContent = error.message;
  }
}

async function requestPasswordResetCode() {
  try {
    const email = authEmailValue();
    await api("/auth/email/password-reset/request", {
      method: "POST",
      body: JSON.stringify({ email, lang: currentLanguage }),
    });
    elements.authStatusText.textContent = t("auth.passwordResetSent");
  } catch (error) {
    elements.authStatusText.textContent = error.message;
  }
}

function startLoginCodeCooldown() {
  authCodeCooldownUntil = Date.now() + 60_000;
  clearInterval(authCodeCooldownTimer);
  authCodeCooldownTimer = window.setInterval(updateLoginCodeCooldown, 250);
  updateLoginCodeCooldown();
}

function updateLoginCodeCooldown() {
  const remaining = Math.max(0, Math.ceil((authCodeCooldownUntil - Date.now()) / 1000));
  if (remaining <= 0) {
    clearInterval(authCodeCooldownTimer);
    elements.sendLoginCodeButton.disabled = false;
    elements.sendLoginCodeButton.textContent = t("auth.sendCode");
    return;
  }
  elements.sendLoginCodeButton.disabled = true;
  elements.sendLoginCodeButton.textContent = t("auth.sendCodeWait", { seconds: remaining });
}

async function requestLoginCode() {
  try {
    const email = authEmailValue(elements.authCodeEmailInput);
    await api("/auth/email/code/request", {
      method: "POST",
      body: JSON.stringify({ email, lang: currentLanguage }),
    });
    elements.authStatusText.textContent = t("auth.codeSent");
    startLoginCodeCooldown();
  } catch (error) {
    elements.authStatusText.textContent = error.message;
  }
}

async function verifyLoginCode() {
  try {
    const email = authEmailValue(elements.authCodeEmailInput);
    const code = elements.authCodeInput.value.trim();
    if (!code) throw new Error(t("auth.enterCode"));
    await api("/auth/email/code/verify", { method: "POST", body: JSON.stringify({ email, code }) });
    elements.authStatusText.textContent = t("auth.signedIn");
    await refreshAfterAuth();
  } catch (error) {
    elements.authStatusText.textContent = error.message;
  }
}

async function loadRestaurants() {
  if (!currentUser) {
    restaurants = demoRestaurants.map(cloneRestaurant);
  } else {
    const data = await api("/api/restaurants");
    restaurants = data.restaurants.map(normalizeRestaurant);
  }
  syncCurrentUserRestaurantCount();
  selectedRestaurantId = restaurants[0]?.id ?? null;
  setSpotCardOpenForCurrentViewport();
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
  const pendingListId = takePendingSharePackListId();
  if (pendingListId && lists.some((list) => list.id === pendingListId)) {
    selectedListId = pendingListId;
    activeMyListKey = `custom:${pendingListId}`;
    saveListFilterOrder([pendingListId, ...orderedLists().filter((item) => item.id !== pendingListId).map((item) => item.id)]);
  }
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

async function loadSharePacks() {
  if (!currentUser) {
    sharePacks = [];
    return;
  }
  const data = await api("/api/share-packs");
  sharePacks = (data.share_packs || []).map(normalizeSharePackSummary);
}

async function loadRecipes() {
  if (!currentUser) {
    recipes = [];
    selectedRecipeId = null;
    return;
  }
  const data = await api("/api/recipes");
  recipes = (data.recipes || []).map(normalizeRecipe);
  selectedRecipeId = selectedRecipeId && recipes.some((recipe) => recipe.id === selectedRecipeId) ? selectedRecipeId : recipes[0]?.id ?? null;
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
  setSpotCardOpen(true);
  renderShareChrome();
  elements.openAddPanel.onclick = addSharedRestaurant;
  elements.pasteAddButton.hidden = true;
  elements.shareSpot.disabled = true;
  elements.editSpot.disabled = true;
  elements.deleteSpot.disabled = true;
  elements.pasteStatus.textContent = t("paste.shared");
  render();
}

function renderShareChrome() {
  if (!shareToken) return;
  document.querySelector(".brand span:last-child").textContent = t("app.sharedBrand");
  elements.openAddPanel.textContent = t("button.addToMyList");
  elements.pasteStatus.textContent = t("paste.shared");
}

function confirmAction(message, {
  title = t("confirm.actionTitle"),
  confirmLabel = t("button.continue"),
  tone = "default",
} = {}) {
  if (!confirmController) return Promise.resolve(false);
  return confirmController.ask({
    title,
    message,
    confirmLabel,
    cancelLabel: t("button.cancel"),
    tone,
  });
}

function formSnapshot(form) {
  if (!form) return "";
  return JSON.stringify([...form.elements]
    .filter((field) => field.name && !["submit", "button"].includes(field.type))
    .map((field) => {
      if (field.type === "file") return [field.name, [...(field.files || [])].map((file) => `${file.name}:${file.size}`)];
      if (["checkbox", "radio"].includes(field.type)) return [field.name, field.checked, field.value];
      return [field.name, field.value];
    }));
}

function requireLogin() {
  if (currentUser) return true;
  openAuthDialog();
  return false;
}

async function addSharedRestaurant() {
  if (!shareToken || !requireLogin()) return;
  const data = await api(`/api/share/${shareToken}/add`, { method: "POST" });
  window.location.href = "/";
  return data;
}

function openCreateDialog() {
  if (sharePackToken) {
    addSharedPackToMyLists();
    return;
  }
  if (shareToken) {
    addSharedRestaurant();
    return;
  }
  if (!requireLogin()) return;
  if (!canAddOneRestaurant()) return;
  resetRestaurantForm();
  elements.dishEditor.hidden = true;
  elements.addDialog.showModal();
}

function openEditDialog() {
  if (!requireLogin()) return;
  const selected = selectedRestaurant();
  if (!selected) return;

  editingRestaurantId = selected.id;
  elements.formModeLabel.textContent = t("spot.editMode");
  elements.formTitle.textContent = t("spot.editTitle");
  elements.saveSpotButton.textContent = t("spot.updateButton");
  elements.formHelp.textContent = t("spot.editHelp");
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

async function closeRestaurantDialog({ force = false } = {}) {
  if (!force && hasUnsavedRestaurantForm()) {
    const discard = await confirmAction(t("confirm.discardMessage"), {
      title: t("confirm.discardTitle"),
      confirmLabel: t("button.discard"),
      tone: "danger",
    });
    if (!discard) return false;
  }
  restaurantSwipeDismiss?.reset();
  elements.addDialog.close();
  resetRestaurantForm();
  return true;
}

function resetRestaurantForm() {
  editingRestaurantId = null;
  elements.restaurantForm.reset();
  elements.formModeLabel.textContent = t("spot.newMode");
  elements.formTitle.textContent = t("spot.saveTitle");
  elements.saveSpotButton.textContent = t("spot.saveButton");
  elements.formHelp.textContent = t("maps.help");
  elements.dishEditor.hidden = true;
  elements.dishEditorList.innerHTML = "";
}

function hasUnsavedRestaurantForm() {
  const payload = getRestaurantPayload();
  if (editingRestaurantId) return hasEditedRestaurantFormChanges(payload);
  return Boolean(
    payload.name ||
      payload.address ||
      payload.google_url ||
      payload.lat ||
      payload.lng ||
      payload.notes ||
      payload.visit_count > 0 ||
      payload.status !== "visited" ||
      payload.personal_rating !== 4.5,
  );
}

function hasEditedRestaurantFormChanges(payload) {
  const original = selectedRestaurant();
  if (!original) return true;
  return (
    payload.name !== String(original.name || "") ||
    payload.address !== String(original.address || "") ||
    payload.google_url !== String(original.google_url || "") ||
    payload.lat !== String(original.lat ?? "") ||
    payload.lng !== String(original.lng ?? "") ||
    payload.status !== String(original.status || "want_to_go") ||
    payload.visit_count !== Number(original.visit_count || 0) ||
    payload.personal_rating !== Number(original.personal_rating || 0) ||
    payload.notes !== String(original.notes || "")
  );
}

async function saveRestaurantFromForm(event) {
  event.preventDefault();
  if (!requireLogin()) return;
  const payload = getRestaurantPayload();
  try {
    elements.formHelp.textContent = t("list.saving");
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
    setSpotCardOpen(true);
    closeRestaurantDialog({ force: true });
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
    elements.formHelp.textContent = t("spot.dishNameRequired");
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
    elements.dishEditorList.innerHTML = `<p class="form-help">${escapeHtml(t("spot.noDishes"))}</p>`;
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
  return formTemplates.dishEditor(dish);
}

async function handleDishAction(button) {
  const item = button.closest(".dish-editor-item");
  const dishId = item.dataset.dishId;
  if (button.dataset.dishAction === "delete") {
    if (!(await confirmAction(t("spot.deleteDishConfirm"), {
      title: t("confirm.deleteTitle"),
      confirmLabel: t("button.delete"),
      tone: "danger",
    }))) return;
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
    ? dishes.map(formTemplates.shareDishOption).join("")
    : `<p class="form-help">${escapeHtml(t("share.noDishes"))}</p>`;
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
  elements.copyShareButton.textContent = t("button.copied");
  window.setTimeout(() => (elements.copyShareButton.textContent = t("button.copy")), 1200);
}

function openSharePackDialog() {
  if (!requireLogin()) return;
  if (!restaurants.length) {
    alert(t("sharePack.noSpots"));
    return;
  }
  elements.sharePackForm.reset();
  elements.sharePackResult.hidden = true;
  elements.sharePackUrlInput.value = "";
  elements.sharePackCardImage.removeAttribute("src");
  elements.sharePackImageLink.href = "#";
  elements.openSharePackImage.href = "#";
  elements.downloadSharePackImage.href = "#";
  elements.openSharePackImage.hidden = true;
  elements.downloadSharePackImage.hidden = true;
  elements.sharePackHelp.textContent = `${t("sharePack.help")} ${t("sharePack.privacyNotice")}`;
  elements.sharePackPicker.innerHTML = restaurants.map(sharePackRestaurantOptionTemplate).join("");
  elements.sharePackDialog.showModal();
}

function sharePackRestaurantOptionTemplate(restaurant) {
  return formTemplates.sharePackRestaurantOption(restaurant);
}

function sharePackPayloadFromForm() {
  const form = new FormData(elements.sharePackForm);
  const items = [...elements.sharePackPicker.querySelectorAll("[data-share-pack-restaurant]")].flatMap((card) => {
    const restaurantCheck = card.querySelector("[data-share-pack-restaurant-check]");
    if (!restaurantCheck.checked) return [];
    return [
      {
        restaurant_id: restaurantCheck.value,
        dish_ids: [...card.querySelectorAll("[data-share-pack-dish]:checked")].map((input) => input.value),
        note: "",
      },
    ];
  });
  if (!items.length) throw new Error(t("sharePack.chooseOne"));
  return {
    title: String(form.get("title") || "").trim(),
    description: String(form.get("description") || "").trim(),
    items,
  };
}

async function createSharePack(event) {
  event.preventDefault();
  try {
    const payload = sharePackPayloadFromForm();
    const data = await api("/api/share-packs", { method: "POST", body: JSON.stringify(payload) });
    elements.sharePackUrlInput.value = data.share_url;
    elements.sharePackCardImage.src = data.card_url;
    elements.sharePackImageLink.href = data.card_url;
    elements.openSharePackImage.href = data.card_url;
    elements.downloadSharePackImage.href = data.card_url;
    elements.openSharePackImage.hidden = false;
    elements.downloadSharePackImage.hidden = false;
    elements.downloadSharePackImage.setAttribute("download", `${slugifyText(payload.title || "share-pack")}.png`);
    elements.sharePackResult.hidden = false;
    elements.sharePackHelp.textContent = t("sharePack.generated");
    await loadSharePacks();
    renderDiscoveryView();
  } catch (error) {
    elements.sharePackHelp.textContent = /method not allowed/i.test(error.message)
      ? t("sharePack.routeMissing")
      : error.message;
  }
}

async function copySharePackLink() {
  if (!elements.sharePackUrlInput.value) return;
  await navigator.clipboard.writeText(elements.sharePackUrlInput.value);
  elements.copySharePackButton.textContent = t("button.copied");
  window.setTimeout(() => (elements.copySharePackButton.textContent = t("button.copy")), 1200);
}

async function loadSharePackPage(token) {
  const data = await api(`/api/share-packs/${token}`);
  sharePackData = normalizeSharePack(data.share_pack);
  renderSharePackChrome();
  render();
}

function renderSharePackChrome() {
  if (!sharePackToken) return;
  document.querySelector(".brand span:last-child").textContent = t("app.sharedBrand");
  elements.pasteAddButton.hidden = true;
  elements.openAddPanel.textContent = t("button.addSharedPack");
  elements.openAddPanel.onclick = addSharedPackToMyLists;
}

async function addSharedPackToMyLists() {
  if (!sharePackToken) return;
  if (!currentUser) {
    pendingAddSharePack = true;
    openAuthDialog();
    return;
  }
  const data = await api(`/api/share-packs/${sharePackToken}/add`, { method: "POST" });
  pendingAddSharePack = false;
  rememberPendingSharePackListId(data.list?.id);
  window.location.href = `/#my-lists`;
  return data;
}

async function loadRecipeSharePage(token) {
  const data = await api(`/api/recipe-shares/${token}`);
  recipeShareData = normalizeRecipeShare(data.recipe_share);
  renderRecipeShareChrome();
  render();
}

function renderRecipeShareChrome() {
  if (!recipeShareToken) return;
  document.querySelector(".brand span:last-child").textContent = t("recipes.previewEyebrow");
  elements.pasteAddButton.hidden = true;
  elements.openAddPanel.textContent = t("recipes.saveShared");
  elements.openAddPanel.onclick = addSharedRecipeToMyRecipes;
}

async function addSharedRecipeToMyRecipes() {
  if (!recipeShareToken) return;
  if (!currentUser) {
    pendingAddRecipeShare = true;
    openAuthDialog();
    return;
  }
  const data = await api(`/api/recipe-shares/${recipeShareToken}/add`, { method: "POST" });
  pendingAddRecipeShare = false;
  const recipe = normalizeRecipe(data.recipe);
  upsertRecipe(recipe);
  selectedRecipeId = recipe.id;
  window.location.href = "/#recipes";
  return data;
}

async function deleteSelectedRestaurant() {
  if (!requireLogin()) return;
  const selected = selectedRestaurant();
  if (!selected) return;
  await deleteRestaurantById(selected.id);
}

async function deleteRestaurantById(restaurantId) {
  if (!requireLogin()) return;
  const restaurant = restaurants.find((item) => item.id === restaurantId);
  if (!restaurant) return;
  if (!(await confirmAction(t("spot.deleteConfirm", { name: restaurant.name }), {
    title: t("confirm.deleteTitle"),
    confirmLabel: t("button.delete"),
    tone: "danger",
  }))) return;
  await api(`/api/restaurants/${restaurant.id}`, { method: "DELETE" });
  restaurants = restaurants.filter((item) => item.id !== restaurant.id);
  syncCurrentUserRestaurantCount();
  lists = lists.map((list) => ({
    ...list,
    item_count: Math.max(0, Number(list.item_count || 0) - (list.items?.some((item) => item.restaurant_id === restaurant.id) ? 1 : 0)),
    items: Array.isArray(list.items) ? list.items.filter((item) => item.restaurant_id !== restaurant.id) : list.items,
  }));
  if (selectedRestaurantId === restaurant.id) {
    selectedRestaurantId = null;
    selectFirstVisibleRestaurant();
  }
  setSpotCardOpen(Boolean(selectedRestaurantId));
  closeSpotDetail();
  render();
}

function openSpotDetail() {
  const selected = selectedRestaurant();
  if (!selected) return;
  renderSpotDetail(selected);
  clearTimeout(detailCloseTimer);
  detailClosePointerAt = null;
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

function closeSpotDetailFromPointer(event) {
  if (event.button !== 0) return;
  event.preventDefault();
  event.stopPropagation();
  detailClosePointerAt = performance.now();
  closeSpotDetail();
}

function closeSpotDetailFromClick(event) {
  if (detailClosePointerAt !== null && performance.now() - detailClosePointerAt < 600) {
    event.preventDefault();
    event.stopPropagation();
    return;
  }
  closeSpotDetail();
}

function closeSpotDetailFromKeyboard(event) {
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  event.stopPropagation();
  detailClosePointerAt = null;
  closeSpotDetail();
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
  elements.detailStatus.textContent = currentUser ? t("detail.autosave") : t("detail.demo");
  renderDetailAddDishState();
  renderDetailDishList(restaurant);
  isRenderingSpotDetail = false;
}

function renderDetailHeader(restaurant = selectedRestaurant()) {
  if (!restaurant) return;
  elements.detailSpotName.textContent = restaurant.name;
  const distance = distanceLabel(restaurant);
  elements.detailSpotMeta.innerHTML = mapViewTemplates.detailMeta(restaurant, distance);
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
    elements.detailStatus.textContent = t("detail.signInAutosave");
    return;
  }
  clearReviewAutosaveTimer();
  elements.detailStatus.textContent = t("detail.autosavingReview");
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
    elements.detailStatus.textContent = t("detail.autosavingReview");
    const data = await api(`/api/restaurants/${restaurant.id}`, { method: "PATCH", body: JSON.stringify(body) });
    upsertRestaurant(data.restaurant);
    elements.detailStatus.textContent = t("detail.reviewSaved");
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
    elements.detailStatus.textContent = t("detail.dishRequired");
    return;
  }
  try {
    elements.detailStatus.textContent = t("detail.addingMenu");
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
    elements.detailStatus.textContent = t("detail.addedMenu");
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
  elements.detailDishImageName.textContent = file ? file.name : t("detail.uploadHint");
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
  elements.detailAddDishToggle.textContent = isDetailAddDishOpen ? t("button.closeAddMenu") : t("button.addMenu");
  elements.detailAddDishPanel.hidden = !isDetailAddDishOpen;
}

function cancelDetailDishAdd() {
  clearDetailDishInputs();
  setDetailAddDishOpen(false);
  elements.detailStatus.textContent = t("detail.cancelledDish");
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
    : emptyStateTemplate(t("detail.noMenu"), "");
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
  return formTemplates.detailDish(dish, editingDetailDishIds.has(String(dish.id)));
}

function detailDishPreviewTemplate(dish) {
  return formTemplates.detailDishPreview(dish);
}

function detailDishEditTemplate(dish) {
  return formTemplates.detailDishEdit(dish);
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
    if (!(await confirmAction(t("detail.deleteDishConfirm"), {
      title: t("confirm.deleteTitle"),
      confirmLabel: t("button.delete"),
      tone: "danger",
    }))) return;
    clearDishAutosaveTimer(dishId);
    await api(`/api/dishes/${dishId}`, { method: "DELETE" });
    editingDetailDishIds.delete(String(dishId));
    removeDish(dishId);
    elements.detailStatus.textContent = t("detail.deletedDish");
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
    elements.detailStatus.textContent = t("detail.dishRequired");
    return;
  }
  elements.detailStatus.textContent = t("detail.savingMenu");
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
    elements.detailStatus.textContent = t("detail.dishRequired");
    throw new Error(t("detail.dishRequired"));
  }
  try {
    elements.detailStatus.textContent = t("detail.savingMenu");
    const data = await api(`/api/dishes/${dishId}`, { method: "PATCH", body: JSON.stringify(body) });
    replaceDish(data.dish, { rerender });
    elements.detailStatus.textContent = t("detail.menuSaved");
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
    elements.detailStatus.textContent = t("detail.uploading");
    const compressed = await compressImage(file);
    const form = new FormData();
    form.append("image", compressed, compressed.name);
    const data = await api(`/api/dishes/${item.dataset.dishId}/image`, { method: "POST", body: form });
    replaceDish(data.dish);
    elements.detailStatus.textContent = t("detail.uploaded");
  } catch (error) {
    elements.detailStatus.textContent = error.message;
  }
}

async function pasteAndAddFromClipboard() {
  if (!requireLogin()) return;
  if (!canAddOneRestaurant()) return;
  try {
    const text = (await navigator.clipboard.readText()).trim();
    const mapUrl = sanitizeMapUrl(extractMapUrl(text));
    if (!mapUrl) throw new Error(t("paste.noMapUrl"));
    const parsed = await parseAnyMapLink(mapUrl);
    const name = parsed.name || "New Spot";
    const duplicate = findDuplicateRestaurant({
      name,
      google_url: parsed.url || mapUrl,
      lat: parsed.lat,
      lng: parsed.lng,
    });
    let confirmedCreate = false;
    if (duplicate) {
      selectedRestaurantId = duplicate.id;
      setSpotCardOpen(true);
      render();
      const duplicateDistance = formatDistance(haversineDistance(duplicate, { lat: parsed.lat, lng: parsed.lng }));
      confirmedCreate = await confirmAction(
        t("paste.duplicateConfirm", { name: duplicate.name, address: duplicate.address || t("paste.noAddress"), distance: duplicateDistance }),
      );
      if (!confirmedCreate) {
        setPasteStatus(t("paste.cancelledDuplicate", { name: duplicate.name }));
        return;
      }
    }
    if (!confirmedCreate && !(await confirmAction(t("paste.addConfirm", { name })))) return;
    const body = {
      name,
      address: parsed.address || "",
      lat: parsed.lat,
      lng: parsed.lng,
      google_url: parsed.url || mapUrl,
      status: "want_to_go",
      visit_count: 0,
      personal_rating: 0,
      notes: "",
    };
    const data = await api("/api/restaurants", { method: "POST", body: JSON.stringify(body) });
    upsertRestaurant(data.restaurant);
    selectedRestaurantId = data.restaurant.id;
    setSpotCardOpen(true);
    setPasteStatus(t("paste.added", { name: data.restaurant.name }));
    render();
  } catch (error) {
    setPasteStatus(error.message);
  }
}

function setPasteStatus(message) {
  elements.pasteStatus.textContent = message;
}

async function autofillFromMapsUrl() {
  const form = elements.restaurantForm.elements;
  const mapUrl = sanitizeMapUrl(elements.googleUrlInput.value);
  if (mapUrl && mapUrl !== elements.googleUrlInput.value.trim()) {
    elements.googleUrlInput.value = mapUrl;
  }
  if (isResolvableMapLink(mapUrl)) {
    elements.formHelp.textContent = t("maps.shortExpanding");
    window.clearTimeout(shortLinkResolveTimer);
    shortLinkResolveTimer = window.setTimeout(async () => {
      try {
        const parsed = await parseAnyMapLink(mapUrl);
        form.googleUrl.value = parsed.url || mapUrl;
        fillMapFields(form, parsed);
        form.lat.value = parsed.lat ?? form.lat.value;
        form.lng.value = parsed.lng ?? form.lng.value;
        elements.formHelp.textContent = parsed.address ? t("maps.shortExpanded") : t("maps.addressLookupFailed");
      } catch (error) {
        elements.formHelp.textContent = error.message;
      }
    }, 450);
    return;
  }

  let parsed = parseMapUrl(mapUrl);
  if (!parsed) {
    elements.formHelp.textContent = t("maps.help");
    return;
  }
  parsed = await enrichMapPlace(parsed, { reportStatus: true });
  fillMapFields(form, parsed);
  if (parsed.lat != null && parsed.lng != null) {
    form.lat.value = parsed.lat;
    form.lng.value = parsed.lng;
    elements.formHelp.textContent = parsed.address ? t("maps.coordsFound") : t("maps.addressLookupFailed");
  } else {
    elements.formHelp.textContent = t("maps.noCoords");
  }
}

function fillMapFields(form, parsed) {
  if (parsed.name && !form.name.value.trim()) form.name.value = parsed.name;
  if (parsed.address && !form.address.value.trim()) form.address.value = parsed.address;
}

async function parseAnyMapLink(url) {
  url = sanitizeMapUrl(url);
  let resolvedPlace = null;
  if (isResolvableMapLink(url)) {
    const endpoint = new URL("/api/resolve-map-link", window.location.origin);
    endpoint.searchParams.set("url", url);
    const data = await api(endpoint.toString());
    url = data.url;
    resolvedPlace = normalizeResolvedMapPlace(data.place);
  }
  const parsed = parseMapUrl(url);
  const place = { ...(resolvedPlace || {}), ...(parsed || {}) };
  if (place?.lat == null || place?.lng == null) {
    throw new Error(t("maps.noCoords"));
  }
  return { ...(await enrichMapPlace(place)), url };
}

function normalizeResolvedMapPlace(place) {
  if (!place || typeof place !== "object") return null;
  const coordinates = validateCoordinates(place.lat, place.lng);
  const normalized = { ...(coordinates || {}) };
  const name = String(place.name || "").trim();
  const address = String(place.address || "").trim();
  if (name) normalized.name = name;
  if (address) normalized.address = address;
  return Object.keys(normalized).length ? normalized : null;
}

async function enrichMapPlace(parsed, { reportStatus = false } = {}) {
  if (parsed.address || parsed.lat == null || parsed.lng == null) return parsed;
  if (reportStatus) elements.formHelp.textContent = t("maps.addressLookup");
  const address = await reverseGeocodeAddress(parsed.lat, parsed.lng);
  if (!address) {
    if (reportStatus) elements.formHelp.textContent = t("maps.addressLookupFailed");
    return parsed;
  }
  return { ...parsed, address };
}

async function reverseGeocodeAddress(lat, lng) {
  const body = { lat, lng };
  const key = getGoogleGeocodingKey();
  if (key) body.key = key;
  try {
    const data = await api("/api/reverse-geocode", { method: "POST", body: JSON.stringify(body) });
    return String(data.address || "").trim();
  } catch {
    return "";
  }
}

function getGoogleGeocodingKey() {
  try {
    return localStorage.getItem(GOOGLE_GEOCODING_KEY)?.trim() || "";
  } catch {
    return "";
  }
}

async function checkShortLinkService() {
  try {
    await api("/api/health");
  } catch {
    setPasteStatus(t("paste.backendOffline"));
  }
}

async function resolveCoordinates(payload) {
  const manual = validateCoordinates(payload.lat, payload.lng);
  if (manual) return manual;
  const parsed = await parseAnyMapLink(payload.google_url);
  return { lat: parsed.lat, lng: parsed.lng };
}

function validateCoordinates(lat, lng) {
  return mapLinkCore.validateCoordinates(lat, lng);
}

function parseMapUrl(url) {
  return mapLinkCore.parseMapUrl(url);
}

function normalizeResolvedMapPlace(place) {
  return mapLinkCore.normalizeResolvedMapPlace(place);
}

function isGoogleMapsUrl(url) {
  return mapLinkCore.isGoogleMapsUrl(url);
}

function isAppleMapsUrl(url) {
  return mapLinkCore.isAppleMapsUrl(url);
}

function isResolvableMapLink(url) {
  return mapLinkCore.isResolvableMapLink(url);
}

function extractMapUrl(text) {
  return mapLinkCore.extractMapUrl(text);
}

function sanitizeMapUrl(value) {
  return mapLinkCore.sanitizeMapUrl(value);
}

function configureLocationController() {
  const gateway = {
    isSupported: () => Boolean(navigator.geolocation),
    async queryPermission() {
      if (!navigator.permissions?.query) return "unknown";
      try {
        return (await navigator.permissions.query({ name: "geolocation" })).state;
      } catch {
        return "unknown";
      }
    },
    getCurrentPosition(options) {
      return new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, options));
    },
    observePermissionChange(callback) {
      if (!navigator.permissions?.query) return null;
      let permissionStatus = null;
      let disposed = false;
      const listener = () => callback(permissionStatus.state);
      navigator.permissions.query({ name: "geolocation" }).then((status) => {
        if (disposed) return;
        permissionStatus = status;
        permissionStatus.addEventListener?.("change", listener);
      }).catch(() => {});
      return () => {
        disposed = true;
        permissionStatus?.removeEventListener?.("change", listener);
      };
    },
  };
  const preferenceStore = {
    get() {
      const value = localStorage.getItem(LOCATION_PREFERENCE_KEY);
      return ["browse", "nearby"].includes(value) ? value : null;
    },
    set(mode) {
      localStorage.setItem(LOCATION_PREFERENCE_KEY, mode);
    },
  };
  locationController = locationCore.createLocationController({
    gateway,
    preferenceStore,
    clock: Date,
    onChange: handleLocationStateChange,
  });
}

function handleLocationStateChange(state) {
  locationState = state;
  currentLocation = state.phase === "ready" ? state.position : null;
  if (state.phase === "ready" && elements.locationHelpDialog?.open) elements.locationHelpDialog.close();
  if (locationUiReady) render();
}

function handleLocationPrimaryAction() {
  if (!locationController) return;
  if (locationState?.phase === "denied") {
    openLocationHelpDialog();
    return;
  }
  locationController.requestNearby();
}

function chooseLocationBrowseMode() {
  locationController?.chooseBrowse();
  if (elements.locationHelpDialog?.open) elements.locationHelpDialog.close();
}

function openLocationHelpDialog() {
  if (!elements.locationHelpDialog) return;
  renderLocationHelpSteps();
  locationController?.openSettingsHelp();
  if (!elements.locationHelpDialog.open) elements.locationHelpDialog.showModal();
}

function closeLocationHelpDialog() {
  if (elements.locationHelpDialog?.open) elements.locationHelpDialog.close();
  else locationController?.closeSettingsHelp();
}

async function retryLocationAfterSettings() {
  if (elements.locationHelpDialog?.open) elements.locationHelpDialog.close();
  await locationController?.retryAfterSettings();
}

function resumeLocationController() {
  if (!locationUiReady || activeView === "login" || activeView.startsWith("admin")) return;
  locationController?.resume();
}

function renderLocationHelpSteps() {
  if (!elements.locationHelpSteps) return;
  const userAgent = navigator.userAgent || "";
  const isIos = /iPad|iPhone|iPod/i.test(userAgent);
  const isSafari = isIos && /Safari/i.test(userAgent) && !/CriOS|FxiOS|EdgiOS/i.test(userAgent);
  const isChrome = /Chrome|CriOS/i.test(userAgent);
  const prefix = isSafari ? "location.safariStep" : isChrome ? "location.chromeStep" : "location.genericStep";
  elements.locationHelpSteps.innerHTML = [1, 2, 3].map((index) => `<li>${escapeHtml(t(`${prefix}${index}`))}</li>`).join("");
}

function isLocationReady() {
  return locationState?.phase === "ready" && Boolean(currentLocation);
}

function locationAccuracy() {
  return isLocationReady() ? Number(currentLocation.accuracy || 0) : 0;
}

function renderLocationUi() {
  if (!locationState || !elements.locationPrompt) return;
  if (!locationUiReady) {
    elements.locationPrompt.hidden = true;
    return;
  }
  const ready = isLocationReady();
  const accuracyClass = ready ? locationCore.classifyLocationAccuracy(locationAccuracy()) : "unknown";
  const promptConfig = locationPromptConfig(locationState);

  elements.locationPrompt.hidden = !promptConfig;
  if (promptConfig) {
    elements.locationPromptTitle.textContent = t(promptConfig.title);
    elements.locationPromptBody.textContent = t(promptConfig.body);
    elements.locationPrimaryAction.textContent = t(promptConfig.action);
    elements.locationPrimaryAction.disabled = locationState.phase === "locating" || locationState.phase === "unsupported";
    elements.locationBrowseAction.textContent = t(locationState.preference ? "location.browseWithout" : "location.notNow");
  }

  const statusKey = ready
    ? accuracyClass === "precise" ? "location.current" : "location.approximate"
    : {
        locating: "location.fetching",
        denied: "location.denied",
        unavailable: "location.unavailable",
        timeout: "location.timeout",
        unsupported: "location.unsupported",
      }[locationState.phase] || (locationState.preference === "browse" ? "location.browseWithout" : "location.waiting");
  const buttonLabel = locationState.phase === "denied"
    ? t("location.permissionAction")
    : locationState.phase === "locating"
      ? t("location.fetching")
      : ready ? t("location.current") : t("location.useMine");
  elements.locationStatus.textContent = t(statusKey);
  elements.locateButton.title = buttonLabel;
  elements.locateButton.setAttribute("aria-label", buttonLabel);
  elements.locateButton.disabled = locationState.phase === "locating" || locationState.phase === "unsupported";
  elements.locateButton.classList.toggle("location-active", ready);
  elements.locateButton.classList.toggle("location-warning", ready && accuracyClass === "low");
  if (elements.mapLocateButton) {
    elements.mapLocateButton.disabled = elements.locateButton.disabled;
    elements.mapLocateButton.title = buttonLabel;
  }

  elements.cuteMap.classList.toggle("location-ready", ready);
  elements.cuteMap.classList.toggle("location-browse", !ready);
  elements.meMarker.hidden = !ready;
  elements.cuteMap.querySelectorAll(".range-ring").forEach((ring) => {
    ring.hidden = !ready;
  });
  elements.mapCenterButton.disabled = !ready;
}

function locationPromptConfig(state) {
  if (state.phase === "ready" || state.preference === "browse") return null;
  if (state.phase === "locating") {
    return { title: "location.locatingTitle", body: "location.locatingBody", action: "location.useMine" };
  }
  if (state.phase === "denied") {
    return { title: "location.permissionTitle", body: "location.permissionBody", action: "location.permissionAction" };
  }
  if (state.phase === "unavailable") {
    return { title: "location.unavailableTitle", body: "location.unavailable", action: "location.tryAgain" };
  }
  if (state.phase === "timeout") {
    return { title: "location.timeoutTitle", body: "location.timeout", action: "location.tryAgain" };
  }
  if (state.phase === "unsupported") {
    return { title: "location.unsupportedTitle", body: "location.unsupported", action: "location.useMine" };
  }
  return { title: "location.inviteTitle", body: "location.inviteBody", action: "location.useMine" };
}

function render() {
  renderViewShell();
  renderLocationUi();
  renderMapContext();
  renderCounts();
  syncQuotaUi();
  syncFilterButtons();
  renderSidebarListFilters();
  renderMobileListFilters();
  renderMobileMyListFilters();
  renderRecentList();
  renderMarkers();
  renderSpotCard();
  renderListsView();
  renderRecipesView();
  renderDiscoveryView();
  renderSharePackView();
  renderRecipeShareView();
  renderAdminView();
  updateTopbarElevation();
}

function getInitialView() {
  if (isAdminPortal) return "admin-login";
  if (recipeShareToken) return "recipe-share";
  if (sharePackToken) return "share-pack";
  const hash = window.location.hash.replace("#", "");
  return ["login", "my-map", "my-lists", "recipes", "discovery"].includes(hash) ? hash : "my-map";
}

function setActiveView(view, options = {}) {
  const allowedViews = isAdminPortal ? ["admin-login", "admin"] : ["login", "my-map", "my-lists", "recipes", "discovery", "share-pack", "recipe-share"];
  if (!allowedViews.includes(view)) view = isAdminPortal ? "admin-login" : "my-map";
  if (isAdminPortal && view === "admin" && !currentAdmin) view = "admin-login";
  if (!isAdminPortal && !currentUser && !shareToken && !sharePackToken && !recipeShareToken) view = "login";
  activeView = recipeShareToken ? "recipe-share" : sharePackToken ? "share-pack" : shareToken ? "my-map" : view;
  if (!isAdminPortal && !sharePackToken && !recipeShareToken && activeView !== "login" && options.push !== false && window.location.hash !== `#${activeView}`) {
    window.location.hash = activeView;
  }
  if (activeView === "my-lists" && currentUser && !lists.length) {
    loadLists().then(render).catch((error) => alert(error.message));
  }
  if (activeView === "discovery" && !discoveryLists.length) {
    loadDiscoveryLists().then(render).catch((error) => alert(error.message));
  }
  if (activeView === "recipes" && currentUser && !recipes.length) {
    loadRecipes().then(render).catch((error) => alert(error.message));
  }
  if (activeView === "admin") {
    loadAdminUsers().catch((error) => {
      elements.adminStatusText.textContent = error.message;
    });
  }
  if (["my-map", "my-lists"].includes(activeView)) selectFirstVisibleRestaurant();
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
  uiShellController?.setActiveView(activeView);
  elements.viewPanels.forEach((panel) => {
    panel.hidden = panel.dataset.viewPanel !== activeView;
  });
  elements.navLinks.forEach((link) => link.classList.toggle("active", link.dataset.view === activeView));
  elements.searchInput.placeholder = {
    "my-map": t("search.category"),
    "my-lists": t("search.category"),
    recipes: t("search.recipes"),
    discovery: t("search.discovery"),
    "share-pack": t("search.discovery"),
    "recipe-share": t("search.recipes"),
    login: t("auth.signIn"),
    admin: t("admin.searchPlaceholder"),
    "admin-login": t("admin.usernamePlaceholder"),
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
      eyebrow: t("list.smart"),
      title: systemListTitle(systemDefinition),
      description: systemListDescription(systemDefinition),
      count: restaurantsForSystemList(systemDefinition).length,
    };
  }

  const list = activeCustomList();
  if (list) {
    return {
      eyebrow: list.visibility === "public" ? t("list.publicCustom") : t("list.custom"),
      title: list.title,
      description: list.description || t("list.customDescription"),
      count: list.item_count || list.items?.length || 0,
    };
  }

  return {
    eyebrow: t("list.custom"),
    title: t("list.choose"),
    description: t("list.chooseDescription"),
    count: 0,
  };
}

function renderMapContext() {
  if (!elements.mapCategoryTitle) return;
  const meta = activeCategoryMeta();
  elements.mapCategoryEyebrow.textContent = `${t("map.view")} · ${meta.eyebrow}`;
  elements.mapCategoryTitle.textContent = meta.title;
  const accuracyClass = isLocationReady() ? locationCore.classifyLocationAccuracy(locationAccuracy()) : "unknown";
  const summaryKey = !isLocationReady() ? "map.summaryBrowse" : accuracyClass === "precise" ? "map.summary" : "map.summaryApproximate";
  elements.mapCategorySummary.textContent = t(summaryKey, { count: meta.count });
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
    setSpotCardOpen(false);
    return;
  }
  if (!visible.some((restaurant) => restaurant.id === selectedRestaurantId)) {
    selectedRestaurantId = visible[0].id;
    setSpotCardOpenForCurrentViewport();
  }
}

function isMobileMapViewport() {
  return uiShellController?.getModel().layout === "mobile" || document.body.dataset.layout === "mobile";
}

function getVisibleRestaurants() {
  const term = activeView === "my-map" ? elements.searchInput.value : "";
  return uiCore
    ? uiCore.filterBySearch(restaurantsForActiveCategory(), term, restaurantSearchText)
    : restaurantsForActiveCategory().filter((restaurant) => !term || restaurantSearchText(restaurant).includes(term.trim().toLowerCase()));
}

function renderCounts() {
  elements.placeCount.textContent = t("count.places", { count: restaurants.length });
  elements.countAll.textContent = restaurants.length;
  elements.countVisited.textContent = restaurants.filter((item) => item.status === "visited").length;
  elements.countWant.textContent = restaurants.filter((item) => item.status === "want_to_go").length;
  elements.countFavorite.textContent = restaurants.filter((item) => item.status === "favorite").length;
}

function renderSidebarListFilters() {
  if (!elements.sidebarListFilters) return;
  if (!currentUser) {
    elements.sidebarListFilters.innerHTML = `<p class="sidebar-empty">${escapeHtml(t("sidebar.signInLists"))}</p>`;
    return;
  }
  const ordered = orderedLists();
  elements.sidebarListFilters.innerHTML = ordered.length
    ? ordered.map((list) => mapViewTemplates.listFilter(list, {
        active: activeMyListKey === `custom:${list.id}`,
        variant: "sidebar",
      })).join("")
    : `<p class="sidebar-empty">${escapeHtml(t("sidebar.noLists"))}</p>`;
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

function renderMobileListFilters() {
  if (!elements.mobileListFilters) return;
  if (!currentUser) {
    elements.mobileListFilters.innerHTML = `<p class="sidebar-empty">${escapeHtml(t("sidebar.signInLists"))}</p>`;
    return;
  }
  const ordered = orderedLists();
  elements.mobileListFilters.innerHTML = ordered.length
    ? ordered.map((list) => mapViewTemplates.listFilter(list, {
        active: activeMyListKey === `custom:${list.id}`,
        variant: "mobileMap",
      })).join("")
    : `<p class="sidebar-empty">${escapeHtml(t("sidebar.noLists"))}</p>`;
  elements.mobileListFilters.querySelectorAll("[data-mobile-list-id]").forEach((button) => {
    button.addEventListener("click", async () => {
      setActiveCategory(`custom:${button.dataset.mobileListId}`);
      closeMobileMenuDetails(elements.mobileListDrawer);
      syncFilterButtons();
      await ensureListDetail(selectedListId);
      selectFirstVisibleRestaurant();
      render();
    });
  });
}

function renderMobileMyListFilters() {
  elements.mobileListChips?.forEach((button) => {
    button.classList.toggle("active", activeMyListKey === `system:${button.dataset.mobileSystemList}`);
  });
  elements.mobileMyListDrawer?.classList.toggle("active", activeMyListKey.startsWith("custom:"));
  if (!elements.mobileMyListFilters) return;
  if (!currentUser) {
    elements.mobileMyListFilters.innerHTML = `<p class="sidebar-empty">${escapeHtml(t("sidebar.signInLists"))}</p>`;
    return;
  }
  const ordered = orderedLists();
  elements.mobileMyListFilters.innerHTML = ordered.length
    ? ordered.map((list) => mapViewTemplates.listFilter(list, {
        active: activeMyListKey === `custom:${list.id}`,
        variant: "mobileLists",
      })).join("")
    : `<p class="sidebar-empty">${escapeHtml(t("sidebar.noLists"))}</p>`;
  elements.mobileMyListFilters.querySelectorAll("[data-mobile-my-list-id]").forEach((button) => {
    button.addEventListener("click", async () => {
      setActiveCategory(`custom:${button.dataset.mobileMyListId}`);
      closeMobileMenuDetails(elements.mobileMyListDrawer);
      syncFilterButtons();
      await ensureListDetail(selectedListId);
      selectFirstVisibleRestaurant();
      render();
    });
  });
}

function renderRecentList() {
  const recent = sortRestaurantsByDistance(getVisibleRestaurants()).slice(0, 5);
  elements.recentList.innerHTML = recent.length
    ? recent.map((restaurant) => mapViewTemplates.recentRestaurant(restaurant, restaurantMetaLabel(restaurant))).join("")
    : `<p class="empty-recent">${escapeHtml(t("map.noMatches"))}</p>`;
  elements.recentList.querySelectorAll(".recent-item").forEach((item) => {
    item.addEventListener("click", () => {
      selectedRestaurantId = item.dataset.id;
      setSpotCardOpen(true);
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
  const ready = isLocationReady();
  const bounds = elements.cuteMap?.getBoundingClientRect();
  const layout = ready
    ? layoutMapMarkers(visible)
    : new Map(locationCore.layoutBrowseMarkers(visible, { width: bounds?.width, height: bounds?.height }).map((point) => [point.id, point]));
  visible.forEach((restaurant) => {
    const distance = ready ? haversineDistance(currentLocation, restaurant) : null;
    const point = layout.get(restaurant.id) ?? { x: 50, y: 50 };
    const marker = document.createElement("button");
    marker.className = `restaurant-marker ${restaurant.status}${restaurant.id === selectedRestaurantId ? " selected" : ""}`;
    marker.style.left = `${point.x}%`;
    marker.style.top = `${point.y}%`;
    if (restaurant.id === selectedRestaurantId) marker.style.zIndex = "9";
    marker.innerHTML = mapViewTemplates.marker(
      restaurant,
      ready ? formatUserDistance(distance) : statusLabel(restaurant.status),
    );
    marker.title = ready ? `${restaurant.name} - ${formatUserDistance(distance)}` : `${restaurant.name} - ${statusLabel(restaurant.status)}`;
    marker.addEventListener("click", () => {
      selectedRestaurantId = restaurant.id;
      setSpotCardOpen(true);
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
  const distance = isLocationReady() ? haversineDistance(currentLocation, selected) : null;
  elements.spotName.textContent = selected.name;
  elements.spotDistance.hidden = distance == null;
  elements.spotDistance.textContent = distance == null ? "" : formatUserDistance(distance);
  elements.spotRating.textContent = `☆ ${Number(selected.personal_rating || 0).toFixed(1)}`;
  elements.spotStatus.textContent = `${statusLabel(selected.status)} · ${t("count.visits", { count: selected.visit_count || 0 })}`;
  elements.spotNotes.textContent = selected.notes || selected.address || t("map.noNotes");
  elements.spotDishes.innerHTML = renderSpotDishes(selected);
  const ownedMode = Boolean(currentUser && !shareToken);
  elements.openSpotDetail.disabled = false;
  elements.editSpot.disabled = !ownedMode;
  elements.shareSpot.disabled = !ownedMode;
  elements.deleteSpot.disabled = !ownedMode;
}

function findRestaurantById(id) {
  const restaurantId = String(id || "");
  const pools = [
    restaurants,
    lists.flatMap((list) => (list.items || []).map((item) => item.restaurant).filter(Boolean)),
    discoveryLists.flatMap((list) => (list.items || []).map((item) => item.restaurant).filter(Boolean)),
    sharePackData?.items?.map((item) => item.restaurant).filter(Boolean) || [],
  ];
  return pools.flat().find((restaurant) => restaurant?.id === restaurantId) || null;
}

function openMapChoice(restaurant) {
  if (!restaurant) return;
  const urls = mapChoiceUrls(restaurant);
  elements.mapChoiceName.textContent = restaurant.address ? `${restaurant.name} · ${restaurant.address}` : restaurant.name;
  elements.openGoogleMapChoice.href = urls.google;
  elements.openAppleMapChoice.href = urls.apple;
  elements.mapChoiceDialog?.showModal();
}

function mapChoiceUrls(restaurant) {
  const coordinates = validateCoordinates(restaurant.lat, restaurant.lng);
  const label = restaurant.name || restaurant.address || t("spot.untitled");
  const coordinateText = coordinates ? `${coordinates.lat},${coordinates.lng}` : "";
  const searchText = [restaurant.name, restaurant.address].filter(Boolean).join(" ") || coordinateText || label;
  const savedMapUrl = sanitizeMapUrl(restaurant.google_url || "");
  const appleParams = new URLSearchParams();
  const googleParams = new URLSearchParams();
  googleParams.set("api", "1");
  googleParams.set("query", searchText);
  if (coordinates) {
    appleParams.set("ll", `${coordinates.lat},${coordinates.lng}`);
  }
  appleParams.set("q", coordinates ? label : searchText);
  return {
    google: isGoogleMapsUrl(savedMapUrl) ? savedMapUrl : `https://www.google.com/maps/search/?${googleParams.toString()}`,
    apple: isAppleMapsUrl(savedMapUrl) ? savedMapUrl : `https://maps.apple.com/?${appleParams.toString()}`,
  };
}

function renderSpotDishes(restaurant) {
  return mapViewTemplates.spotDishes(restaurant);
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
    elements.myListDetail.innerHTML = emptyStateTemplate(t("list.needSignIn"), t("auth.signIn"));
    elements.myListDetail.querySelector("[data-empty-action]")?.addEventListener("click", requireLogin);
    return;
  }
  const selected = lists.find((list) => `custom:${list.id}` === activeMyListKey) ?? lists.find((list) => list.id === selectedListId) ?? lists[0];
  if (selected && !selected.items) {
    ensureListDetail(selected.id).then(render).catch((error) => (elements.myListDetail.innerHTML = errorPanel(error.message)));
    elements.myListDetail.innerHTML = loadingPanel(t("discovery.loading").replace("public ", ""));
    return;
  }
  elements.myListDetail.innerHTML = selected ? myListDetailTemplate(selected, term) : emptyStateTemplate(t("list.createThenAdd"), "");
  bindMyListDetailActions(selected);
}

function renderDiscoveryView() {
  if (!elements.discoveryGrid) return;
  const term = activeView === "discovery" ? elements.searchInput.value.trim().toLowerCase() : "";
  const sorted = domainCore.sortDiscoveryLists(discoveryLists, discoverySort);
  const visible = sorted.filter((list) => listSearchText(list).includes(term));
  elements.discoveryGrid.innerHTML = visible.length
    ? visible.map((list) => listCardTemplate(list, list.id === selectedDiscoveryListId, "public")).join("")
    : discoveryEmptyStateTemplate(term).grid;
  elements.discoveryGrid.querySelectorAll("[data-list-id]").forEach((card) => {
    card.addEventListener("click", async () => {
      selectedDiscoveryListId = card.dataset.listId;
      await ensureDiscoveryDetail(selectedDiscoveryListId);
      render();
    });
  });
  bindDiscoveryEmptyAction(term);
  const selected = visible.find((list) => list.id === selectedDiscoveryListId) ?? visible[0] ?? (term ? null : discoveryLists[0]);
  if (selected && !selected.items) {
    ensureDiscoveryDetail(selected.id).then(render).catch((error) => (elements.discoveryDetail.innerHTML = errorPanel(error.message)));
    elements.discoveryDetail.innerHTML = loadingPanel(t("discovery.loading"));
    return;
  }
  elements.discoveryDetail.classList.toggle("is-empty", !selected);
  elements.discoveryDetail.innerHTML = selected ? discoveryDetailTemplate(selected) : discoveryEmptyStateTemplate(term).detail;
  elements.discoveryDetail.querySelector("[data-copy-public]")?.addEventListener("click", copyPublicList);
  renderSharePackHistory();
}

function renderSharePackHistory() {
  if (!elements.sharePackHistoryPanel || !elements.sharePackHistoryList) return;
  elements.sharePackHistoryPanel.hidden = !currentUser;
  if (!currentUser) return;
  elements.sharePackHistoryList.innerHTML = sharePacks.length
    ? sharePacks.map(sharePackHistoryTemplate).join("")
    : emptyStateTemplate(t("sharePack.noHistory"), "");
  elements.sharePackHistoryList.querySelectorAll("[data-copy-share-pack]").forEach((button) => {
    button.addEventListener("click", async () => {
      await navigator.clipboard.writeText(button.dataset.copySharePack || "");
      button.textContent = t("button.copied");
      window.setTimeout(() => (button.textContent = t("button.copy")), 1200);
    });
  });
  elements.sharePackHistoryList.querySelectorAll("[data-share-pack-card-image]").forEach((image) => {
    image.addEventListener("error", () => {
      image.hidden = true;
      image.closest(".share-pack-history-poster")?.classList.add("is-missing");
    }, { once: true });
  });
  elements.sharePackHistoryList.querySelectorAll("[data-revoke-share-pack]").forEach((button) => {
    button.addEventListener("click", () => revokeSharePack(button.dataset.revokeSharePack));
  });
}

function renderRecipesView() {
  if (!elements.recipeList || !elements.recipeDetail) return;
  const term = elements.searchInput.value;
  const visible = uiCore
    ? uiCore.filterBySearch(recipes, term, recipeSearchText)
    : recipes.filter((recipe) => recipeSearchText(recipe).includes(term.trim().toLowerCase()));
  elements.recipeList.innerHTML = visible.length
    ? visible.map(recipeRowTemplate).join("")
    : emptyInfoTemplate(t("recipes.emptyTitle"), t("recipes.emptyBody"));
  elements.recipeList.querySelectorAll("[data-recipe-id]").forEach((card) => {
    card.addEventListener("click", () => {
      selectedRecipeId = card.dataset.recipeId;
      renderRecipesView();
    });
  });
  const selected = domainCore.selectVisibleItem(recipes, visible, selectedRecipeId);
  selectedRecipeId = selected?.id ?? null;
  elements.recipesView?.classList.toggle("has-selection", Boolean(selected));
  elements.recipeDetail.hidden = !selected;
  elements.recipeDetail.innerHTML = selected ? recipeDetailTemplate(selected) : "";
  elements.recipeDetail.querySelector("[data-edit-recipe]")?.addEventListener("click", () => openRecipeDialog(selected));
  elements.recipeDetail.querySelector("[data-share-recipe]")?.addEventListener("click", () => openRecipeShareDialog(selected));
  elements.recipeDetail.querySelector("[data-delete-recipe]")?.addEventListener("click", () => deleteRecipe(selected));
}

function recipeRowTemplate(recipe) {
  return viewTemplates.recipeRow(recipe, selectedRecipeId);
}

function recipeDetailTemplate(recipe) {
  return viewTemplates.recipeDetail(recipe);
}

function openRecipeDialog(recipe = null) {
  if (!requireLogin()) return;
  editingRecipeId = recipe?.id ?? null;
  elements.recipeForm.reset();
  elements.recipeForm.elements.id.value = recipe?.id ?? "";
  elements.recipeForm.elements.title.value = recipe?.title ?? "";
  elements.recipeForm.elements.rating.value = recipe ? Number(recipe.rating || 0).toFixed(1) : "4.5";
  elements.recipeForm.elements.cookedAt.value = recipe?.cooked_at ? dateInputValue(recipe.cooked_at) : dateInputValue(Math.floor(Date.now() / 1000));
  elements.recipeForm.elements.ingredients.value = recipe?.ingredients ?? "";
  elements.recipeForm.elements.steps.value = recipe?.steps ?? "";
  elements.recipeForm.elements.notes.value = recipe?.notes ?? "";
  elements.recipeFormMode.textContent = recipe ? t("recipes.editMode") : t("recipes.newMode");
  elements.recipeFormTitle.textContent = recipe ? t("recipes.editTitle") : t("recipes.formTitle");
  elements.saveRecipeButton.textContent = recipe ? t("recipes.update") : t("recipes.save");
  elements.recipeFormHelp.textContent = t("recipes.formHelp");
  updateRecipeImageName(recipe);
  recipeFormBaseline = formSnapshot(elements.recipeForm);
  elements.recipeDialog.showModal();
}

async function closeRecipeDialog({ force = false } = {}) {
  const hasNewImage = Boolean(elements.recipeImageInput?.files?.length);
  if (!force && (formSnapshot(elements.recipeForm) !== recipeFormBaseline || hasNewImage)) {
    const discard = await confirmAction(t("confirm.discardMessage"), {
      title: t("confirm.discardTitle"),
      confirmLabel: t("button.discard"),
      tone: "danger",
    });
    if (!discard) return false;
  }
  editingRecipeId = null;
  recipeFormBaseline = "";
  recipeSwipeDismiss?.reset();
  elements.recipeDialog?.close();
  return true;
}

async function saveRecipeFromForm(event) {
  event.preventDefault();
  try {
    const form = new FormData(elements.recipeForm);
    const body = {
      title: String(form.get("title") || "").trim(),
      rating: Number(form.get("rating") || 0),
      cooked_at: timestampFromDateInput(String(form.get("cookedAt") || "")),
      ingredients: String(form.get("ingredients") || "").trim(),
      steps: String(form.get("steps") || "").trim(),
      notes: String(form.get("notes") || "").trim(),
    };
    const data = editingRecipeId
      ? await api(`/api/recipes/${editingRecipeId}`, { method: "PATCH", body: JSON.stringify(body) })
      : await api("/api/recipes", { method: "POST", body: JSON.stringify(body) });
    let recipe = normalizeRecipe(data.recipe);
    if (elements.recipeImageInput.files?.[0]) {
      recipe = await uploadRecipeImage(recipe.id, elements.recipeImageInput.files[0]);
    }
    upsertRecipe(recipe);
    selectedRecipeId = recipe.id;
    elements.recipeFormHelp.textContent = t("recipes.saved");
    await closeRecipeDialog({ force: true });
    render();
  } catch (error) {
    elements.recipeFormHelp.textContent = error.message;
  }
}

async function uploadRecipeImage(recipeId, file) {
  const imageFile = await compressImageFile(file);
  const form = new FormData();
  form.append("image", imageFile);
  const data = await api(`/api/recipes/${recipeId}/image`, { method: "POST", body: form });
  return normalizeRecipe(data.recipe);
}

function updateRecipeImageName(recipe = null) {
  if (!elements.recipeImageName) return;
  const file = elements.recipeImageInput?.files?.[0];
  const existingRecipe = recipe ?? (editingRecipeId ? recipes.find((item) => item.id === editingRecipeId) : null);
  const previewUrl = file ? URL.createObjectURL(file) : existingRecipe?.image_url || "";
  elements.recipeImageName.textContent = file ? file.name : existingRecipe?.image_url ? t("recipes.currentPhoto") : t("detail.uploadHint");
  const zone = elements.recipeImageInput?.closest("[data-recipe-file-dropzone]");
  zone?.classList.toggle("has-file", Boolean(file));
  zone?.classList.toggle("has-preview", Boolean(previewUrl));
  if (!elements.recipeImagePreview) return;
  elements.recipeImagePreview.innerHTML = previewUrl ? `<img src="${escapeAttribute(previewUrl)}" alt="" />` : "";
}

async function deleteRecipe(recipe) {
  if (!recipe || !(await confirmAction(t("recipes.deleteConfirm", { title: recipe.title }), {
    title: t("confirm.deleteTitle"),
    confirmLabel: t("button.delete"),
    tone: "danger",
  }))) return;
  await api(`/api/recipes/${recipe.id}`, { method: "DELETE" });
  recipes = recipes.filter((item) => item.id !== recipe.id);
  selectedRecipeId = recipes[0]?.id ?? null;
  render();
}

function openRecipeShareDialog(recipe) {
  if (!requireLogin() || !recipe) return;
  selectedRecipeId = recipe.id;
  elements.recipeShareResult.hidden = true;
  elements.recipeShareUrlInput.value = "";
  elements.recipeShareCardImage.removeAttribute("src");
  elements.openRecipeShareImage.hidden = true;
  elements.downloadRecipeShareImage.hidden = true;
  elements.recipeShareHelp.textContent = t("recipes.shareHelp");
  elements.recipeShareDialog.showModal();
}

async function createRecipeShare(event) {
  event.preventDefault();
  const recipe = recipes.find((item) => item.id === selectedRecipeId);
  if (!recipe) return;
  const data = await api(`/api/recipes/${recipe.id}/share`, { method: "POST" });
  elements.recipeShareUrlInput.value = data.share_url;
  elements.recipeShareCardImage.src = `${data.card_url}?v=${Date.now()}`;
  elements.recipeShareImageLink.href = data.card_url;
  elements.openRecipeShareImage.href = data.card_url;
  elements.downloadRecipeShareImage.href = data.card_url;
  elements.downloadRecipeShareImage.setAttribute("download", `${slugifyText(recipe.title || "recipe")}.png`);
  elements.openRecipeShareImage.hidden = false;
  elements.downloadRecipeShareImage.hidden = false;
  elements.recipeShareResult.hidden = false;
  elements.recipeShareHelp.textContent = t("recipes.generated");
}

async function copyRecipeShareLink() {
  if (!elements.recipeShareUrlInput.value) return;
  await navigator.clipboard.writeText(elements.recipeShareUrlInput.value);
  elements.copyRecipeShareButton.textContent = t("button.copied");
  window.setTimeout(() => (elements.copyRecipeShareButton.textContent = t("button.copy")), 1200);
}

function sharePackHistoryTemplate(pack) {
  return accountShareTemplates.sharePackHistory(pack);
}

async function revokeSharePack(token) {
  const pack = sharePacks.find((item) => item.token === token);
  if (!pack || !(await confirmAction(t("sharePack.revokeConfirm", { title: pack.title }), {
    confirmLabel: t("sharePack.revokeAction"),
    tone: "danger",
  }))) return;
  await api(`/api/share-packs/${token}`, { method: "DELETE" });
  sharePacks = sharePacks.filter((item) => item.token !== token);
  renderSharePackHistory();
}

function scheduleAdminLoad() {
  clearTimeout(adminLoadTimer);
  adminLoadTimer = window.setTimeout(() => {
    loadAdminUsers({ force: true }).catch((error) => {
      elements.adminStatusText.textContent = error.message;
    });
  }, 250);
}

async function loadAdminUsers({ force = false } = {}) {
  if (!currentAdmin) return;
  if (!force && adminUsers.length) {
    renderAdminView();
    return;
  }
  elements.adminStatusText.textContent = t("admin.loading");
  const params = new URLSearchParams();
  const query = elements.adminSearchInput?.value.trim() || "";
  const status = elements.adminStatusFilter?.value || "all";
  const plan = elements.adminPlanFilter?.value || "all";
  if (query) params.set("query", query);
  if (status !== "all") params.set("status", status);
  if (plan !== "all") params.set("plan", plan);
  const data = await api(`/api/admin/users${params.toString() ? `?${params}` : ""}`);
  adminUsers = data.users || [];
  renderAdminView();
}

function renderAdminView() {
  if (!elements.adminUserList) return;
  if (!currentAdmin) {
    elements.adminUserList.innerHTML = emptyStateTemplate(t("admin.noAccess"), "");
    if (elements.adminStatusText) elements.adminStatusText.textContent = "";
    return;
  }
  elements.adminStatusText.textContent = adminUsers.length ? t("admin.loaded", { count: adminUsers.length }) : "";
  elements.adminUserList.innerHTML = adminUsers.length
    ? adminUsers.map(adminUserRowTemplate).join("")
    : emptyStateTemplate(t("admin.noUsers"), "");
  elements.adminUserList.querySelectorAll("[data-admin-action]").forEach((button) => {
    button.addEventListener("click", () => handleAdminUserAction(button));
  });
}

function adminUserRowTemplate(user) {
  return accountShareTemplates.adminUserRow(user);
}

function authMethodLabel(methods) {
  const labels = {
    google: t("admin.methodGoogle"),
    password: t("admin.methodPassword"),
    email_code: t("admin.methodEmailCode"),
  };
  return methods.map((method) => labels[method] || method).join(", ") || t("admin.methodEmailCode");
}

async function handleAdminUserAction(button) {
  const user = adminUsers.find((item) => item.id === button.dataset.userId);
  if (!user) return;
  const action = button.dataset.adminAction;
  if (action === "plan") {
    const nextPlan = button.dataset.nextPlan === "paid" ? "paid" : "free";
    if (!(await confirmAction(t("admin.confirmPlan", { email: user.email, plan: adminPlanLabel(nextPlan) })))) return;
    await updateAdminUser(user.id, { plan: nextPlan });
    return;
  }
  if (action === "suspend") {
    if (!(await confirmAction(t("admin.confirmSuspend", { email: user.email }), { tone: "danger" }))) return;
    await updateAdminUser(user.id, { account_status: "suspended" });
    return;
  }
  if (action === "reactivate") {
    if (!(await confirmAction(t("admin.confirmReactivate", { email: user.email })))) return;
    await updateAdminUser(user.id, { account_status: "active" });
    return;
  }
  if (action === "delete") {
    if (!(await confirmAction(t("admin.confirmDelete", { email: user.email }), {
      title: t("confirm.deleteTitle"),
      confirmLabel: t("button.delete"),
      tone: "danger",
    }))) return;
    const data = await api(`/api/admin/users/${user.id}`, { method: "DELETE" });
    replaceAdminUser(data.user);
    return;
  }
  if (action === "restore") {
    if (!(await confirmAction(t("admin.confirmRestore", { email: user.email })))) return;
    const data = await api(`/api/admin/users/${user.id}/restore`, { method: "POST" });
    replaceAdminUser(data.user);
  }
}

async function updateAdminUser(userId, body) {
  const data = await api(`/api/admin/users/${userId}`, { method: "PATCH", body: JSON.stringify(body) });
  replaceAdminUser(data.user);
}

function replaceAdminUser(user) {
  adminUsers = adminUsers.map((item) => (item.id === user.id ? user : item));
  if (!adminUsers.some((item) => item.id === user.id)) adminUsers = [user, ...adminUsers];
  renderAdminView();
  syncQuotaUi();
  renderAuth();
}

function adminStatusLabel(status) {
  return {
    active: t("admin.statusActive"),
    suspended: t("admin.statusSuspended"),
    deleted: t("admin.statusDeleted"),
  }[status] || status;
}

function adminPlanLabel(plan) {
  return plan === "paid" ? t("admin.planPaid") : t("admin.planFree");
}

function discoveryEmptyStateTemplate(term = "") {
  if (discoveryLists.length && term) {
    return {
      grid: emptyStateTemplate(t("discovery.noSearch"), ""),
      detail: emptyStateTemplate(t("discovery.trySearch"), ""),
    };
  }

  if (!currentUser) {
    return {
      grid: emptyStateTemplate(t("discovery.signIn"), t("auth.signIn")),
      detail: emptyStateTemplate(t("discovery.privateHidden"), ""),
    };
  }

  if (!lists.length) {
    return {
      grid: emptyStateTemplate(t("discovery.createList"), t("button.createList")),
      detail: emptyStateTemplate(t("discovery.publishedOpen"), ""),
    };
  }

  const publishCandidate = publishableListCandidate();
  if (publishCandidate) {
    return {
      grid: emptyStateTemplate(t("discovery.readyToPublish", { title: publishCandidate.title }), t("button.publish")),
      detail: emptyStateTemplate(t("discovery.publishHelp"), ""),
    };
  }

  return {
    grid: emptyStateTemplate(t("discovery.addSpots"), t("nav.lists")),
    detail: emptyStateTemplate(t("discovery.needsSpot"), ""),
  };
}

function publishableListCandidate() {
  const ordered = typeof orderedLists === "function" ? orderedLists() : lists;
  return ordered.find((list) => list.visibility !== "public" && Number(list.item_count || list.items?.length || 0) > 0) ?? null;
}

function bindDiscoveryEmptyAction(term = "") {
  const action = elements.discoveryGrid.querySelector("[data-empty-action]");
  if (!action) return;
  action.addEventListener("click", async () => {
    if (discoveryLists.length && term) {
      return;
    }
    if (!currentUser) {
      requireLogin();
      return;
    }
    if (!lists.length) {
      openCreateListDialog();
      return;
    }
    const publishCandidate = publishableListCandidate();
    if (publishCandidate) {
      setActiveCategory(`custom:${publishCandidate.id}`);
      await ensureListDetail(publishCandidate.id);
      setActiveView("my-lists");
      return;
    }
    setActiveCategory(lists[0]?.id ? `custom:${lists[0].id}` : "system:all");
    setActiveView("my-lists");
  });
}

function systemListCardTemplate(list, selected) {
  const spots = restaurantsForSystemList(list);
  return `
    <button class="system-list-card ${selected ? "selected" : ""}" type="button" data-system-list="${list.key}">
      <span class="system-list-icon">${list.icon}</span>
      <span>
        <strong>${escapeHtml(systemListTitle(list))}</strong>
        <small>${escapeHtml(systemListDescription(list))}</small>
      </span>
      <span class="system-list-count">${spots.length}</span>
    </button>
  `;
}

function systemListDetailTemplate(definition, term) {
  return listViewTemplates.systemListDetail(definition, term);
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
      setSpotCardOpen(true);
      setActiveView("my-map");
    });
  });
  elements.myListDetail.querySelectorAll("[data-delete-spot]").forEach((button) => {
    button.addEventListener("click", () => deleteRestaurantById(button.dataset.deleteSpot));
  });
}

function listCardTemplate(list, selected, mode) {
  return listViewTemplates.listCard(list, selected, mode);
}

function myListDetailTemplate(list, term = "") {
  return listViewTemplates.myListDetail(list, term);
}

function discoveryDetailTemplate(list) {
  return listViewTemplates.discoveryDetail(list);
}

function renderSharePackView() {
  if (!elements.sharePackPage || activeView !== "share-pack") return;
  if (!sharePackData) {
    elements.sharePackPage.innerHTML = loadingPanel(t("discovery.loading"));
    return;
  }
  elements.sharePackPage.innerHTML = accountShareTemplates.sharePackPublicPage(sharePackData);
  elements.sharePackPage.querySelector("[data-add-share-pack]")?.addEventListener("click", addSharedPackToMyLists);
}

function renderRecipeShareView() {
  if (!elements.recipeSharePage || activeView !== "recipe-share") return;
  if (!recipeShareData) {
    elements.recipeSharePage.innerHTML = loadingPanel(t("discovery.loading"));
    return;
  }
  elements.recipeSharePage.innerHTML = accountShareTemplates.recipeSharePage(recipeShareData);
  elements.recipeSharePage.querySelector("[data-add-recipe-share]")?.addEventListener("click", addSharedRecipeToMyRecipes);
}

function restaurantRowTemplate(restaurant, options = {}) {
  return viewTemplates.restaurantRow(restaurant, options);
}

function restaurantThumbTemplate(restaurant) {
  return viewTemplates.restaurantThumb(restaurant);
}

function coverTemplate(list) {
  return viewTemplates.listCover(list);
}

function emptyStateTemplate(message, actionLabel) {
  return uiComponents.emptyStateTemplate({ title: message, actionLabel });
}

function emptyInfoTemplate(title, message) {
  return uiComponents.emptyStateTemplate({ title, message });
}

function loadingPanel(message) {
  return uiComponents.statusPanelTemplate(message);
}

function errorPanel(message) {
  return uiComponents.statusPanelTemplate(message, "error");
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
  elements.myListDetail.querySelectorAll("[data-open-spot]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedRestaurantId = button.dataset.openSpot;
      setSpotCardOpen(true);
      setActiveCategory(`custom:${list.id}`);
      setActiveView("my-map");
    });
  });
  elements.myListDetail.querySelectorAll("[data-remove-list-spot]").forEach((button) => {
    button.addEventListener("click", () => removeSpotFromList(list.id, button.dataset.removeListSpot));
  });
}

function bindRestaurantRows(container) {
  container.querySelectorAll("[data-restaurant-id]").forEach((row) => {
    row.addEventListener("click", (event) => {
      if (event.target.closest("a, button, input, select, textarea")) return;
      const restaurantId = row.dataset.restaurantId;
      if (!restaurants.some((restaurant) => restaurant.id === restaurantId)) return;
      selectedRestaurantId = restaurantId;
      setSpotCardOpen(true);
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
  elements.listFormMode.textContent = t("list.newMode");
  elements.listFormTitle.textContent = t("list.createTitle");
  elements.saveListButton.textContent = t("button.createList");
  elements.listFormHelp.textContent = t("list.defaultPrivate");
  listFormBaseline = formSnapshot(elements.listForm);
  elements.listDialog.showModal();
}

function openEditListDialog(list) {
  editingListId = list.id;
  elements.listForm.reset();
  elements.listForm.elements.id.value = list.id;
  elements.listForm.elements.title.value = list.title;
  elements.listForm.elements.description.value = list.description || "";
  elements.listForm.elements.coverImageUrl.value = list.cover_image_url || "";
  elements.listFormMode.textContent = t("list.editMode");
  elements.listFormTitle.textContent = t("list.editTitle");
  elements.saveListButton.textContent = t("button.updateList");
  elements.listFormHelp.textContent = t("list.editHelp");
  listFormBaseline = formSnapshot(elements.listForm);
  elements.listDialog.showModal();
}

async function closeListDialog({ force = false } = {}) {
  if (!force && formSnapshot(elements.listForm) !== listFormBaseline) {
    const discard = await confirmAction(t("confirm.discardMessage"), {
      title: t("confirm.discardTitle"),
      confirmLabel: t("button.discard"),
      tone: "danger",
    });
    if (!discard) return false;
  }
  elements.listDialog.close();
  editingListId = null;
  listFormBaseline = "";
  elements.listForm.reset();
  return true;
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
    elements.listFormHelp.textContent = t("list.titleRequired");
    return;
  }
  try {
    elements.listFormHelp.textContent = t("list.saving");
    const data = editingListId
      ? await api(`/api/lists/${editingListId}`, { method: "PATCH", body: JSON.stringify(body) })
      : await api("/api/lists", { method: "POST", body: JSON.stringify(body) });
    const list = normalizeList(data.list);
    lists = editingListId ? lists.map((item) => (item.id === list.id ? list : item)) : [list, ...lists];
    selectedListId = list.id;
    activeMyListKey = `custom:${list.id}`;
    if (!editingListId) saveListFilterOrder([list.id, ...orderedLists().filter((item) => item.id !== list.id).map((item) => item.id)]);
    await closeListDialog({ force: true });
    setActiveView("my-lists");
  } catch (error) {
    elements.listFormHelp.textContent = error.message;
  }
}

async function toggleListVisibility(list) {
  if (!requireLogin()) return;
  if (list.visibility !== "public" && !list.item_count) {
    alert(t("list.publishNeedsSpot"));
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
  if (!requireLogin() || !(await confirmAction(t("list.deleteConfirm", { title: list.title }), {
    title: t("confirm.deleteTitle"),
    confirmLabel: t("button.delete"),
    tone: "danger",
  }))) return;
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
    elements.addSpotsList.innerHTML = emptyStateTemplate(t("list.selectFirst"), "");
    return;
  }
  const added = new Set((list.items ?? []).map((item) => item.restaurant_id));
  const term = elements.addSpotsSearch.value.trim().toLowerCase();
  const visible = restaurants.filter((restaurant) => {
    const haystack = [restaurant.name, restaurant.address, restaurant.notes].join(" ").toLowerCase();
    return !term || haystack.includes(term);
  });
  elements.addSpotsList.innerHTML = visible.length
    ? visible.map((restaurant) => formTemplates.addSpotRow(restaurant, added.has(restaurant.id))).join("")
    : emptyStateTemplate(t("list.noRestaurantMatches"), "");
  elements.addSpotsList.querySelectorAll("[data-add-list-spot]").forEach((button) => {
    button.addEventListener("click", () => addSpotToList(list.id, button.dataset.addListSpot));
  });
  elements.addSpotsList.querySelectorAll("[data-remove-list-spot]").forEach((button) => {
    button.addEventListener("click", () => removeSpotFromList(list.id, button.dataset.removeListSpot));
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
  if (elements.addSpotsDialog.open) renderAddSpotsDialog();
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
  return domainCore.findById(restaurants, selectedRestaurantId);
}

function selectedRecipe() {
  return domainCore.findById(recipes, selectedRecipeId);
}

function upsertRecipe(recipe) {
  const normalized = normalizeRecipe(recipe);
  recipes = domainCore.upsertById(recipes, normalized);
}

function recipeSearchText(recipe) {
  return [recipe.title, recipe.ingredients, recipe.steps, recipe.notes].join(" ").toLowerCase();
}

function recipeImageUrl(recipe) {
  return recipe.image_url || foodPlaceholderUrl({ id: recipe.id || recipe.title || "recipe" });
}

function dateInputValue(timestamp) {
  if (!timestamp) return "";
  const date = new Date(Number(timestamp) * 1000);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function timestampFromDateInput(value) {
  if (!value) return 0;
  const timestamp = Math.floor(new Date(`${value}T12:00:00`).getTime() / 1000);
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function restaurantsForSystemList(definition) {
  return restaurants.filter((restaurant) => definition.filter === "all" || restaurant.status === definition.filter);
}

function systemListTitle(list) {
  return t(`system.${list.key}.title`);
}

function systemListEyebrow(list) {
  return t(`system.${list.key}.eyebrow`);
}

function systemListDescription(list) {
  return t(`system.${list.key}.description`);
}

function sortRestaurantsByDistance(items) {
  return locationCore.sortRestaurantsForLocationMode(items, locationState);
}

function sortListItemsByDistance(items) {
  const source = Array.isArray(items) ? items : [];
  const byRestaurantId = new Map(source.filter((item) => item.restaurant).map((item) => [String(item.restaurant.id), item]));
  const sortedRestaurants = locationCore.sortRestaurantsForLocationMode(source.filter((item) => item.restaurant).map((item) => item.restaurant), locationState);
  const sorted = sortedRestaurants.map((restaurant) => byRestaurantId.get(String(restaurant.id))).filter(Boolean);
  return [...sorted, ...source.filter((item) => !item.restaurant)];
}

function distanceLabel(restaurant) {
  return isLocationReady() ? formatUserDistance(haversineDistance(currentLocation, restaurant)) : "";
}

function restaurantMetaLabel(restaurant) {
  return [distanceLabel(restaurant), statusLabel(restaurant.status)].filter(Boolean).join(" · ");
}

function listSortDescription() {
  return isLocationReady() ? t("map.sorted") : t("map.recentlyUpdated");
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
  syncCurrentUserRestaurantCount();
}

function syncCurrentUserRestaurantCount() {
  if (!currentUser) return;
  currentUser.restaurant_count = restaurants.length;
  if (currentUser.restaurant_limit != null) {
    currentUser.remaining_restaurant_slots = Math.max(0, Number(currentUser.restaurant_limit) - restaurants.length);
  }
}

function canAddOneRestaurant() {
  if (!currentUser || currentUser.plan === "paid" || currentUser.restaurant_limit == null) return true;
  syncCurrentUserRestaurantCount();
  if (restaurants.length < Number(currentUser.restaurant_limit)) return true;
  alert(t("limit.freeFull", { count: restaurants.length, limit: currentUser.restaurant_limit }));
  return false;
}

function syncQuotaUi() {
  if (!elements.openAddPanel || !elements.pasteAddButton) return;
  if (!currentUser || shareToken) {
    elements.openAddPanel.disabled = false;
    elements.pasteAddButton.disabled = false;
    return;
  }
  syncCurrentUserRestaurantCount();
  const limitReached = currentUser.plan !== "paid" && currentUser.restaurant_limit != null && restaurants.length >= Number(currentUser.restaurant_limit);
  elements.openAddPanel.disabled = limitReached;
  elements.pasteAddButton.disabled = limitReached;
  if (limitReached) {
    elements.pasteStatus.textContent = t("limit.freeFull", { count: restaurants.length, limit: currentUser.restaurant_limit });
  }
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
  const candidateUrlKey = mapPlaceKey(candidate.google_url);
  const candidateCoordinates = validateCoordinates(candidate.lat, candidate.lng);
  return restaurants.find((restaurant) => {
    const sameUrl = candidateUrlKey && mapPlaceKey(restaurant.google_url) === candidateUrlKey;
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

function mapPlaceKey(url) {
  if (!url) return "";
  const parsed = parseMapUrl(url);
  const name = normalizePlaceName(parsed?.name || "");
  if (parsed?.lat != null && parsed?.lng != null) {
    return `${name}|${Number(parsed.lat).toFixed(5)},${Number(parsed.lng).toFixed(5)}`;
  }
  return name ? `name:${name}` : "";
}

function normalizeRestaurant(item) {
  return domainModel.normalizeRestaurant(item);
}

function normalizeDish(item) {
  return domainModel.normalizeDish(item);
}

function clampRating(value) {
  return Math.max(0, Math.min(5, Number.isFinite(value) ? value : 0));
}

function normalizeList(item) {
  return domainModel.normalizeList(item);
}

function normalizeSharePack(item) {
  return domainModel.normalizeSharePack(item);
}

function normalizeSharePackSummary(item) {
  return domainModel.normalizeSharePackSummary(item);
}

function normalizeRecipe(item) {
  return domainModel.normalizeRecipe(item);
}

function normalizeRecipeShare(item) {
  return domainModel.normalizeRecipeShare(item);
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
  return domainCore.orderByIds(lists, listFilterOrder());
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
  return visibility === "public" ? t("visibility.public") : t("visibility.private");
}

function formatDate(timestamp) {
  if (!timestamp) return "--";
  return new Date(timestamp * 1000).toLocaleDateString(currentLanguage === "zh" ? "zh-CN" : "en", { month: "short", day: "numeric" });
}

function cloneRestaurant(restaurant) {
  return normalizeRestaurant(JSON.parse(JSON.stringify(restaurant)));
}

function resetDemoData() {
  if (currentUser) {
    alert(t("reset.cloudOnly"));
    return;
  }
  restaurants = demoRestaurants.map(cloneRestaurant);
  selectedRestaurantId = restaurants[0]?.id ?? null;
  setSpotCardOpenForCurrentViewport();
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

function getSharePackToken() {
  const match = location.pathname.match(/^\/share-pack\/([^/]+)/);
  return match ? match[1] : "";
}

function getRecipeShareToken() {
  const match = location.pathname.match(/^\/recipe-share\/([^/]+)/);
  return match ? match[1] : "";
}

function rememberPendingSharePackListId(listId) {
  if (!listId) return;
  try {
    sessionStorage.setItem(PENDING_SHARE_PACK_LIST_KEY, String(listId));
  } catch {
    // Ignore storage failures; the copied list still exists in My Lists.
  }
}

function takePendingSharePackListId() {
  try {
    const listId = sessionStorage.getItem(PENDING_SHARE_PACK_LIST_KEY);
    sessionStorage.removeItem(PENDING_SHARE_PACK_LIST_KEY);
    return listId || "";
  } catch {
    return "";
  }
}

function shortUserName(user) {
  return (user.name || user.email || "ME").trim().slice(0, 2).toUpperCase();
}

function statusIcon(status) {
  return { visited: "🍴", want_to_go: "⌑", favorite: "♥" }[status] || "•";
}

function statusLabel(status) {
  return { visited: t("status.visited"), want_to_go: t("status.want_to_go"), favorite: t("status.favorite") }[status] || t("status.unknown");
}

function dishStatusLabel(status) {
  return status === "tried" ? t("status.tried") : t("status.liked");
}

function shortName(name) {
  return name.length > 9 ? `${name.slice(0, 8)}...` : name;
}

function shortMapName(name) {
  return name.length > 18 ? `${name.slice(0, 17)}...` : name;
}

function formatDistance(distanceKm) {
  return locationCore.formatDistance(distanceKm, 0);
}

function formatUserDistance(distanceKm) {
  return locationCore.formatDistance(distanceKm, locationAccuracy());
}

function centerMapOnUser() {
  mapInteractionController?.center();
}

function recenterMapPanWithinBounds() {
  mapInteractionController?.recenterWithinBounds();
}

function updateMapZoomUi() {
  if (elements.mapZoomLabel) elements.mapZoomLabel.textContent = `${Math.round(mapZoom * 100)}%`;
}

function layoutMapMarkers(items) {
  const bounds = elements.cuteMap?.getBoundingClientRect();
  return mapGeometry.layoutRelativeMarkers(items, {
    currentLocation,
    zoom: mapZoom,
    width: bounds?.width,
    height: bounds?.height,
    distanceBetween: haversineDistance,
  });
}

function restaurantImageUrl(restaurant) {
  const dishImage = (restaurant.dishes ?? []).find((dish) => dish.image_url)?.image_url;
  return dishImage || foodPlaceholderUrl(restaurant);
}

function foodPlaceholderUrl(restaurant) {
  return mapGeometry.foodPlaceholderUrl(restaurant.id, accentVariant(restaurant.id));
}

function haversineDistance(origin, destination) {
  return locationCore.haversineDistance(origin, destination);
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
