// navitem-updater：给导航站后台「系统更新」按钮当执行手的 sidecar 服务。
// 只在 compose 内部网络里监听（不映射宿主机端口），靠共享密钥 UPDATER_TOKEN 鉴权。
// 它挂载 docker.sock，负责：查版本（本地镜像摘要 vs GHCR latest）→ 拉新镜像 →
// 用 docker compose 重建 navitem 容器 → 健康检查 → 失败自动回滚到旧镜像。
// 仅用 Node 标准库，无第三方依赖。
'use strict';

const http = require('http');
const fs = require('fs');
const { spawn } = require('child_process');

const PORT = parseInt(process.env.UPDATER_PORT || '4180', 10);
const TOKEN = process.env.UPDATER_TOKEN || '';
const TARGET_CONTAINER = process.env.TARGET_CONTAINER || 'nav-item';
const IMAGE = process.env.TARGET_IMAGE || 'ghcr.io/jinyinghui/navitem:latest';
const COMPOSE_MOUNT = process.env.COMPOSE_MOUNT || '/host-deploy';
const HEALTH_URL = process.env.HEALTH_URL || 'http://nav-item:3000/';
const HEALTH_TIMEOUT_MS = parseInt(process.env.HEALTH_TIMEOUT_MS || '90000', 10);
const IMAGE_REPO = IMAGE.split(':')[0];

const MAX_LOG_LINES = 300;

function ts() {
  return new Date().toISOString().slice(11, 19);
}

// ---------- 任务状态 ----------
let job = freshJob();
function freshJob() {
  return {
    state: 'idle', // idle | running | success | up_to_date | failed | rolled_back | rollback_failed
    step: '',
    error: '',
    logs: [],
    started_at: null,
    finished_at: null,
    old_image_id: '',
    new_image_id: ''
  };
}
function logLine(line) {
  const text = String(line).replace(/\s+$/, '');
  if (!text) return;
  job.logs.push(`[${ts()}] ${text}`);
  if (job.logs.length > MAX_LOG_LINES) job.logs.splice(0, job.logs.length - MAX_LOG_LINES);
}

// ---------- 工具 ----------
function run(cmd, args, onLine) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { env: process.env });
    let out = '';
    let buf = '';
    const feed = chunk => {
      const s = chunk.toString();
      out += s;
      if (onLine) {
        buf += s;
        // docker pull 的进度用 \r 刷新，一并按行切
        const parts = buf.split(/[\r\n]+/);
        buf = parts.pop() || '';
        parts.forEach(onLine);
      }
    };
    child.stdout.on('data', feed);
    child.stderr.on('data', feed);
    child.on('error', reject);
    child.on('close', code => {
      if (buf && onLine) onLine(buf);
      resolve({ code, out });
    });
  });
}

async function runOrThrow(cmd, args, onLine) {
  const r = await run(cmd, args, onLine);
  if (r.code !== 0) {
    throw new Error(`${cmd} ${args.join(' ')} 退出码 ${r.code}`);
  }
  return r.out;
}

async function discover() {
  const raw = await runOrThrow('docker', ['inspect', TARGET_CONTAINER]);
  const info = JSON.parse(raw)[0];
  const labels = (info.Config && info.Config.Labels) || {};
  return {
    container_id: info.Id,
    image_id: info.Image,
    project: labels['com.docker.compose.project'] || '',
    service: labels['com.docker.compose.service'] || 'nav-item'
  };
}

async function imageRepoDigests(imageRefOrId) {
  try {
    const raw = await runOrThrow('docker', ['image', 'inspect', imageRefOrId]);
    const info = JSON.parse(raw)[0];
    return { id: info.Id, digests: info.RepoDigests || [] };
  } catch (e) {
    return { id: '', digests: [] };
  }
}

function digestForRepo(digests) {
  const hit = (digests || []).find(d => d.startsWith(IMAGE_REPO + '@'));
  return hit ? hit.slice(IMAGE_REPO.length + 1) : '';
}

