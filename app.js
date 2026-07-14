const LANGUAGE_KEY = "foodiemap:language";
const LIST_FILTER_ORDER_KEY = "foodiemap:list-filter-order";
const GOOGLE_GEOCODING_KEY = "foodiemap:google-geocoding-key";
const LOCATION_PREFERENCE_KEY = "foodiemap.locationMode.v1";
const LOCATION_CORE_URL = "/location-core.mjs?v=20260710-location";
const UI_CORE_URL = "/ui-core.mjs?v=20260712-shell";
const UI_SHELL_URL = "/ui-shell.mjs?v=20260712-shell";
const UI_DIALOGS_URL = "/ui-dialogs.mjs?v=20260714-dialogs";
const UI_COMPONENTS_URL = "/ui-components.mjs?v=20260714-components";
const DATA_CLIENT_URL = "/data-client.mjs?v=20260714-client";
const DOMAIN_CORE_URL = "/domain-core.mjs?v=20260714-domain";
const VIEW_TEMPLATES_URL = "/view-templates.mjs?v=20260714-views";
const LIST_VIEW_TEMPLATES_URL = "/list-view-templates.mjs?v=20260714-lists";
const isAdminPortal = window.location.pathname.replace(/\/+$/, "") === "/admin";
const MAP_ZOOM_MIN = 0.65;
const MAP_ZOOM_MAX = 2.8;
const MAP_ZOOM_STEP = 0.18;
const MAP_PAN_LIMIT_RATIO = 0.42;
const ADD_DIALOG_SWIPE_CLOSE_DISTANCE = 110;
const ADD_DIALOG_SWIPE_LOCK_DISTANCE = 12;
const FOOD_PLACEHOLDERS = [
  { icon: "🍜", top: "#f4c49d", bottom: "#fff7ed", accent: "#96694c" },
  { icon: "🥘", top: "#dce6af", bottom: "#fffaf4", accent: "#7a8450" },
  { icon: "🍰", top: "#f7d8cd", bottom: "#fff8f0", accent: "#b58a6b" },
  { icon: "🥗", top: "#cfe5cf", bottom: "#fffdf8", accent: "#556030" },
  { icon: "🍣", top: "#f4dfb8", bottom: "#fffaf4", accent: "#d4a373" },
  { icon: "☕", top: "#ead8c9", bottom: "#fff8f0", accent: "#68442d" },
];

