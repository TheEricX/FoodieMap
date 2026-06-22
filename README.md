# Gourmet Map / FoodieMap MVP

Gourmet Map 是一个可自托管的美食地图 MVP。它支持 Google 登录、云端保存餐厅、记录菜品和图片、生成分享链接、自定义餐厅清单，以及公开 Discovery 清单浏览；前端使用木质手账风 UI，并支持同一餐厅分类在地图和列表两种模式之间切换。

## 功能

- Google OAuth 登录，不需要额外注册
- SQLite 保存用户、餐厅、菜品、分享链接、自定义 list 和公开 Discovery list
- 保存餐厅状态、去过次数、个人评分、备注、Google Maps 链接和坐标
- 每家店可记录菜品：`Liked` / `Tried`、5 星评分、备注、1 张压缩图片
- `Paste & Add` 支持 Google Maps 完整链接和 `maps.app.goo.gl` 短链接
- `Paste & Add` 会检测相似餐厅；发现重复时先询问用户是否继续创建
- 左侧分类支持系统智能分类和自定义清单：`All Spots`、`Visited`、`Want to Go`、`Favorites`，以及用户创建的私密/公开 list
- `Map View` 和 `List View` 是同一分类的两种展示方式；系统分类和自定义 list 都可以在地图与列表之间切换
- 自定义 list 在 `Manage` 菜单里集中管理：编辑信息、发布/取消发布、添加或移除餐厅、删除清单
- `List View` 行内操作保持统一：`Map` 打开当前分类地图，`Google` 打开 Google Maps；系统分类里的 `Delete` 会删除餐厅记录，自定义 list 里的 `Remove` 只从当前清单移除餐厅
- 自定义 list 默认私密，可手动 `Publish` 到 Discovery；公开 list 可被其他用户复制到自己的 My Lists
- `Discovery` 支持浏览公开清单、按 Popular / Recent 排序、搜索公开清单；没有公开清单时会根据登录和 list 状态引导创建、添加餐厅或手动发布
- 系统语言默认英文，顶部 globe 菜单可切换 English / 中文，并会在当前浏览器中记住选择
- 分享链接 `/share/{token}` 支持未登录预览
- 朋友登录后可一键添加分享店铺到自己的列表，默认分类为 `Want to Go`
- 木质手账风响应式布局，支持桌面、平板和手机；桌面 topbar 固定在顶部，只有内容滚动到其下方时才显示阴影

## 本地运行

安装依赖：

```bash
cd /Users/chenjy/Desktop/美食地图
python3 -m pip install -r requirements.txt
```

创建 `.env`：

```env
GOOGLE_CLIENT_ID=你的 Google OAuth Client ID
GOOGLE_CLIENT_SECRET=你的 Google OAuth Client Secret
APP_BASE_URL=http://localhost:5174
SESSION_SECRET=换成一串随机长字符串
```

`SESSION_SECRET` 必须至少 32 个字符，不能使用默认示例值。

启动：

```bash
python3 server.py 5174
```

打开：

```text
http://localhost:5174
```

不要使用 `python3 -m http.server`，否则 API、登录、短链接展开、图片上传都不可用。

## Google 登录配置

`server.py` 会自动读取项目根目录的 `.env`。如果你已经在终端里 `export` 了同名变量，终端里的值优先。

Google Cloud Console 里 OAuth Redirect URI 填：

```text
http://localhost:5174/auth/google/callback
```

如果部署到公网域名，把 `APP_BASE_URL` 和 Redirect URI 换成 HTTPS 域名。

## Docker 运行

创建 `.env`：

```bash
SESSION_SECRET=换成一串随机长字符串
GOOGLE_CLIENT_ID=你的 Google OAuth Client ID
GOOGLE_CLIENT_SECRET=你的 Google OAuth Client Secret
```

启动：

```bash
docker compose up --build
```

打开：

```text
http://localhost:5173
```

数据保存在 Docker volume `foodiemap_foodie-map-data` 里，包括：

- `/data/foodiemap.db`
- `/data/uploads`

停止：

```bash
docker compose down
```

## 使用流程

1. 点击右上角 `Sign in`，用 Google 邮箱登录。
2. 点击 `New Spot` 或复制 Google Maps 链接后点 `Paste & Add`。
3. 如果自动添加时发现相似餐厅，确认是否继续创建重复记录。
4. 编辑店铺时可以记录去过次数、个人评分和菜品。
5. 在菜品区域添加菜名、状态、评分，并可上传一张图片。
6. 在左侧选择系统分类或自定义 list，例如 `All Spots`、`Visited` 或自己创建的 `333`。
7. 点击顶部 `Map View` / `List View`，用地图或列表查看当前选中的同一个分类。
8. 在系统分类的列表行点击 `Delete` 会删除餐厅记录；在自定义 list 的列表行点击 `Remove` 只会把餐厅移出当前清单。
9. 创建自定义 list 后，可以在 `List View` 的 `Manage` 菜单里编辑清单、打开 `Manage Spots` 添加或移除餐厅，也可以点击 `Open on Map` 用地图显示该 list。
10. 自定义 list 默认私密；在 `Manage` 菜单里点击 `Publish` 后会进入 `Discovery`。
11. 如果 `Discovery` 还没有公开清单，页面会提示下一步；有可发布私密 list 时，`Publish a list` 会跳回对应清单，但仍需要用户手动通过 `Manage > Publish` 发布。
12. 在 `Discovery` 浏览公开清单；登录后可 `Copy to My Lists` 复制到自己的私密清单。
13. 点击顶部 globe 菜单可切换 English / 中文；选择会保存到当前浏览器。
14. 在店铺详情卡点击 `Share`，手动选择要推荐的菜品，生成分享链接。
15. 朋友打开分享链接可以预览；登录后点 `Add to My List` 加入自己的列表。

## API

主要 API：

- `GET /api/me`
- `GET /auth/google/login`
- `GET /auth/google/callback`
- `POST /auth/logout`
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
- `GET /api/resolve-google-link?url=...`
- `GET /api/health`

## 项目文件

- `CHANGELOG.md`：按 `Unreleased` 记录功能、修复、文档和开发流程变更
- `index.html`：页面结构
- `styles.css`：响应式 UI 样式
- `app.js`：前端交互、分类状态、Map/List 展示模式、Discovery、API 数据层
- `server.py`：FastAPI 后端、SQLite、OAuth、上传、分享、list API
- `requirements.txt`：Python 依赖
- `Dockerfile` / `compose.yaml`：Docker 运行配置
- `.codex/skills/foodie-map-commit-hygiene/`：项目内 Codex skill；提交前检查 README、CHANGELOG 和已有 agenda/roadmap 文档是否需要同步

## 当前限制

- 第一版只支持 Google OAuth，不支持邮箱密码注册。
- 图片保存在本机或 Docker volume，不接 S3。
- SQLite 适合 MVP 和小规模使用；多人高频使用后建议迁移到 Postgres。
- 分享链接默认长期有效，暂不支持过期和撤销。
- 第一版不支持 list 封面上传；封面优先使用清单内容或主题占位图。
- Discovery 的 `Friends` 社交关系仅作为未来方向，当前只提供公开清单浏览与复制。
