# Changelog

All notable changes to this project are documented here.

This project follows a lightweight [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) style and uses semantic versioning for app-facing milestones.

## Unreleased

### Changed

- Unified the mobile Map and List workspace controls, kept capture actions within the viewport, and compacted Maps and Recipe sheets for iPhone-sized screens.

### Fixed

- Fixed the mobile Recipe editor footer obscuring fields, made successful saves close reliably on Safari without duplicate updates, and added left-swipe dismissal with unsaved-change protection.
- Fixed Recipe share generation stopping before showing its link and card, and replaced the oversized mobile share controls with a compact bottom sheet.
- Fixed mobile restaurant detail navigation so an iPhone edge-back gesture closes the detail view, and made list actions easier to distinguish and tap.
- Fixed mobile restaurant-capture fields being obscured by the fixed Cancel and Save actions.
- Fixed the mobile selected-place tab visually crowding the now more compact, raised bottom navigation, and centred the three navigation destinations evenly.
- Fixed a Safari-restored confirmation sheet that could remain open without an active action, blocking every control on the page.
- Fixed restored restaurant-detail drawers blocking navigation, and kept empty-map actions clear of the mobile map toolbar.

### Added

- Added a direct Maps-link import entry point that opens a prefilled place-capture task after sign-in.

- Added responsive geometry checks across five mobile and three desktop widths plus reviewed non-empty Map visual baselines.

- Added a unified My Places workspace with Map/List switching, one-tap visited status, list-scoped private sharing, and responsive regression coverage for the simplified navigation.

- Added a self-contained development test dependency set, WebKit smoke coverage, axe accessibility scanning, and reviewed desktop/mobile visual regression baselines.
- Added shared frontend modules for responsive layout state, shell ownership, reusable state panels, accessible confirmations, and API transport without introducing a framework or build step.
- Added a shared domain model and view-template layer for restaurant, list, recipe, Discovery, and share data used by both desktop and mobile shells.
- Added a dedicated Lists/Discovery template module with desktop/mobile management-flow regression coverage.
- Added shared public-share and Admin templates with signed-out preview and user-management regression coverage.
- Added shared form and Map View template modules for connected apps, dish editors, share/list pickers, markers, filters, recent rows, and selected-spot metadata.
- Added a tested bilingual i18n module with matching English/Chinese keys, fallback behavior, and parameter interpolation.
- Added tested shared parsing for Google Maps and Apple Maps links, coordinates, short-link detection, and pasted URL cleanup.
- Added tested map geometry for marker placement, collision handling, pan limits, and stable food placeholder images.
- Added a tested map interaction controller that owns pointer pan, wheel/pinch zoom, viewport clamping, and map transform state.
- Added a tested shared mobile task swipe-dismiss controller for Restaurant and Recipe editors.
- Added an OAuth 2.1-protected remote MCP server for authorized restaurant, list, and recipe access plus private list creation, with connected-app revocation and audit metadata.
- Added repeatable Playwright desktop/mobile regression tests, isolated test accounts and data, protected staging cleanup, and GitHub Actions release gates.
- Added an optional privacy browsing map that keeps restaurant markers usable without location permission, plus a tested location state controller and permission recovery flow.
- Added Cloud SQL PostgreSQL and Google Cloud Storage production architecture support for Cloud Run deployments, including a SQLite/uploads migration script.
- Added a private Recipes tab for home-cooked dishes with photos, ingredients, steps, ratings, dates, public recipe preview links, QR codes, PNG share cards, and login-gated saving into My Recipes.
- Added private Discovery share packs with selected restaurants/dishes, public preview links, saveable PNG recommendation cards, personal history, and login-gated one-click copying into My Lists.
- Added Apple Maps link detection alongside Google Maps and a single map-opening chooser for Google Maps or Apple Maps.
- Added map link autofill for restaurant name, address, and coordinates, with optional Google Geocoding reverse lookup when links only include coordinates.
- Added mouse and touch panning, touchpad pinch zoom, and a one-tap control to center the relative map back on the user marker.
- Added an admin user management area for account suspension, soft deletion/restoration, manual Free/Paid plan changes, and Free account restaurant limits.
- Added email account sign-in with password login, one-time email codes, SMTP delivery, password reset, and same-email account merging with Google OAuth.
- Added a dedicated `/admin` portal with fixed username/password login from server environment variables.

### Changed

- Let the mobile saved-place list use natural page scrolling so its header, filters, and results share the available screen space instead of trapping scroll inside the result panel.

- Simplified place capture to one primary Add a place action, clarified recipe creation, and focused Discovery on public list exploration.

