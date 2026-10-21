# NavItem · 现代化个人导航工作台 v2.0

一个轻量、纯净、高颜值且支持高度自定义的现代化个人导航站项目，基于 **Vue 3 + Vite + Tailwind CSS + Express + SQLite3** 构建，开箱即用，支持一键部署。

---

## 🎨 核心功能特性

1. **现代化毛玻璃 UI 与浅色/深色/跟随系统三态主题**
   - **三态主题前后台同步**：支持浅色（Light）、深色（Dark）与跟随系统（System）三态主题切换，且前后台与弹窗视觉保持无缝同步。
   - **详情与紧凑双视图切换**：支持在**详情卡片视图**（展示图标、标题、简介/域名）与**紧凑网格视图**（高密度图标网格）之间一键切换。

2. **首页三列双行效率小组件矩阵**
   - **第一行小组件**：实时时钟问候、每日一言、智能天气提醒。
   - **第二行小组件**：随手待办便签、实时汇率转换牌、重要日程倒计时。
   - **等宽等高对齐**：全矩阵与下方卡片网格保持完全等宽等高精细对齐。

3. **必应每日壁纸与自定义视觉精调**
   - **必应每日壁纸**：系统内置每日壁纸行，每日零点自动拉取缓存与回退机制。
   - **自定义壁纸精调**：支持自定义背景图片、高斯模糊度及遮罩透明度精调。

4. **快捷编辑与全场景拖拽排序**
   - **原地弹窗登录**：首页点击编辑按钮即可直接原地弹窗登录。
   - **快捷修改与新增**：编辑模式下单击卡片直接弹窗修改、右上角红叉快速删除卡片、网格末尾加号快捷新增卡片。
   - **全场景拖拽排序**：支持前后台全场景直接拖拽卡片与分类进行排序。

5. **图标自动下载转存与强缓存优化**
   - **网站图标自动下载转存本地**：自动抓取网站图标并转存至本地服务器。
   - **后台真实图标预览与一键批量刷新**：后台支持真实图标预览与一键批量刷新图标功能，静态资源配置 30 天强缓存。

6. **多搜索引擎切换与站内跨分类实时检索**
   - **多搜索引擎切换**：内置百度、谷歌、必应等多种搜索引擎无缝切换。
   - **站内跨分类实时检索**：支持站内跨分类卡片实时搜索过滤。
   - **自定义搜索引擎配置**：支持自定义搜索引擎 URL 模板与快捷配置。

7. **环境变量凭证隔离与安全防护**
   - **环境变量凭证隔离**：敏感配置（管理员账号、密码、JWT 密钥等）完全通过环境变量隔离。
   - **凭证自动失效**：修改密码后旧 JWT Token 凭证自动作废失效。

---

## 📁 完整项目目录结构

```text
navitem/
├── .github/              # GitHub Actions 工作流配置
│   └── workflows/
├── assets/               # 项目静态资源文件
├── routes/               # Express 后端 API 路由
│   ├── auth.js           # 身份验证路由
│   ├── background.js     # 背景/壁纸管理路由
│   ├── cards.js          # 导航卡片管理路由
│   ├── icon.js           # 图标获取与转存路由
│   ├── menus.js          # 菜单分类管理路由
│   ├── search.js        # 搜索引擎管理路由
│   └── weather.js       # 天气与小组件 API 路由
├── uploads/              # 上传及本地缓存目录 (图标/壁纸等)
│   ├── bing/             # 必应每日壁纸缓存
│   └── icons/            # 转存的本地网站图标
├── utils/                # 工具函数模块
│   └── db.js             # 数据库辅助工具
├── web/                  # Vue 3 前端工程
│   ├── src/              # 前端源代码 (组件、视图、Pinia 状态)
│   ├── index.html        # 前端入口 HTML
│   ├── package.json      # 前端依赖配置
│   └── vite.config.js    # Vite 打包配置
├── database/             # SQLite 数据库持久化目录
│   └── nav.db            # SQLite 数据库文件
├── .dockerignore         # Docker 构建忽略配置
├── .env.example          # 环境变量配置示例文件
├── .gitignore            # Git 忽略配置
├── Dockerfile            # Docker 多阶段镜像构建文件
├── LICENSE               # 开源协议文件
├── README.md             # 项目说明文档
├── app.js                # Express 后端应用主入口
├── config.js             # 系统配置文件
├── db.js                 # SQLite 数据库初始化与表结构定义
├── docker-compose.yml    # Docker Compose 部署配置文件
├── package.json          # 后端依赖配置文件
└── schema.sql            # 数据库 Schema 参考文件
```

