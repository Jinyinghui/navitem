<template>
  <div class="card-manage">
    <div class="card-header">
      <div class="card-add">
        <select v-model="selectedMenuId" class="input">
          <option v-for="menu in menus" :value="menu.id" :key="menu.id">{{ menu.name }}</option>
        </select>
        <input v-model="newCardTitle" placeholder="卡片标题" class="input" />
        <input v-model="newCardUrl" placeholder="卡片链接" class="input" />
        <input v-model="newCardLogo" placeholder="logo链接(可选)" class="input" />
        <button class="btn" @click="addCard">添加卡片</button>
      </div>
    </div>
    <div class="card-card">
      <table class="card-table">
        <thead>
          <tr>
            <th>标题</th>
            <th>网址</th>
            <th>Logo链接</th>
            <th>描述</th>
            <th>排序</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="card in cards" :key="card.id">
            <td><input v-model="card.title" @blur="updateCard(card)" class="input" /></td>
            <td><input v-model="card.url" @blur="updateCard(card)" class="input" /></td>
            <td><input v-model="card.logo_url" @blur="updateCard(card)" class="input" placeholder="logo链接(可选)" /></td>
            <td><input v-model="card.desc" @blur="updateCard(card)" class="input" placeholder="描述（可选）" /></td>
            <td><input v-model.number="card.order" type="number" @blur="updateCard(card)" class="input order-input" /></td>
            <td><button class="btn btn-danger" @click="deleteCard(card.id)">删除</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { getMenus, getCards, addCard as apiAddCard, updateCard as apiUpdateCard, deleteCard as apiDeleteCard } from '../../api';

const menus = ref([]);
const cards = ref([]);
const selectedMenuId = ref();
const newCardTitle = ref('');
const newCardUrl = ref('');
const newCardLogo = ref('');

onMounted(async () => {
  const res = await getMenus();
  menus.value = res.data;
  if (menus.value.length) selectedMenuId.value = menus.value[0].id;
});

watch(selectedMenuId, loadCards);

async function loadCards() {
  if (!selectedMenuId.value) return;
  const res = await getCards(selectedMenuId.value);
  cards.value = res.data;
}
async function addCard() {
  if (!newCardTitle.value || !newCardUrl.value) return;
  await apiAddCard({ menu_id: selectedMenuId.value, title: newCardTitle.value, url: newCardUrl.value, logo_url: newCardLogo.value });
  newCardTitle.value = '';
  newCardUrl.value = '';
  newCardLogo.value = '';
  loadCards();
}
async function updateCard(card) {
  await apiUpdateCard(card.id, {
    title: card.title,
    url: card.url,
    logo_url: card.logo_url,
    desc: card.desc,
    order: card.order
  });
  loadCards();
}
async function deleteCard(id) {
  await apiDeleteCard(id);
  loadCards();
}
</script>

<style scoped>
.card-manage {
  max-width: 1400px;
  width: 95%;
  margin: 0 auto;
}
.page-title {
  text-align: center;
  font-size: 2rem;
  font-weight: bold;
  margin: 32px 0 32px 0;
  letter-spacing: 2px;
  color: #222;
}
.card-header {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 24px;
}
.card-add {
  margin: 0 auto;
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
  width: 100%;
}
.card-card {
  width: 95%;
  margin: 0 auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  padding: 32px 24px;
}
.input, .card-add select, .card-add .btn {
  height: 38px !important;
  font-size: 1rem;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid #d0d7e2;
  margin-right: 8px;
  box-sizing: border-box;
}
.input:focus {
  outline: 2px solid #2566d8;
}
.input {
  width: 12rem;
}
.btn {
  background: #2566d8;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0 18px;
  cursor: pointer;
  margin-right: 8px;
  transition: background 0.2s;
  height: 38px;
  font-size: 1rem;
}
.btn:hover {
  background: #174ea6;
}
.btn-danger {
  background: #e74c3c;
  display: inline-block;
  margin: 0 auto;
}
.btn-danger:hover {
  background: #c0392b;
}
.btn.btn-danger {
  display: inline-block;
  font-size: 0.8rem;
  writing-mode: initial;
  letter-spacing: 1px;
  padding: 8px 18px;
  text-align: center;
  white-space: nowrap;
}
.card-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  color: #222;
  border-radius: 8px;
  overflow: hidden;
  margin: 0 auto;
}
.card-table th, .card-table td {
  padding: 8px 12px;
  border: 1px solid #e3e6ef;
  height: 32px;
}
.card-table th {
  background: #f5f7fa;
  color: #222;
  font-weight: bold;
}
.card-table td input {
  width: 100%;
  background: #f9f9f9;
  color: #222;
  border: 1px solid #d0d7e2;
  border-radius: 4px;
  padding: 2px 8px;
  height: 28px;
  font-size: 1rem;
}
.card-table th:nth-last-child(2),
.card-table td:nth-last-child(2),
.card-table th:last-child,
.card-table td:last-child {
  width: 80px;
  min-width: 80px;
  max-width: 80px;
  text-align: center;
}
@media (max-width: 768px) {
  .menu-table td input{
    width: 80%;
  }
  .card-manage {
    width: 100%;
    padding: 0 2vw;
  }
  .card-header, .card-add {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
    width: 95%;
  }
  .card-card {
    width: 92%;
    padding: 12px 2vw;
  }
  .card-table {
    display: block;
    width: 100%;
    overflow-x: auto;
    font-size: 14px;
  }
  .card-table thead, .card-table tbody, .card-table tr {
    display: table;
    width: 100%;
    table-layout: fixed;
  }
  .card-table th, .card-table td {
    padding: 8px 6px;
    font-size: 13px;
  }
  .input, .card-add select, .card-add .btn {
    width: 100%;
    min-width: 0;
    margin-right: 0;
    font-size: 14px;
    padding: 8px 8px;
    height: 32px !important;
  }
  .order-input {
    width: 50px;
  }
  .btn {
    width: 100%;
    margin-right: 0;
    padding: 8px 0;
    font-size: 14px;
  }
}
</style> 