- Focused the signed-out entry screen on Google or email sign-in, added a stable startup loading gate, and made empty maps lead directly to adding a restaurant or pasting a Maps link.
- Streamlined core mobile tasks with Maps-link-first restaurant capture, compact List and Recipe creation, per-view search memory, preferred map-app selection, and direct Add to List, Add Spots, and Publish actions.
- Reworked mobile Recipe browsing into a list-to-detail flow with an explicit return path, while retaining the desktop parallel list/detail workspace.
- Introduced shared UI core rules and separate desktop/mobile navigation shells while keeping one API and content model.
- Standardized layout modes at mobile, compact desktop, and desktop breakpoints, with explicit modal, task, drawer, and sheet presentations.
- Unified Restaurant, List, and Recipe unsaved-change handling across close, cancel, desktop backdrop, and mobile swipe interactions.
- Replaced browser-native confirmation prompts with an accessible in-app confirmation surface for sign-out, delete, revoke, discard, duplicate, and admin actions.
- Moved nested API normalization, collection selection, Discovery ordering, and repeated Recipe/Restaurant/List templates out of the main frontend orchestrator.
- Moved system-list, private-list, and public Discovery details out of `app.js` while preserving shared edit, delete, map, publish, and copy action hooks.
- Moved Share Pack history, public share previews, Recipe Share previews, and Admin user rows out of the main frontend orchestrator.
- Moved repeated form controls and Map View presentation markup out of `app.js` while preserving existing API, upload, autosave, drag, selection, and action handlers.
- Moved the complete English/Chinese dictionary and translation rules out of `app.js` without changing visible copy or stored language preferences.
- Moved map-link parsing and coordinate validation out of `app.js` while keeping existing autofill, short-link resolution, and map-opening behavior.
- Moved relative-map geometry and generated food placeholders out of `app.js` while retaining the existing pointer, gesture, and zoom interactions.
- Moved relative-map pointer, gesture, zoom, and pan state out of `app.js` into a dedicated controller with explicit interactive-target exclusions.
- Consolidated Restaurant and Recipe mobile swipe dismissal, touch locking, and drag-reset behavior behind one reusable controller.

- Location is now requested only after user intent, keeps coordinates in browser memory only, reports approximate accuracy, and sorts by recent updates when distance is unavailable.
- Standardized mobile form action bars, close controls, selected spot actions, and modal button grids for more reliable touch interaction.
- Reworked Google Cloud deployment documentation around stateless Cloud Run, Cloud SQL, GCS, Secret Manager, migration, and post-deploy verification.
- Centered the desktop Recipes and Discovery content rail after removing the restaurant sidebar, and aligned the Recipe photo upload control with the existing drag-and-drop upload UI.
- Compacted the mobile single-restaurant share and map-choice dialogs to remove excess whitespace and keep actions visible.
- Moved the add-spot Maps link field to the top of the form so paste-first autofill is the primary flow.
- Added an inline Maps link hint explaining that pasted links auto-detect restaurant name and location.
- Added a compact mobile custom-list create button inside the Map/List list drawer.
- Added a privacy notice and owner-only revoke action for private Share Packs so shared links, QR codes, and card images can be invalidated.
- Added an initial signed-out login page while keeping public share links viewable without an account.
- Compacted mobile menu-note entry and saved dish cards so Add Menu and menu lists match the denser List View layout.
- Reworked the mobile Discovery view to use the same fixed-height mobile shell, compact topbar, internal scrolling, and bottom-navigation spacing as Map View and List View.
- Compacted the mobile sign-in dialog with smaller actions, tighter tabs, and shorter form fields.
- Let the mobile List View use the space behind the floating bottom navigation while preserving bottom scroll padding.
- Upgraded the mobile List View to match the compact Map View layout with in-page list filters and a scrollable detail panel.
- Reworked the mobile Map View around a compact toolbar, bottom navigation, full-height map, and bottom-sheet selected spot details.
- Added a mobile custom-list drawer and flattened the selected state for mobile map filters.
- Tightened the map view layout, selected spot card, sidebar filter labels, and signed-in avatar alignment.
- Updated the Docker startup command to read Cloud Run's `PORT` environment variable instead of hard-coding `5173`.
- Discovery now excludes public lists owned by suspended or deleted accounts.
- Free users are blocked from adding restaurants once they reach the configured storage limit.
- The `Sign in` control now opens a unified auth dialog instead of going directly to Google OAuth.
- Admin access now uses a separate admin session instead of ordinary user email allowlisting.

### Fixed

- Fixed iOS Google Maps shared-address parsing so the restaurant name is not mistaken for a province or region, and tightened iPhone confirmation, location-prompt, and selected-place-sheet layout.

