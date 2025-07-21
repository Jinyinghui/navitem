<template>
  <div class="home-container">
    <MenuBar :menus="menus" :activeId="activeMenu?.id" @select="selectMenu"/>
    
    <div class="search-section">
      <div class="search-container">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Google 搜索..." 
          class="search-input"
          @keyup.enter="handleSearch"
        />
        <button @click="handleSearch" class="search-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
    
    <!-- 左侧广告条 -->
    <div v-if="leftAds.length" class="ad-space-fixed left-ad-fixed">
      <a v-for="ad in leftAds" :key="ad.id" :href="ad.url" target="_blank">
        <img :src="ad.img" alt="广告" />
      </a>
    </div>
    <!-- 右侧广告条 -->
    <div v-if="rightAds.length" class="ad-space-fixed right-ad-fixed">
      <a v-for="ad in rightAds" :key="ad.id" :href="ad.url" target="_blank">
        <img :src="ad.img" alt="广告" />
      </a>
    </div>
    
    <CardGrid :cards="filteredCards"/>
    
    <footer class="footer">
      <div class="footer-content">
        <button @click="showFriendLinks = true" class="friend-link-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>
          友情链接
        </button>
        <p class="copyright">Copyright © 2025 Nav-Item | <a href="https://github.com/eooce/Nav-Item" target="_blank" class="footer-link">Powered by eooce</a></p>
      </div>
    </footer>

    <!-- 友情链接弹窗 -->
    <div v-if="showFriendLinks" class="modal-overlay" @click="showFriendLinks = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>友情链接</h3>
          <button @click="showFriendLinks = false" class="close-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="friend-links-grid">
            <a 
              v-for="friend in friendLinks" 
              :key="friend.id" 
              :href="friend.url" 
              target="_blank" 
              class="friend-link-card"
            >
              <div class="friend-link-logo">
                <img 
                  v-if="friend.logo" 
                  :src="friend.logo" 
                  :alt="friend.title"
                  @error="handleLogoError"
                />
                <div v-else class="friend-link-placeholder">
                  {{ friend.title.charAt(0) }}
                </div>
              </div>
              <div class="friend-link-info">
                <h4>{{ friend.title }}</h4>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { getMenus, getCards, getAds, getFriends } from '../api';
import MenuBar from '../components/MenuBar.vue';
import CardGrid from '../components/CardGrid.vue';

const menus = ref([]);
const activeMenu = ref(null);
const cards = ref([]);
const searchQuery = ref('');
const leftAds = ref([]);
const rightAds = ref([]);
const showFriendLinks = ref(false);
const friendLinks = ref([]);

