<template>
  <div class="card-grid">
    <div v-for="card in cards" :key="card.id" class="link-item">
      <a :href="card.url" target="_blank"
         :title="getTooltip(card)">
        <img class="link-icon" :src="getLogo(card)" :alt="card.title" @error="onImgError($event, card)">
        <span class="link-text">{{ card.title }}</span>
      </a>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({ cards: Array });
function getLogo(card) {
  if (card.custom_logo_path) return 'http://localhost:3000/uploads/' + card.custom_logo_path;
  if (card.logo_url) return card.logo_url;
  // 默认 favicon
  try {
    const url = new URL(card.url);
    return url.origin + '/favicon.ico';
  } catch {
    return '/default-favicon.png';
  }
}
function onImgError(e, card) {
  e.target.src = '/default-favicon.png';
}
function getTooltip(card) {
  let tip = '';
  if (card.desc) tip += card.desc + '\n';
  tip += card.url;
  return tip;
}
</script>

<style scoped>
.card-grid {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
  padding: 0 2rem;
  position: relative;
  z-index: 2;
}

.link-item {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 15px 20px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  text-align: center;
  height: 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.link-item:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
}

.link-item a {
  text-decoration: none;
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  justify-content: center;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.link-icon {
  width: 28px;
  height: 28px;
  margin-bottom: 8px;
  object-fit: contain;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
}

.link-text {
  font-size: 13px;
  text-align: center;
  word-break: break-word;
  max-width: 100%;
  font-weight: 500;
  line-height: 1.2;
}

@media (max-width: 1200px) {
  .card-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    padding: 0 1rem;
  }
}

@media (max-width: 768px) {
  .card-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }
  
  .link-item {
    height: 45px;
    padding: 12px 8px;
  }
  
  .link-icon {
    width: 24px;
    height: 24px;
  }
  
  .link-text {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .card-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
}
</style> 