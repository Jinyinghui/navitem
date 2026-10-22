const express = require('express');
const authMiddleware = require('./authMiddleware');

const router = express.Router();

// 「系统更新」：前台点按钮，后台只做带管理员鉴权的转发，真正执行更新的是
// compose 里的 updater sidecar（它持有 docker.sock 并负责回滚）。
// updater 未部署/未配置密钥时，这里返回 enabled:false，页面据此显示启用说明。

const UPDATER_URL = (process.env.UPDATER_URL || 'http://updater:4180').replace(/\/$/, '');
const UPDATER_TOKEN = process.env.UPDATER_TOKEN || '';

async function callUpdater(pathname, method = 'GET') {
  const res = await fetch(UPDATER_URL + pathname, {
    method,
    headers: UPDATER_TOKEN ? { Authorization: `Bearer ${UPDATER_TOKEN}` } : {},
    signal: AbortSignal.timeout(15000)
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}

// 查询版本与更新任务状态
router.get('/update-status', authMiddleware, async (req, res) => {
  if (!UPDATER_TOKEN) {
    return res.json({ enabled: false, error: '尚未配置 UPDATER_TOKEN，更新功能未启用' });
  }
  try {
    const { status, body } = await callUpdater('/status');
    if (status === 503) {
      return res.json({ enabled: false, error: body.error || '更新服务未启用' });
    }
    if (status === 401) {
      return res.json({ enabled: false, error: '后台与 updater 的 UPDATER_TOKEN 不一致' });
    }
    return res.status(status).json(body);
  } catch (e) {
    return res.json({ enabled: false, error: '更新服务未连接（updater 容器未运行或网络不通）' });
  }
});

// 触发一次更新（拉取 → 重建 → 健康检查，失败由 updater 自动回滚）
router.post('/update-start', authMiddleware, async (req, res) => {
  if (!UPDATER_TOKEN) {
    return res.status(400).json({ error: '尚未配置 UPDATER_TOKEN，更新功能未启用' });
  }
  try {
    const { status, body } = await callUpdater('/update', 'POST');
    return res.status(status).json(body);
  } catch (e) {
    return res.status(502).json({ error: '更新服务未连接（updater 容器未运行或网络不通）' });
  }
});

module.exports = router;
