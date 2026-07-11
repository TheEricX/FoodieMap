from __future__ import annotations

import base64
import hashlib
import hmac
import json
import secrets
import time
import urllib.parse
import uuid
from dataclasses import dataclass
from typing import Any, Callable


SUPPORTED_SCOPES = {"restaurants:read", "lists:read", "recipes:read", "lists:write"}
ACCESS_TOKEN_TTL = 60 * 60
REFRESH_TOKEN_TTL = 30 * 24 * 60 * 60
AUTHORIZATION_CODE_TTL = 5 * 60


def _json(value: Any) -> str:
    return json.dumps(value, separators=(",", ":"), ensure_ascii=True)


def _row_dict(row: Any) -> dict[str, Any] | None:
    return dict(row) if row else None


def validate_redirect_uri(uri: str) -> str:
    parsed = urllib.parse.urlparse(uri)
    if parsed.fragment or parsed.username or parsed.password:
        raise ValueError("Invalid redirect URI")
    if parsed.scheme == "https" and parsed.netloc:
        return uri
    if parsed.scheme == "http" and parsed.hostname in {"127.0.0.1", "localhost"} and parsed.netloc:
        return uri
    raise ValueError("Redirect URI must use HTTPS or localhost HTTP")


def validate_scopes(scope: str | list[str]) -> list[str]:
    scopes = scope.split() if isinstance(scope, str) else list(scope)
    scopes = list(dict.fromkeys(scopes))
    if not scopes or not set(scopes).issubset(SUPPORTED_SCOPES):
        raise ValueError("Invalid OAuth scope")
    return scopes


def verify_pkce(verifier: str, challenge: str) -> bool:
    digest = hashlib.sha256(verifier.encode()).digest()
    encoded = base64.urlsafe_b64encode(digest).decode().rstrip("=")
    return hmac.compare_digest(encoded, challenge)


@dataclass
class VerifiedAccessToken:
    token: str
    client_id: str
    user_id: str
    scopes: list[str]
    expires_at: int


