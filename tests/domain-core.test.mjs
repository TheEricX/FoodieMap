import test from "node:test";
import assert from "node:assert/strict";
import { createDomainModel, findById, orderByIds, selectVisibleItem, sortDiscoveryLists, upsertById } from "../domain-core.mjs";

const model = createDomainModel({ translate: (key) => `translated:${key}`, now: () => 123 });

test("domain model normalizes nested restaurant and list data", () => {
  const restaurant = model.normalizeRestaurant({ id: 7, rating: 8, dishes: [{ id: 2, rating: -1 }] });
  assert.equal(restaurant.id, "7");
  assert.equal(restaurant.personal_rating, 5);
  assert.equal(restaurant.created_at, 123);
  assert.equal(restaurant.dishes[0].rating, 0);
  const list = model.normalizeList({ id: 3, visibility: "invalid", items: [{ id: 4, restaurant }] });
  assert.equal(list.visibility, "private");
  assert.equal(list.items[0].restaurant.id, "7");
});

test("domain view selectors keep Discovery ordering and stable selection", () => {
  const lists = [
    { id: "old", copy_count: 5, item_count: 1, published_at: 10 },
    { id: "new", copy_count: 1, item_count: 8, published_at: 30 },
  ];
  assert.equal(sortDiscoveryLists(lists, "popular")[0].id, "old");
  assert.equal(sortDiscoveryLists(lists, "recent")[0].id, "new");
  assert.equal(selectVisibleItem(lists, [lists[1]], "missing").id, "new");
  assert.equal(selectVisibleItem(lists, [], "old").id, "old");
});

test("domain model normalizes recipes and share payloads", () => {
  assert.equal(model.normalizeRecipe({ rating: 5.7 }).rating, 5);
  assert.equal(model.normalizeRecipe({}).title, "translated:recipes.formTitle");
  assert.equal(model.normalizeSharePack({ items: null }).items.length, 0);
  assert.equal(model.normalizeRecipeShare({ recipe: { id: 9 } }).recipe.id, "9");
});

test("domain collection helpers select, upsert, and preserve explicit order", () => {
  const items = [{ id: "a", value: 1 }, { id: "b", value: 2 }, { id: "c", value: 3 }];
  assert.equal(findById(items, "b").value, 2);
  assert.deepEqual(upsertById(items, { id: "b", value: 4 }).map((item) => item.value), [1, 4, 3]);
  assert.deepEqual(upsertById(items, { id: "d", value: 5 }).map((item) => item.id), ["d", "a", "b", "c"]);
  assert.deepEqual(orderByIds(items, ["c", "a"]).map((item) => item.id), ["c", "a", "b"]);
});
