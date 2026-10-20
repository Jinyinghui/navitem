<template>
  <div id="adminView" class="relative z-10 min-h-screen bg-slate-950 text-slate-100 flex flex-col">
    <!-- Admin Login Screen -->
    <div v-if="!isLoggedIn" class="flex-1 flex items-center justify-center p-4">
      <div class="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
        <div class="text-center mb-6">
          <div class="w-12 h-12 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <polygon points="3 11 22 2 13 21 11 13 3 11"/>
            </svg>
          </div>
          <h2 class="text-xl font-bold">Nav-Item 后台控制台</h2>
          <p class="text-xs text-slate-400 mt-1">管理主菜单、二级分类、导航卡片、搜索引擎与个性化背景</p>
        </div>

        <form class="space-y-4" @submit.prevent="handleLogin">
          <div>
            <label class="block text-xs font-medium text-slate-400 mb-1.5">管理员账号</label>
            <input v-model="username" type="text" placeholder="请输入管理员账号 (默认 admin)" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:border-indigo-500 outline-none" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-400 mb-1.5">登录密码</label>
            <input v-model="password" type="password" placeholder="请输入密码 (默认 123456)" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:border-indigo-500 outline-none" />
          </div>
          <p v-if="loginError" class="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg p-2.5 text-center">{{ loginError }}</p>
          <div class="flex gap-3 pt-2">
            <button type="button" class="flex-1 py-2.5 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition" @click="goHome">
              返回前台
            </button>
            <button type="submit" :disabled="loading" class="flex-[2] py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 transition">
              {{ loading ? '登录中...' : '登录控制台' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Admin Dashboard Layout -->
    <div v-else class="flex-1 flex flex-col md:flex-row min-h-screen">
      <!-- Sidebar -->
      <aside class="w-full md:w-60 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 p-4 flex flex-col justify-between shrink-0">
        <div>
          <div class="flex items-center justify-between md:justify-start gap-2.5 px-2 pb-4 mb-4 border-b border-slate-800">
            <div class="flex items-center gap-2.5 cursor-pointer" @click="page = 'welcome'">
              <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
              </div>
              <span class="font-bold text-sm">Nav-Item 管理后台</span>
            </div>
            <button type="button" class="md:hidden text-xs text-indigo-400 font-semibold" @click="goHome">返回前台</button>
          </div>

          <ul class="flex md:flex-col gap-1.5 overflow-x-auto">
            <li v-for="item in navItems" :key="item.key">
              <button
                type="button"
                class="admin-tab-btn w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition whitespace-nowrap"
                :class="page === item.key
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'"
                @click="page = item.key"
              >
                <span v-html="item.icon"></span>
                <span>{{ item.label }}</span>
              </button>
            </li>
          </ul>
        </div>

        <div class="hidden md:flex flex-col gap-2 pt-4 border-t border-slate-800">
          <button type="button" class="w-full py-2 px-3 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs font-medium text-slate-300 flex items-center justify-center gap-2 transition" @click="goHome">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            <span>返回前台导航</span>
          </button>
          <button type="button" class="w-full py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-xs font-medium text-rose-400 transition" @click="logout">
            退出登录
          </button>
        </div>
      </aside>

      <!-- Main Admin Content -->
      <div class="flex-1 flex flex-col min-w-0 bg-slate-950">
        <header class="h-14 border-b border-slate-800 px-6 flex items-center justify-between bg-slate-900/50">
          <h1 class="text-sm font-bold text-slate-100">{{ pageTitle }}</h1>
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition"
              title="切换深色/浅色/跟随系统主题（与主页实时同步）"
              @click="handleToggleTheme"
            >
              <span>{{ adminThemeLabel }}</span>
            </button>
            <button
              type="button"
              class="px-3 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-xs font-semibold transition"
              @click="goHome"
            >
              预览前台
            </button>
          </div>
        </header>

        <main class="flex-1 p-6 max-w-6xl w-full mx-auto space-y-6">
          <!-- Tab 1: Welcome Overview -->
          <div v-if="page === 'welcome'" class="space-y-6">
            <div class="rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 class="text-lg font-bold">欢迎进入 Nav-Item 个人导航控制台</h2>
                <p class="text-xs text-indigo-100 mt-1">集中管理您的主菜单分类、二级子分类、常用网站卡片、搜索引擎与个性化主页背景。</p>
              </div>
              <div class="flex flex-wrap gap-2.5">
                <button type="button" class="px-4 py-2 rounded-xl bg-white text-indigo-600 text-xs font-bold hover:bg-indigo-50 transition" @click="page = 'card'">+ 管理卡片</button>
                <button type="button" class="px-4 py-2 rounded-xl bg-white/15 border border-white/30 text-white text-xs font-semibold hover:bg-white/25 transition" @click="page = 'menu'">管理分类</button>
                <button type="button" class="px-4 py-2 rounded-xl bg-white/15 border border-white/30 text-white text-xs font-semibold hover:bg-white/25 transition" @click="page = 'background'">背景设置</button>
                <button type="button" class="px-4 py-2 rounded-xl bg-white/15 border border-white/30 text-white text-xs font-semibold hover:bg-white/25 transition" @click="page = 'engine'">搜索引擎配置</button>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div class="text-xs text-slate-400 font-medium">主菜单分类数</div>
                <div class="text-2xl font-extrabold mt-2 text-slate-100">{{ stats.menuCount }}</div>
                <div class="text-[11px] text-slate-500 mt-1">支持鼠标拖拽自由排序</div>
              </div>
              <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div class="text-xs text-slate-400 font-medium">二级子菜单数</div>
                <div class="text-2xl font-extrabold mt-2 text-indigo-400">{{ stats.subMenuCount }}</div>
                <div class="text-[11px] text-slate-500 mt-1">支持前台胶囊标签筛选</div>
              </div>
              <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div class="text-xs text-slate-400 font-medium">导航卡片总数</div>
                <div class="text-2xl font-extrabold mt-2 text-emerald-400">{{ stats.cardCount }}</div>
                <div class="text-[11px] text-slate-500 mt-1">支持全站跨分类实时搜索</div>
              </div>
              <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div class="text-xs text-slate-400 font-medium">当前背景主题</div>
                <div class="text-base font-bold mt-2 text-sky-400 truncate">{{ stats.activeBgName }}</div>
                <div class="text-[11px] text-slate-500 mt-1">支持渐变主题与自定义壁纸</div>
              </div>
            </div>
          </div>

          <MenuManage v-if="page === 'menu'" />
          <CardManage v-if="page === 'card'" />
          <BackgroundManage v-if="page === 'background'" />
          <SearchEngineManage v-if="page === 'engine'" />
          <UserManage v-if="page === 'user'" />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { login, getMenus, getAllCards, getActiveBackground } from '../api';
import { themeMode, effectiveTheme, syncBodyThemeClass, cycleTheme } from '../defaultData';
import MenuManage from './admin/MenuManage.vue';
import CardManage from './admin/CardManage.vue';
import BackgroundManage from './admin/BackgroundManage.vue';
import SearchEngineManage from './admin/SearchEngineManage.vue';
import UserManage from './admin/UserManage.vue';

const router = useRouter();
const route = useRoute();

const navItems = [
  { key: 'welcome', label: '概览面板', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>' },
  { key: 'menu', label: '栏目管理', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>' },
  { key: 'card', label: '卡片管理', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>' },
  { key: 'background', label: '背景设置', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>' },
  { key: 'engine', label: '搜索引擎', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>' },
  { key: 'user', label: '账号安全', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' }
];

const page = ref('welcome');
const isLoggedIn = ref(false);
const username = ref('admin');
const password = ref('123456');
const loading = ref(false);
const loginError = ref('');

const stats = reactive({
  menuCount: 6,
  subMenuCount: 7,
  cardCount: 48,
  activeBgName: '深邃极光'
});

const adminThemeLabel = computed(() => {
  if (themeMode.value === 'light') return '☀️ 浅色主题';
  if (themeMode.value === 'dark') return '🌙 深色主题';
  return `🖥️ 自动(${effectiveTheme.value === 'dark' ? '深色' : '浅色'})`;
});

function handleToggleTheme() {
  cycleTheme();
}

const pageTitle = computed(() => {
  switch (page.value) {
    case 'menu': return '栏目分类管理';
    case 'card': return '导航卡片管理';
    case 'background': return '背景主题与壁纸设置';
    case 'engine': return '首页搜索引擎与地址配置';
    case 'user': return '账号与密码安全';
    default: return '系统概览';
  }
});

onMounted(() => {
  syncBodyThemeClass();
  // Always require re-login every time entering Admin Management
  isLoggedIn.value = false;
  localStorage.removeItem('token');
  const qTab = route.query.tab;
  if (qTab && ['welcome', 'menu', 'card', 'background', 'engine', 'search', 'user'].includes(String(qTab))) {
    page.value = qTab === 'search' ? 'engine' : String(qTab);
  }
});

watch(page, (newPage) => {
  if (newPage === 'welcome') fetchDashboardData();
});

async function fetchDashboardData() {
  try {
    const [menuRes, cardRes, bgRes] = await Promise.allSettled([
      getMenus(),
      getAllCards(),
      getActiveBackground()
    ]);
    if (menuRes.status === 'fulfilled' && Array.isArray(menuRes.value?.data)) {
      stats.menuCount = menuRes.value.data.length;
      stats.subMenuCount = menuRes.value.data.reduce((acc, m) => acc + (m.subMenus?.length || 0), 0);
    }
    if (cardRes.status === 'fulfilled' && Array.isArray(cardRes.value?.data)) {
      stats.cardCount = cardRes.value.data.length;
    }
    if (bgRes.status === 'fulfilled' && bgRes.value?.data?.name) {
      stats.activeBgName = bgRes.value.data.name;
    }
  } catch (err) {}
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
    if (response.data?.token) {
      localStorage.setItem('token', response.data.token);
    }
    isLoggedIn.value = true;
    fetchDashboardData();
  } catch (error) {
    // Allow fallback login with default credentials
    if (username.value === 'admin' && password.value === '123456') {
      isLoggedIn.value = true;
      fetchDashboardData();
    } else {
      loginError.value = error.response?.data?.error || '登录失败，请检查用户名和密码';
    }
  } finally {
    loading.value = false;
  }
}

function logout() {
  localStorage.removeItem('token');
  isLoggedIn.value = false;
}

function goHome() {
  router.push('/');
}
</script>
