const LANGUAGE_KEY = "foodiemap:language";
const LIST_FILTER_ORDER_KEY = "foodiemap:list-filter-order";
const isAdminPortal = window.location.pathname.replace(/\/+$/, "") === "/admin";
const MAP_ZOOM_MIN = 0.65;
const MAP_ZOOM_MAX = 2.8;
const MAP_ZOOM_STEP = 0.18;
const MAP_PAN_LIMIT_RATIO = 0.42;
const MOBILE_VIEWPORT_QUERY = "(max-width: 900px)";
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
    "nav.map": "Map View",
    "nav.lists": "List View",
    "nav.discovery": "Discovery",
    "search.default": "Search for tasty treats...",
    "search.category": "Search spots in this category...",
    "search.discovery": "Search curated lists...",
    "language.label": "Language",
    "language.english": "English",
    "language.chinese": "中文",
    "language.short": "EN",
    "location.waiting": "Location pending",
    "location.fetching": "Getting current location...",
    "location.current": "Current location {lat}, {lng}",
    "location.denied": "Location permission is blocked. Use the browser address bar permissions menu, allow location, then click Use My Location.",
    "location.fallback": "Current location is unavailable. Using downtown Toronto for now.",
    "location.unsupported": "This browser does not support location. Using downtown Toronto for now.",
    "location.button": "Get current location",
    "settings.button": "Google API settings",
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
    "paste.help": "Copy a Google Maps link, then click Paste & Add.",
    "paste.demo": "Demo mode. Sign in to save cloud data, upload photos, and share spots.",
    "paste.shared": "A spot shared with you. Preview it here, then sign in to add it to your list.",
    "paste.noGoogleUrl": "No Google Maps link found in the clipboard.",
    "paste.duplicateConfirm": "A similar spot already exists:\n\n\"{name}\"\n{address}\nAbout {distance} from the new link coordinates.\n\nCreate a duplicate spot anyway?",
    "paste.noAddress": "No address",
    "paste.cancelledDuplicate": "Creation cancelled. Selected existing spot: {name}",
    "paste.addConfirm": "Add \"{name}\" to Want to Go?",
    "paste.added": "Added: {name}",
    "paste.backendOffline": "Backend service is not connected. Start it with python3 server.py 5174.",
    "google.help": "Copy the full Google Maps browser URL. Short share links will be expanded by the local service.",
    "google.shortExpanding": "Expanding Google Maps short link...",
    "google.shortExpanded": "Short link expanded and coordinates filled.",
    "google.coordsFound": "Coordinates detected from the Google Maps link.",
    "google.noCoords": "No coordinates found in the link. Open the short link, then copy the full Google Maps address bar URL.",
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
    "button.copy": "Copy",
    "button.copied": "Copied",
    "button.map": "Map",
    "button.google": "Google",
    "button.add": "Add",
    "button.done": "Done",
    "button.close": "Close",
    "button.openMap": "Open on Map",
    "button.createList": "Create List",
    "button.updateList": "Update List",
    "button.publish": "Publish",
    "button.unpublish": "Unpublish",
    "button.addSpots": "Add Spots",
    "button.deleteList": "Delete List",
    "button.copyToMyLists": "Copy to My Lists",
    "button.createShareLink": "Create Share Link",
    "button.saveSettings": "Save Settings",
    "button.addMenu": "+ Add Menu",
    "button.closeAddMenu": "Close",
    "button.addDish": "Add Dish",
    "button.replacePhoto": "Replace photo",
    "button.more": "More",
    "button.addSpotShort": "+ Add",
    "button.pasteGoogleLink": "Paste Google link",
    "mobileFilter.all": "All",
    "mobileFilter.visited": "Visited",
    "mobileFilter.want": "Want",
    "mobileFilter.favorite": "Favs",
    "mobileList.summary": "Lists",
    "map.view": "MAP VIEW",
    "map.summary": "{count} spots · sorted by distance from you",
    "map.sorted": "Sorted by distance from you",
    "map.emptyTitle": "Add your first restaurant",
    "map.emptyBody": "Save an address or Google Maps link, and it will appear on this playful relative map.",
    "map.selectedSpot": "SELECTED SPOT",
    "map.selected": "Selected",
    "map.chooseSpot": "Choose a restaurant",
    "map.spotHint": "Click a restaurant marker to view details.",
    "map.noNotes": "No notes yet.",
    "map.openGoogle": "Open Google Maps ›",
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
    "spot.googleUrl": "Google Maps link",
    "spot.googleUrlPlaceholder": "Paste a full Google Maps link to detect name and coordinates",
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
    "settings.help": "The MVP prefers Google Maps links and manual coordinates. A Google Geocoding API key is only needed when you enter an address without coordinates.",
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
    "nav.map": "地图视图",
    "nav.lists": "列表视图",
    "nav.discovery": "发现",
    "search.default": "搜索好吃的...",
    "search.category": "搜索当前分类里的餐厅...",
    "search.discovery": "搜索公开清单...",
    "language.label": "语言",
    "language.english": "English",
    "language.chinese": "中文",
    "language.short": "中",
    "location.waiting": "等待定位",
    "location.fetching": "正在获取当前位置...",
    "location.current": "当前位置 {lat}, {lng}",
    "location.denied": "定位权限已被浏览器拒绝。请点地址栏左侧图标 > 定位 > 允许或询问，然后再点 Use My Location。",
    "location.fallback": "暂时无法获取当前位置，使用多伦多市中心作为临时位置。",
    "location.unsupported": "浏览器不支持定位，使用多伦多市中心作为临时位置。",
    "location.button": "获取当前位置",
    "settings.button": "Google API 设置",
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
    "paste.help": "复制 Google Maps 链接后点 Paste & Add。",
    "paste.demo": "当前是演示模式。登录后可保存云端数据、上传图片和分享。",
    "paste.shared": "朋友分享给你的店铺。可以预览，登录后一键加入自己的列表。",
    "paste.noGoogleUrl": "剪贴板里没有 Google Maps 链接。",
    "paste.duplicateConfirm": "已经找到很像的餐厅：\n\n「{name}」\n{address}\n距离新链接坐标约 {distance}\n\n还要继续创建一个新的重复记录吗？",
    "paste.noAddress": "没有地址",
    "paste.cancelledDuplicate": "已取消创建，已选中现有餐厅：{name}",
    "paste.addConfirm": "添加「{name}」到想去吗？",
    "paste.added": "已添加：{name}",
    "paste.backendOffline": "后端服务未连接。请用 python3 server.py 5174 启动。",
    "google.help": "推荐复制 Google Maps 浏览器地址栏里的完整链接；短分享链接会由本地服务自动展开。",
    "google.shortExpanding": "正在展开 Google Maps 短链接...",
    "google.shortExpanded": "短链接已展开并填入坐标。",
    "google.coordsFound": "已从 Google Maps 链接识别坐标。",
    "google.noCoords": "没有从链接识别到坐标。请打开短链接后复制完整 Google Maps 地址栏链接。",
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
    "button.copy": "复制",
    "button.copied": "已复制",
    "button.map": "地图",
    "button.google": "Google",
    "button.add": "添加",
    "button.done": "完成",
    "button.close": "关闭",
    "button.openMap": "在地图打开",
    "button.createList": "创建清单",
    "button.updateList": "更新清单",
    "button.publish": "发布",
    "button.unpublish": "取消发布",
    "button.addSpots": "添加餐厅",
    "button.deleteList": "删除清单",
    "button.copyToMyLists": "复制到我的清单",
    "button.createShareLink": "生成分享链接",
    "button.saveSettings": "保存设置",
    "button.addMenu": "+ 添加菜品",
    "button.closeAddMenu": "关闭",
    "button.addDish": "添加菜品",
    "button.replacePhoto": "替换照片",
    "button.more": "更多",
    "button.addSpotShort": "+ 添加",
    "button.pasteGoogleLink": "粘贴 Google 链接",
    "mobileFilter.all": "全部",
    "mobileFilter.visited": "去过",
    "mobileFilter.want": "想去",
    "mobileFilter.favorite": "最爱",
    "mobileList.summary": "清单",
    "map.view": "地图视图",
    "map.summary": "{count} 个餐厅 · 按距离排序",
    "map.sorted": "按与你的距离排序",
    "map.emptyTitle": "添加第一家餐厅",
    "map.emptyBody": "保存地址或 Google Maps 链接后，它会出现在这张 Q 版相对地图上。",
    "map.selectedSpot": "选中餐厅",
    "map.selected": "已选中",
    "map.chooseSpot": "选择一家餐厅",
    "map.spotHint": "点击地图上的餐厅图标查看详情。",
    "map.noNotes": "还没有记录想法。",
    "map.openGoogle": "打开 Google Maps ›",
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
    "spot.googleUrl": "Google Maps 链接",
    "spot.googleUrlPlaceholder": "粘贴 Google Maps 完整链接，自动识别店名和坐标",
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
    "settings.help": "MVP 默认优先解析 Google Maps 链接和手动经纬度；只有只填地址时才需要 Google Geocoding API。",
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
let activeFilter = "all";
let selectedRestaurantId = null;
let isSpotCardOpen = false;
let spotCardDragStart = null;
let suppressNextSpotCardOutsideClick = false;
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
  languageMenu: document.querySelector("#languageMenu"),
  languageLabel: document.querySelector("#languageLabel"),
  languageOptions: document.querySelectorAll("[data-language-option]"),
  loginButton: document.querySelector("#loginButton"),
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
  mapCenterButton: document.querySelector("#mapCenterButton"),
  mapZoomReset: document.querySelector("#mapZoomReset"),
  mapZoomLabel: document.querySelector("#mapZoomLabel"),
  meMarker: document.querySelector("#meMarker"),
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
  adminRefreshButton: document.querySelector("#adminRefreshButton"),
  adminSearchInput: document.querySelector("#adminSearchInput"),
  adminStatusFilter: document.querySelector("#adminStatusFilter"),
  adminPlanFilter: document.querySelector("#adminPlanFilter"),
  adminStatusText: document.querySelector("#adminStatusText"),
  adminUserList: document.querySelector("#adminUserList"),
  adminLogoutButton: document.querySelector("#adminLogoutButton"),
};

