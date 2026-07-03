# Changelog

All notable changes to this project are documented here.

This project follows a lightweight [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) style and uses semantic versioning for app-facing milestones.

## Unreleased

### Added

- Added private Discovery share packs with selected restaurants/dishes, public preview links, saveable PNG recommendation cards, personal history, and login-gated one-click copying into My Lists.
- Added Google Maps link autofill for restaurant name, address, and coordinates, with optional Google Geocoding reverse lookup when links only include coordinates.
- Added mouse and touch panning, touchpad pinch zoom, and a one-tap control to center the relative map back on the user marker.
- Added an admin user management area for account suspension, soft deletion/restoration, manual Free/Paid plan changes, and Free account restaurant limits.
- Added email account sign-in with password login, one-time email codes, SMTP delivery, password reset, and same-email account merging with Google OAuth.
- Added a dedicated `/admin` portal with fixed username/password login from server environment variables.

### Changed

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

- Kept the mobile language switch visible and horizontally aligned with the topbar actions in Map View and List View.
- Let the mobile add-spot dialog close with a downward swipe while confirming before discarding unsaved form input.
- Made the mobile selected spot sheet close on outside taps or downward swipes without triggering controls behind it.
- Kept the mobile custom-list drawer within the viewport, let it close on outside taps, and compacted mobile selected spot actions.
- Replaced remaining Chinese backend fallback messages with English defaults.
- Fixed hidden auth dialog fields showing in the wrong sign-in mode.

### Documentation

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
