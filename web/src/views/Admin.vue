<template>
  <div v-if="!isLoggedIn" class="login-container">
    <div class="login-card">
      <h2 class="login-title">后台管理登录</h2>
      <div class="login-form">
        <input v-model="username" type="text" placeholder="用户名" class="login-input" />
        <div class="password-input-wrapper">
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="密码"
            class="login-input password-input"
          />
          <span class="toggle-password" @click="showPassword = !showPassword">
            <svg v-if="showPassword" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2566d8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>
            <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2566d8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.77 21.77 0 0 1 5.06-6.06"/><path d="M1 1l22 22"/><path d="M9.53 9.53A3 3 0 0 0 12 15a3 3 0 0 0 2.47-5.47"/></svg>
          </span>
        </div>
        <button @click="handleLogin" class="login-btn" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
        <p v-if="loginError" class="login-error">{{ loginError }}</p>
      </div>
    </div>
  </div>
  
  <div v-else class="admin-layout">
    <aside class="admin-sider">
      <div class="logo">Admin</div>
      <ul class="menu-list">
        <li :class="{active: page==='menu'}" @click="page='menu'">栏目管理</li>
        <li :class="{active: page==='card'}" @click="page='card'">卡片管理</li>
        <li :class="{active: page==='ad'}" @click="page='ad'">广告管理</li>
        <li :class="{active: page==='friend'}" @click="page='friend'">友链管理</li>
        <li :class="{active: page==='user'}" @click="page='user'">用户管理</li>
      </ul>
    </aside>
    <main class="admin-main">
      <div class="admin-header">
        <div class="header-title">{{ pageTitle }}</div>
        <div class="header-actions">
          <span class="home-icon" @click="goHome" title="进入主页">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 10.5L12 4l9 6.5V20a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-4h-4v4a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V10.5z" stroke="#2566d8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </span>
          <button class="btn logout-btn" @click="logout">退出登录</button>
        </div>
      </div>
      <div class="admin-content">
        <MenuManage v-if="page==='menu'" />
        <CardManage v-if="page==='card'" />
        <AdManage v-if="page==='ad'" />
        <FriendLinkManage v-if="page==='friend'" />
        <UserManage v-if="page==='user'" />
      </div>
      <footer class="admin-footer">
        <p class="admin-copyright">Copyright © 2025 Nav-Item | <a href="https://github.com/eooce/Nav-Item" target="_blank" class="footer-link">Powered by eooce</a></p>
      </footer>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { login } from '../api';
import MenuManage from './admin/MenuManage.vue';
import CardManage from './admin/CardManage.vue';
import AdManage from './admin/AdManage.vue';
import FriendLinkManage from './admin/FriendLinkManage.vue';
import UserManage from './admin/UserManage.vue';

const page = ref('menu');
const isLoggedIn = ref(false);
const username = ref('');
const password = ref('');
const loading = ref(false);
const loginError = ref('');
const showPassword = ref(false);

const pageTitle = computed(() => {
  switch (page.value) {
    case 'menu': return '栏目管理';
    case 'card': return '卡片管理';
    case 'ad': return '广告管理';
    case 'friend': return '友链管理';
    case 'user': return '用户管理';
    default: return '';
  }
});

onMounted(() => {
  const token = localStorage.getItem('token');
  isLoggedIn.value = !!token;
});

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
    }
  } catch (error) {
    loginError.value = error.response?.data?.message || '登录失败，请检查用户名和密码';
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
  window.open('/', '_blank');
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f5f6fa;
  font-family: 'Segoe UI', Arial, sans-serif;
}

.login-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  padding: 40px;
  width: 400px;
  max-width: 90%;
}

.login-title {
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  color: #222;
  margin-bottom: 32px;
  letter-spacing: 2px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.login-input {
  padding: 12px 16px;
  border: 1px solid #d0d7e2;
  border-radius: 8px;
  font-size: 16px;
  background: #fff;
  color: #222;
  height: 48px;
  line-height: 48px;
  box-sizing: border-box;
}

.login-input:focus {
  outline: 2px solid #2566d8;
  border-color: #2566d8;
}

.login-btn {
  background: #2566d8;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.login-btn:hover:not(:disabled) {
  background: #174ea6;
}

.login-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.login-error {
  color: #e74c3c;
  text-align: center;
  margin: 0;
  font-size: 14px;
}

.admin-layout {
  display: flex;
  min-height: 100vh;
  background: #f5f6fa;
  font-family: 'Segoe UI', Arial, sans-serif;
}
.admin-sider {
  width: 180px;
  background: #fff;
  color: #222;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding-top: 32px;
  box-shadow: 2px 0 8px rgba(0,0,0,0.06);
}
.logo {
  font-size: 22px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 32px;
  letter-spacing: 2px;
  color: #2566d8;
}
.menu-list {
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
}
.menu-list li {
  padding: 16px 32px;
  cursor: pointer;
  font-size: 16px;
  border-left: 4px solid transparent;
  transition: background 0.2s, border-color 0.2s, color 0.2s;
  color: #222;
}
.menu-list li.active {
  background: #eaf1ff;
  border-left: 4px solid #2566d8;
  color: #2566d8;
  font-weight: bold;
}
.admin-main {
  flex: 1;
  background: #f5f6fa;
  padding: 0;
  min-width: 0;
  overflow-x: auto;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}
.admin-header {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 64px;
  padding: 0 48px 0 0;
  background: #f5f6fa;
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 1px solid #e3e6ef;
}
.header-title {
  flex: 1;
  text-align: center;
  margin-left: 100px;
  font-size: 1.5rem;
  font-weight: 500;
  letter-spacing: 2px;
  color: #222;
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.home-icon {
  display: flex;
  align-items: center;
  margin-right: 18px;
  cursor: pointer;
  border-radius: 50%;
  transition: background 0.2s;
  padding: 4px;
}
.home-icon:hover {
  background: #eaf1ff;
}
.btn.logout-btn {
  background: #f7caca;
  color: #e74c3c;
  border: 1px solid #f7caca;
  border-radius: 10px;
  padding: 6px 10px;
  font-size: 15px;
  font-weight: 500;
  margin: 0;
  transition: background 0.2s, color 0.2s;
}
.btn.logout-btn:hover {
  background: #e74c3c;
  color: #fff;
}
.admin-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 0 0 0;
}
.admin-footer {
  margin-top: auto;
  text-align: center;
  padding: 2rem 0 1rem 0;
  background: transparent;
}
.admin-copyright {
  color: #1d70cc;
  font-size: 14px;
  margin: 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
}
.footer-link {
  color: #1d70cc;
  text-decoration: none;
  transition: color 0.2s;
}
.footer-link:hover {
  color: #3218ed;
}
.password-input-wrapper {
  position: relative;
  width: 100%;
}
.password-input {
  width: 100%;
  padding-right: 48px;
  border-radius: 8px;
  box-sizing: border-box;
}
.toggle-password {
  position: absolute;
  top: 0;
  right: 0;
  height: 48px;
  width: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  color: #2566d8;
  margin: 0;
  padding: 0;
  z-index: 2;
  transition: color 0.2s;
}
.toggle-password:hover {
  color: #174ea6;
  background: none;
}
.toggle-password svg {
  display: block;
  width: 22px;
  height: 22px;
  pointer-events: none;
}
</style> 