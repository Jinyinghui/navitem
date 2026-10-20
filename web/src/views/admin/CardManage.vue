<template>
  <div class="space-y-5">
    <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-base font-bold text-slate-100">网站导航卡片管理</h2>
          <p class="text-xs text-slate-400 mt-0.5">按住表格左侧 ⠿ 手柄即可上下拖动卡片调整排序，或直接编辑内容自动保存</p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <select v-model="selectedMenuId" class="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 outline-none focus:border-indigo-500" @change="onMenuChange">
            <option v-for="m in menus" :key="m.id" :value="m.id">📂 {{ m.name }}</option>
          </select>
          <select v-model="selectedSubMenuId" class="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 outline-none focus:border-indigo-500" @change="loadCards">
            <option value="">主菜单直属卡片</option>
            <option v-for="s in currentSubMenus" :key="s.id" :value="s.id">↳ {{ s.name }}</option>
          </select>
          <input v-model="filterKeyword" type="text" placeholder="过滤当前列表卡片..." class="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 outline-none focus:border-indigo-500" />
        </div>
      </div>

      <form class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-3 border-t border-slate-800" @submit.prevent="handleAddCard">
        <input v-model="newTitle" type="text" placeholder="卡片标题 *" required class="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 outline-none focus:border-indigo-500" />
        <input v-model="newUrl" type="url" placeholder="目标网址 https://... *" required class="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 outline-none focus:border-indigo-500" />
        <input v-model="newDesc" type="text" placeholder="简短描述（可选）" class="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 outline-none focus:border-indigo-500" />
        <input v-model="newLogo" type="text" placeholder="自定义图标 URL（可选）" class="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 outline-none focus:border-indigo-500" />
        <button type="submit" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition">+ 添加导航卡片</button>
      </form>
    </div>

    <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="border-b border-slate-800 text-[11px] font-semibold text-slate-400 bg-slate-900/60">
            <th class="py-3 px-4 w-20">拖拽</th>
            <th class="py-3 px-3 w-14">图标</th>
            <th class="py-3 px-3">标题</th>
            <th class="py-3 px-3">目标网址</th>
            <th class="py-3 px-3">描述说明</th>
            <th class="py-3 px-3 text-center w-20">微调</th>
            <th class="py-3 px-4 text-center w-20">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800/70 text-xs">
          <tr v-if="displayedCards.length === 0">
            <td colspan="7" class="py-8 text-center text-slate-500">当前分类下暂无卡片，可在上方表单中添加</td>
          </tr>
          <tr
            v-for="(card, cIdx) in displayedCards"
            :key="card.id"
            :draggable="isDragEnabled(cIdx)"
            class="hover:bg-slate-900/40 transition"
            @dragstart="onDragStart($event, cIdx)"
            @dragover.prevent
            @drop.prevent="onDrop($event, cIdx)"
            @dragend="onDragEnd"
          >
            <td class="py-2.5 px-4">
              <div class="flex items-center gap-1.5">
                <span
                  class="drag-handle p-1 rounded text-slate-500 hover:text-indigo-400 transition"
                  @mousedown.stop="onHandlePress(cIdx)"
                  @touchstart.stop="onHandlePress(cIdx)"
                  @mouseup.stop="onHandleRelease"
                  @mouseleave="onHandleRelease"
                  @touchend.stop="onHandleRelease"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="9" cy="6" r="1.7"/><circle cx="15" cy="6" r="1.7"/>
                    <circle cx="9" cy="12" r="1.7"/><circle cx="15" cy="12" r="1.7"/>
                    <circle cx="9" cy="18" r="1.7"/><circle cx="15" cy="18" r="1.7"/>
                  </svg>
                </span>
                <span class="text-[11px] font-bold text-slate-500">#{{ cIdx + 1 }}</span>
              </div>
            </td>
            <td class="py-2.5 px-3">
              <div class="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center text-indigo-400 font-bold text-xs">
                {{ (card.title || 'N').charAt(0).toUpperCase() }}
              </div>
            </td>
            <td class="py-2.5 px-3">
              <input v-model="card.title" type="text" class="w-full px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100" @change="saveCard(card)" />
            </td>
            <td class="py-2.5 px-3">
              <input v-model="card.url" type="text" class="w-full px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300" @change="saveCard(card)" />
            </td>
            <td class="py-2.5 px-3">
              <input v-model="card.desc" type="text" placeholder="添加描述..." class="w-full px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300" @change="saveCard(card)" />
            </td>
            <td class="py-2.5 px-3 text-center">
              <div class="inline-flex items-center gap-1">
                <button type="button" :disabled="cIdx === 0 || !!filterKeyword" class="w-6 h-6 rounded bg-slate-800 hover:bg-indigo-600 disabled:opacity-30 text-xs font-bold text-slate-300 hover:text-white transition" @click="moveCard(cIdx, -1)">↑</button>
                <button type="button" :disabled="cIdx === displayedCards.length - 1 || !!filterKeyword" class="w-6 h-6 rounded bg-slate-800 hover:bg-indigo-600 disabled:opacity-30 text-xs font-bold text-slate-300 hover:text-white transition" @click="moveCard(cIdx, 1)">↓</button>
              </div>
            </td>
            <td class="py-2.5 px-4 text-center">
              <button type="button" class="px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-600 hover:text-white text-rose-400 text-xs transition" @click="removeCard(card.id)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { getMenus, getCards, addCard, updateCard, deleteCard, reorderCards } from '../../api';

