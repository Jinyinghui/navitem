<template>
  <div class="card-grid-wrapper">
    <div
      v-if="cards && cards.length > 0"
      class="card-grid"
      :class="[
        viewMode === 'compact' ? 'grid-compact' : 'grid-detailed',
        theme === 'light' ? 'light-mode' : '',
        animationClass
      ]"
    >
      <a
        v-for="(card, index) in cards"
        :key="card.id || index"
        :href="card.url"
        target="_blank"
        rel="noopener noreferrer"
        class="nav-card"
        :data-card-id="card.id"
        :style="getCardStyle(index)"
        :title="getTooltip(card)"
      >
        <div class="card-icon-box" :style="getFallbackGradient(card.title)">
          <img
            v-if="!failedLogos[card.id || card.url]"
            class="card-icon-img"
            :src="getLogo(card)"
            :alt="card.title"
            loading="lazy"
            @error="onImgError(card)"
          />
          <span v-else class="card-icon-letter">
            {{ getFirstChar(card.title) }}
          </span>
        </div>

        <div class="card-body">
          <div class="card-title-row">
            <span class="card-title">{{ card.title }}</span>
            <svg
              v-if="viewMode === 'detailed'"
              class="card-arrow"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M7 17L17 7M7 7h10v10" />
            </svg>
          </div>
          <p v-if="viewMode === 'detailed'" class="card-desc">
            {{ card.desc || getDomain(card.url) }}
          </p>
        </div>
      </a>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state" :class="{ 'light-mode': theme === 'light' }">
      <div class="empty-icon">
        <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </div>
      <h3>暂无匹配的导航卡片</h3>
      <p>试试更换搜索关键词，或切换其他分类栏目查看</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, nextTick } from 'vue';

const props = defineProps({
  cards: { type: Array, default: () => [] },
  viewMode: { type: String, default: 'detailed' },
  theme: { type: String, default: 'dark' }
});

const animationClass = ref('');
const failedLogos = reactive({});

watch(
  () => props.cards,
  (newCards) => {
    if (newCards && newCards.length > 0) {
      nextTick(() => {
        animationClass.value = 'animate-stagger';
        setTimeout(() => {
          animationClass.value = '';
        }, 700);
      });
    }
  },
  { deep: true }
);

function getCardStyle(index) {
  if (!animationClass.value) return {};
  const delay = Math.min(index * 0.025, 0.45);
  return { animationDelay: `${delay}s` };
}

function getLogo(card) {
  if (card.display_logo) return card.display_logo;
  if (card.custom_logo_path) return '/uploads/' + card.custom_logo_path;
  if (card.logo_url) return card.logo_url;
  try {
    const url = new URL(card.url);
    return url.origin + '/favicon.ico';
  } catch {
    return '/default-favicon.png';
  }
}

function onImgError(card) {
  const key = card.id || card.url;
  failedLogos[key] = true;
}

function getFirstChar(title) {
  if (!title) return 'N';
  return title.trim().charAt(0).toUpperCase();
}

function getFallbackGradient(title) {
  const palettes = [
    'linear-gradient(135deg, rgba(99,102,241,0.22), rgba(139,92,246,0.22))',
    'linear-gradient(135deg, rgba(14,165,233,0.22), rgba(59,130,246,0.22))',
    'linear-gradient(135deg, rgba(16,185,129,0.22), rgba(5,150,105,0.22))',
    'linear-gradient(135deg, rgba(244,63,94,0.22), rgba(236,72,153,0.22))',
    'linear-gradient(135deg, rgba(245,158,11,0.22), rgba(217,119,6,0.22))'
  ];
  const code = title ? title.charCodeAt(0) : 0;
  return { background: palettes[code % palettes.length] };
}

function getDomain(urlStr) {
  try {
    return new URL(urlStr).hostname.replace(/^www\./, '');
  } catch {
    return urlStr;
  }
}

function getTooltip(card) {
  return card.desc ? `${card.title} - ${card.desc}\n${card.url}` : `${card.title}\n${card.url}`;
}
</script>