const filteredCards = computed(() => {
  if (!searchQuery.value) return cards.value;
  return cards.value.filter(card => 
    card.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    card.url.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

onMounted(async () => {
  const res = await getMenus();
  menus.value = res.data;
  if (menus.value.length) {
    activeMenu.value = menus.value[0];
    loadCards();
  }
  // 加载广告
  const adRes = await getAds();
  leftAds.value = adRes.data.filter(ad => ad.position === 'left');
  rightAds.value = adRes.data.filter(ad => ad.position === 'right');
  
  // 加载友情链接
  const friendRes = await getFriends();
  friendLinks.value = friendRes.data;
});

async function selectMenu(menu) {
  activeMenu.value = menu;
  loadCards();
}

async function loadCards() {
  if (!activeMenu.value) return;
  const res = await getCards(activeMenu.value.id);
  cards.value = res.data;
}

function handleSearch() {
  if (searchQuery.value.trim()) {
    // 如果搜索框有内容，可以跳转到Google搜索
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery.value)}`;
    window.open(searchUrl, '_blank');
  }
}

function handleLogoError(event) {
  event.target.style.display = 'none';
  event.target.nextElementSibling.style.display = 'flex';
}
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background-image: url('https://files.unn.pp.ua/download/pictures%2Fbackground.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  display: flex;
  flex-direction: column;
  padding: 1rem 1rem;
  padding-bottom: 0 !important;
  position: relative;
}

.home-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 1;
}

.search-section {
  display: flex;
  justify-content: center;
  padding: 3rem 0;
  position: relative;
  z-index: 2;
}

.search-container {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  padding: 0.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  max-width: 500px;
  width: 100%;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  padding: .1rem .5rem;
  font-size: 1.2rem;
  color: #000000;
  outline: none;
}

.search-input::placeholder {
  color: #666;
}

.search-btn {
  background: #4285f4;
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
  margin-right: 0.5rem;
}

.search-btn:hover {
  background: #3367d6;
}

.content-wrapper {
  display: flex;
  max-width: 1400px;
  margin: 0 auto;
  gap: 2rem;
  position: relative;
  z-index: 2;
  flex: 1;
  justify-content: space-between;
}

.main-content {
  flex: 1;
  min-width: 0;
}

.ad-space {
  width: 90px;
  min-width: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 0;
  background: transparent;
  margin: 0;
}
.ad-space a {
  width: 100%;
  display: block;
}
.ad-space img {
  width: 100%;
  max-width: 90px;
  max-height: 160px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.12);
  background: #fff;
  object-fit: contain;
  margin: 0 auto;
}

.ad-placeholder {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.6);
  padding: 2rem 1rem;
  text-align: center;
  font-size: 14px;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.footer {
  margin-top: auto;
  text-align: center;
  padding-top: 1rem;
  padding-bottom: 2rem;
  position: relative;
  z-index: 2;
}

.footer-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 50px;
}

.friend-link-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  padding: 0;
}

.friend-link-btn:hover {
  color: #1976d2;
  transform: translateY(-1px);
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.modal-content {
  background: #8585859c;
  border-radius: 16px;
  width: 60rem;
  height: 30rem;
  max-width: 95vw;
  max-height: 95vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  border-bottom: 1px solid #e5e7eb;
  background: #d3d6d8;
}

.modal-header h3 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #111827;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  color: #6b7280;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #cf1313;
}

.modal-body {
  flex: 1;
  padding: 32px;
  overflow-y: auto;
}

.friend-links-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
}
@media (max-width: 768px) {
  .friend-links-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.friend-link-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 6px;
  background: #cfd3d661;
  border-radius: 15px;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s ease;
  border: 1px solid #cfd3d661;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.friend-link-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  background: #fff;
}

.friend-link-logo {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}

.friend-link-logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.friend-link-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e5e7eb;
  color: #6b7280;
  font-size: 18px;
  font-weight: 600;
  border-radius: 8px;
}

.friend-link-info h4 {
  margin: 0;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  text-align: center;
  line-height: 1.3;
  word-break: break-all;
}

.copyright {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  margin: 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}
.footer-link {
  color: #ffffffcc;
  text-decoration: none;
  transition: color 0.2s;
}
.footer-link:hover {
  color: #1976d2;
}

:deep(.menu-bar) {
  position: relative;
  z-index: 2;
}

:deep(.card-grid) {
  position: relative;
  z-index: 2;
}

.ad-space-fixed {
  position: fixed;
  top: 120px;
  z-index: 10;
  width: 90px;
  min-width: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 0;
  background: transparent;
  margin: 0;
}
.left-ad-fixed {
  left: 0;
}
.right-ad-fixed {
  right: 0;
}
.ad-space-fixed a {
  width: 100%;
  display: block;
}
.ad-space-fixed img {
  width: 100%;
  max-width: 90px;
  max-height: 160px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.12);
  background: #fff;
  object-fit: contain;
  margin: 0 auto;
}

@media (max-width: 1200px) {
  .content-wrapper {
    flex-direction: column;
    gap: 1rem;
  }
  
  .ad-space {
    width: 100%;
    height: 100px;
  }
  
  .ad-placeholder {
    height: 80px;
  }
}

@media (max-width: 768px) {
  .home-container {
    padding: 1rem 0.5rem;
  }
  
  .content-wrapper {
    gap: 0.5rem;
  }
  
  .ad-space {
    height: 60px;
  }
  
  .ad-placeholder {
    height: 50px;
    font-size: 12px;
    padding: 1rem 0.5rem;
  }
  .footer {
    padding-top: 2rem;
  }
  .friend-link-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.8);
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.7rem;
    padding: 0;
  }
  .copyright {
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.7rem;
    margin: 0;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  }
  .footer-content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
  }
}
</style> 