---

## 🗄️ 6 张 SQLite 数据库表结构说明

1. **`menus` (主菜单分类表)**
   - `id` (INTEGER, PRIMARY KEY, AUTOINCREMENT): 主键 ID
   - `name` (TEXT, NOT NULL): 分类名称
   - `order` (INTEGER, DEFAULT 0): 排序权重

2. **`sub_menus` (二级子菜单分类表)**
   - `id` (INTEGER, PRIMARY KEY, AUTOINCREMENT): 主键 ID
   - `parent_id` (INTEGER, NOT NULL): 外键关联 menus(id) 级联删除
   - `name` (TEXT, NOT NULL): 子分类名称
   - `order` (INTEGER, DEFAULT 0): 排序权重

3. **`cards` (导航卡片/网址表)**
   - `id` (INTEGER, PRIMARY KEY, AUTOINCREMENT): 主键 ID
   - `menu_id` (INTEGER): 外键关联 menus(id) 级联删除
   - `sub_menu_id` (INTEGER): 外键关联 sub_menus(id) 级联删除
   - `title` (TEXT, NOT NULL): 网站标题
   - `url` (TEXT, NOT NULL): 目标网址
   - `logo_url` (TEXT): 远程图标 URL
   - `custom_logo_path` (TEXT): 本地转存图标路径
   - `desc` (TEXT): 网站描述/简介
   - `order` (INTEGER, DEFAULT 0): 排序权重

4. **`users` (管理员用户表)**
   - `id` (INTEGER, PRIMARY KEY, AUTOINCREMENT): 主键 ID
   - `username` (TEXT, UNIQUE, NOT NULL): 管理员用户名
   - `password` (TEXT, NOT NULL): 加密密码散列

5. **`backgrounds` (壁纸与背景管理表)**
   - `id` (INTEGER, PRIMARY KEY, AUTOINCREMENT): 主键 ID
   - `name` (TEXT, NOT NULL): 背景名称
   - `type` (TEXT, NOT NULL, DEFAULT 'gradient'): 类型 (`gradient`/`image`/`bing`)
   - `value` (TEXT, NOT NULL): 背景值/图片路径/接口
   - `blur` (INTEGER, DEFAULT 0): 高斯模糊度
   - `overlay_opacity` (INTEGER, DEFAULT 30): 遮罩透明度
   - `is_active` (INTEGER, DEFAULT 0): 是否激活 (1: 激活, 0: 未激活)
   - `order` (INTEGER, DEFAULT 0): 排序权重
   - `created_at` (TEXT, DEFAULT datetime('now', 'localtime')): 创建时间

6. **`search_engines` (搜索引擎配置表)**
   - `id` (INTEGER, PRIMARY KEY, AUTOINCREMENT): 主键 ID
   - `name` (TEXT, NOT NULL): 引擎标识
   - `label` (TEXT, NOT NULL): 引擎显示名称
   - `url_template` (TEXT, NOT NULL): 查询 URL 模板 (含 `{q}` 占位符)
   - `placeholder` (TEXT, DEFAULT ''): 输入框提示占位符
   - `is_default` (INTEGER, DEFAULT 0): 是否默认 (1: 默认, 0: 否)
   - `order` (INTEGER, DEFAULT 0): 排序权重
   - `created_at` (TEXT, DEFAULT datetime('now', 'localtime')): 创建时间

---