const translations = {
  en: {
    "app.brand": "Gourmet Map",
    "app.sharedBrand": "Shared Bite",
    "nav.map": "Map",
    "nav.lists": "Lists",
    "nav.recipes": "Recipes",
    "nav.discovery": "Discovery",
    "search.default": "Search for tasty treats...",
    "search.category": "Search spots in this category...",
    "search.discovery": "Search curated lists...",
    "search.recipes": "Search recipes...",
    "language.label": "Language",
    "language.english": "English",
    "language.chinese": "中文",
    "language.short": "EN",
    "location.waiting": "Location pending",
    "location.fetching": "Getting current location...",
    "location.current": "Location updated",
    "location.approximate": "Approximate location",
    "location.denied": "Location is off. Distances are hidden until you allow access.",
    "location.unavailable": "Your device could not determine its location.",
    "location.timeout": "Location took too long. Try again when you have a stronger signal.",
    "location.unsupported": "This browser does not support location. You can still browse every saved spot.",
    "location.button": "Get current location",
    "location.inviteTitle": "See what's nearby",
    "location.inviteBody": "Your location stays on this device and is only used to calculate distance.",
    "location.useMine": "Use my location",
    "location.notNow": "Not now",
    "location.locatingTitle": "Finding your location",
    "location.locatingBody": "This can take a moment on mobile networks.",
    "location.permissionTitle": "Location is off",
    "location.permissionBody": "Turn it on to see nearby spots and distance sorting.",
    "location.permissionAction": "How to enable",
    "location.unavailableTitle": "Location unavailable",
    "location.timeoutTitle": "Location timed out",
    "location.unsupportedTitle": "Browse without location",
    "location.tryAgain": "Try again",
    "location.browseWithout": "Browse without location",
    "location.helpEyebrow": "LOCATION ACCESS",
    "location.helpTitle": "Turn on location",
    "location.helpIntro": "Allow location for FoodieMap in your browser, then return here.",
    "location.helpSystem": "If it still does not work, make sure Location Services are enabled for this browser in your device settings.",
    "location.retryEnabled": "I've enabled it, try again",
    "location.safariStep1": "Tap the Page Menu beside the address bar.",
    "location.safariStep2": "Open More or Website Settings.",
    "location.safariStep3": "Set Location to Allow, then return to FoodieMap.",
    "location.chromeStep1": "Tap the site information icon beside the address.",
    "location.chromeStep2": "Open Site settings and choose Location.",
    "location.chromeStep3": "Set it to Allow, then return to FoodieMap.",
    "location.genericStep1": "Open this site's permissions from the browser address bar or menu.",
    "location.genericStep2": "Change Location to Allow.",
    "location.genericStep3": "Return to FoodieMap and try again.",
    "settings.button": "Google API settings",
    "login.eyebrow": "PRIVATE FOOD MAP",
    "login.title": "Sign in to save your map.",
    "login.body": "Keep restaurants, menu notes, photos, private lists, and share cards synced in the cloud.",
    "login.google": "Continue with Google",
    "login.password": "Email and password",
    "login.code": "Email code",
    "login.create": "Create account",
    "login.note": "Public Share Pack links can still be viewed without signing in.",
    "auth.signIn": "Sign in",
    "auth.signOutTitle": "{email}, click to sign out",
    "auth.signInTitle": "Sign in",
    "auth.signOutConfirm": "Sign out of {email}?",
    "auth.required": "This action requires sign-in. Sign in now?",
    "auth.mode": "SIGN IN",
    "auth.title": "Sign in to FoodieMap",
    "auth.googleButton": "Continue with Google",
    "auth.tabsLabel": "Sign-in method",
    "auth.passwordTab": "Password",
    "auth.codeTab": "Email code",
    "auth.passwordLogin": "Log in",
    "auth.passwordRegister": "Create account",
    "auth.passwordReset": "Reset password",
    "auth.name": "Name",
    "auth.namePlaceholder": "Optional display name",
    "auth.email": "Email",
    "auth.emailPlaceholder": "you@example.com",
    "auth.password": "Password",
    "auth.newPassword": "New password",
    "auth.passwordPlaceholder": "At least 8 characters",
    "auth.code": "Code",
    "auth.codePlaceholder": "6-digit code",
    "auth.sendCode": "Send code",
    "auth.sendCodeWait": "Send code ({seconds}s)",
    "auth.verifyCode": "Verify and sign in",
    "auth.sendResetCode": "Send reset code",
    "auth.loginButton": "Log in",
    "auth.registerButton": "Create account",
    "auth.resetButton": "Reset and sign in",
    "auth.help": "Use Google, a password, or a one-time email code.",
    "auth.codeSent": "Code sent. Check your email.",
    "auth.signedIn": "Signed in.",
    "auth.passwordResetSent": "Reset code sent. Check your email.",
    "auth.enterEmail": "Enter your email.",
    "auth.enterPassword": "Enter your password.",
    "auth.enterCode": "Enter the code from your email.",
    "api.loginRequired": "Please sign in first.",
    "api.requestFailed": "Request failed.",
    "paste.help": "Copy a Google or Apple Maps link, then click Paste & Add.",
    "paste.demo": "Demo mode. Sign in to save cloud data, upload photos, and share spots.",
    "paste.shared": "A spot shared with you. Preview it here, then sign in to add it to your list.",
    "paste.noGoogleUrl": "No Google Maps link found in the clipboard.",
    "paste.noMapUrl": "No supported map link found in the clipboard.",
    "paste.duplicateConfirm": "A similar spot already exists:\n\n\"{name}\"\n{address}\nAbout {distance} from the new link coordinates.\n\nCreate a duplicate spot anyway?",
    "paste.noAddress": "No address",
    "paste.cancelledDuplicate": "Creation cancelled. Selected existing spot: {name}",
    "paste.addConfirm": "Add \"{name}\" to Want to Go?",
    "paste.added": "Added: {name}",
    "paste.backendOffline": "Backend service is not connected. Start it with python3 server.py 5174.",
    "google.help": "Copy the full Google Maps browser URL. Short share links will be expanded by the local service.",
    "google.shortExpanding": "Expanding Google Maps short link...",
    "google.shortExpanded": "Short link expanded and detectable restaurant details filled.",
    "google.coordsFound": "Restaurant details detected from the Google Maps link.",
    "google.noCoords": "No coordinates found in the link. Open the short link, then copy the full Google Maps address bar URL.",
    "google.addressLookup": "Looking up the address from coordinates...",
    "google.addressLookupFailed": "Coordinates found. Address was not available in the link; add a Google Geocoding API key in settings to auto-fill it.",
    "maps.help": "Paste a Google Maps or Apple Maps link. Short links will be expanded by the local service.",
    "maps.pasteHint": "Paste a Google Maps or Apple Maps link here to auto-detect the restaurant name and location.",
    "maps.shortExpanding": "Expanding map link...",
    "maps.shortExpanded": "Map link expanded and detectable restaurant details filled.",
    "maps.coordsFound": "Restaurant details detected from the map link.",
    "maps.noCoords": "No coordinates found in the link. Paste a full Google Maps or Apple Maps link that includes coordinates, or enter coordinates manually.",
    "maps.addressLookup": "Looking up the address from coordinates...",
    "maps.addressLookupFailed": "Coordinates found. Address was not available in the link; add a Google Geocoding API key in settings to auto-fill it.",
    "maps.openEyebrow": "OPEN MAP",
    "maps.openTitle": "Choose a map app",
    "maps.openGoogle": "Google Maps",
    "maps.openApple": "Apple Maps",
    "spot.discardConfirm": "Discard this unfinished spot?",
    "confirm.actionTitle": "Confirm action",
    "confirm.deleteTitle": "Delete permanently?",
    "confirm.discardTitle": "Discard unsaved changes?",
    "confirm.discardMessage": "Your changes have not been saved. This cannot be undone.",
    "confirm.signOutTitle": "Sign out?",
    "sidebar.myPantry": "MY PANTRY",
    "sidebar.smartLists": "SMART LISTS",
    "sidebar.builtFromMap": "Built from your map",
    "sidebar.customLists": "CUSTOM LISTS",
    "sidebar.savedRoutes": "Your saved routes",
    "sidebar.signInLists": "Sign in to manage lists.",
    "sidebar.noLists": "No custom lists yet.",
    "sidebar.dataTools": "Data tools",
    "button.newSpot": "+ New Spot",
    "button.addToMyList": "+ Add to My List",
    "button.pasteAdd": "Paste & Add",
    "button.export": "Export",
    "button.import": "Import",
    "button.resetDemo": "Reset Demo",
    "button.details": "Details",
    "button.edit": "Edit",
    "button.share": "Share",
    "button.delete": "Delete",
    "button.remove": "Remove",
    "button.save": "Save",
    "button.cancel": "Cancel",
    "button.continue": "Continue",
    "button.discard": "Discard changes",
    "button.signOut": "Sign out",
    "button.copy": "Copy",
    "button.copied": "Copied",
    "button.map": "Map",
    "button.google": "Google",
    "button.add": "Add",
    "button.done": "Done",
    "button.close": "Close",
    "button.openMap": "Open on Map",
    "button.openMaps": "Open Maps",
    "button.createList": "Create List",
    "button.updateList": "Update List",
    "button.publish": "Publish",
    "button.unpublish": "Unpublish",
    "button.addSpots": "Add Spots",
    "button.deleteList": "Delete List",
    "button.copyToMyLists": "Copy to My Lists",
    "button.createShareLink": "Create Share Link",
    "button.createSharePack": "Create Share Pack",
    "button.generateSharePack": "Generate Link",
    "button.addSharedPack": "Add to My Lists",
    "button.openImage": "Open Image",
    "button.downloadImage": "Download Image",
    "button.saveSettings": "Save Settings",
    "button.addMenu": "+ Add Menu",
    "button.saveMenu": "Save Menu",
    "button.closeAddMenu": "Close",
    "button.addDish": "Add Dish",
    "button.replacePhoto": "Replace photo",
    "button.more": "More",
    "button.addSpotShort": "+ Add",
    "button.pasteGoogleLink": "Paste Google link",
    "button.pasteMapLink": "Paste map link",
    "mobileFilter.all": "All",
    "mobileFilter.visited": "Visited",
    "mobileFilter.want": "Want",
    "mobileFilter.favorite": "Favs",
    "mobileList.summary": "Lists",
    "map.view": "MAP VIEW",
    "map.summary": "{count} spots · sorted by distance from you",
    "map.sorted": "Sorted by distance from you",
    "map.summaryBrowse": "{count} spots · recently updated",
    "map.summaryApproximate": "{count} spots · approximate distance",
    "map.recentlyUpdated": "Recently updated",
    "map.emptyTitle": "Add your first restaurant",
    "map.emptyBody": "Save an address or map link, and it will appear on this playful relative map.",
    "map.selectedSpot": "SELECTED SPOT",
    "map.selected": "Selected",
    "map.chooseSpot": "Choose a restaurant",
    "map.spotHint": "Click a restaurant marker to view details.",
    "map.noNotes": "No notes yet.",
    "map.openGoogle": "Open Google Maps ›",
    "map.openMaps": "Open Maps ›",
    "map.noMatches": "No matching restaurants",
    "map.zoomOut": "Zoom out",
    "map.zoomIn": "Zoom in",
    "map.center": "Center on you",
    "map.zoomReset": "Reset zoom",
    "count.places": "{count} places",
    "count.spots": "{count} spots",
    "count.copies": "{count} copies",
    "count.visits": "{count} visits",
    "sort.nearest": "Nearest first",
    "sort.recent": "Recently updated",
    "status.visited": "Visited",
    "status.want_to_go": "Want to Go",
    "status.favorite": "Favorite",
    "status.unknown": "Unknown",
    "status.liked": "Liked",
    "status.tried": "Tried",
    "visibility.public": "Public",
    "visibility.private": "Private",
    "distance.pending": "Distance pending",
    "system.all.title": "All Spots",
    "system.all.eyebrow": "EVERYTHING",
    "system.all.description": "Every restaurant saved on your map.",
    "system.visited.title": "Visited",
    "system.visited.eyebrow": "BEEN THERE",
    "system.visited.description": "Places you have already tried.",
    "system.want_to_go.title": "Want to Go",
    "system.want_to_go.eyebrow": "NEXT UP",
    "system.want_to_go.description": "Restaurants waiting for a first visit.",
    "system.favorite.title": "Favorites",
    "system.favorite.eyebrow": "LOVED",
    "system.favorite.description": "Your favorite spots in one quick list.",
    "list.smart": "SMART LIST",
    "list.custom": "CUSTOM LIST",
    "list.publicCustom": "PUBLIC CUSTOM LIST",
    "list.public": "PUBLIC LIST",
    "list.private": "PRIVATE LIST",
    "list.choose": "Choose a list",
    "list.chooseDescription": "Select a custom list on the left to view its spots.",
    "list.customDescription": "Custom category from your saved restaurants.",
    "list.noDescription": "No description yet.",
    "list.updated": "Updated {date}",
    "list.manage": "Manage",
    "list.noSmartSpots": "No spots in this smart list yet.",
    "list.noSearchResults": "No spots match this search.",
    "list.empty": "This list is empty. Add spots from your map.",
    "list.needSignIn": "Choose a smart list on the left, or sign in to manage custom lists.",
    "list.createThenAdd": "Create a list, then add spots from your map.",
    "list.newMode": "NEW_LIST",
    "list.editMode": "EDIT_LIST",
    "list.createTitle": "Create List",
    "list.editTitle": "Edit List",
    "list.defaultPrivate": "Lists are private by default. Publish when you want them to appear in Discovery.",
    "list.editHelp": "Changes affect My Lists immediately. Public lists also update in Discovery.",
    "list.titleRequired": "Enter a list title.",
    "list.saving": "Saving...",
    "list.publishNeedsSpot": "Add at least one restaurant before publishing.",
    "list.deleteConfirm": "Delete list \"{title}\"? Restaurant records will not be deleted.",
    "list.selectFirst": "Select a list first.",
    "list.inThisList": "In this list",
    "list.noRestaurantMatches": "No restaurants match this search.",
    "discovery.communityPicks": "COMMUNITY PICKS",
    "discovery.title": "Pantry Discovery",
    "discovery.body": "Explore public taste maps shared by the Gourmet Map community.",
    "discovery.sortLabel": "Discovery sort",
    "discovery.popular": "Popular",
    "discovery.recent": "Recent",
    "discovery.publicLists": "PUBLIC LISTS",
    "discovery.publishedBy": "Published by food explorers",
    "discovery.noSearch": "No public lists match this search.",
    "discovery.trySearch": "Try another search to open a public list here.",
    "discovery.signIn": "Discovery only shows public lists. Sign in to publish your own.",
    "discovery.privateHidden": "Private lists stay hidden until their owner publishes them.",
    "discovery.createList": "No public lists yet. Create a custom list, add spots, then publish it.",
    "discovery.publishedOpen": "Published lists will open here after someone shares one.",
    "discovery.readyToPublish": "No public lists yet. \"{title}\" is ready to publish.",
    "discovery.publishHelp": "Open your list, then use Manage > Publish when you are ready to share it.",
    "discovery.addSpots": "No public lists yet. Add spots to a custom list before publishing.",
    "discovery.needsSpot": "A list needs at least one spot before it can appear in Discovery.",
    "discovery.publicPick": "PUBLIC PICK",
    "discovery.byOwner": "by {name}",
    "discovery.foodie": "Foodie",
    "discovery.noVisible": "This public list has no visible spots.",
    "discovery.addressHidden": "Address not shared",
    "discovery.loading": "Loading public list...",
    "modal.closeDetails": "Close details",
    "detail.journal": "RESTAURANT JOURNAL",
    "detail.restaurant": "Restaurant",
    "detail.review": "MY REVIEW",
    "detail.reviewTitle": "Restaurant review",
    "detail.status": "Status",
    "detail.rating": "Rating",
    "detail.visitCount": "Visit count",
    "detail.notes": "My notes",
    "detail.notesPlaceholder": "Write when this place works best, what to order again, or what to avoid.",
    "detail.autosave": "Changes autosave to your restaurant review.",
    "detail.demo": "Demo mode is view-only. Sign in to save reviews, menu notes, and photos.",
    "detail.signInAutosave": "Sign in to autosave restaurant reviews.",
    "detail.autosavingReview": "Autosaving restaurant review...",
    "detail.reviewSaved": "Restaurant review saved.",
    "detail.menuNotes": "MENU NOTES",
    "detail.menuTitle": "Menu notes",
    "detail.dishName": "Dish name",
    "detail.dishNotes": "Dish notes",
    "detail.dishNotesPlaceholder": "What did you think of this dish?",
    "detail.uploadPhoto": "Upload photo",
    "detail.uploadHint": "Click to upload or drag image here",
    "detail.noMenu": "No menu notes yet. Add the first dish to rate it, upload a photo, and write notes.",
    "detail.noDishNotes": "No notes for this dish yet.",
    "detail.cancelledDish": "New menu item cancelled.",
    "detail.deletedDish": "Menu item deleted.",
    "detail.dishRequired": "Dish name is required.",
    "detail.addingMenu": "Adding menu item...",
    "detail.addedMenu": "Menu item added.",
    "detail.savingMenu": "Saving menu item...",
    "detail.menuSaved": "Menu item saved.",
    "detail.uploading": "Uploading image...",
    "detail.uploaded": "Image uploaded.",
    "detail.deleteDishConfirm": "Delete this dish?",
    "spot.newMode": "NEW_SPOT",
    "spot.editMode": "EDIT_SPOT",
    "spot.saveTitle": "Save a Bite",
    "spot.editTitle": "Edit Bite",
    "spot.saveButton": "Save Spot",
    "spot.updateButton": "Update Spot",
    "spot.editHelp": "Update the restaurant record, menu notes, and photos below.",
    "spot.name": "Name",
    "spot.namePlaceholder": "Auto-detected, or enter a restaurant name",
    "spot.address": "Address",
    "spot.addressPlaceholder": "Optional: record the address manually",
    "spot.googleUrl": "Maps link",
    "spot.googleUrlPlaceholder": "Paste a Google Maps or Apple Maps link to detect name, address, and coordinates",
    "spot.lat": "Latitude",
    "spot.lng": "Longitude",
    "spot.coordPlaceholder": "Auto-filled",
    "spot.notes": "Notes",
    "spot.notesPlaceholder": "Rich broth, good for a slow dinner after work.",
    "spot.dishes": "DISHES",
    "spot.dishRecords": "Dish records",
    "spot.dishPlaceholder": "Dish name, e.g. Black Garlic Tonkotsu",
    "spot.noDishes": "No dish records yet.",
    "spot.dishNameRequired": "Enter a dish name.",
    "spot.deleteDishConfirm": "Delete this dish?",
    "spot.deleteConfirm": "Delete \"{name}\"?\n\nThis will also delete its menu notes and photos.",
    "spot.untitled": "Untitled Spot",
    "share.mode": "SHARE",
    "share.title": "Share This Spot",
    "share.help": "Choose the dishes you want to recommend, then create a share link.",
    "share.noDishes": "This spot has no dishes yet. Edit the spot and add dishes before sharing.",
    "share.link": "Share link",
    "share.linkPlaceholder": "Link appears after creation",
    "sharePack.mode": "PRIVATE SHARE",
    "sharePack.title": "Create Share Pack",
    "sharePack.help": "Choose restaurants and dishes, then generate a private link and QR code.",
    "sharePack.nameLabel": "Title",
    "sharePack.namePlaceholder": "Weekend ramen picks",
    "sharePack.descriptionLabel": "Description",
    "sharePack.descriptionPlaceholder": "Why these spots are worth trying",
    "sharePack.link": "Private link",
    "sharePack.qrAlt": "Share QR code",
    "sharePack.cardAlt": "Share recommendation card",
    "sharePack.historyTitle": "My Share Packs",
    "sharePack.historyEyebrow": "PRIVATE HISTORY",
    "sharePack.historyHelp": "Links and cards you generated from Discovery.",
    "sharePack.noHistory": "No private recommendations yet.",
    "sharePack.openPreview": "Open Preview",
    "sharePack.imageAction": "Image",
    "sharePack.previewAction": "Preview",
    "sharePack.privacyNotice": "Anyone with this link or QR code can view the selected restaurants, dishes, addresses, and notes.",
    "sharePack.revokeAction": "Revoke",
    "sharePack.revokeConfirm": "Revoke \"{title}\"? The link, QR code, and image will stop working.",
    "sharePack.revoked": "Share pack revoked.",
    "sharePack.noSpots": "Add at least one restaurant before creating a share pack.",
    "sharePack.chooseOne": "Choose at least one restaurant.",
    "sharePack.generated": "Private link and QR code are ready.",
    "sharePack.routeMissing": "The server has not loaded Share Pack yet. Restart or deploy the latest backend, then try again.",
    "sharePack.saved": "Share pack copied to your My Lists.",
    "sharePack.previewEyebrow": "PRIVATE RECOMMENDATION",
    "sharePack.byOwner": "Recommended by {name}",
    "sharePack.empty": "This share pack has no visible restaurants.",
    "sharePack.addedSource": "Added from a private share pack.",
    "recipes.eyebrow": "HOME COOKING",
    "recipes.title": "My Recipes",
    "recipes.body": "Keep photos, ingredients, and notes for dishes you cooked.",
    "recipes.addTitle": "Add recipe",
    "recipes.emptyTitle": "Add your first recipe",
    "recipes.emptyBody": "Save a dish you cooked, then add a photo, ingredients, and steps.",
    "recipes.newMode": "NEW RECIPE",
    "recipes.editMode": "EDIT RECIPE",
    "recipes.formTitle": "Save a Recipe",
    "recipes.editTitle": "Edit Recipe",
    "recipes.name": "Dish name",
    "recipes.namePlaceholder": "Tomato egg noodles",
    "recipes.rating": "Rating",
    "recipes.cookedAt": "Cooked date",
    "recipes.uploadPhoto": "Upload photo",
    "recipes.currentPhoto": "Current photo. Upload a new image to replace it.",
    "recipes.ingredients": "Ingredients",
    "recipes.ingredientsPlaceholder": "Eggs, tomato, noodles, scallion...",
    "recipes.steps": "Steps",
    "recipes.stepsPlaceholder": "Write the simple steps so you can remake it.",
    "recipes.notes": "Notes",
    "recipes.notesPlaceholder": "What to adjust next time?",
    "recipes.formHelp": "Recipes are private unless you generate a share link.",
    "recipes.save": "Save Recipe",
    "recipes.update": "Update Recipe",
    "recipes.saved": "Recipe saved.",
    "recipes.deleted": "Recipe deleted.",
    "recipes.deleteConfirm": "Delete recipe \"{title}\"?",
    "recipes.shareEyebrow": "RECIPE SHARE",
    "recipes.shareTitle": "Share this Recipe",
    "recipes.shareHelp": "Create a public preview link, QR code, and image card for this recipe.",
    "recipes.shareLink": "Recipe link",
    "recipes.generateShare": "Generate Link",
    "recipes.generated": "Recipe share link and card are ready.",
    "recipes.cardAlt": "Recipe share card",
    "recipes.previewEyebrow": "HOME RECIPE",
    "recipes.byOwner": "Recipe from {name}",
    "recipes.saveShared": "Save to My Recipes",
    "recipes.savedShared": "Saved to My Recipes.",
    "recipes.noIngredients": "No ingredients recorded yet.",
    "recipes.noSteps": "No steps recorded yet.",
    "listForm.titleLabel": "Title",
    "listForm.descriptionLabel": "Description",
    "listForm.descriptionPlaceholder": "Describe the occasion or theme for this restaurant group.",
    "listForm.coverLabel": "Cover URL (optional)",
    "listForm.coverPlaceholder": "Leave blank to use a dish photo from the list",
    "manageSpots.mode": "MANAGE_SPOTS",
    "manageSpots.title": "Manage Spots",
    "manageSpots.search": "Search restaurants",
    "manageSpots.searchPlaceholder": "Search your map...",
    "manageSpots.help": "Restaurants already in the list can be removed here. Restaurant records are not deleted.",
    "settings.mode": "SETTINGS",
    "settings.title": "Google API",
    "settings.keyLabel": "Google Geocoding API Key",
    "settings.help": "A Google Geocoding API key lets FoodieMap fill an address when a Maps link only contains coordinates.",
    "settings.saved": "Google API settings saved.",
    "settings.connectedEyebrow": "AI ACCESS",
    "settings.connectedTitle": "Connected AI Apps",
    "settings.connectedHelp": "Review or revoke AI agents that can access your FoodieMap.",
    "settings.connectedEmpty": "No AI apps are connected.",
    "settings.revoke": "Revoke",
    "settings.revokeConfirm": "Revoke access for {name}?",
    "import.cloudOnly": "Cloud data does not import local JSON yet.",
    "reset.cloudOnly": "After sign-in, data is stored in the cloud. Reset Demo is not used.",
    "limit.free": "Free accounts can store up to {limit} restaurants. You have {count}.",
    "limit.freeFull": "Free account limit reached: {count}/{limit} restaurants.",
    "admin.eyebrow": "ADMIN",
    "admin.title": "User Management",
    "admin.description": "Manage account access, plans, and Free account storage limits.",
    "admin.loginEyebrow": "ADMIN",
    "admin.loginTitle": "Admin Login",
    "admin.loginDescription": "Sign in with the fixed admin username and password configured on this server.",
    "admin.username": "Username",
    "admin.usernamePlaceholder": "admin",
    "admin.password": "Password",
    "admin.passwordPlaceholder": "Admin password",
    "admin.loginButton": "Log in to Admin",
    "admin.logout": "Log out",
    "admin.loginHelp": "Use ADMIN_USERNAME and ADMIN_PASSWORD from your .env file.",
    "admin.loginMissing": "Enter the admin username and password.",
    "admin.notConfigured": "Admin login is not configured on this server.",
    "admin.refresh": "Refresh",
    "admin.search": "Search users",
    "admin.searchPlaceholder": "Email or name",
    "admin.status": "Status",
    "admin.plan": "Plan",
    "admin.allStatuses": "All statuses",
    "admin.allPlans": "All plans",
    "admin.statusActive": "Active",
    "admin.statusSuspended": "Suspended",
    "admin.statusDeleted": "Deleted",
    "admin.planFree": "Free",
    "admin.planPaid": "Paid",
    "admin.loading": "Loading users...",
    "admin.noAccess": "Admin access required.",
    "admin.noUsers": "No users match these filters.",
    "admin.loaded": "Loaded {count} users.",
    "admin.created": "Created {date}",
    "admin.updated": "Updated {date}",
    "admin.restaurants": "{count} restaurants",
    "admin.lists": "{count} lists",
    "admin.publicLists": "{count} public",
    "admin.limit": "Limit {count}/{limit}",
    "admin.authMethods": "Auth: {methods}",
    "admin.methodGoogle": "Google",
    "admin.methodPassword": "Password",
    "admin.methodEmailCode": "Email code",
    "admin.unlimited": "Unlimited",
    "admin.makePaid": "Set Paid",
    "admin.makeFree": "Set Free",
    "admin.suspend": "Suspend",
    "admin.reactivate": "Reactivate",
    "admin.softDelete": "Soft delete",
    "admin.restore": "Restore",
    "admin.confirmSuspend": "Suspend {email}? They will lose access until reactivated.",
    "admin.confirmReactivate": "Reactivate {email}?",
    "admin.confirmDelete": "Soft delete {email}? Their data will be retained and can be restored.",
    "admin.confirmRestore": "Restore {email}?",
    "admin.confirmPlan": "Set {email} to {plan}?",
    "admin.roleAdmin": "Admin",
    "admin.you": "You",
  },
  zh: {
    "app.brand": "美食地图",
    "app.sharedBrand": "分享餐厅",
    "nav.map": "地图",
    "nav.lists": "列表",
    "nav.recipes": "菜谱",
    "nav.discovery": "发现",
    "search.default": "搜索好吃的...",
    "search.category": "搜索当前分类里的餐厅...",
    "search.discovery": "搜索公开清单...",
    "search.recipes": "搜索菜谱...",
    "language.label": "语言",
    "language.english": "English",
    "language.chinese": "中文",
    "language.short": "中",
    "location.waiting": "等待定位",
    "location.fetching": "正在获取当前位置...",
    "location.current": "位置已更新",
    "location.approximate": "大致位置",
    "location.denied": "定位权限已关闭，允许前不会显示距离。",
    "location.unavailable": "设备暂时无法确定当前位置。",
    "location.timeout": "定位时间过长，请在信号较好时重试。",
    "location.unsupported": "此浏览器不支持定位，你仍然可以浏览所有已保存餐厅。",
    "location.button": "获取当前位置",
    "location.inviteTitle": "查看离你最近的餐厅",
    "location.inviteBody": "位置只保留在当前设备上，仅用于计算距离。",
    "location.useMine": "使用我的位置",
    "location.notNow": "暂不使用",
    "location.locatingTitle": "正在获取你的位置",
    "location.locatingBody": "移动网络下可能需要一点时间。",
    "location.permissionTitle": "定位权限已关闭",
    "location.permissionBody": "开启后可查看附近餐厅并按距离排序。",
    "location.permissionAction": "查看开启步骤",
    "location.unavailableTitle": "暂时无法定位",
    "location.timeoutTitle": "定位超时",
    "location.unsupportedTitle": "不使用定位浏览",
    "location.tryAgain": "重新定位",
    "location.browseWithout": "不使用定位浏览",
    "location.helpEyebrow": "定位权限",
    "location.helpTitle": "开启定位",
    "location.helpIntro": "在浏览器中允许 FoodieMap 使用位置，然后返回这里。",
    "location.helpSystem": "如果仍然无效，请确认设备设置中已允许此浏览器使用定位服务。",
    "location.retryEnabled": "已经开启，重新定位",
    "location.safariStep1": "点击地址栏旁边的页面菜单。",
    "location.safariStep2": "打开“更多”或“网站设置”。",
    "location.safariStep3": "把“位置”改为“允许”，然后返回 FoodieMap。",
    "location.chromeStep1": "点击地址栏旁边的网站信息图标。",
    "location.chromeStep2": "打开“网站设置”，选择“位置”。",
    "location.chromeStep3": "改为“允许”，然后返回 FoodieMap。",
    "location.genericStep1": "从浏览器地址栏或菜单打开当前网站权限。",
    "location.genericStep2": "把“位置”改为“允许”。",
    "location.genericStep3": "返回 FoodieMap 后重新定位。",
    "settings.button": "Google API 设置",
    "login.eyebrow": "私人美食地图",
    "login.title": "登录后保存你的美食地图。",
    "login.body": "餐厅、菜单记录、照片、私密清单和分享卡片都会同步到云端。",
    "login.google": "用 Google 继续",
    "login.password": "邮箱密码登录",
    "login.code": "邮箱验证码登录",
    "login.create": "创建账号",
    "login.note": "别人发来的 Share Pack 链接仍可免登录查看。",
    "auth.signIn": "登录",
    "auth.signOutTitle": "{email}，点击退出登录",
    "auth.signInTitle": "登录",
    "auth.signOutConfirm": "退出 {email} 吗？",
    "auth.required": "这个操作需要登录。现在登录吗？",
    "auth.mode": "登录",
    "auth.title": "登录 FoodieMap",
    "auth.googleButton": "使用 Google 继续",
    "auth.tabsLabel": "登录方式",
    "auth.passwordTab": "密码",
    "auth.codeTab": "邮箱验证码",
    "auth.passwordLogin": "登录",
    "auth.passwordRegister": "创建账号",
    "auth.passwordReset": "重置密码",
    "auth.name": "姓名",
    "auth.namePlaceholder": "可选显示名",
    "auth.email": "邮箱",
    "auth.emailPlaceholder": "you@example.com",
    "auth.password": "密码",
    "auth.newPassword": "新密码",
    "auth.passwordPlaceholder": "至少 8 位",
    "auth.code": "验证码",
    "auth.codePlaceholder": "6 位验证码",
    "auth.sendCode": "发送验证码",
    "auth.sendCodeWait": "重新发送（{seconds}s）",
    "auth.verifyCode": "验证并登录",
    "auth.sendResetCode": "发送重置验证码",
    "auth.loginButton": "登录",
    "auth.registerButton": "创建账号",
    "auth.resetButton": "重置并登录",
    "auth.help": "可使用 Google、密码或一次性邮箱验证码登录。",
    "auth.codeSent": "验证码已发送，请检查邮箱。",
    "auth.signedIn": "已登录。",
    "auth.passwordResetSent": "重置验证码已发送，请检查邮箱。",
    "auth.enterEmail": "请输入邮箱。",
    "auth.enterPassword": "请输入密码。",
    "auth.enterCode": "请输入邮箱里的验证码。",
    "api.loginRequired": "请先登录。",
    "api.requestFailed": "请求失败。",
    "paste.help": "复制 Google 或 Apple 地图链接后点 Paste & Add。",
    "paste.demo": "当前是演示模式。登录后可保存云端数据、上传图片和分享。",
    "paste.shared": "朋友分享给你的店铺。可以预览，登录后一键加入自己的列表。",
    "paste.noGoogleUrl": "剪贴板里没有 Google Maps 链接。",
    "paste.noMapUrl": "剪贴板里没有支持的地图链接。",
    "paste.duplicateConfirm": "已经找到很像的餐厅：\n\n「{name}」\n{address}\n距离新链接坐标约 {distance}\n\n还要继续创建一个新的重复记录吗？",
    "paste.noAddress": "没有地址",
    "paste.cancelledDuplicate": "已取消创建，已选中现有餐厅：{name}",
    "paste.addConfirm": "添加「{name}」到想去吗？",
    "paste.added": "已添加：{name}",
    "paste.backendOffline": "后端服务未连接。请用 python3 server.py 5174 启动。",
    "google.help": "推荐复制 Google Maps 浏览器地址栏里的完整链接；短分享链接会由本地服务自动展开。",
    "google.shortExpanding": "正在展开 Google Maps 短链接...",
    "google.shortExpanded": "短链接已展开，并已填入可识别的餐厅信息。",
    "google.coordsFound": "已从 Google Maps 链接识别餐厅信息。",
    "google.noCoords": "没有从链接识别到坐标。请打开短链接后复制完整 Google Maps 地址栏链接。",
    "google.addressLookup": "正在用坐标查询地址...",
    "google.addressLookupFailed": "已识别坐标。这个链接里没有地址；如需自动填地址，请在设置里填写 Google Geocoding API Key。",
    "maps.help": "可粘贴 Google Maps 或 Apple Maps 链接；短链接会由本地服务自动展开。",
    "maps.pasteHint": "在这里粘贴 Google Maps 或 Apple Maps 链接，会自动识别餐厅名称和位置。",
    "maps.shortExpanding": "正在展开地图链接...",
    "maps.shortExpanded": "地图链接已展开，并已填入可识别的餐厅信息。",
    "maps.coordsFound": "已从地图链接识别餐厅信息。",
    "maps.noCoords": "没有从链接识别到坐标。请粘贴包含坐标的 Google Maps 或 Apple Maps 完整链接，或手动填写坐标。",
    "maps.addressLookup": "正在用坐标查询地址...",
    "maps.addressLookupFailed": "已识别坐标。这个链接里没有地址；如需自动填地址，请在设置里填写 Google Geocoding API Key。",
    "maps.openEyebrow": "打开地图",
    "maps.openTitle": "选择地图应用",
    "maps.openGoogle": "Google Maps",
    "maps.openApple": "Apple Maps",
    "spot.discardConfirm": "放弃这个还没保存的餐厅吗？",
    "confirm.actionTitle": "确认操作",
    "confirm.deleteTitle": "确认永久删除？",
    "confirm.discardTitle": "放弃未保存的更改？",
    "confirm.discardMessage": "你的更改尚未保存，放弃后无法恢复。",
    "confirm.signOutTitle": "确认退出登录？",
    "sidebar.myPantry": "我的美食库",
    "sidebar.smartLists": "智能分类",
    "sidebar.builtFromMap": "根据你的地图生成",
    "sidebar.customLists": "自定义清单",
    "sidebar.savedRoutes": "你的收藏路线",
    "sidebar.signInLists": "登录后可管理清单。",
    "sidebar.noLists": "还没有自定义清单。",
    "sidebar.dataTools": "数据工具",
    "button.newSpot": "+ 新餐厅",
    "button.addToMyList": "+ 加入我的列表",
    "button.pasteAdd": "粘贴并添加",
    "button.export": "导出",
    "button.import": "导入",
    "button.resetDemo": "重置演示",
    "button.details": "详情",
    "button.edit": "编辑",
    "button.share": "分享",
    "button.delete": "删除",
    "button.remove": "移除",
    "button.save": "保存",
    "button.cancel": "取消",
    "button.continue": "继续",
    "button.discard": "放弃更改",
    "button.signOut": "退出登录",
    "button.copy": "复制",
    "button.copied": "已复制",
    "button.map": "地图",
    "button.google": "Google",
    "button.add": "添加",
    "button.done": "完成",
    "button.close": "关闭",
    "button.openMap": "在地图打开",
    "button.openMaps": "打开地图",
    "button.createList": "创建清单",
    "button.updateList": "更新清单",
    "button.publish": "发布",
    "button.unpublish": "取消发布",
    "button.addSpots": "添加餐厅",
    "button.deleteList": "删除清单",
    "button.copyToMyLists": "复制到我的清单",
    "button.createShareLink": "生成分享链接",
    "button.createSharePack": "创建私密推荐",
    "button.generateSharePack": "生成链接",
    "button.addSharedPack": "加入我的清单",
    "button.openImage": "打开图片",
    "button.downloadImage": "下载图片",
    "button.saveSettings": "保存设置",
    "button.addMenu": "+ 添加菜品",
    "button.saveMenu": "保存菜单",
    "button.closeAddMenu": "关闭",
    "button.addDish": "添加菜品",
    "button.replacePhoto": "替换照片",
    "button.more": "更多",
    "button.addSpotShort": "+ 添加",
    "button.pasteGoogleLink": "粘贴 Google 链接",
    "button.pasteMapLink": "粘贴地图链接",
    "mobileFilter.all": "全部",
    "mobileFilter.visited": "去过",
    "mobileFilter.want": "想去",
    "mobileFilter.favorite": "最爱",
    "mobileList.summary": "清单",
    "map.view": "地图视图",
    "map.summary": "{count} 个餐厅 · 按距离排序",
    "map.sorted": "按与你的距离排序",
    "map.summaryBrowse": "{count} 个餐厅 · 最近更新",
    "map.summaryApproximate": "{count} 个餐厅 · 大致距离",
    "map.recentlyUpdated": "按最近更新排序",
    "map.emptyTitle": "添加第一家餐厅",
    "map.emptyBody": "保存地址或地图链接后，它会出现在这张 Q 版相对地图上。",
    "map.selectedSpot": "选中餐厅",
    "map.selected": "已选中",
    "map.chooseSpot": "选择一家餐厅",
    "map.spotHint": "点击地图上的餐厅图标查看详情。",
    "map.noNotes": "还没有记录想法。",
    "map.openGoogle": "打开 Google Maps ›",
    "map.openMaps": "打开地图 ›",
    "map.noMatches": "没有匹配餐厅",
    "map.zoomOut": "缩小",
    "map.zoomIn": "放大",
    "map.center": "回到我的位置",
    "map.zoomReset": "重置缩放",
    "count.places": "{count} 个地点",
    "count.spots": "{count} 个餐厅",
    "count.copies": "{count} 次复制",
    "count.visits": "{count} 次访问",
    "sort.nearest": "距离最近",
    "sort.recent": "最近更新",
    "status.visited": "去过",
    "status.want_to_go": "想去",
    "status.favorite": "最爱",
    "status.unknown": "未知",
    "status.liked": "喜欢",
    "status.tried": "尝过",
    "visibility.public": "公开",
    "visibility.private": "私密",
    "distance.pending": "等待定位",
    "system.all.title": "全部餐厅",
    "system.all.eyebrow": "全部",
    "system.all.description": "地图上保存的所有餐厅。",
    "system.visited.title": "去过",
    "system.visited.eyebrow": "已经吃过",
    "system.visited.description": "已经尝试过的餐厅。",
    "system.want_to_go.title": "想去",
    "system.want_to_go.eyebrow": "下一站",
    "system.want_to_go.description": "等待第一次拜访的餐厅。",
    "system.favorite.title": "最爱",
    "system.favorite.eyebrow": "喜欢",
    "system.favorite.description": "你最喜欢的餐厅合集。",
    "list.smart": "智能分类",
    "list.custom": "自定义清单",
    "list.publicCustom": "公开自定义清单",
    "list.public": "公开清单",
    "list.private": "私密清单",
    "list.choose": "选择清单",
    "list.chooseDescription": "从左侧选择一个自定义清单来查看餐厅。",
    "list.customDescription": "由你保存的餐厅组成的自定义分类。",
    "list.noDescription": "还没有描述。",
    "list.updated": "更新于 {date}",
    "list.manage": "管理",
    "list.noSmartSpots": "这个智能分类里还没有餐厅。",
    "list.noSearchResults": "没有匹配的餐厅。",
    "list.empty": "这个清单还是空的。请从你的地图添加餐厅。",
    "list.needSignIn": "从左侧选择智能分类，或登录后管理自定义清单。",
    "list.createThenAdd": "先创建一个清单，再从地图添加餐厅。",
    "list.newMode": "新清单",
    "list.editMode": "编辑清单",
    "list.createTitle": "创建清单",
    "list.editTitle": "编辑清单",
    "list.defaultPrivate": "清单默认私密；发布后才会出现在 Discovery。",
    "list.editHelp": "修改会立即影响我的清单；公开清单会同步更新发现页展示。",
    "list.titleRequired": "请输入清单标题。",
    "list.saving": "正在保存...",
    "list.publishNeedsSpot": "至少添加一家餐厅后才能发布。",
    "list.deleteConfirm": "删除清单「{title}」吗？餐厅记录不会被删除。",
    "list.selectFirst": "请先选择一个清单。",
    "list.inThisList": "已在此清单",
    "list.noRestaurantMatches": "没有匹配餐厅。",
    "discovery.communityPicks": "社区精选",
    "discovery.title": "美食发现",
    "discovery.body": "探索 Gourmet Map 社区分享的公开口味地图。",
    "discovery.sortLabel": "Discovery 排序",
    "discovery.popular": "热门",
    "discovery.recent": "最新",
    "discovery.publicLists": "公开清单",
    "discovery.publishedBy": "由美食探索者发布",
    "discovery.noSearch": "没有匹配的公开清单。",
    "discovery.trySearch": "换个搜索词，在这里打开公开清单。",
    "discovery.signIn": "发现页只展示公开清单。登录后可以发布你的清单。",
    "discovery.privateHidden": "私密清单会保持隐藏，直到拥有者发布。",
    "discovery.createList": "还没有公开清单。先创建自定义清单、添加餐厅，然后发布。",
    "discovery.publishedOpen": "有人分享公开清单后会显示在这里。",
    "discovery.readyToPublish": "还没有公开清单。「{title}」已经可以发布。",
    "discovery.publishHelp": "打开你的清单，准备好后用 管理 > 发布 进行发布。",
    "discovery.addSpots": "还没有公开清单。发布前请先给自定义清单添加餐厅。",
    "discovery.needsSpot": "清单至少需要一家餐厅才会出现在 Discovery。",
    "discovery.publicPick": "公开精选",
    "discovery.byOwner": "来自 {name}",
    "discovery.foodie": "美食用户",
    "discovery.noVisible": "这个公开清单没有可见餐厅。",
    "discovery.addressHidden": "地址未分享",
    "discovery.loading": "正在加载公开清单...",
    "modal.closeDetails": "关闭详情",
    "detail.journal": "餐厅日志",
    "detail.restaurant": "餐厅",
    "detail.review": "我的评价",
    "detail.reviewTitle": "餐厅评价",
    "detail.status": "状态",
    "detail.rating": "评分",
    "detail.visitCount": "去过次数",
    "detail.notes": "我的想法",
    "detail.notesPlaceholder": "写下这家店适合什么场景、想再点什么、有没有避雷。",
    "detail.autosave": "修改后会自动保存餐厅评价。",
    "detail.demo": "演示模式可查看；登录后可以保存评价、菜单和图片。",
    "detail.signInAutosave": "登录后会自动保存餐厅评价。",
    "detail.autosavingReview": "正在自动保存餐厅评价...",
    "detail.reviewSaved": "已自动保存餐厅评价。",
    "detail.menuNotes": "菜单记录",
    "detail.menuTitle": "菜单记录",
    "detail.dishName": "菜品名称",
    "detail.dishNotes": "菜品想法",
    "detail.dishNotesPlaceholder": "这道菜的感想",
    "detail.uploadPhoto": "上传照片",
    "detail.uploadHint": "点击上传或拖拽图片到这里",
    "detail.noMenu": "还没有菜单记录。添加第一道菜后，可以给它评分、上传图片、写感想。",
    "detail.noDishNotes": "还没有记录这道菜的感想。",
    "detail.cancelledDish": "已取消新增菜单。",
    "detail.deletedDish": "已删除菜单。",
    "detail.dishRequired": "菜品名称不能为空。",
    "detail.addingMenu": "正在添加菜单...",
    "detail.addedMenu": "已添加菜单。",
    "detail.savingMenu": "正在保存菜单...",
    "detail.menuSaved": "已自动保存菜单。",
    "detail.uploading": "正在上传图片...",
    "detail.uploaded": "已上传图片。",
    "detail.deleteDishConfirm": "删除这道菜吗？",
    "spot.newMode": "新餐厅",
    "spot.editMode": "编辑餐厅",
    "spot.saveTitle": "保存餐厅",
    "spot.editTitle": "编辑餐厅",
    "spot.saveButton": "保存餐厅",
    "spot.updateButton": "更新餐厅",
    "spot.editHelp": "可以更新店铺记录，也可以在下方维护菜品和图片。",
    "spot.name": "店名",
    "spot.namePlaceholder": "自动识别，或手动输入店名",
    "spot.address": "地址",
    "spot.addressPlaceholder": "可选：手动记录地址",
    "spot.googleUrl": "地图链接",
    "spot.googleUrlPlaceholder": "粘贴 Google Maps 或 Apple Maps 链接，自动识别店名、地址和坐标",
    "spot.lat": "纬度",
    "spot.lng": "经度",
    "spot.coordPlaceholder": "自动填入",
    "spot.notes": "想法",
    "spot.notesPlaceholder": "汤底浓郁，适合下班后一个人慢慢吃。",
    "spot.dishes": "菜品",
    "spot.dishRecords": "菜品记录",
    "spot.dishPlaceholder": "菜品名称，例如 Black Garlic Tonkotsu",
    "spot.noDishes": "还没有菜品记录。",
    "spot.dishNameRequired": "请输入菜品名称。",
    "spot.deleteDishConfirm": "删除这个菜品吗？",
    "spot.deleteConfirm": "确定删除「{name}」吗？\n\n这会同时删除这家店的菜单和图片记录。",
    "spot.untitled": "未命名餐厅",
    "share.mode": "分享",
    "share.title": "分享这家餐厅",
    "share.help": "选择这次要推荐给朋友的菜品，然后生成分享链接。",
    "share.noDishes": "这家店还没有菜品。可以先编辑店铺添加菜品，再分享。",
    "share.link": "分享链接",
    "share.linkPlaceholder": "生成后显示链接",
    "sharePack.mode": "私密分享",
    "sharePack.title": "创建私密推荐",
    "sharePack.help": "选择要推荐的餐厅和菜品，然后生成私密链接和二维码。",
    "sharePack.nameLabel": "标题",
    "sharePack.namePlaceholder": "周末拉面推荐",
    "sharePack.descriptionLabel": "说明",
    "sharePack.descriptionPlaceholder": "为什么推荐这些店",
    "sharePack.link": "私密链接",
    "sharePack.qrAlt": "分享二维码",
    "sharePack.cardAlt": "推荐分享图",
    "sharePack.historyTitle": "我的私密推荐",
    "sharePack.historyEyebrow": "私密历史",
    "sharePack.historyHelp": "你从 Discovery 生成过的链接和推荐图。",
    "sharePack.noHistory": "还没有私密推荐。",
    "sharePack.openPreview": "打开预览",
    "sharePack.imageAction": "图片",
    "sharePack.previewAction": "预览",
    "sharePack.privacyNotice": "拿到链接或二维码的人都可以查看你选择的餐厅、菜品、地址和备注。",
    "sharePack.revokeAction": "撤销",
    "sharePack.revokeConfirm": "撤销“{title}”吗？链接、二维码和图片都会失效。",
    "sharePack.revoked": "私密推荐已撤销。",
    "sharePack.noSpots": "至少添加一家餐厅后才能创建推荐。",
    "sharePack.chooseOne": "请至少选择一家餐厅。",
    "sharePack.generated": "私密链接和二维码已生成。",
    "sharePack.routeMissing": "后端还没有加载私密推荐功能。请重启或部署最新后端后再试。",
    "sharePack.saved": "已复制到你的 My Lists。",
    "sharePack.previewEyebrow": "私密推荐",
    "sharePack.byOwner": "来自 {name} 的推荐",
    "sharePack.empty": "这个推荐里没有可见餐厅。",
    "sharePack.addedSource": "来自私密推荐。",
    "recipes.eyebrow": "自己做的菜",
    "recipes.title": "我的菜谱",
    "recipes.body": "记录自己做过的菜、照片、食材和做法。",
    "recipes.addTitle": "添加菜谱",
    "recipes.emptyTitle": "添加第一道菜谱",
    "recipes.emptyBody": "记录一道你做过的菜，之后可以补照片、食材和步骤。",
    "recipes.newMode": "新菜谱",
    "recipes.editMode": "编辑菜谱",
    "recipes.formTitle": "保存菜谱",
    "recipes.editTitle": "编辑菜谱",
    "recipes.name": "菜名",
    "recipes.namePlaceholder": "番茄鸡蛋面",
    "recipes.rating": "评分",
    "recipes.cookedAt": "做菜日期",
    "recipes.uploadPhoto": "上传照片",
    "recipes.currentPhoto": "当前照片。上传新图片可替换。",
    "recipes.ingredients": "食材",
    "recipes.ingredientsPlaceholder": "鸡蛋、番茄、面条、葱...",
    "recipes.steps": "做法",
    "recipes.stepsPlaceholder": "写下简单步骤，方便下次复刻。",
    "recipes.notes": "备注",
    "recipes.notesPlaceholder": "下次想调整什么？",
    "recipes.formHelp": "菜谱默认私密；生成分享链接后，拿到链接的人可以查看。",
    "recipes.save": "保存菜谱",
    "recipes.update": "更新菜谱",
    "recipes.saved": "菜谱已保存。",
    "recipes.deleted": "菜谱已删除。",
    "recipes.deleteConfirm": "删除菜谱「{title}」吗？",
    "recipes.shareEyebrow": "菜谱分享",
    "recipes.shareTitle": "分享这个菜谱",
    "recipes.shareHelp": "生成公开预览链接、二维码和分享图片。",
    "recipes.shareLink": "菜谱链接",
    "recipes.generateShare": "生成链接",
    "recipes.generated": "菜谱分享链接和图片已生成。",
    "recipes.cardAlt": "菜谱分享图",
    "recipes.previewEyebrow": "家常菜谱",
    "recipes.byOwner": "来自 {name} 的菜谱",
    "recipes.saveShared": "保存到我的菜谱",
    "recipes.savedShared": "已保存到我的菜谱。",
    "recipes.noIngredients": "还没有记录食材。",
    "recipes.noSteps": "还没有记录做法。",
    "listForm.titleLabel": "标题",
    "listForm.descriptionLabel": "描述",
    "listForm.descriptionPlaceholder": "记录这组餐厅适合什么场景。",
    "listForm.coverLabel": "封面 URL（可选）",
    "listForm.coverPlaceholder": "不填时自动使用清单内菜品图片",
    "manageSpots.mode": "管理餐厅",
    "manageSpots.title": "管理餐厅",
    "manageSpots.search": "搜索餐厅",
    "manageSpots.searchPlaceholder": "搜索你的地图...",
    "manageSpots.help": "已加入的餐厅可从这里移除；餐厅记录本身不会被删除。",
    "settings.mode": "设置",
    "settings.title": "Google API",
    "settings.keyLabel": "Google Geocoding API Key",
    "settings.help": "Google Geocoding API Key 可在 Maps 链接只有坐标时自动补全地址。",
    "settings.saved": "Google API 设置已保存。",
    "settings.connectedEyebrow": "AI 访问",
    "settings.connectedTitle": "已连接的 AI 应用",
    "settings.connectedHelp": "查看或撤销可以访问 FoodieMap 的 AI Agent。",
    "settings.connectedEmpty": "还没有连接 AI 应用。",
    "settings.revoke": "撤销",
    "settings.revokeConfirm": "撤销 {name} 的访问权限？",
    "import.cloudOnly": "云端版本暂不导入本地 JSON。",
    "reset.cloudOnly": "登录后数据保存在云端，不使用 Reset Demo。",
    "limit.free": "免费账号最多可保存 {limit} 家餐厅。你当前有 {count} 家。",
    "limit.freeFull": "免费账号已达到上限：{count}/{limit} 家餐厅。",
    "admin.eyebrow": "后台",
    "admin.title": "用户管理",
    "admin.description": "管理账号访问、套餐和免费账号存储限制。",
    "admin.loginEyebrow": "后台",
    "admin.loginTitle": "管理员登录",
    "admin.loginDescription": "使用服务器环境变量配置的固定管理员用户名和密码登录。",
    "admin.username": "用户名",
    "admin.usernamePlaceholder": "admin",
    "admin.password": "密码",
    "admin.passwordPlaceholder": "管理员密码",
    "admin.loginButton": "登录后台",
    "admin.logout": "退出后台",
    "admin.loginHelp": "使用 .env 里的 ADMIN_USERNAME 和 ADMIN_PASSWORD。",
    "admin.loginMissing": "请输入管理员用户名和密码。",
    "admin.notConfigured": "这个服务器尚未配置管理员登录。",
    "admin.refresh": "刷新",
    "admin.search": "搜索用户",
    "admin.searchPlaceholder": "邮箱或姓名",
    "admin.status": "状态",
    "admin.plan": "套餐",
    "admin.allStatuses": "全部状态",
    "admin.allPlans": "全部套餐",
    "admin.statusActive": "正常",
    "admin.statusSuspended": "暂停",
    "admin.statusDeleted": "已删除",
    "admin.planFree": "免费",
    "admin.planPaid": "付费",
    "admin.loading": "正在加载用户...",
    "admin.noAccess": "需要管理员权限。",
    "admin.noUsers": "没有符合筛选条件的用户。",
    "admin.loaded": "已加载 {count} 个用户。",
    "admin.created": "创建于 {date}",
    "admin.updated": "更新于 {date}",
    "admin.restaurants": "{count} 家餐厅",
    "admin.lists": "{count} 个清单",
    "admin.publicLists": "{count} 个公开",
    "admin.limit": "额度 {count}/{limit}",
    "admin.authMethods": "登录：{methods}",
    "admin.methodGoogle": "Google",
    "admin.methodPassword": "密码",
    "admin.methodEmailCode": "邮箱验证码",
    "admin.unlimited": "不限量",
    "admin.makePaid": "设为付费",
    "admin.makeFree": "设为免费",
    "admin.suspend": "暂停",
    "admin.reactivate": "恢复",
    "admin.softDelete": "软删除",
    "admin.restore": "还原",
    "admin.confirmSuspend": "暂停 {email} 吗？该用户在恢复前无法继续使用。",
    "admin.confirmReactivate": "恢复 {email} 吗？",
    "admin.confirmDelete": "软删除 {email} 吗？数据会保留，并可恢复。",
    "admin.confirmRestore": "还原 {email} 吗？",
    "admin.confirmPlan": "把 {email} 设置为{plan}套餐吗？",
    "admin.roleAdmin": "管理员",
    "admin.you": "你",
  },
};

