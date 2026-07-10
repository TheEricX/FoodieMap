import { test, expect } from "./fixtures.mjs";

const onePixelPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64"
);

test("@staging PostgreSQL and GCS lifecycle is persisted and cleaned", async ({ request, account }) => {
  const login = await request.post("/auth/email/login", {
    data: { email: account.email, password: account.password }
  });
  expect(login.ok(), await login.text()).toBeTruthy();

  const createdRestaurant = await request.post("/api/restaurants", { data: {
    name: `E2E Staging ${Date.now()}`,
    address: "Toronto",
    lat: 43.6532,
    lng: -79.3832,
    google_url: "https://maps.apple.com/?ll=43.6532,-79.3832&q=E2E",
    status: "want_to_go",
    visit_count: 0,
    personal_rating: 0,
    notes: "staging lifecycle"
  }});
  expect(createdRestaurant.ok(), await createdRestaurant.text()).toBeTruthy();
  const restaurant = (await createdRestaurant.json()).restaurant;

  const createdDish = await request.post(`/api/restaurants/${restaurant.id}/dishes`, {
    data: { name: "E2E Image Dish", dish_status: "liked", rating: 4.5, notes: "" }
  });
  expect(createdDish.ok(), await createdDish.text()).toBeTruthy();
  const dish = (await createdDish.json()).dish;

  const uploaded = await request.post(`/api/dishes/${dish.id}/image`, {
    multipart: { image: { name: "e2e.png", mimeType: "image/png", buffer: onePixelPng } }
  });
  expect(uploaded.ok(), await uploaded.text()).toBeTruthy();
  const imageUrl = (await uploaded.json()).dish.image_url;
  expect(imageUrl).toBeTruthy();

  const readback = await request.get(imageUrl);
  expect(readback.ok()).toBeTruthy();
  expect(readback.headers()["content-type"]).toContain("image/png");
});
