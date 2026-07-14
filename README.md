# Gourmet Map / FoodieMap MVP

Gourmet Map 是一个可自托管的美食地图 MVP。它支持 Google、邮箱密码和邮箱验证码登录，云端保存餐厅、记录菜品和图片、生成分享链接和二维码、自定义餐厅清单，以及公开 Discovery 清单浏览；前端使用木质手账风 UI，并支持同一餐厅分类在地图和列表两种模式之间切换。

## 功能

- 支持 Google OAuth、邮箱+密码、邮箱验证码三种登录方式；同邮箱会自动合并为同一账号
- 提供 OAuth 2.1 保护的远程 MCP Server，AI Agent 经用户授权后可读取餐厅、清单和菜谱，并创建私密清单
- SQLite 保存用户、餐厅、菜品、菜谱、分享链接、私密推荐分享包、自定义 list 和公开 Discovery list
- 保存餐厅状态、去过次数、个人评分、备注、地图链接和坐标
- 每家店可记录菜品：`Liked` / `Tried`、5 星评分、备注、1 张压缩图片
- `Paste & Add` 支持 Google Maps、Apple Maps 和地图短链接，并会尽量识别店名、地址和坐标；链接只有坐标时可用 Google Geocoding API Key 反查地址
- `Paste & Add` 会检测相似餐厅；发现重复时先询问用户是否继续创建
- 左侧分类支持系统智能分类和自定义清单：`All Spots`、`Visited`、`Want to Go`、`Favorites`，以及用户创建的私密/公开 list
- `Map View` 和 `List View` 是同一分类的两种展示方式；系统分类和自定义 list 都可以在地图与列表之间切换
- 定位是可选功能：允许定位后显示附近距离和排序；拒绝时进入隐私浏览地图，仍可查看全部餐厅且不会使用假坐标。设备坐标只保留在浏览器内存中，不上传到服务器
- 自定义 list 在 `Manage` 菜单里集中管理：编辑信息、发布/取消发布、添加或移除餐厅、删除清单
- `List View` 行内操作保持统一：`Map` 打开当前分类地图，`Open Maps` 让用户选择 Google Maps 或 Apple Maps；系统分类里的 `Delete` 会删除餐厅记录，自定义 list 里的 `Remove` 只从当前清单移除餐厅
- 自定义 list 默认私密，可手动 `Publish` 到 Discovery；公开 list 可被其他用户复制到自己的 My Lists
- `Discovery` 支持浏览公开清单、按 Popular / Recent 排序、搜索公开清单，并提供独立手机布局；没有公开清单时会根据登录和 list 状态引导创建、添加餐厅或手动发布
- `Discovery` 可创建私密推荐分享包，选择要推荐的餐厅和菜品后生成链接与可保存的 PNG 推荐图；别人无需登录即可预览，登录后可一键复制到自己的 My Lists，创建者可在历史记录里撤销分享
- `Recipes / 菜谱` 可记录自己做过的菜，包含成品图、食材、做法、备注、评分和做菜日期；单个菜谱可生成公开预览链接、QR code 和 PNG 分享图，别人登录后可一键保存到自己的 My Recipes
- 系统语言默认英文，顶部 globe 菜单可切换 English / 中文，并会在当前浏览器中记住选择
- 管理员可通过独立 `/admin` 地址登录后台，管理账号状态、手动切换 Free/Paid 计划、暂停账号、软删除账号和恢复账号
- Free 用户默认最多保存 50 个餐厅；Paid 用户不受该额度限制
- 分享链接 `/share/{token}` 支持未登录预览
- 私密推荐链接 `/share-pack/{token}` 和菜谱分享链接 `/recipe-share/{token}` 支持未登录预览，推荐图 `/api/share-packs/{token}/card.png` 与 `/api/recipe-shares/{token}/card.png` 可单独打开和保存
- 朋友登录后可一键添加分享店铺到自己的列表，默认分类为 `Want to Go`
- 木质手账风响应式布局，支持桌面、平板和手机；桌面 topbar 固定在顶部，只有内容滚动到其下方时才显示阴影

## 本地运行

安装依赖：

```bash
cd /Users/chenjy/Desktop/美食地图
python3.12 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
```

从模板创建 `.env`：

```bash
cp env.example.txt .env
```

