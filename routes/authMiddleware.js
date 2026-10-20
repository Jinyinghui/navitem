const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your_jwt_secret_key';

const db = require('../db');

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未授权' });
  }
  const token = auth.slice(7);
  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return res.status(401).json({ error: '无效token' });
  }
  // 校验会话版本：修改密码后 session_version 递增，此前签发的 token 全部失效
  db.get('SELECT session_version FROM users WHERE id = ?', [payload.id], (err, user) => {
    if (err || !user || (payload.sv ?? 0) !== (user.session_version ?? 0)) {
      return res.status(401).json({ error: '无效token' });
    }
    req.user = payload;
    next();
  });
}

module.exports = authMiddleware;
