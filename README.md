# NavItem · 现代化个人导航工作台

一个轻量、纯净、高颜值且支持高度自定义的现代化个人导航主页与效率工作台，基于 **Vue 3 + Vite + Tailwind CSS + Express + SQLite3** 构建，开箱即用，支持本地源码与 Docker 容器一键部署。

## ✨ 核心功能特性

### 1. 🎨 现代化毛玻璃 UI 与三态主题联动
- **三态主题切换**：默认采用清新的**浅色主题 (`light`)**，支持点击顶部按钮在 **浅色 (`☀️`) / 深色 (`🌙`) / 跟随系统自动切换 (`🖥️`)** 三种模式间循环切换，实时响应系统 `prefers-color-scheme` 变化。
- **前后台主题 100% 同步**：后台管理系统、登录弹窗、确认框与首页小组件的深浅色视觉完全实时联动。
- **双视图模式切换**：支持在**详情卡片视图**（展示图标、标题、简介/域名）与**紧凑网格视图**（高密度图标网格）之间一键切换。

### 2. 🧩 三列双行效率小组件矩阵
首页上方采用与下方导航卡片网格严格等宽、等高对齐的**三列双行小组件布局**：
- **第一行（信息感知）**：
  - **实时时钟与时段问候**：展示精准时间、日期、星期及随早/午/晚动态变化的问候语。
  - **每日一言（Hitokoto）**：动态展示精选句子与出处，支持点击切换。
  - **智能天气提醒**：支持 **📍 自动定位** 与 **手动城市切换**，根据实时气温与气象状况生成出行与办公提醒。
- **第二行（效率工具）**：
  - **随手待办便签**：快速记录日常灵感与待办事项，自动持久化保存。
  - **实时汇率转换牌**：支持常见币种实时汇率换算与对照。
  - **重要日程倒计时**：直观展示目标日剩余天数与进度。

### 3. 🌅 必应每日壁纸与自定义背景引擎
- **必应每日壁纸（`type=bing`）**：
  - 系统内置防误删锁定的 **「🌅 每日壁纸」** 主题行，后端按上海时间每日零点自动从必应中国区拉取当天 1920P 高清壁纸并下载至 `uploads/bing` 本地缓存（自动保留最近 7 天，拉取失败时平滑回退最近缓存图或普通背景）。
  - 接口动态返回当日壁纸图片、标题与版权信息，兼顾美观与加载速度。
- **自定义壁纸与参数精调**：内置多套极光渐变与壁纸预设，支持输入外部图片 URL、CSS 渐变表达式或直接**上传本地壁纸图片**，并提供**背景模糊度 (`0~20px`)** 与 **遮罩浓度 (`0~85%`)** 实时滑块调节。

### 4. 🖱️ 首页原地登录编辑与全场景拖拽排序
- **首页原地登录鉴权**：点击首页顶部 **「编辑」** 按钮，若当前未登录会直接弹出登录框**原地完成认证**，无需跳转后台页面。
- **直观的首页原地编辑**：
  - 开启编辑模式后，**单击任意导航卡片即可直接弹窗修改**（标题、目标链接、简介、图标 URL 或本地上传图标）。
  - 所有主菜单、二级子菜单胶囊及卡片右上角浮现红色删除角标 `✕`，点击即可快速删除。
  - 卡片网格末尾提供 **`➕` 快捷新增卡片**入口，一键在当前分类下新增书签。
- **全场景拖拽排序**：
  - **主页卡片直接拖拽**：在首页直接按住任意导航卡片拖动到目标位置，松手即刻完成排列并自动持久化。
  - **后台全量拖拽排序**：后台栏目管理（主菜单、二级子菜单）、卡片管理、搜索引擎管理均支持按住左侧 `⠿` 手柄上下拖拽排序及 `↑ / ↓` 微调。

### 5. 🖼️ 网站图标自动抓取、本地转存与 30 天强缓存
- **在线图标自动转存本地**：新增或编辑卡片填写在线图标 URL 时，后端自动下载转存至本地 `uploads/` 目录并关联，彻底解决外链图标失效或跨域加载慢的问题。
- **真实图标预览与批量刷新**：后台卡片管理列表展示真实网站图标预览，支持 **「一键批量刷新图标」**（智能跳过用户手动上传的自定义图片）。
- **30 天静态强缓存**：服务端对图标静态资源开启 `Cache-Control: max-age=2592000, immutable`（30 天强缓存），二次访问秒开。

### 6. 🔍 自定义多搜索引擎与全站实时检索
- **多引擎一键切换**：内置 **站内搜索、Google、Bing、百度、GitHub、SearXNG** 等引擎，支持按 `/` 键快速聚焦搜索框。
- **站内跨分类实时检索**：在「站内搜索」模式下输入关键词，实时跨所有主分类与二级子分类检索匹配的卡片标题、简介与网址。
- **自定义搜索引擎配置**：可在后台自由新增、编辑、删除搜索引擎及查询 URL 模板（使用 `{q}` 作为搜索词占位符），支持设置默认引擎与拖拽排序。