let currentLanguage = getInitialLanguage();

function getInitialLanguage() {
  try {
    const stored = localStorage.getItem(LANGUAGE_KEY);
    return stored === "zh" ? "zh" : "en";
  } catch {
    return "en";
  }
}

function t(key, params = {}) {
  const dictionary = translations[currentLanguage] || translations.en;
  const fallback = translations.en[key] || key;
  return String(dictionary[key] || fallback).replace(/\{(\w+)\}/g, (_, name) => params[name] ?? "");
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
let activeFilter = "all";
let selectedRestaurantId = null;
let isSpotCardOpen = false;
let spotCardDragStart = null;
let suppressNextSpotCardOutsideClick = false;
let addDialogDragStart = null;
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
let mapPan = { x: 0, y: 0 };
let mapPanDrag = null;
let mapGestureStartZoom = null;
let isDetailAddDishOpen = false;
let activeDetailRestaurantId = null;
let detailCloseTimer = null;
let detailClosePointerAt = null;
let recipeDialogDragStart = null;
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
    const [loadedLocationCore, loadedUiCore, loadedUiShell, loadedUiDialogs, loadedUiComponents, loadedDataClient, loadedDomainCore, loadedViewTemplates, loadedListViewTemplates] = await Promise.all([
      import(LOCATION_CORE_URL),
      import(UI_CORE_URL),
      import(UI_SHELL_URL),
      import(UI_DIALOGS_URL),
      import(UI_COMPONENTS_URL),
      import(DATA_CLIENT_URL),
      import(DOMAIN_CORE_URL),
      import(VIEW_TEMPLATES_URL),
      import(LIST_VIEW_TEMPLATES_URL)
    ]);
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
  elements.restaurantModalHead?.addEventListener("pointerdown", startAddDialogSwipeClose);
  elements.restaurantDragHandle?.addEventListener("pointerdown", startAddDialogSwipeClose);
  elements.restaurantForm?.addEventListener("pointermove", moveAddDialogSwipeClose);
  elements.restaurantForm?.addEventListener("pointerup", finishAddDialogSwipeClose);
  elements.restaurantForm?.addEventListener("pointercancel", cancelAddDialogSwipeClose);
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
  elements.cuteMap.addEventListener("wheel", handleMapWheel, { passive: false });
  elements.cuteMap.addEventListener("pointerdown", startMapPan);
  elements.cuteMap.addEventListener("pointermove", moveMapPan);
  elements.cuteMap.addEventListener("pointerup", finishMapPan);
  elements.cuteMap.addEventListener("pointercancel", cancelMapPan);
  elements.cuteMap.addEventListener("gesturestart", startMapGestureZoom);
  elements.cuteMap.addEventListener("gesturechange", changeMapGestureZoom);
  elements.cuteMap.addEventListener("gestureend", endMapGestureZoom);
  elements.mapZoomOut.addEventListener("click", () => setMapZoom(mapZoom - MAP_ZOOM_STEP));
  elements.mapZoomIn.addEventListener("click", () => setMapZoom(mapZoom + MAP_ZOOM_STEP));
  elements.mapCenterButton?.addEventListener("click", centerMapOnUser);
  elements.mapZoomReset.addEventListener("click", () => setMapZoom(1));
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
  document.querySelector("#recipeModalHead")?.addEventListener("pointerdown", startRecipeDialogSwipeClose);
  document.querySelector("#recipeDragHandle")?.addEventListener("pointerdown", startRecipeDialogSwipeClose);
  elements.recipeForm?.addEventListener("pointermove", moveRecipeDialogSwipeClose);
  elements.recipeForm?.addEventListener("pointerup", finishRecipeDialogSwipeClose);
  elements.recipeForm?.addEventListener("pointercancel", cancelRecipeDialogSwipeClose);
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
    elements.integrationList.innerHTML = integrations.length
      ? integrations.map((item) => `
        <article class="integration-item">
          <div><strong>${escapeHtml(item.client_name)}</strong><small>${escapeHtml(item.scopes.join(" · "))}</small></div>
          <button class="secondary-button danger" type="button" data-revoke-integration="${escapeAttribute(item.id)}">${escapeHtml(t("settings.revoke"))}</button>
        </article>`).join("")
      : `<p class="form-help">${escapeHtml(t("settings.connectedEmpty"))}</p>`;
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
  cancelAddDialogSwipeClose();
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

function startAddDialogSwipeClose(event) {
  if (!elements.addDialog.open || !isMobileMapViewport()) return;
  if (event.button != null && event.button !== 0) return;
  if (event.target.closest("button, input, textarea, select, a")) return;
  addDialogDragStart = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    lastY: 0,
    locked: false,
  };
  elements.restaurantForm.setPointerCapture?.(event.pointerId);
}

