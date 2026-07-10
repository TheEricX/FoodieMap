#!/usr/bin/env python3
from __future__ import annotations

import os
import sqlite3
import sys
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

SOURCE_DB = Path(os.getenv("SOURCE_SQLITE_DB", ROOT / "data" / "foodiemap.db"))
SOURCE_UPLOAD_DIR = Path(os.getenv("SOURCE_UPLOAD_DIR", ROOT / "data" / "uploads"))
GCS_BUCKET = os.getenv("GCS_BUCKET", "")


TABLES = [
    "users",
    "restaurants",
    "dishes",
    "share_links",
    "share_packs",
    "share_pack_items",
    "share_pack_dishes",
    "recipes",
    "recipe_shares",
    "lists",
    "list_items",
    "auth_codes",
]


def sqlite_rows(table: str) -> list[dict[str, Any]]:
    with sqlite3.connect(SOURCE_DB) as db:
        db.row_factory = sqlite3.Row
        return [dict(row) for row in db.execute(f"SELECT * FROM {table}").fetchall()]


def maybe_upload_image(table: str, row: dict[str, Any]) -> dict[str, Any]:
    image_path = row.get("image_path") or ""
    if not image_path or "/" in image_path or not GCS_BUCKET:
        return row
    prefix = "dishes" if table == "dishes" else "recipes"
    source = SOURCE_UPLOAD_DIR / image_path
    if not source.exists():
        return row

    from google.cloud import storage

    object_name = f"{prefix}/{image_path}"
    bucket = storage.Client().bucket(GCS_BUCKET)
    blob = bucket.blob(object_name)
    if not blob.exists():
        blob.upload_from_filename(str(source))
    migrated = dict(row)
    migrated["image_path"] = object_name
    return migrated


def upsert_row(db: Any, table: str, row: dict[str, Any]) -> None:
    columns = list(row.keys())
    placeholders = ", ".join("?" for _ in columns)
    column_sql = ", ".join(columns)
    update_columns = [column for column in columns if column != "id"]
    update_sql = ", ".join(f"{column} = EXCLUDED.{column}" for column in update_columns)
    sql = f"""
        INSERT INTO {table} ({column_sql})
        VALUES ({placeholders})
        ON CONFLICT (id) DO UPDATE SET {update_sql}
    """
    db.execute(sql, tuple(row[column] for column in columns))


def main() -> None:
    if not os.getenv("DATABASE_URL", "").startswith(("postgresql://", "postgres://")):
        raise SystemExit("Set DATABASE_URL to the target PostgreSQL connection string before running migration.")
    if not SOURCE_DB.exists():
        raise SystemExit(f"Source SQLite database not found: {SOURCE_DB}")

    import server

    server.init_db()
    with server.connect() as db:
        for table in TABLES:
            rows = sqlite_rows(table)
            for row in rows:
                if table in {"dishes", "recipes"}:
                    row = maybe_upload_image(table, row)
                upsert_row(db, table, row)
            print(f"{table}: migrated {len(rows)} rows")

        counts = db.execute(
            """
            SELECT
              (SELECT COUNT(*) FROM users) AS users,
              (SELECT COUNT(*) FROM restaurants) AS restaurants,
              (SELECT COUNT(*) FROM lists) AS lists,
              (SELECT COUNT(*) FROM dishes) AS dishes
            """
        ).fetchone()
        print(
            "verification: "
            f"users={counts['users']} "
            f"restaurants={counts['restaurants']} "
            f"lists={counts['lists']} "
            f"dishes={counts['dishes']}"
        )


if __name__ == "__main__":
    main()
