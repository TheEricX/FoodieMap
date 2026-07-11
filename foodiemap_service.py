from __future__ import annotations

import base64
import json
import time
import uuid
from typing import Any, Callable


def _encode_cursor(offset: int) -> str:
    return base64.urlsafe_b64encode(json.dumps({"offset": offset}).encode()).decode().rstrip("=")


def _decode_cursor(cursor: str | None) -> int:
    if not cursor:
        return 0
    try:
        padded = cursor + "=" * (-len(cursor) % 4)
        value = json.loads(base64.urlsafe_b64decode(padded.encode()).decode())
        return max(0, int(value["offset"]))
    except (ValueError, TypeError, KeyError, json.JSONDecodeError):
        raise ValueError("Invalid cursor")


class FoodieMapService:
    def __init__(
        self,
        connect: Callable[[], Any],
        restaurant_serializer: Callable[..., dict[str, Any]],
        list_serializer: Callable[..., dict[str, Any]],
        recipe_serializer: Callable[..., dict[str, Any]],
    ) -> None:
        self.connect = connect
        self.restaurant_serializer = restaurant_serializer
        self.list_serializer = list_serializer
        self.recipe_serializer = recipe_serializer

    def list_restaurants(
        self,
        user_id: str,
        *,
        status: str = "all",
        search: str = "",
        limit: int = 50,
        cursor: str | None = None,
        unbounded: bool = False,
    ) -> dict[str, Any]:
        if status not in {"all", "visited", "want_to_go", "favorite"}:
            raise ValueError("Invalid restaurant status")
        limit = max(1, min(int(limit), 100))
        offset = _decode_cursor(cursor)
        conditions = ["owner_user_id = ?"]
        params: list[Any] = [user_id]
        if status != "all":
            conditions.append("status = ?")
            params.append(status)
        if search.strip():
            conditions.append("(LOWER(name) LIKE ? OR LOWER(address) LIKE ? OR LOWER(notes) LIKE ?)")
            pattern = f"%{search.strip().lower()}%"
            params.extend([pattern, pattern, pattern])
        pagination = ""
        if not unbounded:
            pagination = " LIMIT ? OFFSET ?"
            params.extend([limit + 1, offset])
        with self.connect() as db:
            rows = db.execute(
                f"SELECT * FROM restaurants WHERE {' AND '.join(conditions)} "
                f"ORDER BY updated_at DESC, id ASC{pagination}",
                params,
            ).fetchall()
            items = [self.restaurant_serializer(db, row) for row in (rows if unbounded else rows[:limit])]
        return {"items": items, "next_cursor": _encode_cursor(offset + limit) if not unbounded and len(rows) > limit else None}

    def get_restaurant(self, user_id: str, restaurant_id: str) -> dict[str, Any]:
        with self.connect() as db:
            row = db.execute(
                "SELECT * FROM restaurants WHERE id = ? AND owner_user_id = ?",
                (restaurant_id, user_id),
            ).fetchone()
            if not row:
                raise KeyError("Restaurant not found")
            return self.restaurant_serializer(db, row)

    def list_lists(
        self,
        user_id: str,
        *,
        visibility: str = "all",
        search: str = "",
        limit: int = 50,
        cursor: str | None = None,
        unbounded: bool = False,
    ) -> dict[str, Any]:
        if visibility not in {"all", "private", "public"}:
            raise ValueError("Invalid list visibility")
        limit = max(1, min(int(limit), 100))
        offset = _decode_cursor(cursor)
        conditions = ["owner_user_id = ?"]
        params: list[Any] = [user_id]
        if visibility != "all":
            conditions.append("visibility = ?")
            params.append(visibility)
        if search.strip():
            conditions.append("(LOWER(title) LIKE ? OR LOWER(description) LIKE ?)")
            pattern = f"%{search.strip().lower()}%"
            params.extend([pattern, pattern])
        pagination = ""
        if not unbounded:
            pagination = " LIMIT ? OFFSET ?"
            params.extend([limit + 1, offset])
        with self.connect() as db:
            rows = db.execute(
                f"SELECT * FROM lists WHERE {' AND '.join(conditions)} "
                f"ORDER BY updated_at DESC, id ASC{pagination}",
                params,
            ).fetchall()
            items = [self.list_serializer(db, row) for row in (rows if unbounded else rows[:limit])]
        return {"items": items, "next_cursor": _encode_cursor(offset + limit) if not unbounded and len(rows) > limit else None}

    def get_list(self, user_id: str, list_id: str) -> dict[str, Any]:
        with self.connect() as db:
            row = db.execute(
                "SELECT * FROM lists WHERE id = ? AND owner_user_id = ?",
                (list_id, user_id),
            ).fetchone()
            if not row:
                raise KeyError("List not found")
            return self.list_serializer(db, row, include_items=True)

    def list_recipes(
        self,
        user_id: str,
        *,
        search: str = "",
        limit: int = 50,
        cursor: str | None = None,
        unbounded: bool = False,
    ) -> dict[str, Any]:
        limit = max(1, min(int(limit), 100))
        offset = _decode_cursor(cursor)
        conditions = ["owner_user_id = ?"]
        params: list[Any] = [user_id]
        if search.strip():
            conditions.append(
                "(LOWER(title) LIKE ? OR LOWER(ingredients) LIKE ? OR LOWER(notes) LIKE ?)"
            )
            pattern = f"%{search.strip().lower()}%"
            params.extend([pattern, pattern, pattern])
        pagination = ""
        if not unbounded:
            pagination = " LIMIT ? OFFSET ?"
            params.extend([limit + 1, offset])
        with self.connect() as db:
            rows = db.execute(
                f"SELECT * FROM recipes WHERE {' AND '.join(conditions)} "
                f"ORDER BY updated_at DESC, id ASC{pagination}",
                params,
            ).fetchall()
            items = [self.recipe_serializer(row) for row in (rows if unbounded else rows[:limit])]
        return {"items": items, "next_cursor": _encode_cursor(offset + limit) if not unbounded and len(rows) > limit else None}

    def get_recipe(self, user_id: str, recipe_id: str) -> dict[str, Any]:
        with self.connect() as db:
            row = db.execute(
                "SELECT * FROM recipes WHERE id = ? AND owner_user_id = ?",
                (recipe_id, user_id),
            ).fetchone()
            if not row:
                raise KeyError("Recipe not found")
            return self.recipe_serializer(row)

    def create_private_list(
        self,
        user_id: str,
        *,
        title: str,
        description: str = "",
        restaurant_ids: list[str] | None = None,
        cover_image_url: str = "",
    ) -> dict[str, Any]:
        title = title.strip()
        if not title or len(title) > 160:
            raise ValueError("List title must be between 1 and 160 characters")
        restaurant_ids = list(dict.fromkeys(restaurant_ids or []))
        timestamp = int(time.time())
        list_id = str(uuid.uuid4())
        with self.connect() as db:
            if restaurant_ids:
                placeholders = ",".join("?" for _ in restaurant_ids)
                rows = db.execute(
                    f"SELECT id FROM restaurants WHERE owner_user_id = ? AND id IN ({placeholders})",
                    [user_id, *restaurant_ids],
                ).fetchall()
                owned_ids = {row["id"] for row in rows}
                if owned_ids != set(restaurant_ids):
                    raise ValueError("One or more restaurants are invalid or not owned by this user")
            db.execute(
                """
                INSERT INTO lists
                (id, owner_user_id, title, description, visibility, cover_image_url, created_at, updated_at)
                VALUES (?, ?, ?, ?, 'private', ?, ?, ?)
                """,
                (list_id, user_id, title, description.strip(), cover_image_url.strip(), timestamp, timestamp),
            )
            for sort_order, restaurant_id in enumerate(restaurant_ids):
                db.execute(
                    """
                    INSERT INTO list_items (id, list_id, restaurant_id, note, sort_order, created_at)
                    VALUES (?, ?, ?, '', ?, ?)
                    """,
                    (str(uuid.uuid4()), list_id, restaurant_id, sort_order, timestamp),
                )
            row = db.execute("SELECT * FROM lists WHERE id = ?", (list_id,)).fetchone()
            return self.list_serializer(db, row, include_items=True)
