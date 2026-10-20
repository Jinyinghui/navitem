<template>
  <header class="navbar-shell" :class="{ 'light-mode': theme === 'light' }">
    <div class="navbar-inner">
      <!-- 品牌标识 -->
      <div class="brand" @click="selectFirstMenu">
        <div class="brand-logo">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="3 11 22 2 13 21 11 13 3 11"/>
          </svg>
        </div>
        <span class="brand-title">Nav-Item</span>
      </div>

      <!-- 主导航菜单 -->
      <nav class="menu-bar" aria-label="主导航">
        <div
          v-for="menu in menus"
          :key="menu.id"
          class="menu-item"
          @mouseenter="showSubMenu(menu.id)"
          @mouseleave="hideSubMenu(menu.id)"
        >
          <button
            type="button"
            class="menu-btn"
            :class="{ active: menu.id === activeId }"
            @click="$emit('select', menu)"
          >
            <span>{{ menu.name }}</span>
            <svg
              v-if="menu.subMenus && menu.subMenus.length > 0"
              class="chevron-icon"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          <!-- 二级菜单浮层 -->
          <div
            v-if="menu.subMenus && menu.subMenus.length > 0"
            class="sub-menu"
            :class="{ show: hoveredMenuId === menu.id }"
          >
            <button
              type="button"
              class="sub-menu-item"
              :class="{ active: menu.id === activeId && !activeSubMenuId }"
              @click="handleSubSelect(null, menu)"
            >
              全部 {{ menu.name }}
            </button>
            <button
              v-for="subMenu in menu.subMenus"
              :key="subMenu.id"
              type="button"
              class="sub-menu-item"
              :class="{ active: subMenu.id === activeSubMenuId }"
              @click="handleSubSelect(subMenu, menu)"
            >
              {{ subMenu.name }}
            </button>
          </div>
        </div>
      </nav>

      <!-- 右侧快捷工具栏 -->
      <div class="navbar-actions">
        <button
          type="button"
          class="action-btn"
          :title="viewMode === 'detailed' ? '切换为紧凑网格视图' : '切换为详情卡片视图'"
          @click="$emit('toggle-view')"
        >
          <svg v-if="viewMode === 'detailed'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
          </svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="6" rx="2"/><rect x="3" y="14" width="18" height="6" rx="2"/>
          </svg>
        </button>

        <button
          type="button"
          class="action-btn theme-mode-btn"
          :title="themeModeTitle"
          @click="$emit('toggle-theme')"
        >
          <!-- 浅色模式图标 -->
          <svg v-if="themeMode === 'light'" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5"/>
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
          </svg>
          <!-- 深色模式图标 -->
          <svg v-else-if="themeMode === 'dark'" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
          <!-- 跟随系统图标 -->
          <svg v-else width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
            <line x1="8" y1="21" x2="16" y2="21"/>
            <line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
          <span class="theme-mode-label">{{ themeModeLabel }}</span>
        </button>

        <router-link to="/admin" class="action-btn admin-link" title="后台管理">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </router-link>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  menus: { type: Array, default: () => [] },
  activeId: Number,
  activeSubMenuId: Number,
  theme: { type: String, default: 'light' },
  themeMode: { type: String, default: 'light' },
  viewMode: { type: String, default: 'detailed' }
});

const themeModeLabel = computed(() => {
  if (props.themeMode === 'system') return '自动';
  return props.themeMode === 'dark' ? '深色' : '浅色';
});

const themeModeTitle = computed(() => {
  if (props.themeMode === 'light') return '当前：浅色主题（点击切换为深色主题）';
  if (props.themeMode === 'dark') return '当前：深色主题（点击切换为跟随系统）';
  return `当前：跟随系统自动切换（实际生效：${props.theme === 'dark' ? '深色' : '浅色'}，点击切换为浅色主题）`;
});

const emit = defineEmits(['select', 'toggle-theme', 'toggle-view']);

const hoveredMenuId = ref(null);
let hideTimer = null;

function showSubMenu(menuId) {
  if (hideTimer) clearTimeout(hideTimer);
  hoveredMenuId.value = menuId;
}

function hideSubMenu(menuId) {
  hideTimer = setTimeout(() => {
    if (hoveredMenuId.value === menuId) {
      hoveredMenuId.value = null;
    }
  }, 150);
}

function handleSubSelect(subMenu, parentMenu) {
  hoveredMenuId.value = null;
  if (subMenu) {
    emit('select', subMenu, parentMenu);
  } else {
    emit('select', parentMenu);
  }
}