## 🚀 部署指南

### 1. 环境变量与数据持久化目录

#### 环境变量说明 (`.env`)

| 环境变量 | 默认值 | 说明 |
| :--- | :--- | :--- |
| `PORT` | `3000` | 服务运行端口 |
| `ADMIN_USERNAME` | `admin` | 初始化管理员用户名 |
| `ADMIN_PASSWORD` | `123456` | 初始化管理员密码 |
| `JWT_SECRET` | 随机字符串 | JWT 身份验证签名密钥 |

#### 数据持久化目录说明

- `database/`：挂载 SQLite 数据库文件（`nav.db`），保存菜单分类、导航卡片、系统设置等数据。
- `uploads/`：挂载上传与本地缓存目录（包含转存图标 `icons/` 和必应每日壁纸缓存 `bing/`）。

---

### 2. 源代码本地部署步骤

1. **克隆项目代码**
   ```bash
   git clone git@github.com:Jinyinghui/navitem.git
   cd navitem
   ```

2. **配置环境变量**
   ```bash
   cp .env.example .env
   ```

3. **构建前端代码**
   ```bash
   cd web
   npm install
   npm run build
   cd ..
   ```

4. **安装后端依赖并启动服务**
   ```bash
   npm install
   npm start
   ```

5. **访问应用**
   在浏览器中打开 `localhost:3000` 即可使用。

---

### 3. Docker 环境部署指南

#### A. `docker run` 快速部署命令

```bash
docker run -d \
  --name nav-item \
  -p 3000:3000 \
  -e PORT=3000 \
  -e ADMIN_USERNAME=admin \
  -e ADMIN_PASSWORD=123456 \
  -e JWT_SECRET=your_jwt_secret \
  -v $(pwd)/database:/app/database \
  -v $(pwd)/uploads:/app/uploads \
  --restart always \
  ghcr.io/jinyinghui/navitem:latest
```

#### B. `docker-compose` 部署配置示例

创建 `docker-compose.yml` 文件：

```yaml
services:
  nav-item:
    image: ghcr.io/jinyinghui/navitem:latest
    container_name: nav-item
    ports:
      - "3000:3000"
    environment:
      - PORT=${PORT:-3000}
      - ADMIN_USERNAME=${ADMIN_USERNAME:-admin}
      - ADMIN_PASSWORD=${ADMIN_PASSWORD:-123456}
      - JWT_SECRET=${JWT_SECRET:-}
    volumes:
      - ./database:/app/database  # 持久化数据库文件
      - ./uploads:/app/uploads    # 持久化上传文件（图标 icons/、每日壁纸 bing/、后台上传的背景图）
    restart: always
```

启动命令：

```bash
docker-compose up -d
```

#### C. Docker 镜像构建说明

基于本地源码构建镜像：

```bash
# 构建镜像
docker build -t navitem:latest .

# 运行镜像
docker run -d \
  --name nav-item \
  -p 3000:3000 \
  -v $(pwd)/database:/app/database \
  -v $(pwd)/uploads:/app/uploads \
  navitem:latest
```

1. **现代化毛玻璃 UI 与浅色/深色/跟随系统三态主题**
   - **三态主题前后台同步**：支持浅色（Light）、深色（Dark）与跟随系统（System）三态主题切换，且前后台与弹窗视觉保持无缝同步。
   - **详情与紧凑双视图切换**：支持在**详情卡片视图**（展示图标、标题、简介/域名）与**紧凑网格视图**（高密度图标网格）之间一键切换。

2. **首页三列双行效率小组件矩阵**
   - **第一行小组件**：实时时钟问候、每日一言、智能天气提醒。
   - **第二行小组件**：随手待办便签、实时汇率转换牌、重要日程倒计时。
   - **等宽等高对齐**：全矩阵与下方卡片网格保持完全等宽等高精细对齐。

3. **必应每日壁纸与自定义视觉精调**
   - **必应每日壁纸**：系统内置每日壁纸行，每日零点自动拉取缓存与回退机制。
   - **自定义壁纸精调**：支持自定义背景图片、高斯模糊度及遮罩透明度精调。

