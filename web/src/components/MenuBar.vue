<template>
  <nav class="menu-bar">
    <button v-for="menu in menus" :key="menu.id" @click="$emit('select', menu)" :class="{active: menu.id === activeId}">
      {{ menu.name }}
    </button>
  </nav>
</template>

<script setup>
const props = defineProps({ menus: Array, activeId: Number });
</script>

<style scoped>
.menu-bar {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
  padding: 0 1rem;
}

.menu-bar button {
  background: transparent;
  border: none;
  color: #fff;
  font-size: 16px;
  font-weight: 500;
  padding: 0.8rem 1.5rem;
  border-radius: 20px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  box-shadow: none;
}

.menu-bar button:hover,
.menu-bar button.active {
  background: #5899ff00;
  color: #2566d8;
}

@media (max-width: 768px) {
  .menu-bar {
    gap: 0.5rem;
  }
  
  .menu-bar button {
    font-size: 14px;
    padding: 0.6rem 1.2rem;
  }
}
</style> 