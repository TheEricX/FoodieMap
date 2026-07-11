import pytest

import server


def add_restaurant(user_id: str, restaurant_id: str, name: str):
    timestamp = server.now()
    with server.connect() as db:
        db.execute(
            """
            INSERT INTO restaurants
            (id, owner_user_id, name, address, lat, lng, status, created_at, updated_at)
            VALUES (?, ?, ?, '', 43.65, -79.38, 'want_to_go', ?, ?)
            """,
            (restaurant_id, user_id, name, timestamp, timestamp),
        )


def test_user_data_is_isolated_and_searchable(users):
    add_restaurant(users[0], "restaurant-a", "Ramen A")
    add_restaurant(users[1], "restaurant-b", "Ramen B")
    result = server.foodiemap_service.list_restaurants(users[0], search="ramen")
    assert [item["id"] for item in result["items"]] == ["restaurant-a"]
    with pytest.raises(KeyError):
        server.foodiemap_service.get_restaurant(users[0], "restaurant-b")


def test_create_list_is_private_and_atomic(users):
    add_restaurant(users[0], "restaurant-a", "Ramen A")
    add_restaurant(users[1], "restaurant-b", "Ramen B")
    created = server.foodiemap_service.create_private_list(
        users[0], title="Agent list", restaurant_ids=["restaurant-a"]
    )
    assert created["visibility"] == "private"
    assert [item["restaurant_id"] for item in created["items"]] == ["restaurant-a"]
    with pytest.raises(ValueError):
        server.foodiemap_service.create_private_list(
            users[0], title="Must roll back", restaurant_ids=["restaurant-a", "restaurant-b"]
        )
    with server.connect() as db:
        assert not db.execute("SELECT 1 FROM lists WHERE title = 'Must roll back'").fetchone()


def test_recipe_and_list_reads_are_owner_scoped(users):
    timestamp = server.now()
    with server.connect() as db:
        db.execute(
            "INSERT INTO recipes (id, owner_user_id, title, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
            ("recipe-a", users[0], "Noodles", timestamp, timestamp),
        )
    assert server.foodiemap_service.list_recipes(users[0], search="noodles")["items"][0]["id"] == "recipe-a"
    assert server.foodiemap_service.list_recipes(users[1])["items"] == []
    with pytest.raises(KeyError):
        server.foodiemap_service.get_recipe(users[1], "recipe-a")
