<template>
  <div class="portal-root" :class="`theme-${theme}`">
    <!-- Dynamic Custom Background Layer -->
    <div class="custom-bg-layer" :style="customBgStyle" aria-hidden="true"></div>
    <div class="custom-bg-overlay" :style="customOverlayStyle" aria-hidden="true"></div>

    <!-- Sticky Glass Header -->
    <header class="glass-header">
      <div class="header-inner">
        <div class="brand-area" @click="resetToHome">
          <div class="brand-logo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <polygon points="3 11 22 2 13 21 11 13 3 11"/>
            </svg>
          </div>
          <span class="brand-title">Nav-Item</span>
        </div>

        <!-- Horizontal Main Category Bar -->
        <nav class="main-menu-bar" aria-label="主分类导航">
          <button
            v-for="menu in menus"
            :key="menu.id"
            class="menu-tab-btn"
            :class="{ active: activeMenu && activeMenu.id === menu.id }"
            @click="selectMenu(menu)"
          >
            <span class="menu-tab-text">{{ menu.name }}</span>
          </button>
        </nav>

        <!-- Right Quick Controls -->
        <div class="header-actions">
          <button class="icon-action-btn" @click="toggleViewMode" :title="viewMode === 'detailed' ? '切换为紧凑图标视图' : '切换为详情卡片视图'">
            <svg v-if="viewMode === 'detailed'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
            </svg>
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="6" rx="2"/><rect x="3" y="14" width="18" height="6" rx="2"/>
            </svg>
          </button>

          <button class="theme-cycle-btn" @click="toggleTheme" :title="themeButtonTitle">
            <svg v-if="themeMode === 'light'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="5"/>
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
            </svg>
            <svg v-else-if="themeMode === 'dark'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
            <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
            <span class="theme-mode-label">{{ themeModeLabel }}</span>
          </button>

          <a href="/admin" target="_blank" class="admin-entry-btn" title="进入后台管理">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
            <span class="admin-label">管理</span>
          </a>
        </div>
      </div>
    </header>

    <!-- Hero Clock, Weather Reminder & Multi-Engine Search -->
    <section class="hero-section">
      <div class="hero-top-row">
        <div class="clock-widget">
          <div class="time-display">{{ currentTime }}</div>
          <div class="date-greeting">{{ currentDate }} · {{ greetingText }}</div>
        </div>

        <!-- Interactive Weather Reminder Card -->
        <div class="weather-widget-card" @click="showWeatherPicker = !showWeatherPicker" title="点击切换城市或重新定位">
          <div class="weather-main-info">
            <span class="weather-emoji">{{ weatherData.icon }}</span>
            <div class="weather-temp-col">
              <div class="weather-city-line">
                <span class="weather-city-name">{{ weatherCity.name }}</span>
                <span v-if="weatherCity.isAuto" class="weather-auto-tag">定位</span>
                <span class="weather-temp-val">{{ weatherData.temp }}°C</span>
                <span class="weather-desc-badge">{{ weatherData.desc }}</span>
              </div>
              <div class="weather-reminder-line">
                <span>💡 {{ weatherData.reminder }}</span>
              </div>
            </div>
          </div>
          <button type="button" class="weather-switch-btn" @click.stop="showWeatherPicker = !showWeatherPicker">
            切换位置 ▾
          </button>
        </div>
      </div>

      <!-- Location Selector Popover -->
      <div v-if="showWeatherPicker" class="weather-picker-panel">
        <div class="weather-picker-header">
          <span class="picker-title">📍 选择天气城市或自动定位</span>
          <div class="picker-actions">
            <button type="button" class="geo-locate-btn" @click="locateUserWeather" :disabled="locatingWeather">
              {{ locatingWeather ? '定位中...' : '📍 自动定位当前位置' }}
            </button>
            <button type="button" class="picker-close-btn" @click="showWeatherPicker = false">✕</button>
          </div>
        </div>
        <div class="city-presets-grid">
          <button
            v-for="city in presetCities"
            :key="city.name"
            type="button"
            class="city-pill-btn"
            :class="{ active: weatherCity.name === city.name }"
            @click="selectPresetCity(city)"
          >
            {{ city.name }}
          </button>
        </div>
        <form class="custom-city-form" @submit.prevent="searchCustomCity">
          <input v-model="customCityQuery" type="text" placeholder="输入自定义城市名称（如：杭州、成都、Tokyo）..." class="custom-city-input" />
          <button type="submit" class="custom-city-submit">查询并切换</button>
        </form>
      </div>

      <!-- Search Container -->
      <div class="search-widget">
        <div class="engine-selector">
          <button
            v-for="eng in searchEngines"
            :key="eng.id || eng.name"
            class="engine-pill"
            :class="{ active: selectedEngine && (selectedEngine.id === eng.id || selectedEngine.name === eng.name) }"
            @click="selectEngine(eng)"
          >
            {{ eng.label }}
          </button>
          <a href="/admin" target="_blank" class="engine-config-link" title="在后台自定义配置搜索引擎与地址">
            ⚙ 自定义引擎
          </a>
        </div>

        <div class="search-box-wrapper">
          <span class="search-prefix-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
            </svg>
          </span>
          <input
            ref="searchInputRef"
            v-model="searchQuery"
            type="text"
            class="search-input"
            :placeholder="selectedEngine ? selectedEngine.placeholder : '输入关键词搜索...'"
            @keyup.enter="handleSearch"
          />
          <button v-if="searchQuery" class="clear-btn" @click="searchQuery = ''" title="清空">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
          <kbd v-else class="shortcut-kbd" title="按 / 键快速聚焦搜索框">/</kbd>
          <button class="search-submit-btn" @click="handleSearch">
            搜索
          </button>
        </div>
      </div>

      <!-- Sub-category Capsule Pills -->
      <div v-if="activeMenu && activeMenu.subMenus && activeMenu.subMenus.length > 0 && !isGlobalFiltering" class="sub-menu-pills">
        <button
          class="sub-pill"
          :class="{ active: activeSubMenu === null }"
          @click="selectSubMenu(null)"
        >
          全部 {{ activeMenu.name }}
        </button>
        <button
          v-for="sub in activeMenu.subMenus"
          :key="sub.id"
          class="sub-pill"
          :class="{ active: activeSubMenu && activeSubMenu.id === sub.id }"
          @click="selectSubMenu(sub)"
        >
          {{ sub.name }}
        </button>
      </div>

      <!-- Global Search Status Banner -->
      <div v-if="isGlobalFiltering" class="search-status-banner">
        <span>全站检索 “<strong>{{ searchQuery }}</strong>” 共找到 {{ filteredCards.length }} 个结果</span>
        <button class="reset-search-link" @click="searchQuery = ''">返回栏目浏览</button>
      </div>
    </section>

    <!-- Main Cards Grid -->
    <main class="cards-main-container">
      <div v-if="filteredCards.length === 0" class="empty-state-box">
        <div class="empty-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
        </div>
        <h3>未找到匹配的导航卡片</h3>
        <p>您可以尝试更换搜索关键词，或在后台管理中添加新的常用网站。</p>
      </div>

      <div v-else class="cards-grid" :class="`mode-${viewMode}`">
        <a
          v-for="(card, idx) in filteredCards"
          :key="card.id"
          :href="card.url"
          target="_blank"
          rel="noopener noreferrer"
          class="nav-card-item"
          :style="{ animationDelay: `${Math.min(idx * 0.025, 0.4)}s` }"
        >
          <div class="card-icon-wrap">
            <img
              v-if="getLogo(card) && !logoErrors[card.id]"
              :src="getLogo(card)"
              :alt="card.title"
              class="card-favicon"
              loading="lazy"
              @error="onLogoError(card.id)"
            />
            <span v-else class="card-fallback-avatar">{{ getFirstChar(card.title) }}</span>
          </div>

          <div class="card-info">
            <div class="card-title-row">
              <span class="card-title">{{ card.title }}</span>
              <svg class="external-arrow" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M7 17L17 7M7 7h10v10"/>
              </svg>
            </div>
            <p v-if="viewMode === 'detailed'" class="card-desc">{{ card.desc || getHostname(card.url) }}</p>
          </div>
        </a>
      </div>
    </main>

    <!-- Minimalist Personal Footer -->
    <footer class="minimal-footer">
      <p>Copyright © {{ new Date().getFullYear() }} Nav-Item · 现代化个人导航工作台</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { getMenus, getCards, getActiveBackground, getSearchEngines } from '../api';

