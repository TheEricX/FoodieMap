# Changelog

All notable changes to this project are documented here.

This project follows a lightweight [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) style and uses semantic versioning for app-facing milestones.

## Unreleased

### Added

- Added an admin user management area for account suspension, soft deletion/restoration, manual Free/Paid plan changes, and Free account restaurant limits.
- Added email account sign-in with password login, one-time email codes, SMTP delivery, password reset, and same-email account merging with Google OAuth.
- Added a dedicated `/admin` portal with fixed username/password login from server environment variables.

### Changed

- Reworked the mobile Map View around a compact toolbar, bottom navigation, full-height map, and bottom-sheet selected spot details.
- Added a mobile custom-list drawer and flattened the selected state for mobile map filters.
- Tightened the map view layout, selected spot card, sidebar filter labels, and signed-in avatar alignment.
- Updated the Docker startup command to read Cloud Run's `PORT` environment variable instead of hard-coding `5173`.
- Discovery now excludes public lists owned by suspended or deleted accounts.
- Free users are blocked from adding restaurants once they reach the configured storage limit.
- The `Sign in` control now opens a unified auth dialog instead of going directly to Google OAuth.
- Admin access now uses a separate admin session instead of ordinary user email allowlisting.

### Fixed

- Kept the mobile custom-list drawer within the viewport, let it close on outside taps, and compacted mobile selected spot actions.
- Replaced remaining Chinese backend fallback messages with English defaults.
- Fixed hidden auth dialog fields showing in the wrong sign-in mode.

### Documentation

- Documented the desktop/mobile responsive UI split and mobile Map View placement rules.
- Added Google Cloud Run deployment notes covering build, deploy, environment variables, OAuth callback setup, logs, rollback, and storage caveats.
- Added a tracked `env.example.txt` template for local and deployment configuration.
- Clarified commit hygiene skill rules for versioned changelog sections and release handling.

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