- Replaced the ambiguous empty Favorites map with clear guidance, a one-tap return to all saved places, and a mobile layout that keeps category controls available when a filter has no results.

- Prevented mobile saved-place filters from overlapping list actions or restaurant cards, and corrected navigation/localization smoke assertions for the unified My Places workspace.

- Removed duplicated mobile Map/List controls, restored readable category layout, and reduced mobile map chrome, marker density, and selected-spot obstruction.

- Made the OAuth end-to-end test use its active local test URL instead of a hard-coded port.

- Prevented E2E account cleanup from racing with pending page requests, eliminating teardown-only unauthorized-console failures.
- Kept empty-map restaurant actions above the transparent marker layer so they remain tappable on mobile, with responsive regression coverage for the new entry and capture flows.
- Kept hidden mobile toasts out of the layout, reset Discovery's inner scroll when re-entering the view, and prevented its empty Public Lists panel from drifting horizontally.
- Standardized success and recoverable-error feedback through an in-app toast, and reinforced narrow-screen content alignment and horizontal overflow coverage.
- Removed an unmatched closing element from selected-spot dish pills so mobile and desktop browsers build the same DOM structure.
- Added a compact medium-desktop topbar layout so search, location controls, and the signed-in avatar remain inside the viewport near responsive breakpoints.
- Locked create/edit dialogs to the visual viewport across the full narrow-screen breakpoint, removed horizontal form scrolling and textarea resizing, and limited backdrop-to-close behavior to desktop.
- Rendered recipe empty-state guidance as clearly differentiated text instead of a non-functional button.
- Prevented horizontal page drift across all narrow-screen views and constrained the selected-spot sheet to vertical touch scrolling.
- Aligned sharing actions into equal-width columns and compacted sticky mobile form actions across create/edit dialogs.
- Closed the restaurant editor after a successful update and cleared stale selected spots when switching to an empty category.
- Removed the hidden downtown Toronto fallback that produced plausible but incorrect restaurant distances when browser location failed.
- Made the Restaurant Journal close control respond to a single mobile tap while preserving mouse and keyboard activation.
- Open saved Google Maps and Apple Maps links directly when available instead of replacing them with coordinate-only map searches.
- Made pasted map short links trigger autofill more reliably and use resolved Google Maps page metadata as a fallback for name and coordinates.
- Kept the mobile language switch visible and horizontally aligned with the topbar actions in Map View and List View.
- Let the mobile add-spot dialog close with a downward swipe while confirming before discarding unsaved form input.
- Made the mobile selected spot sheet close on outside taps or downward swipes without triggering controls behind it.
- Kept the mobile custom-list drawer within the viewport, let it close on outside taps, and compacted mobile selected spot actions.
- Replaced remaining Chinese backend fallback messages with English defaults.
- Fixed hidden auth dialog fields showing in the wrong sign-in mode.

### Documentation

- Added a mobile UI audit with responsive acceptance criteria and documented saved-place-list visual and geometry regression coverage.

- Added the remote MCP server setup, authorization, client connection, security, testing, and Cloud Run deployment guide.
- Added an automated testing operations guide covering local commands, staging secrets, diagnostics, data cleanup, CI, and extension patterns.
- Added a full-system regression test plan covering navigation, auth, CRUD, media, sharing, permissions, responsive layout, and production persistence.
- Documented the desktop/mobile responsive UI split and mobile Map View placement rules.
- Added Google Cloud Run deployment notes covering build, deploy, environment variables, OAuth callback setup, logs, rollback, and storage caveats.
- Added a tracked `env.example.txt` template for local and deployment configuration.
- Clarified commit hygiene skill rules for versioned changelog sections and release handling.

### Internal

- Centralized mobile overlay closing and selected spot sheet state helpers ahead of List View and Discovery mobile work.
- Added explicit Cloud Build ignore rules for local environment files and runtime data.

## [0.4.0] - 2026-06-22

### Added

- Added English/Chinese language switching with English as the default and a topbar globe menu.
- Added a repo-local Codex skill for pre-commit documentation checks.
- Added Discovery empty-state guidance that points users toward login, list creation, adding spots, or manually publishing an eligible private list.
- Added row-level restaurant removal actions in List View: system categories can delete restaurant records, while custom lists can remove restaurants from that list only.

### Changed

- Unified system categories and custom lists around the same Map View and List View reading experience.
- Moved custom list management actions into the List View `Manage` menu.
- Updated custom list and system category row actions so `Map` and `Google` stay consistent across list types.

### Fixed

- Aligned the topbar language switch with the other icon actions.

### Documentation

- Updated README usage notes for Map/List category behavior, Discovery publishing, and the difference between `Delete` and `Remove`.
