const express = require('express');
const db = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();

const JWT_SECRET = 'your_jwt_secret_key';

function getClientIp(req) {
  let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || '';
  if (typeof ip === 'string' && ip.includes(',')) ip = ip.split(',')[0].trim();
  if (typeof ip === 'string' && ip.startsWith('::ffff:')) ip = ip.replace('::ffff:', '');
  return ip;
}

function getShanghaiTime() {
  const date = new Date();
  const offset = 8 * 60;
  const local = new Date(date.getTime() + (date.getTimezoneOffset() + offset) * 60000);
  return local.toISOString().replace('T', ' ').slice(0, 19);
}

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username=?', [username], (err, user) => {
    if (err || !user) return res.status(401).json({ error: '用户名或密码错误' });
    bcrypt.compare(password, user.password, (err, result) => {
      if (result) {
        // 记录上次登录时间和IP
        const lastLoginTime = user.last_login_time;
        const lastLoginIp = user.last_login_ip;
        // 更新为本次登录（上海时间）
        const now = getShanghaiTime();
        const ip = getClientIp(req);
        db.run('UPDATE users SET last_login_time=?, last_login_ip=? WHERE id=?', [now, ip, user.id]);
        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '2h' });
        res.json({ token, lastLoginTime, lastLoginIp });
      } else {
        res.status(401).json({ error: '用户名或密码错误' });
      }
    });
  });
});

module.exports = router; 
