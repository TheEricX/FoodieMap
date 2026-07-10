import { test as base, expect } from "@playwright/test";

function uniqueAccount() {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  return {
    email: `e2e-${suffix}@example.test`,
    password: "FoodieMap-E2E-Password-2026!",
    name: `E2E ${suffix}`
  };
}

export const test = base.extend({
  browserErrors: [async ({ page }, use) => {
    const errors = [];
    page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(`console: ${message.text()}`);
    });
    await use(errors);
    expect(errors, `Unexpected browser errors:\n${errors.join("\n")}`).toEqual([]);
  }, { auto: true }],

  account: async ({ request, baseURL }, use, testInfo) => {
    const account = uniqueAccount();
    const register = await request.post("/auth/email/register", {
      data: account
    });
    expect(register.ok(), await register.text()).toBeTruthy();
    await use(account);

    const cleanupToken = testInfo.project.name === "staging"
      ? process.env.STAGING_E2E_CLEANUP_TOKEN
      : "local-e2e-cleanup-token";
    if (!cleanupToken) {
      throw new Error(`Cleanup token is missing; test account remains: ${account.email}`);
    }
    const cleanup = await request.post(`${baseURL}/api/test/cleanup`, {
      headers: { "x-e2e-cleanup-token": cleanupToken },
      data: { email: account.email }
    });
    expect(cleanup.ok(), `Cleanup failed for ${account.email}: ${await cleanup.text()}`).toBeTruthy();
  },

  signedInPage: async ({ page, account }, use) => {
    const login = await page.request.post("/auth/email/login", {
      data: { email: account.email, password: account.password }
    });
    expect(login.ok(), await login.text()).toBeTruthy();
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("#mapView")).toBeVisible();
    await use(page);
  }
});

export { expect };
