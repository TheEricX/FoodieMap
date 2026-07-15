import test from "node:test";
import assert from "node:assert/strict";
import { createFormTemplates } from "../form-templates.mjs";

const templates = createFormTemplates({
  translate: (key) => key,
  statusLabel: (status) => `status:${status}`,
  dishStatusLabel: (status) => `dish:${status}`,
  restaurantThumb: () => '<span class="thumb"></span>',
  emptyState: (message) => `<div>${message}</div>`,
});

test("settings integrations escape values and expose revoke hooks", () => {
  const html = templates.integrationList([{ id: 'id"1', client_name: "Agent <One>", scopes: ["lists:read", "lists:write"] }]);
  assert.match(html, /Agent &lt;One&gt;/);
  assert.match(html, /data-revoke-integration="id&quot;1"/);
  assert.match(html, /lists:read · lists:write/);
  assert.match(templates.integrationList([]), /settings.connectedEmpty/);
});

test("dish templates preserve editor and detail action hooks", () => {
  const dish = { id: 'dish"1', name: "Egg <toast>", dish_status: "liked", rating: 4.5, notes: "Hot & fresh", image_url: 'https://example.test/a".png' };
  const editor = templates.dishEditor(dish);
  assert.match(editor, /data-dish-action="save"/);
  assert.match(editor, /data-dish-action="delete"/);
  assert.match(editor, /Egg &lt;toast&gt;/);
  assert.match(editor, /data-dish-id="dish&quot;1"/);

  const preview = templates.detailDish(dish, false);
  assert.match(preview, /data-detail-dish-action="edit"/);
  assert.match(preview, /Hot &amp; fresh/);
  const edit = templates.detailDish(dish, true);
  assert.match(edit, /data-detail-dish-autosave/);
  assert.match(edit, /data-detail-dish-action="done"/);
});

test("share and list picker templates keep stable selection hooks", () => {
  const restaurant = {
    id: 'restaurant"1',
    name: "Cafe <One>",
    address: "Toronto & GTA",
    status: "want_to_go",
    personal_rating: 4,
    dishes: [{ id: 'dish"1', name: "Noodles <hot>", dish_status: "liked", rating: 4.8 }],
  };
  const shareDish = templates.shareDishOption(restaurant.dishes[0]);
  assert.match(shareDish, /value="dish&quot;1"/);
  assert.match(shareDish, /checked/);

  const pack = templates.sharePackRestaurantOption(restaurant);
  assert.match(pack, /data-share-pack-restaurant="restaurant&quot;1"/);
  assert.match(pack, /data-share-pack-dish/);
  assert.match(pack, /Cafe &lt;One&gt;/);

  const add = templates.addSpotRow(restaurant, false);
  assert.match(add, /data-add-list-spot="restaurant&quot;1"/);
  const remove = templates.addSpotRow(restaurant, true);
  assert.match(remove, /data-remove-list-spot="restaurant&quot;1"/);
  assert.match(remove, /list.inThisList/);
});
