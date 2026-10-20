<template>
  <div class="card-manage">
    <div class="card-header">
      <div class="header-top">
        <div>
          <h2 class="page-title">导航卡片管理（支持拖拽排序）</h2>
          <p class="page-sub">按住表格左侧 ⠿ 手柄即可上下拖动卡片调整展示顺序，或直接修改内容自动保存</p>
        </div>
        <div class="filter-group">
          <select v-model="selectedMenuId" class="input select-box" @change="onMenuChange">
            <option v-for="menu in menus" :value="menu.id" :key="menu.id">📂 {{ menu.name }}</option>
          </select>
          <select v-model="selectedSubMenuId" class="input select-box" @change="onSubMenuChange">
            <option value="">主菜单直属卡片</option>
            <option v-for="subMenu in currentSubMenus" :value="subMenu.id" :key="subMenu.id">↳ {{ subMenu.name }}</option>
          </select>
          <input v-model="tableFilter" placeholder="搜索当前列表卡片..." class="input filter-input" />
        </div>
      </div>

      <form class="card-add-bar" @submit.prevent="addCard">
        <input v-model="newCardTitle" placeholder="卡片标题 *" class="input" required />
        <input v-model="newCardUrl" placeholder="目标网址 https://... *" class="input" required />
        <input v-model="newCardDesc" placeholder="简短描述（可选）" class="input" />
        <input v-model="newCardLogo" placeholder="自定义图标 URL（可选）" class="input" />
        <button type="submit" class="btn btn-primary">+ 添加卡片</button>
      </form>
    </div>

    <div class="card-table-card">
      <table v-if="filteredCards.length > 0" class="card-table">
        <thead>
          <tr>
            <th style="width: 72px;">拖拽</th>
            <th style="width: 56px;">图标</th>
            <th style="width: 16%;">标题</th>
            <th style="width: 25%;">目标网址</th>
            <th style="width: 22%;">描述说明</th>
            <th style="width: 18%;">自定义 Logo 链接</th>
            <th style="width: 90px; text-align: center;">微调</th>
            <th style="width: 80px; text-align: center;">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(card, cIdx) in filteredCards"
            :key="card.id"
            :draggable="!tableFilter.trim()"
            :class="{
              'is-dragging': dragCardIndex === cIdx,
              'is-drag-over': dragOverCardIndex === cIdx && dragCardIndex !== cIdx
            }"
            @dragstart="onCardDragStart($event, cIdx)"
            @dragover.prevent="onCardDragOver($event, cIdx)"
            @drop.prevent="onCardDrop($event, cIdx)"
            @dragend="onCardDragEnd"
          >
            <td>
              <div class="drag-cell">
                <span class="drag-handle" :title="tableFilter.trim() ? '清空搜索框后可拖拽排序' : '按住上下拖动排序'">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="9" cy="6" r="1.7"/><circle cx="15" cy="6" r="1.7"/>
                    <circle cx="9" cy="12" r="1.7"/><circle cx="15" cy="12" r="1.7"/>
                    <circle cx="9" cy="18" r="1.7"/><circle cx="15" cy="18" r="1.7"/>
                  </svg>
                </span>
                <span class="order-tag">#{{ cIdx + 1 }}</span>
              </div>
            </td>
            <td>
              <div class="logo-preview">
                <img :src="getPreviewLogo(card)" alt="" @error="e => e.target.style.display='none'" />
              </div>
            </td>
            <td><input v-model="card.title" @blur="updateCard(card)" class="table-input font-medium" /></td>
            <td><input v-model="card.url" @blur="updateCard(card)" class="table-input" /></td>
            <td><input v-model="card.desc" @blur="updateCard(card)" class="table-input" placeholder="添加描述..." /></td>
            <td><input v-model="card.logo_url" @blur="updateCard(card)" class="table-input" placeholder="默认自动获取 Favicon" /></td>
            <td style="text-align: center;">
              <div class="move-btns">
                <button type="button" class="btn-move" :disabled="cIdx === 0 || !!tableFilter.trim()" title="上移" @click="moveCard(cIdx, -1)">↑</button>
                <button type="button" class="btn-move" :disabled="cIdx === filteredCards.length - 1 || !!tableFilter.trim()" title="下移" @click="moveCard(cIdx, 1)">↓</button>
              </div>
            </td>
            <td style="text-align: center;">
              <button type="button" class="btn-delete" @click="deleteCard(card.id)" title="删除卡片">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="empty-table">
        当前分类下暂无导航卡片，请在上方表单中添加。
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import {
  getMenus,
  getCards,
  addCard as apiAddCard,
  updateCard as apiUpdateCard,
  deleteCard as apiDeleteCard,
  reorderCards as apiReorderCards
} from '../../api';

