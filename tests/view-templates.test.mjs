import test from "node:test";
import assert from "node:assert/strict";
import { createViewTemplates } from "../view-templates.mjs";

const templates = createViewTemplates({
  translate: (key) => key,
  formatDate: (value) => `date:${value}`,
  recipeImageUrl: (recipe) => `/recipe/${recipe.id}.png`,
  restaurantImageUrl: (restaurant) => `/restaurant/${restaurant.id}.png`,
  statusLabel: (status) => `status:${status}`,
  accentVariant: () => 2,
});

test("recipe templates preserve selection, actions, and escaped content", () => {
  const recipe = { id: "r1", title: "Tomato <Egg>", rating: 4.5, updated_at: 10, ingredients: "Eggs\nTomato", steps: "Cook", notes: "Less <salt>" };
  const row = templates.recipeRow(recipe, "r1");
  assert.match(row, /recipe-row selected/);
  assert.match(row, /Tomato &lt;Egg&gt;/);
  const detail = templates.recipeDetail(recipe);
  assert.match(detail, /data-edit-recipe/);
  assert.match(detail, /Eggs<br \/>Tomato/);
  assert.match(detail, /Less &lt;salt&gt;/);
});

test("restaurant and list templates escape identifiers and keep action slots", () => {
  const restaurant = { id: 'a"b', name: "Cafe <One>", status: "favorite" };
  const row = templates.restaurantRow(restaurant, { body: "safe body", actions: "<button>Open</button>" });
  assert.match(row, /data-restaurant-id="a&quot;b"/);
  assert.match(row, /Cafe &lt;One&gt;/);
  assert.match(row, /<button>Open<\/button>/);
  assert.match(templates.listCover({ visibility: "public" }), /🍜/);
});
