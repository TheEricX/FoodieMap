import base64
import hashlib
import re
import urllib.parse

import pytest

import server


def pkce(verifier: str) -> str:
    return base64.urlsafe_b64encode(hashlib.sha256(verifier.encode()).digest()).decode().rstrip("=")


def create_client():
    return server.oauth_service.register_client({
        "client_name": "Test Agent",
        "redirect_uris": ["http://127.0.0.1:9876/callback"],
        "token_endpoint_auth_method": "none",
    })


def issue_tokens(user_id: str, scopes=None):
    client = create_client()
    verifier = "a" * 48
    request = server.oauth_service.validate_authorization_request({
        "client_id": client["client_id"],
        "redirect_uri": client["redirect_uris"][0],
        "response_type": "code",
        "scope": " ".join(scopes or ["restaurants:read", "lists:read", "recipes:read", "lists:write"]),
        "code_challenge": pkce(verifier),
        "code_challenge_method": "S256",
        "resource": "http://testserver/mcp",
    })
    code = server.oauth_service.create_authorization_code(user_id, request)
    return client, code, verifier, server.oauth_service.exchange_code(client["client_id"], code, client["redirect_uris"][0], verifier)


def test_registration_rejects_unsafe_redirects():
    with pytest.raises(ValueError):
        server.oauth_service.register_client({"redirect_uris": ["http://evil.example/callback"]})
    with pytest.raises(ValueError):
        server.oauth_service.register_client({"redirect_uris": ["https://safe.example/callback#fragment"]})


def test_pkce_code_is_single_use_and_token_is_hashed(users):
    client, code, verifier, tokens = issue_tokens(users[0])
    assert server.oauth_service.verify_access_token(tokens["access_token"]).user_id == users[0]
    with pytest.raises(ValueError):
        server.oauth_service.exchange_code(client["client_id"], code, client["redirect_uris"][0], verifier)
    with server.connect() as db:
        assert not db.execute("SELECT 1 FROM oauth_access_tokens WHERE token_hash = ?", (tokens["access_token"],)).fetchone()


def test_wrong_pkce_does_not_consume_code(users):
    client = create_client()
    verifier = "b" * 48
    request = server.oauth_service.validate_authorization_request({
        "client_id": client["client_id"], "redirect_uri": client["redirect_uris"][0],
        "response_type": "code", "scope": "lists:read", "code_challenge": pkce(verifier),
        "code_challenge_method": "S256", "resource": "http://testserver/mcp",
    })
    code = server.oauth_service.create_authorization_code(users[0], request)
    with pytest.raises(ValueError):
        server.oauth_service.exchange_code(client["client_id"], code, client["redirect_uris"][0], "wrong" * 12)
    assert server.oauth_service.exchange_code(client["client_id"], code, client["redirect_uris"][0], verifier)["access_token"]


def test_refresh_rotates_and_revoke_invalidates_grant(users):
    client, _, _, tokens = issue_tokens(users[0])
    rotated = server.oauth_service.exchange_refresh_token(client["client_id"], tokens["refresh_token"])
    with pytest.raises(ValueError):
        server.oauth_service.exchange_refresh_token(client["client_id"], tokens["refresh_token"])
    server.oauth_service.revoke_token(rotated["refresh_token"])
    assert server.oauth_service.verify_access_token(rotated["access_token"]) is None


def test_metadata_and_cookie_only_mcp_is_rejected(client, users):
    metadata = client.get("/.well-known/oauth-protected-resource").json()
    assert metadata["resource"] == "http://testserver/mcp"
    client.cookies.set(server.SESSION_COOKIE, server.sign_value(users[0]))
    response = client.post(
        "/mcp/",
        json={"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {"protocolVersion": "2025-11-25", "capabilities": {}, "clientInfo": {"name": "test", "version": "1"}}},
        headers={"Accept": "application/json, text/event-stream"},
    )
    client.cookies.delete(server.SESSION_COOKIE)
    assert response.status_code == 401
    assert "resource_metadata" in response.headers["www-authenticate"]


def test_mcp_initialize_and_tools_list(client, users):
    _, _, _, tokens = issue_tokens(users[0])
    headers = {
        "Authorization": f"Bearer {tokens['access_token']}",
        "Accept": "application/json, text/event-stream",
        "MCP-Protocol-Version": "2025-11-25",
    }
    initialized = client.post(
        "/mcp/", headers=headers,
        json={"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {"protocolVersion": "2025-11-25", "capabilities": {}, "clientInfo": {"name": "test", "version": "1"}}},
    )
    assert initialized.status_code == 200, initialized.text
    tools = client.post("/mcp/", headers=headers, json={"jsonrpc": "2.0", "id": 2, "method": "tools/list", "params": {}})
    assert tools.status_code == 200, tools.text
    names = {tool["name"] for tool in tools.json()["result"]["tools"]}
    assert {"list_restaurants", "list_lists", "list_recipes", "create_list"}.issubset(names)


def test_oauth_http_authorize_and_token_flow(client, users):
    registered = client.post("/oauth/register", json={
        "client_name": "HTTP Agent",
        "redirect_uris": ["http://127.0.0.1:9876/callback"],
        "token_endpoint_auth_method": "none",
    }).json()
    verifier = "c" * 48
    params = {
        "client_id": registered["client_id"], "redirect_uri": registered["redirect_uris"][0],
        "response_type": "code", "scope": "lists:read lists:write", "state": "test-state",
        "code_challenge": pkce(verifier), "code_challenge_method": "S256", "resource": "http://testserver/mcp",
    }
    client.cookies.set(server.SESSION_COOKIE, server.sign_value(users[0]))
    consent = client.get(f"/oauth/authorize?{urllib.parse.urlencode(params)}")
    assert consent.status_code == 200
    signed_request = re.search(r'name="request" value="([^"]+)"', consent.text).group(1)
    authorized = client.post(
        "/oauth/authorize", data={"request": signed_request, "decision": "allow"}, follow_redirects=False
    )
    query = urllib.parse.parse_qs(urllib.parse.urlparse(authorized.headers["location"]).query)
    assert query["state"] == ["test-state"]
    token = client.post("/oauth/token", data={
        "grant_type": "authorization_code", "client_id": registered["client_id"],
        "code": query["code"][0], "redirect_uri": registered["redirect_uris"][0], "code_verifier": verifier,
    })
    assert token.status_code == 200, token.text
    assert token.json()["token_type"] == "Bearer"


def test_tool_scope_and_origin_enforcement(client, users):
    _, _, _, tokens = issue_tokens(users[0], ["lists:read"])
    headers = {
        "Authorization": f"Bearer {tokens['access_token']}",
        "Accept": "application/json, text/event-stream",
        "MCP-Protocol-Version": "2025-11-25",
    }
    forbidden = client.post("/mcp/", headers=headers, json={
        "jsonrpc": "2.0", "id": 3, "method": "tools/call",
        "params": {"name": "create_list", "arguments": {"title": "Not allowed"}},
    })
    assert forbidden.status_code == 200
    assert forbidden.json()["result"]["isError"] is True
    hostile_headers = {**headers, "Origin": "https://evil.example"}
    blocked = client.post("/mcp/", headers=hostile_headers, json={
        "jsonrpc": "2.0", "id": 4, "method": "tools/list", "params": {},
    })
    assert blocked.status_code == 403
