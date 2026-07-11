import { defineConfig, devices } from "@playwright/test";

const isStaging = process.env.E2E_TARGET === "staging";
const port = Number(process.env.E2E_PORT || 5197);
const baseURL = isStaging ? process.env.STAGING_BASE_URL : `http://127.0.0.1:${port}`;

if (isStaging && !baseURL) {
  throw new Error("STAGING_BASE_URL is required for staging tests");
}

export default defineConfig({
  testDir: "./tests/e2e",
  globalTeardown: "./tests/e2e/global-teardown.mjs",
  timeout: 30_000,
  expect: { timeout: 7_500 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["line"], ["html", { open: "never" }]] : "list",
  outputDir: "test-results",
  use: {
    baseURL,
    locale: "en-CA",
    timezoneId: "America/Toronto",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure"
  },
  webServer: isStaging ? undefined : {
    command: "sh scripts/python.sh server.py",
    url: `${baseURL}/api/health`,
    timeout: 30_000,
    reuseExistingServer: false,
    env: {
      ...process.env,
      APP_ENV: "development",
      APP_BASE_URL: baseURL,
      PORT: String(port),
      SESSION_SECRET: "e2e-local-session-secret-at-least-32-characters",
      DATA_DIR: `.playwright-data/${port}`,
      SQLITE_DATABASE_PATH: `.playwright-data/${port}/foodiemap.db`,
      UPLOAD_DIR: `.playwright-data/${port}/uploads`,
      DATABASE_URL: "",
      GCS_BUCKET: "",
      E2E_CLEANUP_TOKEN: "local-e2e-cleanup-token"
    }
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
      grepInvert: /@staging|@mobile/
    },
    {
      name: "mobile",
      use: {
        ...devices["iPhone 13"],
        browserName: "chromium",
        viewport: { width: 390, height: 844 }
      },
      grep: /@mobile|@smoke|@responsive/
    },
    {
      name: "staging",
      use: { ...devices["Desktop Chrome"] },
      grep: /@staging/
    }
  ]
});
