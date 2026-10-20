import { ref, computed } from 'vue';

export const DEFAULT_BACKGROUNDS = [
  {
    id: 1,
    name: '深邃极光',
    type: 'gradient',
    value: 'radial-gradient(circle at 15% 15%, rgba(99, 102, 241, 0.45), transparent 55%), radial-gradient(circle at 85% 25%, rgba(139, 92, 246, 0.4), transparent 55%), radial-gradient(circle at 40% 85%, rgba(14, 165, 233, 0.38), transparent 55%), linear-gradient(135deg, #0b1120 0%, #0f172a 100%)',
    blur: 0,
    overlay_opacity: 20,
    is_active: 1
  },
  {
    id: 2,
    name: '赛博星云',
    type: 'gradient',
    value: 'radial-gradient(circle at 20% 20%, rgba(236, 72, 153, 0.45), transparent 50%), radial-gradient(circle at 80% 30%, rgba(99, 102, 241, 0.45), transparent 55%), radial-gradient(circle at 50% 80%, rgba(6, 182, 212, 0.4), transparent 55%), linear-gradient(135deg, #090d16 0%, #1e1b4b 100%)',
    blur: 0,
    overlay_opacity: 25,
    is_active: 0
  },
  {
    id: 3,
    name: '深海微风',
    type: 'gradient',
    value: 'radial-gradient(circle at 20% 30%, rgba(16, 185, 129, 0.42), transparent 55%), radial-gradient(circle at 80% 20%, rgba(14, 165, 233, 0.45), transparent 55%), linear-gradient(135deg, #041f1e 0%, #0f172a 100%)',
    blur: 0,
    overlay_opacity: 20,
    is_active: 0
  },
  {
    id: 4,
    name: '暮色流霞',
    type: 'gradient',
    value: 'radial-gradient(circle at 25% 25%, rgba(249, 115, 22, 0.4), transparent 55%), radial-gradient(circle at 75% 30%, rgba(168, 85, 247, 0.45), transparent 55%), linear-gradient(135deg, #181124 0%, #0f172a 100%)',
    blur: 0,
    overlay_opacity: 25,
    is_active: 0
  },
  {
    id: 5,
    name: '极简岩灰',
    type: 'gradient',
    value: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
    blur: 0,
    overlay_opacity: 15,
    is_active: 0
  }
];

export const DEFAULT_SEARCH_ENGINES = [
  { id: 1, name: 'site', label: '站内搜索', url_template: 'site://internal', placeholder: '输入关键词实时检索全站书签（支持标题、描述、网址）...', is_default: 1, order: 1 },
  { id: 2, name: 'google', label: 'Google', url_template: 'https://www.google.com/search?q={q}', placeholder: '使用 Google 搜索全球资讯...', is_default: 0, order: 2 },
  { id: 3, name: 'bing', label: 'Bing', url_template: 'https://www.bing.com/search?q={q}', placeholder: '使用 Microsoft Bing 搜索...', is_default: 0, order: 3 },
  { id: 4, name: 'baidu', label: '百度', url_template: 'https://www.baidu.com/s?wd={q}', placeholder: '使用百度搜索中文网页...', is_default: 0, order: 4 },
  { id: 5, name: 'github', label: 'GitHub', url_template: 'https://github.com/search?q={q}&type=repositories', placeholder: '在 GitHub 中搜索开源项目...', is_default: 0, order: 5 },
  { id: 6, name: 'searxng', label: 'SearXNG', url_template: 'https://searxng.553423.xyz/search?q={q}', placeholder: '使用 SearXNG 隐私元搜索...', is_default: 0, order: 6 }
];

export const PRESET_WEATHER_CITIES = [
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

const savedMode = typeof localStorage !== 'undefined' ? localStorage.getItem('nav_theme_mode') : 'light';
export const themeMode = ref(['light', 'dark', 'system'].includes(savedMode) ? savedMode : 'light');
export const systemPrefersDark = ref(
  typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-color-scheme: dark)').matches
    : false
);

if (typeof window !== 'undefined' && window.matchMedia) {
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  if (mq.addEventListener) {
    mq.addEventListener('change', (e) => {
      systemPrefersDark.value = e.matches;
      syncBodyThemeClass();
    });
  }
}

export const effectiveTheme = computed(() => {
  if (themeMode.value === 'system') {
    return systemPrefersDark.value ? 'dark' : 'light';
  }
  return themeMode.value === 'dark' ? 'dark' : 'light';
});

export function syncBodyThemeClass() {
  if (typeof document === 'undefined') return;
  const isDark = effectiveTheme.value === 'dark';
  document.body.classList.toggle('theme-dark', isDark);
  document.body.classList.toggle('theme-light', !isDark);
}

export function cycleTheme() {
  const modes = ['light', 'dark', 'system'];
  const next = modes[(modes.indexOf(themeMode.value) + 1) % modes.length];
  themeMode.value = next;
  try {
    localStorage.setItem('nav_theme_mode', next);
  } catch (e) {}
  syncBodyThemeClass();
  return next;
}
