const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const menuRoutes = require('./routes/menu');
const cardRoutes = require('./routes/card');
const uploadRoutes = require('./routes/upload');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const backgroundRoutes = require('./routes/background');
const searchEngineRoutes = require('./routes/searchEngine');
const systemRoutes = require('./routes/system');
const compression = require('compression');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(compression());
// 图标文件名是内容/链接哈希（图变名变），可长缓存；其余 uploads（背景图等）保持默认协商缓存
app.use('/uploads/icons', express.static(path.join(__dirname, 'uploads', 'icons'), { maxAge: '30d', immutable: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'web/dist')));

app.use((req, res, next) => {
  if (
    req.method === 'GET' &&
    !req.path.startsWith('/api') &&
    !req.path.startsWith('/uploads') &&
    !fs.existsSync(path.join(__dirname, 'web/dist', req.path))
  ) {
    res.sendFile(path.join(__dirname, 'web/dist', 'index.html'));
  } else {
    next();
  }
});

app.use('/api/menus', menuRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/backgrounds', backgroundRoutes);
app.use('/api/search-engines', searchEngineRoutes);
app.use('/api/system', systemRoutes);

app.listen(PORT, () => {
  console.log(`server is running at http://localhost:${PORT}`);
});
