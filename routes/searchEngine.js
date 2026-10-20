const express = require('express');
const db = require('../db');
const auth = require('./authMiddleware');
const router = express.Router();

// 获取全部搜索引擎配置（按排序权重升序）
router.get('/', (req, res) => {
  db.all('SELECT * FROM search_engines ORDER BY "order", id', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 批量拖拽排序
router.put('/reorder', (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items)) {
    return res.status(400).json({ error: '无效的排序数据' });
  }
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    const stmt = db.prepare('UPDATE search_engines SET "order" = ? WHERE id = ?');
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

// 设为默认搜索引擎
router.put('/:id/default', (req, res) => {
  const targetId = req.params.id;
  db.serialize(() => {
    db.run('UPDATE search_engines SET is_default = 0');
    db.run('UPDATE search_engines SET is_default = 1 WHERE id = ?', [targetId], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ defaultId: targetId, changed: this.changes });
    });
  });
});

// 新增自定义搜索引擎
router.post('/', (req, res) => {
  const { name, label, url_template, placeholder, is_default, order } = req.body;
  if (!label || !url_template) {
    return res.status(400).json({ error: '搜索引擎名称和搜索地址不能为空' });
  }
  const engineKey = (name || label).toLowerCase().replace(/\s+/g, '_');
  const defVal = is_default ? 1 : 0;

  const insertRow = () => {
    db.run(
      'INSERT INTO search_engines (name, label, url_template, placeholder, is_default, "order") VALUES (?, ?, ?, ?, ?, ?)',
      [engineKey, label.trim(), url_template.trim(), (placeholder || `${label.trim()} 搜索...`).trim(), defVal, order || 0],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID });
      }
    );
  };

  if (defVal === 1) {
    db.run('UPDATE search_engines SET is_default = 0', [], () => insertRow());
  } else {
    insertRow();
  }
});

// 修改搜索引擎配置
router.put('/:id', (req, res) => {
  const { label, url_template, placeholder, order } = req.body;
  db.run(
    'UPDATE search_engines SET label = ?, url_template = ?, placeholder = ?, "order" = ? WHERE id = ?',
    [label, url_template, placeholder || '', Number(order) || 0, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ changed: this.changes });
    }
  );
});

// 删除搜索引擎
router.delete('/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT is_default FROM search_engines WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    db.run('DELETE FROM search_engines WHERE id = ?', [id], function(delErr) {
      if (delErr) return res.status(500).json({ error: delErr.message });
      if (row && row.is_default === 1) {
        db.run('UPDATE search_engines SET is_default = 1 WHERE id = (SELECT id FROM search_engines ORDER BY "order", id LIMIT 1)');
      }
      res.json({ deleted: this.changes });
    });
  });
});

module.exports = router;