const menus = ref([]);
const cards = ref([]);
const selectedMenuId = ref(null);
const selectedSubMenuId = ref('');
const filterKeyword = ref('');

const newTitle = ref('');
const newUrl = ref('');
const newDesc = ref('');
const newLogo = ref('');
const dragIdx = ref(null);
const dragHandleIdx = ref(null);

const currentSubMenus = computed(() => {
  const m = menus.value.find(x => x.id === selectedMenuId.value);
  return m?.subMenus || [];
});

const displayedCards = computed(() => {
  const q = filterKeyword.value.trim().toLowerCase();
  if (!q) return cards.value;
  return cards.value.filter(c =>
    (c.title && c.title.toLowerCase().includes(q)) ||
    (c.url && c.url.toLowerCase().includes(q)) ||
    (c.desc && c.desc.toLowerCase().includes(q))
  );
});

onMounted(async () => {
  window.addEventListener('mouseup', onHandleRelease);
  window.addEventListener('touchend', onHandleRelease);
  const res = await getMenus();
  menus.value = res.data || [];
  if (menus.value.length) {
    selectedMenuId.value = menus.value[0].id;
    await loadCards();
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('mouseup', onHandleRelease);
  window.removeEventListener('touchend', onHandleRelease);
});

async function onMenuChange() {
  selectedSubMenuId.value = '';
  await loadCards();
}

async function loadCards() {
  if (!selectedMenuId.value) return;
  const res = await getCards(selectedMenuId.value, selectedSubMenuId.value || null);
  cards.value = res.data || [];
}

async function handleAddCard() {
  if (!newTitle.value.trim() || !newUrl.value.trim()) return;
  await addCard({
    menu_id: selectedMenuId.value,
    sub_menu_id: selectedSubMenuId.value || null,
    title: newTitle.value.trim(),
    url: newUrl.value.trim(),
    desc: newDesc.value.trim(),
    logo_url: newLogo.value.trim(),
    order: cards.value.length + 1
  });
  newTitle.value = '';
  newUrl.value = '';
  newDesc.value = '';
  newLogo.value = '';
  await loadCards();
}

async function saveCard(card) {
  await updateCard(card.id, card);
}

async function removeCard(id) {
  await deleteCard(id);
  await loadCards();
}

function onHandlePress(idx) {
  if (filterKeyword.value) return;
  dragHandleIdx.value = idx;
}

function onHandleRelease() {
  dragHandleIdx.value = null;
}

function isDragEnabled(idx) {
  return !filterKeyword.value && dragHandleIdx.value === idx;
}

function onDragStart(e, idx) {
  if (!isDragEnabled(idx)) {
    e.preventDefault();
    return;
  }
  dragIdx.value = idx;
}

async function onDrop(e, targetIdx) {
  if (dragIdx.value === null || dragIdx.value === targetIdx) {
    onDragEnd();
    return;
  }
  const list = [...cards.value];
  const [moved] = list.splice(dragIdx.value, 1);
  list.splice(targetIdx, 0, moved);
  list.forEach((c, i) => { c.order = i + 1; });
  cards.value = list;
  onDragEnd();
  await reorderCards(cards.value.map((c, i) => ({ id: c.id, order: i + 1 })));
}

function onDragEnd() {
  dragIdx.value = null;
  onHandleRelease();
}

async function moveCard(idx, dir) {
  const target = idx + dir;
  if (target < 0 || target >= cards.value.length) return;
  const list = [...cards.value];
  const [moved] = list.splice(idx, 1);
  list.splice(target, 0, moved);
  list.forEach((c, i) => { c.order = i + 1; });
  cards.value = list;
  await reorderCards(cards.value.map((c, i) => ({ id: c.id, order: i + 1 })));
}
</script>
