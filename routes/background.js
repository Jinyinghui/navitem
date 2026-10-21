const express = require('express');
const db = require('../db');
const auth = require('./authMiddleware');
const { ensureBingWallpaper } = require('../utils/bingWallpaper');
const router = express.Router();

const dbAll = (sql, params = []) => new Promise((resolve, reject) => db.all(sql, params, (e, rows) => (e ? reject(e) : resolve(rows))));
const dbGet = (sql, params = []) => new Promise((resolve, reject) => db.get(sql, params, (e, row) => (e ? reject(e) : resolve(row))));
const dbRun = (sql, params = []) => new Promise((resolve, reject) => db.run(sql, params, function (e) { e ? reject(e) : resolve(this); }));

// 系统背景「必应每日壁纸」：懒创建一条 type=bing 的记录参与列表/激活/排序，图片由后端按天下载到本地
async function ensureBingRow() {
  await dbRun(
    `INSERT INTO backgrounds (name, type, value, blur, overlay_opacity, is_active, "order")
     SELECT '必应每日壁纸', 'bing', '', 0, 30, 0, COALESCE((SELECT MAX("order") FROM backgrounds), 0) + 1
     WHERE NOT EXISTS (SELECT 1 FROM backgrounds WHERE type = 'bing')`
  );
}

// 把 bing 行解析成当天图片（对外呈现为普通 image 背景，附带 is_bing 标记与当日标题）
async function resolveRow(row) {
  if (!row || row.type !== 'bing') return row;
  const wp = await ensureBingWallpaper();
  return {
    ...row,
    type: 'image',
    value: wp ? wp.path : '',
    is_bing: 1,
    bing_title: wp ? wp.title : '',
    bing_copyright: wp ? wp.copyright : ''
  };
}

// 获取全部背景列表
router.get('/', async (req, res) => {
  try {
    await ensureBingRow();
    const rows = await dbAll('SELECT * FROM backgrounds ORDER BY "order", id');
    res.json(await Promise.all(rows.map(resolveRow)));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 获取当前启用背景
router.get('/active', async (req, res) => {
  try {
    await ensureBingRow();
    let row = await dbGet('SELECT * FROM backgrounds WHERE is_active = 1 LIMIT 1');
    if (!row) row = await dbGet('SELECT * FROM backgrounds ORDER BY "order", id LIMIT 1');
    const resolved = await resolveRow(row);
    // 每日壁纸暂时取不到图（断网且无缓存）时回退到第一张普通背景，避免首页无背景
    if (resolved && resolved.is_bing && !resolved.value) {
      const fallback = await dbGet("SELECT * FROM backgrounds WHERE type != 'bing' ORDER BY \"order\", id LIMIT 1");
      return res.json(fallback || resolved);
    }
    res.json(resolved || null);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 新增自定义背景
router.post('/', auth, (req, res) => {
  const { name, type, value, blur, overlay_opacity, is_active, order } = req.body;
  if (!name || !value) {
    return res.status(400).json({ error: '背景名称和背景值不能为空' });
  }
  const bgType = type === 'image' ? 'image' : 'gradient';
  const blurVal = Number.isFinite(Number(blur)) ? Number(blur) : 0;
  const opacityVal = Number.isFinite(Number(overlay_opacity)) ? Number(overlay_opacity) : 30;
  const activeVal = is_active ? 1 : 0;

  const insertBg = () => {
    db.run(
      'INSERT INTO backgrounds (name, type, value, blur, overlay_opacity, is_active, "order") VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, bgType, value, blurVal, opacityVal, activeVal, order || 0],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID });
      }
    );
  };

  if (activeVal === 1) {
    db.run('UPDATE backgrounds SET is_active = 0', [], () => insertBg());
  } else {
    insertBg();
  }
});

// 设为当前启用背景
router.put('/:id/activate', auth, (req, res) => {
  const targetId = req.params.id;
  db.serialize(() => {
    db.run('UPDATE backgrounds SET is_active = 0');
    db.run('UPDATE backgrounds SET is_active = 1 WHERE id = ?', [targetId], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ activated: targetId, changed: this.changes });
    });
  });
});

// 更新背景配置（名称、模糊度、遮罩浓度等）
router.put('/:id', auth, (req, res) => {
  const { name, type, value, blur, overlay_opacity, order } = req.body;
  db.get('SELECT type FROM backgrounds WHERE id = ?', [req.params.id], (selErr, existing) => {
    if (selErr) return res.status(500).json({ error: selErr.message });
    // 必应每日壁纸是系统背景：只允许改名称/模糊/遮罩/排序，类型与值锁定（图片由后端按天解析）
    const isBing = existing && existing.type === 'bing';
    db.run(
      'UPDATE backgrounds SET name = ?, type = ?, value = ?, blur = ?, overlay_opacity = ?, "order" = ? WHERE id = ?',
      [name, isBing ? 'bing' : (type || 'gradient'), isBing ? '' : value, Number(blur) || 0, Number(overlay_opacity ?? 30), Number(order) || 0, req.params.id],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ changed: this.changes });
      }
    );
  });
});

// 删除背景
router.delete('/:id', auth, (req, res) => {
  const id = req.params.id;
  db.get('SELECT is_active, type FROM backgrounds WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (row && row.type === 'bing') return res.status(400).json({ error: '必应每日壁纸是系统背景，不能删除（可切换到其他背景）' });
    db.run('DELETE FROM backgrounds WHERE id = ?', [id], function(delErr) {
      if (delErr) return res.status(500).json({ error: delErr.message });
      if (row && row.is_active === 1) {
        db.run('UPDATE backgrounds SET is_active = 1 WHERE id = (SELECT id FROM backgrounds ORDER BY "order", id LIMIT 1)');
      }
      res.json({ deleted: this.changes });
    });
  });
});

module.exports = router;
