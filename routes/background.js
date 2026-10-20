const express = require('express');
const db = require('../db');
const auth = require('./authMiddleware');
const router = express.Router();

// 数值范围校准（与前端滑杆/表单保持一致）
function clampBlur(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.min(20, Math.max(0, Math.round(n)));
}
function clampOverlay(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return 30;
  return Math.min(100, Math.max(0, Math.round(n)));
}

// 获取全部背景（可选：只获取激活的）
router.get('/', (req, res) => {
  const { active } = req.query;
  let sql = 'SELECT * FROM backgrounds';
  let params = [];

  if (active === 'true') {
    sql += ' WHERE is_active = 1';
  }

  sql += ' ORDER BY "order", id';

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 获取当前激活的背景（前台门户使用）
router.get('/active', (req, res) => {
  db.get('SELECT * FROM backgrounds WHERE is_active = 1 ORDER BY "order", id LIMIT 1', (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row || null);
  });
});

// 创建背景
router.post('/', auth, (req, res) => {
  const { name, type, value, blur, overlay_opacity, is_active, order } = req.body;

  if (!name || !type || !value) {
    return res.status(400).json({ error: '缺少必要字段：name, type, value' });
  }

  db.serialize(() => {
    // 未指定排序时追加到末尾；激活新背景前先清除其他激活状态，保证全局只有一个激活背景
    db.get('SELECT COALESCE(MAX("order"), 0) AS maxOrder FROM backgrounds', (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      const nextOrder = order ?? ((row ? row.maxOrder : 0) + 1);

      const insert = () => {
        const sql = `INSERT INTO backgrounds (name, type, value, blur, overlay_opacity, is_active, "order")
                     VALUES (?, ?, ?, ?, ?, ?, ?)`;
        const params = [
          name,
          type || 'gradient',
          value,
          clampBlur(blur ?? 0),
          clampOverlay(overlay_opacity ?? 30),
          is_active ? 1 : 0,
          nextOrder
        ];
        db.run(sql, params, function(runErr) {
          if (runErr) return res.status(500).json({ error: runErr.message });
          res.json({ id: this.lastID, message: '背景创建成功' });
        });
      };

      if (is_active) {
        db.run('UPDATE backgrounds SET is_active = 0', (clearErr) => {
          if (clearErr) return res.status(500).json({ error: clearErr.message });
          insert();
        });
      } else {
        insert();
      }
    });
  });
});

// 批量更新排序（必须注册在 /:id 之前，否则会被 /:id 吞掉）
router.put('/reorder', auth, (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items)) {
    return res.status(400).json({ error: '无效的排序数据' });
  }

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    const stmt = db.prepare('UPDATE backgrounds SET "order" = ? WHERE id = ?');
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

// 更新背景
router.put('/:id', auth, (req, res) => {
  const { id } = req.params;
  const { name, type, value, blur, overlay_opacity, is_active, order } = req.body;

  const fields = [];
  const params = [];

  if (name !== undefined) { fields.push('name = ?'); params.push(name); }
  if (type !== undefined) { fields.push('type = ?'); params.push(type); }
  if (value !== undefined) { fields.push('value = ?'); params.push(value); }
  if (blur !== undefined) { fields.push('blur = ?'); params.push(clampBlur(blur)); }
  if (overlay_opacity !== undefined) { fields.push('overlay_opacity = ?'); params.push(clampOverlay(overlay_opacity)); }
  if (is_active !== undefined) { fields.push('is_active = ?'); params.push(is_active ? 1 : 0); }
  if (order !== undefined) { fields.push('"order" = ?'); params.push(order); }

  if (fields.length === 0) {
    return res.status(400).json({ error: '没有要更新的字段' });
  }

  const doUpdate = () => {
    params.push(id);
    const sql = `UPDATE backgrounds SET ${fields.join(', ')} WHERE id = ?`;
    db.run(sql, params, function(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: '背景不存在' });
      res.json({ message: '背景更新成功' });
    });
  };

  // 将某条设为激活时，先清除其他激活状态，保证全局只有一个激活背景
  if (is_active) {
    db.run('UPDATE backgrounds SET is_active = 0 WHERE id != ?', [id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      doUpdate();
    });
  } else {
    doUpdate();
  }
});

// 删除背景
router.delete('/:id', auth, (req, res) => {
  const { id } = req.params;

  db.get('SELECT COUNT(*) AS count FROM backgrounds', (err, countRow) => {
    if (err) return res.status(500).json({ error: err.message });
    if (countRow && countRow.count <= 1) {
      return res.status(400).json({ error: '至少保留一个背景' });
    }

    db.get('SELECT is_active FROM backgrounds WHERE id = ?', [id], (getErr, target) => {
      if (getErr) return res.status(500).json({ error: getErr.message });
      if (!target) return res.status(404).json({ error: '背景不存在' });
      const wasActive = target.is_active === 1;

      db.run('DELETE FROM backgrounds WHERE id = ?', [id], function(delErr) {
        if (delErr) return res.status(500).json({ error: delErr.message });
        if (this.changes === 0) return res.status(404).json({ error: '背景不存在' });
        // 删除的是当前激活背景时，自动激活排序最靠前的剩余背景
        if (wasActive) {
          db.run('UPDATE backgrounds SET is_active = 1 WHERE id = (SELECT id FROM backgrounds ORDER BY "order", id LIMIT 1)', (actErr) => {
            if (actErr) return res.status(500).json({ error: actErr.message });
            res.json({ message: '背景删除成功' });
          });
        } else {
          res.json({ message: '背景删除成功' });
        }
      });
    });
  });
});

// 激活背景
router.put('/:id/activate', auth, (req, res) => {
  const { id } = req.params;

  // 先确认目标存在，避免 id 不存在时把所有背景的激活状态都清掉
  db.get('SELECT id FROM backgrounds WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: '背景不存在' });

    db.serialize(() => {
      db.run('UPDATE backgrounds SET is_active = 0');
      db.run('UPDATE backgrounds SET is_active = 1 WHERE id = ?', [id], function(runErr) {
        if (runErr) return res.status(500).json({ error: runErr.message });
        res.json({ message: '背景激活成功' });
      });
    });
  });
});

module.exports = router;