const DEFAULT_ENGINES = [
  { id: 1, name: 'site', label: '站内搜索', placeholder: '输入关键词实时过滤全站书签 (支持标题/描述/域名)...', url_template: 'site://internal', is_default: 1 },
  { id: 2, name: 'google', label: 'Google', placeholder: '使用 Google 搜索全球资讯...', url_template: 'https://www.google.com/search?q={q}', is_default: 0 },
  { id: 3, name: 'bing', label: 'Bing', placeholder: '使用 Microsoft Bing 搜索...', url_template: 'https://www.bing.com/search?q={q}', is_default: 0 },
  { id: 4, name: 'baidu', label: '百度', placeholder: '使用百度搜索中文网页...', url_template: 'https://www.baidu.com/s?wd={q}', is_default: 0 },
  { id: 5, name: 'github', label: 'GitHub', placeholder: '在 GitHub 中搜索开源项目...', url_template: 'https://github.com/search?q={q}&type=repositories', is_default: 0 },
  { id: 6, name: 'searxng', label: 'SearXNG', placeholder: '使用隐私元搜索引擎检索...', url_template: 'https://searxng.553423.xyz/search?q={q}', is_default: 0 }
];

const PRESET_CITIES = [
  { name: '香港', lat: 22.3193, lon: 114.1694, temp: 26, code: 1 },
  { name: '北京', lat: 39.9042, lon: 116.4074, temp: 18, code: 0 },
  { name: '上海', lat: 31.2304, lon: 121.4737, temp: 22, code: 2 },
  { name: '深圳', lat: 22.5431, lon: 114.0579, temp: 27, code: 1 },
  { name: '广州', lat: 23.1291, lon: 113.2644, temp: 28, code: 2 },
  { name: '杭州', lat: 30.2741, lon: 120.1551, temp: 21, code: 3 },
  { name: '成都', lat: 30.5728, lon: 104.0668, temp: 20, code: 61 },
  { name: '武汉', lat: 30.5928, lon: 114.3055, temp: 23, code: 0 },
  { name: '南京', lat: 32.0603, lon: 118.7969, temp: 21, code: 1 },
  { name: '台北', lat: 25.0330, lon: 121.5654, temp: 25, code: 2 },
  { name: '东京', lat: 35.6762, lon: 139.6503, temp: 19, code: 1 },
  { name: '新加坡', lat: 1.3521, lon: 103.8198, temp: 30, code: 80 }
];

