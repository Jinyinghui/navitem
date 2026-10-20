<template>
  <div v-if="!isLoggedIn" class="login-container">
    <div class="login-card">
      <div class="login-brand">
        <div class="login-logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <polygon points="3 11 22 2 13 21 11 13 3 11"/>
          </svg>
        </div>
        <h2 class="login-title">Nav-Item 控制台</h2>
        <p class="login-subtitle">登录以管理导航分类与书签卡片</p>
      </div>

      <form class="login-form" @submit.prevent="handleLogin">
        <div class="field-group">
          <label>管理员账号</label>
          <input v-model="username" type="text" placeholder="请输入用户名" class="login-input" autocomplete="username" />
        </div>

        <div class="field-group">
          <label>登录密码</label>
          <div class="password-input-wrapper">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="请输入密码"
              class="login-input password-input"
              autocomplete="current-password"
            />
            <button type="button" class="toggle-password" @click="showPassword = !showPassword" aria-label="切换密码显示">
              <svg v-if="showPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.77 21.77 0 0 1 5.06-6.06"/><path d="M1 1l22 22"/><path d="M9.53 9.53A3 3 0 0 0 12 15a3 3 0 0 0 2.47-5.47"/></svg>
            </button>
          </div>
        </div>

        <p v-if="loginError" class="login-error">{{ loginError }}</p>

        <div class="login-buttons">
          <button type="button" class="back-btn" @click="goHome">
            返回前台
          </button>
          <button type="submit" class="login-btn" :disabled="loading">
            {{ loading ? '验证中...' : '登录后台' }}
          </button>
        </div>
      </form>
    </div>
  </div>

  <div v-else class="admin-layout">
    <!-- 移动端遮罩 -->
    <div v-if="siderOpen" class="sider-backdrop" @click="closeSider"></div>

    <aside class="admin-sider" :class="{ open: siderOpen }">
      <div class="sider-brand" @click="page = 'welcome'; closeSider()">
        <div class="sider-logo">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <polygon points="3 11 22 2 13 21 11 13 3 11"/>
          </svg>
        </div>
        <span>Nav-Item 管理</span>
      </div>

      <ul class="menu-list">
        <li :class="{ active: page === 'welcome' }" @click="page = 'welcome'; closeSider()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>
          <span>概览面板</span>
        </li>
        <li :class="{ active: page === 'menu' }" @click="page = 'menu'; closeSider()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
          <span>栏目管理</span>
        </li>
        <li :class="{ active: page === 'card' }" @click="page = 'card'; closeSider()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>
          <span>卡片管理</span>
        </li>
        <li :class="{ active: page === 'search' }" @click="page = 'search'; closeSider()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <span>搜索引擎</span>
        </li>
        <li :class="{ active: page === 'background' }" @click="page = 'background'; closeSider()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          <span>背景设置</span>
        </li>
        <li :class="{ active: page === 'user' }" @click="page = 'user'; closeSider()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <span>账号安全</span>
        </li>
      </ul>

      <div class="sider-footer">
        <button type="button" class="sider-home-btn" @click="goHome">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          <span>访问前台导航</span>
        </button>
      </div>
    </aside>

    <div class="admin-main">
      <header class="admin-header">
        <div class="header-left">
          <button type="button" class="menu-toggle" @click="toggleSider" aria-label="展开菜单">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
          <h1 class="header-title">{{ pageTitle }}</h1>
        </div>
        <div class="header-actions">
          <button type="button" class="btn-outline-sm" @click="goHome">预览首页</button>
          <button type="button" class="btn-logout" @click="logout">退出登录</button>
        </div>
      </header>

      <main class="admin-content">
        <!-- 概览页 -->
        <div v-if="page === 'welcome'" class="welcome-page">
          <div class="welcome-banner">
            <div>
              <h2>欢迎回来，管理员</h2>
              <p>在这里集中管理您的导航主分类、二级子分类与书签卡片。</p>
            </div>
            <div class="banner-actions">
              <button type="button" class="primary-action-btn" @click="page = 'card'">+ 管理导航卡片</button>
              <button type="button" class="secondary-action-btn" @click="page = 'background'">切换背景壁纸</button>
            </div>
          </div>

          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-label">主分类数量</div>
              <div class="stat-value">{{ stats.menuCount }}</div>
              <div class="stat-meta">包含 {{ stats.subMenuCount }} 个二级子分类</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">导航卡片总数</div>
              <div class="stat-value">{{ stats.cardCount }}</div>
              <div class="stat-meta">支持站内实时检索</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">上次登录时间</div>
              <div class="stat-value stat-text">{{ lastLoginTime || '首次登录' }}</div>
              <div class="stat-meta">系统安全审计记录</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">上次登录 IP</div>
              <div class="stat-value stat-text">{{ lastLoginIp || '--' }}</div>
              <div class="stat-meta">最近一次认证来源</div>
            </div>
          </div>
        </div>

        <MenuManage v-if="page === 'menu'" />
        <CardManage v-if="page === 'card'" />
        <SearchEngineManage v-if="page === 'search'" />
        <BackgroundManage v-if="page === 'background'" />
        <UserManage v-if="page === 'user'" />
      </main>

      <footer class="admin-footer">
        <p>Copyright © {{ new Date().getFullYear() }} Nav-Item · 现代化导航管理系统</p>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { login, getMenus, getAllCards, getCurrentUser } from '../api';
