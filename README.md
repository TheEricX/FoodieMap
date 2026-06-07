# FoodieMap MVP

FoodieMap 是一个可自托管的美食地图 MVP。它支持 Google 登录、云端保存餐厅、记录菜品和图片、生成分享链接，并保留原来的 Q 版相对地图体验。

## 功能

- Google OAuth 登录，不需要额外注册
- SQLite 保存用户、餐厅、菜品、分享链接
- 保存餐厅状态、去过次数、个人评分、备注、Google Maps 链接和坐标
- 每家店可记录菜品：`Liked` / `Tried`、5 星评分、备注、1 张压缩图片
- `Paste & Add` 支持 Google Maps 完整链接和 `maps.app.goo.gl` 短链接
- 分享链接 `/share/{token}` 支持未登录预览
- 朋友登录后可一键添加分享店铺到自己的列表，默认分类为 `Want to Go`
- 响应式布局，支持桌面、平板和手机

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
3. 编辑店铺时可以记录去过次数、个人评分和菜品。
4. 在菜品区域添加菜名、状态、评分，并可上传一张图片。
5. 在店铺详情卡点击 `Share`，手动选择要推荐的菜品，生成分享链接。
6. 朋友打开分享链接可以预览；登录后点 `Add to My List` 加入自己的列表。

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
- `GET /api/resolve-google-link?url=...`
- `GET /api/health`

## 项目文件

- `index.html`：页面结构
- `styles.css`：响应式 UI 样式
- `app.js`：前端交互、地图、API 数据层
- `server.py`：FastAPI 后端、SQLite、OAuth、上传、分享
- `requirements.txt`：Python 依赖
- `Dockerfile` / `compose.yaml`：Docker 运行配置

## 当前限制

- 第一版只支持 Google OAuth，不支持邮箱密码注册。
- 图片保存在本机或 Docker volume，不接 S3。
- SQLite 适合 MVP 和小规模使用；多人高频使用后建议迁移到 Postgres。
- 分享链接默认长期有效，暂不支持过期和撤销。