const menus = ref([]);
const allCards = ref([]);
const activeMenu = ref(null);
const activeSubMenu = ref(null);
const activeBg = ref(null);

const searchEngines = ref([...DEFAULT_ENGINES]);
const selectedEngine = ref(DEFAULT_ENGINES[0]);
const searchQuery = ref('');
const searchInputRef = ref(null);
const logoErrors = ref({});

// Weather State
const presetCities = ref(PRESET_CITIES);
const showWeatherPicker = ref(false);
const locatingWeather = ref(false);
const customCityQuery = ref('');
const weatherCity = ref({ name: '香港', lat: 22.3193, lon: 114.1694, isAuto: false });
const weatherData = ref({
  temp: 26,
  desc: '晴间多云',
  icon: '⛅',
  reminder: '今日体感舒适，适合高效推进工作'
});

function parseWeatherCode(code, temp) {
  let desc = '晴朗';
  let icon = '☀️';
  if (code === 0) { desc = '晴朗'; icon = '☀️'; }
  else if (code === 1 || code === 2) { desc = '晴间多云'; icon = '⛅'; }
  else if (code === 3) { desc = '阴天'; icon = '☁️'; }
  else if (code >= 45 && code <= 48) { desc = '有雾'; icon = '🌫️'; }
  else if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) { desc = '有雨'; icon = '🌧️'; }
  else if (code >= 71 && code <= 77) { desc = '降雪'; icon = '❄️'; }
  else if (code >= 95) { desc = '雷阵雨'; icon = '⛈️'; }

  let reminder = '今日天气温和宜人，保持好心情';
  if (icon === '🌧️' || icon === '⛈️') {
    reminder = '今日有降水，出门请记得随身携带雨具 ☂️';
  } else if (icon === '❄️') {
    reminder = '气温较低且有降雪，注意防寒保暖与路面湿滑 🧣';
  } else if (temp >= 30) {
    reminder = '今日气温偏高，注意防晒降温与及时补充水分 🥤';
  } else if (temp <= 12) {
    reminder = '早晚温差较大天气微凉，外出建议添衣保暖 🧥';
  } else {
    reminder = '今日体感舒适，适合专注高效办公与学习 ✨';
  }
  return { temp: Math.round(temp), desc, icon, reminder };
}

