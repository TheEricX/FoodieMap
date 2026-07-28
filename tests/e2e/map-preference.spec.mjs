import { test, expect } from "./fixtures.mjs";

test("@desktop saved map preference opens the chosen provider without an extra picker", async ({ signedInPage: page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "The map card is a desktop-only interaction.");
  const create = await page.request.post("/api/restaurants", { data: {
    name: "E2E Preferred Map",
    address: "Toronto",
    lat: 43.6532,
    lng: -79.3832,
    google_url: "https://www.google.com/maps?q=43.6532,-79.3832",
    status: "want_to_go",
    visit_count: 0,
    personal_rating: 0,
    notes: ""
  }});
  expect(create.ok()).toBeTruthy();
  await page.reload();
  await page.waitForLoadState("networkidle");
  await page.locator("#markersLayer .restaurant-marker").first().click();
  await page.evaluate(() => {
    localStorage.setItem("foodiemap:map-app-preference", "apple");
    window.__openedMapUrl = "";
    window.open = (url) => {
      window.__openedMapUrl = String(url);
      return null;
    };
  });
  await page.locator("#openGoogleMaps").click();
  await expect(page.locator("#mapChoiceDialog")).toBeHidden();
  const openedUrl = await page.evaluate(() => window.__openedMapUrl);
  expect(openedUrl).toContain("maps.apple.com");
});
