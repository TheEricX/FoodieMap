import test from "node:test";
import assert from "node:assert/strict";
import { createAccountShareTemplates } from "../account-share-templates.mjs";

const templates = createAccountShareTemplates({
  translate: (key, params = {}) => `${key}${params.name ? `:${params.name}` : ""}${params.count != null ? `:${params.count}` : ""}`,
  formatDate: () => "Jul 14",
  recipeImageUrl: (recipe) => `/recipes/${recipe.id}.png`,
  restaurantThumb: () => '<span class="thumb"></span>',
  emptyState: (message) => `<div>${message}</div>`,
  shortUserName: () => "AB",
  adminPlanLabel: (plan) => plan,
  adminStatusLabel: (status) => status,
  authMethodLabel: (methods) => methods.join(","),
});

test("public share templates escape content and keep save/map actions", () => {
  const item = { restaurant: { id: 'r"1', name: "Cafe <One>", address: "Toronto", personal_rating: 4.4 }, note: "Try <soon>", dishes: [] };
  const page = templates.sharePackPublicPage({ title: "Pack <One>", description: "Notes", owner: { name: "A <B>" }, items: [item] });
  assert.match(page, /Pack &lt;One&gt;/);
  assert.match(page, /data-add-share-pack/);
  assert.match(page, /data-open-map-restaurant="r&quot;1"/);
  assert.match(page, /A &lt;B&gt;/);
  const recipe = templates.recipeSharePage({ created_at: 1, owner: { name: "Chef" }, recipe: { id: "x", title: "Egg", rating: 4, ingredients: "A\nB", steps: "Cook", notes: "" } });
  assert.match(recipe, /data-add-recipe-share/);
  assert.match(recipe, /A<br \/>B/);
});

test("history and admin templates expose stable action hooks", () => {
  const history = templates.sharePackHistory({ token: 't"1', title: "Pack", description: "", item_count: 2, created_at: 1, card_url: "/card.png", share_url: "/share" });
  assert.match(history, /data-revoke-share-pack="t&quot;1"/);
  assert.match(history, /data-copy-share-pack/);
  const admin = templates.adminUserRow({ id: 'u"1', email: "user@example.com", name: "User", plan: "free", account_status: "active", restaurant_count: 1, list_count: 2, public_list_count: 0, restaurant_limit: 50, auth_methods: ["password"], created_at: 1, updated_at: 1 });
  assert.match(admin, /data-admin-action="plan"/);
  assert.match(admin, /data-admin-action="suspend"/);
  assert.match(admin, /data-admin-action="delete"/);
  assert.match(admin, /data-user-id="u&quot;1"/);
});
