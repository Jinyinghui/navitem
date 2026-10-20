-- ============================================================================
-- Nav-Item 现代化个人导航系统 - SQLite 数据库建表与初始化脚本 (schema.sql)
-- ============================================================================

PRAGMA foreign_keys = ON;

-- 清理旧版遗留表（如存在）
DROP TABLE IF EXISTS ads;
DROP TABLE IF EXISTS friends;

-- 1. 主菜单分类表
CREATE TABLE IF NOT EXISTS menus (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  "order" INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_menus_order ON menus("order");

-- 2. 二级子菜单表
CREATE TABLE IF NOT EXISTS sub_menus (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  parent_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  "order" INTEGER DEFAULT 0,
  FOREIGN KEY(parent_id) REFERENCES menus(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_sub_menus_parent_id ON sub_menus(parent_id);
CREATE INDEX IF NOT EXISTS idx_sub_menus_order ON sub_menus("order");

-- 3. 导航书签卡片表
CREATE TABLE IF NOT EXISTS cards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  menu_id INTEGER,
  sub_menu_id INTEGER,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  logo_url TEXT,
  custom_logo_path TEXT,
  desc TEXT,
  "order" INTEGER DEFAULT 0,
  FOREIGN KEY(menu_id) REFERENCES menus(id) ON DELETE CASCADE,
  FOREIGN KEY(sub_menu_id) REFERENCES sub_menus(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_cards_menu_id ON cards(menu_id);
CREATE INDEX IF NOT EXISTS idx_cards_sub_menu_id ON cards(sub_menu_id);
CREATE INDEX IF NOT EXISTS idx_cards_order ON cards("order");

-- 4. 管理员用户表
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  last_login_time TEXT,
  last_login_ip TEXT
);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- 5. 背景主题与壁纸管理表
CREATE TABLE IF NOT EXISTS backgrounds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,                        -- 背景名称（如：深邃极光、赛博星云、自定义壁纸）
  type TEXT NOT NULL DEFAULT 'gradient',     -- 类型：'gradient'（CSS渐变/极光）或 'image'（图片壁纸）
  value TEXT NOT NULL,                       -- CSS 渐变值 或 图片 URL / 本地上传路径
  blur INTEGER DEFAULT 0,                    -- 背景模糊半径（0 ~ 20 px）
  overlay_opacity INTEGER DEFAULT 30,        -- 遮罩层不透明度（0 ~ 85 %）
  is_active INTEGER DEFAULT 0,               -- 是否当前启用（1=启用，0=未启用）
  "order" INTEGER DEFAULT 0,                 -- 排序权重
  created_at TEXT DEFAULT (datetime('now', 'localtime'))
);
CREATE INDEX IF NOT EXISTS idx_backgrounds_active ON backgrounds(is_active);
CREATE INDEX IF NOT EXISTS idx_backgrounds_order ON backgrounds("order");

-- 6. 自定义搜索引擎配置表（新增）
CREATE TABLE IF NOT EXISTS search_engines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,                        -- 引擎标识（如 site, google, bing, baidu, github, custom）
  label TEXT NOT NULL,                       -- 首页展示名称（如：站内搜索、Google、Bing、百度）
  url_template TEXT NOT NULL,                -- 搜索地址模板，使用 {q} 作为关键词占位符（站内搜索为 site://internal）
  placeholder TEXT DEFAULT '',               -- 搜索框占位提示语
  is_default INTEGER DEFAULT 0,              -- 是否默认选中（1=默认，0=非默认）
  "order" INTEGER DEFAULT 0,                 -- 排序权重（支持拖拽排序）
  created_at TEXT DEFAULT (datetime('now', 'localtime'))
);
CREATE INDEX IF NOT EXISTS idx_search_engines_order ON search_engines("order");

-- 初始化默认背景数据（仅在表为空时插入）
INSERT INTO backgrounds (name, type, value, blur, overlay_opacity, is_active, "order")
SELECT '深邃极光', 'gradient',
       'radial-gradient(circle at 15% 15%, rgba(99, 102, 241, 0.45), transparent 55%), radial-gradient(circle at 85% 25%, rgba(139, 92, 246, 0.4), transparent 55%), radial-gradient(circle at 40% 85%, rgba(14, 165, 233, 0.38), transparent 55%), linear-gradient(135deg, #0b1120 0%, #0f172a 100%)',
       0, 20, 1, 1
WHERE NOT EXISTS (SELECT 1 FROM backgrounds);

INSERT INTO backgrounds (name, type, value, blur, overlay_opacity, is_active, "order")
SELECT '赛博星云', 'gradient',
       'radial-gradient(circle at 20% 20%, rgba(236, 72, 153, 0.42), transparent 50%), radial-gradient(circle at 80% 30%, rgba(99, 102, 241, 0.45), transparent 55%), radial-gradient(circle at 50% 80%, rgba(6, 182, 212, 0.38), transparent 55%), linear-gradient(135deg, #090d16 0%, #1e1b4b 100%)',
       0, 25, 0, 2
WHERE (SELECT COUNT(*) FROM backgrounds) = 1;

INSERT INTO backgrounds (name, type, value, blur, overlay_opacity, is_active, "order")
SELECT '深海微风', 'gradient',
       'radial-gradient(circle at 20% 30%, rgba(16, 185, 129, 0.38), transparent 55%), radial-gradient(circle at 80% 20%, rgba(14, 165, 233, 0.42), transparent 55%), linear-gradient(135deg, #041f1e 0%, #0f172a 100%)',
       0, 20, 0, 3
WHERE (SELECT COUNT(*) FROM backgrounds) = 2;

INSERT INTO backgrounds (name, type, value, blur, overlay_opacity, is_active, "order")
SELECT '暮色流霞', 'gradient',
       'radial-gradient(circle at 25% 25%, rgba(249, 115, 22, 0.38), transparent 55%), radial-gradient(circle at 75% 30%, rgba(168, 85, 247, 0.42), transparent 55%), linear-gradient(135deg, #181124 0%, #0f172a 100%)',
       0, 25, 0, 4
WHERE (SELECT COUNT(*) FROM backgrounds) = 3;

INSERT INTO backgrounds (name, type, value, blur, overlay_opacity, is_active, "order")
SELECT '极简岩灰', 'gradient',
       'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
       0, 15, 0, 5
WHERE (SELECT COUNT(*) FROM backgrounds) = 4;

INSERT INTO backgrounds (name, type, value, blur, overlay_opacity, is_active, "order")
SELECT '静谧山川壁纸', 'image',
       '/background.webp',
       4, 40, 0, 6
WHERE (SELECT COUNT(*) FROM backgrounds) = 5;

-- 初始化默认搜索引擎配置（仅在表为空时插入）
INSERT INTO search_engines (name, label, url_template, placeholder, is_default, "order")
SELECT 'site', '站内搜索', 'site://internal', '输入关键词实时检索全站书签（支持标题、描述、网址）...', 1, 1
WHERE NOT EXISTS (SELECT 1 FROM search_engines);

INSERT INTO search_engines (name, label, url_template, placeholder, is_default, "order")
SELECT 'google', 'Google', 'https://www.google.com/search?q={q}', '使用 Google 搜索全球资讯...', 0, 2
WHERE (SELECT COUNT(*) FROM search_engines) = 1;

INSERT INTO search_engines (name, label, url_template, placeholder, is_default, "order")
SELECT 'bing', 'Bing', 'https://www.bing.com/search?q={q}', '使用 Microsoft Bing 搜索...', 0, 3
WHERE (SELECT COUNT(*) FROM search_engines) = 2;

INSERT INTO search_engines (name, label, url_template, placeholder, is_default, "order")
SELECT 'baidu', '百度', 'https://www.baidu.com/s?wd={q}', '使用百度搜索中文网页...', 0, 4
WHERE (SELECT COUNT(*) FROM search_engines) = 3;

INSERT INTO search_engines (name, label, url_template, placeholder, is_default, "order")
SELECT 'github', 'GitHub', 'https://github.com/search?q={q}&type=repositories', '在 GitHub 中搜索开源项目...', 0, 5
WHERE (SELECT COUNT(*) FROM search_engines) = 4;

INSERT INTO search_engines (name, label, url_template, placeholder, is_default, "order")
SELECT 'searxng', 'SearXNG', 'https://searxng.hueiyao.com/search?q={q}', '使用 SearXNG 隐私元搜索...', 0, 6
WHERE (SELECT COUNT(*) FROM search_engines) = 5;
