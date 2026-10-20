<template>
  <div class="space-y-5">
    <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 class="text-base font-bold text-slate-100">栏目与二级分类管理</h2>
        <p class="text-xs text-slate-400 mt-0.5">按住左侧 ⠿ 拖拽手柄即可上下拖动主菜单或二级子菜单调整顺序，松手自动保存并同步前台</p>
      </div>
      <form class="flex gap-2" @submit.prevent="handleAddMenu">
        <input v-model="newMenuName" type="text" placeholder="输入新主菜单名称..." class="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:border-indigo-500 outline-none" />
        <button type="submit" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition">+ 新增主菜单</button>
      </form>
    </div>

    <div class="space-y-3">
      <div
        v-for="(menu, mIdx) in menus"
        :key="menu.id"
        draggable="true"
        class="bg-slate-900 border-2 border-slate-800 rounded-2xl overflow-hidden transition"
        :class="{
          'is-dragging': dragMenuIdx === mIdx,
          'is-drag-over': dragOverMenuIdx === mIdx && dragMenuIdx !== mIdx
        }"
        @dragstart="onMenuDragStart($event, mIdx)"
        @dragover.prevent="onMenuDragOver($event, mIdx)"
        @drop.prevent="onMenuDrop($event, mIdx)"
        @dragend="onMenuDragEnd"
      >
        <div class="p-4 flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-3 flex-1 min-w-[200px]">
            <span class="drag-handle p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition" title="按住上下拖动调整主菜单顺序">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="9" cy="6" r="1.8"/><circle cx="15" cy="6" r="1.8"/>
                <circle cx="9" cy="12" r="1.8"/><circle cx="15" cy="12" r="1.8"/>
                <circle cx="9" cy="18" r="1.8"/><circle cx="15" cy="18" r="1.8"/>
              </svg>
            </span>
            <span class="px-2 py-1 rounded-md bg-indigo-500/15 text-indigo-400 text-xs font-bold">#{{ mIdx + 1 }}</span>
            <input v-model="menu.name" type="text" class="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-100 focus:border-indigo-500 outline-none" @change="saveMenu(menu)" />
            <span class="text-[11px] text-slate-500 hidden sm:inline">按住拖拽排序</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="flex items-center gap-1">
              <button type="button" :disabled="mIdx === 0" class="w-7 h-7 rounded-lg bg-slate-800 hover:bg-indigo-600 disabled:opacity-30 text-xs font-bold text-slate-300 hover:text-white transition" title="上移" @click="moveMenu(mIdx, -1)">↑</button>
              <button type="button" :disabled="mIdx === menus.length - 1" class="w-7 h-7 rounded-lg bg-slate-800 hover:bg-indigo-600 disabled:opacity-30 text-xs font-bold text-slate-300 hover:text-white transition" title="下移" @click="moveMenu(mIdx, 1)">↓</button>
            </div>
            <button type="button" class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium transition" @click="toggleExpand(menu.id)">
              子菜单 ({{ menu.subMenus?.length || 0 }}) {{ expanded[menu.id] ? '▴' : '▾' }}
            </button>
            <button type="button" class="px-3 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-600 hover:text-white text-rose-400 text-xs font-medium transition" @click="removeMenu(menu.id)">
              删除
            </button>
          </div>
        </div>

        <div v-if="expanded[menu.id]" class="bg-slate-950/70 border-t border-slate-800 p-4 space-y-3">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div class="flex gap-2">
              <input v-model="newSubNames[menu.id]" type="text" placeholder="输入新二级子菜单名称..." class="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-100 outline-none focus:border-indigo-500" @keyup.enter="handleAddSub(menu)" />
              <button type="button" class="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition" @click="handleAddSub(menu)">+ 添加子菜单</button>
            </div>
            <span class="text-[11px] text-slate-500">提示：子菜单同样支持上下拖拽排序</span>
          </div>

          <div v-if="menu.subMenus && menu.subMenus.length > 0" class="space-y-2">
            <div
              v-for="(sub, sIdx) in menu.subMenus"
              :key="sub.id"
              draggable="true"
              class="flex items-center justify-between gap-2 bg-slate-900 border-2 border-slate-800/80 rounded-xl px-3.5 py-2 transition"
              @dragstart.stop="onSubDragStart($event, menu.id, sIdx)"
              @dragover.prevent.stop
              @drop.prevent.stop="onSubDrop($event, menu, sIdx)"
            >
              <div class="flex items-center gap-2.5 flex-1">
                <span class="drag-handle p-1 rounded text-slate-500 hover:text-indigo-400 transition" title="按住拖动调整子菜单顺序">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="9" cy="6" r="1.7"/><circle cx="15" cy="6" r="1.7"/>
                    <circle cx="9" cy="12" r="1.7"/><circle cx="15" cy="12" r="1.7"/>
                    <circle cx="9" cy="18" r="1.7"/><circle cx="15" cy="18" r="1.7"/>
                  </svg>
                </span>
                <span class="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[11px] font-bold">{{ sIdx + 1 }}</span>
                <input v-model="sub.name" type="text" class="px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-xs text-slate-200 flex-1 max-w-xs" @change="saveSub(sub)" />
              </div>
              <div class="flex items-center gap-1.5">
                <button type="button" :disabled="sIdx === 0" class="w-6 h-6 rounded bg-slate-800 hover:bg-indigo-600 disabled:opacity-30 text-xs font-bold text-slate-300 hover:text-white transition" title="上移" @click="moveSub(menu, sIdx, -1)">↑</button>
                <button type="button" :disabled="sIdx === menu.subMenus.length - 1" class="w-6 h-6 rounded bg-slate-800 hover:bg-indigo-600 disabled:opacity-30 text-xs font-bold text-slate-300 hover:text-white transition" title="下移" @click="moveSub(menu, sIdx, 1)">↓</button>
                <button type="button" class="px-2.5 py-1 rounded-md bg-rose-500/10 hover:bg-rose-600 hover:text-white text-rose-400 text-xs transition" @click="removeSub(menu, sub.id)">删除</button>
              </div>
            </div>
          </div>
          <p v-else class="text-xs text-slate-500">当前分类下暂无二级子菜单</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import {
  getMenus,
  addMenu,
  updateMenu,
  deleteMenu,
  reorderMenus,
  addSubMenu,
  updateSubMenu,
  deleteSubMenu,
  reorderSubMenus
} from '../../api';