4. **快捷编辑与全场景拖拽排序**
   - **原地弹窗登录**：首页点击编辑按钮即可直接原地弹窗登录。
   - **快捷修改与新增**：编辑模式下单击卡片直接弹窗修改、右上角红叉快速删除卡片、网格末尾加号快捷新增卡片。
   - **全场景拖拽排序**：支持前后台全场景直接拖拽卡片与分类进行排序。

5. **图标自动下载转存与强缓存优化**
   - **网站图标自动下载转存本地**：自动抓取网站图标并转存至本地服务器。
   - **后台真实图标预览与一键批量刷新**：后台支持真实图标预览与一键批量刷新图标功能，静态资源配置 30 天强缓存。

6. **多搜索引擎切换与站内跨分类实时检索**
   - **多搜索引擎切换**：内置百度、谷歌、必应等多种搜索引擎无缝切换。
   - **站内跨分类实时检索**：支持站内跨分类卡片实时搜索过滤。
   - **自定义搜索引擎配置**：支持自定义搜索引擎 URL 模板与快捷配置。

7. **环境变量凭证隔离与安全防护**
   - **环境变量凭证隔离**：敏感配置（管理员账号、密码、JWT 密钥等）完全通过环境变量隔离。
   - **凭证自动失效**：修改密码后旧 JWT Token 凭证自动作废失效。

---

## 📁 完整项目目录结构

```text
navitem/
├── .github/              # GitHub Actions 工作流配置
│   └── workflows/
├── assets/               # 项目静态资源文件
├── routes/               # Express 后端 API 路由
│   ├── auth.js           # 身份验证路由
│   ├── background.js     # 背景/壁纸管理路由
│   ├── cards.js          # 导航卡片管理路由
│   ├── icon.js           # 图标获取与转存路由
│   ├── menus.js          # 菜单分类管理路由
│   ├── search.js        # 搜索引擎管理路由
│   └── weather.js       # 天气与小组件 API 路由
├── uploads/              # 上传及本地缓存目录 (图标/壁纸等)
│   ├── bing/             # 必应每日壁纸缓存
│   └── icons/            # 转存的本地网站图标
├── utils/                # 工具函数模块
│   └── db.js             # 数据库辅助工具
├── web/                  # Vue 3 前端工程
│   ├── src/              # 前端源代码 (组件、视图、Pinia 状态)
│   ├── index.html        # 前端入口 HTML
│   ├── package.json      # 前端依赖配置
│   └── vite.config.js    # Vite 打包配置
├── database/             # SQLite 数据库持久化目录
│   └── nav.db            # SQLite 数据库文件
├── .dockerignore         # Docker 构建忽略配置
├── .env.example          # 环境变量配置示例文件
├── .gitignore            # Git 忽略配置
├── Dockerfile            # Docker 多阶段镜像构建文件
├── LICENSE               # 开源协议文件
├── README.md             # 项目说明文档
├── app.js                # Express 后端应用主入口
├── config.js             # 系统配置文件
├── db.js                 # SQLite 数据库初始化与表结构定义
├── docker-compose.yml    # Docker Compose 部署配置文件
├── package.json          # 后端依赖配置文件
└── schema.sql            # 数据库 Schema 参考文件
```

---

## 🗄️ 6 张 SQLite 数据库表结构说明

1. **`menus` (主菜单分类表)**
   - `id` (INTEGER, PRIMARY KEY, AUTOINCREMENT): 主键 ID
   - `name` (TEXT, NOT NULL): 分类名称
   - `order` (INTEGER, DEFAULT 0): 排序权重

2. **`sub_menus` (二级子菜单分类表)**
   - `id` (INTEGER, PRIMARY KEY, AUTOINCREMENT): 主键 ID
   - `parent_id` (INTEGER, NOT NULL): 外键关联 menus(id) 级联删除
   - `name` (TEXT, NOT NULL): 子分类名称
   - `order` (INTEGER, DEFAULT 0): 排序权重

