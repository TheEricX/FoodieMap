#!/usr/bin/env python3
from __future__ import annotations

import base64
import hashlib
import hmac
import json
import os
import secrets
import sqlite3
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid
from pathlib import Path
from typing import Any, Optional

from fastapi import Depends, FastAPI, File, HTTPException, Request, UploadFile
from fastapi.responses import FileResponse, JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field


ROOT = Path(__file__).resolve().parent


def load_dotenv() -> None:
    env_path = ROOT / ".env"
    if not env_path.exists():
        return
    for raw_line in env_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value


load_dotenv()

DATA_DIR = Path(os.getenv("DATA_DIR", ROOT / "data"))
UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", DATA_DIR / "uploads"))
DB_PATH = Path(os.getenv("DATABASE_URL", DATA_DIR / "foodiemap.db"))
APP_BASE_URL = os.getenv("APP_BASE_URL", "http://localhost:5174").rstrip("/")
SESSION_SECRET = os.getenv("SESSION_SECRET", "dev-change-me")
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
ALLOWED_SHORT_HOSTS = {"maps.app.goo.gl", "goo.gl"}
SESSION_COOKIE = "foodiemap_session"
OAUTH_STATE_COOKIE = "foodiemap_oauth_state"
PUBLIC_FILES = {"index.html", "app.js", "styles.css"}

DATA_DIR.mkdir(parents=True, exist_ok=True)
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI(title="FoodieMap")


class RestaurantIn(BaseModel):
    name: str = Field(min_length=1, max_length=180)
    address: str = ""
    lat: float = Field(ge=-90, le=90)
    lng: float = Field(ge=-180, le=180)
    google_url: str = ""
    status: str = "want_to_go"
    visit_count: int = Field(default=0, ge=0)
    personal_rating: float = Field(default=0, ge=0, le=5)
    notes: str = ""


class RestaurantPatch(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=180)
    address: Optional[str] = None
    lat: Optional[float] = Field(default=None, ge=-90, le=90)
    lng: Optional[float] = Field(default=None, ge=-180, le=180)
    google_url: Optional[str] = None
    status: Optional[str] = None
    visit_count: Optional[int] = Field(default=None, ge=0)
    personal_rating: Optional[float] = Field(default=None, ge=0, le=5)
    notes: Optional[str] = None


class DishIn(BaseModel):
    name: str = Field(min_length=1, max_length=180)
    dish_status: str = "tried"
    rating: float = Field(default=0, ge=0, le=5)
    notes: str = ""


class DishPatch(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=180)
    dish_status: Optional[str] = None
    rating: Optional[float] = Field(default=None, ge=0, le=5)
    notes: Optional[str] = None


class ShareIn(BaseModel):
    selected_dish_ids: list[str] = Field(default_factory=list)


def now() -> int:
    return int(time.time())


def model_values(model: BaseModel) -> dict[str, Any]:
    if hasattr(model, "model_dump"):
        return model.model_dump(exclude_unset=True)
    return model.dict(exclude_unset=True)


def safe_next_path(value: str) -> str:
    if not value or not value.startswith("/") or value.startswith("//"):
        return "/"
    parsed = urllib.parse.urlparse(value)
    if parsed.scheme or parsed.netloc:
        return "/"
    return value


def new_id() -> str:
    return str(uuid.uuid4())


def connect() -> sqlite3.Connection:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