然后编辑 `.env`，至少替换 `SESSION_SECRET`；需要 `/admin` 后台时设置 `ADMIN_USERNAME` 和 `ADMIN_PASSWORD`：

```env
GOOGLE_CLIENT_ID=你的 Google OAuth Client ID
GOOGLE_CLIENT_SECRET=你的 Google OAuth Client Secret
GOOGLE_GEOCODING_API_KEY=可选，用于从坐标自动补全地址
APP_BASE_URL=http://localhost:5174
SESSION_SECRET=换成一串随机长字符串
ADMIN_USERNAME=admin
ADMIN_PASSWORD=换成强密码
FREE_RESTAURANT_LIMIT=50
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USERNAME=mailer@example.com
SMTP_PASSWORD=邮件服务密码
SMTP_FROM=FoodieMap <mailer@example.com>
SMTP_USE_TLS=true
```

`SESSION_SECRET` 必须至少 32 个字符，不能使用默认示例值。
`ADMIN_USERNAME` 和 `ADMIN_PASSWORD` 用于 `/admin` 独立后台登录，必须一起配置；管理员密码至少 8 个字符。
`FREE_RESTAURANT_LIMIT` 可调整 Free 用户的餐厅保存上限，默认是 `50`。
`GOOGLE_GEOCODING_API_KEY` 可选；配置后，地图链接只包含坐标时可自动反查地址。也可以在网页右上角 `Google API` 设置里为当前浏览器保存 key。
邮箱验证码登录和密码重置需要 SMTP 配置；未配置 SMTP 时，Google 登录和邮箱密码登录仍可用，但发送验证码会返回配置错误。

启动：

```bash
sh scripts/python.sh server.py 5174
```

打开：

```text
http://localhost:5174
```

不要使用 `python3 -m http.server`，否则 API、登录、短链接展开、图片上传都不可用。

## 自动化测试

项目使用 Playwright 进行桌面和手机端回归测试。首次使用时安装固定依赖和 Chromium：

```bash
npm ci
npx playwright install chromium
```

运行完整本地检查：

```bash
npm run test:all
```

测试会启动独立 SQLite 服务并自动删除临时账号和数据，不会使用 `data/foodiemap.db`。命令、staging 安全配置和失败调试见 [docs/automated-testing.md](docs/automated-testing.md)。

前端采用共享业务核心与独立 desktop/mobile shell，并集中管理 API 请求、确认操作、未保存退出和空/错误状态。断点、模块职责和新功能双端检查清单见 [docs/responsive-ui-design.md](docs/responsive-ui-design.md)。

## Google 登录配置

`server.py` 会自动读取项目根目录的 `.env`。如果你已经在终端里 `export` 了同名变量，终端里的值优先。

Google Cloud Console 里 OAuth Redirect URI 填：

```text
http://localhost:5174/auth/google/callback
```

如果部署到公网域名，把 `APP_BASE_URL` 和 Redirect URI 换成 HTTPS 域名。

## Remote MCP Server

MCP 端点为：

```text
https://YOUR_DOMAIN/mcp
```

Agent 会通过浏览器打开 FoodieMap 登录和授权页，不需要复制网页 Cookie 或 Google token。可用工具、scope、MCP Inspector 连接方法和安全设计见 [docs/mcp-server.md](docs/mcp-server.md)。

## Docker 运行

Docker 镜像会读取 `PORT` 环境变量；Google Cloud Run 会自动注入该变量。本地 `docker compose` 仍映射到 `5173`。

Google Cloud Run 部署流程见 [docs/deployment-google-cloud.md](docs/deployment-google-cloud.md)。

从模板创建 `.env`：

```bash
cp env.example.txt .env
```

然后按部署环境编辑 `.env`。本地 Docker 默认仍可使用 SQLite 和 Docker volume；Cloud Run 生产部署应使用 Cloud SQL PostgreSQL 和 Google Cloud Storage，详见部署文档。

```bash
SESSION_SECRET=换成一串随机长字符串
GOOGLE_CLIENT_ID=你的 Google OAuth Client ID
GOOGLE_CLIENT_SECRET=你的 Google OAuth Client Secret
GOOGLE_GEOCODING_API_KEY=可选，用于从坐标自动补全地址
ADMIN_USERNAME=admin
ADMIN_PASSWORD=换成强密码
FREE_RESTAURANT_LIMIT=50
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USERNAME=mailer@example.com
SMTP_PASSWORD=邮件服务密码
SMTP_FROM=FoodieMap <mailer@example.com>
SMTP_USE_TLS=true
# Cloud Run production:
# APP_ENV=production
# DATABASE_URL=postgresql://...
# GCS_BUCKET=your-upload-bucket
```