const menus = ref([]);
const newMenuName = ref('');
const expanded = reactive({ 2: true });
const newSubNames = reactive({});

const dragMenuIdx = ref(null);
const dragOverMenuIdx = ref(null);
const dragSubState = reactive({ parentId: null, subIdx: null });

onMounted(loadMenus);

async function loadMenus() {
  try {
    const res = await getMenus();
    menus.value = res.data || [];
  } catch (e) {}
}

function toggleExpand(id) {
  expanded[id] = !expanded[id];
}

async function handleAddMenu() {
  const name = newMenuName.value.trim();
  if (!name) return;
  await addMenu({ name, order: menus.value.length + 1 });
  newMenuName.value = '';
  await loadMenus();
}

async function saveMenu(menu) {
  await updateMenu(menu.id, { name: menu.name, order: menu.order });
}

async function removeMenu(id) {
  await deleteMenu(id);
  await loadMenus();
}

async function handleAddSub(menu) {
  const val = (newSubNames[menu.id] || '').trim();
  if (!val) return;
  await addSubMenu(menu.id, { name: val, order: (menu.subMenus?.length || 0) + 1 });
  newSubNames[menu.id] = '';
  await loadMenus();
}

async function saveSub(sub) {
  await updateSubMenu(sub.id, { name: sub.name, order: sub.order });
}

async function removeSub(menu, subId) {
  await deleteSubMenu(subId);
  await loadMenus();
}

function onMenuDragStart(e, idx) {
  dragMenuIdx.value = idx;
  e.dataTransfer.effectAllowed = 'move';
}
function onMenuDragOver(e, idx) {
  if (dragMenuIdx.value === null) return;
  dragOverMenuIdx.value = idx;
}
async function onMenuDrop(e, targetIdx) {
  if (dragMenuIdx.value === null || dragMenuIdx.value === targetIdx) {
    onMenuDragEnd();
    return;
  }
  const list = [...menus.value];
  const [moved] = list.splice(dragMenuIdx.value, 1);
  list.splice(targetIdx, 0, moved);
  list.forEach((m, i) => { m.order = i + 1; });
  menus.value = list;
  onMenuDragEnd();
  await reorderMenus(menus.value.map((m, i) => ({ id: m.id, order: i + 1 })));
}
function onMenuDragEnd() {
  dragMenuIdx.value = null;
  dragOverMenuIdx.value = null;
}

async function moveMenu(idx, dir) {
  const target = idx + dir;
  if (target < 0 || target >= menus.value.length) return;
  const list = [...menus.value];
  const [moved] = list.splice(idx, 1);
  list.splice(target, 0, moved);
  list.forEach((m, i) => { m.order = i + 1; });
  menus.value = list;
  await reorderMenus(menus.value.map((m, i) => ({ id: m.id, order: i + 1 })));
}

function onSubDragStart(e, parentId, sIdx) {
  dragSubState.parentId = parentId;
  dragSubState.subIdx = sIdx;
}
async function onSubDrop(e, menu, targetIdx) {
  if (dragSubState.parentId !== menu.id || dragSubState.subIdx === null || dragSubState.subIdx === targetIdx) return;
  const subs = [...(menu.subMenus || [])];
  const [moved] = subs.splice(dragSubState.subIdx, 1);
  subs.splice(targetIdx, 0, moved);
  subs.forEach((s, i) => { s.order = i + 1; });
  menu.subMenus = subs;
  dragSubState.parentId = null;
  dragSubState.subIdx = null;
  await reorderSubMenus(subs.map((s, i) => ({ id: s.id, order: i + 1 })));
}
async function moveSub(menu, sIdx, dir) {
  const subs = [...(menu.subMenus || [])];
  const target = sIdx + dir;
  if (target < 0 || target >= subs.length) return;
  const [moved] = subs.splice(sIdx, 1);
  subs.splice(target, 0, moved);
  subs.forEach((s, i) => { s.order = i + 1; });
  menu.subMenus = subs;
  await reorderSubMenus(subs.map((s, i) => ({ id: s.id, order: i + 1 })));
}
</script>
