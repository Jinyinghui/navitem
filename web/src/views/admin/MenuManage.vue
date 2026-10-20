<template>
  <div class="menu-manage">
    <div class="top-bar">
      <div>
        <h2 class="section-heading">栏目分类管理（支持拖拽排序）</h2>
        <p class="section-sub">直接按住左侧拖拽手柄 ⠿ 即可上下拖动调整主菜单与二级子菜单顺序，松手自动保存</p>
      </div>
      <form class="menu-add" @submit.prevent="addMenu">
        <input v-model="newMenuName" placeholder="输入新主菜单名称..." class="input" />
        <button type="submit" class="btn btn-primary">+ 新增主菜单</button>
      </form>
    </div>

    <div class="menu-list">
      <div
        v-for="(menu, mIdx) in menus"
        :key="menu.id"
        class="menu-card"
        :class="{
          'is-dragging': dragMenuIndex === mIdx,
          'is-drag-over': dragOverMenuIndex === mIdx && dragMenuIndex !== mIdx
        }"
        draggable="true"
        @dragstart="onMenuDragStart($event, mIdx)"
        @dragover.prevent="onMenuDragOver($event, mIdx)"
        @drop.prevent="onMenuDrop($event, mIdx)"
        @dragend="onMenuDragEnd"
      >
        <div class="main-menu-row">
          <div class="menu-info">
            <span class="drag-handle" title="按住上下拖动排序">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="9" cy="6" r="1.8"/><circle cx="15" cy="6" r="1.8"/>
                <circle cx="9" cy="12" r="1.8"/><circle cx="15" cy="12" r="1.8"/>
                <circle cx="9" cy="18" r="1.8"/><circle cx="15" cy="18" r="1.8"/>
              </svg>
            </span>
            <span class="menu-badge">#{{ mIdx + 1 }}</span>
            <input v-model="menu.name" class="name-input" @blur="updateMenu(menu)" />
          </div>

          <div class="menu-actions">
            <div class="move-btns">
              <button type="button" class="btn-move" :disabled="mIdx === 0" title="上移" @click="moveMenu(mIdx, -1)">↑</button>
              <button type="button" class="btn-move" :disabled="mIdx === menus.length - 1" title="下移" @click="moveMenu(mIdx, 1)">↓</button>
            </div>
            <button type="button" class="btn btn-ghost" @click="toggleSubMenu(menu.id)">
              <span>子菜单 ({{ menu.subMenus?.length || 0 }})</span>
              <svg :class="{ rotated: menu.showSubMenu }" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
            </button>
            <button type="button" class="btn btn-danger-outline" @click="deleteMenu(menu.id)">删除</button>
          </div>
        </div>

        <!-- 二级子菜单区域（同样支持拖拽排序） -->
        <div v-if="menu.showSubMenu" class="submenu-panel">
          <div class="submenu-add-row">
            <input
              v-model="subMenuDrafts[menu.id]"
              placeholder="输入新子菜单名称..."
              class="input input-sm"
              @keyup.enter="addSubMenu(menu.id)"
            />
            <button type="button" class="btn btn-sm btn-primary" @click="addSubMenu(menu.id)">+ 添加子菜单</button>
          </div>

          <div v-if="menu.subMenus && menu.subMenus.length > 0" class="submenu-items">
            <div
              v-for="(sub, sIdx) in menu.subMenus"
              :key="sub.id"
              class="submenu-row"
              :class="{
                'is-dragging': dragSubInfo.menuId === menu.id && dragSubInfo.index === sIdx,
                'is-drag-over': dragSubInfo.menuId === menu.id && dragSubInfo.overIndex === sIdx && dragSubInfo.index !== sIdx
              }"
              draggable="true"
              @dragstart.stop="onSubDragStart($event, menu.id, sIdx)"
              @dragover.prevent.stop="onSubDragOver($event, menu.id, sIdx)"
              @drop.prevent.stop="onSubDrop($event, menu, sIdx)"
              @dragend.stop="onSubDragEnd"
            >
              <span class="drag-handle sub-handle" title="按住拖动调整子菜单顺序">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="9" cy="6" r="1.6"/><circle cx="15" cy="6" r="1.6"/>
                  <circle cx="9" cy="12" r="1.6"/><circle cx="15" cy="12" r="1.6"/>
                  <circle cx="9" cy="18" r="1.6"/><circle cx="15" cy="18" r="1.6"/>
                </svg>
              </span>
              <span class="sub-badge">{{ sIdx + 1 }}</span>
              <input v-model="sub.name" class="name-input sub-name" @blur="updateSubMenu(sub)" />
              <div class="move-btns">
                <button type="button" class="btn-move" :disabled="sIdx === 0" title="上移" @click="moveSubMenu(menu, sIdx, -1)">↑</button>
                <button type="button" class="btn-move" :disabled="sIdx === menu.subMenus.length - 1" title="下移" @click="moveSubMenu(menu, sIdx, 1)">↓</button>
              </div>
              <button type="button" class="btn btn-sm btn-danger-outline" @click="deleteSubMenu(sub.id)">删除</button>
            </div>
          </div>
          <p v-else class="empty-hint">当前主菜单下暂无二级子菜单</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import {
  getMenus,
  addMenu as apiAddMenu,
  updateMenu as apiUpdateMenu,
  deleteMenu as apiDeleteMenu,
  reorderMenus as apiReorderMenus,
  addSubMenu as apiAddSubMenu,
  updateSubMenu as apiUpdateSubMenu,
  deleteSubMenu as apiDeleteSubMenu,
  reorderSubMenus as apiReorderSubMenus
} from '../../api';

