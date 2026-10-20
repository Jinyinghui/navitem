const express = require('express');
const db = require('../db');
const auth = require('./authMiddleware');
const router = express.Router();

// 获取所有菜单（包含子菜单）
router.get('/', (req, res) => {
  const { page, pageSize } = req.query;
  if (!page && !pageSize) {
    db.all('SELECT * FROM menus ORDER BY "order", id', [], (err, menus) => {
      if (err) return res.status(500).json({ error: err.message });

      const getSubMenus = (menu) => {
        return new Promise((resolve, reject) => {
          db.all('SELECT * FROM sub_menus WHERE parent_id = ? ORDER BY "order", id', [menu.id], (err, subMenus) => {
            if (err) reject(err);
            else resolve(subMenus);
          });
        });
      };

      Promise.all(menus.map(async (menu) => {
        try {
          const subMenus = await getSubMenus(menu);
          return { ...menu, subMenus };
        } catch (err) {
          return { ...menu, subMenus: [] };
        }
      })).then(menusWithSubMenus => {
        res.json(menusWithSubMenus);
      }).catch(err => {
        res.status(500).json({ error: err.message });
      });
    });
  } else {
    const pageNum = parseInt(page) || 1;
    const size = parseInt(pageSize) || 10;
    const offset = (pageNum - 1) * size;
    db.get('SELECT COUNT(*) as total FROM menus', [], (err, countRow) => {
      if (err) return res.status(500).json({ error: err.message });
      db.all('SELECT * FROM menus ORDER BY "order", id LIMIT ? OFFSET ?', [size, offset], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
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

// 批量拖拽更新主菜单排序（需放在 /:id 之前）
router.put('/reorder', (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items)) {
    return res.status(400).json({ error: '无效的排序数据' });
  }
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    const stmt = db.prepare('UPDATE menus SET "order" = ? WHERE id = ?');
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

// 批量拖拽更新子菜单排序（需放在 /submenus/:id 之前）
router.put('/submenus/reorder', (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items)) {
    return res.status(400).json({ error: '无效的排序数据' });
  }
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    const stmt = db.prepare('UPDATE sub_menus SET "order" = ? WHERE id = ?');
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

// 获取指定菜单的子菜单
router.get('/:id/submenus', (req, res) => {
  db.all('SELECT * FROM sub_menus WHERE parent_id = ? ORDER BY "order", id', [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 新增、修改、删除主菜单
router.post('/', (req, res) => {
  const { name, order } = req.body;
  db.run('INSERT INTO menus (name, "order") VALUES (?, ?)', [name, order || 0], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

router.put('/:id', (req, res) => {
  const { name, order } = req.body;
  db.run('UPDATE menus SET name=?, "order"=? WHERE id=?', [name, order || 0, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ changed: this.changes });
  });
});

router.delete('/:id', (req, res) => {
  db.run('DELETE FROM menus WHERE id=?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

// 子菜单相关API
router.post('/:id/submenus', (req, res) => {
  const { name, order } = req.body;
  db.run(
    'INSERT INTO sub_menus (parent_id, name, "order") VALUES (?, ?, ?)',
    [req.params.id, name, order || 0],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

router.put('/submenus/:id', (req, res) => {
  const { name, order } = req.body;
  db.run('UPDATE sub_menus SET name=?, "order"=? WHERE id=?', [name, order || 0, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ changed: this.changes });
  });
});

router.delete('/submenus/:id', (req, res) => {
  db.run('DELETE FROM sub_menus WHERE id=?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

module.exports = router;