启动：

```bash
docker compose up --build
```

打开：

```text
http://localhost:5173
```

本地 Docker 数据保存在 Docker volume `foodiemap_foodie-map-data` 里，包括：

- `/data/foodiemap.db`
- `/data/uploads`

停止：

```bash
docker compose down
```

## 使用流程

1. 打开主站会先进入登录页，可选择 Google、邮箱密码或邮箱验证码登录；朋友分享的 `/share/{token}` 和 `/share-pack/{token}` 仍可免登录预览。
2. 点击 `New Spot` 或复制 Google Maps / Apple Maps 链接后点 `Paste & Add`。
3. Map 首次使用时可选择 `Use my location` 查看距离，或选择 `Not now` 进入不显示距离的隐私浏览模式；之后可随时通过顶部定位图标切换。
4. 如果自动添加时发现相似餐厅，确认是否继续创建重复记录。
5. 编辑店铺时可以记录去过次数、个人评分和菜品。
6. 在菜品区域添加菜名、状态、评分，并可上传一张图片。
7. 在左侧选择系统分类或自定义 list，例如 `All Spots`、`Visited` 或自己创建的 `333`。
8. 点击顶部 `Map View` / `List View`，用地图或列表查看当前选中的同一个分类。
9. 在系统分类的列表行点击 `Delete` 会删除餐厅记录；在自定义 list 的列表行点击 `Remove` 只会把餐厅移出当前清单。
10. 创建自定义 list 后，可以在 `List View` 的 `Manage` 菜单里编辑清单、打开 `Manage Spots` 添加或移除餐厅，也可以点击 `Open on Map` 用地图显示该 list。
11. 自定义 list 默认私密；在 `Manage` 菜单里点击 `Publish` 后会进入 `Discovery`。
12. 如果 `Discovery` 还没有公开清单，页面会提示下一步；有可发布私密 list 时，`Publish a list` 会跳回对应清单，但仍需要用户手动通过 `Manage > Publish` 发布。
13. 在 `Discovery` 浏览公开清单；登录后可 `Copy to My Lists` 复制到自己的私密清单。
14. 在 `Discovery` 点击 `Create Share Pack`，选择餐厅和菜品后生成私密链接和 PNG 推荐图。
15. `Discovery` 会保留当前账号创建过的私密推荐历史，可重新复制链接、打开推荐图、打开预览页或撤销分享。
16. 朋友打开 `/share-pack/{token}` 或扫描推荐图二维码可以预览整组推荐；登录后点 `Add to My Lists` 会复制成自己的私密清单。撤销后旧链接、二维码和图片都会失效。
17. 打开 `Recipes / 菜谱`，点击右上角 `+` 记录自己做过的菜，可添加照片、食材、做法、备注、评分和做菜日期。
18. 在菜谱详情点击 `Share` 可生成公开菜谱链接、QR code 和 PNG 分享图；朋友打开 `/recipe-share/{token}` 可免登录预览，登录后点 `Save to My Recipes` 保存到自己的菜谱。
19. 点击顶部 globe 菜单可切换 English / 中文；选择会保存到当前浏览器。
20. 打开 `/admin`，用 `ADMIN_USERNAME` / `ADMIN_PASSWORD` 登录后台后，可暂停、软删除、恢复账号，并手动切换 Free/Paid。
21. Free 用户达到餐厅额度后，新增餐厅、复制公开清单、复制私密推荐包或从分享链接添加餐厅会被阻止；删除餐厅或升级为 Paid 后可继续添加。
22. 在店铺详情卡点击 `Share`，手动选择要推荐的菜品，生成单店分享链接。
23. 朋友打开单店分享链接可以预览；登录后点 `Add to My List` 加入自己的列表。

## API

主要 API：