import MenuManage from './admin/MenuManage.vue';
import CardManage from './admin/CardManage.vue';
import UserManage from './admin/UserManage.vue';
import BackgroundManage from './admin/BackgroundManage.vue';
import SearchEngineManage from './admin/SearchEngineManage.vue';

const router = useRouter();
const page = ref('welcome');
const lastLoginTime = ref('');
const lastLoginIp = ref('');
const isLoggedIn = ref(false);
const username = ref('');
const password = ref('');
const loading = ref(false);
const loginError = ref('');
const showPassword = ref(false);
const siderOpen = ref(false);

const stats = reactive({
  menuCount: 0,
  subMenuCount: 0,
  cardCount: 0
});

const pageTitle = computed(() => {
  switch (page.value) {
    case 'menu': return '栏目分类管理';
    case 'card': return '导航卡片管理';
    case 'search': return '首页搜索引擎配置';
    case 'background': return '背景主题与壁纸设置';
    case 'user': return '账号与密码安全';
    default: return '系统概览';
  }
});

onMounted(() => {
  const token = localStorage.getItem('token');
  isLoggedIn.value = !!token;
  if (isLoggedIn.value) {
    fetchDashboardData();
  }
});

watch(page, (newPage) => {
  if (newPage === 'welcome' && isLoggedIn.value) {
    fetchDashboardData();
  }
});

async function fetchDashboardData() {
  try {
    const [userRes, menuRes, cardRes] = await Promise.allSettled([
      getCurrentUser(),
      getMenus(),
      getAllCards()
    ]);
    if (userRes.status === 'fulfilled' && userRes.value?.data) {
      lastLoginTime.value = userRes.value.data.last_login_time || '';
      lastLoginIp.value = userRes.value.data.last_login_ip || '';
    }
    if (menuRes.status === 'fulfilled' && Array.isArray(menuRes.value?.data)) {
      stats.menuCount = menuRes.value.data.length;
      stats.subMenuCount = menuRes.value.data.reduce((acc, m) => acc + (m.subMenus?.length || 0), 0);
    }
    if (cardRes.status === 'fulfilled' && Array.isArray(cardRes.value?.data)) {
      stats.cardCount = cardRes.value.data.length;
    }
  } catch (err) {
    console.error('加载概览数据失败:', err);
  }
}

async function handleLogin() {
  if (!username.value || !password.value) {
    loginError.value = '请输入用户名和密码';
    return;
  }
  loading.value = true;
  loginError.value = '';
  try {
    const response = await login(username.value, password.value);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      isLoggedIn.value = true;
      lastLoginTime.value = response.data.lastLoginTime || '';
      lastLoginIp.value = response.data.lastLoginIp || '';
      fetchDashboardData();
    }
  } catch (error) {
    loginError.value = error.response?.data?.error || error.response?.data?.message || '登录失败，请检查用户名和密码';
  } finally {
    loading.value = false;
  }
}

function logout() {
  localStorage.removeItem('token');
  isLoggedIn.value = false;
  username.value = '';
  password.value = '';
  loginError.value = '';
}

function goHome() {
  router.push('/');
}

function toggleSider() {
  siderOpen.value = !siderOpen.value;
}

function closeSider() {
  siderOpen.value = false;
}
</script>

<style scoped>
/* 登录页 */
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: radial-gradient(circle at top left, #1e1b4b, #0f172a 60%);
}

.login-card {
  width: 100%;
  max-width: 420px;
  background: rgba(30, 41, 59, 0.75);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2.25rem 2rem;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
  color: #f8fafc;
}

.login-brand {
  text-align: center;
  margin-bottom: 1.75rem;
}

.login-logo {
  width: 48px;
  height: 48px;
  margin: 0 auto 0.85rem;
  border-radius: 14px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.35);
}

.login-title {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 700;
}

.login-subtitle {
  margin: 0.4rem 0 0;
  font-size: 0.86rem;
  color: #94a3b8;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.field-group label {
  font-size: 0.84rem;
  font-weight: 500;
  color: #cbd5e1;
}

