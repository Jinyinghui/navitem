const fs = require('fs');
const path = require('path');

const BING_DIR = path.join(__dirname, '..', 'uploads', 'bing');
const TIMEOUT_MS = 8000;
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
const KEEP_COUNT = 7; // 只保留最近 7 天的壁纸，控制磁盘占用

// 按上海时间取当天日期键 YYYYMMDD（必应中国区每日图在北京时间零点切换）
function todayKey() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date());
  return parts.replace(/-/g, '');
}

async function fetchWithTimeout(url, asJson) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const resp = await fetch(url, { signal: ctrl.signal, headers: { 'User-Agent': UA } });
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    return asJson ? await resp.json() : Buffer.from(await resp.arrayBuffer());
  } finally {
    clearTimeout(timer);
  }
}

function listWallpaperFiles() {
  try {
    return fs.readdirSync(BING_DIR)
      .filter(f => /^bing-\d{8}\.jpg$/.test(f))
      .sort()
      .reverse(); // 日期从新到旧
  } catch {
    return [];
  }
}

function cleanupOld() {
  const files = listWallpaperFiles();
  for (const f of files.slice(KEEP_COUNT)) {
    const key = f.slice(5, 13);
    try { fs.unlinkSync(path.join(BING_DIR, f)); } catch { /* 忽略 */ }
    try { fs.unlinkSync(path.join(BING_DIR, `bing-${key}.json`)); } catch { /* 忽略 */ }
  }
}

function readMeta(key) {
  try {
    return JSON.parse(fs.readFileSync(path.join(BING_DIR, `bing-${key}.json`), 'utf8'));
  } catch {
    return null;
  }
}

let inflight = null;

// 确保当天壁纸已下载到本地，返回 { path, key, title, copyright }；失败时回退到最近一张已缓存的
async function ensureBingWallpaper() {
  const key = todayKey();
  const todayFile = path.join(BING_DIR, `bing-${key}.jpg`);
  if (fs.existsSync(todayFile)) {
    const meta = readMeta(key);
    return { path: `/uploads/bing/bing-${key}.jpg`, key, title: meta?.title || '', copyright: meta?.copyright || '' };
  }
  if (!inflight) {
    inflight = (async () => {
      try {
        const data = await fetchWithTimeout('https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=zh-CN', true);
        const img = data && data.images && data.images[0];
        if (!img || !img.url) throw new Error('必应接口无图片数据');
        const buffer = await fetchWithTimeout('https://www.bing.com' + img.url, false);
        if (buffer.length < 20000) throw new Error('壁纸文件过小');
        fs.mkdirSync(BING_DIR, { recursive: true });
        fs.writeFileSync(todayFile, buffer);
        fs.writeFileSync(
          path.join(BING_DIR, `bing-${key}.json`),
          JSON.stringify({ title: img.title || '', copyright: img.copyright || '', date: key })
        );
        cleanupOld();
        return { path: `/uploads/bing/bing-${key}.jpg`, key, title: img.title || '', copyright: img.copyright || '' };
      } catch {
        return null;
      } finally {
        inflight = null;
      }
    })();
  }
  const result = await inflight;
  if (result) return result;
  const files = listWallpaperFiles();
  if (files.length) {
    const key = files[0].slice(5, 13);
    const meta = readMeta(key);
    return { path: `/uploads/bing/${files[0]}`, key, title: meta?.title || '', copyright: meta?.copyright || '' };
  }
  return null;
}

module.exports = { ensureBingWallpaper };