### 7. 🔐 环境变量凭证隔离与安全防护
- **环境变量注入（`.env`）**：管理员初始账号、密码、服务端口与 JWT 密钥均通过 `.env` 环境变量配置，避免代码中硬编码敏感信息。
- **密码修改自动失效旧凭证**：修改管理员密码后，此前签发的旧登录状态自动失效，保障个人导航站安全。
- **单实例清爽通知（Toast）**：全局操作通知采用单实例替换机制，界面始终只保留最新一条提示，绝不堆叠遮挡。

## 📁 项目目录结构

```text
navitem/
├── app.js                     # Express 应用入口、路由挂载与静态资源强缓存托管
├── config.js                  # 服务端环境变量与全局配置读取
├── db.js                      # SQLite 数据库初始化、表结构迁移与种子数据
├── schema.sql                 # 完整 SQLite 数据库建表与初始数据 SQL 脚本
├── .env.example               # 环境变量配置示例模板
├── Dockerfile                 # 多阶段构建 Docker 镜像配置
├── docker-compose.yml         # Docker Compose 一键编排配置
├── package.json               # 后端依赖与启动脚本
├── utils/                     # 后端工具函数（网站图标抓取、在线图标下载转存等）
├── uploads/                   # 本地上传资源、转存图标及必应每日壁纸缓存（uploads/bing）
├── routes/                    # 后端 RESTful API 路由模块
│   ├── auth.js                # 管理员登录认证路由
│   ├── authMiddleware.js      # JWT 鉴权与凭证有效性校验中间件
│   ├── menu.js                # 主菜单与二级子菜单 CRUD 及排序路由
│   ├── card.js                # 导航卡片 CRUD、排序、图标自动转存与批量刷新路由
│   ├── background.js          # 背景主题、自定义壁纸与必应每日壁纸自动拉取路由
│   ├── searchEngine.js        # 搜索引擎自定义配置与排序路由
│   ├── upload.js              # 本地图片上传路由
│   └── user.js                # 管理员密码安全修改路由
└── web/                       # Vue 3 + Vite 前端工程
    ├── index.html             # 前端入口 HTML（含 Tailwind 与全局主题样式）
    ├── vite.config.mjs        # Vite 构建与开发代理配置
    └── src/
        ├── api.js             # 前后端 API 请求封装（含离线 LocalStorage 自动降级）
        ├── defaultData.js     # 默认分类、卡片、背景、搜索引擎与城市预设数据
        ├── router.js          # Vue Router 路由配置
        └── views/
            ├── Home.vue       # 前台导航主页（含三列双行组件矩阵与原地编辑）
            ├── Admin.vue      # 后台管理系统布局与登录守卫
            └── admin/         # 后台各功能模块子页面
                ├── MenuManage.vue         # 栏目与二级子菜单管理
                ├── CardManage.vue         # 网站导航卡片管理（含真实图标预览与批量刷新）
                ├── BackgroundManage.vue   # 背景主题、必应每日壁纸与自定义壁纸设置
                ├── SearchEngineManage.vue # 首页搜索引擎与地址配置
                └── UserManage.vue         # 管理员密码安全修改
```

## 🗄️ 数据库表结构 (`schema.sql`)

项目使用轻量级 **SQLite3** 数据库（默认自动生成于 `database/nav.db`），核心包含以下 6 张数据表：

| 表名 | 说明 | 核心字段 |
| :--- | :--- | :--- |
| `menus` | 一级主菜单分类表 | `id`, `name`, `order` |
| `sub_menus` | 二级子菜单分类表 | `id`, `parent_id`, `name`, `order` |
| `cards` | 网站导航卡片表 | `id`, `menu_id`, `sub_menu_id`, `title`, `url`, `logo_url`, `desc`, `order` |
| `backgrounds` | 首页背景与壁纸配置表（含 `type='bing'` 每日壁纸系统行） | `id`, `name`, `type`, `value`, `blur`, `overlay_opacity`, `is_active` |
| `search_engines` | 首页搜索引擎配置表 | `id`, `name`, `label`, `url_template`, `placeholder`, `is_default`, `order` |
| `users` | 后台管理员用户表 | `id`, `username`, `password` (bcrypt 加密存储) |

## ⚙️ 环境变量及数据持久化说明

### 1. 环境变量配置 (`.env`)

| 环境变量 | 示例默认值 | 说明 |
| :--- | :--- | :--- |
| `PORT` | `3000` | Web 服务监听端口 |
| `ADMIN_USERNAME` | 在 `.env` 中配置 | 初始管理员登录用户名 |
| `ADMIN_PASSWORD` | 在 `.env` 中配置 | 初始管理员登录密码 |
| `JWT_SECRET` | 随机长字符串 | JWT 令牌签名密钥 |

