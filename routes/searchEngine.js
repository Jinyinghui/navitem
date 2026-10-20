const express = require('express');
const db = require('../db');
const auth = require('./authMiddleware');
const router = express.Router();

// 获取全部搜索引擎
router.get('/', (req, res) => {
  const { default: onlyDefault } = req.query;
  let sql = 'SELECT * FROM search_engines';
  let params = [];

  if (onlyDefault === 'true') {
    sql += ' WHERE is_default = 1';
  }

  sql += ' ORDER BY "order", id';

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 获取当前默认搜索引擎（前台门户使用）
router.get('/default', (req, res) => {
  db.get('SELECT * FROM search_engines WHERE is_default = 1 ORDER BY "order", id LIMIT 1', (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row || null);
  });
});

// 创建搜索引擎
router.post('/', auth, (req, res) => {
  const { name, label, url_template, placeholder, is_default, order } = req.body;

  if (!name || !label || !url_template) {
    return res.status(400).json({ error: '缺少必要字段：name, label, url_template' });
  }

  db.get('SELECT COALESCE(MAX("order"), 0) AS maxOrder FROM search_engines', (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    // 未指定排序时追加到末尾；设为默认前先清除其他默认标记，保证全局只有一个默认引擎
    const nextOrder = order ?? ((row ? row.maxOrder : 0) + 1);

    const insert = () => {
      const sql = `INSERT INTO search_engines (name, label, url_template, placeholder, is_default, "order")
                   VALUES (?, ?, ?, ?, ?, ?)`;
      const params = [
        name,
        label,
        url_template,
        placeholder || '',
        is_default ? 1 : 0,
        nextOrder
      ];
      db.run(sql, params, function(runErr) {
        if (runErr) return res.status(500).json({ error: runErr.message });
        res.json({ id: this.lastID, message: '搜索引擎创建成功' });
      });
    };

    if (is_default) {
      db.run('UPDATE search_engines SET is_default = 0', (clearErr) => {
        if (clearErr) return res.status(500).json({ error: clearErr.message });
        insert();
      });
    } else {
      insert();
    }
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

// 更新搜索引擎
router.put('/:id', auth, (req, res) => {
  const { id } = req.params;
  const { name, label, url_template, placeholder, is_default, order } = req.body;

  const fields = [];
  const params = [];

  if (name !== undefined) { fields.push('name = ?'); params.push(name); }
  if (label !== undefined) { fields.push('label = ?'); params.push(label); }
  if (url_template !== undefined) { fields.push('url_template = ?'); params.push(url_template); }
  if (placeholder !== undefined) { fields.push('placeholder = ?'); params.push(placeholder); }
  if (is_default !== undefined) { fields.push('is_default = ?'); params.push(is_default ? 1 : 0); }
  if (order !== undefined) { fields.push('"order" = ?'); params.push(order); }

  if (fields.length === 0) {
    return res.status(400).json({ error: '没有要更新的字段' });
  }

  const doUpdate = () => {
    params.push(id);
    const sql = `UPDATE search_engines SET ${fields.join(', ')} WHERE id = ?`;
    db.run(sql, params, function(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: '搜索引擎不存在' });
      res.json({ message: '搜索引擎更新成功' });
    });
  };

  // 将某条设为默认时，先清除其他默认标记，保证全局只有一个默认引擎
  if (is_default) {
    db.run('UPDATE search_engines SET is_default = 0 WHERE id != ?', [id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      doUpdate();
    });
  } else {
    doUpdate();
  }
});

// 删除搜索引擎
router.delete('/:id', auth, (req, res) => {
  const { id } = req.params;

  db.get('SELECT COUNT(*) AS count FROM search_engines', (err, countRow) => {
    if (err) return res.status(500).json({ error: err.message });
    if (countRow && countRow.count <= 1) {
      return res.status(400).json({ error: '至少保留一个搜索引擎' });
    }

    db.get('SELECT is_default FROM search_engines WHERE id = ?', [id], (getErr, target) => {
      if (getErr) return res.status(500).json({ error: getErr.message });
      if (!target) return res.status(404).json({ error: '搜索引擎不存在' });
      const wasDefault = target.is_default === 1;

      db.run('DELETE FROM search_engines WHERE id = ?', [id], function(delErr) {
        if (delErr) return res.status(500).json({ error: delErr.message });
        if (this.changes === 0) return res.status(404).json({ error: '搜索引擎不存在' });
        // 删除的是默认引擎时，自动把排序最靠前的剩余引擎设为默认
        if (wasDefault) {
          db.run('UPDATE search_engines SET is_default = 1 WHERE id = (SELECT id FROM search_engines ORDER BY "order", id LIMIT 1)', (defErr) => {
            if (defErr) return res.status(500).json({ error: defErr.message });
            res.json({ message: '搜索引擎删除成功' });
          });
        } else {
          res.json({ message: '搜索引擎删除成功' });
        }
      });
    });
  });
});

// 设置默认搜索引擎
router.put('/:id/default', auth, (req, res) => {
  const { id } = req.params;

  // 先确认目标存在，避免 id 不存在时把所有引擎的默认标记都清掉
  db.get('SELECT id FROM search_engines WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: '搜索引擎不存在' });

    db.serialize(() => {
      db.run('UPDATE search_engines SET is_default = 0');
      db.run('UPDATE search_engines SET is_default = 1 WHERE id = ?', [id], function(runErr) {
        if (runErr) return res.status(500).json({ error: runErr.message });
        res.json({ message: '默认搜索引擎设置成功' });
      });
    });
  });
});

module.exports = router;