function selectFirstMenu() {
  if (props.menus && props.menus.length > 0) {
    emit('select', props.menus[0]);
  }
}
</script>

<style scoped>
.navbar-shell {
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
  padding: 0.75rem 1.5rem;
  background: rgba(15, 23, 42, 0.72);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  transition: background 0.3s ease, border-color 0.3s ease;
}

.navbar-shell.light-mode {
  background: rgba(255, 255, 255, 0.78);
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
}

.navbar-inner {
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  cursor: pointer;
  user-select: none;
  flex-shrink: 0;
}

.brand-logo {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}

.brand-title {
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  background: linear-gradient(90deg, #fff, #cbd5e1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.light-mode .brand-title {
  background: linear-gradient(90deg, #0f172a, #475569);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.menu-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.35rem;
  background: rgba(255, 255, 255, 0.05);
  padding: 0.3rem;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.07);
}

.light-mode .menu-bar {
  background: rgba(15, 23, 42, 0.04);
  border-color: rgba(15, 23, 42, 0.06);
}

.menu-item {
  position: relative;
}

.menu-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: transparent;
  border: none;
  color: rgba(248, 250, 252, 0.78);
  font-size: 0.92rem;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.22, 1, 0.36, 1);
}

.light-mode .menu-btn {
  color: #475569;
}

.menu-btn:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.08);
}

.light-mode .menu-btn:hover {
  color: #0f172a;
  background: rgba(15, 23, 42, 0.06);
}

.menu-btn.active {
  color: #fff;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);
}

.light-mode .menu-btn.active {
  color: #fff;
}

.chevron-icon {
  opacity: 0.7;
  transition: transform 0.2s ease;
}

.menu-item:hover .chevron-icon {
  transform: rotate(180deg);
}

/* 二级菜单浮层 */
.sub-menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%) translateY(6px);
  background: rgba(15, 23, 42, 0.92);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 12px;
  min-width: 150px;
  padding: 0.4rem;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition: all 0.2s cubic-bezier(0.22, 1, 0.36, 1);
  z-index: 1000;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.light-mode .sub-menu {
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.12);
  border-color: rgba(15, 23, 42, 0.08);
}

.sub-menu.show {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
  transform: translateX(-50%) translateY(0);
}

.sub-menu-item {
  display: block;
  width: 100%;
  text-align: left;
  padding: 0.5rem 0.85rem;
  border: none;
  background: transparent;
  color: rgba(248, 250, 252, 0.85);
  font-size: 0.86rem;
  font-weight: 500;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.light-mode .sub-menu-item {
  color: #334155;
}

.sub-menu-item:hover {
  background: rgba(99, 102, 241, 0.2);
  color: #818cf8;
}

.light-mode .sub-menu-item:hover {
  background: rgba(99, 102, 241, 0.1);
  color: #4f46e5;
}

.sub-menu-item.active {
  background: rgba(99, 102, 241, 0.28);
  color: #a5b4fc;
  font-weight: 600;
}

.light-mode .sub-menu-item.active {
  background: rgba(99, 102, 241, 0.15);
  color: #4f46e5;
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.action-btn {
  min-width: 38px;
  height: 38px;
  padding: 0 0.55rem;
  gap: 0.35rem;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: rgba(248, 250, 252, 0.85);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s ease;
}

.light-mode .action-btn {
  border-color: rgba(15, 23, 42, 0.1);
  background: rgba(15, 23, 42, 0.04);
  color: #475569;
}

.action-btn:hover {
  background: rgba(99, 102, 241, 0.2);
  border-color: rgba(99, 102, 241, 0.4);
  color: #fff;
  transform: translateY(-1px);
}

.light-mode .action-btn:hover {
  background: rgba(99, 102, 241, 0.12);
  border-color: rgba(99, 102, 241, 0.3);
  color: #4f46e5;
}

.theme-mode-label {
  font-size: 0.78rem;
  font-weight: 600;
}

@media (max-width: 768px) {
  .navbar-shell {
    padding: 0.6rem 0.9rem;
  }
  .navbar-inner {
    flex-wrap: wrap;
    gap: 0.6rem;
  }
  .brand-title {
    font-size: 1.05rem;
  }
  .menu-bar {
    order: 3;
    width: 100%;
    justify-content: flex-start;
    overflow-x: auto;
    flex-wrap: nowrap;
    padding: 0.25rem;
  }
  .menu-btn {
    padding: 0.4rem 0.8rem;
    font-size: 0.85rem;
    white-space: nowrap;
  }
}
</style>
