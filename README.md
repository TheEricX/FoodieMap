# Gourmet Map MVP

一个本地运行的美食地图 MVP。它可以保存餐厅、解析 Google Maps 链接、显示相对距离，并把数据保存在浏览器本地。

## 功能

- 保存餐厅名称、地址、评分、状态、推荐菜和备注
- 复制 Google Maps 链接后，通过 `Paste & Add` 识别并确认添加
- 支持 `maps.app.goo.gl` 短分享链接，本地展开后解析坐标
- 支持 Google Maps 完整链接中的 `@lat,lng`、`?q=lat,lng`、`?query=lat,lng`、`!3d...!4d...`
- 从 `/maps/place/...` 链接尽量自动填店名
- 浏览器定位当前位置，按距离展示 Q 版相对地图
- 搜索、筛选、编辑、删除餐厅
- JSON 导入/导出备份
- 可选 Google Geocoding API Key，只在“只填地址转坐标”时使用

## 本地运行

必须用项目里的 `server.py` 启动。不要用 `python3 -m http.server`，否则 Google Maps 短链接无法展开。

最简单方式：双击 `start.command`，然后打开：

```text
http://localhost:5174
```

也可以手动运行：

```bash
cd /Users/chenjy/Desktop/美食地图
python3 server.py 5173
```

打开：

```text
http://localhost:5173
```

如果端口被占用，换一个端口：

```bash
python3 server.py 5181
```

然后打开：

```text
http://localhost:5181
```

停止服务：在运行服务的终端按 `Ctrl + C`。

## Docker 运行

安装 Docker Desktop 后运行：

```bash
docker compose up --build
```

打开：

```text
http://localhost:5173
```

停止：

```bash
docker compose down
```

Docker 版本同样运行 `server.py`，所以支持 Google Maps 短链接展开。

## 添加餐厅

推荐流程：

1. 在 Google Maps 复制餐厅链接，短链接也可以，例如 `https://maps.app.goo.gl/...`
2. 回到 Gourmet Map
3. 点击 `Paste & Add`
4. 浏览器如果询问剪贴板权限，选择允许
5. 确认识别出的店名和坐标后添加

如果剪贴板权限不可用：

1. 点击 `New Spot`
2. 把 Google Maps 链接粘贴到 `Google Maps 链接`
3. 页面会自动识别店名和坐标
4. 点击 `Save Spot`

## 短链服务状态

左侧 `Paste & Add` 下方应该显示：

```text
短链服务已连接。复制 Google Maps 链接后点 Paste & Add。
```

如果显示“短链服务未连接”，说明当前页面不是通过 `server.py` 启动的。停止当前服务后重新运行：

```bash
python3 server.py 5173
```

如果浏览器仍显示旧内容，使用 `Cmd + Shift + R` 强制刷新。

## 定位

点击右上角或地图区域的 `Use My Location`。浏览器会请求定位权限。

如果定位失败：

- 确认页面是通过 `http://localhost:端口` 打开的
- 在 macOS `System Settings > Privacy & Security > Location Services` 中允许浏览器定位
- 刷新页面后重试

定位失败时，应用会临时使用多伦多市中心作为当前位置。

## 数据保存

当前 MVP 使用浏览器 `localStorage` 保存数据。

- 同一浏览器内刷新页面不会丢
- 换浏览器、清理浏览器数据会丢
- 用 `Export` / `Import` 做备份和恢复

## Google API

默认不需要 Google API。

只有在你不粘贴带坐标的 Google Maps 链接、只填写普通地址并希望自动转坐标时，才需要在右上角设置里填写 Google Geocoding API Key。

## 项目文件

- `index.html`：页面结构
- `styles.css`：响应式 UI 样式
- `app.js`：前端交互、地图、数据保存
- `server.py`：本地静态服务和 Google Maps 短链接展开接口
- `Dockerfile` / `compose.yaml`：Docker 运行配置