// GHCR 匿名拉取令牌 → 查 latest 的清单摘要（Docker-Content-Digest）
// 远程摘要缓存 60 秒：进页自动检查和更新轮询（2 秒一次）走缓存，避免频繁打 GHCR；
// 点「检查更新」时带 force=1 绕过缓存现查，否则 60 秒内连点都返回旧摘要、看起来像按钮没反应。
let remoteCache = { digest: '', at: 0 };
async function remoteDigest(force = false) {
  if (!force && remoteCache.digest && Date.now() - remoteCache.at < 60000) return remoteCache.digest;
  try {
    const repoPath = IMAGE_REPO.replace(/^ghcr\.io\//, '');
    const tokenRes = await fetch(`https://ghcr.io/token?service=ghcr.io&scope=repository:${repoPath}:pull`, {
      signal: AbortSignal.timeout(8000)
    });
    if (!tokenRes.ok) throw new Error(`GHCR token 请求失败 ${tokenRes.status}`);
    const { token } = await tokenRes.json();
    const res = await fetch(`https://ghcr.io/v2/${repoPath}/manifests/latest`, {
      method: 'HEAD',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: [
          'application/vnd.oci.image.index.v1+json',
          'application/vnd.docker.distribution.manifest.list.v2+json',
          'application/vnd.docker.distribution.manifest.v2+json',
          'application/vnd.oci.image.manifest.v1+json'
        ].join(', ')
      },
      signal: AbortSignal.timeout(8000)
    });
    if (!res.ok) throw new Error(`GHCR 清单请求失败 ${res.status}`);
    const digest = res.headers.get('docker-content-digest') || '';
    if (digest) remoteCache = { digest, at: Date.now() };
    return digest;
  } catch (e) {
    // 强制刷新时 GHCR 偶尔失败也别把页面置空，fallback 到上次查到的摘要
    if (force && remoteCache.digest) return remoteCache.digest;
    throw e;
  }
}

async function versionInfo(force = false) {
  let current = { image_id: '', digest: '' };
  try {
    const d = await discover();
    const img = await imageRepoDigests(d.image_id);
    current = { image_id: d.image_id, digest: digestForRepo(img.digests) };
  } catch (e) { /* 容器不在时留空 */ }
  let remote = '';
  try {
    remote = await remoteDigest(force);
  } catch (e) { /* 查不到远程不阻塞页面 */ }
  return {
    image: IMAGE,
    current_image_id: current.image_id,
    current_digest: current.digest,
    remote_digest: remote,
    update_available: !!(current.digest && remote && current.digest !== remote)
  };
}

async function waitHealth() {
  const deadline = Date.now() + HEALTH_TIMEOUT_MS;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(HEALTH_URL, { signal: AbortSignal.timeout(3000) });
      if (res.status === 200) return true;
    } catch (e) { /* 还没起来，继续等 */ }
    await new Promise(r => setTimeout(r, 2000));
  }
  return false;
}

function composeArgs(project) {
  return ['compose', '--project-name', project, '--project-directory', COMPOSE_MOUNT];
}