function moveAddDialogSwipeClose(event) {
  if (!addDialogDragStart || event.pointerId !== addDialogDragStart.pointerId) return;
  const deltaX = event.clientX - addDialogDragStart.startX;
  const deltaY = Math.max(0, event.clientY - addDialogDragStart.startY);
  if (!addDialogDragStart.locked) {
    if (deltaY < ADD_DIALOG_SWIPE_LOCK_DISTANCE && Math.abs(deltaX) < ADD_DIALOG_SWIPE_LOCK_DISTANCE) return;
    if (Math.abs(deltaX) > deltaY) {
      cancelAddDialogSwipeClose();
      return;
    }
    addDialogDragStart.locked = true;
    elements.restaurantForm.classList.add("is-dragging");
  }
  addDialogDragStart.lastY = deltaY;
  elements.restaurantForm.style.setProperty("--sheet-drag-y", `${deltaY}px`);
  event.preventDefault();
}

async function finishAddDialogSwipeClose(event) {
  if (!addDialogDragStart || event.pointerId !== addDialogDragStart.pointerId) return;
  const shouldClose = addDialogDragStart.lastY >= ADD_DIALOG_SWIPE_CLOSE_DISTANCE;
  const pointerId = addDialogDragStart.pointerId;
  addDialogDragStart = null;
  elements.restaurantForm.releasePointerCapture?.(pointerId);
  elements.restaurantForm.classList.remove("is-dragging");
  if (shouldClose) {
    if (hasUnsavedRestaurantForm() && !(await confirmAction(t("confirm.discardMessage"), {
      title: t("confirm.discardTitle"),
      confirmLabel: t("button.discard"),
      tone: "danger",
    }))) {
      resetAddDialogDragStyles();
      return;
    }
    elements.restaurantForm.classList.add("is-dismissing");
    window.setTimeout(() => closeRestaurantDialog({ force: true }), 170);
    return;
  }
  resetAddDialogDragStyles();
}