- `GET /api/me`
- `GET /auth/google/login`
- `GET /auth/google/callback`
- `POST /auth/logout`
- `GET /api/admin/me`
- `POST /auth/admin/login`
- `POST /auth/admin/logout`
- `POST /auth/email/register`
- `POST /auth/email/login`
- `POST /auth/email/code/request`
- `POST /auth/email/code/verify`
- `POST /auth/email/password-reset/request`
- `POST /auth/email/password-reset/confirm`
- `GET /api/admin/users`
- `GET /api/admin/users/{user_id}`
- `PATCH /api/admin/users/{user_id}`
- `DELETE /api/admin/users/{user_id}`
- `POST /api/admin/users/{user_id}/restore`
- `GET /api/restaurants`
- `POST /api/restaurants`
- `GET /api/restaurants/{id}`
- `PATCH /api/restaurants/{id}`
- `DELETE /api/restaurants/{id}`
- `POST /api/restaurants/{id}/dishes`
- `PATCH /api/dishes/{id}`
- `POST /api/dishes/{id}/image`
- `DELETE /api/dishes/{id}`
- `POST /api/restaurants/{id}/share`
- `GET /api/share/{token}`
- `POST /api/share/{token}/add`
- `POST /api/share-packs`
- `GET /api/share-packs`
- `GET /api/share-packs/{token}`
- `GET /api/share-packs/{token}/qr.svg`
- `GET /api/share-packs/{token}/card.png`
- `POST /api/share-packs/{token}/add`
- `DELETE /api/share-packs/{token}`
- `GET /api/recipes`
- `POST /api/recipes`
- `GET /api/recipes/{id}`
- `PATCH /api/recipes/{id}`
- `DELETE /api/recipes/{id}`
- `POST /api/recipes/{id}/image`
- `POST /api/recipes/{id}/share`
- `GET /api/recipe-shares/{token}`
- `GET /api/recipe-shares/{token}/qr.svg`
- `GET /api/recipe-shares/{token}/card.png`
- `POST /api/recipe-shares/{token}/add`
- `GET /api/lists`
- `POST /api/lists`
- `GET /api/lists/{id}`
- `PATCH /api/lists/{id}`
- `DELETE /api/lists/{id}`
- `POST /api/lists/{id}/items`
- `DELETE /api/lists/{id}/items/{restaurant_id}`
- `GET /api/discovery/lists`
- `GET /api/discovery/lists/{id}`
- `POST /api/discovery/lists/{id}/copy`
- `GET /api/resolve-map-link?url=...`
- `GET /api/resolve-google-link?url=...`（兼容旧前端）
- `POST /api/reverse-geocode`
- `GET /api/health`

## 项目文件

- `CHANGELOG.md`：按 `Unreleased` 记录功能、修复、文档和开发流程变更
- `index.html`：页面结构
- `styles.css`：响应式 UI 样式
- `app.js`：前端交互、分类状态、Map/List 展示模式、Recipes、Discovery、API 数据层
- `server.py`：FastAPI 后端、SQLite、OAuth、上传、分享、recipe/list API、管理员 API 和 Free/Paid 额度规则
- `scripts/migrate_sqlite_to_postgres_gcs.py`：一次性迁移脚本，用于把本地 SQLite 数据和上传文件迁到 Cloud SQL PostgreSQL / Google Cloud Storage
- `requirements.txt`：Python 依赖
- `Dockerfile` / `compose.yaml`：Docker 运行配置
- `docs/responsive-ui-design.md`：桌面/手机响应式 UI 分工和移动端 Map View 设计原则
- `docs/deployment-google-cloud.md`：Google Cloud Run 部署流程和运维说明
- `.codex/skills/foodie-map-commit-hygiene/`：项目内 Codex skill；提交前检查 README、CHANGELOG 和已有 agenda/roadmap 文档是否需要同步

## 当前限制

- 邮箱注册第一版不强制验证邮箱；验证码登录成功或密码重置成功后会标记邮箱已验证。
- 邮箱验证码和密码重置依赖 SMTP 配置，当前不内置第三方邮件 API。
- 本地开发仍默认使用 SQLite 和本地 uploads；Cloud Run 生产部署应使用 Cloud SQL PostgreSQL 和 Google Cloud Storage。
- 图片生产环境保存在 Google Cloud Storage；数据库只保存图片对象路径或 URL。
- Free/Paid 目前由管理员手动切换，暂未接入 Stripe 或其他支付系统。
- 分享链接默认长期有效，暂不支持过期和撤销。
- 第一版不支持 list 封面上传；封面优先使用清单内容或主题占位图。
- Discovery 的 `Friends` 社交关系仅作为未来方向，当前只提供公开清单浏览与复制。
