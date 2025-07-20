<template>
  <div class="menu-manage">
    <div class="menu-header">
      <div class="menu-add">
        <input v-model="newMenuName" placeholder="新栏目名" class="input" />
        <button class="btn" @click="addMenu">添加栏目</button>
      </div>
    </div>
    <div class="menu-card">
      <table class="menu-table">
        <thead>
          <tr><th>栏目名称</th><th>排序</th><th>操作</th></tr>
        </thead>
        <tbody>
          <tr v-for="menu in menus" :key="menu.id">
            <td><input v-model="menu.name" @blur="updateMenu(menu)" class="input" /></td>
            <td><input v-model.number="menu.order" type="number" @blur="updateMenu(menu)" class="input order-input" /></td>
            <td><button class="btn btn-danger" @click="deleteMenu(menu.id)">删除</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getMenus, addMenu as apiAddMenu, updateMenu as apiUpdateMenu, deleteMenu as apiDeleteMenu } from '../../api';

const menus = ref([]);
const newMenuName = ref('');

onMounted(loadMenus);

async function loadMenus() {
  const res = await getMenus();
  menus.value = res.data;
}
async function addMenu() {
  if (!newMenuName.value) return;
  await apiAddMenu({ name: newMenuName.value });
  newMenuName.value = '';
  loadMenus();
}
async function updateMenu(menu) {
  await apiUpdateMenu(menu.id, { name: menu.name, order: menu.order });
  loadMenus();
}
async function deleteMenu(id) {
  await apiDeleteMenu(id);
  loadMenus();
}
</script>

<style scoped>
.menu-manage {
  max-width: 1400px;
  width: 90%;
  margin: 0 auto;
}
.page-title {
  text-align: center;
  margin-left: 100px;
  font-size: 1.6rem;
  font-weight: 500;
  margin: 32px 0 32px 0;
  letter-spacing: 2px;
  color: #222;
}
.menu-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 24px;
}
.menu-add {
  margin: 0 auto;
  display: flex;
  gap: 8px;
}
.menu-card {
  width: 95%;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  padding: 32px 24px;
}
.input {
  padding: 12px 12px;
  border-radius: 10px;
  border: 1px solid #d0d7e2;
  background: #fff;
  color: #222;
  margin-right: 8px;
}
.input:focus {
  outline: 2px solid #2566d8;
}
.order-input {
  width: 60px;
}
.btn {
  background: #2566d8;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 18px;
  cursor: pointer;
  margin-right: 8px;
  transition: background 0.2s;
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
.menu-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  color: #222;
  border-radius: 8px;
  overflow: hidden;
}
.menu-table th, .menu-table td {
  padding: 10px 14px;
  border: 1px solid #e3e6ef;
}
.menu-table th {
  background: #f5f7fa;
  color: #222;
  font-weight: bold;
}
.menu-table td input {
  font-size: 1rem;
  width: 95%;
  background: #f9f9f9;
  color: #222;
  border: 1px solid #d0d7e2;
  border-radius: 4px;
  padding: 10px 10px;
}
.menu-table th:last-child,
.menu-table td:last-child {
  text-align: center;
  vertical-align: middle;
}
</style> 