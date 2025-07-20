const express = require('express');
const db = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();

const JWT_SECRET = 'your_jwt_secret_key';

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username=?', [username], (err, user) => {
    if (err || !user) return res.status(401).json({ error: '用户名或密码错误' });
    bcrypt.compare(password, user.password, (err, result) => {
      if (result) {
        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '2h' });
        res.json({ token });
      } else {
        res.status(401).json({ error: '用户名或密码错误' });
      }
    });
  });
});

module.exports = router; 