function cancelAddDialogSwipeClose() {
  addDialogDragStart = null;
  resetAddDialogDragStyles();
}

function resetAddDialogDragStyles() {
  elements.restaurantForm?.classList.remove("is-dragging", "is-dismissing");
  elements.restaurantForm?.style.removeProperty("--sheet-drag-y");
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
  return `
    <article class="dish-editor-item" data-dish-id="${dish.id}">
      ${dish.image_url ? `<img src="${escapeHtml(dish.image_url)}" alt="">` : '<div class="dish-image-placeholder">IMG</div>'}
      <div class="dish-editor-fields">
        <input data-field="name" value="${escapeAttribute(dish.name)}" />
        <div class="dish-form-grid compact">
          <select data-field="dish_status">
            <option value="liked" ${dish.dish_status === "liked" ? "selected" : ""}>${t("status.liked")}</option>
            <option value="tried" ${dish.dish_status === "tried" ? "selected" : ""}>${t("status.tried")}</option>
          </select>
          <input data-field="rating" type="number" min="0" max="5" step="0.1" value="${Number(dish.rating || 0)}" />
          <input class="dish-image-input" type="file" accept="image/jpeg,image/png,image/webp" />
        </div>
        <textarea data-field="notes" rows="2" placeholder="${escapeAttribute(t("detail.dishNotesPlaceholder"))}">${escapeHtml(dish.notes || "")}</textarea>
      </div>
      <div class="dish-editor-actions">
        <button class="secondary-button" type="button" data-dish-action="save">${t("button.save")}</button>
        <button class="secondary-button danger" type="button" data-dish-action="delete">${t("button.delete")}</button>
      </div>
    </article>
  `;
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
    ? dishes.map((dish) => `
        <label class="share-dish-item">
          <input type="checkbox" value="${dish.id}" ${dish.dish_status === "liked" ? "checked" : ""} />
          <span>${escapeHtml(dish.name)}</span>
          <small>☆ ${Number(dish.rating || 0).toFixed(1)} · ${dishStatusLabel(dish.dish_status)}</small>
        </label>
      `).join("")
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
  const dishes = restaurant.dishes ?? [];
  return `
    <article class="share-pack-option" data-share-pack-restaurant="${restaurant.id}">
      <label class="share-pack-restaurant-check">
        <input type="checkbox" data-share-pack-restaurant-check value="${restaurant.id}" />
        <span>
          <strong>${escapeHtml(restaurant.name)}</strong>
          <small>${escapeHtml(restaurant.address || statusLabel(restaurant.status))}</small>
        </span>
      </label>
      <div class="share-pack-dishes">
        ${
          dishes.length
            ? dishes.map((dish) => `
                <label>
                  <input type="checkbox" data-share-pack-dish value="${dish.id}" />
                  <span>${escapeHtml(dish.name)} · ☆ ${Number(dish.rating || 0).toFixed(1)}</span>
                </label>
              `).join("")
            : `<p>${escapeHtml(t("detail.noMenu"))}</p>`
        }
      </div>
    </article>
  `;
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
  elements.detailSpotMeta.innerHTML = `
    <span>${statusLabel(restaurant.status)}</span>
    <span>☆ ${Number(restaurant.personal_rating || 0).toFixed(1)}</span>
    <span>${t("count.visits", { count: restaurant.visit_count || 0 })}</span>
    ${distance ? `<span>${escapeHtml(distance)}</span>` : ""}
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
              <span class="dish-status-pill">${dishStatusLabel(dish.dish_status)}</span>
              <span>☆ ${Number(dish.rating || 0).toFixed(1)}</span>
            </div>
          </div>
          <div class="detail-dish-actions">
            <button class="secondary-button compact-action" type="button" data-detail-dish-action="edit">${t("button.edit")}</button>
            <button class="secondary-button compact-action danger" type="button" data-detail-dish-action="delete">${t("button.delete")}</button>
          </div>
        </div>
        <p class="detail-dish-notes-preview">${notes ? escapeHtml(notes) : t("detail.noDishNotes")}</p>
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
            <option value="liked" ${dish.dish_status === "liked" ? "selected" : ""}>${t("status.liked")}</option>
            <option value="tried" ${dish.dish_status === "tried" ? "selected" : ""}>${t("status.tried")}</option>
          </select>
          <input data-field="rating" data-detail-dish-autosave type="number" min="0" max="5" step="0.1" value="${Number(dish.rating || 0)}" />
          <label class="detail-file-dropzone compact" data-detail-file-dropzone>
            <input class="detail-dish-image-input" type="file" accept="image/jpeg,image/png,image/webp" hidden />
            <span class="detail-file-mark" aria-hidden="true">＋</span>
            <span>
              <strong>${t("button.replacePhoto")}</strong>
              <small>${t("detail.uploadHint")}</small>
            </span>
          </label>
        </div>
        <textarea data-field="notes" data-detail-dish-autosave rows="3" placeholder="${escapeAttribute(t("detail.dishNotesPlaceholder"))}">${escapeHtml(dish.notes || "")}</textarea>
        <div class="detail-dish-actions">
          <button class="secondary-button" type="button" data-detail-dish-action="done">${t("button.done")}</button>
          <button class="secondary-button danger" type="button" data-detail-dish-action="delete">${t("button.delete")}</button>
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
  const parsedLat = Number(lat);
  const parsedLng = Number(lng);
  if (Number.isFinite(parsedLat) && Number.isFinite(parsedLng) && Math.abs(parsedLat) <= 90 && Math.abs(parsedLng) <= 180) {
    return { lat: parsedLat, lng: parsedLng };
  }
  return null;
}

function parseGoogleMapsUrl(url) {
  if (!url) return null;
  if (!isGoogleMapsUrl(url)) return null;
  let decoded = safeDecode(url);
  const atMatch = decoded.match(/@(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/);
  const bangMatch = decoded.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
  const queryMatch = decoded.match(/[?&](?:q|query|destination|ll)=(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/);
  const coordinates = bangMatch || queryMatch || atMatch;
  const place = parseGoogleMapsPlace(decoded);
  if (!coordinates) return place.name || place.address ? place : null;
  return { lat: Number(coordinates[1]), lng: Number(coordinates[2]), ...place };
}

function parseAppleMapsUrl(url) {
  if (!url || !/^https?:\/\/maps\.apple\.com(?:\/|$|\?)/i.test(url)) return null;
  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch {
    return null;
  }
  const params = parsedUrl.searchParams;
  const queryCoordinates = parseCoordinatePair(params.get("q"));
  const coordinates = parseCoordinatePair(params.get("ll")) || parseCoordinatePair(params.get("sll")) || parseCoordinatePair(params.get("center")) || queryCoordinates;
  const queryText = cleanAppleMapsText(params.get("q") || "");
  const addressText = cleanAppleMapsText(params.get("address") || "");
  const result = {
    provider: "apple",
    name: queryText && !queryCoordinates && !looksLikeAddress(queryText) ? queryText : "",
    address: addressText || (queryText && looksLikeAddress(queryText) ? queryText : ""),
  };
  if (coordinates) {
    result.lat = coordinates.lat;
    result.lng = coordinates.lng;
  }
  return result.lat != null || result.lng != null || result.name || result.address ? result : null;
}

function cleanAppleMapsText(value) {
  return safeDecode(String(value || "").replace(/\+/g, " ")).replace(/\s+/g, " ").trim();
}

function parseCoordinatePair(value) {
  const match = String(value || "").match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/);
  if (!match) return null;
  const lat = Number(match[1]);
  const lng = Number(match[2]);
  return validateCoordinates(lat, lng);
}

function parseMapUrl(url) {
  return parseGoogleMapsUrl(url) || parseAppleMapsUrl(url);
}

function parseGoogleMapsName(url) {
  return parseGoogleMapsPlace(url).name;
}

function parseGoogleMapsPlace(url) {
  const pathMatch = url.match(/\/maps\/place\/([^/@?]+)/);
  const queryText = parseGoogleMapsQueryText(url);
  const dataAddress = parseGoogleMapsDataAddress(url);
  const pathPlace = pathMatch ? splitPlaceAddressText(pathMatch[1].replace(/\+/g, " ")) : {};
  const queryPlace = queryText ? splitPlaceAddressText(queryText) : {};
  return {
    name: pathPlace.name || queryPlace.name || "",
    address: pathPlace.address || dataAddress || queryPlace.address || "",
  };
}

function parseGoogleMapsQueryText(url) {
  const query = url.split("?")[1] || "";
  if (!query) return "";
  const params = new URLSearchParams(query.split("#")[0]);
  const value = params.get("query") || params.get("q") || params.get("destination") || "";
  if (!value || /^-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?$/.test(value)) return "";
  return value.replace(/\+/g, " ").trim();
}

function parseGoogleMapsDataAddress(url) {
  const match = url.match(/!2s([^!]+)/);
  if (!match) return "";
  const value = match[1].replace(/\+/g, " ").trim();
  return looksLikeAddress(value) ? value : "";
}

function splitPlaceAddressText(value) {
  const text = safeDecode(value).replace(/\s+/g, " ").trim();
  if (!text) return {};
  const parts = text.split(",").map((part) => part.trim()).filter(Boolean);
  if (parts.length >= 2 && parts.slice(1).some(looksLikeAddress)) {
    return { name: parts[0], address: parts.slice(1).join(", ") };
  }
  return { name: text };
}

function looksLikeAddress(value) {
  return /\b\d{1,6}\b/.test(value) || /\b(?:street|st|road|rd|avenue|ave|boulevard|blvd|drive|dr|lane|ln|court|ct|way|place|pl|highway|hwy|king|queen|yonge|dundas)\b/i.test(value);
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

function isGoogleMapsUrl(url) {
  return /^https?:\/\/(?:www\.google\.[^\s/]+\/maps|maps\.google\.[^\s/]+|maps\.app\.goo\.gl|goo\.gl\/maps)/i.test(url);
}

function isAppleMapsUrl(url) {
  return /^https?:\/\/maps\.apple\.com(?:\/|$|\?)/i.test(url);
}

function isResolvableMapLink(url) {
  return isGoogleMapsShortLink(url);
}

function extractGoogleMapsUrl(text) {
  return text.match(/https?:\/\/(?:www\.google\.[^\s/]+\/maps|maps\.google\.[^\s/]+|maps\.app\.goo\.gl|goo\.gl\/maps)[^\s)]*/i)?.[0] ?? "";
}

function extractAppleMapsUrl(text) {
  return text.match(/https?:\/\/maps\.apple\.com[^\s)]*/i)?.[0] ?? "";
}

function extractMapUrl(text) {
  return extractGoogleMapsUrl(text) || extractAppleMapsUrl(text);
}

function sanitizeMapUrl(value) {
  let url = String(value || "").trim();
  url = url.replace(/^[<"'“”‘’\s]+/, "");
  while (/[>"'“”‘’\s),.;:!?，。；：！？]+$/.test(url)) {
    url = url.slice(0, -1);
  }
  return url;
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
    ? ordered.map((list) => `
        <button class="list-filter-item ${activeMyListKey === `custom:${list.id}` ? "active" : ""}" type="button" draggable="true" data-sidebar-list-id="${list.id}">
          <span class="drag-handle" aria-hidden="true">⋮⋮</span>
          <span class="list-filter-text">
            <strong>${escapeHtml(list.title)}</strong>
            <small>${t("count.spots", { count: list.item_count || 0 })} · ${visibilityLabel(list.visibility)}</small>
          </span>
        </button>
      `).join("")
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
    ? ordered.map((list) => `
        <button class="list-filter-item ${activeMyListKey === `custom:${list.id}` ? "active" : ""}" type="button" data-mobile-list-id="${list.id}">
          <span class="list-filter-text">
            <strong>${escapeHtml(list.title)}</strong>
            <small>${t("count.spots", { count: list.item_count || 0 })} · ${visibilityLabel(list.visibility)}</small>
          </span>
        </button>
      `).join("")
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
    ? ordered.map((list) => `
        <button class="list-filter-item ${activeMyListKey === `custom:${list.id}` ? "active" : ""}" type="button" data-mobile-my-list-id="${list.id}">
          <span class="list-filter-text">
            <strong>${escapeHtml(list.title)}</strong>
            <small>${t("count.spots", { count: list.item_count || 0 })} · ${visibilityLabel(list.visibility)}</small>
          </span>
        </button>
      `).join("")
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
    ? recent.map((restaurant) => `
        <button class="recent-item" data-id="${restaurant.id}">
          ${restaurantThumbTemplate(restaurant)}
          <span>
            <strong>${escapeHtml(restaurant.name)}</strong>
            <small>${escapeHtml(restaurantMetaLabel(restaurant))}</small>
          </span>
        </button>
      `).join("")
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
    marker.innerHTML = `
      <span class="marker-photo">
        <img src="${escapeAttribute(restaurantImageUrl(restaurant))}" alt="">
      </span>
      <span class="marker-caption">
        <strong>${escapeHtml(shortMapName(restaurant.name))}</strong>
        <small>${escapeHtml(ready ? formatUserDistance(distance) : statusLabel(restaurant.status))}</small>
      </span>
    `;
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
  cancelRecipeDialogSwipeClose();
  elements.recipeDialog?.close();
  return true;
}

function startRecipeDialogSwipeClose(event) {
  if (!elements.recipeDialog.open || !isMobileMapViewport()) return;
  if (event.button != null && event.button !== 0) return;
  if (event.target.closest("button, input, textarea, select, a")) return;
  recipeDialogDragStart = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    lastY: 0,
    locked: false,
  };
  elements.recipeForm.setPointerCapture?.(event.pointerId);
}

function moveRecipeDialogSwipeClose(event) {
  if (!recipeDialogDragStart || event.pointerId !== recipeDialogDragStart.pointerId) return;
  const deltaX = event.clientX - recipeDialogDragStart.startX;
  const deltaY = Math.max(0, event.clientY - recipeDialogDragStart.startY);
  if (!recipeDialogDragStart.locked) {
    if (deltaY < ADD_DIALOG_SWIPE_LOCK_DISTANCE && Math.abs(deltaX) < ADD_DIALOG_SWIPE_LOCK_DISTANCE) return;
    if (Math.abs(deltaX) > deltaY) {
      cancelRecipeDialogSwipeClose();
      return;
    }
    recipeDialogDragStart.locked = true;
    elements.recipeForm.classList.add("is-dragging");
  }
  recipeDialogDragStart.lastY = deltaY;
  elements.recipeForm.style.setProperty("--sheet-drag-y", `${deltaY}px`);
  event.preventDefault();
}

async function finishRecipeDialogSwipeClose(event) {
  if (!recipeDialogDragStart || event.pointerId !== recipeDialogDragStart.pointerId) return;
  const shouldClose = recipeDialogDragStart.lastY >= ADD_DIALOG_SWIPE_CLOSE_DISTANCE;
  const pointerId = recipeDialogDragStart.pointerId;
  recipeDialogDragStart = null;
  elements.recipeForm.releasePointerCapture?.(pointerId);
  elements.recipeForm.classList.remove("is-dragging");
  if (shouldClose) {
    const closed = await closeRecipeDialog();
    if (!closed) resetRecipeDialogDragStyles();
    return;
  }
  resetRecipeDialogDragStyles();
}

function cancelRecipeDialogSwipeClose() {
  recipeDialogDragStart = null;
  resetRecipeDialogDragStyles();
}

function resetRecipeDialogDragStyles() {
  elements.recipeForm?.classList.remove("is-dragging", "is-dismissing");
  elements.recipeForm?.style.removeProperty("--sheet-drag-y");
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
  return `
    <article class="share-pack-history-card">
      <a class="share-pack-history-poster" href="${escapeAttribute(pack.card_url)}" target="_blank" rel="noreferrer" aria-label="${escapeAttribute(t("button.openImage"))}">
        <img src="${escapeAttribute(pack.card_url)}" alt="${escapeAttribute(t("sharePack.cardAlt"))}" loading="lazy" data-share-pack-card-image />
      </a>
      <div class="share-pack-history-main">
        <div>
          <strong>${escapeHtml(pack.title)}</strong>
          <small>${t("count.spots", { count: pack.item_count })} · ${formatDate(pack.created_at)}</small>
        </div>
        <p>${escapeHtml(pack.description || t("list.noDescription"))}</p>
        <div class="share-pack-history-actions">
          <button class="share-pack-history-action" type="button" data-copy-share-pack="${escapeAttribute(pack.share_url)}">${t("button.copy")}</button>
          <a class="share-pack-history-action" href="${escapeAttribute(pack.card_url)}" target="_blank" rel="noreferrer">${t("sharePack.imageAction")}</a>
          <a class="share-pack-history-action" href="${escapeAttribute(pack.share_url)}" target="_blank" rel="noreferrer">${t("sharePack.previewAction")}</a>
          <button class="share-pack-history-action danger" type="button" data-revoke-share-pack="${escapeAttribute(pack.token)}">${t("sharePack.revokeAction")}</button>
        </div>
      </div>
    </article>
  `;
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
  const isSelf = false;
  const limitLabel = user.restaurant_limit == null
    ? t("admin.unlimited")
    : t("admin.limit", { count: user.restaurant_count, limit: user.restaurant_limit });
  const authLabel = t("admin.authMethods", { methods: authMethodLabel(user.auth_methods || []) });
  const statusClass = `admin-status-${user.account_status}`;
  return `
    <article class="admin-user-row ${statusClass}" data-admin-user-id="${escapeAttribute(user.id)}">
      <div class="admin-user-main">
        <div class="admin-user-avatar">${escapeHtml(shortUserName(user))}</div>
        <div>
          <div class="admin-user-title">
            <strong>${escapeHtml(user.name || user.email)}</strong>
          </div>
          <small>${escapeHtml(user.email)}</small>
          <div class="admin-user-meta">
            <span>${t("admin.restaurants", { count: user.restaurant_count })}</span>
            <span>${t("admin.lists", { count: user.list_count })}</span>
            <span>${t("admin.publicLists", { count: user.public_list_count })}</span>
            <span>${escapeHtml(limitLabel)}</span>
            <span>${escapeHtml(authLabel)}</span>
          </div>
          <div class="admin-user-meta muted">
            <span>${t("admin.created", { date: formatDate(user.created_at) })}</span>
            <span>${t("admin.updated", { date: formatDate(user.updated_at) })}</span>
          </div>
        </div>
      </div>
      <div class="admin-user-state">
        <span class="tag-pill ${user.plan === "paid" ? "favorite" : "want_to_go"}">${adminPlanLabel(user.plan)}</span>
        <span class="tag-pill ${user.account_status === "active" ? "visited" : user.account_status === "suspended" ? "want_to_go" : "favorite"}">${adminStatusLabel(user.account_status)}</span>
      </div>
      <div class="admin-user-actions">
        <button class="secondary-button compact-action" type="button" data-admin-action="plan" data-user-id="${escapeAttribute(user.id)}" data-next-plan="${user.plan === "paid" ? "free" : "paid"}">
          ${user.plan === "paid" ? t("admin.makeFree") : t("admin.makePaid")}
        </button>
        ${
          user.account_status === "active"
            ? `<button class="secondary-button compact-action" type="button" data-admin-action="suspend" data-user-id="${escapeAttribute(user.id)}" ${isSelf ? "disabled" : ""}>${t("admin.suspend")}</button>`
            : `<button class="secondary-button compact-action" type="button" data-admin-action="reactivate" data-user-id="${escapeAttribute(user.id)}">${t("admin.reactivate")}</button>`
        }
        ${
          user.account_status === "deleted"
            ? `<button class="secondary-button compact-action" type="button" data-admin-action="restore" data-user-id="${escapeAttribute(user.id)}">${t("admin.restore")}</button>`
            : `<button class="secondary-button compact-action danger" type="button" data-admin-action="delete" data-user-id="${escapeAttribute(user.id)}" ${isSelf ? "disabled" : ""}>${t("admin.softDelete")}</button>`
        }
      </div>
    </article>
  `;
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
  const ownerName = escapeHtml(sharePackData.owner?.name || t("discovery.foodie"));
  elements.sharePackPage.innerHTML = `
    <div class="share-pack-public-head">
      <div>
        <p class="eyebrow">${t("sharePack.previewEyebrow")}</p>
        <h1>${escapeHtml(sharePackData.title)}</h1>
        <p>${escapeHtml(sharePackData.description || t("list.noDescription"))}</p>
        <div class="meta-row compact-meta">
          <span>${t("sharePack.byOwner", { name: ownerName })}</span>
          <span>${t("count.spots", { count: sharePackData.items.length })}</span>
        </div>
      </div>
      <button class="primary-button" type="button" data-add-share-pack>${t("button.addSharedPack")}</button>
    </div>
    <div class="share-pack-public-list">
      ${
        sharePackData.items.length
          ? sharePackData.items.map(sharePackPublicItemTemplate).join("")
          : emptyStateTemplate(t("sharePack.empty"), "")
      }
    </div>
  `;
  elements.sharePackPage.querySelector("[data-add-share-pack]")?.addEventListener("click", addSharedPackToMyLists);
}

function renderRecipeShareView() {
  if (!elements.recipeSharePage || activeView !== "recipe-share") return;
  if (!recipeShareData) {
    elements.recipeSharePage.innerHTML = loadingPanel(t("discovery.loading"));
    return;
  }
  const recipe = recipeShareData.recipe;
  const ownerName = escapeHtml(recipeShareData.owner?.name || t("discovery.foodie"));
  elements.recipeSharePage.innerHTML = `
    <div class="share-pack-public-head">
      <div>
        <p class="eyebrow">${t("recipes.previewEyebrow")}</p>
        <h1>${escapeHtml(recipe.title)}</h1>
        <p>${t("recipes.byOwner", { name: ownerName })}</p>
        <div class="meta-row compact-meta">
          <span>☆ ${Number(recipe.rating || 0).toFixed(1)}</span>
          <span>${recipe.cooked_at ? formatDate(recipe.cooked_at) : formatDate(recipeShareData.created_at)}</span>
        </div>
      </div>
      <button class="primary-button" type="button" data-add-recipe-share>${t("recipes.saveShared")}</button>
    </div>
    <article class="recipe-detail-card public-recipe-card">
      <img class="recipe-hero-image" src="${escapeAttribute(recipeImageUrl(recipe))}" alt="" />
      <section class="recipe-note-section">
        <p class="eyebrow">${t("recipes.ingredients")}</p>
        <p>${escapeHtml(recipe.ingredients || t("recipes.noIngredients")).replace(/\n/g, "<br />")}</p>
      </section>
      <section class="recipe-note-section">
        <p class="eyebrow">${t("recipes.steps")}</p>
        <p>${escapeHtml(recipe.steps || t("recipes.noSteps")).replace(/\n/g, "<br />")}</p>
      </section>
      ${recipe.notes ? `<section class="recipe-note-section"><p class="eyebrow">${t("recipes.notes")}</p><p>${escapeHtml(recipe.notes).replace(/\n/g, "<br />")}</p></section>` : ""}
    </article>
  `;
  elements.recipeSharePage.querySelector("[data-add-recipe-share]")?.addEventListener("click", addSharedRecipeToMyRecipes);
}

function sharePackPublicItemTemplate(item) {
  const restaurant = item.restaurant;
  if (!restaurant) return "";
  return `
    <article class="share-pack-public-card">
      ${restaurantThumbTemplate(restaurant)}
      <div class="share-pack-public-main">
        <div class="spot-row-title">
          <strong>${escapeHtml(restaurant.name)}</strong>
          <span class="tag-pill want_to_go">☆ ${Number(restaurant.personal_rating || 0).toFixed(1)}</span>
        </div>
        <small>${escapeHtml(restaurant.address || t("discovery.addressHidden"))}</small>
        ${item.note ? `<p>${escapeHtml(item.note)}</p>` : ""}
        <div class="share-pack-public-dishes">
          ${
            item.dishes.length
              ? item.dishes.map((dish) => `
                  <span>
                    ${dish.image_url ? `<img src="${escapeAttribute(dish.image_url)}" alt="">` : ""}
                    ${escapeHtml(dish.name)} · ☆ ${Number(dish.rating || 0).toFixed(1)}
                  </span>
                `).join("")
              : ""
          }
        </div>
        <button class="icon-link" type="button" data-open-map-restaurant="${restaurant.id}">${t("button.openMaps")}</button>
      </div>
    </article>
  `;
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
    ? visible.map((restaurant) => `
        <article class="add-spot-row">
          ${restaurantThumbTemplate(restaurant)}
          <div>
            <strong>${escapeHtml(restaurant.name)}</strong>
            <small>☆ ${Number(restaurant.personal_rating || 0).toFixed(1)} · ${statusLabel(restaurant.status)}${added.has(restaurant.id) ? ` · ${t("list.inThisList")}` : ""}</small>
          </div>
          <button class="secondary-button ${added.has(restaurant.id) ? "danger" : ""}" type="button" ${added.has(restaurant.id) ? `data-remove-list-spot="${restaurant.id}"` : `data-add-list-spot="${restaurant.id}"`}>
            ${added.has(restaurant.id) ? t("button.remove") : t("button.add")}
          </button>
        </article>
      `).join("")
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

function handleMapWheel(event) {
  if (event.target.closest(".spot-card, .spot-card-tab, .map-zoom-controls")) return;
  event.preventDefault();
  const delta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
  const factor = Math.exp(-delta * (event.ctrlKey ? 0.01 : 0.0018));
  setMapZoom(mapZoom * factor);
}

function startMapGestureZoom(event) {
  if (event.target.closest(".spot-card, .spot-card-tab, .map-zoom-controls")) return;
  mapGestureStartZoom = mapZoom;
  event.preventDefault();
}

function changeMapGestureZoom(event) {
  if (mapGestureStartZoom == null) return;
  event.preventDefault();
  setMapZoom(mapGestureStartZoom * Number(event.scale || 1));
}

function endMapGestureZoom(event) {
  mapGestureStartZoom = null;
  event?.preventDefault?.();
}

function startMapPan(event) {
  if (event.button != null && event.button !== 0) return;
  if (event.target.closest(".spot-card, .spot-card-tab, .map-zoom-controls, .restaurant-marker, .me-marker, a, button, input, textarea, select")) return;
  mapPanDrag = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    originX: mapPan.x,
    originY: mapPan.y,
  };
  elements.cuteMap.classList.add("is-panning");
  elements.cuteMap.setPointerCapture?.(event.pointerId);
  event.preventDefault();
}

function moveMapPan(event) {
  if (!mapPanDrag || event.pointerId !== mapPanDrag.pointerId) return;
  setMapPan(mapPanDrag.originX + event.clientX - mapPanDrag.startX, mapPanDrag.originY + event.clientY - mapPanDrag.startY);
  event.preventDefault();
}

function finishMapPan(event) {
  if (!mapPanDrag || event.pointerId !== mapPanDrag.pointerId) return;
  elements.cuteMap.releasePointerCapture?.(event.pointerId);
  cancelMapPan();
}

function cancelMapPan() {
  mapPanDrag = null;
  elements.cuteMap?.classList.remove("is-panning");
}

function centerMapOnUser() {
  setMapPan(0, 0);
}

function recenterMapPanWithinBounds() {
  setMapPan(mapPan.x, mapPan.y);
}

function setMapPan(x, y) {
  const next = clampMapPan(x, y);
  if (Math.abs(next.x - mapPan.x) < 0.5 && Math.abs(next.y - mapPan.y) < 0.5) return;
  mapPan = next;
  updateMapPanUi();
}

function clampMapPan(x, y) {
  const bounds = elements.cuteMap?.getBoundingClientRect();
  const maxX = Math.max(0, (bounds?.width || 0) * MAP_PAN_LIMIT_RATIO);
  const maxY = Math.max(0, (bounds?.height || 0) * MAP_PAN_LIMIT_RATIO);
  return {
    x: Math.max(-maxX, Math.min(maxX, x)),
    y: Math.max(-maxY, Math.min(maxY, y)),
  };
}

function updateMapPanUi() {
  elements.cuteMap?.style.setProperty("--map-pan-x", `${Math.round(mapPan.x)}px`);
  elements.cuteMap?.style.setProperty("--map-pan-y", `${Math.round(mapPan.y)}px`);
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
  return locationCore.haversineDistance(origin, destination);
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
