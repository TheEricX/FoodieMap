import test from "node:test";
import assert from "node:assert/strict";
import { createMapViewTemplates } from "../map-view-templates.mjs";

const templates = createMapViewTemplates({
  translate: (key, params = {}) => `${key}${params.count != null ? `:${params.count}` : ""}`,
  restaurantThumb: () => '<span class="thumb"></span>',
  restaurantImageUrl: (restaurant) => restaurant.image_url,
  statusLabel: (status) => `status:${status}`,
  visibilityLabel: (visibility) => `visibility:${visibility}`,
  shortMapName: (name) => name,
});

test("list filters use explicit desktop and mobile hooks", () => {
  const list = { id: 'list"1', title: "Toronto <Bites>", item_count: 3, visibility: "private" };
  const desktop = templates.listFilter(list, { active: true, variant: "sidebar" });
  assert.match(desktop, /data-sidebar-list-id="list&quot;1"/);
  assert.match(desktop, /draggable="true"/);
  assert.match(desktop, /Toronto &lt;Bites&gt;/);
  assert.match(templates.listFilter(list, { variant: "mobileMap" }), /data-mobile-list-id=/);
  assert.match(templates.listFilter(list, { variant: "mobileLists" }), /data-mobile-my-list-id=/);
  assert.throws(() => templates.listFilter(list, { variant: "unknown" }));
});

test("map marker and metadata templates escape user content", () => {
  const restaurant = { id: "r1", name: "Cafe <One>", image_url: 'https://example.test/a".png', status: "visited", personal_rating: 4.2, visit_count: 2 };
  assert.match(templates.marker(restaurant, "2 < 3 km"), /Cafe &lt;One&gt;/);
  assert.match(templates.marker(restaurant, "2 < 3 km"), /2 &lt; 3 km/);
  assert.match(templates.detailMeta(restaurant, "1.2 km"), /count.visits:2/);
  assert.match(templates.recentRestaurant(restaurant, "Recent & nearby"), /Recent &amp; nearby/);
});

test("dish pills are balanced and retain one wrapper per dish", () => {
  const html = templates.spotDishes({ dishes: [{ id: "d1", name: "Soup <hot>", dish_status: "liked", rating: 4.5, image_url: "" }] });
  assert.match(html, /Soup &lt;hot&gt;/);
  assert.equal((html.match(/<span/g) || []).length, 1);
  assert.equal((html.match(/<\/span>/g) || []).length, 1);
});