def init_db() -> None:
    with connect() as db:
        db.executescript(
            """
            CREATE TABLE IF NOT EXISTS users (
              id TEXT PRIMARY KEY,
              google_sub TEXT NOT NULL UNIQUE,
              email TEXT NOT NULL,
              name TEXT NOT NULL DEFAULT '',
              avatar_url TEXT NOT NULL DEFAULT '',
              created_at INTEGER NOT NULL
            );

            CREATE TABLE IF NOT EXISTS restaurants (
              id TEXT PRIMARY KEY,
              owner_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
              name TEXT NOT NULL,
              address TEXT NOT NULL DEFAULT '',
              lat REAL NOT NULL,
              lng REAL NOT NULL,
              google_url TEXT NOT NULL DEFAULT '',
              status TEXT NOT NULL DEFAULT 'want_to_go',
              visit_count INTEGER NOT NULL DEFAULT 0,
              personal_rating REAL NOT NULL DEFAULT 0,
              notes TEXT NOT NULL DEFAULT '',
              created_at INTEGER NOT NULL,
              updated_at INTEGER NOT NULL
            );

            CREATE TABLE IF NOT EXISTS dishes (
              id TEXT PRIMARY KEY,
              restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
              name TEXT NOT NULL,
              dish_status TEXT NOT NULL DEFAULT 'tried',
              rating REAL NOT NULL DEFAULT 0,
              image_path TEXT NOT NULL DEFAULT '',
              notes TEXT NOT NULL DEFAULT '',
              created_at INTEGER NOT NULL,
              updated_at INTEGER NOT NULL
            );

            CREATE TABLE IF NOT EXISTS share_links (
              id TEXT PRIMARY KEY,
              restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
              owner_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
              token TEXT NOT NULL UNIQUE,
              selected_dish_ids TEXT NOT NULL DEFAULT '[]',
              created_at INTEGER NOT NULL
            );
            """
        )


@app.on_event("startup")
def startup() -> None:
    init_db()


def sign_value(value: str) -> str:
    signature = hmac.new(SESSION_SECRET.encode(), value.encode(), hashlib.sha256).digest()
    return f"{value}.{base64.urlsafe_b64encode(signature).decode().rstrip('=')}"


def unsign_value(signed: Optional[str]) -> Optional[str]:
    if not signed or "." not in signed:
        return None
    value, signature = signed.rsplit(".", 1)
    expected = sign_value(value).rsplit(".", 1)[1]
    if hmac.compare_digest(signature, expected):
        return value
    return None


def current_user(request: Request) -> Optional[dict[str, Any]]:
    user_id = unsign_value(request.cookies.get(SESSION_COOKIE))
    if not user_id:
        return None
    with connect() as db:
        row = db.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    return dict(row) if row else None


def require_user(request: Request) -> dict[str, Any]:
    user = current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Sign in required")
    return user


def public_user(user: Optional[dict[str, Any]]) -> Optional[dict[str, Any]]:
    if not user:
        return None
    return {
        "id": user["id"],
        "email": user["email"],
        "name": user["name"],
        "avatar_url": user["avatar_url"],
    }


def public_owner(user: Optional[dict[str, Any]]) -> Optional[dict[str, Any]]:
    if not user:
        return None
    return {
        "id": user["id"],
        "name": user["name"],
        "avatar_url": user["avatar_url"],
    }


def valid_status(status: str) -> str:
    if status not in {"visited", "want_to_go", "favorite"}:
        raise HTTPException(status_code=422, detail="Invalid restaurant status")
    return status


def valid_dish_status(status: str) -> str:
    if status not in {"liked", "tried"}:
        raise HTTPException(status_code=422, detail="Invalid dish status")
    return status


def dish_json(row: sqlite3.Row) -> dict[str, Any]:
    return {
        "id": row["id"],
        "restaurant_id": row["restaurant_id"],
        "name": row["name"],
        "dish_status": row["dish_status"],
        "rating": row["rating"],
        "image_url": f"/uploads/{row['image_path']}" if row["image_path"] else "",
        "notes": row["notes"],
        "created_at": row["created_at"],
        "updated_at": row["updated_at"],
    }


def restaurant_json(db: sqlite3.Connection, row: sqlite3.Row, include_dishes: bool = True) -> dict[str, Any]:
    payload = {
        "id": row["id"],
        "name": row["name"],
        "address": row["address"],
        "lat": row["lat"],
        "lng": row["lng"],
        "google_url": row["google_url"],
        "status": row["status"],
        "visit_count": row["visit_count"],
        "personal_rating": row["personal_rating"],
        "notes": row["notes"],
        "created_at": row["created_at"],
        "updated_at": row["updated_at"],
        "dishes": [],
    }
    if include_dishes:
        dishes = db.execute(
            "SELECT * FROM dishes WHERE restaurant_id = ? ORDER BY updated_at DESC, created_at DESC",
            (row["id"],),
        ).fetchall()
        payload["dishes"] = [dish_json(dish) for dish in dishes]
    return payload


