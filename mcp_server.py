from __future__ import annotations

import time
import uuid
from typing import Any, Callable
from urllib.parse import urlparse

from mcp.server.auth.middleware.auth_context import get_access_token
from mcp.server.auth.provider import AccessToken, TokenVerifier
from mcp.server.auth.settings import AuthSettings
from mcp.server.fastmcp import FastMCP
from mcp.server.fastmcp.exceptions import ToolError
from mcp.server.transport_security import TransportSecuritySettings
from mcp.types import ToolAnnotations
from pydantic import AnyHttpUrl

from foodiemap_service import FoodieMapService
from oauth_service import OAuthService


class FoodieMapTokenVerifier(TokenVerifier):
    def __init__(self, oauth: OAuthService) -> None:
        self.oauth = oauth

    async def verify_token(self, token: str) -> AccessToken | None:
        verified = self.oauth.verify_access_token(token)
        if not verified:
            return None
        return AccessToken(
            token=token,
            client_id=verified.client_id,
            scopes=verified.scopes,
            expires_at=verified.expires_at,
            resource=self.oauth.resource_url,
            subject=verified.user_id,
        )


def create_mcp_server(
    service: FoodieMapService,
    oauth: OAuthService,
    connect: Callable[[], Any],
    allowed_origins: list[str],
) -> FastMCP:
    host = urlparse(oauth.resource_url).netloc
    security = TransportSecuritySettings(
        enable_dns_rebinding_protection=True,
        allowed_hosts=[host],
        allowed_origins=allowed_origins,
    )
    mcp = FastMCP(
        "FoodieMap",
        instructions=(
            "Access the authorized user's private FoodieMap restaurants, lists, and recipes. "
            "Creating a list always creates a private list. Never imply that a list was published."
        ),
        website_url=oauth.issuer_url,
        token_verifier=FoodieMapTokenVerifier(oauth),
        auth=AuthSettings(
            issuer_url=AnyHttpUrl(oauth.issuer_url),
            resource_server_url=AnyHttpUrl(oauth.resource_url),
            required_scopes=[],
        ),
        stateless_http=True,
        json_response=True,
        streamable_http_path="/",
        transport_security=security,
    )

    def identity(required_scope: str) -> tuple[str, str]:
        token = get_access_token()
        if not token or not token.subject:
            raise ToolError("FoodieMap authorization is required")
        if required_scope not in token.scopes:
            raise ToolError(f"Missing required scope: {required_scope}")
        return token.subject, token.client_id

    def audit(user_id: str, client_id: str, tool_name: str, status: str) -> None:
        with connect() as db:
            db.execute(
                """
                INSERT INTO mcp_audit_events (id, user_id, client_id, tool_name, status, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (str(uuid.uuid4()), user_id, client_id, tool_name, status, int(time.time())),
            )

    def absolute_media_urls(value: Any) -> Any:
        if isinstance(value, dict):
            return {
                key: f"{oauth.issuer_url}{item}" if key in {"image_url", "cover_image_url"} and isinstance(item, str) and item.startswith("/")
                else absolute_media_urls(item)
                for key, item in value.items()
            }
        if isinstance(value, list):
            return [absolute_media_urls(item) for item in value]
        return value

    def execute(tool_name: str, required_scope: str, operation: Callable[[str], dict[str, Any]]) -> dict[str, Any]:
        user_id, client_id = identity(required_scope)
        try:
            result = absolute_media_urls(operation(user_id))
        except (ValueError, KeyError) as error:
            audit(user_id, client_id, tool_name, "rejected")
            raise ToolError(str(error).strip("'")) from error
        except Exception:
            audit(user_id, client_id, tool_name, "failed")
            raise
        audit(user_id, client_id, tool_name, "success")
        return result

    @mcp.tool(
        annotations=ToolAnnotations(readOnlyHint=True, destructiveHint=False, idempotentHint=True, openWorldHint=False),
        structured_output=True,
    )
    def list_restaurants(status: str = "all", search: str = "", limit: int = 50, cursor: str | None = None) -> dict[str, Any]:
        """List the authorized user's restaurants with optional status, search, and pagination."""
        return execute(
            "list_restaurants", "restaurants:read",
            lambda user_id: service.list_restaurants(user_id, status=status, search=search, limit=limit, cursor=cursor),
        )

    @mcp.tool(
        annotations=ToolAnnotations(readOnlyHint=True, destructiveHint=False, idempotentHint=True, openWorldHint=False),
        structured_output=True,
    )
    def get_restaurant(restaurant_id: str) -> dict[str, Any]:
        """Get one restaurant and its dishes. The restaurant must belong to the authorized user."""
        return execute("get_restaurant", "restaurants:read", lambda user_id: service.get_restaurant(user_id, restaurant_id))

    @mcp.tool(
        annotations=ToolAnnotations(readOnlyHint=True, destructiveHint=False, idempotentHint=True, openWorldHint=False),
        structured_output=True,
    )
    def list_lists(visibility: str = "all", search: str = "", limit: int = 50, cursor: str | None = None) -> dict[str, Any]:
        """List the authorized user's private and public FoodieMap lists."""
        return execute(
            "list_lists", "lists:read",
            lambda user_id: service.list_lists(user_id, visibility=visibility, search=search, limit=limit, cursor=cursor),
        )

    @mcp.tool(
        annotations=ToolAnnotations(readOnlyHint=True, destructiveHint=False, idempotentHint=True, openWorldHint=False),
        structured_output=True,
    )
    def get_list(list_id: str) -> dict[str, Any]:
        """Get one FoodieMap list and its restaurant items."""
        return execute("get_list", "lists:read", lambda user_id: service.get_list(user_id, list_id))

    @mcp.tool(
        annotations=ToolAnnotations(readOnlyHint=True, destructiveHint=False, idempotentHint=True, openWorldHint=False),
        structured_output=True,
    )
    def list_recipes(search: str = "", limit: int = 50, cursor: str | None = None) -> dict[str, Any]:
        """List the authorized user's saved recipes with search and pagination."""
        return execute(
            "list_recipes", "recipes:read",
            lambda user_id: service.list_recipes(user_id, search=search, limit=limit, cursor=cursor),
        )

    @mcp.tool(
        annotations=ToolAnnotations(readOnlyHint=True, destructiveHint=False, idempotentHint=True, openWorldHint=False),
        structured_output=True,
    )
    def get_recipe(recipe_id: str) -> dict[str, Any]:
        """Get one saved recipe including ingredients, steps, notes, and image URL."""
        return execute("get_recipe", "recipes:read", lambda user_id: service.get_recipe(user_id, recipe_id))

    @mcp.tool(
        annotations=ToolAnnotations(readOnlyHint=False, destructiveHint=False, idempotentHint=False, openWorldHint=False),
        structured_output=True,
    )
    def create_list(title: str, description: str = "", restaurant_ids: list[str] | None = None) -> dict[str, Any]:
        """Create a private FoodieMap list, optionally containing restaurants owned by the authorized user."""
        return execute(
            "create_list", "lists:write",
            lambda user_id: service.create_private_list(
                user_id, title=title, description=description, restaurant_ids=restaurant_ids or []
            ),
        )

    return mcp