class OAuthService:
    def __init__(self, connect: Callable[[], Any], secret: str, issuer_url: str, resource_url: str) -> None:
        self.connect = connect
        self.secret = secret.encode()
        self.issuer_url = issuer_url.rstrip("/")
        self.resource_url = resource_url.rstrip("/")

    def token_hash(self, value: str) -> str:
        return hmac.new(self.secret, value.encode(), hashlib.sha256).hexdigest()

    def register_client(self, metadata: dict[str, Any]) -> dict[str, Any]:
        if not isinstance(metadata, dict):
            raise ValueError("Client metadata must be a JSON object")
        redirect_uris = metadata.get("redirect_uris") or []
        if not isinstance(redirect_uris, list) or not redirect_uris or len(redirect_uris) > 20:
            raise ValueError("redirect_uris must be a non-empty list")
        redirect_uris = [validate_redirect_uri(str(uri)) for uri in redirect_uris]
        auth_method = metadata.get("token_endpoint_auth_method", "none")
        if auth_method not in {"none", "client_secret_post", "client_secret_basic"}:
            raise ValueError("Unsupported token endpoint auth method")
        client_id = secrets.token_urlsafe(24)
        client_secret = secrets.token_urlsafe(32) if auth_method != "none" else None
        timestamp = int(time.time())
        client_name = str(metadata.get("client_name") or "AI Agent")[:160]
        with self.connect() as db:
            db.execute(
                """
                INSERT INTO oauth_clients
                (client_id, client_name, redirect_uris_json, grant_types_json, response_types_json,
                 token_endpoint_auth_method, client_secret_hash, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    client_id,
                    client_name,
                    _json(redirect_uris),
                    _json(metadata.get("grant_types") or ["authorization_code", "refresh_token"]),
                    _json(metadata.get("response_types") or ["code"]),
                    auth_method,
                    self.token_hash(client_secret) if client_secret else "",
                    timestamp,
                ),
            )
        response = {
            "client_id": client_id,
            "client_name": client_name,
            "redirect_uris": redirect_uris,
            "grant_types": ["authorization_code", "refresh_token"],
            "response_types": ["code"],
            "token_endpoint_auth_method": auth_method,
        }
        if client_secret:
            response["client_secret"] = client_secret
            response["client_secret_expires_at"] = 0
        return response

    def get_client(self, client_id: str) -> dict[str, Any] | None:
        with self.connect() as db:
            row = db.execute("SELECT * FROM oauth_clients WHERE client_id = ?", (client_id,)).fetchone()
        client = _row_dict(row)
        if client:
            client["redirect_uris"] = json.loads(client.pop("redirect_uris_json"))
        return client

    def authenticate_client(self, client_id: str, client_secret: str | None) -> dict[str, Any]:
        client = self.get_client(client_id)
        if not client:
            raise ValueError("Invalid client")
        method = client["token_endpoint_auth_method"]
        if method == "none":
            return client
        if not client_secret or not hmac.compare_digest(client["client_secret_hash"], self.token_hash(client_secret)):
            raise ValueError("Invalid client")
        return client

    def validate_authorization_request(self, params: dict[str, str]) -> dict[str, Any]:
        client = self.get_client(params.get("client_id", ""))
        if not client:
            raise ValueError("Unknown OAuth client")
        redirect_uri = params.get("redirect_uri", "")
        if redirect_uri not in client["redirect_uris"]:
            raise ValueError("Redirect URI does not match the registered client")
        if params.get("response_type") != "code":
            raise ValueError("Only response_type=code is supported")
        if params.get("code_challenge_method") != "S256" or not params.get("code_challenge"):
            raise ValueError("PKCE S256 is required")
        scopes = validate_scopes(params.get("scope", ""))
        resource = params.get("resource", self.resource_url).rstrip("/")
        if resource != self.resource_url:
            raise ValueError("Invalid OAuth resource")
        return {
            "client": client,
            "redirect_uri": redirect_uri,
            "scopes": scopes,
            "state": params.get("state", ""),
            "code_challenge": params["code_challenge"],
            "resource": resource,
        }

    def create_authorization_code(self, user_id: str, request: dict[str, Any]) -> str:
        code = secrets.token_urlsafe(32)
        timestamp = int(time.time())
        with self.connect() as db:
            grant = db.execute(
                "SELECT id FROM oauth_grants WHERE user_id = ? AND client_id = ?",
                (user_id, request["client"]["client_id"]),
            ).fetchone()
            if grant:
                grant_id = grant["id"]
                db.execute(
                    "UPDATE oauth_grants SET scopes_json = ?, updated_at = ?, revoked_at = NULL WHERE id = ?",
                    (_json(request["scopes"]), timestamp, grant_id),
                )
            else:
                grant_id = str(uuid.uuid4())
                db.execute(
                    """
                    INSERT INTO oauth_grants (id, user_id, client_id, scopes_json, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """,
                    (grant_id, user_id, request["client"]["client_id"], _json(request["scopes"]), timestamp, timestamp),
                )
            db.execute(
                """
                INSERT INTO oauth_authorization_codes
                (code_hash, grant_id, client_id, user_id, redirect_uri, scopes_json, code_challenge,
                 resource, expires_at, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    self.token_hash(code), grant_id, request["client"]["client_id"], user_id,
                    request["redirect_uri"], _json(request["scopes"]), request["code_challenge"],
                    request["resource"], timestamp + AUTHORIZATION_CODE_TTL, timestamp,
                ),
            )
        return code

    def exchange_code(
        self, client_id: str, code: str, redirect_uri: str, code_verifier: str
    ) -> dict[str, Any]:
        timestamp = int(time.time())
        with self.connect() as db:
            row = db.execute(
                "SELECT * FROM oauth_authorization_codes WHERE code_hash = ? AND client_id = ?",
                (self.token_hash(code), client_id),
            ).fetchone()
            if not row or row["used_at"] or int(row["expires_at"]) < timestamp:
                raise ValueError("Invalid or expired authorization code")
            if row["redirect_uri"] != redirect_uri or not verify_pkce(code_verifier, row["code_challenge"]):
                raise ValueError("Authorization code verification failed")
            db.execute("UPDATE oauth_authorization_codes SET used_at = ? WHERE code_hash = ?", (timestamp, row["code_hash"]))
            return self._issue_token_pair(db, dict(row), timestamp)

    def _issue_token_pair(self, db: Any, source: dict[str, Any], timestamp: int) -> dict[str, Any]:
        access_token = secrets.token_urlsafe(40)
        refresh_token = secrets.token_urlsafe(48)
        family_id = source.get("family_id") or str(uuid.uuid4())
        scopes_json = source["scopes_json"]
        db.execute(
            """
            INSERT INTO oauth_access_tokens
            (token_hash, grant_id, client_id, user_id, scopes_json, resource, expires_at, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (self.token_hash(access_token), source["grant_id"], source["client_id"], source["user_id"], scopes_json,
             source.get("resource", self.resource_url), timestamp + ACCESS_TOKEN_TTL, timestamp),
        )
        db.execute(
            """
            INSERT INTO oauth_refresh_tokens
            (token_hash, family_id, grant_id, client_id, user_id, scopes_json, resource, expires_at, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (self.token_hash(refresh_token), family_id, source["grant_id"], source["client_id"], source["user_id"],
             scopes_json, source.get("resource", self.resource_url), timestamp + REFRESH_TOKEN_TTL, timestamp),
        )
        return {
            "access_token": access_token,
            "token_type": "Bearer",
            "expires_in": ACCESS_TOKEN_TTL,
            "refresh_token": refresh_token,
            "scope": " ".join(json.loads(scopes_json)),
        }

    def exchange_refresh_token(self, client_id: str, token: str, requested_scope: str = "") -> dict[str, Any]:
        timestamp = int(time.time())
        token_hash = self.token_hash(token)
        with self.connect() as db:
            row = db.execute(
                "SELECT * FROM oauth_refresh_tokens WHERE token_hash = ? AND client_id = ?",
                (token_hash, client_id),
            ).fetchone()
            if not row or row["used_at"] or row["revoked_at"] or int(row["expires_at"]) < timestamp:
                raise ValueError("Invalid refresh token")
            existing_scopes = json.loads(row["scopes_json"])
            scopes = validate_scopes(requested_scope) if requested_scope else existing_scopes
            if not set(scopes).issubset(existing_scopes):
                raise ValueError("Requested scope exceeds the original grant")
            db.execute("UPDATE oauth_refresh_tokens SET used_at = ? WHERE token_hash = ?", (timestamp, token_hash))
            source = dict(row)
            source["scopes_json"] = _json(scopes)
            return self._issue_token_pair(db, source, timestamp)

    def verify_access_token(self, token: str) -> VerifiedAccessToken | None:
        timestamp = int(time.time())
        token_hash = self.token_hash(token)
        with self.connect() as db:
            row = db.execute(
                """
                SELECT tokens.* FROM oauth_access_tokens tokens
                JOIN oauth_grants grants ON grants.id = tokens.grant_id
                JOIN users ON users.id = tokens.user_id
                WHERE tokens.token_hash = ? AND tokens.revoked_at IS NULL
                  AND grants.revoked_at IS NULL AND users.account_status = 'active'
                """,
                (token_hash,),
            ).fetchone()
            if not row or int(row["expires_at"]) < timestamp or row["resource"].rstrip("/") != self.resource_url:
                return None
            db.execute("UPDATE oauth_access_tokens SET last_used_at = ? WHERE token_hash = ?", (timestamp, token_hash))
            db.execute("UPDATE oauth_grants SET last_used_at = ? WHERE id = ?", (timestamp, row["grant_id"]))
            return VerifiedAccessToken(token, row["client_id"], row["user_id"], json.loads(row["scopes_json"]), int(row["expires_at"]))

    def revoke_token(self, token: str, client_id: str | None = None) -> None:
        timestamp = int(time.time())
        token_hash = self.token_hash(token)
        with self.connect() as db:
            clause = "token_hash = ? AND client_id = ?" if client_id else "token_hash = ?"
            params = (token_hash, client_id) if client_id else (token_hash,)
            access = db.execute(f"SELECT grant_id FROM oauth_access_tokens WHERE {clause}", params).fetchone()
            refresh = db.execute(f"SELECT grant_id FROM oauth_refresh_tokens WHERE {clause}", params).fetchone()
            grant_id = access["grant_id"] if access else refresh["grant_id"] if refresh else None
            if grant_id:
                db.execute("UPDATE oauth_access_tokens SET revoked_at = ? WHERE grant_id = ?", (timestamp, grant_id))
                db.execute("UPDATE oauth_refresh_tokens SET revoked_at = ? WHERE grant_id = ?", (timestamp, grant_id))

    def list_grants(self, user_id: str) -> list[dict[str, Any]]:
        with self.connect() as db:
            rows = db.execute(
                """
                SELECT grants.*, clients.client_name FROM oauth_grants grants
                JOIN oauth_clients clients ON clients.client_id = grants.client_id
                WHERE grants.user_id = ? AND grants.revoked_at IS NULL
                ORDER BY COALESCE(grants.last_used_at, grants.updated_at) DESC
                """,
                (user_id,),
            ).fetchall()
        return [{
            "id": row["id"],
            "client_name": row["client_name"],
            "scopes": json.loads(row["scopes_json"]),
            "created_at": row["created_at"],
            "last_used_at": row["last_used_at"],
        } for row in rows]

    def revoke_grant(self, user_id: str, grant_id: str) -> bool:
        timestamp = int(time.time())
        with self.connect() as db:
            row = db.execute("SELECT id FROM oauth_grants WHERE id = ? AND user_id = ?", (grant_id, user_id)).fetchone()
            if not row:
                return False
            db.execute("UPDATE oauth_grants SET revoked_at = ?, updated_at = ? WHERE id = ?", (timestamp, timestamp, grant_id))
            db.execute("UPDATE oauth_access_tokens SET revoked_at = ? WHERE grant_id = ?", (timestamp, grant_id))
            db.execute("UPDATE oauth_refresh_tokens SET revoked_at = ? WHERE grant_id = ?", (timestamp, grant_id))
            return True