def owned_restaurant(db: sqlite3.Connection, restaurant_id: str, user_id: str) -> sqlite3.Row:
    row = db.execute(
        "SELECT * FROM restaurants WHERE id = ? AND owner_user_id = ?",
        (restaurant_id, user_id),
    ).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return row


@app.get("/api/health")
def health() -> dict[str, Any]:
    return {"ok": True, "service": "foodiemap-fastapi"}


@app.get("/api/me")
def me(request: Request) -> dict[str, Any]:
    return {"user": public_user(current_user(request))}


@app.get("/auth/google/login")
def google_login(next: str = "/") -> RedirectResponse:
    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        raise HTTPException(status_code=503, detail="Google OAuth is not configured")
    state_data = json.dumps({"nonce": secrets.token_urlsafe(18), "next": safe_next_path(next)})
    state = base64.urlsafe_b64encode(state_data.encode()).decode()
    redirect_uri = f"{APP_BASE_URL}/auth/google/callback"
    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": "openid email profile",
        "state": state,
        "prompt": "select_account",
    }
    redirect = RedirectResponse(f"https://accounts.google.com/o/oauth2/v2/auth?{urllib.parse.urlencode(params)}")
    redirect.set_cookie(OAUTH_STATE_COOKIE, sign_value(state), httponly=True, samesite="lax", max_age=600)
    return redirect


