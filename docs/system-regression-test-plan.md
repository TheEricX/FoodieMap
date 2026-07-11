# FoodieMap System Regression Test Plan

Run this checklist after changes to shared frontend startup, navigation, auth, persistence, uploads, or deployment. A release is not ready while any P0 or P1 check fails.

## Environments

- Local isolated SQLite data directory for repeatable destructive tests.
- Staging Cloud Run with PostgreSQL, GCS, Secret Manager, and the production service account.
- Desktop Chromium at 1440×900 and mobile Chromium at 390×844.
- One real iPhone Safari pass for location permission, touch controls, OAuth, and photo upload.

Use a dedicated regression account and delete its business data after staging verification. Never run destructive checks against a real user account.

## Automated Gates

The repeatable Playwright workflow and staging safety model are documented in [automated-testing.md](automated-testing.md). Run the full local gate with:

```bash
npm run test:all
```

The P0 startup, navigation, email session, map URL persistence, privacy location, and critical mobile tap checks below are automated. Google OAuth, real iPhone permission recovery, SMTP delivery, and Cloud Run redeploy persistence remain manual release checks.

Run before browser testing:

```bash
node --test tests/location-core.test.mjs
node --check app.js
node --check location-core.mjs
python3 -m py_compile server.py scripts/migrate_sqlite_to_postgres_gcs.py
docker build .
```

Confirm these static URLs return their expected content type rather than `index.html`:

```text
/app.js              text/javascript
/location-core.mjs   text/javascript
/styles.css           text/css
/api/health           application/json
```

## P0 Startup And Navigation

- Signed-out `/` renders the login page without console errors.
- Registration or login reaches Map View.
- Desktop and mobile navigation complete `Map → Lists → Recipes → Discovery → Map` with exactly one active item.
- Browser Back/Forward and direct hashes open the corresponding view.
- A missing or invalid static asset produces an explicit startup error rather than a visually active but unbound interface.
- Refresh preserves the authenticated session, language, selected location mode, and server data.

## P0 Authentication And Persistence

- Email register, password login/logout, invalid password, and suspended account behavior.
- Google OAuth callback on staging and production domains.
- Email code and password reset when SMTP is configured.
- Phone and desktop using the same account see the same restaurants, lists, recipes, and images.
- A staging redeploy preserves PostgreSQL rows and GCS images.

## P0 Remote MCP And OAuth

- OAuth metadata, dynamic registration, PKCE S256, authorization code exchange, refresh rotation, and revocation pass.
- Cookie-only and unknown-Origin MCP requests are rejected; missing scopes cannot invoke protected tools.
- Two accounts cannot access each other's restaurants, lists, or recipes through MCP.
- Agent-created lists are private, atomic, and immediately visible in My Lists.
- Settings lists the connected AI client; revoking it causes its existing access token to return 401.
- MCP Inspector connects to the staging `/mcp` endpoint through the browser login and consent flow.

## P0 Core CRUD And Media

- Add a restaurant manually and from full/short Google Maps and Apple Maps links.
- Edit every restaurant field; Cancel discards changes and Save persists them.
- Delete requires confirmation and removes the restaurant from associated views/lists.
- Add, edit, autosave, and remove menu notes; upload JPEG/PNG/WebP and verify readback after refresh.
- Create, edit, cancel, save, publish/unpublish, add/remove spots, and delete a custom list.
- Create, edit, cancel, save, share, copy, and delete a recipe, including image upload.
- Restaurant, dish, recipe, and list ownership rules prevent cross-account modification.

## P1 Map, Location And Permissions

- First Map visit shows an inline choice and does not trigger a browser prompt automatically.
- `Not now` persists privacy browse mode after refresh.
- Privacy mode shows restaurant markers and recently updated ordering, with no YOU marker, distance rings, distance values, or center-on-user action.
- Permission Allow displays fresh distance ordering; 50m, 500m, and 2000m accuracy produce precise, approximate, and low-accuracy UI.
- Permission Deny, timeout, unavailable, unsupported browser, and OS-level location off never produce Toronto or other fallback distances.
- `How to enable` shows Safari, Chrome, or generic instructions; returning from settings retries once.
- A late geolocation callback cannot restore nearby mode after the user chooses privacy browse.
- Location coordinates do not appear in API requests, localStorage, database records, or application logs.

## P1 Lists, Discovery And Sharing

- System and custom filters produce the same restaurant set in Map and List views.
- Search, empty states, Map/Open Maps actions, and Delete versus Remove semantics remain correct.
- Publish a list, find it in Discovery, sort Popular/Recent, and copy it into another account.
- Create and revoke a Share Pack; public preview, QR/link, PNG card, and login-gated copy work.
- Restaurant share and recipe share links work signed out, then save correctly after login.
- Revoked tokens return the intended unavailable state without exposing private content.

## P1 Responsive And Interaction

- At 390×844, controls and text do not overlap or create horizontal page scrolling.
- Bottom navigation remains aligned and single-tap responsive on every primary view.
- Add/Edit dialogs fit the viewport; close, Cancel, Save, swipe-close, and unsaved-change confirmation work.
- Selected spot sheet opens/closes with one tap, outside tap, and downward swipe without activating content behind it.
- Keyboard Tab, Enter, Space, Escape, focus return, and visible focus work for dialogs and primary actions.
- English and Chinese labels fit controls and update location/recovery text immediately.

## P2 Admin, Data Tools And Failure Handling

- Admin login, search/filter, Free/Paid change, suspend/reactivate, soft delete/restore, and self-protection rules.
- Free restaurant limit blocks only the over-limit create operation.
- Export/import round trip preserves supported local data; malformed import fails safely.
- PostgreSQL, GCS, SMTP, map-link expansion, reverse geocoding, and upload failures show actionable messages without losing entered form data.
- `/api/health` reports `postgresql/gcs` on staging and production.

## Release Record

Record the commit SHA, Cloud Run revision, test account, desktop/mobile browsers, P0/P1 result, known P2 exceptions, and rollback revision in the deployment notes. Production promotion requires all P0 and P1 checks to pass.