3. **`cards` (导航卡片/网址表)**
   - `id` (INTEGER, PRIMARY KEY, AUTOINCREMENT): 主键 ID
   - `menu_id` (INTEGER): 外键关联 menus(id) 级联删除
   - `sub_menu_id` (INTEGER): 外键关联 sub_menus(id) 级联删除
   - `title` (TEXT, NOT NULL): 网站标题
   - `url` (TEXT, NOT NULL): 目标网址
   - `logo_url` (TEXT): 远程图标 URL
   - `custom_logo_path` (TEXT): 本地转存图标路径
   - `desc` (TEXT): 网站描述/简介
   - `order` (INTEGER, DEFAULT 0): 排序权重

4. **`users` (管理员用户表)**
   - `id` (INTEGER, PRIMARY KEY, AUTOINCREMENT): 主键 ID
   - `username` (TEXT, UNIQUE, NOT NULL): 管理员用户名
   - `password` (TEXT, NOT NULL): 加密密码散列

5. **`backgrounds` (壁纸与背景管理表)**
   - `id` (INTEGER, PRIMARY KEY, AUTOINCREMENT): 主键 ID
   - `name` (TEXT, NOT NULL): 背景名称
   - `type` (TEXT, NOT NULL, DEFAULT 'gradient'): 类型 (`gradient`/`image`/`bing`)
   - `value` (TEXT, NOT NULL): 背景值/图片路径/接口
   - `blur` (INTEGER, DEFAULT 0): 高斯模糊度
   - `overlay_opacity` (INTEGER, DEFAULT 30): 遮罩透明度
   - `is_active` (INTEGER, DEFAULT 0): 是否激活 (1: 激活, 0: 未激活)
   - `order` (INTEGER, DEFAULT 0): 排序权重
   - `created_at` (TEXT, DEFAULT datetime('now', 'localtime')): 创建时间

6. **`search_engines` (搜索引擎配置表)**
   - `id` (INTEGER, PRIMARY KEY, AUTOINCREMENT): 主键 ID
   - `name` (TEXT, NOT NULL): 引擎标识
   - `label` (TEXT, NOT NULL): 引擎显示名称
   - `url_template` (TEXT, NOT NULL): 查询 URL 模板 (含 `{q}` 占位符)
   - `placeholder` (TEXT, DEFAULT ''): 输入框提示占位符
   - `is_default` (INTEGER, DEFAULT 0): 是否默认 (1: 默认, 0: 否)
   - `order` (INTEGER, DEFAULT 0): 排序权重
   - `created_at` (TEXT, DEFAULT datetime('now', 'localtime')): 创建时间

---

## 🚀 部署指南

### 1. 环境变量与数据持久化目录

#### 环境变量说明 (`.env`)

| 环境变量 | 默认值 | 说明 |
| :--- | :--- | :--- |
| `PORT` | `3000` | 服务运行端口 |
| `ADMIN_USERNAME` | `admin` | 初始化管理员用户名 |
| `ADMIN_PASSWORD` | `123456` | 初始化管理员密码 |
| `JWT_SECRET` | 随机字符串 | JWT 身份验证签名密钥 |

#### 数据持久化目录说明

- `database/`：挂载 SQLite 数据库文件（`nav.db`），保存菜单分类、导航卡片、系统设置等数据。
- `uploads/`：挂载上传与本地缓存目录（包含转存图标 `icons/` 和必应每日壁纸缓存 `bing/`）。

---

### 2. 源代码本地部署步骤

1. **克隆项目代码**
   ```bash
   git clone git@github.com:Jinyinghui/navitem.git
   cd navitem
   ```

2. **配置环境变量**
   ```bash
   cp .env.example .env
   ```

3. **构建前端代码**
   ```bash
   cd web
   npm install
   npm run build
   cd ..
   ```

4. **安装后端依赖并启动服务**
   ```bash
   npm install
   npm start
   ```

