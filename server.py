#!/usr/bin/env python3
from __future__ import annotations

import base64
from contextlib import asynccontextmanager
import hashlib
import html as html_lib
import hmac
import json
import os
import io
import re
import secrets
import smtplib
import sqlite3
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid
from email.message import EmailMessage
from pathlib import Path
from typing import Any, Optional

from fastapi import Depends, FastAPI, File, HTTPException, Request, UploadFile
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse, RedirectResponse, Response
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from foodiemap_service import FoodieMapService
from oauth_service import OAuthService, SUPPORTED_SCOPES

try:
    import psycopg
    from psycopg.rows import dict_row
except ImportError:  # Optional until DATABASE_URL points at PostgreSQL.
    psycopg = None
    dict_row = None

try:
    from google.cloud import storage as gcs_storage
    from google.api_core.exceptions import NotFound as GcsNotFound
except ImportError:  # Optional until GCS_BUCKET is configured.
    gcs_storage = None
    GcsNotFound = None


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

APP_ENV = os.getenv("APP_ENV", "development").strip().lower()
DATABASE_URL = os.getenv("DATABASE_URL", "")
DATA_DIR = Path(os.getenv("DATA_DIR", ROOT / "data"))
UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", DATA_DIR / "uploads"))
DB_PATH = Path(DATABASE_URL or os.getenv("SQLITE_DATABASE_PATH", DATA_DIR / "foodiemap.db"))
GCS_BUCKET = os.getenv("GCS_BUCKET", "")
GCS_PUBLIC_BASE_URL = os.getenv("GCS_PUBLIC_BASE_URL", "").rstrip("/")
APP_BASE_URL = os.getenv("APP_BASE_URL", "http://localhost:5174").rstrip("/")
SESSION_SECRET = os.getenv("SESSION_SECRET", "dev-change-me")
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
GOOGLE_GEOCODING_API_KEY = os.getenv("GOOGLE_GEOCODING_API_KEY", "") or os.getenv("GOOGLE_MAPS_API_KEY", "")
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "")
FREE_RESTAURANT_LIMIT = int(os.getenv("FREE_RESTAURANT_LIMIT", "50"))
SMTP_HOST = os.getenv("SMTP_HOST", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM = os.getenv("SMTP_FROM", SMTP_USERNAME)
SMTP_USE_TLS = os.getenv("SMTP_USE_TLS", "true").strip().lower() not in {"0", "false", "no", "off"}
E2E_CLEANUP_TOKEN = os.getenv("E2E_CLEANUP_TOKEN", "")
MCP_PUBLIC_URL = os.getenv("MCP_PUBLIC_URL", f"{APP_BASE_URL}/mcp").rstrip("/")
MCP_ISSUER_URL = os.getenv("MCP_ISSUER_URL", APP_BASE_URL).rstrip("/")
MCP_ALLOWED_ORIGINS = [value.strip() for value in os.getenv("MCP_ALLOWED_ORIGINS", "").split(",") if value.strip()]
OAUTH_TOKEN_SECRET = os.getenv("OAUTH_TOKEN_SECRET", SESSION_SECRET)
ALLOWED_SHORT_HOSTS = {"maps.app.goo.gl", "goo.gl", "maps.apple.com"}
SESSION_COOKIE = "foodiemap_session"
ADMIN_SESSION_COOKIE = "foodiemap_admin_session"
OAUTH_STATE_COOKIE = "foodiemap_oauth_state"
PUBLIC_FILES = {
    "index.html",
    "app.js",
    "location-core.mjs",
    "ui-core.mjs",
    "ui-shell.mjs",
    "ui-dialogs.mjs",
    "ui-components.mjs",
    "data-client.mjs",
    "domain-core.mjs",
    "view-templates.mjs",
    "list-view-templates.mjs",
    "styles.css",
    "ui-tokens.css",
    "ui-shell.css",
}
INSECURE_SESSION_SECRETS = {"", "dev-change-me", "change-me-in-production"}
PASSWORD_HASH_ITERATIONS = 310_000
EMAIL_CODE_TTL_SECONDS = 10 * 60
EMAIL_CODE_REQUEST_INTERVAL_SECONDS = 60
EMAIL_CODE_MAX_ATTEMPTS = 5
SHARE_CARD_WIDTH = 960
SHARE_CARD_HEIGHT = 1280

DATA_DIR.mkdir(parents=True, exist_ok=True)
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI(title="FoodieMap")
DB_INTEGRITY_ERRORS = (sqlite3.IntegrityError,)
if psycopg is not None:
    DB_INTEGRITY_ERRORS = DB_INTEGRITY_ERRORS + (psycopg.IntegrityError,)


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


class ReverseGeocodeIn(BaseModel):
    lat: float = Field(ge=-90, le=90)
    lng: float = Field(ge=-180, le=180)
    key: str = ""


class E2ECleanupIn(BaseModel):
    email: str = Field(min_length=1, max_length=320)


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


class SharePackItemIn(BaseModel):
    restaurant_id: str
    dish_ids: list[str] = Field(default_factory=list)
    note: str = ""


class SharePackIn(BaseModel):
    title: str = Field(min_length=1, max_length=160)
    description: str = ""
    items: list[SharePackItemIn] = Field(default_factory=list)


class RecipeIn(BaseModel):
    title: str = Field(min_length=1, max_length=180)
    ingredients: str = ""
    steps: str = ""
    notes: str = ""
    rating: float = Field(default=0, ge=0, le=5)
    cooked_at: int = Field(default=0, ge=0)


class RecipePatch(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=180)
    ingredients: Optional[str] = None
    steps: Optional[str] = None
    notes: Optional[str] = None
    rating: Optional[float] = Field(default=None, ge=0, le=5)
    cooked_at: Optional[int] = Field(default=None, ge=0)


class ListIn(BaseModel):
    title: str = Field(min_length=1, max_length=160)
    description: str = ""
    cover_image_url: str = ""


class ListPatch(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=160)
    description: Optional[str] = None
    cover_image_url: Optional[str] = None
    visibility: Optional[str] = None


class ListItemIn(BaseModel):
    restaurant_id: str
    note: str = ""


class AdminUserPatch(BaseModel):
    account_status: Optional[str] = None
    plan: Optional[str] = None


class AdminLoginIn(BaseModel):
    username: str = Field(min_length=1, max_length=120)
    password: str = Field(min_length=1, max_length=256)


class EmailRegisterIn(BaseModel):
    email: str = Field(min_length=3, max_length=254)
    password: str = Field(min_length=8, max_length=256)
    name: str = Field(default="", max_length=120)


class EmailLoginIn(BaseModel):
    email: str = Field(min_length=3, max_length=254)
    password: str = Field(min_length=1, max_length=256)


class EmailCodeRequestIn(BaseModel):
    email: str = Field(min_length=3, max_length=254)
    lang: str = "en"


class EmailCodeVerifyIn(BaseModel):
    email: str = Field(min_length=3, max_length=254)
    code: str = Field(min_length=4, max_length=12)


class PasswordResetRequestIn(BaseModel):
    email: str = Field(min_length=3, max_length=254)
    lang: str = "en"


class PasswordResetConfirmIn(BaseModel):
    email: str = Field(min_length=3, max_length=254)
    code: str = Field(min_length=4, max_length=12)
    password: str = Field(min_length=8, max_length=256)


def now() -> int:
    return int(time.time())


def model_values(model: BaseModel) -> dict[str, Any]:
    if hasattr(model, "model_dump"):
        return model.model_dump(exclude_unset=True)
    return model.dict(exclude_unset=True)


def validate_config() -> None:
    if SESSION_SECRET in INSECURE_SESSION_SECRETS or len(SESSION_SECRET) < 32:
        raise RuntimeError("SESSION_SECRET must be set to a random value of at least 32 characters")
    if bool(ADMIN_USERNAME) != bool(ADMIN_PASSWORD):
        raise RuntimeError("ADMIN_USERNAME and ADMIN_PASSWORD must be configured together")
    if ADMIN_PASSWORD and len(ADMIN_PASSWORD) < 8:
        raise RuntimeError("ADMIN_PASSWORD must be at least 8 characters")
    if len(OAUTH_TOKEN_SECRET) < 32:
        raise RuntimeError("OAUTH_TOKEN_SECRET must be at least 32 characters")
    if APP_ENV == "production" and OAUTH_TOKEN_SECRET == SESSION_SECRET:
        raise RuntimeError("Production OAUTH_TOKEN_SECRET must be distinct from SESSION_SECRET")


def secure_cookie_enabled() -> bool:
    return APP_BASE_URL.startswith("https://")


def safe_next_path(value: str) -> str:
    if not value or not value.startswith("/") or value.startswith("//"):
        return "/"
    parsed = urllib.parse.urlparse(value)
    if parsed.scheme or parsed.netloc:
        return "/"
    return value


def new_id() -> str:
    return str(uuid.uuid4())


def uses_postgres() -> bool:
    return DATABASE_URL.startswith(("postgresql://", "postgres://"))


def sql_for_driver(sql: str) -> str:
    if not uses_postgres():
        return sql
    return sql.replace("?", "%s")


class PostgresConnection:
    def __init__(self) -> None:
        if psycopg is None or dict_row is None:
            raise RuntimeError("psycopg[binary] is required when DATABASE_URL points at PostgreSQL")
        self.connection = psycopg.connect(DATABASE_URL, row_factory=dict_row)

    def __enter__(self) -> "PostgresConnection":
        return self

    def __exit__(self, exc_type: Any, exc: Any, traceback: Any) -> None:
        if exc_type:
            self.connection.rollback()
        else:
            self.connection.commit()
        self.connection.close()

    def execute(self, sql: str, params: tuple[Any, ...] | list[Any] = ()) -> Any:
        return self.connection.execute(sql_for_driver(sql), params)

    def executescript(self, script: str) -> None:
        for statement in script.split(";"):
            statement = statement.strip()
            if statement:
                self.execute(statement)


def connect() -> Any:
    if uses_postgres():
        return PostgresConnection()
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


def ensure_column(db: Any, table: str, column: str, definition: str) -> None:
    if uses_postgres():
        rows = db.execute(
            """
            SELECT column_name AS name
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = ?
            """,
            (table,),
        ).fetchall()
    else:
        rows = db.execute(f"PRAGMA table_info({table})").fetchall()
    columns = {row["name"] for row in rows}
    if column not in columns:
        db.execute(f"ALTER TABLE {table} ADD COLUMN {column} {definition}")


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
              created_at INTEGER NOT NULL,
              updated_at INTEGER NOT NULL DEFAULT 0,
              account_status TEXT NOT NULL DEFAULT 'active',
              plan TEXT NOT NULL DEFAULT 'free',
              password_hash TEXT NOT NULL DEFAULT '',
              email_verified_at INTEGER,
              last_login_at INTEGER,
              suspended_at INTEGER,
              deleted_at INTEGER
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

            CREATE TABLE IF NOT EXISTS share_packs (
              id TEXT PRIMARY KEY,
              owner_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
              token TEXT NOT NULL UNIQUE,
              title TEXT NOT NULL,
              description TEXT NOT NULL DEFAULT '',
              snapshot_json TEXT NOT NULL DEFAULT '',
              created_at INTEGER NOT NULL
            );

            CREATE TABLE IF NOT EXISTS share_pack_items (
              id TEXT PRIMARY KEY,
              share_pack_id TEXT NOT NULL REFERENCES share_packs(id) ON DELETE CASCADE,
              restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
              note TEXT NOT NULL DEFAULT '',
              snapshot_json TEXT NOT NULL DEFAULT '',
              sort_order INTEGER NOT NULL DEFAULT 0,
              created_at INTEGER NOT NULL
            );

            CREATE TABLE IF NOT EXISTS share_pack_dishes (
              id TEXT PRIMARY KEY,
              share_pack_item_id TEXT NOT NULL REFERENCES share_pack_items(id) ON DELETE CASCADE,
              dish_id TEXT NOT NULL REFERENCES dishes(id) ON DELETE CASCADE,
              sort_order INTEGER NOT NULL DEFAULT 0,
              created_at INTEGER NOT NULL
            );

            CREATE TABLE IF NOT EXISTS recipes (
              id TEXT PRIMARY KEY,
              owner_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
              title TEXT NOT NULL,
              ingredients TEXT NOT NULL DEFAULT '',
              steps TEXT NOT NULL DEFAULT '',
              notes TEXT NOT NULL DEFAULT '',
              rating REAL NOT NULL DEFAULT 0,
              cooked_at INTEGER NOT NULL DEFAULT 0,
              image_path TEXT NOT NULL DEFAULT '',
              created_at INTEGER NOT NULL,
              updated_at INTEGER NOT NULL
            );

            CREATE TABLE IF NOT EXISTS recipe_shares (
              id TEXT PRIMARY KEY,
              owner_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
              recipe_id TEXT REFERENCES recipes(id) ON DELETE SET NULL,
              token TEXT NOT NULL UNIQUE,
              snapshot_json TEXT NOT NULL,
              created_at INTEGER NOT NULL
            );

            CREATE TABLE IF NOT EXISTS lists (
              id TEXT PRIMARY KEY,
              owner_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
              title TEXT NOT NULL,
              description TEXT NOT NULL DEFAULT '',
              visibility TEXT NOT NULL DEFAULT 'private',
              cover_image_url TEXT NOT NULL DEFAULT '',
              copy_count INTEGER NOT NULL DEFAULT 0,
              created_at INTEGER NOT NULL,
              updated_at INTEGER NOT NULL,
              published_at INTEGER
            );

            CREATE TABLE IF NOT EXISTS list_items (
              id TEXT PRIMARY KEY,
              list_id TEXT NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
              restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
              note TEXT NOT NULL DEFAULT '',
              sort_order INTEGER NOT NULL DEFAULT 0,
              created_at INTEGER NOT NULL,
              UNIQUE(list_id, restaurant_id)
            );

            CREATE TABLE IF NOT EXISTS auth_codes (
              id TEXT PRIMARY KEY,
              email TEXT NOT NULL,
              purpose TEXT NOT NULL,
              code_hash TEXT NOT NULL,
              created_at INTEGER NOT NULL,
              expires_at INTEGER NOT NULL,
              attempts INTEGER NOT NULL DEFAULT 0,
              used_at INTEGER
            );

            CREATE TABLE IF NOT EXISTS oauth_clients (
              client_id TEXT PRIMARY KEY,
              client_name TEXT NOT NULL,
              redirect_uris_json TEXT NOT NULL,
              grant_types_json TEXT NOT NULL,
              response_types_json TEXT NOT NULL,
              token_endpoint_auth_method TEXT NOT NULL,
              client_secret_hash TEXT NOT NULL DEFAULT '',
              created_at INTEGER NOT NULL
            );

            CREATE TABLE IF NOT EXISTS oauth_grants (
              id TEXT PRIMARY KEY,
              user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
              client_id TEXT NOT NULL REFERENCES oauth_clients(client_id) ON DELETE CASCADE,
              scopes_json TEXT NOT NULL,
              created_at INTEGER NOT NULL,
              updated_at INTEGER NOT NULL,
              last_used_at INTEGER,
              revoked_at INTEGER,
              UNIQUE(user_id, client_id)
            );

            CREATE TABLE IF NOT EXISTS oauth_authorization_codes (
              code_hash TEXT PRIMARY KEY,
              grant_id TEXT NOT NULL REFERENCES oauth_grants(id) ON DELETE CASCADE,
              client_id TEXT NOT NULL REFERENCES oauth_clients(client_id) ON DELETE CASCADE,
              user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
              redirect_uri TEXT NOT NULL,
              scopes_json TEXT NOT NULL,
              code_challenge TEXT NOT NULL,
              resource TEXT NOT NULL,
              expires_at INTEGER NOT NULL,
              created_at INTEGER NOT NULL,
              used_at INTEGER
            );

            CREATE TABLE IF NOT EXISTS oauth_access_tokens (
              token_hash TEXT PRIMARY KEY,
              grant_id TEXT NOT NULL REFERENCES oauth_grants(id) ON DELETE CASCADE,
              client_id TEXT NOT NULL REFERENCES oauth_clients(client_id) ON DELETE CASCADE,
              user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
              scopes_json TEXT NOT NULL,
              resource TEXT NOT NULL,
              expires_at INTEGER NOT NULL,
              created_at INTEGER NOT NULL,
              last_used_at INTEGER,
              revoked_at INTEGER
            );

            CREATE TABLE IF NOT EXISTS oauth_refresh_tokens (
              token_hash TEXT PRIMARY KEY,
              family_id TEXT NOT NULL,
              grant_id TEXT NOT NULL REFERENCES oauth_grants(id) ON DELETE CASCADE,
              client_id TEXT NOT NULL REFERENCES oauth_clients(client_id) ON DELETE CASCADE,
              user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
              scopes_json TEXT NOT NULL,
              resource TEXT NOT NULL,
              expires_at INTEGER NOT NULL,
              created_at INTEGER NOT NULL,
              used_at INTEGER,
              revoked_at INTEGER
            );

            CREATE TABLE IF NOT EXISTS mcp_audit_events (
              id TEXT PRIMARY KEY,
              user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
              client_id TEXT NOT NULL REFERENCES oauth_clients(client_id) ON DELETE CASCADE,
              tool_name TEXT NOT NULL,
              status TEXT NOT NULL,
              created_at INTEGER NOT NULL
            );
            """
        )
        ensure_column(db, "users", "updated_at", "INTEGER NOT NULL DEFAULT 0")
        ensure_column(db, "users", "account_status", "TEXT NOT NULL DEFAULT 'active'")
        ensure_column(db, "users", "plan", "TEXT NOT NULL DEFAULT 'free'")
        ensure_column(db, "users", "password_hash", "TEXT NOT NULL DEFAULT ''")
        ensure_column(db, "users", "email_verified_at", "INTEGER")
        ensure_column(db, "users", "last_login_at", "INTEGER")
        ensure_column(db, "users", "suspended_at", "INTEGER")
        ensure_column(db, "users", "deleted_at", "INTEGER")
        ensure_column(db, "share_packs", "snapshot_json", "TEXT NOT NULL DEFAULT ''")
        ensure_column(db, "share_pack_items", "snapshot_json", "TEXT NOT NULL DEFAULT ''")
        db.execute("UPDATE users SET updated_at = created_at WHERE updated_at = 0")
        duplicate = db.execute(
            """
            SELECT LOWER(email) AS normalized_email, COUNT(*) AS count
            FROM users
            GROUP BY LOWER(email)
            HAVING COUNT(*) > 1
            LIMIT 1
            """
        ).fetchone()
        if duplicate:
            raise RuntimeError(f"Duplicate user email blocks auth migration: {duplicate['normalized_email']}")
        db.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_lower ON users(LOWER(email))")
        db.execute("CREATE INDEX IF NOT EXISTS idx_auth_codes_email_purpose ON auth_codes(email, purpose, created_at)")
        db.execute("CREATE INDEX IF NOT EXISTS idx_oauth_access_token_grant ON oauth_access_tokens(grant_id)")
        db.execute("CREATE INDEX IF NOT EXISTS idx_oauth_refresh_token_grant ON oauth_refresh_tokens(grant_id)")
        db.execute("CREATE INDEX IF NOT EXISTS idx_mcp_audit_user_created ON mcp_audit_events(user_id, created_at)")
        timestamp = now()
        db.execute("DELETE FROM oauth_authorization_codes WHERE expires_at < ?", (timestamp,))
        db.execute("DELETE FROM oauth_access_tokens WHERE expires_at < ?", (timestamp - 7 * 24 * 60 * 60,))
        db.execute("DELETE FROM oauth_refresh_tokens WHERE expires_at < ?", (timestamp,))


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


def session_response(user_id: str) -> JSONResponse:
    response = JSONResponse({"ok": True})
    response.set_cookie(
        SESSION_COOKIE,
        sign_value(user_id),
        httponly=True,
        samesite="lax",
        secure=secure_cookie_enabled(),
        max_age=60 * 60 * 24 * 30,
    )
    return response


def admin_session_response() -> JSONResponse:
    response = JSONResponse({"ok": True, "admin": admin_identity()})
    response.set_cookie(
        ADMIN_SESSION_COOKIE,
        sign_value(f"admin:{ADMIN_USERNAME}"),
        httponly=True,
        samesite="lax",
        secure=secure_cookie_enabled(),
        max_age=60 * 60 * 8,
    )
    return response


def normalize_email(email: str) -> str:
    normalized = email.strip().lower()
    if "@" not in normalized or normalized.startswith("@") or normalized.endswith("@") or len(normalized) > 254:
        raise HTTPException(status_code=422, detail="Enter a valid email address")
    return normalized


def display_name_from_email(email: str) -> str:
    return email.split("@", 1)[0].strip() or email


def validate_password(password: str) -> str:
    if len(password) < 8:
        raise HTTPException(status_code=422, detail="Password must be at least 8 characters")
    return password


def hash_password(password: str) -> str:
    salt = secrets.token_urlsafe(18)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), PASSWORD_HASH_ITERATIONS)
    encoded = base64.urlsafe_b64encode(digest).decode().rstrip("=")
    return f"pbkdf2_sha256${PASSWORD_HASH_ITERATIONS}${salt}${encoded}"


def verify_password(password: str, stored_hash: str) -> bool:
    try:
        algorithm, iterations, salt, expected = stored_hash.split("$", 3)
        if algorithm != "pbkdf2_sha256":
            return False
        digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), int(iterations))
        actual = base64.urlsafe_b64encode(digest).decode().rstrip("=")
        return hmac.compare_digest(actual, expected)
    except (ValueError, TypeError):
        return False


def auth_code_hash(email: str, purpose: str, code: str) -> str:
    message = f"{purpose}:{email}:{code}".encode()
    return hmac.new(SESSION_SECRET.encode(), message, hashlib.sha256).hexdigest()


def smtp_configured() -> bool:
    return bool(SMTP_HOST and SMTP_FROM)


def send_email(to_email: str, subject: str, body: str) -> None:
    if not smtp_configured():
        raise HTTPException(status_code=503, detail="Email delivery is not configured")
    message = EmailMessage()
    message["From"] = SMTP_FROM
    message["To"] = to_email
    message["Subject"] = subject
    message.set_content(body)
    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10) as smtp:
            if SMTP_USE_TLS:
                smtp.starttls()
            if SMTP_USERNAME or SMTP_PASSWORD:
                smtp.login(SMTP_USERNAME, SMTP_PASSWORD)
            smtp.send_message(message)
    except OSError as error:
        raise HTTPException(status_code=502, detail="Email delivery failed") from error


def send_auth_code_email(email: str, purpose: str, code: str, lang: str = "en") -> None:
    is_zh = lang == "zh"
    if purpose == "password_reset":
        subject = "FoodieMap password reset code" if not is_zh else "FoodieMap 密码重置验证码"
        body = (
            f"Your FoodieMap password reset code is {code}.\nIt expires in 10 minutes.\n"
            if not is_zh
            else f"你的 FoodieMap 密码重置验证码是 {code}。\n验证码 10 分钟内有效。\n"
        )
    else:
        subject = "FoodieMap sign-in code" if not is_zh else "FoodieMap 登录验证码"
        body = (
            f"Your FoodieMap sign-in code is {code}.\nIt expires in 10 minutes.\n"
            if not is_zh
            else f"你的 FoodieMap 登录验证码是 {code}。\n验证码 10 分钟内有效。\n"
        )
    send_email(email, subject, body)


def create_auth_code(db: sqlite3.Connection, email: str, purpose: str, lang: str = "en") -> None:
    timestamp = now()
    recent = db.execute(
        """
        SELECT created_at FROM auth_codes
        WHERE email = ? AND purpose = ? AND used_at IS NULL
        ORDER BY created_at DESC
        LIMIT 1
        """,
        (email, purpose),
    ).fetchone()
    if recent and timestamp - int(recent["created_at"]) < EMAIL_CODE_REQUEST_INTERVAL_SECONDS:
        raise HTTPException(status_code=429, detail="Please wait before requesting another code")
    code = f"{secrets.randbelow(1_000_000):06d}"
    db.execute(
        """
        INSERT INTO auth_codes (id, email, purpose, code_hash, created_at, expires_at)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (new_id(), email, purpose, auth_code_hash(email, purpose, code), timestamp, timestamp + EMAIL_CODE_TTL_SECONDS),
    )
    send_auth_code_email(email, purpose, code, lang)


