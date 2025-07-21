const express = require('express');
const db = require('../db');
const auth = require('./authMiddleware');
const router = express.Router();

// 获取卡片（公开）
router.get('/', (req, res) => {
  const { menu_id, page, pageSize } = req.query;
  if (!page && !pageSize) {
    db.all('SELECT * FROM cards WHERE menu_id=? ORDER BY "order"', [menu_id], (err, rows) => {
      if (err) return res.status(500).json({error: err.message});
      rows.forEach(card => {
        if (!card.custom_logo_path) {
          card.display_logo = card.logo_url || (card.url.replace(/\/+$/, '') + '/favicon.ico');
        } else {
          card.display_logo = '/uploads/' + card.custom_logo_path;
        }
      });
      res.json(rows);
    });
  } else {
    const pageNum = parseInt(page) || 1;
    const size = parseInt(pageSize) || 10;
    const offset = (pageNum - 1) * size;
    db.get('SELECT COUNT(*) as total FROM cards WHERE menu_id=?', [menu_id], (err, countRow) => {
      if (err) return res.status(500).json({error: err.message});
      db.all('SELECT * FROM cards WHERE menu_id=? ORDER BY "order" LIMIT ? OFFSET ?', [menu_id, size, offset], (err, rows) => {
        if (err) return res.status(500).json({error: err.message});
        rows.forEach(card => {
          if (!card.custom_logo_path) {
            card.display_logo = card.logo_url || (card.url.replace(/\/+$/, '') + '/favicon.ico');
          } else {
            card.display_logo = '/uploads/' + card.custom_logo_path;
          }
        });
        res.json({
          total: countRow.total,
          page: pageNum,
          pageSize: size,
          data: rows
        });
      });
    });
  }
});

// 新增卡片
router.post('/', auth, (req, res) => {
  const { menu_id, title, url, logo_url, custom_logo_path, desc, order } = req.body;
  db.run('INSERT INTO cards (menu_id, title, url, logo_url, custom_logo_path, desc, "order") VALUES (?, ?, ?, ?, ?, ?, ?)',
    [menu_id, title, url, logo_url, custom_logo_path, desc, order || 0],
    function (err) {
      if (err) return res.status(500).json({ message: '添加失败' });
      res.json({ id: this.lastID });
    });
});

// 更新卡片
router.put('/:id', auth, (req, res) => {
  const { title, url, logo_url, custom_logo_path, desc, order } = req.body;
  db.run('UPDATE cards SET title=?, url=?, logo_url=?, custom_logo_path=?, desc=?, "order"=? WHERE id=?',
    [title, url, logo_url, custom_logo_path, desc, order || 0, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ message: '更新失败' });
      res.json({ message: '更新成功' });
    });
});

// 删除卡片
router.delete('/:id', auth, (req, res) => {
  db.run('DELETE FROM cards WHERE id=?', [req.params.id], function(err) {
    if (err) return res.status(500).json({error: err.message});
    res.json({ deleted: this.changes });
  });
});

module.exports = router; 