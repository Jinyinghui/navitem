const express = require('express');
const db = require('../db');
const auth = require('./authMiddleware');
const { fetchAndStoreIcon } = require('../utils/fetchIcon');
const router = express.Router();

function formatCardLogo(card) {
  if (!card.custom_logo_path) {
    card.display_logo = card.logo_url || (card.url.replace(/\/+$/, '') + '/favicon.ico');
  } else {
    card.display_logo = '/uploads/' + card.custom_logo_path;
  }
  return card;
}

// 获取全部卡片
router.get('/', (req, res) => {
  db.all('SELECT * FROM cards ORDER BY "order", id', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows.map(formatCardLogo));
  });
});

// 批量拖拽更新卡片排序（需放在 /:id 之前）
router.put('/reorder', auth, (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items)) {
    return res.status(400).json({ error: '无效的排序数据' });
  }
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    const stmt = db.prepare('UPDATE cards SET "order" = ? WHERE id = ?');
    items.forEach((item, index) => {
      const orderVal = Number.isFinite(Number(item.order)) ? Number(item.order) : index + 1;
      stmt.run(orderVal, item.id);
    });
    stmt.finalize((err) => {
      if (err) {
        db.run('ROLLBACK');
        return res.status(500).json({ error: err.message });
      }
      db.run('COMMIT', (commitErr) => {
        if (commitErr) return res.status(500).json({ error: commitErr.message });
        res.json({ updated: items.length });
      });
    });
  });
});

// 获取指定菜单的卡片
router.get('/:menuId', (req, res) => {
  const { subMenuId } = req.query;
  let query, params;

  if (subMenuId) {
    query = 'SELECT * FROM cards WHERE sub_menu_id = ? ORDER BY "order", id';
    params = [subMenuId];
  } else {
    query = 'SELECT * FROM cards WHERE menu_id = ? AND sub_menu_id IS NULL ORDER BY "order", id';
    params = [req.params.menuId];
  }

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows.map(formatCardLogo));
  });
});

// 按网址抓取站点图标存到本地（需认证）
router.post('/fetch-icon', auth, async (req, res) => {
  try {
    const result = await fetchAndStoreIcon(req.body.url);
    res.json({ ...result, display_logo: '/uploads/' + result.custom_logo_path });
  } catch (e) {
    res.status(422).json({ error: e.message });
  }
});
// 批量刷新全部卡片的站点图标（需认证）：重新抓取每个网址的图标，失败的保留原图标
router.post('/refresh-icons', auth, async (req, res) => {
  db.all('SELECT id, url, custom_logo_path FROM cards', [], async (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const targets = rows.filter(r => r.url && /^https?:\/\//i.test(r.url));
    let updated = 0, unchanged = 0, failed = 0;
    const queue = [...targets];
    async function worker() {
      while (queue.length) {
        const card = queue.shift();
        try {
          const result = await fetchAndStoreIcon(card.url);
          if (result.custom_logo_path && result.custom_logo_path !== card.custom_logo_path) {
            await new Promise((resolve) => db.run('UPDATE cards SET custom_logo_path = ? WHERE id = ?', [result.custom_logo_path, card.id], () => resolve()));
            updated++;
          } else {
            unchanged++;
          }
        } catch (e) {
          failed++;
        }
      }
    }
    const CONCURRENCY = 4;
    await Promise.all(Array.from({ length: Math.max(1, Math.min(CONCURRENCY, targets.length)) }, worker));
    res.json({ total: targets.length, updated, unchanged, failed });
  });
});

// 新增、修改、删除卡片需认证
router.post('/', auth, async (req, res) => {
  const { menu_id, sub_menu_id, title, url, logo_url, custom_logo_path, desc, order } = req.body;
  let finalCustomLogoPath = custom_logo_path || '';
  if (!logo_url && !finalCustomLogoPath && url) {
    try { finalCustomLogoPath = (await fetchAndStoreIcon(url)).custom_logo_path; } catch { /* 抓取失败不阻塞保存，显示层有 favicon 兜底 */ }
  }
  db.run(
    'INSERT INTO cards (menu_id, sub_menu_id, title, url, logo_url, custom_logo_path, desc, "order") VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [menu_id || null, sub_menu_id || null, title, url, logo_url || '', finalCustomLogoPath, desc || '', order || 0],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

router.put('/:id', auth, async (req, res) => {
  const { menu_id, sub_menu_id, title, url, logo_url, custom_logo_path, desc, order } = req.body;
  let finalCustomLogoPath = custom_logo_path || '';
  if (!logo_url && !finalCustomLogoPath && url) {
    try { finalCustomLogoPath = (await fetchAndStoreIcon(url)).custom_logo_path; } catch { /* 抓取失败不阻塞保存，显示层有 favicon 兜底 */ }
  }
  db.run(
    'UPDATE cards SET menu_id=?, sub_menu_id=?, title=?, url=?, logo_url=?, custom_logo_path=?, desc=?, "order"=? WHERE id=?',
    [menu_id || null, sub_menu_id || null, title, url, logo_url || '', finalCustomLogoPath, desc || '', order || 0, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ changed: this.changes });
    }
  );
});

router.delete('/:id', auth, (req, res) => {
  db.run('DELETE FROM cards WHERE id=?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

module.exports = router;