@app.get("/auth/google/callback")
def google_callback(request: Request, code: str, state: str) -> RedirectResponse:
    expected_state = unsign_value(request.cookies.get(OAUTH_STATE_COOKIE))
    if not expected_state or not hmac.compare_digest(expected_state, state):
        raise HTTPException(status_code=400, detail="Invalid OAuth state")

    redirect_uri = f"{APP_BASE_URL}/auth/google/callback"
    token_body = urllib.parse.urlencode(
        {
            "code": code,
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "redirect_uri": redirect_uri,
            "grant_type": "authorization_code",
        }
    ).encode()
    try:
        request_obj = urllib.request.Request(
            "https://oauth2.googleapis.com/token",
            data=token_body,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        with urllib.request.urlopen(request_obj, timeout=10) as token_response:
            token_data = json.loads(token_response.read().decode())
        user_request = urllib.request.Request(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {token_data['access_token']}"},
        )
        with urllib.request.urlopen(user_request, timeout=10) as user_response:
            profile = json.loads(user_response.read().decode())
    except (KeyError, urllib.error.URLError, TimeoutError, json.JSONDecodeError) as error:
        raise HTTPException(status_code=502, detail="Google OAuth failed") from error

    user_id = new_id()
    timestamp = now()
    with connect() as db:
        existing = db.execute("SELECT * FROM users WHERE google_sub = ?", (profile["sub"],)).fetchone()
        if existing:
            user_id = existing["id"]
            db.execute(
                "UPDATE users SET email = ?, name = ?, avatar_url = ? WHERE id = ?",
                (profile.get("email", ""), profile.get("name", ""), profile.get("picture", ""), user_id),
            )
        else:
            db.execute(
                "INSERT INTO users (id, google_sub, email, name, avatar_url, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                (user_id, profile["sub"], profile.get("email", ""), profile.get("name", ""), profile.get("picture", ""), timestamp),
            )

    state_payload = json.loads(base64.urlsafe_b64decode(state.encode()).decode())
    destination = safe_next_path(state_payload.get("next") or "/")
    redirect = RedirectResponse(destination)
    redirect.set_cookie(SESSION_COOKIE, sign_value(user_id), httponly=True, samesite="lax", max_age=60 * 60 * 24 * 30)
    redirect.delete_cookie(OAUTH_STATE_COOKIE)
    return redirect


@app.post("/auth/logout")
def logout() -> JSONResponse:
    response = JSONResponse({"ok": True})
    response.delete_cookie(SESSION_COOKIE)
    return response


@app.get("/api/restaurants")
def list_restaurants(user: dict[str, Any] = Depends(require_user)) -> dict[str, Any]:
    with connect() as db:
        rows = db.execute(
            "SELECT * FROM restaurants WHERE owner_user_id = ? ORDER BY updated_at DESC, created_at DESC",
            (user["id"],),
        ).fetchall()
        return {"restaurants": [restaurant_json(db, row) for row in rows]}


@app.post("/api/restaurants")
def create_restaurant(payload: RestaurantIn, user: dict[str, Any] = Depends(require_user)) -> dict[str, Any]:
    valid_status(payload.status)
    restaurant_id = new_id()
    timestamp = now()
    with connect() as db:
        db.execute(
            """
            INSERT INTO restaurants
            (id, owner_user_id, name, address, lat, lng, google_url, status, visit_count, personal_rating, notes, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                restaurant_id,
                user["id"],
                payload.name.strip(),
                payload.address.strip(),
                payload.lat,
                payload.lng,
                payload.google_url.strip(),
                payload.status,
                payload.visit_count,
                payload.personal_rating,
                payload.notes.strip(),
                timestamp,
                timestamp,
            ),
        )
        row = owned_restaurant(db, restaurant_id, user["id"])
        return {"restaurant": restaurant_json(db, row)}


@app.get("/api/restaurants/{restaurant_id}")
def get_restaurant(restaurant_id: str, user: dict[str, Any] = Depends(require_user)) -> dict[str, Any]:
    with connect() as db:
        row = owned_restaurant(db, restaurant_id, user["id"])
        return {"restaurant": restaurant_json(db, row)}


@app.patch("/api/restaurants/{restaurant_id}")
def update_restaurant(
    restaurant_id: str,
    payload: RestaurantPatch,
    user: dict[str, Any] = Depends(require_user),
) -> dict[str, Any]:
    updates = model_values(payload)
    if "status" in updates and updates["status"] is not None:
        valid_status(updates["status"])
    if not updates:
        raise HTTPException(status_code=400, detail="No changes provided")
    allowed = ["name", "address", "lat", "lng", "google_url", "status", "visit_count", "personal_rating", "notes"]
    fields = [field for field in allowed if field in updates]
    values = [updates[field].strip() if isinstance(updates[field], str) else updates[field] for field in fields]
    fields.append("updated_at")
    values.append(now())
    values.extend([restaurant_id, user["id"]])
    with connect() as db:
        owned_restaurant(db, restaurant_id, user["id"])
        db.execute(
            f"UPDATE restaurants SET {', '.join(f'{field} = ?' for field in fields)} WHERE id = ? AND owner_user_id = ?",
            values,
        )
        row = owned_restaurant(db, restaurant_id, user["id"])
        return {"restaurant": restaurant_json(db, row)}


@app.delete("/api/restaurants/{restaurant_id}")
def delete_restaurant(restaurant_id: str, user: dict[str, Any] = Depends(require_user)) -> dict[str, Any]:
    with connect() as db:
        owned_restaurant(db, restaurant_id, user["id"])
        db.execute("DELETE FROM restaurants WHERE id = ? AND owner_user_id = ?", (restaurant_id, user["id"]))
    return {"ok": True}


@app.post("/api/restaurants/{restaurant_id}/dishes")
def create_dish(
    restaurant_id: str,
    payload: DishIn,
    user: dict[str, Any] = Depends(require_user),
) -> dict[str, Any]:
    valid_dish_status(payload.dish_status)
    dish_id = new_id()
    timestamp = now()
    with connect() as db:
        owned_restaurant(db, restaurant_id, user["id"])
        db.execute(
            """
            INSERT INTO dishes (id, restaurant_id, name, dish_status, rating, notes, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (dish_id, restaurant_id, payload.name.strip(), payload.dish_status, payload.rating, payload.notes.strip(), timestamp, timestamp),
        )
        dish = db.execute("SELECT * FROM dishes WHERE id = ?", (dish_id,)).fetchone()
        return {"dish": dish_json(dish)}


def owned_dish(db: sqlite3.Connection, dish_id: str, user_id: str) -> sqlite3.Row:
    row = db.execute(
        """
        SELECT dishes.* FROM dishes
        JOIN restaurants ON restaurants.id = dishes.restaurant_id
        WHERE dishes.id = ? AND restaurants.owner_user_id = ?
        """,
        (dish_id, user_id),
    ).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Dish not found")
    return row


@app.patch("/api/dishes/{dish_id}")
def update_dish(dish_id: str, payload: DishPatch, user: dict[str, Any] = Depends(require_user)) -> dict[str, Any]:
    updates = model_values(payload)
    if "dish_status" in updates and updates["dish_status"] is not None:
        valid_dish_status(updates["dish_status"])
    if not updates:
        raise HTTPException(status_code=400, detail="No changes provided")
    allowed = ["name", "dish_status", "rating", "notes"]
    fields = [field for field in allowed if field in updates]
    values = [updates[field].strip() if isinstance(updates[field], str) else updates[field] for field in fields]
    fields.append("updated_at")
    values.append(now())
    values.append(dish_id)
    with connect() as db:
        dish = owned_dish(db, dish_id, user["id"])
        db.execute(f"UPDATE dishes SET {', '.join(f'{field} = ?' for field in fields)} WHERE id = ?", values)
        db.execute("UPDATE restaurants SET updated_at = ? WHERE id = ?", (now(), dish["restaurant_id"]))
        updated = owned_dish(db, dish_id, user["id"])
        return {"dish": dish_json(updated)}


@app.post("/api/dishes/{dish_id}/image")
async def upload_dish_image(
    dish_id: str,
    image: UploadFile = File(...),
    user: dict[str, Any] = Depends(require_user),
) -> dict[str, Any]:
    if image.content_type not in {"image/jpeg", "image/png", "image/webp"}:
        raise HTTPException(status_code=415, detail="Only JPEG, PNG, and WebP images are supported")
    suffix = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp" }[image.content_type]
    data = await image.read()
    if len(data) > 1_200_000:
        raise HTTPException(status_code=413, detail="Image is too large")
    with connect() as db:
        dish = owned_dish(db, dish_id, user["id"])
        filename = f"{dish_id}-{secrets.token_hex(6)}{suffix}"
        (UPLOAD_DIR / filename).write_bytes(data)
        if dish["image_path"]:
            old_path = UPLOAD_DIR / dish["image_path"]
            if old_path.exists():
                old_path.unlink()
        db.execute("UPDATE dishes SET image_path = ?, updated_at = ? WHERE id = ?", (filename, now(), dish_id))
        db.execute("UPDATE restaurants SET updated_at = ? WHERE id = ?", (now(), dish["restaurant_id"]))
        updated = owned_dish(db, dish_id, user["id"])
        return {"dish": dish_json(updated)}


@app.delete("/api/dishes/{dish_id}")
def delete_dish(dish_id: str, user: dict[str, Any] = Depends(require_user)) -> dict[str, Any]:
    with connect() as db:
        dish = owned_dish(db, dish_id, user["id"])
        if dish["image_path"]:
            image_path = UPLOAD_DIR / dish["image_path"]
            if image_path.exists():
                image_path.unlink()
        db.execute("DELETE FROM dishes WHERE id = ?", (dish_id,))
        db.execute("UPDATE restaurants SET updated_at = ? WHERE id = ?", (now(), dish["restaurant_id"]))
    return {"ok": True}


@app.post("/api/restaurants/{restaurant_id}/share")
def create_share(restaurant_id: str, payload: ShareIn, user: dict[str, Any] = Depends(require_user)) -> dict[str, Any]:
    token = secrets.token_urlsafe(16)
    timestamp = now()
    with connect() as db:
        owned_restaurant(db, restaurant_id, user["id"])
        valid_dishes = db.execute(
            f"SELECT id FROM dishes WHERE restaurant_id = ? AND id IN ({','.join('?' for _ in payload.selected_dish_ids)})"
            if payload.selected_dish_ids
            else "SELECT id FROM dishes WHERE restaurant_id = ? AND 0",
            [restaurant_id, *payload.selected_dish_ids],
        ).fetchall()
        selected_ids = [row["id"] for row in valid_dishes]
        db.execute(
            "INSERT INTO share_links (id, restaurant_id, owner_user_id, token, selected_dish_ids, created_at) VALUES (?, ?, ?, ?, ?, ?)",
            (new_id(), restaurant_id, user["id"], token, json.dumps(selected_ids), timestamp),
        )
    return {"share_url": f"{APP_BASE_URL}/share/{token}", "token": token}


def share_payload(token: str) -> dict[str, Any]:
    with connect() as db:
        share = db.execute("SELECT * FROM share_links WHERE token = ?", (token,)).fetchone()
        if not share:
            raise HTTPException(status_code=404, detail="Share not found")
        restaurant = db.execute("SELECT * FROM restaurants WHERE id = ?", (share["restaurant_id"],)).fetchone()
        owner = db.execute("SELECT * FROM users WHERE id = ?", (share["owner_user_id"],)).fetchone()
        selected_ids = json.loads(share["selected_dish_ids"] or "[]")
        dishes: list[dict[str, Any]] = []
        if selected_ids:
            rows = db.execute(
                f"SELECT * FROM dishes WHERE restaurant_id = ? AND id IN ({','.join('?' for _ in selected_ids)})",
                [restaurant["id"], *selected_ids],
            ).fetchall()
            dishes = [dish_json(row) for row in rows]
        return {
            "share": {
                "token": share["token"],
                "created_at": share["created_at"],
                "owner": public_owner(dict(owner)) if owner else None,
                "restaurant": restaurant_json(db, restaurant, include_dishes=False),
                "dishes": dishes,
            }
        }


@app.get("/api/share/{token}")
def get_share(token: str) -> dict[str, Any]:
    return share_payload(token)


@app.post("/api/share/{token}/add")
def add_shared_restaurant(token: str, user: dict[str, Any] = Depends(require_user)) -> dict[str, Any]:
    payload = share_payload(token)["share"]
    source = payload["restaurant"]
    timestamp = now()
    restaurant_id = new_id()
    with connect() as db:
        db.execute(
            """
            INSERT INTO restaurants
            (id, owner_user_id, name, address, lat, lng, google_url, status, visit_count, personal_rating, notes, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'want_to_go', 0, 0, ?, ?, ?)
            """,
            (
                restaurant_id,
                user["id"],
                source["name"],
                source["address"],
                source["lat"],
                source["lng"],
                source["google_url"],
                f"来自分享：{payload['owner']['name'] if payload.get('owner') else 'FoodieMap'}",
                timestamp,
                timestamp,
            ),
        )
        for dish in payload["dishes"]:
            db.execute(
                """
                INSERT INTO dishes (id, restaurant_id, name, dish_status, rating, image_path, notes, created_at, updated_at)
                VALUES (?, ?, ?, 'tried', ?, '', ?, ?, ?)
                """,
                (new_id(), restaurant_id, dish["name"], dish["rating"], dish["notes"], timestamp, timestamp),
            )
        row = owned_restaurant(db, restaurant_id, user["id"])
        return {"restaurant": restaurant_json(db, row)}


@app.get("/api/resolve-google-link")
def resolve_google_link(url: str) -> dict[str, str]:
    target = urllib.parse.urlparse(url.strip())
    if target.scheme not in {"http", "https"} or target.netloc not in ALLOWED_SHORT_HOSTS:
        raise HTTPException(status_code=400, detail="只支持 Google Maps 短链接。")
    try:
        request = urllib.request.Request(
            url,
            headers={
                "User-Agent": "Mozilla/5.0 FoodieMapResolver/1.0",
                "Accept": "text/html,application/xhtml+xml",
            },
        )
        with urllib.request.urlopen(request, timeout=8) as response:
            final_url = response.geturl()
    except (urllib.error.URLError, TimeoutError) as error:
        raise HTTPException(status_code=502, detail="短链接展开失败，请在浏览器打开后复制完整链接。") from error
    return {"url": final_url}


app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


@app.get("/{path:path}")
def index_fallback(path: str) -> FileResponse:
    static_file = ROOT / path
    if path in PUBLIC_FILES and static_file.is_file() and static_file.parent == ROOT:
        return FileResponse(static_file, headers={"Cache-Control": "no-store"})
    return FileResponse(ROOT / "index.html", headers={"Cache-Control": "no-store"})


def main() -> None:
    import uvicorn

    port = int(sys.argv[1]) if len(sys.argv) > 1 else int(os.getenv("PORT", "5173"))
    uvicorn.run("server:app", host="0.0.0.0", port=port, reload=False)


if __name__ == "__main__":
    main()