### 2. 数据持久化目录说明
- **`/app/database`（本地对应 `./database`）**：存放 SQLite 数据库文件 `nav.db`，包含所有菜单分类、卡片、背景、搜索引擎及管理员账户数据。
- **`/app/uploads`（本地对应 `./uploads`）**：存放用户上传的自定义图标、壁纸、自动本地化转存的网站 Favicon 以及 `uploads/bing` 必应每日壁纸缓存。
- 使用 Docker 部署时，建议同时挂载 `/app/database` 与 `/app/uploads` 目录以实现完整的数据持久化。

## 🚀 部署指南

### 方式一：源代码本地部署

1. **克隆仓库并配置环境变量**：
   ```bash
   git clone https://github.com/Jinyinghui/navitem.git
   cd navitem
   cp .env.example .env
   ```
   编辑 `.env` 文件，设置自定义的 `ADMIN_USERNAME`、`ADMIN_PASSWORD` 与 `JWT_SECRET`。

2. **安装后端依赖**：
   ```bash
   npm install
   ```

3. **构建前端静态资源**：
   ```bash
   cd web
   npm install
   npm run build
   cd ..
   ```

4. **启动后端服务**：
   ```bash
   npm start
   ```
   启动成功后：
   - **导航站前台首页**：`http://localhost:3000`
   - **后台管理控制台**：`http://localhost:3000/admin`（或直接点击首页顶部「编辑」按钮原地登录编辑）

### 方式二：Docker 环境部署指南

#### 1. Docker CLI 快速部署 (`docker run`)

```bash
docker run -d \
  --name navitem \
  -p 3000:3000 \
  -v $(pwd)/database:/app/database \
  -v $(pwd)/uploads:/app/uploads \
  -e NODE_ENV=production \
  -e PORT=3000 \
  -e ADMIN_USERNAME=admin \
  -e ADMIN_PASSWORD=your_strong_password \
  -e JWT_SECRET=your_random_jwt_secret \
  --restart unless-stopped \
  ghcr.io/jinyinghui/navitem:latest
```

#### 2. `docker-compose.yml` 部署（推荐）

**方式 A：克隆仓库配合 `.env` 一键构建启动**
```bash
git clone https://github.com/Jinyinghui/navitem.git
cd navitem
cp .env.example .env
# 编辑 .env 文件修改管理员账号密码与 JWT_SECRET 后启动：
docker-compose up -d --build
```

**方式 B：使用独立 `docker-compose.yml` 配置文件部署**

创建 `docker-compose.yml` 文件：
```yaml
version: '3.8'

services:
  navitem:
    image: ghcr.io/jinyinghui/navitem:latest
    # 如需基于本地源码构建镜像，可取消下一行注释：
    # build: .
    container_name: navitem
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000                        # 服务监听端口
      - ADMIN_USERNAME=admin             # 后台初始管理员账号
      - ADMIN_PASSWORD=your_password     # 后台初始管理员密码
      - JWT_SECRET=your_random_secret    # JWT 签名密钥
    volumes:
      - ./database:/app/database         # 持久化 SQLite 数据库 (nav.db)
      - ./uploads:/app/uploads           # 持久化上传图标、转存 Favicon 与必应壁纸缓存
    restart: unless-stopped
```

启动容器：
```bash
docker compose up -d
```

#### 3. Docker 镜像地址与多架构自构建说明

- **GitHub Container Registry 镜像**（由 GitHub Actions 自动构建，支持 `linux/amd64` 与 `linux/arm64` 多架构）：
  ```text
  ghcr.io/jinyinghui/navitem:latest
  ```
- **本地手动构建 Docker 镜像**：
  ```bash
  docker build -t navitem:latest .
  ```

## ⌨️ 常用快捷操作速览

| 操作场景 | 交互方式 |
| :--- | :--- |
| **快速聚焦搜索框** | 在首页任意非输入区域按下键盘 `/` 键 |
| **主页卡片拖拽排序** | 在首页直接按住任意导航卡片拖动到目标卡片位置松开 |
| **开启首页原地编辑** | 点击顶部栏「编辑」按钮（未登录时直接弹窗完成原地登录） |
| **原地修改或新增卡片** | 编辑模式下**单击任意卡片**直接弹窗修改，或点击网格末尾 `➕` 新增卡片 |
| **主页快速删除项** | 编辑模式下点击各菜单或卡片右上角红叉 `✕` 即可删除 |
| **切换浅色/深色/自动主题** | 点击顶部栏「浅色 / 深色 / 自动」按钮，前后台界面实时同步切换 |

## 📄 开源协议

本项目基于 [Apache-2.0 License](https://www.google.com/search?q=LICENSE) 开源，欢迎自由使用、修改与二次开发。
