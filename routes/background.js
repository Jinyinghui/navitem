const express = require('express');
const db = require('../db');
const auth = require('./authMiddleware');
const router = express.Router();

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

// 创建背景
router.post('/', auth, (req, res) => {
  const { name, type, value, blur, overlay_opacity, is_active, order } = req.body;
  
  if (!name || !type || !value) {
    return res.status(400).json({ error: '缺少必要字段：name, type, value' });
  }
  
  const sql = `INSERT INTO backgrounds (name, type, value, blur, overlay_opacity, is_active, "order") 
               VALUES (?, ?, ?, ?, ?, ?, ?)`;
  const params = [
    name, 
    type || 'gradient', 
    value, 
    blur ?? 0, 
    overlay_opacity ?? 30, 
    is_active ? 1 : 0, 
    order ?? 0
  ];
  
  db.run(sql, params, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, message: '背景创建成功' });
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
  if (blur !== undefined) { fields.push('blur = ?'); params.push(blur); }
  if (overlay_opacity !== undefined) { fields.push('overlay_opacity = ?'); params.push(overlay_opacity); }
  if (is_active !== undefined) { fields.push('is_active = ?'); params.push(is_active ? 1 : 0); }
  if (order !== undefined) { fields.push('"order" = ?'); params.push(order); }
  
  if (fields.length === 0) {
    return res.status(400).json({ error: '没有要更新的字段' });
  }
  
  params.push(id);
  const sql = `UPDATE backgrounds SET ${fields.join(', ')} WHERE id = ?`;
  
  db.run(sql, params, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: '背景不存在' });
    res.json({ message: '背景更新成功' });
  });
});

// 删除背景
router.delete('/:id', auth, (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM backgrounds WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: '背景不存在' });
    res.json({ message: '背景删除成功' });
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

module.exports = router;