5. **访问应用**
   在浏览器中打开 `localhost:3000` 即可使用。

---

### 3. Docker 环境部署指南

#### A. `docker run` 快速部署命令

```bash
docker run -d \
  --name nav-item \
  -p 3000:3000 \
  -e PORT=3000 \
  -e ADMIN_USERNAME=admin \
  -e ADMIN_PASSWORD=123456 \
  -e JWT_SECRET=your_jwt_secret \
  -v $(pwd)/database:/app/database \
  -v $(pwd)/uploads:/app/uploads \
  --restart always \
  ghcr.io/jinyinghui/navitem:latest
```

#### B. `docker-compose` 部署配置示例

创建 `docker-compose.yml` 文件：

```yaml
services:
  nav-item:
    image: ghcr.io/jinyinghui/navitem:latest
    container_name: nav-item
    ports:
      - "3000:3000"
    environment:
      - PORT=${PORT:-3000}
      - ADMIN_USERNAME=${ADMIN_USERNAME:-admin}
      - ADMIN_PASSWORD=${ADMIN_PASSWORD:-123456}
      - JWT_SECRET=${JWT_SECRET:-}
    volumes:
      - ./database:/app/database  # 持久化数据库文件
      - ./uploads:/app/uploads    # 持久化上传文件（图标 icons/、每日壁纸 bing/、后台上传的背景图）
    restart: always
```

启动命令：

```bash
docker-compose up -d
```

#### C. Docker 镜像构建说明

基于本地源码构建镜像：

```bash
# 构建镜像
docker build -t navitem:latest .

# 运行镜像
docker run -d \
  --name nav-item \
  -p 3000:3000 \
  -v $(pwd)/database:/app/database \
  -v $(pwd)/uploads:/app/uploads \
  navitem:latest
```代化个人导航工作台 v2.0

一个轻量、纯净、高颜值且支持高度自定义的现代化个人导航站项目，基于 **Vue 3 + Vite + Tailwind CSS + Express + SQLite3** 构建，开箱即用，支持一键部署。

---

## ✨ 核心功能特性

### 1. 🎨 现代化毛玻璃 UI 与三态主题联动
- **三态主题切换**：默认采用清新的**浅色主题 (`light`)**，支持点击顶部按钮在 **浅色 (`☀️`) / 深色 (`🌙`) / 跟随系统自动切换 (`🖥️`)** 三种模式间循环切换，实时监听系统 `prefers-color-scheme` 变化。
- **前后台主题 100% 同步**：后台管理系统、登录页、确认弹窗与天气浮窗的深浅色视觉完全跟随主页主题实时联动。
- **双视图模式切换**：支持在**详情卡片视图**（展示图标、标题、简介/域名）与**紧凑网格视图**（高密度图标网格）之间一键切换。

### 2. 🖱️ 全场景拖拽排序与右键快捷菜单
- **主页卡片直接拖拽排序**：在导航首页直接按住任意网站卡片拖动到目标卡片位置，松手即刻完成排列并自动持久化（内置拖拽与点击防冲突保护，支持拖拽微调与排序自动保存）。
- **主页右键快捷操作菜单**：
  - **右键点击任意导航卡片**：弹出快捷上下文菜单，支持一键**新窗口打开**、**快速编辑**（弹窗内直接重命名标题、修改链接 URL、修改简介、填写自定义图标 URL 或上传本地图标图片）、**快速删除**。
  - **右键点击主菜单或二级子菜单**：弹出快捷上下文菜单，支持一键**快速重命名分类**、**在此分类下快速新增卡片**、**快速删除分类**。
- **主页一键快捷编辑模式**：点击顶部导航栏的 **「编辑」** 按钮，所有主菜单、二级子菜单胶囊及网站卡片右上角立即浮现红色删除角标 `✕`，点击即可快速清理，再次点击 **「完成」** 退出。
- **后台全量拖拽排序**：后台栏目管理（主菜单、二级子菜单）、卡片管理、搜索引擎管理均支持按住左侧 `⠿` 手柄上下拖拽排序及 `↑ / ↓` 微调。