.login-input {
  width: 100%;
  padding: 0.75rem 0.95rem;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(15, 23, 42, 0.65);
  color: #f8fafc;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.login-input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
}

.password-input-wrapper {
  position: relative;
}

.password-input {
  padding-right: 2.75rem;
}

.toggle-password {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
}

.login-error {
  margin: 0;
  padding: 0.6rem 0.85rem;
  border-radius: 8px;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #fca5a5;
  font-size: 0.85rem;
  text-align: center;
}

.login-buttons {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.25rem;
}

.back-btn {
  flex: 1;
  padding: 0.75rem;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.05);
  color: #e2e8f0;
  font-size: 0.92rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.login-btn {
  flex: 2;
  padding: 0.75rem;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  font-size: 0.92rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(99, 102, 241, 0.4);
}

/* 后台主布局 */
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: #f8fafc;
  color: #0f172a;
}

.admin-sider {
  width: 240px;
  background: #0f172a;
  color: #f8fafc;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 100;
  padding: 1.5rem 1rem;
}

.sider-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0 0.75rem 1.5rem;
  font-size: 1.15rem;
  font-weight: 700;
  cursor: pointer;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  margin-bottom: 1.25rem;
}

.sider-logo {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  flex: 1;
}

.menu-list li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0.95rem;
  border-radius: 10px;
  font-size: 0.92rem;
  font-weight: 500;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s;
}

.menu-list li:hover {
  color: #f8fafc;
  background: rgba(255, 255, 255, 0.06);
}

.menu-list li.active {
  color: #fff;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.sider-footer {
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.sider-home-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.65rem;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  color: #cbd5e1;
  font-size: 0.86rem;
  cursor: pointer;
  transition: all 0.2s;
}

.sider-home-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.admin-main {
  flex: 1;
  margin-left: 240px;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.admin-header {
  height: 64px;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 50;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.menu-toggle {
  display: none;
  background: none;
  border: none;
  color: #334155;
  cursor: pointer;
  padding: 0.25rem;
}

.header-title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: #0f172a;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.btn-outline-sm {
  padding: 0.45rem 0.9rem;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  background: #fff;
  color: #334155;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-outline-sm:hover {
  border-color: #6366f1;
  color: #4f46e5;
}

.btn-logout {
  padding: 0.45rem 0.9rem;
  border-radius: 8px;
  border: 1px solid #fecaca;
  background: #fef2f2;
  color: #dc2626;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-logout:hover {
  background: #dc2626;
  color: #fff;
}

.admin-content {
  flex: 1;
  padding: 2rem;
  max-width: 1280px;
  width: 100%;
  margin: 0 auto;
}

.welcome-banner {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: #fff;
  padding: 2rem;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  flex-wrap: wrap;
  margin-bottom: 1.75rem;
  box-shadow: 0 12px 28px rgba(79, 70, 229, 0.22);
}

.welcome-banner h2 {
  margin: 0 0 0.4rem 0;
  font-size: 1.45rem;
}

.welcome-banner p {
  margin: 0;
  opacity: 0.88;
  font-size: 0.92rem;
}

.banner-actions {
  display: flex;
  gap: 0.75rem;
}

.primary-action-btn {
  padding: 0.65rem 1.2rem;
  border-radius: 10px;
  border: none;
  background: #fff;
  color: #4f46e5;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: transform 0.2s;
}

.primary-action-btn:hover {
  transform: translateY(-1px);
}

.secondary-action-btn {
  padding: 0.65rem 1.2rem;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.35);
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.25rem;
}

.stat-card {
  background: #fff;
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.03);
}

.stat-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 0.35rem;
}

.stat-value.stat-text {
  font-size: 1.15rem;
  font-weight: 700;
  color: #4f46e5;
}

.stat-meta {
  font-size: 0.8rem;
  color: #94a3b8;
}

.admin-footer {
  text-align: center;
  padding: 1.5rem;
  color: #94a3b8;
  font-size: 0.82rem;
  border-top: 1px solid #e2e8f0;
}

.sider-backdrop {
  display: none;
}

@media (max-width: 768px) {
  .admin-sider {
    transform: translateX(-100%);
    transition: transform 0.25s ease;
  }
  .admin-sider.open {
    transform: translateX(0);
  }
  .sider-backdrop {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.5);
    z-index: 90;
  }
  .admin-main {
    margin-left: 0;
  }
  .menu-toggle {
    display: inline-flex;
  }
  .admin-header {
    padding: 0 1rem;
  }
  .admin-content {
    padding: 1.25rem 1rem;
  }
}
</style>