// ---------- 更新主流程 ----------
async function runUpdate() {
  job = freshJob();
  job.state = 'running';
  job.started_at = new Date().toISOString();
  let meta = null;
  let recreated = false;
  try {
    job.step = 'precheck';
    logLine('开始检查更新环境…');
    // compose 文件有四种标准名（.yml/.yaml），只认 .yml 会在 .yaml 部署上误报挂载问题
    const composeFile = ['docker-compose.yml', 'docker-compose.yaml', 'compose.yml', 'compose.yaml']
      .find(f => fs.existsSync(`${COMPOSE_MOUNT}/${f}`));
    if (!composeFile) {
      throw new Error(`在 ${COMPOSE_MOUNT} 没找到 compose 文件（docker-compose.yml/.yaml），请检查部署目录挂载`);
    }
    meta = await discover();
    if (!meta.project) throw new Error(`容器 ${TARGET_CONTAINER} 缺少 compose 项目标签，无法定位 compose 项目`);
    job.old_image_id = meta.image_id;
    logLine(`当前容器镜像：${meta.image_id.slice(0, 19)}…，compose 项目：${meta.project} / 服务：${meta.service}`);

    job.step = 'pull';
    logLine(`拉取最新镜像 ${IMAGE} …`);
    await runOrThrow('docker', [...composeArgs(meta.project), 'pull', meta.service], logLine);

    const latest = await imageRepoDigests(IMAGE);
    job.new_image_id = latest.id;
    if (!latest.id) throw new Error('拉取后找不到本地镜像');
    if (latest.id === meta.image_id) {
      job.state = 'up_to_date';
      logLine('镜像摘要未变化，已经是最新版本。');
      return;
    }
    logLine(`新镜像：${latest.id.slice(0, 19)}…`);

    job.step = 'recreate';
    logLine('用新镜像重建容器…');
    recreated = true;
    await runOrThrow('docker', [...composeArgs(meta.project), 'up', '-d', meta.service], logLine);

    job.step = 'health';
    logLine('等待新容器健康检查（请求站点首页）…');
    if (await waitHealth()) {
      job.state = 'success';
      logLine('健康检查通过，更新完成。');
      return;
    }
    throw new Error('新容器健康检查超时');
  } catch (err) {
    logLine(`更新失败：${err.message}`);
    if (recreated && meta) {
      // ---------- 自动回滚 ----------
      job.step = 'rollback';
      try {
        logLine(`回滚：把 latest 标签指回旧镜像 ${job.old_image_id.slice(0, 19)}… 并重建`);
        await runOrThrow('docker', ['tag', job.old_image_id, IMAGE], logLine);
        await runOrThrow('docker', [...composeArgs(meta.project), 'up', '-d', meta.service], logLine);
        if (await waitHealth()) {
          job.state = 'rolled_back';
          job.error = `新版本健康检查未通过，已自动回滚到旧版本（原因：${err.message}）`;
          logLine('回滚完成，站点已恢复到旧版本。');
        } else {
          job.state = 'rollback_failed';
          job.error = `更新失败且回滚后健康检查仍未通过，请尽快人工处理（原因：${err.message}）`;
          logLine('回滚后健康检查仍失败，需要人工介入。');
        }
      } catch (rbErr) {
        job.state = 'rollback_failed';
        job.error = `更新失败，回滚也出错：${rbErr.message}（原始原因：${err.message}）`;
      }
    } else {
      job.state = 'failed';
      job.error = err.message;
    }
  } finally {
    job.finished_at = new Date().toISOString();
    if (job.state === 'running') job.state = 'failed';
    job.step = '';
  }
}

// ---------- HTTP 服务 ----------
function sendJson(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(body);
}

function authed(req) {
  if (!TOKEN) return false;
  return (req.headers.authorization || '') === `Bearer ${TOKEN}`;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://updater');
  if (url.pathname === '/health') {
    return sendJson(res, 200, { ok: true });
  }
  if (!TOKEN) {
    return sendJson(res, 503, { error: 'UPDATER_TOKEN 未配置，更新功能未启用' });
  }
  if (!authed(req)) {
    return sendJson(res, 401, { error: 'unauthorized' });
  }
  try {
    if (url.pathname === '/status' && req.method === 'GET') {
      const version = await versionInfo(url.searchParams.get('force') === '1');
      return sendJson(res, 200, { enabled: true, version, job });
    }
    if (url.pathname === '/update' && req.method === 'POST') {
      if (job.state === 'running') {
        return sendJson(res, 409, { error: '已有更新任务在执行' });
      }
      // 异步跑，主流程里自己兜底异常；这里只负责点火
      runUpdate().catch(e => {
        job.state = 'failed';
        job.error = String(e && e.message || e);
        job.finished_at = new Date().toISOString();
      });
      return sendJson(res, 202, { started: true });
    }
    return sendJson(res, 404, { error: 'not found' });
  } catch (e) {
    return sendJson(res, 500, { error: String(e && e.message || e) });
  }
});

server.listen(PORT, () => {
  console.log(`navitem-updater listening on :${PORT}, target=${TARGET_CONTAINER}, image=${IMAGE}, compose_mount=${COMPOSE_MOUNT}, token=${TOKEN ? 'set' : 'MISSING'}`);
});