### 3. 🔍 自定义多搜索引擎与全站实时检索
- **多引擎一键切换**：内置 **站内搜索、Google、Bing、百度、GitHub、SearXNG** 等引擎，支持按 `/` 键快速聚焦搜索框。
- **站内跨分类实时检索**：在「站内搜索」模式下输入关键词，实时跨所有主分类与二级子分类检索匹配的卡片标题、简介与网址。
- **自定义搜索引擎配置**：点击搜索栏旁的 **「⚙ 自定义引擎」** 或进入后台「搜索引擎」页面，可自由新增、编辑、删除搜索引擎及查询 URL 模板（使用 `{q}` 作为搜索词占位符），并支持设置默认引擎与拖拽排序。

### 4. ⛅ 实时时钟问候与智能天气提醒组件
- **实时时钟与时段问候**：首页顶部展示实时时间、日期、星期以及随早/午/晚动态变化的贴心问候语。
- **多城市天气与生活提醒**：
  - 支持 **📍 自动定位**（基于浏览器 Geolocation API 获取当前位置实时天气）与 **手动城市切换**（内置香港、北京、上海、深圳、广州、杭州、成都、武汉、南京、台北、东京、新加坡等热门城市，并支持搜索全球任意城市）。
  - 根据实时温度与气象状况自动生成穿衣、带伞、防暑或高效办公提醒。

### 5. 🖼️ 背景主题与自定义壁纸模块
- **预设极光渐变与壁纸切换**：内置「深邃极光」「赛博星云」「深海微风」「暮色流霞」「极简岩灰」「星际山脉壁纸」等多套主题背景。
- **自定义壁纸与参数精调**：支持输入外部图片 URL、CSS 渐变表达式或直接**上传本地壁纸图片**，并提供**背景模糊度 (`0~20px`)** 与 **遮罩浓度 (`0~85%`)** 实时滑块调节。

### 6. 🔐 安全后台管理与单实例通知体验
- **每次进入后台强制重新验证**：每次从主页点击「后台管理」进入控制台时均需重新验证管理员账号密码，离开后台或刷新后不残留登录态，保障个人导航配置安全。
- **单实例清爽通知提示**：全局通知消息（Toast）采用单实例替换机制，连续操作时自动替换上一条提示，界面始终保持只有一条清爽提示，绝不堆叠遮挡。
- **全能后台控制台**：涵盖概览面板、栏目管理、卡片管理、背景设置、搜索引擎、账号安全与一键恢复默认数据。

---

## 📁 项目目录结构

```text
nav-item/
├── app.js                     # Express 应用入口与静态资源托管
├── config.js                  # 服务端端口与 JWT 密钥配置
├── db.js                      # SQLite 数据库初始化、表结构迁移与种子数据
├── schema.sql                 # 完整 SQLite 数据库建表与初始数据 SQL 脚本
├── package.json               # 后端依赖与启动脚本
├── routes/                    # 后端 RESTful API 路由
│   ├── auth.js                # 管理员登录认证路由
│   ├── menu.js                # 主菜单与二级子菜单 CRUD 及排序路由
│   ├── card.js                # 导航卡片 CRUD 及排序路由
│   ├── background.js          # 背景主题与壁纸管理路由
│   ├── searchEngine.js        # 搜索引擎自定义配置路由
│   └── user.js                # 管理员密码修改路由
└── web/                       # Vue 3 + Vite 前端工程
    ├── index.html             # 前端入口 HTML（含 Tailwind 与全局主题样式）
    ├── vite.config.mjs        # Vite 构建与开发代理配置
    └── src/
        ├── api.js             # 前后端 API 请求封装（含离线 LocalStorage 自动降级）
        ├── defaultData.js     # 默认分类、卡片、背景、搜索引擎与城市预设数据
        ├── router.js          # Vue Router 路由配置
        └── views/
            ├── Home.vue       # 前台个人导航工作台主页
            ├── Admin.vue      # 后台管理系统布局与登录守卫
            └── admin/         # 后台各功能模块子页面
                ├── MenuManage.vue         # 栏目与二级子菜单管理
                ├── CardManage.vue         # 网站导航卡片管理
                ├── BackgroundManage.vue   # 背景主题与壁纸设置
                ├── SearchEngineManage.vue # 首页搜索引擎与地址配置
                └── UserManage.vue         # 管理员密码安全修改
```

