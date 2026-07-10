import { test, expect } from "./fixtures.mjs";

test("registration session survives refresh and logout", async ({ page, account }) => {
  const login = await page.request.post("/auth/email/login", {
    data: { email: account.email, password: account.password }
  });
  expect(login.ok()).toBeTruthy();
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await expect(page.locator("#mapView")).toBeVisible();
  await page.reload();
  await page.waitForLoadState("networkidle");
  await expect(page.locator("#mapView")).toBeVisible();
  const logout = await page.request.post("/auth/logout");
  expect(logout.ok()).toBeTruthy();
  const me = await page.request.get("/api/me");
  expect(me.ok()).toBeTruthy();
  expect((await me.json()).user).toBeNull();
});

test("restaurant map URL and edits persist", async ({ signedInPage: page }) => {
  const googleUrl = "https://www.google.com/maps/place/Test+Kitchen/@43.6532,-79.3832,17z";
  const create = await page.request.post("/api/restaurants", { data: {
    name: "E2E Test Kitchen",
    address: "100 Queen St W, Toronto",
    lat: 43.6532,
    lng: -79.3832,
    google_url: googleUrl,
    status: "want_to_go",
    visit_count: 0,
    personal_rating: 0,
    notes: "created by Playwright"
  }});
  expect(create.ok(), await create.text()).toBeTruthy();
  const restaurant = (await create.json()).restaurant;

  await page.reload();
  await page.waitForLoadState("networkidle");
  const persisted = await page.request.get(`/api/restaurants/${restaurant.id}`);
  expect(persisted.ok()).toBeTruthy();
  expect((await persisted.json()).restaurant.google_url).toBe(googleUrl);

  const update = await page.request.patch(`/api/restaurants/${restaurant.id}`, {
    data: { notes: "updated by Playwright", visit_count: 2 }
  });
  expect(update.ok()).toBeTruthy();
  expect((await update.json()).restaurant).toMatchObject({ notes: "updated by Playwright", visit_count: 2 });
});

test("privacy browse mode never shows user-distance UI", async ({ signedInPage: page }) => {
  await page.evaluate(() => localStorage.removeItem("foodiemap.locationMode.v1"));
  await page.reload();
  await page.waitForLoadState("networkidle");
  await expect(page.locator("#locationPrompt")).toBeVisible();
  await page.locator("#locationBrowseAction").click();
  await expect(page.locator("#meMarker")).toBeHidden();
  await expect(page.locator(".range-ring:not([hidden])")).toHaveCount(0);
  await expect(page.locator("#mapCenterButton")).toBeDisabled();
  await expect.poll(() => page.evaluate(() => localStorage.getItem("foodiemap.locationMode.v1"))).toBe("browse");
});

test("geolocation permission displays nearby mode", async ({ context, signedInPage: page }) => {
  await context.grantPermissions(["geolocation"]);
  await context.setGeolocation({ latitude: 43.6532, longitude: -79.3832, accuracy: 50 });
  await page.evaluate(() => localStorage.removeItem("foodiemap.locationMode.v1"));
  await page.reload();
  await page.waitForLoadState("networkidle");
  await page.locator("#locationPrimaryAction").click();
  await expect(page.locator("#meMarker")).toBeVisible();
  await expect(page.locator("#mapCenterButton")).toBeEnabled();
});