def consume_auth_code(db: sqlite3.Connection, email: str, purpose: str, code: str) -> None:
    timestamp = now()
    row = db.execute(
        """
        SELECT * FROM auth_codes
        WHERE email = ? AND purpose = ? AND used_at IS NULL
        ORDER BY created_at DESC
        LIMIT 1
        """,
        (email, purpose),
    ).fetchone()
    if not row:
        raise HTTPException(status_code=400, detail="Invalid or expired code")
    if int(row["expires_at"]) < timestamp:
        raise HTTPException(status_code=400, detail="Invalid or expired code")
    if int(row["attempts"]) >= EMAIL_CODE_MAX_ATTEMPTS:
        raise HTTPException(status_code=400, detail="Too many code attempts")
    if not hmac.compare_digest(row["code_hash"], auth_code_hash(email, purpose, code.strip())):
        db.execute("UPDATE auth_codes SET attempts = attempts + 1 WHERE id = ?", (row["id"],))
        raise HTTPException(status_code=400, detail="Invalid or expired code")
    db.execute("UPDATE auth_codes SET used_at = ? WHERE id = ?", (timestamp, row["id"]))


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
    if user.get("account_status", "active") != "active":
        raise HTTPException(status_code=403, detail="Account is not active")
    return user


def admin_configured() -> bool:
    return bool(ADMIN_USERNAME and ADMIN_PASSWORD)