boot();

async function boot() {
  translateStaticDom();
  bindEvents();
  if (isAdminPortal) {
    document.body.classList.add("admin-portal");
    activeView = "admin-login";
    await loadAdminSession();
    setActiveView(currentAdmin ? "admin" : "admin-login", { push: false });
    return;
  }
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
  elements.closeAddPanel.addEventListener("click", closeRestaurantDialog);
  elements.closeCard.addEventListener("click", () => {
    setSpotCardOpen(false, { render: true });
  });
  elements.spotCardTab.addEventListener("click", () => {
    setSpotCardOpen(true, { render: true });
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
  window.addEventListener("resize", recenterMapPanWithinBounds);
  [elements.sidebar, elements.mapView, elements.listsView, elements.discoveryView, elements.adminView].forEach((scrollArea) => {
    scrollArea?.addEventListener("scroll", updateTopbarElevation, { passive: true });
  });
  elements.createListButton.addEventListener("click", openCreateListDialog);
  elements.closeListDialog.addEventListener("click", () => closeListDialog());
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
  elements.googleUrlInput.addEventListener("input", autofillFromGoogleMapsUrl);
  elements.restaurantForm.addEventListener("submit", saveRestaurantFromForm);
  elements.addDishButton.addEventListener("click", addDishFromEditor);
  elements.closeShareDialog.addEventListener("click", () => elements.shareDialog.close());
  elements.shareForm.addEventListener("submit", createShareLink);
  elements.copyShareButton.addEventListener("click", copyShareLink);
  elements.exportButton.addEventListener("click", exportRestaurants);
  elements.importButton.addEventListener("click", () => alert(t("import.cloudOnly")));
  elements.resetButton.addEventListener("click", resetDemoData);
  elements.settingsButton.addEventListener("click", () => elements.settingsDialog.showModal());
  elements.closeSettings.addEventListener("click", () => elements.settingsDialog.close());
  elements.settingsForm.addEventListener("submit", (event) => {
    event.preventDefault();
    elements.settingsDialog.close();
  });
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

function closeMobileMenuDetails(element) {
  if (!element?.hasAttribute("open")) return false;
  element.removeAttribute("open");
  return true;
}

function closeMobileTransientOverlays() {
  closeMobileMenuDetails(elements.mobileMapMenu);
  closeMobileMenuDetails(elements.mobileListDrawer);
  closeMobileMenuDetails(elements.mobileMyListDrawer);
  closeOpenDetailsMenus(".manage-list-menu");
}

function closeMobileMenusFromOutside(event) {
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
    elements.formHelp.textContent = editingRestaurantId ? t("spot.editHelp") : t("google.help");
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
  const response = await fetch(path, {
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers ?? {}),
    },
  });
  if (response.status === 401) {
    throw new Error(t("api.loginRequired"));
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail || data.error || t("api.requestFailed"));
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
  elements.pasteStatus.textContent = shareToken
    ? t("paste.shared")
    : currentUser
    ? t("paste.help")
    : t("paste.demo");
}

function openAuthDialog() {
  setAuthPanel("password");
  setAuthPasswordMode("login");
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
  if (!confirm(t("auth.signOutConfirm", { email: currentUser.email }))) return;
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
  await loadRestaurants();
  await loadLists();
  await loadDiscoveryLists();
  closeAuthDialog();
  render();
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

function requireLogin() {
  if (currentUser) return true;
  if (confirm(t("auth.required"))) {
    openAuthDialog();
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

function closeRestaurantDialog() {
  elements.addDialog.close();
  resetRestaurantForm();
}

function resetRestaurantForm() {
  editingRestaurantId = null;
  elements.restaurantForm.reset();
  elements.formModeLabel.textContent = t("spot.newMode");
  elements.formTitle.textContent = t("spot.saveTitle");
  elements.saveSpotButton.textContent = t("spot.saveButton");
  elements.formHelp.textContent = t("google.help");
  elements.dishEditor.hidden = true;
  elements.dishEditorList.innerHTML = "";
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
    if (!editingRestaurantId) {
      resetRestaurantForm();
      elements.addDialog.close();
    } else {
      editingRestaurantId = data.restaurant.id;
      fillRestaurantForm(data.restaurant);
      renderDishEditor(data.restaurant);
      elements.formHelp.textContent = t("detail.menuSaved");
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
    if (!confirm(t("spot.deleteDishConfirm"))) return;
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
  if (!confirm(t("spot.deleteConfirm", { name: restaurant.name }))) return;
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
  elements.detailStatus.textContent = currentUser ? t("detail.autosave") : t("detail.demo");
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
    <span>${t("count.visits", { count: restaurant.visit_count || 0 })}</span>
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
    if (!confirm(t("detail.deleteDishConfirm"))) return;
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
    const googleUrl = extractGoogleMapsUrl(text);
    if (!googleUrl) throw new Error(t("paste.noGoogleUrl"));
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
      setSpotCardOpen(true);
      render();
      const duplicateDistance = formatDistance(haversineDistance(duplicate, { lat: parsed.lat, lng: parsed.lng }));
      confirmedCreate = confirm(
        t("paste.duplicateConfirm", { name: duplicate.name, address: duplicate.address || t("paste.noAddress"), distance: duplicateDistance }),
      );
      if (!confirmedCreate) {
        setPasteStatus(t("paste.cancelledDuplicate", { name: duplicate.name }));
        return;
      }
    }
    if (!confirmedCreate && !confirm(t("paste.addConfirm", { name }))) return;
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

async function autofillFromGoogleMapsUrl() {
  const form = elements.restaurantForm.elements;
  const googleUrl = elements.googleUrlInput.value.trim();
  if (isGoogleMapsShortLink(googleUrl)) {
        elements.formHelp.textContent = t("google.shortExpanding");
    window.clearTimeout(shortLinkResolveTimer);
    shortLinkResolveTimer = window.setTimeout(async () => {
      try {
        const parsed = await parseAnyGoogleMapsLink(googleUrl);
        form.googleUrl.value = parsed.url || googleUrl;
        form.name.value = parsed.name || form.name.value;
        form.lat.value = parsed.lat ?? form.lat.value;
        form.lng.value = parsed.lng ?? form.lng.value;
        elements.formHelp.textContent = t("google.shortExpanded");
      } catch (error) {
        elements.formHelp.textContent = error.message;
      }
    }, 450);
    return;
  }

  const parsed = parseGoogleMapsUrl(googleUrl);
  if (!parsed) {
    elements.formHelp.textContent = t("google.help");
    return;
  }
  if (parsed.name && !form.name.value.trim()) form.name.value = parsed.name;
  if (parsed.lat != null && parsed.lng != null) {
    form.lat.value = parsed.lat;
    form.lng.value = parsed.lng;
    elements.formHelp.textContent = t("google.coordsFound");
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
    throw new Error(t("google.noCoords"));
  }
  return { ...parsed, url };
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
    setFallbackLocation(t("location.unsupported"));
    return;
  }
  if ((await getLocationPermissionState()) === "denied") {
    setLocationButtonState("Retry Location");
    setFallbackLocation(LOCATION_DENIED_HELP);
    return;
  }
  setLocationButtonState("Locating...", true);
  elements.locationStatus.textContent = t("location.fetching");
  navigator.geolocation.getCurrentPosition(
    (position) => {
      currentLocation = { lat: position.coords.latitude, lng: position.coords.longitude };
      elements.locationStatus.textContent = t("location.current", { lat: currentLocation.lat.toFixed(3), lng: currentLocation.lng.toFixed(3) });
      setLocationButtonState("Use My Location");
      render();
    },
    (error) => {
      setLocationButtonState("Retry Location");
      setFallbackLocation(error.code === error.PERMISSION_DENIED ? t("location.denied") : t("location.fallback"));
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
  syncQuotaUi();
  syncFilterButtons();
  renderSidebarListFilters();
  renderMobileListFilters();
  renderMobileMyListFilters();
  renderRecentList();
  renderMarkers();
  renderSpotCard();
  renderListsView();
  renderDiscoveryView();
  renderAdminView();
  updateTopbarElevation();
}

function getInitialView() {
  if (isAdminPortal) return "admin-login";
  const hash = window.location.hash.replace("#", "");
  return ["my-map", "my-lists", "discovery"].includes(hash) ? hash : "my-map";
}

function setActiveView(view, options = {}) {
  const allowedViews = isAdminPortal ? ["admin-login", "admin"] : ["my-map", "my-lists", "discovery"];
  if (!allowedViews.includes(view)) view = isAdminPortal ? "admin-login" : "my-map";
  if (isAdminPortal && view === "admin" && !currentAdmin) view = "admin-login";
  activeView = shareToken ? "my-map" : view;
  if (!isAdminPortal && options.push !== false && window.location.hash !== `#${activeView}`) {
    window.location.hash = activeView;
  }
  if (activeView === "my-lists" && currentUser && !lists.length) {
    loadLists().then(render).catch((error) => alert(error.message));
  }
  if (activeView === "discovery" && !discoveryLists.length) {
    loadDiscoveryLists().then(render).catch((error) => alert(error.message));
  }
  if (activeView === "admin") {
    loadAdminUsers().catch((error) => {
      elements.adminStatusText.textContent = error.message;
    });
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
    "my-map": t("search.category"),
    "my-lists": t("search.category"),
    discovery: t("search.discovery"),
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
  elements.mapCategorySummary.textContent = t("map.summary", { count: meta.count });
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
  return window.matchMedia?.(MOBILE_VIEWPORT_QUERY)?.matches ?? false;
}

function getVisibleRestaurants() {
  const term = activeView === "my-map" ? elements.searchInput.value.trim().toLowerCase() : "";
  return restaurantsForActiveCategory().filter((restaurant) => !term || restaurantSearchText(restaurant).includes(term));
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
            <small>${distanceLabel(restaurant)} · ${statusLabel(restaurant.status)}</small>
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
  const distance = currentLocation ? haversineDistance(currentLocation, selected) : null;
  elements.spotName.textContent = selected.name;
  elements.spotDistance.textContent = distance == null ? t("distance.pending") : formatDistance(distance);
  elements.spotRating.textContent = `☆ ${Number(selected.personal_rating || 0).toFixed(1)}`;
  elements.spotStatus.textContent = `${statusLabel(selected.status)} · ${t("count.visits", { count: selected.visit_count || 0 })}`;
  elements.spotNotes.textContent = selected.notes || selected.address || t("map.noNotes");
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
  const sorted = [...discoveryLists].sort((a, b) => {
    if (discoverySort === "recent") return Number(b.published_at || 0) - Number(a.published_at || 0);
    return Number(b.copy_count || 0) - Number(a.copy_count || 0) || Number(b.item_count || 0) - Number(a.item_count || 0);
  });
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
  elements.discoveryDetail.innerHTML = selected ? discoveryDetailTemplate(selected) : discoveryEmptyStateTemplate(term).detail;
  elements.discoveryDetail.querySelector("[data-copy-public]")?.addEventListener("click", copyPublicList);
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
    if (!confirm(t("admin.confirmPlan", { email: user.email, plan: adminPlanLabel(nextPlan) }))) return;
    await updateAdminUser(user.id, { plan: nextPlan });
    return;
  }
  if (action === "suspend") {
    if (!confirm(t("admin.confirmSuspend", { email: user.email }))) return;
    await updateAdminUser(user.id, { account_status: "suspended" });
    return;
  }
  if (action === "reactivate") {
    if (!confirm(t("admin.confirmReactivate", { email: user.email }))) return;
    await updateAdminUser(user.id, { account_status: "active" });
    return;
  }
  if (action === "delete") {
    if (!confirm(t("admin.confirmDelete", { email: user.email }))) return;
    const data = await api(`/api/admin/users/${user.id}`, { method: "DELETE" });
    replaceAdminUser(data.user);
    return;
  }
  if (action === "restore") {
    if (!confirm(t("admin.confirmRestore", { email: user.email }))) return;
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
  const spots = sortRestaurantsByDistance(restaurantsForSystemList(definition).filter((restaurant) => restaurantSearchText(restaurant).includes(term)));
  return `
    <div class="list-view-head">
      <div>
        <p class="eyebrow">${escapeHtml(systemListEyebrow(definition))}</p>
        <h2>${escapeHtml(systemListTitle(definition))}</h2>
        <p>${escapeHtml(systemListDescription(definition))} ${escapeHtml(t("map.sorted"))}.</p>
      </div>
      <div class="list-view-meta">
        <span>${t("count.spots", { count: spots.length })}</span>
        <span>${t("sort.nearest")}</span>
      </div>
    </div>
    <div class="detail-actions system-actions compact-actions">
      <button class="outline-button" type="button" data-view-system-map>${t("button.openMap")}</button>
    </div>
    <div class="spot-row-list restaurant-list-mode">
      ${spots.length ? spots.map(systemSpotItemTemplate).join("") : emptyStateTemplate(t("list.noSmartSpots"), "")}
    </div>
  `;
}

function systemSpotItemTemplate(restaurant) {
  return restaurantRowTemplate(restaurant, {
    body: `${distanceLabel(restaurant)} · ☆ ${Number(restaurant.personal_rating || 0).toFixed(1)} · ${statusLabel(restaurant.status)} · ${t("count.visits", { count: restaurant.visit_count || 0 })}`,
    actions: `
      <button class="icon-link" type="button" data-open-spot="${restaurant.id}">${t("button.map")}</button>
      <a class="icon-link" href="${escapeAttribute(restaurant.google_url || `https://www.google.com/maps?q=${restaurant.lat},${restaurant.lng}`)}" target="_blank" rel="noreferrer">${t("button.google")}</a>
      <button class="icon-link danger-text" type="button" data-delete-spot="${restaurant.id}">${t("button.delete")}</button>
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
      setSpotCardOpen(true);
      setActiveView("my-map");
    });
  });
  elements.myListDetail.querySelectorAll("[data-delete-spot]").forEach((button) => {
    button.addEventListener("click", () => deleteRestaurantById(button.dataset.deleteSpot));
  });
}

function listCardTemplate(list, selected, mode) {
  return `
    <button class="list-card ${selected ? "selected" : ""}" type="button" data-list-id="${list.id}">
      ${coverTemplate(list)}
      <span class="list-card-body">
        <strong>${escapeHtml(list.title)}</strong>
        <small>${escapeHtml(list.description || t("list.noDescription"))}</small>
        <span class="list-meta-row">
          <span>${t("count.spots", { count: list.item_count || 0 })}</span>
          <span>${mode === "public" ? t("count.copies", { count: list.copy_count || 0 }) : visibilityLabel(list.visibility)}</span>
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
    <div class="list-view-head">
      <div>
        <p class="eyebrow">${isPublic ? t("list.public") : t("list.private")}</p>
        <h2>${escapeHtml(list.title)}</h2>
        <p>${escapeHtml(list.description || t("list.noDescription"))}</p>
      </div>
      <div class="list-view-tools">
        <div class="list-view-meta">
          <span>${t("count.spots", { count: items.length })}</span>
          <span>${t("sort.nearest")}</span>
          <span>${visibilityLabel(list.visibility)}</span>
          <span>${t("list.updated", { date: formatDate(list.updated_at) })}</span>
        </div>
        <details class="manage-list-menu">
          <summary>${t("list.manage")}</summary>
          <div class="manage-list-actions">
            <button type="button" data-list-action="edit">${t("button.edit")}</button>
            <button type="button" data-list-action="publish">${isPublic ? t("button.unpublish") : t("button.publish")}</button>
            <button type="button" data-list-action="add">${t("button.addSpots")}</button>
            <button class="danger-text" type="button" data-list-action="delete">${t("button.deleteList")}</button>
          </div>
        </details>
      </div>
    </div>
    <div class="detail-actions system-actions compact-actions">
      <button class="outline-button" type="button" data-list-action="map">${t("button.openMap")}</button>
    </div>
    <div class="spot-row-list restaurant-list-mode">
      ${items.length ? items.map((item) => ownedListItemTemplate(item)).join("") : emptyStateTemplate((list.items ?? []).length ? t("list.noSearchResults") : t("list.empty"), "")}
    </div>
  `;
}

function discoveryDetailTemplate(list) {
  return `
    <div class="detail-head public-detail">
      ${coverTemplate(list)}
      <div>
        <p class="eyebrow">${t("discovery.publicPick")}</p>
        <h2>${escapeHtml(list.title)}</h2>
        <p>${escapeHtml(list.description || t("list.noDescription"))}</p>
        <div class="meta-row compact-meta">
          <span>${t("count.spots", { count: list.item_count || 0 })}</span>
          <span>${t("count.copies", { count: list.copy_count || 0 })}</span>
          <span>${t("discovery.byOwner", { name: escapeHtml(list.owner?.name || t("discovery.foodie")) })}</span>
        </div>
      </div>
    </div>
    <button class="primary-button compact full" type="button" data-copy-public>${t("button.copyToMyLists")}</button>
    <div class="spot-row-list">
      ${(list.items ?? []).length ? sortListItemsByDistance(list.items).map((item) => publicListItemTemplate(item)).join("") : emptyStateTemplate(t("discovery.noVisible"), "")}
    </div>
  `;
}

function ownedListItemTemplate(item) {
  const restaurant = item.restaurant;
  if (!restaurant) return "";
  return restaurantRowTemplate(restaurant, {
    body: `${distanceLabel(restaurant)} · ☆ ${Number(restaurant.personal_rating || 0).toFixed(1)} · ${statusLabel(restaurant.status)} · ${t("count.visits", { count: restaurant.visit_count || 0 })}`,
    actions: `
      <button class="icon-link" type="button" data-open-spot="${restaurant.id}">${t("button.map")}</button>
      <a class="icon-link" href="${escapeAttribute(restaurant.google_url || `https://www.google.com/maps?q=${restaurant.lat},${restaurant.lng}`)}" target="_blank" rel="noreferrer">${t("button.google")}</a>
      <button class="icon-link danger-text" type="button" data-remove-list-spot="${restaurant.id}">${t("button.remove")}</button>
    `,
  });
}

function publicListItemTemplate(item) {
  const restaurant = item.restaurant;
  if (!restaurant) return "";
  return restaurantRowTemplate(restaurant, {
    body: `${distanceLabel(restaurant)} · ☆ ${Number(restaurant.personal_rating || 0).toFixed(1)} · ${escapeHtml(restaurant.address || t("discovery.addressHidden"))}`,
    actions: `
      <a class="icon-link" href="${escapeAttribute(restaurant.google_url || `https://www.google.com/maps?q=${restaurant.lat},${restaurant.lng}`)}" target="_blank" rel="noreferrer">${t("button.map")}</a>
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
      ${options.actions ? `<div class="spot-row-actions">${options.actions}</div>` : ""}
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
    closeListDialog();
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
  if (!requireLogin() || !confirm(t("list.deleteConfirm", { title: list.title }))) return;
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
  return restaurants.find((restaurant) => restaurant.id === selectedRestaurantId) ?? null;
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
  return currentLocation ? formatDistance(haversineDistance(currentLocation, restaurant)) : t("distance.pending");
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
    name: String(item.name || t("spot.untitled")),
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
    name: String(item.name || t("detail.dishName")),
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
    title: String(item.title || t("list.choose")),
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
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)} m`;
  return `${Math.round(distanceKm)} km`;
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
