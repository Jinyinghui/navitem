const express = require('express');
const db = require('../db');
const auth = require('./authMiddleware');
const router = express.Router();

// 获取全部背景列表
router.get('/', (req, res) => {
  db.all('SELECT * FROM backgrounds ORDER BY "order", id', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 获取当前启用背景
router.get('/active', (req, res) => {
  db.get('SELECT * FROM backgrounds WHERE is_active = 1 LIMIT 1', [], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (row) return res.json(row);
    db.get('SELECT * FROM backgrounds ORDER BY "order", id LIMIT 1', [], (err2, fallback) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json(fallback || null);
    });
  });
});

// 新增自定义背景
router.post('/', (req, res) => {
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
router.put('/:id/activate', (req, res) => {
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
router.put('/:id', (req, res) => {
  const { name, type, value, blur, overlay_opacity, order } = req.body;
  db.run(
    'UPDATE backgrounds SET name = ?, type = ?, value = ?, blur = ?, overlay_opacity = ?, "order" = ? WHERE id = ?',
    [name, type || 'gradient', value, Number(blur) || 0, Number(overlay_opacity ?? 30), Number(order) || 0, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ changed: this.changes });
    }
  );
});

// 删除背景
router.delete('/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT is_active FROM backgrounds WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
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