const menus = ref([]);
const newMenuName = ref('');
const subMenuDrafts = reactive({});

// 主菜单拖拽状态
const dragMenuIndex = ref(null);
const dragOverMenuIndex = ref(null);

// 子菜单拖拽状态
const dragSubInfo = reactive({
  menuId: null,
  index: null,
  overIndex: null
});

onMounted(loadMenus);

async function loadMenus() {
  const expandedMap = {};
  menus.value.forEach(m => { expandedMap[m.id] = m.showSubMenu; });
  const res = await getMenus();
  menus.value = res.data.map(menu => ({
    ...menu,
    showSubMenu: expandedMap[menu.id] ?? false
  }));
}

// 主菜单拖拽事件
function onMenuDragStart(e, index) {
  dragMenuIndex.value = index;
  e.dataTransfer.effectAllowed = 'move';
}

function onMenuDragOver(e, index) {
  if (dragMenuIndex.value === null) return;
  dragOverMenuIndex.value = index;
}

async function onMenuDrop(e, targetIndex) {
  if (dragMenuIndex.value === null || dragMenuIndex.value === targetIndex) {
    onMenuDragEnd();
    return;
  }
  const list = [...menus.value];
  const [moved] = list.splice(dragMenuIndex.value, 1);
  list.splice(targetIndex, 0, moved);
  list.forEach((m, idx) => { m.order = idx + 1; });
  menus.value = list;
  onMenuDragEnd();
  await persistMenuOrder();
}

function onMenuDragEnd() {
  dragMenuIndex.value = null;
  dragOverMenuIndex.value = null;
}

async function moveMenu(index, delta) {
  const target = index + delta;
  if (target < 0 || target >= menus.value.length) return;
  const list = [...menus.value];
  const [moved] = list.splice(index, 1);
  list.splice(target, 0, moved);
  list.forEach((m, idx) => { m.order = idx + 1; });
  menus.value = list;
  await persistMenuOrder();
}

async function persistMenuOrder() {
  const items = menus.value.map((m, idx) => ({ id: m.id, order: idx + 1 }));
  await apiReorderMenus(items);
}

// 子菜单拖拽事件
function onSubDragStart(e, menuId, sIdx) {
  dragSubInfo.menuId = menuId;
  dragSubInfo.index = sIdx;
  e.dataTransfer.effectAllowed = 'move';
}

function onSubDragOver(e, menuId, sIdx) {
  if (dragSubInfo.menuId !== menuId) return;
  dragSubInfo.overIndex = sIdx;
}

async function onSubDrop(e, menu, targetIdx) {
  if (dragSubInfo.menuId !== menu.id || dragSubInfo.index === null || dragSubInfo.index === targetIdx) {
    onSubDragEnd();
    return;
  }
  const subs = [...(menu.subMenus || [])];
  const [moved] = subs.splice(dragSubInfo.index, 1);
  subs.splice(targetIdx, 0, moved);
  subs.forEach((s, idx) => { s.order = idx + 1; });
  menu.subMenus = subs;
  onSubDragEnd();
  await persistSubMenuOrder(menu);
}

function onSubDragEnd() {
  dragSubInfo.menuId = null;
  dragSubInfo.index = null;
  dragSubInfo.overIndex = null;
}

async function moveSubMenu(menu, sIdx, delta) {
  const subs = [...(menu.subMenus || [])];
  const target = sIdx + delta;
  if (target < 0 || target >= subs.length) return;
  const [moved] = subs.splice(sIdx, 1);
  subs.splice(target, 0, moved);
  subs.forEach((s, idx) => { s.order = idx + 1; });
  menu.subMenus = subs;
  await persistSubMenuOrder(menu);
}

async function persistSubMenuOrder(menu) {
  const items = (menu.subMenus || []).map((s, idx) => ({ id: s.id, order: idx + 1 }));
  await apiReorderSubMenus(items);
}

async function addMenu() {
  if (!newMenuName.value.trim()) return;
  const maxOrder = menus.value.length ? Math.max(...menus.value.map(m => m.order || 0)) : 0;
  await apiAddMenu({ name: newMenuName.value.trim(), order: maxOrder + 1 });
  newMenuName.value = '';
  await loadMenus();
}

