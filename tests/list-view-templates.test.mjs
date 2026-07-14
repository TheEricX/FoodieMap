import test from "node:test";
import assert from "node:assert/strict";
import { createListViewTemplates } from "../list-view-templates.mjs";

const restaurant = { id: 'spot"1', name: "Noodle <House>", status: "favorite", personal_rating: 4.5, visit_count: 2, address: "Toronto" };
const templates = createListViewTemplates({
  translate: (key, params = {}) => `${key}${params.count != null ? `:${params.count}` : ""}${params.name ? `:${params.name}` : ""}${params.date ? `:${params.date}` : ""}`,
  emptyState: (message) => `<div class="empty">${message}</div>`,
  listCover: () => '<span class="cover"></span>',
  restaurantRow: (item, options) => `<article data-row="${item.id}">${item.name}${options.body}${options.actions}</article>`,
  restaurantsForSystemList: () => [restaurant],
  sortRestaurants: (items) => items,
  sortListItems: (items) => items,
  restaurantSearchText: (item) => item.name.toLowerCase(),
  systemListEyebrow: () => "Everything",
  systemListTitle: () => "All Spots",
  systemListDescription: () => "Every saved spot",
  listSortDescription: () => "Recently updated",
  isLocationReady: () => false,
  distanceLabel: () => "",
  statusLabel: () => "Favorite",
  visibilityLabel: (value) => value,
  formatDate: () => "Jul 14",
});

test("list templates render management commands and escaped identifiers", () => {
  const list = { id: 'list"1', title: "Ramen <List>", description: "Try soon", visibility: "private", item_count: 1, updated_at: 1, items: [{ restaurant }] };
  const card = templates.listCard(list, true, "private");
  assert.match(card, /data-list-id="list&quot;1"/);
  assert.match(card, /Ramen &lt;List&gt;/);
  const detail = templates.myListDetail(list);
  assert.match(detail, /data-list-action="edit"/);
  assert.match(detail, /data-list-action="delete"/);
  assert.match(detail, /data-open-spot="spot&quot;1"/);
});

test("Discovery and system templates preserve shared actions", () => {
  const publicList = { id: "p1", title: "Public", visibility: "public", owner: { name: "A <B>" }, item_count: 1, copy_count: 2, items: [{ restaurant }] };
  const discovery = templates.discoveryDetail(publicList);
  assert.match(discovery, /data-copy-public/);
  assert.match(discovery, /discovery\.byOwner:A &lt;B&gt;/);
  const system = templates.systemListDetail({ key: "all" }, "");
  assert.match(system, /data-view-system-map/);
  assert.match(system, /data-delete-spot="spot&quot;1"/);
});
