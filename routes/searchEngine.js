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

// 创建搜索引擎
router.post('/', auth, (req, res) => {
  const { name, label, url_template, placeholder, is_default, order } = req.body;
  
  if (!name || !label || !url_template) {
    return res.status(400).json({ error: '缺少必要字段：name, label, url_template' });
  }
  
  const sql = `INSERT INTO search_engines (name, label, url_template, placeholder, is_default, "order") 
               VALUES (?, ?, ?, ?, ?, ?)`;
  const params = [
    name, 
    label, 
    url_template, 
    placeholder || '', 
    is_default ? 1 : 0, 
    order ?? 0
  ];
  
  db.run(sql, params, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, message: '搜索引擎创建成功' });
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
  
  params.push(id);
  const sql = `UPDATE search_engines SET ${fields.join(', ')} WHERE id = ?`;
  
  db.run(sql, params, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: '搜索引擎不存在' });
    res.json({ message: '搜索引擎更新成功' });
  });
});

// 删除搜索引擎
router.delete('/:id', auth, (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM search_engines WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: '搜索引擎不存在' });
    res.json({ message: '搜索引擎删除成功' });
  });
});

// 批量更新排序
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

module.exports = router;