async function updateMenu(menu) {
  await apiUpdateMenu(menu.id, { name: menu.name, order: menu.order });
  await loadMenus();
}

async function deleteMenu(id) {
  await apiDeleteMenu(id);
  await loadMenus();
}

async function addSubMenu(menuId) {
  const draft = (subMenuDrafts[menuId] || '').trim();
  if (!draft) return;
  const menu = menus.value.find(m => m.id === menuId);
  const maxOrder = menu?.subMenus?.length ? Math.max(...menu.subMenus.map(s => s.order || 0)) : 0;
  await apiAddSubMenu(menuId, { name: draft, order: maxOrder + 1 });
  subMenuDrafts[menuId] = '';
  await loadMenus();
}

async function updateSubMenu(subMenu) {
  await apiUpdateSubMenu(subMenu.id, { name: subMenu.name, order: subMenu.order });
  await loadMenus();
}

async function deleteSubMenu(id) {
  await apiDeleteSubMenu(id);
  await loadMenus();
}

function toggleSubMenu(menuId) {
  const menu = menus.value.find(m => m.id === menuId);
  if (menu) menu.showSubMenu = !menu.showSubMenu;
}
</script>

<style scoped>
.menu-manage {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.top-bar {
  background: #fff;
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.section-heading {
  margin: 0 0 0.25rem 0;
  font-size: 1.2rem;
  color: #0f172a;
}

.section-sub {
  margin: 0;
  font-size: 0.86rem;
  color: #64748b;
}

.menu-add {
  display: flex;
  gap: 0.65rem;
}

.input {
  padding: 0.6rem 0.9rem;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  font-size: 0.9rem;
  outline: none;
  min-width: 220px;
}

.input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

.input-sm {
  padding: 0.45rem 0.75rem;
  font-size: 0.85rem;
}

.menu-list {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.menu-card {
  background: #fff;
  border-radius: 14px;
  border: 2px solid #e2e8f0;
  overflow: hidden;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease, opacity 0.18s ease;
}

.menu-card.is-dragging {
  opacity: 0.45;
  transform: scale(0.99);
}

.menu-card.is-drag-over {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
}

.main-menu-row {
  padding: 0.95rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.menu-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.drag-handle {
  cursor: grab;
  color: #94a3b8;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  border-radius: 6px;
  transition: color 0.15s, background 0.15s;
}

.drag-handle:hover {
  color: #4f46e5;
  background: #eef2ff;
}

.drag-handle:active {
  cursor: grabbing;
}

.menu-badge {
  background: #eef2ff;
  color: #4f46e5;
  font-weight: 700;
  font-size: 0.8rem;
  padding: 0.25rem 0.55rem;
  border-radius: 6px;
}

.name-input {
  font-size: 1rem;
  font-weight: 600;
  color: #0f172a;
  border: 1px solid transparent;
  padding: 0.4rem 0.6rem;
  border-radius: 8px;
  background: transparent;
}

.name-input:hover, .name-input:focus {
  border-color: #cbd5e1;
  background: #f8fafc;
  outline: none;
}

.menu-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.move-btns {
  display: inline-flex;
  gap: 0.25rem;
}

.btn-move {
  width: 28px;
  height: 28px;
  border-radius: 7px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #475569;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.btn-move:hover:not(:disabled) {
  border-color: #6366f1;
  color: #4f46e5;
  background: #eef2ff;
}

.btn-move:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.55rem 1rem;
  border-radius: 10px;
  font-size: 0.86rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-sm {
  padding: 0.4rem 0.75rem;
  font-size: 0.8rem;
}

.btn-primary {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
}

.btn-ghost {
  background: #f1f5f9;
  color: #334155;
}

.btn-ghost:hover {
  background: #e2e8f0;
}

.btn-danger-outline {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.btn-danger-outline:hover {
  background: #dc2626;
  color: #fff;
}

.rotated {
  transform: rotate(180deg);
}

.submenu-panel {
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  padding: 1rem 1.25rem;
}

.submenu-add-row {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.85rem;
}

.submenu-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.submenu-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.65rem;
  background: #fff;
  padding: 0.5rem 0.85rem;
  border-radius: 10px;
  border: 2px solid #e2e8f0;
  transition: all 0.15s ease;
}

.submenu-row.is-dragging {
  opacity: 0.45;
}

.submenu-row.is-drag-over {
  border-color: #6366f1;
  background: #eef2ff;
}

.sub-badge {
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
  background: #f1f5f9;
  padding: 0.15rem 0.45rem;
  border-radius: 5px;
}

.sub-name {
  font-size: 0.9rem;
  font-weight: 500;
  flex: 1;
}

.empty-hint {
  margin: 0;
  font-size: 0.84rem;
  color: #94a3b8;
}
</style>