const menus = ref([]);
const cards = ref([]);
const selectedMenuId = ref();
const selectedSubMenuId = ref('');
const tableFilter = ref('');

const newCardTitle = ref('');
const newCardUrl = ref('');
const newCardDesc = ref('');
const newCardLogo = ref('');

const dragCardIndex = ref(null);
const dragOverCardIndex = ref(null);

const currentSubMenus = computed(() => {
  if (!selectedMenuId.value) return [];
  const menu = menus.value.find(m => m.id === selectedMenuId.value);
  return menu?.subMenus || [];
});

const filteredCards = computed(() => {
  const q = tableFilter.value.trim().toLowerCase();
  if (!q) return cards.value;
  return cards.value.filter(c =>
    (c.title && c.title.toLowerCase().includes(q)) ||
    (c.url && c.url.toLowerCase().includes(q)) ||
    (c.desc && c.desc.toLowerCase().includes(q))
  );
});

onMounted(async () => {
  const res = await getMenus();
  menus.value = res.data;
  if (menus.value.length) {
    selectedMenuId.value = menus.value[0].id;
    selectedSubMenuId.value = '';
  }
});

watch(selectedMenuId, () => {
  selectedSubMenuId.value = '';
  loadCards();
});

watch(selectedSubMenuId, loadCards);

function onMenuChange() {
  selectedSubMenuId.value = '';
}

function onSubMenuChange() {
  loadCards();
}

async function loadCards() {
  if (!selectedMenuId.value) return;
  const res = await getCards(selectedMenuId.value, selectedSubMenuId.value || null);
  cards.value = res.data;
}

function getPreviewLogo(card) {
  if (card.display_logo) return card.display_logo;
  if (card.logo_url) return card.logo_url;
  try {
    return new URL(card.url).origin + '/favicon.ico';
  } catch {
    return '/default-favicon.png';
  }
}

function onCardDragStart(e, idx) {
  if (tableFilter.value.trim()) return;
  dragCardIndex.value = idx;
  e.dataTransfer.effectAllowed = 'move';
}

function onCardDragOver(e, idx) {
  if (dragCardIndex.value === null) return;
  dragOverCardIndex.value = idx;
}

async function onCardDrop(e, targetIdx) {
  if (dragCardIndex.value === null || dragCardIndex.value === targetIdx) {
    onCardDragEnd();
    return;
  }
  const list = [...cards.value];
  const [moved] = list.splice(dragCardIndex.value, 1);
  list.splice(targetIdx, 0, moved);
  list.forEach((c, i) => { c.order = i + 1; });
  cards.value = list;
  onCardDragEnd();
  await persistCardOrder();
}

function onCardDragEnd() {
  dragCardIndex.value = null;
  dragOverCardIndex.value = null;
}

async function moveCard(idx, delta) {
  const target = idx + delta;
  if (target < 0 || target >= cards.value.length) return;
  const list = [...cards.value];
  const [moved] = list.splice(idx, 1);
  list.splice(target, 0, moved);
  list.forEach((c, i) => { c.order = i + 1; });
  cards.value = list;
  await persistCardOrder();
}

async function persistCardOrder() {
  const items = cards.value.map((c, i) => ({ id: c.id, order: i + 1 }));
  await apiReorderCards(items);
}

