import os
from pathlib import Path

TEST_DATA = Path(".playwright-data/mcp-pytest")
TEST_DATA.mkdir(parents=True, exist_ok=True)

os.environ.update({
    "APP_ENV": "development",
    "APP_BASE_URL": "http://testserver",
    "MCP_PUBLIC_URL": "http://testserver/mcp",
    "MCP_ISSUER_URL": "http://testserver",
    "SESSION_SECRET": "mcp-test-session-secret-at-least-32-characters",
    "OAUTH_TOKEN_SECRET": "mcp-test-oauth-secret-distinct-and-long-enough",
    "DATA_DIR": str(TEST_DATA),
    "SQLITE_DATABASE_PATH": str(TEST_DATA / "foodiemap.db"),
    "UPLOAD_DIR": str(TEST_DATA / "uploads"),
    "DATABASE_URL": "",
    "GCS_BUCKET": "",
})

import pytest
from fastapi.testclient import TestClient

import server


@pytest.fixture(autouse=True)
def clean_database():
    server.init_db()
    with server.connect() as db:
        for table in ["mcp_audit_events", "oauth_access_tokens", "oauth_refresh_tokens", "oauth_authorization_codes", "oauth_grants", "oauth_clients", "auth_codes", "users"]:
            db.execute(f"DELETE FROM {table}")
    yield


@pytest.fixture(scope="session")
def client():
    with TestClient(server.app) as test_client:
        yield test_client


@pytest.fixture
def users():
    timestamp = server.now()
    values = [
        ("user-a", "email:user-a@example.test", "user-a@example.test", "User A"),
        ("user-b", "email:user-b@example.test", "user-b@example.test", "User B"),
    ]
    with server.connect() as db:
        for user_id, google_sub, email, name in values:
            db.execute(
                "INSERT INTO users (id, google_sub, email, name, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
                (user_id, google_sub, email, name, timestamp, timestamp),
            )
    return [value[0] for value in values]