def admin_identity() -> dict[str, Any]:
    return {
        "id": "local-admin",
        "username": ADMIN_USERNAME or "admin",
        "email": "admin@local.foodiemap",
        "name": "Admin",
        "is_admin": True,
        "account_status": "active",
        "plan": "paid",
    }


def current_admin(request: Request) -> Optional[dict[str, Any]]:
    if not admin_configured():
        return None
    value = unsign_value(request.cookies.get(ADMIN_SESSION_COOKIE))
    if value == f"admin:{ADMIN_USERNAME}":
        return admin_identity()
    return None


def require_admin(request: Request) -> dict[str, Any]:
    admin = current_admin(request)
    if not admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return admin


def valid_account_status(status: str) -> str:
    if status not in {"active", "suspended", "deleted"}:
        raise HTTPException(status_code=422, detail="Invalid account status")
    return status


def valid_plan(plan: str) -> str:
    if plan not in {"free", "paid"}:
        raise HTTPException(status_code=422, detail="Invalid account plan")
    return plan


def restaurant_count(db: sqlite3.Connection, user_id: str) -> int:
    row = db.execute("SELECT COUNT(*) AS count FROM restaurants WHERE owner_user_id = ?", (user_id,)).fetchone()
    return int(row["count"] if row else 0)


def remaining_restaurant_slots(db: sqlite3.Connection, user: dict[str, Any]) -> Optional[int]:
    if user.get("plan") == "paid":
        return None
    return max(0, FREE_RESTAURANT_LIMIT - restaurant_count(db, user["id"]))


def require_restaurant_capacity(db: sqlite3.Connection, user: dict[str, Any], add_count: int = 1) -> None:
    if user.get("plan") == "paid":
        return
    current_count = restaurant_count(db, user["id"])
    if current_count + add_count > FREE_RESTAURANT_LIMIT:
        raise HTTPException(
            status_code=403,
            detail=f"Free accounts can store up to {FREE_RESTAURANT_LIMIT} restaurants. Upgrade or delete restaurants before adding more.",
        )


def user_by_email(db: sqlite3.Connection, email: str) -> Optional[sqlite3.Row]:
    return db.execute("SELECT * FROM users WHERE LOWER(email) = ?", (normalize_email(email),)).fetchone()


def ensure_active_account(row: sqlite3.Row) -> None:
    if row["account_status"] != "active":
        raise HTTPException(status_code=403, detail="Account is not active")


def create_email_user(db: sqlite3.Connection, email: str, name: str = "", password_hash: str = "") -> sqlite3.Row:
    normalized_email = normalize_email(email)
    timestamp = now()
    user_id = new_id()
    db.execute(
        """
        INSERT INTO users (id, google_sub, email, name, avatar_url, password_hash, created_at, updated_at, last_login_at)
        VALUES (?, ?, ?, ?, '', ?, ?, ?, ?)
        """,
        (
            user_id,
            f"email:{normalized_email}",
            normalized_email,
            name.strip() or display_name_from_email(normalized_email),
            password_hash,
            timestamp,
            timestamp,
            timestamp,
        ),
    )
    return db.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()


def touch_login(db: sqlite3.Connection, user_id: str, email_verified: bool = False) -> None:
    timestamp = now()
    if email_verified:
        db.execute(
            "UPDATE users SET last_login_at = ?, email_verified_at = COALESCE(email_verified_at, ?), updated_at = ? WHERE id = ?",
            (timestamp, timestamp, timestamp, user_id),
        )
    else:
        db.execute("UPDATE users SET last_login_at = ?, updated_at = ? WHERE id = ?", (timestamp, timestamp, user_id))


def auth_methods(row: Any) -> list[str]:
    methods: list[str] = []
    google_sub = row["google_sub"] if isinstance(row, sqlite3.Row) else row.get("google_sub", "")
    password_hash = row["password_hash"] if isinstance(row, sqlite3.Row) else row.get("password_hash", "")
    if google_sub and not str(google_sub).startswith("email:"):
        methods.append("google")
    if password_hash:
        methods.append("password")
    methods.append("email_code")
    return methods


def public_user(user: Optional[dict[str, Any]]) -> Optional[dict[str, Any]]:
    if not user:
        return None
    return {
        "id": user["id"],
        "email": user["email"],
        "name": user["name"],
        "avatar_url": user["avatar_url"],
        "is_admin": False,
        "account_status": user.get("account_status", "active"),
        "plan": user.get("plan", "free"),
        "auth_methods": auth_methods(user),
    }


def public_owner(user: Optional[dict[str, Any]]) -> Optional[dict[str, Any]]:
    if not user:
        return None
    return {
        "id": user["id"],
        "name": user["name"],
        "avatar_url": user["avatar_url"],
    }


def admin_user_json(db: sqlite3.Connection, row: sqlite3.Row) -> dict[str, Any]:
    user_id = row["id"]
    counts = db.execute(
        """
        SELECT
          (SELECT COUNT(*) FROM restaurants WHERE owner_user_id = ?) AS restaurant_count,
          (SELECT COUNT(*) FROM lists WHERE owner_user_id = ?) AS list_count,
          (SELECT COUNT(*) FROM lists WHERE owner_user_id = ? AND visibility = 'public') AS public_list_count
        """,
        (user_id, user_id, user_id),
    ).fetchone()
    restaurant_total = int(counts["restaurant_count"] or 0)
    return {
        "id": user_id,
        "email": row["email"],
        "name": row["name"],
        "avatar_url": row["avatar_url"],
        "is_admin": False,
        "account_status": row["account_status"],
        "plan": row["plan"],
        "auth_methods": auth_methods(row),
        "restaurant_count": restaurant_total,
        "restaurant_limit": None if row["plan"] == "paid" else FREE_RESTAURANT_LIMIT,
        "remaining_restaurant_slots": None if row["plan"] == "paid" else max(0, FREE_RESTAURANT_LIMIT - restaurant_total),
        "list_count": int(counts["list_count"] or 0),
        "public_list_count": int(counts["public_list_count"] or 0),
        "created_at": row["created_at"],
        "updated_at": row["updated_at"],
        "suspended_at": row["suspended_at"],
        "deleted_at": row["deleted_at"],
    }


def valid_status(status: str) -> str:
    if status not in {"visited", "want_to_go", "favorite"}:
        raise HTTPException(status_code=422, detail="Invalid restaurant status")
    return status


def valid_dish_status(status: str) -> str:
    if status not in {"liked", "tried"}:
        raise HTTPException(status_code=422, detail="Invalid dish status")
    return status


def valid_visibility(visibility: str) -> str:
    if visibility not in {"private", "public"}:
        raise HTTPException(status_code=422, detail="Invalid list visibility")
    return visibility


def storage_uses_gcs() -> bool:
    return bool(GCS_BUCKET)


def upload_url(image_path: str) -> str:
    if not image_path:
        return ""
    if image_path.startswith(("http://", "https://")):
        return image_path
    if GCS_PUBLIC_BASE_URL:
        return f"{GCS_PUBLIC_BASE_URL}/{image_path}"
    return f"/uploads/{image_path}"


def gcs_bucket() -> Any:
    if not GCS_BUCKET:
        raise RuntimeError("GCS_BUCKET is not configured")
    if gcs_storage is None:
        raise RuntimeError("google-cloud-storage is required when GCS_BUCKET is configured")
    return gcs_storage.Client().bucket(GCS_BUCKET)


def save_upload_object(prefix: str, record_id: str, suffix: str, data: bytes, content_type: str) -> str:
    filename = f"{record_id}-{secrets.token_hex(6)}{suffix}"
    object_name = f"{prefix}/{filename}" if storage_uses_gcs() else filename
    if storage_uses_gcs():
        blob = gcs_bucket().blob(object_name)
        blob.upload_from_string(data, content_type=content_type)
    else:
        (UPLOAD_DIR / object_name).write_bytes(data)
    return object_name


def delete_upload_object(image_path: str) -> None:
    if not image_path:
        return
    if storage_uses_gcs():
        try:
            gcs_bucket().blob(image_path).delete()
        except Exception as error:
            if GcsNotFound is None or not isinstance(error, GcsNotFound):
                raise
            pass
        return
    local_path = UPLOAD_DIR / image_path
    if local_path.exists():
        local_path.unlink()


def dish_json(row: sqlite3.Row) -> dict[str, Any]:
    return {
        "id": row["id"],
        "restaurant_id": row["restaurant_id"],
        "name": row["name"],
        "dish_status": row["dish_status"],
        "rating": row["rating"],
        "image_url": upload_url(row["image_path"]),
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


def recipe_json(row: sqlite3.Row | dict[str, Any]) -> dict[str, Any]:
    image_path = row["image_path"] if isinstance(row, sqlite3.Row) else row.get("image_path", "")
    image_url = upload_url(image_path) if image_path else (row.get("image_url", "") if isinstance(row, dict) else "")
    return {
        "id": row["id"],
        "title": row["title"],
        "ingredients": row["ingredients"],
        "steps": row["steps"],
        "notes": row["notes"],
        "rating": row["rating"],
        "cooked_at": row["cooked_at"],
        "image_url": image_url,
        "created_at": row["created_at"],
        "updated_at": row["updated_at"],
    }


def recipe_snapshot(recipe: dict[str, Any]) -> str:
    keys = ["id", "title", "ingredients", "steps", "notes", "rating", "cooked_at", "image_url", "created_at", "updated_at"]
    return json.dumps({"recipe": {key: recipe.get(key) for key in keys}}, ensure_ascii=False)


def parse_recipe_snapshot(snapshot_json: str) -> dict[str, Any]:
    try:
        payload = json.loads(snapshot_json or "{}")
    except json.JSONDecodeError:
        payload = {}
    recipe = payload.get("recipe") if isinstance(payload, dict) else None
    if not isinstance(recipe, dict):
        raise HTTPException(status_code=404, detail="Recipe share is empty")
    defaults = {
        "id": "",
        "title": "Recipe",
        "ingredients": "",
        "steps": "",
        "notes": "",
        "rating": 0,
        "cooked_at": 0,
        "image_url": "",
        "created_at": 0,
        "updated_at": 0,
    }
    defaults.update(recipe)
    return defaults


def recipe_share_url(token: str) -> str:
    return f"{APP_BASE_URL}/recipe-share/{token}"


def recipe_share_card_url(token: str) -> str:
    return f"{APP_BASE_URL}/api/recipe-shares/{token}/card.png"


def recipe_share_qr_url(token: str) -> str:
    return f"{APP_BASE_URL}/api/recipe-shares/{token}/qr.svg"


def share_pack_card_url(token: str) -> str:
    return f"{APP_BASE_URL}/api/share-packs/{token}/card.png"


def share_pack_qr_url(token: str) -> str:
    return f"{APP_BASE_URL}/api/share-packs/{token}/qr.svg"


def share_pack_item_snapshot(restaurant: dict[str, Any], dishes: list[dict[str, Any]]) -> str:
    payload = {
        "restaurant": {key: restaurant.get(key) for key in [
            "id",
            "name",
            "address",
            "lat",
            "lng",
            "google_url",
            "status",
            "visit_count",
            "personal_rating",
            "notes",
            "created_at",
            "updated_at",
        ]},
        "dishes": [
            {key: dish.get(key) for key in [
                "id",
                "restaurant_id",
                "name",
                "dish_status",
                "rating",
                "image_url",
                "notes",
                "created_at",
                "updated_at",
            ]}
            for dish in dishes
        ],
    }
    return json.dumps(payload, ensure_ascii=False)


def parse_share_pack_snapshot(raw: str) -> Optional[dict[str, Any]]:
    if not raw:
        return None
    try:
        snapshot = json.loads(raw)
    except json.JSONDecodeError:
        return None
    if not isinstance(snapshot, dict) or not isinstance(snapshot.get("restaurant"), dict):
        return None
    dishes = snapshot.get("dishes")
    if not isinstance(dishes, list):
        snapshot["dishes"] = []
    return snapshot


def parse_share_pack_items_snapshot(raw: str) -> list[dict[str, Any]]:
    if not raw:
        return []
    try:
        snapshot = json.loads(raw)
    except json.JSONDecodeError:
        return []
    items = snapshot.get("items") if isinstance(snapshot, dict) else None
    return items if isinstance(items, list) else []


def owned_restaurant(db: sqlite3.Connection, restaurant_id: str, user_id: str) -> sqlite3.Row:
    row = db.execute(
        "SELECT * FROM restaurants WHERE id = ? AND owner_user_id = ?",
        (restaurant_id, user_id),
    ).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return row


def owned_list(db: sqlite3.Connection, list_id: str, user_id: str) -> sqlite3.Row:
    row = db.execute(
        "SELECT * FROM lists WHERE id = ? AND owner_user_id = ?",
        (list_id, user_id),
    ).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="List not found")
    return row


def public_list(db: sqlite3.Connection, list_id: str) -> sqlite3.Row:
    row = db.execute(
        """
        SELECT lists.* FROM lists
        JOIN users ON users.id = lists.owner_user_id
        WHERE lists.id = ? AND lists.visibility = 'public' AND users.account_status = 'active'
        """,
        (list_id,),
    ).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="List not found")
    return row