async function fetchWeatherByCoords(lat, lon, cityName, isAuto = false) {
  weatherCity.value = { name: cityName, lat, lon, isAuto };
  try {
    localStorage.setItem('nav_weather_city', JSON.stringify(weatherCity.value));
  } catch (e) {}

  try {
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.current_weather) {
        weatherData.value = parseWeatherCode(data.current_weather.weathercode, data.current_weather.temperature);
        return;
      }
    }
  } catch (e) {}
  // Fallback if offline
  const found = PRESET_CITIES.find(c => c.name === cityName) || PRESET_CITIES[0];
  weatherData.value = parseWeatherCode(found.code, found.temp);
}

function selectPresetCity(city) {
  showWeatherPicker.value = false;
  fetchWeatherByCoords(city.lat, city.lon, city.name, false);
}

async function searchCustomCity() {
  const q = customCityQuery.value.trim();
  if (!q) return;
  const localMatch = PRESET_CITIES.find(c => c.name.includes(q) || q.includes(c.name));
  if (localMatch) {
    customCityQuery.value = '';
    selectPresetCity(localMatch);
    return;
  }
  try {
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=1&language=zh`);
    if (res.ok) {
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const item = data.results[0];
        customCityQuery.value = '';
        showWeatherPicker.value = false;
        await fetchWeatherByCoords(item.latitude, item.longitude, item.name, false);
        return;
      }
    }
  } catch (e) {}
  weatherCity.value = { name: q, lat: 31.23, lon: 121.47, isAuto: false };
  weatherData.value = parseWeatherCode(1, 23);
  customCityQuery.value = '';
  showWeatherPicker.value = false;
}

function locateUserWeather() {
  if (!navigator.geolocation) {
    fetchWeatherByCoords(22.3193, 114.1694, '香港', true);
    showWeatherPicker.value = false;
    return;
  }
  locatingWeather.value = true;
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      locatingWeather.value = false;
      showWeatherPicker.value = false;
      await fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude, '当前位置', true);
    },
    () => {
      locatingWeather.value = false;
      showWeatherPicker.value = false;
      fetchWeatherByCoords(22.3193, 114.1694, '香港', true);
    },
    { timeout: 5000 }
  );
}

// Theme Mode: 'light' (default) | 'dark' | 'system'
const savedThemeMode = localStorage.getItem('nav_theme_mode');
const themeMode = ref(['light', 'dark', 'system'].includes(savedThemeMode) ? savedThemeMode : 'light');
const systemPrefersDark = ref(
  typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-color-scheme: dark)').matches
    : false
);
const theme = computed(() => {
  if (themeMode.value === 'system') {
    return systemPrefersDark.value ? 'dark' : 'light';
  }
  return themeMode.value;
});
const themeModeLabel = computed(() => {
  if (themeMode.value === 'light') return '浅色';
  if (themeMode.value === 'dark') return '深色';
  return `自动(${theme.value === 'dark' ? '深' : '浅'})`;
});
const themeButtonTitle = computed(() => {
  if (themeMode.value === 'light') return '当前：浅色主题（点击切换为深色主题）';
  if (themeMode.value === 'dark') return '当前：深色主题（点击切换为跟随系统自动主题）';
  return `当前：跟随系统自动切换（当前生效：${theme.value === 'dark' ? '深色' : '浅色'}）`;
});

let colorSchemeQuery = null;
function handleSystemThemeChange(e) {
  systemPrefersDark.value = e.matches;
}

const viewMode = ref(localStorage.getItem('nav_view_mode') || 'detailed');
const currentTime = ref('');
const currentDate = ref('');
const greetingText = ref('');
let clockTimer = null;

function updateClock() {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  currentTime.value = `${hh}:${mm}`;

  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  currentDate.value = `${now.getMonth() + 1}月${now.getDate()}日 ${days[now.getDay()]}`;

  const hour = now.getHours();
  if (hour < 6) greetingText.value = '夜深了，注意休息';
  else if (hour < 12) greetingText.value = '早安，开启高效一天';
  else if (hour < 18) greetingText.value = '午后好，保持专注';
  else greetingText.value = '晚上好，享受静谧时光';
}

const customBgStyle = computed(() => {
  if (theme.value === 'light' && (!activeBg.value || activeBg.value.id === 1)) {
    return {
      background: 'radial-gradient(circle at 15% 15%, rgba(99, 102, 241, 0.14), transparent 55%), radial-gradient(circle at 85% 25%, rgba(168, 85, 247, 0.12), transparent 55%), radial-gradient(circle at 40% 85%, rgba(14, 165, 233, 0.12), transparent 55%), linear-gradient(135deg, #f8fafc 0%, #eef2ff 50%, #f1f5f9 100%)'
    };
  }
  if (!activeBg.value) return {};
  const bg = activeBg.value;
  const blurPx = Number(bg.blur) || 0;
  if (bg.type === 'image') {
    return {
      backgroundImage: `url("${bg.value}")`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      filter: blurPx > 0 ? `blur(${blurPx}px)` : 'none',
      transform: blurPx > 0 ? 'scale(1.04)' : 'none'
    };
  }
  return {
    background: bg.value,
    filter: blurPx > 0 ? `blur(${blurPx}px)` : 'none'
  };
});

const customOverlayStyle = computed(() => {
  if (theme.value === 'light' && (!activeBg.value || activeBg.value.id === 1)) {
    return { background: 'transparent' };
  }
  if (!activeBg.value) return { background: 'transparent' };
  const op = (activeBg.value.overlay_opacity ?? 20) / 100;
  return {
    background: theme.value === 'light'
      ? `rgba(255, 255, 255, ${Math.min(op, 0.45)})`
      : `rgba(11, 17, 32, ${op})`
  };
});

onMounted(async () => {
  updateClock();
  clockTimer = setInterval(updateClock, 10000);
  window.addEventListener('keydown', handleGlobalKeydown);

  if (window.matchMedia) {
    colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    systemPrefersDark.value = colorSchemeQuery.matches;
    if (colorSchemeQuery.addEventListener) {
      colorSchemeQuery.addEventListener('change', handleSystemThemeChange);
    }
  }

  // Load saved weather city or locate
  try {
    const savedCity = localStorage.getItem('nav_weather_city');
    if (savedCity) {
      const parsed = JSON.parse(savedCity);
      fetchWeatherByCoords(parsed.lat, parsed.lon, parsed.name, parsed.isAuto);
    } else {
      fetchWeatherByCoords(22.3193, 114.1694, '香港', false);
    }
  } catch (e) {
    fetchWeatherByCoords(22.3193, 114.1694, '香港', false);
  }

  try {
    const bgRes = await getActiveBackground();
    if (bgRes.data) activeBg.value = bgRes.data;
  } catch (e) {}

  try {
    const engRes = await getSearchEngines();
    if (Array.isArray(engRes.data) && engRes.data.length) {
      searchEngines.value = engRes.data;
      const def = searchEngines.value.find(e => e.is_default === 1) || searchEngines.value[0];
      selectedEngine.value = def;
    }
  } catch (e) {}

  const res = await getMenus();
  menus.value = res.data || [];
  if (menus.value.length > 0) {
    activeMenu.value = menus.value[0];
  }
  await loadAllCards();
});

onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer);
  window.removeEventListener('keydown', handleGlobalKeydown);
  if (colorSchemeQuery && colorSchemeQuery.removeEventListener) {
    colorSchemeQuery.removeEventListener('change', handleSystemThemeChange);
  }
});

function handleGlobalKeydown(e) {
  if (e.key === '/' && document.activeElement !== searchInputRef.value && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
    e.preventDefault();
    searchInputRef.value?.focus();
  }
}

async function loadAllCards() {
  const list = [];
  for (const m of menus.value) {
    try {
      const r = await getCards(m.id);
      if (Array.isArray(r.data)) list.push(...r.data);
      if (m.subMenus && m.subMenus.length) {
        for (const s of m.subMenus) {
          const sr = await getCards(m.id, s.id);
          if (Array.isArray(sr.data)) list.push(...sr.data);
        }
      }
    } catch (err) {}
  }
  const map = new Map();
  list.forEach(c => map.set(c.id, c));
  allCards.value = Array.from(map.values());
}

const isGlobalFiltering = computed(() => {
  return searchQuery.value.trim().length > 0 && selectedEngine.value && (selectedEngine.value.url_template === 'site://internal' || selectedEngine.value.name === 'site');
});

const filteredCards = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (q && selectedEngine.value && (selectedEngine.value.url_template === 'site://internal' || selectedEngine.value.name === 'site')) {
    return allCards.value.filter(c =>
      (c.title && c.title.toLowerCase().includes(q)) ||
      (c.desc && c.desc.toLowerCase().includes(q)) ||
      (c.url && c.url.toLowerCase().includes(q))
    );
  }

  if (!activeMenu.value) return [];
  return allCards.value.filter(c => {
    if (activeSubMenu.value) {
      return c.sub_menu_id === activeSubMenu.value.id;
    }
    return c.menu_id === activeMenu.value.id && !c.sub_menu_id;
  });
});

function selectMenu(menu) {
  activeMenu.value = menu;
  activeSubMenu.value = null;
}

function selectSubMenu(sub) {
  activeSubMenu.value = sub;
}

function resetToHome() {
  if (menus.value.length > 0) {
    activeMenu.value = menus.value[0];
    activeSubMenu.value = null;
  }
  searchQuery.value = '';
}

function selectEngine(eng) {
  selectedEngine.value = eng;
  searchInputRef.value?.focus();
}

function buildEngineSearchUrl(template, query) {
  const encoded = encodeURIComponent(query);
  if (template.includes('{q}')) return template.replace(/\{q\}/g, encoded);
  if (template.includes('%s')) return template.replace(/%s/g, encoded);
  return template + encoded;
}

function handleSearch() {
  const q = searchQuery.value.trim();
  if (!q || !selectedEngine.value) return;
  if (selectedEngine.value.url_template === 'site://internal' || selectedEngine.value.name === 'site') return;
  const targetUrl = buildEngineSearchUrl(selectedEngine.value.url_template, q);
  window.open(targetUrl, '_blank', 'noopener,noreferrer');
}

function toggleTheme() {
  const order = ['light', 'dark', 'system'];
  const nextIdx = (order.indexOf(themeMode.value) + 1) % order.length;
  themeMode.value = order[nextIdx];
  localStorage.setItem('nav_theme_mode', themeMode.value);
}

function toggleViewMode() {
  viewMode.value = viewMode.value === 'detailed' ? 'compact' : 'detailed';
  localStorage.setItem('nav_view_mode', viewMode.value);
}

function getLogo(card) {
  if (card.custom_logo_path) return `http://localhost:3000/uploads/${card.custom_logo_path}`;
  if (card.logo_url) return card.logo_url;
  try {
    const urlObj = new URL(card.url);
    return `${urlObj.origin}/favicon.ico`;
  } catch {
    return '';
  }
}

function onLogoError(id) {
  logoErrors.value[id] = true;
}

function getFirstChar(title) {
  return title ? title.trim().charAt(0).toUpperCase() : 'N';
}

function getHostname(urlStr) {
  try {
    return new URL(urlStr).hostname.replace(/^www\./, '');
  } catch {
    return urlStr;
  }
}
</script>

<style scoped>
.portal-root {
  --bg-primary: #0b1120;
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --glass-bg: rgba(30, 41, 59, 0.56);
  --glass-border: rgba(255, 255, 255, 0.09);
  --glass-hover-bg: rgba(30, 41, 59, 0.85);
  --glass-hover-border: rgba(99, 102, 241, 0.45);
  --accent: #6366f1;
  --accent-glow: rgba(99, 102, 241, 0.25);

  min-height: 100vh;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow-x: hidden;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.portal-root.theme-light {
  --bg-primary: #f1f5f9;
  --text-primary: #0f172a;
  --text-secondary: #64748b;
  --glass-bg: rgba(255, 255, 255, 0.84);
  --glass-border: rgba(15, 23, 42, 0.08);
  --glass-hover-bg: rgba(255, 255, 255, 0.98);
  --glass-hover-border: rgba(99, 102, 241, 0.45);
}

.custom-bg-layer, .custom-bg-overlay {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  transition: all 0.4s ease;
}

/* Header */
.glass-header {
  position: sticky;
  top: 0;
  z-index: 40;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  background: var(--glass-bg);
  border-bottom: 1px solid var(--glass-border);
  padding: 0.75rem 1.5rem;
}

.header-inner {
  max-width: 1340px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.brand-area {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  cursor: pointer;
  user-select: none;
}

.brand-logo {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.brand-title {
  font-size: 1.15rem;
  font-weight: 700;
}

.main-menu-bar {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  overflow-x: auto;
  padding: 0.25rem;
}

.menu-tab-btn {
  border: none;
  background: transparent;
  color: var(--text-secondary);
  padding: 0.5rem 1rem;
  border-radius: 999px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.menu-tab-btn.active {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #ffffff;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.icon-action-btn, .admin-entry-btn, .theme-cycle-btn {
  height: 36px;
  border-radius: 10px;
  border: 1px solid var(--glass-border);
  background: var(--glass-bg);
  color: var(--text-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
}

.icon-action-btn { width: 36px; }
.theme-cycle-btn { padding: 0 0.7rem; gap: 0.35rem; font-size: 0.8rem; font-weight: 600; }
.admin-entry-btn { padding: 0 0.8rem; gap: 0.35rem; font-size: 0.82rem; font-weight: 500; }

/* Hero Section */
.hero-section {
  position: relative;
  z-index: 1;
  max-width: 820px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem 1.25rem 1.25rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hero-top-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 1.25rem;
  margin-bottom: 1.35rem;
  width: 100%;
}

.clock-widget { text-align: center; }
.time-display { font-size: 3rem; font-weight: 800; line-height: 1; }
.date-greeting { margin-top: 0.35rem; font-size: 0.85rem; color: var(--text-secondary); }

.weather-widget-card {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.65rem 1rem;
  border-radius: 16px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(16px);
  cursor: pointer;
  transition: all 0.2s;
}
.weather-widget-card:hover {
  border-color: var(--accent);
}
.weather-main-info { display: flex; align-items: center; gap: 0.65rem; }
.weather-emoji { font-size: 1.75rem; }
.weather-city-line { display: flex; align-items: center; gap: 0.45rem; font-size: 0.85rem; font-weight: 700; }
.weather-auto-tag { font-size: 0.68rem; padding: 0.1rem 0.38rem; border-radius: 6px; background: rgba(99,102,241,0.18); color: #6366f1; }
.weather-temp-val { font-weight: 800; color: #6366f1; }
.weather-desc-badge { font-size: 0.75rem; color: var(--text-secondary); font-weight: 500; }
.weather-reminder-line { font-size: 0.74rem; color: var(--text-secondary); margin-top: 0.15rem; }
.weather-switch-btn {
  padding: 0.3rem 0.6rem;
  border-radius: 8px;
  border: 1px solid var(--glass-border);
  background: rgba(99, 102, 241, 0.1);
  color: var(--text-primary);
  font-size: 0.72rem;
  cursor: pointer;
}

.weather-picker-panel {
  width: 100%;
  max-width: 640px;
  margin-bottom: 1.2rem;
  padding: 1rem;
  border-radius: 16px;
  background: var(--glass-hover-bg);
  border: 1px solid var(--glass-hover-border);
  backdrop-filter: blur(20px);
}
.weather-picker-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
.picker-title { font-size: 0.82rem; font-weight: 700; }
.picker-actions { display: flex; gap: 0.5rem; align-items: center; }
.geo-locate-btn {
  padding: 0.3rem 0.65rem;
  border-radius: 8px;
  border: 1px solid rgba(99, 102, 241, 0.4);
  background: rgba(99, 102, 241, 0.15);
  color: #6366f1;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
}
.picker-close-btn { background: transparent; border: none; color: var(--text-secondary); cursor: pointer; font-size: 0.9rem; }
.city-presets-grid { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 0.75rem; }
.city-pill-btn {
  padding: 0.3rem 0.7rem;
  border-radius: 999px;
  border: 1px solid var(--glass-border);
  background: var(--glass-bg);
  color: var(--text-primary);
  font-size: 0.75rem;
  cursor: pointer;
}
.city-pill-btn.active { background: #6366f1; color: #fff; border-color: #6366f1; }
.custom-city-form { display: flex; gap: 0.5rem; }
.custom-city-input {
  flex: 1;
  padding: 0.45rem 0.75rem;
  border-radius: 10px;
  border: 1px solid var(--glass-border);
  background: var(--glass-bg);
  color: var(--text-primary);
  font-size: 0.8rem;
  outline: none;
}
.custom-city-submit {
  padding: 0.45rem 0.9rem;
  border-radius: 10px;
  border: none;
  background: #6366f1;
  color: #fff;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
}

.search-widget { width: 100%; }
.engine-selector {
  display: flex;
  gap: 0.4rem;
  margin-bottom: 0.65rem;
  justify-content: center;
  flex-wrap: wrap;
  align-items: center;
}
.engine-pill {
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-secondary);
  padding: 0.3rem 0.8rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
}
.engine-pill.active {
  background: rgba(99, 102, 241, 0.16);
  color: #818cf8;
  border-color: rgba(99, 102, 241, 0.35);
  font-weight: 600;
}
.engine-config-link {
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-decoration: none;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  border: 1px dashed var(--glass-border);
}
.engine-config-link:hover { color: #6366f1; border-color: #6366f1; }

.search-box-wrapper {
  display: flex;
  align-items: center;
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 0.35rem 0.45rem 0.35rem 1rem;
}
.search-input {
  flex: 1;
  border: none;
  background: transparent;
  color: var(--text-primary);
  font-size: 0.95rem;
  padding: 0.6rem 0.75rem;
  outline: none;
}
.search-submit-btn {
  border: none;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  font-weight: 600;
  font-size: 0.88rem;
  padding: 0.6rem 1.2rem;
  border-radius: 12px;
  cursor: pointer;
}

.sub-menu-pills {
  margin-top: 1.2rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
}
.sub-pill {
  border: 1px solid var(--glass-border);
  background: var(--glass-bg);
  color: var(--text-secondary);
  padding: 0.4rem 0.95rem;
  border-radius: 999px;
  font-size: 0.82rem;
  cursor: pointer;
}
.sub-pill.active { background: #6366f1; color: #fff; }

.cards-main-container {
  position: relative;
  z-index: 1;
  flex: 1;
  max-width: 1340px;
  width: 100%;
  margin: 0 auto;
  padding: 1rem 1.5rem 3rem;
}
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}
.cards-grid.mode-compact {
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
}
.nav-card-item {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  padding: 1rem;
  border-radius: 16px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  text-decoration: none;
  color: var(--text-primary);
  transition: all 0.22s ease;
}
.nav-card-item:hover {
  transform: translateY(-3px);
  background: var(--glass-hover-bg);
  border-color: var(--glass-hover-border);
}
.card-icon-wrap {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: rgba(99, 102, 241, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.card-favicon { width: 24px; height: 24px; object-fit: contain; }
.card-fallback-avatar { font-weight: 700; color: #6366f1; }
.card-info { flex: 1; min-width: 0; }
.card-title-row { display: flex; justify-content: space-between; align-items: center; }
.card-title { font-size: 0.92rem; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.card-desc { margin: 0.25rem 0 0; font-size: 0.76rem; color: var(--text-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.minimal-footer {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 1.5rem;
  font-size: 0.78rem;
  color: var(--text-secondary);
  border-top: 1px solid var(--glass-border);
}
</style>
