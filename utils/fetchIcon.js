const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ICON_DIR = path.join(__dirname, '..', 'uploads', 'icons');
const MAX_HTML_BYTES = 512 * 1024;
const MAX_ICON_BYTES = 1024 * 1024;
const MIN_ICON_BYTES = 30;
const TIMEOUT_MS = 6000;
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

async function fetchBuffer(url, maxBytes) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const resp = await fetch(url, {
      signal: ctrl.signal,
      redirect: 'follow',
      headers: { 'User-Agent': UA, 'Accept': '*/*' }
    });
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    const len = Number(resp.headers.get('content-length') || 0);
    if (len > maxBytes) throw new Error('文件过大');
    const buffer = Buffer.from(await resp.arrayBuffer());
    if (buffer.length > maxBytes) throw new Error('文件过大');
    return { buffer, finalUrl: resp.url, contentType: resp.headers.get('content-type') || '' };
  } finally {
    clearTimeout(timer);
  }
}

// 从页面 HTML 中提取图标候选并按分辨率打分（apple-touch-icon 通常 180，sizes 取声明的最大边）
function iconCandidates(html, baseUrl) {
  const out = [];
  const linkRe = /<link\b[^>]*>/gi;
  let m;
  while ((m = linkRe.exec(html)) !== null) {
    const tag = m[0];
    const rel = ((tag.match(/rel\s*=\s*["']([^"']+)["']/i) || [])[1] || '').toLowerCase();
    if (!rel.includes('icon')) continue;
    const href = (tag.match(/href\s*=\s*["']([^"']+)["']/i) || [])[1];
    if (!href || href.startsWith('data:')) continue;
    const sizes = (tag.match(/sizes\s*=\s*["']([^"']+)["']/i) || [])[1] || '';
    let score = parseInt(((sizes.match(/(\d+)x\d+/) || [])[1] || '0'), 10) || 0;
    if (rel.includes('apple-touch-icon')) score = Math.max(score, 180);
    if (score === 0) score = 32;
    try {
      out.push({ url: new URL(href, baseUrl).toString(), score });
    } catch { /* 忽略非法 href */ }
  }
  return out.sort((a, b) => b.score - a.score);
}

// 优先按 Content-Type 判断，其次按文件头魔数嗅探
function detectExt(contentType, buffer) {
  const ct = (contentType || '').toLowerCase();
  if (ct.includes('png')) return 'png';
  if (ct.includes('jpeg') || ct.includes('jpg')) return 'jpg';
  if (ct.includes('svg')) return 'svg';
  if (ct.includes('webp')) return 'webp';
  if (ct.includes('gif')) return 'gif';
  if (ct.includes('icon') || ct.includes('ico')) return 'ico';
  if (buffer.length >= 4 && buffer[0] === 0x89 && buffer[1] === 0x50) return 'png';
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8) return 'jpg';
  if (buffer.length >= 4 && buffer.toString('ascii', 0, 4) === 'GIF8') return 'gif';
  if (buffer.length >= 4 && buffer[0] === 0x00 && buffer[1] === 0x00 && buffer[2] === 0x01 && buffer[3] === 0x00) return 'ico';
  if (buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') return 'webp';
  const head = buffer.toString('utf8', 0, 256).trimStart();
  if (head.startsWith('<svg') || (head.startsWith('<?xml') && head.includes('<svg'))) return 'svg';
  return null;
}

// favicon.im 的未知域名占位图特征：灰色圆 + 斜体单字母（<text font-style="italic">）
function isFaviconImPlaceholder(buffer) {
  const head = buffer.toString('utf8', 0, 512);
  return head.includes('#808080') && head.includes('<text') && head.includes('italic');
}

// 抓取站点图标并存到 uploads/icons/，返回可入库的 custom_logo_path
async function fetchAndStoreIcon(pageUrl) {
  let u;
  try {
    u = new URL(pageUrl);
  } catch {
    throw new Error('网址格式不正确');
  }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') throw new Error('仅支持 http/https 网址');

  let candidates = [];
  try {
    const page = await fetchBuffer(pageUrl, MAX_HTML_BYTES);
    if (page.contentType.includes('html')) {
      candidates = iconCandidates(page.buffer.toString('utf8'), page.finalUrl);
    }
  } catch { /* 页面本身抓不到时仍尝试 favicon.im 与 /favicon.ico 兜底 */ }
  // 次选来源：聚合服务 favicon.im（常备有更清晰的矢量图标）；它对未知域名会返回灰圈字母占位图，验收时须剔除
  candidates.push({ url: 'https://favicon.im/' + u.hostname, score: 0, viaIm: true });
  candidates.push({ url: u.origin + '/favicon.ico', score: 0 });

  const tried = [];
  for (const c of candidates) {
    try {
      const icon = await fetchBuffer(c.url, MAX_ICON_BYTES);
      const ext = detectExt(icon.contentType, icon.buffer);
      if (!ext) { tried.push(c.url + '（非图片）'); continue; }
      if (icon.buffer.length < MIN_ICON_BYTES) { tried.push(c.url + '（文件过小）'); continue; }
      if (c.viaIm && ext === 'svg' && isFaviconImPlaceholder(icon.buffer)) { tried.push(c.url + '（占位图）'); continue; }
      fs.mkdirSync(ICON_DIR, { recursive: true });
      const name = crypto.createHash('sha1').update(c.url).digest('hex') + '.' + ext;
      fs.writeFileSync(path.join(ICON_DIR, name), icon.buffer);
      return { custom_logo_path: 'icons/' + name, source: c.url };
    } catch (e) {
      tried.push(c.url + '（' + e.message + '）');
    }
  }
  throw new Error('未能抓取到图标：' + tried.slice(0, 3).join('；'));
}

// 把用户填写的在线图标链接下载落盘到 uploads/icons/，返回可入库的 custom_logo_path
async function downloadIconFromUrl(iconUrl) {
  let u;
  try {
    u = new URL(iconUrl);
  } catch {
    throw new Error('图标链接格式不正确');
  }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') throw new Error('仅支持 http/https 图标链接');

  const icon = await fetchBuffer(iconUrl, MAX_ICON_BYTES);
  const ext = detectExt(icon.contentType, icon.buffer);
  if (!ext) throw new Error('链接内容不是图片');
  if (icon.buffer.length < MIN_ICON_BYTES) throw new Error('图标文件过小');
  fs.mkdirSync(ICON_DIR, { recursive: true });
  const name = crypto.createHash('sha1').update(iconUrl).digest('hex') + '.' + ext;
  fs.writeFileSync(path.join(ICON_DIR, name), icon.buffer);
  return { custom_logo_path: 'icons/' + name, source: iconUrl };
}

module.exports = { fetchAndStoreIcon, downloadIconFromUrl };