---

## 🗄️ 数据库表结构 (`schema.sql`)

项目使用轻量级 **SQLite3** 数据库（默认自动生成于 `database/nav.db`），核心包含以下 6 张数据表：

| 表名 | 说明 | 核心字段 |
| :--- | :--- | :--- |
| `menus` | 一级主菜单分类表 | `id`, `name`, `order` |
| `sub_menus` | 二级子菜单分类表 | `id`, `parent_id`, `name`, `order` |
| `cards` | 网站导航卡片表 | `id`, `menu_id`, `sub_menu_id`, `title`, `url`, `logo_url`, `desc`, `order` |
| `backgrounds` | 首页背景与壁纸配置表 | `id`, `name`, `type`, `value`, `blur`, `overlay_opacity`, `is_active` |
| `search_engines` | 首页搜索引擎配置表 | `id`, `name`, `label`, `url_template`, `placeholder`, `is_default`, `order` |
| `users` | 后台管理员用户表 | `id`, `username`, `password` (bcrypt 加密存储) |

---

## 🚀 本地开发与部署指南

### 1. 环境要求
- **Node.js** >= 18.0.0
- **npm** >= 8.0.0

### 2. 安装依赖与启动服务

```bash
# 1. 克隆仓库并进入项目目录
git clone https://github.com/eooce/nav-item.git
cd nav-item

# 2. 安装后端依赖
npm install

# 3. 安装前端依赖并构建生产环境静态资源（项目已预置构建好的 web/dist，若修改了前端代码可执行此步）
cd web
npm install
npm run build
cd ..

# 4. 启动服务
npm start
```

启动成功后：
- **导航站前台首页**：访问 `http://localhost:3000`
- **后台管理控制台**：点击首页右上角 **「后台管理」** 按钮（或访问 `http://localhost:3000/admin`）
- **默认管理员账号**：`admin`
- **默认管理员密码**：`123456`（首次登录后建议在「账号安全」模块修改密码）

### 3. 环境变量配置（可选）

可通过环境变量或修改 `config.js` 自定义运行参数：

| 环境变量 | 默认值 | 说明 |
| :--- | :--- | :--- |
| `PORT` | `3000` | Web 服务监听端口 |
| `ADMIN_USERNAME` | `admin` | 初始管理员用户名 |
| `ADMIN_PASSWORD` | `123456` | 初始管理员密码 |
| `JWT_SECRET` | 内置随机密钥 | JWT 令牌签名密钥 |

---

## ⌨️ 常用快捷操作速览

| 操作场景 | 交互方式 |
| :--- | :--- |
| **快速聚焦搜索框** | 在首页任意非输入区域按下键盘 `/` 键 |
| **主页卡片拖拽排序** | 在首页直接按住任意导航卡片拖动到目标卡片位置松开 |
| **卡片右键快捷编辑** | 在首页对任意导航卡片点击鼠标右键，选择「重命名 / 修改链接与图标」 |
| **菜单右键快捷管理** | 在首页对任意主菜单或子菜单点击鼠标右键，可快速重命名、新增卡片或删除 |
| **主页批量快速删除** | 点击顶部栏「编辑」按钮，点击各菜单或卡片右上角红叉 `✕` 即可删除 |
| **切换浅色/深色/自动主题** | 点击顶部栏「浅色 / 深色 / 自动」按钮，前后台界面实时同步切换 |

---

## 📄 开源协议

本项目基于 [MIT License](https://www.google.com/search?q=LICENSE) 开源，欢迎自由使用、修改与二次开发。