def list_item_count(db: sqlite3.Connection, list_id: str) -> int:
    row = db.execute("SELECT COUNT(*) AS count FROM list_items WHERE list_id = ?", (list_id,)).fetchone()
    return int(row["count"] if row else 0)


def list_cover(db: sqlite3.Connection, row: sqlite3.Row) -> str:
    if row["cover_image_url"]:
        return row["cover_image_url"]
    dish = db.execute(
        """
        SELECT dishes.image_path FROM list_items
        JOIN dishes ON dishes.restaurant_id = list_items.restaurant_id
        WHERE list_items.list_id = ? AND dishes.image_path != ''
        ORDER BY list_items.sort_order ASC, list_items.created_at ASC, dishes.updated_at DESC
        LIMIT 1
        """,
        (row["id"],),
    ).fetchone()
    return upload_url(dish["image_path"]) if dish else ""


def list_item_json(db: sqlite3.Connection, row: sqlite3.Row) -> dict[str, Any]:
    restaurant = db.execute("SELECT * FROM restaurants WHERE id = ?", (row["restaurant_id"],)).fetchone()
    return {
        "id": row["id"],
        "list_id": row["list_id"],
        "restaurant_id": row["restaurant_id"],
        "note": row["note"],
        "sort_order": row["sort_order"],
        "created_at": row["created_at"],
        "restaurant": restaurant_json(db, restaurant) if restaurant else None,
    }


def list_json(db: sqlite3.Connection, row: sqlite3.Row, include_items: bool = False) -> dict[str, Any]:
    owner = db.execute("SELECT * FROM users WHERE id = ?", (row["owner_user_id"],)).fetchone()
    payload = {
        "id": row["id"],
        "owner_user_id": row["owner_user_id"],
        "owner": public_owner(dict(owner)) if owner else None,
        "title": row["title"],
        "description": row["description"],
        "visibility": row["visibility"],
        "cover_image_url": list_cover(db, row),
        "copy_count": row["copy_count"],
        "item_count": list_item_count(db, row["id"]),
        "created_at": row["created_at"],
        "updated_at": row["updated_at"],
        "published_at": row["published_at"],
    }
    if include_items:
        items = db.execute(
            "SELECT * FROM list_items WHERE list_id = ? ORDER BY sort_order ASC, created_at ASC",
            (row["id"],),
        ).fetchall()
        payload["items"] = [list_item_json(db, item) for item in items]
    return payload


foodiemap_service = FoodieMapService(connect, restaurant_json, list_json, recipe_json)
oauth_service = OAuthService(connect, OAUTH_TOKEN_SECRET, MCP_ISSUER_URL, MCP_PUBLIC_URL)


def oauth_json(payload: dict[str, Any], status_code: int = 200) -> JSONResponse:
    return JSONResponse(
        payload,
        status_code=status_code,
        headers={
            "Cache-Control": "no-store",
            "Pragma": "no-cache",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "authorization,content-type,mcp-protocol-version",
            "Access-Control-Allow-Methods": "POST,OPTIONS",
        },
    )


def oauth_error(error: str, description: str, status_code: int = 400) -> JSONResponse:
    return oauth_json({"error": error, "error_description": description}, status_code)


def sign_oauth_request(payload: dict[str, Any]) -> str:
    raw = base64.urlsafe_b64encode(json.dumps(payload, separators=(",", ":")).encode()).decode().rstrip("=")
    signature = hmac.new(OAUTH_TOKEN_SECRET.encode(), raw.encode(), hashlib.sha256).hexdigest()
    return f"{raw}.{signature}"