async function addCard() {
  if (!newCardTitle.value.trim() || !newCardUrl.value.trim()) return;
  await apiAddCard({
    menu_id: selectedMenuId.value,
    sub_menu_id: selectedSubMenuId.value || null,
    title: newCardTitle.value.trim(),
    url: newCardUrl.value.trim(),
    desc: newCardDesc.value.trim(),
    logo_url: newCardLogo.value.trim(),
    order: cards.value.length + 1
  });
  newCardTitle.value = '';
  newCardUrl.value = '';
  newCardDesc.value = '';
  newCardLogo.value = '';
  await loadCards();
}

async function updateCard(card) {
  await apiUpdateCard(card.id, {
    menu_id: selectedMenuId.value,
    sub_menu_id: selectedSubMenuId.value || null,
    title: card.title,
    url: card.url,
    logo_url: card.logo_url,
    desc: card.desc,
    order: card.order
  });
  await loadCards();
}

async function deleteCard(id) {
  await apiDeleteCard(id);
  await loadCards();
}
</script>

<style scoped>
.card-manage {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.card-header {
  background: #fff;
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.page-title {
  margin: 0 0 0.25rem 0;
  font-size: 1.2rem;
  color: #0f172a;
}

.page-sub {
  margin: 0;
  font-size: 0.86rem;
  color: #64748b;
}

.filter-group {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.card-add-bar {
  display: grid;
  grid-template-columns: 1.2fr 1.8fr 1.5fr 1.5fr auto;
  gap: 0.65rem;
  padding-top: 1rem;
  border-top: 1px solid #f1f5f9;
}

.input {
  padding: 0.6rem 0.85rem;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  background: #fff;
  color: #0f172a;
  font-size: 0.88rem;
  outline: none;
}

.input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
}

.btn-primary {
  padding: 0.6rem 1.2rem;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  font-weight: 600;
  font-size: 0.88rem;
  cursor: pointer;
  white-space: nowrap;
}

.card-table-card {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  overflow-x: auto;
}

.card-table {
  width: 100%;
  border-collapse: collapse;
}

.card-table th,
.card-table td {
  padding: 0.7rem 0.85rem;
  text-align: left;
  border-bottom: 1px solid #f1f5f9;
}

.card-table th {
  background: #f8fafc;
  font-size: 0.82rem;
  font-weight: 600;
  color: #475569;
}

.card-table tr.is-dragging {
  opacity: 0.45;
  background: #f1f5f9;
}

.card-table tr.is-drag-over td {
  border-top: 2px solid #6366f1;
  background: #eef2ff;
}

.drag-cell {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.drag-handle {
  cursor: grab;
  color: #94a3b8;
  display: inline-flex;
  align-items: center;
  padding: 0.2rem;
  border-radius: 5px;
}

.drag-handle:hover {
  color: #4f46e5;
  background: #eef2ff;
}

.order-tag {
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
}

.move-btns {
  display: inline-flex;
  gap: 0.25rem;
}

.btn-move {
  width: 26px;
  height: 26px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #475569;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
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

.logo-preview {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.logo-preview img {
  width: 22px;
  height: 22px;
  object-fit: contain;
}

.table-input {
  width: 100%;
  padding: 0.45rem 0.6rem;
  border-radius: 8px;
  border: 1px solid transparent;
  background: transparent;
  color: #0f172a;
  font-size: 0.86rem;
}

.table-input:hover,
.table-input:focus {
  border-color: #cbd5e1;
  background: #f8fafc;
  outline: none;
}

.font-medium {
  font-weight: 600;
}

.btn-delete {
  padding: 0.35rem 0.65rem;
  border-radius: 8px;
  border: 1px solid #fecaca;
  background: #fef2f2;
  color: #dc2626;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
}

.btn-delete:hover {
  background: #dc2626;
  color: #fff;
}

.empty-table {
  padding: 3rem;
  text-align: center;
  color: #94a3b8;
  font-size: 0.92rem;
}

@media (max-width: 960px) {
  .card-add-bar {
    grid-template-columns: 1fr;
  }
}
</style>