<style scoped>
.card-grid-wrapper {
  max-width: 1240px;
  width: 100%;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.card-grid {
  display: grid;
  gap: 1rem;
  width: 100%;
}

/* 详情卡片模式 */
.grid-detailed {
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
}

/* 紧凑图标模式 */
.grid-compact {
  grid-template-columns: repeat(auto-fill, minmax(135px, 1fr));
  gap: 0.85rem;
}

.nav-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.9rem;
  padding: 1rem 1.1rem;
  border-radius: 16px;
  background: rgba(30, 41, 59, 0.55);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  text-decoration: none;
  color: #f8fafc;
  transition: all 0.25s cubic-bezier(0.22, 1, 0.36, 1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.light-mode .nav-card {
  background: rgba(255, 255, 255, 0.82);
  border-color: rgba(15, 23, 42, 0.08);
  color: #0f172a;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.05);
}

.nav-card:hover {
  transform: translateY(-4px);
  background: rgba(30, 41, 59, 0.82);
  border-color: rgba(99, 102, 241, 0.45);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.28), 0 0 0 1px rgba(99, 102, 241, 0.25);
}

.light-mode .nav-card:hover {
  background: #ffffff;
  border-color: rgba(99, 102, 241, 0.45);
  box-shadow: 0 12px 28px rgba(99, 102, 241, 0.14);
}

.grid-compact .nav-card {
  flex-direction: column;
  justify-content: center;
  text-align: center;
  padding: 1rem 0.65rem;
  gap: 0.55rem;
  min-height: 96px;
}

.card-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.light-mode .card-icon-box {
  border-color: rgba(15, 23, 42, 0.06);
}

.grid-compact .card-icon-box {
  width: 38px;
  height: 38px;
  border-radius: 10px;
}

.card-icon-img {
  width: 26px;
  height: 26px;
  object-fit: contain;
  transition: transform 0.25s ease;
}

.nav-card:hover .card-icon-img {
  transform: scale(1.1);
}

.card-icon-letter {
  font-size: 1.1rem;
  font-weight: 700;
  color: #818cf8;
}

.light-mode .card-icon-letter {
  color: #4f46e5;
}

.card-body {
  flex: 1;
  min-width: 0;
}

.card-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.4rem;
}

.grid-compact .card-title-row {
  justify-content: center;
}

.card-title {
  font-size: 0.95rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.35;
}

.grid-compact .card-title {
  font-size: 0.85rem;
  white-space: normal;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}

.card-arrow {
  color: rgba(148, 163, 184, 0.6);
  flex-shrink: 0;
  opacity: 0;
  transform: translate(-4px, 4px);
  transition: all 0.2s ease;
}

.nav-card:hover .card-arrow {
  opacity: 1;
  color: #818cf8;
  transform: translate(0, 0);
}

.light-mode .nav-card:hover .card-arrow {
  color: #4f46e5;
}

.card-desc {
  margin: 0.25rem 0 0 0;
  font-size: 0.8rem;
  color: rgba(148, 163, 184, 0.88);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
}

.light-mode .card-desc {
  color: #64748b;
}

/* 动画效果 */
.animate-stagger .nav-card {
  animation: fadeUpIn 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  opacity: 0;
}

@keyframes fadeUpIn {
  from {
    opacity: 0;
    transform: translateY(14px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.empty-state {
  text-align: center;
  padding: 4rem 1.5rem;
  background: rgba(30, 41, 59, 0.4);
  border: 1px dashed rgba(255, 255, 255, 0.14);
  border-radius: 20px;
  color: #94a3b8;
  max-width: 520px;
  margin: 2rem auto;
}

.empty-state.light-mode {
  background: rgba(255, 255, 255, 0.65);
  border-color: rgba(15, 23, 42, 0.15);
  color: #64748b;
}

.empty-icon {
  margin-bottom: 0.75rem;
  color: #6366f1;
}

.empty-state h3 {
  margin: 0 0 0.4rem 0;
  color: #f8fafc;
  font-size: 1.1rem;
}

.empty-state.light-mode h3 {
  color: #0f172a;
}

.empty-state p {
  margin: 0;
  font-size: 0.9rem;
}

@media (max-width: 640px) {
  .card-grid-wrapper {
    padding: 0 1rem;
  }
  .grid-detailed {
    grid-template-columns: repeat(auto-fill, minmax(165px, 1fr));
    gap: 0.75rem;
  }
  .nav-card {
    padding: 0.85rem;
  }
}
</style>
