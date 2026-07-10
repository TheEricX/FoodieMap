# FoodieMap Automated Testing

This document is the operating guide for FoodieMap's repeatable regression tests. The suite uses Playwright Test for browser flows and Node's built-in test runner for the DOM-free location core.

## Test Architecture

```text
tests/location-core.test.mjs     Pure location state and calculation tests
tests/e2e/fixtures.mjs           Accounts, login, cleanup, browser diagnostics
tests/e2e/smoke.spec.mjs         Startup, assets, navigation, staging health
tests/e2e/core-flows.spec.mjs    Auth, persistence, map URL, location modes
tests/e2e/content.spec.mjs       Lists, recipes, uploads, and persisted UI
tests/e2e/mobile.spec.mjs        Touch navigation, close controls, overflow
tests/e2e/staging.spec.mjs       PostgreSQL/GCS create-upload-read-clean lifecycle
playwright.config.mjs            Local server and desktop/mobile/staging projects
```

Local E2E runs start `server.py` on port `5197` with an isolated SQLite database and uploads directory under `.playwright-data/`. The directory is ignored by Git and deleted by global teardown. Tests never read or write `data/foodiemap.db`.

Each test that needs an account creates a unique `e2e-<timestamp>-<random>@example.test` user. Its fixture deletes the account after the test. Local runs use a local cleanup token; staging reads its token from a secret.

## First-Time Setup On macOS

Install Python dependencies, Node dependencies, and the pinned browser:

```bash
python3 -m pip install -r requirements.txt
npm ci
npx playwright install chromium
```

Playwright's browser is separate from the user's installed Chrome. Re-run the install command after a Playwright version change.

## Commands

```bash
npm run test:unit         # Location unit tests and JavaScript syntax
npm run test:e2e          # Desktop Chromium E2E
npm run test:e2e:mobile   # 390x844 touch E2E and smoke tests
npm run test:all          # Unit, desktop, and mobile release gate
npm run test:e2e:ui       # Interactive Playwright test runner
npm run test:staging      # Tests tagged @staging against STAGING_BASE_URL
```

Run one test while developing:

```bash
npx playwright test tests/e2e/mobile.spec.mjs --project=mobile
npx playwright test -g "navigation" --project=desktop
```

## Debugging Failures

Failed tests retain a screenshot, video, and trace under `test-results/`. Open a trace with:

```bash
npx playwright show-trace test-results/PATH/trace.zip
```

The trace contains actions, DOM snapshots, console messages, and network requests. The shared fixture fails a test on unexpected `console.error` or uncaught page exceptions, so a visually correct screen with broken startup code still blocks release.

Use `npm run test:e2e:ui` to step through tests and inspect locators. Prefer stable IDs, `data-*` ownership identifiers, and accessible roles. Do not select elements by layout position or translated display text when a stable attribute exists.

## Staging Setup And Safety

Generate a long random cleanup token and store it only in the staging Cloud Run service and GitHub's `staging` environment:

```bash
openssl rand -hex 32
```

Required GitHub environment secrets:

```text
STAGING_BASE_URL=https://STAGING_SERVICE_URL
STAGING_E2E_CLEANUP_TOKEN=the-same-staging-only-token
```

Set `E2E_CLEANUP_TOKEN` on staging Cloud Run through Secret Manager. The `/api/test/cleanup` route does not exist when this variable is empty. Even when enabled, it requires the private header and only accepts `e2e-*@example.test` accounts. Cleanup hard-deletes the test user's relational data and removes owned dish and recipe objects from GCS.

Never configure this token on production. Never point `STAGING_BASE_URL` at production. The staging workflow is manual (`workflow_dispatch`) and does not deploy or redirect Cloud Run traffic.

## Adding Coverage

- Put pure state or calculation behavior in a Node unit test.
- Put browser behavior shared by desktop and mobile in `core-flows.spec.mjs`.
- Tag touch and responsive checks with `@mobile`.
- Tag cloud-only, non-destructive architecture checks with `@staging`.
- Use API setup when the feature under test is UI behavior; use UI setup when the creation flow itself is under test.
- Keep tests independent. Do not rely on test order or a fixed account.
- Assert persisted API/server state after save, refresh, or redeploy-sensitive operations.

## Automated Versus Manual Release Checks

Automation covers startup, navigation, email authentication, core persistence, map URL storage, privacy/nearby location modes, and critical mobile interactions. The full checklist remains in `docs/system-regression-test-plan.md`.

The following require manual verification:

- Google OAuth callback on the actual domain.
- iPhone Safari OS/browser location permission recovery.
- Picking a real photo from iOS Photos.
- SMTP code delivery and password reset email.
- Cloud Run redeploy persistence and production rollback.

## Troubleshooting

- `Executable doesn't exist`: run `npx playwright install chromium`.
- Port `5197` is occupied: stop the process or run with `E2E_PORT=5198`.
- Server cannot bind in a restricted shell: permit the command to open a local listening port.
- Test times out: inspect the trace for a dialog covering the target or an API request that did not finish.
- Cleanup fails: record the printed test email, verify staging token alignment, and do not promote the release until cleanup succeeds.
- `.playwright-data` remains after interruption: it contains test-only local data and can be deleted after confirming no test server is running.