def unsign_oauth_request(value: str) -> dict[str, Any]:
    try:
        raw, signature = value.rsplit(".", 1)
        expected = hmac.new(OAUTH_TOKEN_SECRET.encode(), raw.encode(), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(signature, expected):
            raise ValueError("Invalid authorization request")
        padded = raw + "=" * (-len(raw) % 4)
        payload = json.loads(base64.urlsafe_b64decode(padded.encode()).decode())
        if int(payload.get("expires_at", 0)) < now():
            raise ValueError("Authorization request expired")
        return payload
    except (ValueError, KeyError, json.JSONDecodeError) as error:
        raise HTTPException(status_code=400, detail="Invalid or expired authorization request") from error


def oauth_redirect(uri: str, params: dict[str, str]) -> RedirectResponse:
    separator = "&" if urllib.parse.urlparse(uri).query else "?"
    return RedirectResponse(f"{uri}{separator}{urllib.parse.urlencode(params)}", status_code=303)


@app.get("/.well-known/oauth-protected-resource")
@app.get("/.well-known/oauth-protected-resource/mcp")
def oauth_protected_resource_metadata() -> dict[str, Any]:
    return {
        "resource": MCP_PUBLIC_URL,
        "authorization_servers": [MCP_ISSUER_URL],
        "scopes_supported": sorted(SUPPORTED_SCOPES),
        "bearer_methods_supported": ["header"],
    }


@app.get("/.well-known/oauth-authorization-server")
def oauth_authorization_server_metadata() -> dict[str, Any]:
    return {
        "issuer": MCP_ISSUER_URL,
        "authorization_endpoint": f"{MCP_ISSUER_URL}/oauth/authorize",
        "token_endpoint": f"{MCP_ISSUER_URL}/oauth/token",
        "registration_endpoint": f"{MCP_ISSUER_URL}/oauth/register",
        "revocation_endpoint": f"{MCP_ISSUER_URL}/oauth/revoke",
        "response_types_supported": ["code"],
        "grant_types_supported": ["authorization_code", "refresh_token"],
        "token_endpoint_auth_methods_supported": ["none", "client_secret_post", "client_secret_basic"],
        "code_challenge_methods_supported": ["S256"],
        "scopes_supported": sorted(SUPPORTED_SCOPES),
    }


@app.options("/oauth/{path:path}")
def oauth_options(path: str) -> JSONResponse:
    del path
    return oauth_json({"ok": True})


@app.post("/oauth/register")
async def oauth_register(request: Request) -> JSONResponse:
    try:
        if int(request.headers.get("content-length", "0") or 0) > 16_384:
            raise ValueError("Client metadata is too large")
        metadata = await request.json()
        return oauth_json(oauth_service.register_client(metadata), 201)
    except (ValueError, json.JSONDecodeError) as error:
        return oauth_error("invalid_client_metadata", str(error))


@app.get("/oauth/authorize")
def oauth_authorize(request: Request) -> Response:
    try:
        authorization = oauth_service.validate_authorization_request(dict(request.query_params))
    except ValueError as error:
        return HTMLResponse(f"<h1>Invalid authorization request</h1><p>{html_lib.escape(str(error))}</p>", status_code=400)
    user = current_user(request)
    if not user:
        destination = f"{request.url.path}?{request.url.query}"
        return RedirectResponse(f"/?next={urllib.parse.quote(destination, safe='')}")
    signed_request = sign_oauth_request({
        "client_id": authorization["client"]["client_id"],
        "redirect_uri": authorization["redirect_uri"],
        "scopes": authorization["scopes"],
        "state": authorization["state"],
        "code_challenge": authorization["code_challenge"],
        "resource": authorization["resource"],
        "expires_at": now() + 10 * 60,
    })
    scope_labels = {
        "restaurants:read": "View your restaurants and menu notes",
        "lists:read": "View your private and public lists",
        "recipes:read": "View your saved recipes",
        "lists:write": "Create private lists and add your restaurants",
    }
    scope_items = "".join(f"<li>{html_lib.escape(scope_labels[scope])}</li>" for scope in authorization["scopes"])
    client_name = html_lib.escape(authorization["client"]["client_name"])
    email = html_lib.escape(user["email"])
    return HTMLResponse(f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Authorize {client_name} - FoodieMap</title><link rel="stylesheet" href="/styles.css?v=20260710-mcp"></head>
<body class="oauth-page"><main class="oauth-consent-card">
<p class="eyebrow">CONNECTED AI APP</p><h1>Connect {client_name}</h1>
<p class="oauth-account">Signed in as <strong>{email}</strong></p>
<p>This app is requesting permission to:</p><ul>{scope_items}</ul>
<p class="form-help">FoodieMap never shares your password, login cookie, or Google token. You can revoke access in Settings.</p>
<form method="post" action="/oauth/authorize"><input type="hidden" name="request" value="{html_lib.escape(signed_request)}">
<div class="form-actions oauth-actions"><button class="secondary-button" name="decision" value="deny">Cancel</button>
<button class="primary-button" name="decision" value="allow">Allow access</button></div></form>
</main></body></html>""")


@app.post("/oauth/authorize")
async def oauth_authorize_submit(request: Request) -> Response:
    user = require_user(request)
    form = await request.form()
    payload = unsign_oauth_request(str(form.get("request", "")))
    client = oauth_service.get_client(payload["client_id"])
    if not client or payload["redirect_uri"] not in client["redirect_uris"]:
        raise HTTPException(status_code=400, detail="OAuth client is no longer valid")
    if form.get("decision") != "allow":
        return oauth_redirect(payload["redirect_uri"], {"error": "access_denied", "state": payload.get("state", "")})
    payload["client"] = client
    code = oauth_service.create_authorization_code(user["id"], payload)
    return oauth_redirect(payload["redirect_uri"], {"code": code, "state": payload.get("state", "")})


def oauth_client_credentials(request: Request, form: Any) -> tuple[str, str | None]:
    client_id = str(form.get("client_id", ""))
    client_secret = str(form.get("client_secret", "")) or None
    authorization = request.headers.get("authorization", "")
    if authorization.lower().startswith("basic "):
        try:
            decoded = base64.b64decode(authorization.split(" ", 1)[1]).decode()
            client_id, client_secret = decoded.split(":", 1)
        except (ValueError, UnicodeDecodeError):
            raise ValueError("Invalid HTTP Basic client credentials")
    return client_id, client_secret


@app.post("/oauth/token")
async def oauth_token(request: Request) -> JSONResponse:
    form = await request.form()
    try:
        client_id, client_secret = oauth_client_credentials(request, form)
        oauth_service.authenticate_client(client_id, client_secret)
        grant_type = str(form.get("grant_type", ""))
        if grant_type == "authorization_code":
            result = oauth_service.exchange_code(
                client_id, str(form.get("code", "")), str(form.get("redirect_uri", "")), str(form.get("code_verifier", ""))
            )
        elif grant_type == "refresh_token":
            result = oauth_service.exchange_refresh_token(
                client_id, str(form.get("refresh_token", "")), str(form.get("scope", ""))
            )
        else:
            return oauth_error("unsupported_grant_type", "Only authorization_code and refresh_token are supported")
        return oauth_json(result)
    except ValueError as error:
        return oauth_error("invalid_grant", str(error))


@app.post("/oauth/revoke")
async def oauth_revoke(request: Request) -> JSONResponse:
    form = await request.form()
    try:
        client_id, client_secret = oauth_client_credentials(request, form)
        oauth_service.authenticate_client(client_id, client_secret)
        oauth_service.revoke_token(str(form.get("token", "")), client_id)
    except ValueError:
        pass
    return oauth_json({})


@app.get("/api/integrations")
def list_integrations(user: dict[str, Any] = Depends(require_user)) -> dict[str, Any]:
    return {"integrations": oauth_service.list_grants(user["id"])}


@app.delete("/api/integrations/{grant_id}")
def delete_integration(grant_id: str, user: dict[str, Any] = Depends(require_user)) -> dict[str, Any]:
    if not oauth_service.revoke_grant(user["id"], grant_id):
        raise HTTPException(status_code=404, detail="Connected app not found")
    return {"ok": True}


@app.get("/api/health")
def health() -> dict[str, Any]:
    with connect() as db:
        user_count = db.execute("SELECT COUNT(*) AS count FROM users").fetchone()["count"]
    return {
        "ok": True,
        "service": "foodiemap-fastapi",
        "app_env": APP_ENV,
        "database": "postgresql" if uses_postgres() else "sqlite",
        "storage": "gcs" if storage_uses_gcs() else "local",
        "mcp": "oauth",
        "user_count": int(user_count or 0),
    }


@app.get("/api/me")
def me(request: Request) -> dict[str, Any]:
    user = current_user(request)
    payload = public_user(user)
    if not user:
        return {"user": None}
    with connect() as db:
        count = restaurant_count(db, user["id"])
        payload["restaurant_count"] = count
        payload["restaurant_limit"] = None if user.get("plan") == "paid" else FREE_RESTAURANT_LIMIT
        payload["remaining_restaurant_slots"] = None if user.get("plan") == "paid" else max(0, FREE_RESTAURANT_LIMIT - count)
    return {"user": payload}


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
    redirect.set_cookie(
        OAUTH_STATE_COOKIE,
        sign_value(state),
        httponly=True,
        samesite="lax",
        secure=secure_cookie_enabled(),
        max_age=600,
    )
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

    if profile.get("email_verified") is not True:
        raise HTTPException(status_code=403, detail="Google email is not verified")

    user_id = new_id()
    timestamp = now()
    profile_email = normalize_email(profile.get("email", ""))
    with connect() as db:
        existing = db.execute("SELECT * FROM users WHERE google_sub = ?", (profile["sub"],)).fetchone()
        if not existing:
            existing = user_by_email(db, profile_email)
        if existing:
            user_id = existing["id"]
            ensure_active_account(existing)
            db.execute(
                "UPDATE users SET google_sub = ?, email = ?, name = ?, avatar_url = ?, email_verified_at = COALESCE(email_verified_at, ?), last_login_at = ?, updated_at = ? WHERE id = ?",
                (profile["sub"], profile_email, profile.get("name", ""), profile.get("picture", ""), timestamp, timestamp, timestamp, user_id),
            )
        else:
            db.execute(
                """
                INSERT INTO users
                (id, google_sub, email, name, avatar_url, email_verified_at, created_at, updated_at, last_login_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (user_id, profile["sub"], profile_email, profile.get("name", ""), profile.get("picture", ""), timestamp, timestamp, timestamp, timestamp),
            )

    state_payload = json.loads(base64.urlsafe_b64decode(state.encode()).decode())
    destination = safe_next_path(state_payload.get("next") or "/")
    redirect = RedirectResponse(destination)
    redirect.set_cookie(
        SESSION_COOKIE,
        sign_value(user_id),
        httponly=True,
        samesite="lax",
        secure=secure_cookie_enabled(),
        max_age=60 * 60 * 24 * 30,
    )
    redirect.delete_cookie(OAUTH_STATE_COOKIE)
    return redirect


@app.post("/auth/logout")
def logout() -> JSONResponse:
    response = JSONResponse({"ok": True})
    response.delete_cookie(SESSION_COOKIE)
    return response


if E2E_CLEANUP_TOKEN:
    @app.post("/api/test/cleanup")
    def cleanup_e2e_account(payload: E2ECleanupIn, request: Request) -> dict[str, Any]:
        supplied_token = request.headers.get("x-e2e-cleanup-token", "")
        if not hmac.compare_digest(supplied_token, E2E_CLEANUP_TOKEN):
            raise HTTPException(status_code=403, detail="Invalid test cleanup token")

        email = normalize_email(payload.email)
        if not email.startswith("e2e-") or not email.endswith("@example.test"):
            raise HTTPException(status_code=400, detail="Only e2e-* @example.test accounts can be cleaned up")

        with connect() as db:
            user = user_by_email(db, email)
            if not user:
                return {"ok": True, "deleted": False, "upload_count": 0}

            dish_images = db.execute(
                """
                SELECT dishes.image_path FROM dishes
                JOIN restaurants ON restaurants.id = dishes.restaurant_id
                WHERE restaurants.owner_user_id = ? AND dishes.image_path != ''
                """,
                (user["id"],),
            ).fetchall()
            recipe_images = db.execute(
                "SELECT image_path FROM recipes WHERE owner_user_id = ? AND image_path != ''",
                (user["id"],),
            ).fetchall()
            image_paths = [row["image_path"] for row in [*dish_images, *recipe_images]]
            for image_path in image_paths:
                delete_upload_object(image_path)

            db.execute("DELETE FROM auth_codes WHERE LOWER(email) = ?", (email,))
            db.execute("DELETE FROM users WHERE id = ?", (user["id"],))
            return {"ok": True, "deleted": True, "upload_count": len(image_paths)}


@app.get("/api/admin/me")
def admin_me(request: Request) -> dict[str, Any]:
    return {"admin": current_admin(request), "configured": admin_configured()}


@app.post("/auth/admin/login")
def admin_login(payload: AdminLoginIn) -> JSONResponse:
    if not admin_configured():
        raise HTTPException(status_code=503, detail="Admin login is not configured")
    username_ok = hmac.compare_digest(payload.username.strip(), ADMIN_USERNAME)
    password_ok = hmac.compare_digest(payload.password, ADMIN_PASSWORD)
    if not username_ok or not password_ok:
        raise HTTPException(status_code=401, detail="Invalid admin username or password")
    return admin_session_response()


@app.post("/auth/admin/logout")
def admin_logout() -> JSONResponse:
    response = JSONResponse({"ok": True})
    response.delete_cookie(ADMIN_SESSION_COOKIE)
    return response


@app.post("/auth/email/register")
def email_register(payload: EmailRegisterIn) -> JSONResponse:
    email = normalize_email(payload.email)
    password_hash = hash_password(validate_password(payload.password))
    with connect() as db:
        existing = user_by_email(db, email)
        if existing:
            ensure_active_account(existing)
            if existing["password_hash"]:
                raise HTTPException(status_code=409, detail="This email already has a password. Sign in instead.")
            timestamp = now()
            db.execute(
                "UPDATE users SET password_hash = ?, name = COALESCE(NULLIF(?, ''), name), last_login_at = ?, updated_at = ? WHERE id = ?",
                (password_hash, payload.name.strip(), timestamp, timestamp, existing["id"]),
            )
            user_id = existing["id"]
        else:
            user = create_email_user(db, email, payload.name, password_hash)
            user_id = user["id"]
        return session_response(user_id)


@app.post("/auth/email/login")
def email_login(payload: EmailLoginIn) -> JSONResponse:
    email = normalize_email(payload.email)
    with connect() as db:
        user = user_by_email(db, email)
        if not user or not user["password_hash"] or not verify_password(payload.password, user["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        ensure_active_account(user)
        touch_login(db, user["id"])
        return session_response(user["id"])


@app.post("/auth/email/code/request")
def email_code_request(payload: EmailCodeRequestIn) -> dict[str, Any]:
    email = normalize_email(payload.email)
    with connect() as db:
        user = user_by_email(db, email)
        if user:
            ensure_active_account(user)
        create_auth_code(db, email, "login", payload.lang)
        return {"ok": True}


@app.post("/auth/email/code/verify")
def email_code_verify(payload: EmailCodeVerifyIn) -> JSONResponse:
    email = normalize_email(payload.email)
    with connect() as db:
        consume_auth_code(db, email, "login", payload.code)
        user = user_by_email(db, email)
        if user:
            ensure_active_account(user)
            user_id = user["id"]
        else:
            user = create_email_user(db, email)
            user_id = user["id"]
        touch_login(db, user_id, email_verified=True)
        return session_response(user_id)


@app.post("/auth/email/password-reset/request")
def password_reset_request(payload: PasswordResetRequestIn) -> dict[str, Any]:
    email = normalize_email(payload.email)
    with connect() as db:
        user = user_by_email(db, email)
        if not user:
            raise HTTPException(status_code=404, detail="No account found for this email")
        ensure_active_account(user)
        create_auth_code(db, email, "password_reset", payload.lang)
        return {"ok": True}


@app.post("/auth/email/password-reset/confirm")
def password_reset_confirm(payload: PasswordResetConfirmIn) -> JSONResponse:
    email = normalize_email(payload.email)
    password_hash = hash_password(validate_password(payload.password))
    with connect() as db:
        consume_auth_code(db, email, "password_reset", payload.code)
        user = user_by_email(db, email)
        if not user:
            raise HTTPException(status_code=404, detail="No account found for this email")
        ensure_active_account(user)
        timestamp = now()
        db.execute(
            "UPDATE users SET password_hash = ?, email_verified_at = COALESCE(email_verified_at, ?), last_login_at = ?, updated_at = ? WHERE id = ?",
            (password_hash, timestamp, timestamp, timestamp, user["id"]),
        )
        return session_response(user["id"])


@app.get("/api/admin/users")
def admin_users(
    query: str = "",
    status: str = "all",
    plan: str = "all",
    admin: dict[str, Any] = Depends(require_admin),
) -> dict[str, Any]:
    del admin
    where: list[str] = []
    values: list[Any] = []
    if query.strip():
        where.append("(LOWER(email) LIKE ? OR LOWER(name) LIKE ?)")
        term = f"%{query.strip().lower()}%"
        values.extend([term, term])
    if status != "all":
        valid_account_status(status)
        where.append("account_status = ?")
        values.append(status)
    if plan != "all":
        valid_plan(plan)
        where.append("plan = ?")
        values.append(plan)
    clause = f"WHERE {' AND '.join(where)}" if where else ""
    with connect() as db:
        rows = db.execute(
            f"""
            SELECT * FROM users
            {clause}
            ORDER BY updated_at DESC, created_at DESC
            LIMIT 200
            """,
            values,
        ).fetchall()
        return {"users": [admin_user_json(db, row) for row in rows]}


@app.get("/api/admin/users/{user_id}")
def admin_user_detail(user_id: str, admin: dict[str, Any] = Depends(require_admin)) -> dict[str, Any]:
    del admin
    with connect() as db:
        row = db.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="User not found")
        return {"user": admin_user_json(db, row)}


@app.patch("/api/admin/users/{user_id}")
def admin_update_user(user_id: str, payload: AdminUserPatch, admin: dict[str, Any] = Depends(require_admin)) -> dict[str, Any]:
    updates = model_values(payload)
    if not updates:
        raise HTTPException(status_code=400, detail="No changes provided")
    with connect() as db:
        target = db.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        if not target:
            raise HTTPException(status_code=404, detail="User not found")
        if target["id"] == admin["id"] and updates.get("account_status") in {"suspended", "deleted"}:
            raise HTTPException(status_code=400, detail="Admins cannot suspend or delete their own account")

        assignments: list[str] = []
        values: list[Any] = []
        timestamp = now()
        if "plan" in updates and updates["plan"] is not None:
            assignments.append("plan = ?")
            values.append(valid_plan(updates["plan"]))
        if "account_status" in updates and updates["account_status"] is not None:
            next_status = valid_account_status(updates["account_status"])
            assignments.append("account_status = ?")
            values.append(next_status)
            if next_status == "suspended":
                assignments.extend(["suspended_at = ?", "deleted_at = NULL"])
                values.append(timestamp)
            elif next_status == "deleted":
                assignments.extend(["deleted_at = ?", "suspended_at = NULL"])
                values.append(timestamp)
            elif next_status == "active":
                assignments.extend(["suspended_at = NULL", "deleted_at = NULL"])
        if not assignments:
            raise HTTPException(status_code=400, detail="No changes provided")
        assignments.append("updated_at = ?")
        values.extend([timestamp, user_id])
        db.execute(f"UPDATE users SET {', '.join(assignments)} WHERE id = ?", values)
        updated = db.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        return {"user": admin_user_json(db, updated)}


@app.delete("/api/admin/users/{user_id}")
def admin_delete_user(user_id: str, admin: dict[str, Any] = Depends(require_admin)) -> dict[str, Any]:
    if user_id == admin["id"]:
        raise HTTPException(status_code=400, detail="Admins cannot delete their own account")
    timestamp = now()
    with connect() as db:
        target = db.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        if not target:
            raise HTTPException(status_code=404, detail="User not found")
        db.execute(
            "UPDATE users SET account_status = 'deleted', deleted_at = ?, suspended_at = NULL, updated_at = ? WHERE id = ?",
            (timestamp, timestamp, user_id),
        )
        updated = db.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        return {"user": admin_user_json(db, updated)}


@app.post("/api/admin/users/{user_id}/restore")
def admin_restore_user(user_id: str, admin: dict[str, Any] = Depends(require_admin)) -> dict[str, Any]:
    del admin
    timestamp = now()
    with connect() as db:
        target = db.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        if not target:
            raise HTTPException(status_code=404, detail="User not found")
        db.execute(
            "UPDATE users SET account_status = 'active', suspended_at = NULL, deleted_at = NULL, updated_at = ? WHERE id = ?",
            (timestamp, user_id),
        )
        updated = db.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        return {"user": admin_user_json(db, updated)}


@app.get("/api/restaurants")
def list_restaurants(user: dict[str, Any] = Depends(require_user)) -> dict[str, Any]:
    return {"restaurants": foodiemap_service.list_restaurants(user["id"], unbounded=True)["items"]}


@app.post("/api/restaurants")
def create_restaurant(payload: RestaurantIn, user: dict[str, Any] = Depends(require_user)) -> dict[str, Any]:
    valid_status(payload.status)
    restaurant_id = new_id()
    timestamp = now()
    with connect() as db:
        require_restaurant_capacity(db, user)
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
        if dish["image_path"]:
            delete_upload_object(dish["image_path"])
        filename = save_upload_object("dishes", dish_id, suffix, data, image.content_type)
        db.execute("UPDATE dishes SET image_path = ?, updated_at = ? WHERE id = ?", (filename, now(), dish_id))
        db.execute("UPDATE restaurants SET updated_at = ? WHERE id = ?", (now(), dish["restaurant_id"]))
        updated = owned_dish(db, dish_id, user["id"])
        return {"dish": dish_json(updated)}


@app.delete("/api/dishes/{dish_id}")
def delete_dish(dish_id: str, user: dict[str, Any] = Depends(require_user)) -> dict[str, Any]:
    with connect() as db:
        dish = owned_dish(db, dish_id, user["id"])
        if dish["image_path"]:
            delete_upload_object(dish["image_path"])
        db.execute("DELETE FROM dishes WHERE id = ?", (dish_id,))
        db.execute("UPDATE restaurants SET updated_at = ? WHERE id = ?", (now(), dish["restaurant_id"]))
    return {"ok": True}


def owned_recipe(db: sqlite3.Connection, recipe_id: str, user_id: str) -> sqlite3.Row:
    row = db.execute("SELECT * FROM recipes WHERE id = ? AND owner_user_id = ?", (recipe_id, user_id)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return row


@app.get("/api/recipes")
def list_recipes(user: dict[str, Any] = Depends(require_user)) -> dict[str, Any]:
    return {"recipes": foodiemap_service.list_recipes(user["id"], unbounded=True)["items"]}


@app.post("/api/recipes")
def create_recipe(payload: RecipeIn, user: dict[str, Any] = Depends(require_user)) -> dict[str, Any]:
    recipe_id = new_id()
    timestamp = now()
    with connect() as db:
        db.execute(
            """
            INSERT INTO recipes
            (id, owner_user_id, title, ingredients, steps, notes, rating, cooked_at, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                recipe_id,
                user["id"],
                payload.title.strip(),
                payload.ingredients.strip(),
                payload.steps.strip(),
                payload.notes.strip(),
                payload.rating,
                payload.cooked_at,
                timestamp,
                timestamp,
            ),
        )
        return {"recipe": recipe_json(owned_recipe(db, recipe_id, user["id"]))}


@app.get("/api/recipes/{recipe_id}")
def get_recipe(recipe_id: str, user: dict[str, Any] = Depends(require_user)) -> dict[str, Any]:
    with connect() as db:
        return {"recipe": recipe_json(owned_recipe(db, recipe_id, user["id"]))}


@app.patch("/api/recipes/{recipe_id}")
def update_recipe(recipe_id: str, payload: RecipePatch, user: dict[str, Any] = Depends(require_user)) -> dict[str, Any]:
    updates = model_values(payload)
    if not updates:
        raise HTTPException(status_code=400, detail="No changes provided")
    allowed = ["title", "ingredients", "steps", "notes", "rating", "cooked_at"]
    fields = [field for field in allowed if field in updates]
    values = [updates[field].strip() if isinstance(updates[field], str) else updates[field] for field in fields]
    fields.append("updated_at")
    values.append(now())
    values.extend([recipe_id, user["id"]])
    with connect() as db:
        owned_recipe(db, recipe_id, user["id"])
        db.execute(
            f"UPDATE recipes SET {', '.join(f'{field} = ?' for field in fields)} WHERE id = ? AND owner_user_id = ?",
            values,
        )
        return {"recipe": recipe_json(owned_recipe(db, recipe_id, user["id"]))}


@app.delete("/api/recipes/{recipe_id}")
def delete_recipe(recipe_id: str, user: dict[str, Any] = Depends(require_user)) -> dict[str, Any]:
    with connect() as db:
        recipe = owned_recipe(db, recipe_id, user["id"])
        if recipe["image_path"]:
            delete_upload_object(recipe["image_path"])
        db.execute("DELETE FROM recipes WHERE id = ? AND owner_user_id = ?", (recipe_id, user["id"]))
    return {"ok": True}


@app.post("/api/recipes/{recipe_id}/image")
async def upload_recipe_image(
    recipe_id: str,
    image: UploadFile = File(...),
    user: dict[str, Any] = Depends(require_user),
) -> dict[str, Any]:
    if image.content_type not in {"image/jpeg", "image/png", "image/webp"}:
        raise HTTPException(status_code=415, detail="Only JPEG, PNG, and WebP images are supported")
    suffix = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp"}[image.content_type]
    data = await image.read()
    if len(data) > 1_200_000:
        raise HTTPException(status_code=413, detail="Image is too large")
    with connect() as db:
        recipe = owned_recipe(db, recipe_id, user["id"])
        if recipe["image_path"]:
            delete_upload_object(recipe["image_path"])
        filename = save_upload_object("recipes", recipe_id, suffix, data, image.content_type)
        db.execute("UPDATE recipes SET image_path = ?, updated_at = ? WHERE id = ? AND owner_user_id = ?", (filename, now(), recipe_id, user["id"]))
        return {"recipe": recipe_json(owned_recipe(db, recipe_id, user["id"]))}


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


def share_pack_url(token: str) -> str:
    return f"{APP_BASE_URL}/share-pack/{token}"


def share_pack_summary(row: sqlite3.Row, item_count: int) -> dict[str, Any]:
    return {
        "token": row["token"],
        "title": row["title"],
        "description": row["description"],
        "created_at": row["created_at"],
        "item_count": item_count,
        "share_url": share_pack_url(row["token"]),
        "qr_url": share_pack_qr_url(row["token"]),
        "card_url": share_pack_card_url(row["token"]),
    }


def share_pack_payload(token: str) -> dict[str, Any]:
    with connect() as db:
        pack = db.execute("SELECT * FROM share_packs WHERE token = ?", (token,)).fetchone()
        if not pack:
            raise HTTPException(status_code=404, detail="Share pack not found")
        owner = db.execute("SELECT * FROM users WHERE id = ?", (pack["owner_user_id"],)).fetchone()
        items = db.execute(
            "SELECT * FROM share_pack_items WHERE share_pack_id = ? ORDER BY sort_order ASC, created_at ASC",
            (pack["id"],),
        ).fetchall()
        item_payloads: list[dict[str, Any]] = []
        for item in items:
            snapshot = parse_share_pack_snapshot(item["snapshot_json"])
            if snapshot:
                restaurant_payload = snapshot["restaurant"]
                dish_payloads = snapshot["dishes"]
            else:
                restaurant = db.execute("SELECT * FROM restaurants WHERE id = ?", (item["restaurant_id"],)).fetchone()
                if not restaurant:
                    continue
                dish_rows = db.execute(
                    """
                    SELECT dishes.* FROM share_pack_dishes
                    JOIN dishes ON dishes.id = share_pack_dishes.dish_id
                    WHERE share_pack_dishes.share_pack_item_id = ? AND dishes.restaurant_id = ?
                    ORDER BY share_pack_dishes.sort_order ASC, share_pack_dishes.created_at ASC
                    """,
                    (item["id"], restaurant["id"]),
                ).fetchall()
                restaurant_payload = restaurant_json(db, restaurant, include_dishes=False)
                dish_payloads = [dish_json(row) for row in dish_rows]
            item_payloads.append(
                {
                    "id": item["id"],
                    "note": item["note"],
                    "sort_order": item["sort_order"],
                    "restaurant": restaurant_payload,
                    "dishes": dish_payloads,
                }
            )
        if not item_payloads:
            item_payloads = parse_share_pack_items_snapshot(pack["snapshot_json"])
        return {
            "share_pack": {
                "token": pack["token"],
                "title": pack["title"],
                "description": pack["description"],
                "created_at": pack["created_at"],
                "owner": public_owner(dict(owner)) if owner else None,
                "share_url": share_pack_url(pack["token"]),
                "qr_url": share_pack_qr_url(pack["token"]),
                "card_url": share_pack_card_url(pack["token"]),
                "items": item_payloads,
            }
        }


@app.get("/api/share-packs")
def get_share_packs(user: dict[str, Any] = Depends(require_user)) -> dict[str, Any]:
    with connect() as db:
        rows = db.execute(
            "SELECT * FROM share_packs WHERE owner_user_id = ? ORDER BY created_at DESC",
            (user["id"],),
        ).fetchall()
        packs = []
        for row in rows:
            item_count = db.execute("SELECT COUNT(*) AS count FROM share_pack_items WHERE share_pack_id = ?", (row["id"],)).fetchone()
            count = item_count["count"] if item_count else 0
            if not count:
                count = len(parse_share_pack_items_snapshot(row["snapshot_json"]))
            packs.append(share_pack_summary(row, count))
        return {"share_packs": packs}


@app.post("/api/share-packs")
def create_share_pack(payload: SharePackIn, user: dict[str, Any] = Depends(require_user)) -> dict[str, Any]:
    if not payload.items:
        raise HTTPException(status_code=422, detail="Choose at least one restaurant")
    token = secrets.token_urlsafe(16)
    timestamp = now()
    pack_id = new_id()
    pack_snapshot_items: list[dict[str, Any]] = []
    with connect() as db:
        db.execute(
            "INSERT INTO share_packs (id, owner_user_id, token, title, description, created_at) VALUES (?, ?, ?, ?, ?, ?)",
            (pack_id, user["id"], token, payload.title.strip(), payload.description.strip(), timestamp),
        )
        for index, item in enumerate(payload.items):
            restaurant = owned_restaurant(db, item.restaurant_id, user["id"])
            selected_dishes: list[dict[str, Any]] = []
            valid_ids: set[str] = set()
            if item.dish_ids:
                placeholders = ",".join("?" for _ in item.dish_ids)
                dish_rows = db.execute(
                    f"SELECT * FROM dishes WHERE restaurant_id = ? AND id IN ({placeholders})",
                    [restaurant["id"], *item.dish_ids],
                ).fetchall()
                dish_by_id = {row["id"]: dish_json(row) for row in dish_rows}
                valid_ids = set(dish_by_id)
                selected_dishes = [dish_by_id[dish_id] for dish_id in item.dish_ids if dish_id in dish_by_id]
            item_id = new_id()
            db.execute(
                """
                INSERT INTO share_pack_items (id, share_pack_id, restaurant_id, note, snapshot_json, sort_order, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    item_id,
                    pack_id,
                    restaurant["id"],
                    item.note.strip(),
                    share_pack_item_snapshot(restaurant_json(db, restaurant, include_dishes=False), selected_dishes),
                    index,
                    timestamp,
                ),
            )
            if valid_ids:
                for dish_index, dish_id in enumerate([dish_id for dish_id in item.dish_ids if dish_id in valid_ids]):
                    db.execute(
                        """
                        INSERT INTO share_pack_dishes (id, share_pack_item_id, dish_id, sort_order, created_at)
                        VALUES (?, ?, ?, ?, ?)
                        """,
                        (new_id(), item_id, dish_id, dish_index, timestamp),
                    )
            pack_snapshot_items.append(
                {
                    "id": item_id,
                    "note": item.note.strip(),
                    "sort_order": index,
                    "restaurant": restaurant_json(db, restaurant, include_dishes=False),
                    "dishes": selected_dishes,
                }
            )
        db.execute(
            "UPDATE share_packs SET snapshot_json = ? WHERE id = ?",
            (json.dumps({"items": pack_snapshot_items}, ensure_ascii=False), pack_id),
        )
    return {"share_url": share_pack_url(token), "qr_url": share_pack_qr_url(token), "card_url": share_pack_card_url(token), "token": token}


@app.get("/api/share-packs/{token}")
def get_share_pack(token: str) -> dict[str, Any]:
    return share_pack_payload(token)


@app.delete("/api/share-packs/{token}")
def delete_share_pack(token: str, user: dict[str, Any] = Depends(require_user)) -> dict[str, Any]:
    with connect() as db:
        pack = db.execute("SELECT * FROM share_packs WHERE token = ? AND owner_user_id = ?", (token, user["id"])).fetchone()
        if not pack:
            raise HTTPException(status_code=404, detail="Share pack not found")
        db.execute("DELETE FROM share_packs WHERE id = ? AND owner_user_id = ?", (pack["id"], user["id"]))
        return {"ok": True}


def share_card_font(size: int, bold: bool = False):
    from PIL import ImageFont

    candidates = [
        "/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc" if bold else "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
        "/usr/share/fonts/truetype/noto/NotoSansCJK-Bold.ttc" if bold else "/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc",
        "/System/Library/Fonts/PingFang.ttc",
        "/Library/Fonts/Arial Unicode.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ]
    for path in candidates:
        if path and Path(path).exists():
            try:
                return ImageFont.truetype(path, size=size)
            except OSError:
                continue
    return ImageFont.load_default()


def wrap_card_text(draw: Any, text: str, font: Any, max_width: int, max_lines: int) -> list[str]:
    words = list(text) if any("\u4e00" <= character <= "\u9fff" for character in text) else text.split()
    lines: list[str] = []
    current = ""
    separator = "" if words and len(words[0]) == 1 else " "
    for word in words:
        candidate = f"{current}{separator if current else ''}{word}".strip()
        if draw.textlength(candidate, font=font) <= max_width:
            current = candidate
            continue
        if current:
            lines.append(current)
        current = word
        if len(lines) >= max_lines:
            break
    if current and len(lines) < max_lines:
        lines.append(current)
    if len(lines) > max_lines:
        lines = lines[:max_lines]
    if lines and draw.textlength(lines[-1], font=font) > max_width:
        while lines[-1] and draw.textlength(f"{lines[-1]}...", font=font) > max_width:
            lines[-1] = lines[-1][:-1]
        lines[-1] = f"{lines[-1]}..."
    elif len(lines) == max_lines and current and current != lines[-1]:
        while lines[-1] and draw.textlength(f"{lines[-1]}...", font=font) > max_width:
            lines[-1] = lines[-1][:-1]
        lines[-1] = f"{lines[-1]}..."
    return lines


def share_pack_card_png(token: str) -> bytes:
    from PIL import Image, ImageDraw
    import qrcode

    payload = share_pack_payload(token)["share_pack"]
    image = Image.new("RGB", (SHARE_CARD_WIDTH, SHARE_CARD_HEIGHT), "#fffaf4")
    draw = ImageDraw.Draw(image)
    background_dot = "#efe4d8"
    for x in range(28, SHARE_CARD_WIDTH, 48):
        for y in range(28, SHARE_CARD_HEIGHT, 48):
            draw.ellipse((x, y, x + 4, y + 4), fill=background_dot)

    margin = 72
    card_box = (margin, margin, SHARE_CARD_WIDTH - margin, SHARE_CARD_HEIGHT - margin)
    draw.rounded_rectangle(card_box, radius=34, fill="#fffdf8", outline="#d9c5b7", width=3)
    draw.rounded_rectangle((margin + 26, margin + 28, margin + 268, margin + 84), radius=0, fill="#e7dfbf")

    eyebrow_font = share_card_font(24, bold=True)
    title_font = share_card_font(58, bold=True)
    body_font = share_card_font(30)
    meta_font = share_card_font(24, bold=True)
    small_font = share_card_font(21)
    draw.text((margin + 42, margin + 44), "PRIVATE RECOMMENDATION", fill="#647144", font=eyebrow_font)

    y = margin + 118
    for line in wrap_card_text(draw, payload["title"], title_font, SHARE_CARD_WIDTH - margin * 2 - 80, 2):
        draw.text((margin + 42, y), line, fill="#3b2e2a", font=title_font)
        y += 68
    description = payload["description"] or "Scan to open this Gourmet Map recommendation."
    y += 12
    for line in wrap_card_text(draw, description, body_font, SHARE_CARD_WIDTH - margin * 2 - 80, 3):
        draw.text((margin + 42, y), line, fill="#67554a", font=body_font)
        y += 40

    y += 24
    items = payload["items"][:4]
    for index, item in enumerate(items, start=1):
        restaurant = item["restaurant"]
        line = f"{index}. {restaurant['name']}"
        draw.rounded_rectangle((margin + 42, y, SHARE_CARD_WIDTH - margin - 42, y + 72), radius=22, fill="#f6eee5", outline="#e0cbbd", width=2)
        draw.text((margin + 66, y + 18), line, fill="#6b422d", font=meta_font)
        y += 86
    if len(payload["items"]) > 4:
        draw.text((margin + 52, y + 4), f"+ {len(payload['items']) - 4} more spots in the link", fill="#8c7b70", font=small_font)

    qr = qrcode.QRCode(border=1, box_size=12)
    qr.add_data(payload["share_url"])
    qr.make(fit=True)
    qr_image = qr.make_image(fill_color="#3b2e2a", back_color="#fffdf8").convert("RGB")
    qr_image = qr_image.resize((320, 320))
    qr_x = (SHARE_CARD_WIDTH - 320) // 2
    qr_y = SHARE_CARD_HEIGHT - margin - 420
    draw.rounded_rectangle((qr_x - 24, qr_y - 24, qr_x + 344, qr_y + 344), radius=28, fill="#ffffff", outline="#d9c5b7", width=3)
    image.paste(qr_image, (qr_x, qr_y))
    draw.text((margin + 42, SHARE_CARD_HEIGHT - margin - 58), "Scan to view, sign in to save it to My Lists", fill="#8c7b70", font=small_font)

    stream = io.BytesIO()
    image.save(stream, format="PNG", optimize=True)
    return stream.getvalue()


def recipe_share_payload(token: str) -> dict[str, Any]:
    with connect() as db:
        share = db.execute("SELECT * FROM recipe_shares WHERE token = ?", (token,)).fetchone()
        if not share:
            raise HTTPException(status_code=404, detail="Recipe share not found")
        owner = db.execute("SELECT * FROM users WHERE id = ?", (share["owner_user_id"],)).fetchone()
        recipe = parse_recipe_snapshot(share["snapshot_json"])
        return {
            "recipe_share": {
                "token": share["token"],
                "created_at": share["created_at"],
                "owner": public_owner(dict(owner)) if owner else None,
                "share_url": recipe_share_url(share["token"]),
                "qr_url": recipe_share_qr_url(share["token"]),
                "card_url": recipe_share_card_url(share["token"]),
                "recipe": recipe,
            }
        }


def recipe_share_card_png(token: str) -> bytes:
    from PIL import Image, ImageDraw
    import qrcode

    payload = recipe_share_payload(token)["recipe_share"]
    recipe = payload["recipe"]
    image = Image.new("RGB", (SHARE_CARD_WIDTH, SHARE_CARD_HEIGHT), "#fffaf4")
    draw = ImageDraw.Draw(image)
    for x in range(28, SHARE_CARD_WIDTH, 48):
        for y in range(28, SHARE_CARD_HEIGHT, 48):
            draw.ellipse((x, y, x + 4, y + 4), fill="#efe4d8")

    margin = 72
    draw.rounded_rectangle((margin, margin, SHARE_CARD_WIDTH - margin, SHARE_CARD_HEIGHT - margin), radius=34, fill="#fffdf8", outline="#d9c5b7", width=3)
    draw.rounded_rectangle((margin + 26, margin + 28, margin + 210, margin + 84), radius=0, fill="#e7dfbf")

    eyebrow_font = share_card_font(24, bold=True)
    title_font = share_card_font(58, bold=True)
    body_font = share_card_font(30)
    meta_font = share_card_font(24, bold=True)
    small_font = share_card_font(21)
    draw.text((margin + 42, margin + 44), "HOME RECIPE", fill="#647144", font=eyebrow_font)

    y = margin + 118
    for line in wrap_card_text(draw, recipe["title"], title_font, SHARE_CARD_WIDTH - margin * 2 - 80, 2):
        draw.text((margin + 42, y), line, fill="#3b2e2a", font=title_font)
        y += 68
    meta = []
    if recipe.get("rating"):
        meta.append(f"★ {recipe['rating']}")
    if recipe.get("cooked_at"):
        meta.append(time.strftime("%b %-d, %Y", time.localtime(int(recipe["cooked_at"]))))
    draw.text((margin + 42, y + 8), " · ".join(meta) or "Shared from Gourmet Map", fill="#6b422d", font=meta_font)
    y += 64

    ingredients = recipe.get("ingredients") or "Scan to view ingredients and steps."
    draw.text((margin + 42, y), "Ingredients", fill="#6b422d", font=meta_font)
    y += 40
    for line in wrap_card_text(draw, ingredients, body_font, SHARE_CARD_WIDTH - margin * 2 - 80, 4):
        draw.text((margin + 42, y), line, fill="#67554a", font=body_font)
        y += 40

    qr = qrcode.QRCode(border=1, box_size=12)
    qr.add_data(payload["share_url"])
    qr.make(fit=True)
    qr_image = qr.make_image(fill_color="#3b2e2a", back_color="#fffdf8").convert("RGB")
    qr_image = qr_image.resize((320, 320))
    qr_x = (SHARE_CARD_WIDTH - 320) // 2
    qr_y = SHARE_CARD_HEIGHT - margin - 420
    draw.rounded_rectangle((qr_x - 24, qr_y - 24, qr_x + 344, qr_y + 344), radius=28, fill="#ffffff", outline="#d9c5b7", width=3)
    image.paste(qr_image, (qr_x, qr_y))
    draw.text((margin + 42, SHARE_CARD_HEIGHT - margin - 58), "Scan to view, sign in to save it to My Recipes", fill="#8c7b70", font=small_font)

    stream = io.BytesIO()
    image.save(stream, format="PNG", optimize=True)
    return stream.getvalue()


@app.post("/api/recipes/{recipe_id}/share")
def create_recipe_share(recipe_id: str, user: dict[str, Any] = Depends(require_user)) -> dict[str, Any]:
    token = secrets.token_urlsafe(16)
    timestamp = now()
    with connect() as db:
        recipe = recipe_json(owned_recipe(db, recipe_id, user["id"]))
        db.execute(
            "INSERT INTO recipe_shares (id, owner_user_id, recipe_id, token, snapshot_json, created_at) VALUES (?, ?, ?, ?, ?, ?)",
            (new_id(), user["id"], recipe_id, token, recipe_snapshot(recipe), timestamp),
        )
    return {"share_url": recipe_share_url(token), "qr_url": recipe_share_qr_url(token), "card_url": recipe_share_card_url(token), "token": token}


@app.get("/api/recipe-shares/{token}")
def get_recipe_share(token: str) -> dict[str, Any]:
    return recipe_share_payload(token)


@app.get("/api/recipe-shares/{token}/qr.svg")
def get_recipe_share_qr(token: str) -> Response:
    recipe_share_payload(token)
    try:
        import qrcode
        import qrcode.image.svg
    except ImportError as error:
        raise HTTPException(status_code=500, detail="QR generation is not installed") from error
    image = qrcode.make(recipe_share_url(token), image_factory=qrcode.image.svg.SvgPathImage)
    stream = io.BytesIO()
    image.save(stream)
    return Response(content=stream.getvalue(), media_type="image/svg+xml")


@app.get("/api/recipe-shares/{token}/card.png")
def get_recipe_share_card(token: str) -> Response:
    return Response(content=recipe_share_card_png(token), media_type="image/png")


@app.post("/api/recipe-shares/{token}/add")
def add_recipe_share(token: str, user: dict[str, Any] = Depends(require_user)) -> dict[str, Any]:
    recipe = recipe_share_payload(token)["recipe_share"]["recipe"]
    recipe_id = new_id()
    timestamp = now()
    image_path = ""
    image_url = recipe.get("image_url", "")
    if image_url.startswith("/uploads/"):
        image_path = Path(image_url).name
    with connect() as db:
        db.execute(
            """
            INSERT INTO recipes
            (id, owner_user_id, title, ingredients, steps, notes, rating, cooked_at, image_path, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                recipe_id,
                user["id"],
                recipe["title"],
                recipe.get("ingredients", ""),
                recipe.get("steps", ""),
                recipe.get("notes", ""),
                float(recipe.get("rating") or 0),
                int(recipe.get("cooked_at") or 0),
                image_path,
                timestamp,
                timestamp,
            ),
        )
        return {"recipe": recipe_json(owned_recipe(db, recipe_id, user["id"]))}


@app.get("/api/share-packs/{token}/qr.svg")
def get_share_pack_qr(token: str) -> Response:
    share_pack_payload(token)
    try:
        import qrcode
        import qrcode.image.svg
    except ImportError as error:
        raise HTTPException(status_code=500, detail="QR generation is not installed") from error
    image = qrcode.make(share_pack_url(token), image_factory=qrcode.image.svg.SvgPathImage)
    stream = io.BytesIO()
    image.save(stream)
    return Response(content=stream.getvalue(), media_type="image/svg+xml")


@app.get("/api/share-packs/{token}/card.png")
def get_share_pack_card(token: str) -> Response:
    return Response(content=share_pack_card_png(token), media_type="image/png")


@app.post("/api/share-packs/{token}/add")
def add_share_pack(token: str, user: dict[str, Any] = Depends(require_user)) -> dict[str, Any]:
    payload = share_pack_payload(token)["share_pack"]
    timestamp = now()
    new_list_id = new_id()
    items = payload["items"]
    with connect() as db:
        require_restaurant_capacity(db, user, len(items))
        db.execute(
            """
            INSERT INTO lists
            (id, owner_user_id, title, description, visibility, cover_image_url, created_at, updated_at)
            VALUES (?, ?, ?, ?, 'private', '', ?, ?)
            """,
            (new_list_id, user["id"], payload["title"], payload["description"], timestamp, timestamp),
        )
        for index, item in enumerate(items):
            source = item["restaurant"]
            restaurant_id = new_id()
            db.execute(
                """
                INSERT INTO restaurants
                (id, owner_user_id, name, address, lat, lng, google_url, status, visit_count, personal_rating, notes, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'want_to_go', 0, ?, ?, ?, ?)
                """,
                (
                    restaurant_id,
                    user["id"],
                    source["name"],
                    source["address"],
                    source["lat"],
                    source["lng"],
                    source["google_url"],
                    source["personal_rating"],
                    f"From share pack: {payload['title']}",
                    timestamp,
                    timestamp,
                ),
            )
            for dish in item["dishes"]:
                db.execute(
                    """
                    INSERT INTO dishes (id, restaurant_id, name, dish_status, rating, image_path, notes, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, '', ?, ?, ?)
                    """,
                    (new_id(), restaurant_id, dish["name"], dish["dish_status"], dish["rating"], dish["notes"], timestamp, timestamp),
                )
            db.execute(
                """
                INSERT INTO list_items (id, list_id, restaurant_id, note, sort_order, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (new_id(), new_list_id, restaurant_id, item["note"], index, timestamp),
            )
        row = owned_list(db, new_list_id, user["id"])
        return {"list": list_json(db, row, include_items=True)}


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
        require_restaurant_capacity(db, user)
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
                f"From share: {payload['owner']['name'] if payload.get('owner') else 'FoodieMap'}",
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


@app.get("/api/lists")
def get_lists(user: dict[str, Any] = Depends(require_user)) -> dict[str, Any]:
    return {"lists": foodiemap_service.list_lists(user["id"], unbounded=True)["items"]}


@app.post("/api/lists")
def create_list(payload: ListIn, user: dict[str, Any] = Depends(require_user)) -> dict[str, Any]:
    try:
        return {"list": foodiemap_service.create_private_list(
            user["id"], title=payload.title, description=payload.description, cover_image_url=payload.cover_image_url
        )}
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error


@app.get("/api/lists/{list_id}")
def get_list(list_id: str, user: dict[str, Any] = Depends(require_user)) -> dict[str, Any]:
    with connect() as db:
        row = owned_list(db, list_id, user["id"])
        return {"list": list_json(db, row, include_items=True)}


@app.patch("/api/lists/{list_id}")
def update_list(list_id: str, payload: ListPatch, user: dict[str, Any] = Depends(require_user)) -> dict[str, Any]:
    updates = model_values(payload)
    if "visibility" in updates and updates["visibility"] is not None:
        valid_visibility(updates["visibility"])
    if not updates:
        raise HTTPException(status_code=400, detail="No changes provided")

    allowed = ["title", "description", "cover_image_url", "visibility"]
    fields = [field for field in allowed if field in updates and updates[field] is not None]
    values = [updates[field].strip() if isinstance(updates[field], str) else updates[field] for field in fields]
    with connect() as db:
        row = owned_list(db, list_id, user["id"])
        if updates.get("visibility") == "public" and list_item_count(db, list_id) == 0:
            raise HTTPException(status_code=422, detail="Add at least one spot before publishing")
        timestamp = now()
        assignments = [f"{field} = ?" for field in fields]
        if "visibility" in updates:
            if updates["visibility"] == "public" and row["visibility"] != "public":
                assignments.append("published_at = ?")
                values.append(timestamp)
            elif updates["visibility"] == "private":
                assignments.append("published_at = NULL")
        assignments.append("updated_at = ?")
        values.extend([timestamp, list_id, user["id"]])
        db.execute(
            f"UPDATE lists SET {', '.join(assignments)} WHERE id = ? AND owner_user_id = ?",
            values,
        )
        updated = owned_list(db, list_id, user["id"])
        return {"list": list_json(db, updated, include_items=True)}


@app.delete("/api/lists/{list_id}")
def delete_list(list_id: str, user: dict[str, Any] = Depends(require_user)) -> dict[str, Any]:
    with connect() as db:
        owned_list(db, list_id, user["id"])
        db.execute("DELETE FROM lists WHERE id = ? AND owner_user_id = ?", (list_id, user["id"]))
    return {"ok": True}


@app.post("/api/lists/{list_id}/items")
def add_list_item(list_id: str, payload: ListItemIn, user: dict[str, Any] = Depends(require_user)) -> dict[str, Any]:
    timestamp = now()
    with connect() as db:
        owned_list(db, list_id, user["id"])
        owned_restaurant(db, payload.restaurant_id, user["id"])
        row = db.execute(
            "SELECT COALESCE(MAX(sort_order), -1) + 1 AS next_order FROM list_items WHERE list_id = ?",
            (list_id,),
        ).fetchone()
        try:
            db.execute(
                """
                INSERT INTO list_items (id, list_id, restaurant_id, note, sort_order, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (new_id(), list_id, payload.restaurant_id, payload.note.strip(), row["next_order"], timestamp),
            )
        except DB_INTEGRITY_ERRORS as error:
            raise HTTPException(status_code=409, detail="Spot is already in this list") from error
        db.execute("UPDATE lists SET updated_at = ? WHERE id = ?", (timestamp, list_id))
        updated = owned_list(db, list_id, user["id"])
        return {"list": list_json(db, updated, include_items=True)}


@app.delete("/api/lists/{list_id}/items/{restaurant_id}")
def delete_list_item(list_id: str, restaurant_id: str, user: dict[str, Any] = Depends(require_user)) -> dict[str, Any]:
    with connect() as db:
        owned_list(db, list_id, user["id"])
        db.execute("DELETE FROM list_items WHERE list_id = ? AND restaurant_id = ?", (list_id, restaurant_id))
        db.execute("UPDATE lists SET updated_at = ? WHERE id = ?", (now(), list_id))
        updated = owned_list(db, list_id, user["id"])
        return {"list": list_json(db, updated, include_items=True)}


@app.get("/api/discovery/lists")
def get_discovery_lists() -> dict[str, Any]:
    with connect() as db:
        rows = db.execute(
            """
            SELECT lists.* FROM lists
            JOIN users ON users.id = lists.owner_user_id
            WHERE lists.visibility = 'public' AND users.account_status = 'active'
            ORDER BY lists.published_at DESC, lists.updated_at DESC
            """
        ).fetchall()
        return {"lists": [list_json(db, row) for row in rows]}


@app.get("/api/discovery/lists/{list_id}")
def get_discovery_list(list_id: str) -> dict[str, Any]:
    with connect() as db:
        row = public_list(db, list_id)
        return {"list": list_json(db, row, include_items=True)}


@app.post("/api/discovery/lists/{list_id}/copy")
def copy_discovery_list(list_id: str, user: dict[str, Any] = Depends(require_user)) -> dict[str, Any]:
    timestamp = now()
    new_list_id = new_id()
    with connect() as db:
        source = public_list(db, list_id)
        items = db.execute(
            "SELECT * FROM list_items WHERE list_id = ? ORDER BY sort_order ASC, created_at ASC",
            (source["id"],),
        ).fetchall()
        copyable_restaurant_count = sum(
            1 for item in items if db.execute("SELECT id FROM restaurants WHERE id = ?", (item["restaurant_id"],)).fetchone()
        )
        require_restaurant_capacity(db, user, copyable_restaurant_count)
        db.execute(
            """
            INSERT INTO lists
            (id, owner_user_id, title, description, visibility, cover_image_url, created_at, updated_at)
            VALUES (?, ?, ?, ?, 'private', ?, ?, ?)
            """,
            (
                new_list_id,
                user["id"],
                source["title"],
                source["description"],
                source["cover_image_url"],
                timestamp,
                timestamp,
            ),
        )
        for index, item in enumerate(items):
            source_restaurant = db.execute("SELECT * FROM restaurants WHERE id = ?", (item["restaurant_id"],)).fetchone()
            if not source_restaurant:
                continue
            restaurant_id = new_id()
            db.execute(
                """
                INSERT INTO restaurants
                (id, owner_user_id, name, address, lat, lng, google_url, status, visit_count, personal_rating, notes, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'want_to_go', 0, ?, ?, ?, ?)
                """,
                (
                    restaurant_id,
                    user["id"],
                    source_restaurant["name"],
                    source_restaurant["address"],
                    source_restaurant["lat"],
                    source_restaurant["lng"],
                    source_restaurant["google_url"],
                    source_restaurant["personal_rating"],
                    f"From public list: {source['title']}",
                    timestamp,
                    timestamp,
                ),
            )
            source_dishes = db.execute(
                "SELECT * FROM dishes WHERE restaurant_id = ? ORDER BY updated_at DESC, created_at DESC",
                (source_restaurant["id"],),
            ).fetchall()
            for dish in source_dishes:
                db.execute(
                    """
                    INSERT INTO dishes (id, restaurant_id, name, dish_status, rating, image_path, notes, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, '', ?, ?, ?)
                    """,
                    (
                        new_id(),
                        restaurant_id,
                        dish["name"],
                        dish["dish_status"],
                        dish["rating"],
                        dish["notes"],
                        timestamp,
                        timestamp,
                    ),
                )
            db.execute(
                """
                INSERT INTO list_items (id, list_id, restaurant_id, note, sort_order, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (new_id(), new_list_id, restaurant_id, item["note"], index, timestamp),
            )
        db.execute("UPDATE lists SET copy_count = copy_count + 1 WHERE id = ?", (source["id"],))
        row = owned_list(db, new_list_id, user["id"])
        return {"list": list_json(db, row, include_items=True)}


@app.get("/api/resolve-map-link")
def resolve_map_link(url: str) -> dict[str, Any]:
    target = urllib.parse.urlparse(url.strip())
    if target.scheme not in {"http", "https"} or target.netloc not in ALLOWED_SHORT_HOSTS:
        raise HTTPException(status_code=400, detail="Only Google Maps and Apple Maps links are supported.")
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
            content_type = response.headers.get("Content-Type", "")
            body = response.read(700_000) if "text/html" in content_type else b""
    except (urllib.error.URLError, TimeoutError) as error:
        raise HTTPException(status_code=502, detail="Short link expansion failed. Open it in a browser and copy the full link.") from error
    return {"url": final_url, "place": resolved_map_place(final_url, body)}


@app.get("/api/resolve-google-link")
def resolve_google_link(url: str) -> dict[str, Any]:
    return resolve_map_link(url)


def resolved_map_place(final_url: str, html_body: bytes) -> dict[str, Any]:
    html_text = html_body.decode("utf-8", errors="ignore") if html_body else ""
    name = google_maps_meta_title(html_text)
    lat, lng = extract_coordinates_from_text(final_url) or extract_coordinates_from_text(html_text) or (None, None)
    place: dict[str, Any] = {}
    if name:
        place["name"] = name
    if lat is not None and lng is not None:
        place["lat"] = lat
        place["lng"] = lng
    return place


def google_maps_meta_title(html_text: str) -> str:
    for pattern in [
        r'<meta\s+property=["\']og:title["\']\s+content=["\']([^"\']+)["\']',
        r'<meta\s+content=["\']([^"\']+)["\']\s+property=["\']og:title["\']',
        r"<title>(.*?)</title>",
    ]:
        match = re.search(pattern, html_text, flags=re.I | re.S)
        if match:
            title = html_lib.unescape(match.group(1)).strip()
            title = re.sub(r"\s*[-|]\s*Google Maps\s*$", "", title, flags=re.I).strip()
            if title.lower() in {"google maps", "maps", "google"}:
                continue
            return title
    return ""


def extract_coordinates_from_text(text: str) -> tuple[float | None, float | None] | None:
    decoded = urllib.parse.unquote(text or "")
    patterns = [
        r"!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)",
        r"(?:center|markers|ll|q)=(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)",
        r"@(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)",
    ]
    for pattern in patterns:
        match = re.search(pattern, decoded)
        if not match:
            continue
        lat = float(match.group(1))
        lng = float(match.group(2))
        if abs(lat) <= 90 and abs(lng) <= 180:
            return lat, lng
    return None


@app.post("/api/reverse-geocode")
def reverse_geocode(payload: ReverseGeocodeIn) -> dict[str, str]:
    api_key = payload.key.strip() or GOOGLE_GEOCODING_API_KEY
    if not api_key:
        raise HTTPException(status_code=400, detail="Google Geocoding API key is not configured.")
    params = urllib.parse.urlencode({"latlng": f"{payload.lat},{payload.lng}", "key": api_key})
    request = urllib.request.Request(
        f"https://maps.googleapis.com/maps/api/geocode/json?{params}",
        headers={"User-Agent": "FoodieMap/1.0"},
    )
    try:
        with urllib.request.urlopen(request, timeout=8) as response:
            data = json.loads(response.read().decode())
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as error:
        raise HTTPException(status_code=502, detail="Could not look up the address.") from error
    if data.get("status") not in {"OK", "ZERO_RESULTS"}:
        message = data.get("error_message") or "Could not look up the address."
        raise HTTPException(status_code=502, detail=message)
    address = data.get("results", [{}])[0].get("formatted_address", "") if data.get("results") else ""
    if not address:
        raise HTTPException(status_code=404, detail="No address found for those coordinates.")
    return {"address": address}


if storage_uses_gcs():
    @app.get("/uploads/{object_path:path}")
    def get_upload(object_path: str) -> Response:
        blob = gcs_bucket().blob(object_path)
        if not blob.exists():
            raise HTTPException(status_code=404, detail="Upload not found")
        return Response(content=blob.download_as_bytes(), media_type=blob.content_type or "application/octet-stream")
else:
    app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


from mcp_server import create_mcp_server

mcp_server = create_mcp_server(foodiemap_service, oauth_service, connect, MCP_ALLOWED_ORIGINS)
mcp_http_app = mcp_server.streamable_http_app()
app.mount("/mcp", mcp_http_app, name="mcp")


@asynccontextmanager
async def app_lifespan(application: FastAPI):
    del application
    validate_config()
    init_db()
    async with mcp_server.session_manager.run():
        yield


app.router.lifespan_context = app_lifespan


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
