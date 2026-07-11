# FoodieMap Remote MCP Server

FoodieMap exposes a stateless Streamable HTTP MCP endpoint at `/mcp`. It uses OAuth 2.1 Authorization Code with PKCE so an AI client acts only for the FoodieMap user who approved it.

## Capabilities

| Tool | Scope | Behavior |
| --- | --- | --- |
| `list_restaurants` | `restaurants:read` | Search, filter, and paginate the user's restaurants |
| `get_restaurant` | `restaurants:read` | Return one owned restaurant and dishes |
| `list_lists` | `lists:read` | Search and paginate owned private/public lists |
| `get_list` | `lists:read` | Return one owned list and its restaurants |
| `list_recipes` | `recipes:read` | Search and paginate recipes |
| `get_recipe` | `recipes:read` | Return one owned recipe |
| `create_list` | `lists:write` | Atomically create a private list with optional owned restaurants |

The first release cannot create/edit/delete restaurants or recipes, upload images, or publish lists to Discovery.

## Local Setup

Use Python 3.12 or newer:

```bash
python3.12 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt pytest
cp env.example.txt .env
sh scripts/python.sh server.py 5174
```

Set local MCP values:

```text
MCP_PUBLIC_URL=http://localhost:5174/mcp
MCP_ISSUER_URL=http://localhost:5174
MCP_ALLOWED_ORIGINS=http://localhost:6274
OAUTH_TOKEN_SECRET=<random value different from SESSION_SECRET>
```

Start MCP Inspector:

```bash
npx -y @modelcontextprotocol/inspector
```

Choose Streamable HTTP and connect to `http://localhost:5174/mcp`. Inspector discovers OAuth metadata, dynamically registers its callback, opens FoodieMap login, and presents the consent page.

## Authorization Model

- Clients discover the authorization server from `/.well-known/oauth-protected-resource/mcp`.
- Dynamic registration accepts HTTPS callbacks and localhost HTTP callbacks only.
- Authorization requires PKCE S256. Codes expire after five minutes and are single-use.
- Opaque access tokens expire after one hour. Refresh tokens expire after 30 days and rotate on use.
- Expired authorization codes and refresh tokens are removed during service startup; old expired access-token rows are retained briefly for diagnostics, then removed.
- Only HMAC hashes of codes and tokens are stored in PostgreSQL/SQLite.
- Every MCP request sends `Authorization: Bearer ...`; a FoodieMap browser cookie alone is rejected.
- Tool functions derive the user from the verified token subject and check their own scope.
- Settings > Connected AI Apps revokes a grant and all associated access/refresh tokens immediately.
- Audit records contain user ID, client ID, tool name, outcome, and timestamp only. Tool arguments and user content are not logged.

## Production Configuration

Create a dedicated Secret Manager secret:

```bash
openssl rand -hex 32 | gcloud secrets create OAUTH_TOKEN_SECRET --data-file=-
gcloud secrets add-iam-policy-binding OAUTH_TOKEN_SECRET \
  --member="serviceAccount:foodiemap-run@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

Configure Cloud Run:

```text
MCP_PUBLIC_URL=https://PRODUCTION_DOMAIN/mcp
MCP_ISSUER_URL=https://PRODUCTION_DOMAIN
MCP_ALLOWED_ORIGINS=<comma-separated browser MCP client origins>
OAUTH_TOKEN_SECRET=Secret Manager OAUTH_TOKEN_SECRET:latest
```

Do not reuse `SESSION_SECRET`. Do not configure a shared master token. Requests without `Origin` are supported for native/server clients; browser requests with an unknown Origin are rejected.

## Testing And Operations

```bash
npm run test:mcp
npm run test:all
```

The MCP suite covers registration validation, PKCE, code replay, refresh rotation, revocation, scope checks, Origin checks, user isolation, atomic list creation, and real JSON-RPC initialize/tools requests.

Before production, use staging to authorize through Inspector, call every read tool, create a private list, confirm it appears in the web UI, revoke the client, and verify the old token receives HTTP 401. Roll back the Cloud Run revision if protocol startup fails; OAuth and list rows remain in Cloud SQL.
