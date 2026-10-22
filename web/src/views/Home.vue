<template>
  <div class="relative min-h-screen flex flex-col">
    <!-- Dynamic Switchable Background Layer -->
    <div class="fixed inset-0 pointer-events-none z-0 transition-all duration-500" :style="customBgStyle" aria-hidden="true"></div>
    <div class="fixed inset-0 pointer-events-none z-0 transition-all duration-300" :style="customOverlayStyle" aria-hidden="true"></div>

    <!-- Single Toast Notification -->
    <div v-if="toastMsg" class="fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-xl border shadow-xl text-xs font-semibold bg-indigo-600 text-white border-indigo-400">
      {{ toastMsg }}
    </div>

    <!-- Quick Edit Card Modal (Rename / Edit URL / Edit Icon / Add Card) -->
    <div v-if="quickCardModal.visible" id="quickEditCardModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4" @click.self="quickCardModal.visible = false">
      <div class="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-md w-full p-6 shadow-2xl text-slate-100 space-y-4">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 class="text-base font-bold">{{ quickCardModal.isNew ? '新增导航卡片' : `快捷修改「${quickCardModal.form.title}」` }}</h3>
          <button type="button" class="w-7 h-7 rounded-lg hover:bg-slate-800 text-slate-400 flex items-center justify-center" @click="quickCardModal.visible = false">✕</button>
        </div>
        <form class="space-y-3.5" @submit.prevent="submitQuickCardEdit">
          <div>
            <label class="block text-xs font-medium text-slate-400 mb-1">卡片名称 (重命名) *</label>
            <input ref="qeTitleRef" v-model="quickCardModal.form.title" type="text" required placeholder="请输入卡片名称" class="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-400 mb-1">目标链接地址 (URL) *</label>
            <input ref="qeUrlRef" v-model="quickCardModal.form.url" type="url" required placeholder="https://..." class="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-400 mb-1">图标地址 (URL 或上传本地图标)</label>
            <div class="flex items-center gap-2">
              <div class="w-9 h-9 rounded-xl bg-indigo-500/15 border border-slate-700/60 flex items-center justify-center overflow-hidden shrink-0">
                <img v-if="quickCardModal.form.logo_url" :src="quickCardModal.form.logo_url" alt="" class="w-5 h-5 object-contain" />
                <span v-else class="text-xs font-bold text-indigo-400">{{ getFirstChar(quickCardModal.form.title) }}</span>
              </div>
              <input ref="qeLogoRef" v-model="quickCardModal.form.logo_url" type="text" placeholder="留空则自动拉取网站 Favicon" class="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 outline-none focus:border-indigo-500" />
              <label class="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer shrink-0 transition" title="从本地选择图片作为图标">
                <span>上传</span>
                <input type="file" accept="image/*" class="hidden" @change="handleQuickLogoUpload" />
              </label>
            </div>
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-400 mb-1">描述说明（可选）</label>
            <input ref="qeDescRef" v-model="quickCardModal.form.desc" type="text" placeholder="简短描述该网站用途..." class="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 outline-none focus:border-indigo-500" />
          </div>
          <div class="flex justify-end gap-2.5 pt-2 border-t border-slate-800">
            <button type="button" class="px-4 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition" @click="quickCardModal.visible = false">取消</button>
            <button type="submit" class="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-md transition">保存修改</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Home Login Modal -->
    <div v-if="loginModal.visible" id="homeLoginModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4" @click.self="loginModal.visible = false">
      <div class="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-sm w-full p-6 shadow-2xl text-slate-100 space-y-4">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h3 class="text-base font-bold">登录后使用编辑模式</h3>
            <p class="text-xs text-slate-400 mt-1">使用管理后台账号登录，成功后直接在本页进入编辑模式。</p>
          </div>
          <button type="button" class="text-slate-500 hover:text-slate-200 text-lg leading-none" @click="loginModal.visible = false">✕</button>
        </div>
        <form class="space-y-3.5" @submit.prevent="submitHomeLogin">
          <div>
            <label class="text-xs font-medium text-slate-400">用户名</label>
            <input v-model="loginModal.username" type="text" required autocomplete="username" class="mt-1 w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 outline-none focus:border-indigo-500" placeholder="请输入用户名" />
          </div>
          <div>
            <label class="text-xs font-medium text-slate-400">密码</label>
            <input v-model="loginModal.password" type="password" required autocomplete="current-password" class="mt-1 w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 outline-none focus:border-indigo-500" placeholder="请输入密码" />
          </div>
          <p v-if="loginModal.error" class="text-xs text-rose-400">{{ loginModal.error }}</p>
          <div class="flex gap-2 pt-1">
            <button type="button" class="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition" @click="loginModal.visible = false">取消</button>
            <button type="submit" :disabled="loginModal.loading" class="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold transition">{{ loginModal.loading ? '登录中…' : '登录并进入编辑' }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Quick Rename Menu Modal -->
    <div v-if="quickMenuModal.visible" id="quickRenameMenuModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4" @click.self="quickMenuModal.visible = false">
      <div class="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-sm w-full p-6 shadow-2xl text-slate-100 space-y-4">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 class="text-base font-bold">{{ quickMenuModal.title }}</h3>
          <button type="button" class="w-7 h-7 rounded-lg hover:bg-slate-800 text-slate-400 flex items-center justify-center" @click="quickMenuModal.visible = false">✕</button>
        </div>
        <form class="space-y-4" @submit.prevent="submitQuickMenuRename">
          <div>
            <label class="block text-xs font-medium text-slate-400 mb-1.5">新菜单名称 *</label>
            <input v-model="quickMenuModal.name" type="text" required placeholder="请输入菜单名称" class="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 outline-none focus:border-indigo-500" />
          </div>
          <div class="flex justify-end gap-2.5">
            <button type="button" class="px-4 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition" @click="quickMenuModal.visible = false">取消</button>
            <button type="submit" class="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition">保存</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Portal Content -->
    <div class="relative z-10 flex flex-col min-h-screen">
      <!-- Top Glass Navbar -->
      <header class="glass-nav sticky top-0 z-40 px-4 sm:px-6 py-3">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-3">
          <!-- Brand -->
          <button type="button" class="flex items-center gap-2.5 text-left group focus:outline-none" @click="resetToHome">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="3 11 22 2 13 21 11 13 3 11"/>
              </svg>
            </div>
            <div>
              <span class="text-lg font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-sky-400 bg-clip-text text-transparent">NavItem</span>
              <span class="hidden sm:inline-block ml-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/25">Modern v2.0</span>
            </div>
          </button>

          <!-- Main Category Navigation Bar (Supports Red Cross Delete in Edit Mode) -->
          <nav class="order-3 lg:order-2 w-full lg:w-auto flex items-center gap-1.5 overflow-x-auto py-2 px-2 rounded-2xl bg-slate-500/10 border border-slate-500/15" aria-label="主分类导航">
            <div v-for="menu in menus" :key="menu.id" class="relative inline-flex shrink-0">
              <button
                type="button"
                class="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap"
                :class="[
                  activeMenu && activeMenu.id === menu.id
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/30'
                    : 'hover:bg-slate-500/15 opacity-80 hover:opacity-100',
                  isEditMode ? 'edit-mode-item' : ''
                ]"
                @click="selectMenu(menu)"
              >
                {{ menu.name }}
                <span v-if="menu.subMenus && menu.subMenus.length > 0" class="ml-1 text-[10px] opacity-75">▾</span>
              </button>
              <span
                v-if="isEditMode"
                class="quick-del-badge"
                :title="`删除菜单「${menu.name}」`"
                @click.stop="handleQuickDeleteMenu(menu)"
              >✕</span>
            </div>
          </nav>

          <!-- Right Quick Actions -->
          <div class="order-2 lg:order-3 flex items-center gap-2">
            <!-- Quick Edit Toggle Button -->
            <button
              type="button"
              :class="isEditMode
                ? 'px-3 h-9 rounded-xl border border-rose-500 bg-rose-500 text-white flex items-center justify-center gap-1.5 text-xs font-bold shadow-md shadow-rose-500/25 transition'
                : 'px-3 h-9 rounded-xl border border-slate-500/20 bg-slate-500/10 hover:bg-rose-500/15 hover:border-rose-500/40 hover:text-rose-500 flex items-center justify-center gap-1.5 text-xs font-semibold transition'"
              title="开启/关闭快捷编辑模式（点击右上角红叉即可删除菜单或卡片）"
              @click="toggleEditMode"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
              <span>{{ isEditMode ? '完成' : '编辑' }}</span>
            </button>

            <!-- View Mode Toggle -->
            <button
              type="button"
              class="w-9 h-9 rounded-xl border border-slate-500/20 bg-slate-500/10 hover:bg-indigo-500/20 hover:border-indigo-500/40 flex items-center justify-center transition"
              title="切换卡片详情/紧凑视图"
              @click="toggleViewMode"
            >
              <svg v-if="viewMode === 'detailed'" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
              </svg>
              <svg v-else width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="6" rx="2"/><rect x="3" y="14" width="18" height="6" rx="2"/>
              </svg>
            </button>

            <!-- Theme Toggle -->
            <button
              type="button"
              class="px-3 h-9 rounded-xl border border-slate-500/20 bg-slate-500/10 hover:bg-indigo-500/20 hover:border-indigo-500/40 flex items-center justify-center gap-1.5 text-xs font-semibold transition"
              :title="themeButtonTitle"
              @click="handleToggleTheme"
            >
              <svg v-if="themeMode === 'light'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
              <svg v-else-if="themeMode === 'dark'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
              <span>{{ themeModeLabel }}</span>
            </button>

            <!-- Admin Entry -->
            <button
              type="button"
              class="px-3.5 h-9 rounded-xl border border-indigo-500/30 bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-400 text-xs font-semibold flex items-center gap-1.5 transition"
              title="进入后台管理系统"
              @click="goAdmin()"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
              <span>后台管理</span>
            </button>
          </div>
        </div>
      </header>

      <!-- Hero Clock, Weather Reminder & Multi-Engine Search Section -->
      <section class="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-5 flex flex-col items-center">
        <!-- Search Engine Tabs -->
<div class="w-full">
  <div class="flex flex-wrap items-center justify-center gap-1.5 mb-2.5">
                <button
                  v-for="eng in searchEngines"
                  :key="eng.id || eng.name"
                  type="button"
                  class="px-3 py-1 rounded-full text-xs transition"
                  :class="selectedEngine && (selectedEngine.id === eng.id || selectedEngine.name === eng.name)
                    ? (theme === 'light' ? 'bg-indigo-600 text-white border border-indigo-600 font-semibold shadow-sm' : 'bg-indigo-500/25 text-indigo-400 border border-indigo-500/40 font-semibold')
                    : (theme === 'light' ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-900/5 border border-transparent' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-500/10 border border-transparent')"
                  @click="selectEngine(eng)"
                >
                  {{ eng.label }}
                </button>
                <button
                  type="button"
                  class="px-2.5 py-1 rounded-full text-[11px] border border-dashed transition"
                  :class="theme === 'light'
                    ? 'text-slate-500 hover:text-indigo-600 border-slate-300 hover:border-indigo-400'
                    : 'text-slate-400 hover:text-indigo-400 border-slate-700 hover:border-indigo-500/50'"
                  title="自定义配置搜索引擎与地址"
                  @click="goAdmin('engine')"
                >
                  ⚙ 自定义引擎
                </button>
              </div>
</div>

<!-- Search Bar -->
<div class="w-full max-w-2xl glass-search rounded-2xl p-1.5 pl-4 flex items-center gap-2">
                <svg class="text-slate-400 shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                </svg>
                <input
                  ref="searchInputRef"
                  v-model="searchQuery"
                  type="text"
                  :placeholder="selectedEngine ? selectedEngine.placeholder : '输入关键词搜索...'"
                  class="w-full bg-transparent border-none outline-none text-sm sm:text-base py-2 placeholder-slate-500"
                  @keyup.enter="handleSearch"
                />
                <button
                  v-if="searchQuery"
                  type="button"
                  class="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-500/20 transition"
                  title="清空搜索"
                  @click="searchQuery = ''"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
                <kbd v-else class="hidden sm:inline-block px-2 py-0.5 text-xs font-mono rounded-md bg-slate-500/15 text-slate-400 border border-slate-500/20 select-none" title="按 / 键快速聚焦搜索">/</kbd>
                <button
                  type="button"
                  class="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-semibold shadow-md shadow-indigo-500/25 transition shrink-0"
                  @click="handleSearch"
                >
                  搜索
                </button>
              </div>

<!-- Info Rows：时钟/一言/天气 与 待办/汇率/倒计时 合并为同一网格，逐列等宽、两行等高 -->
<div class="w-full grid grid-cols-1 sm:grid-cols-3 auto-rows-fr gap-3 lg:gap-4 mt-5 select-none">
  <div class="glass-card rounded-2xl px-5 py-3 text-center sm:text-left flex flex-col justify-center">
      <div class="text-4xl sm:text-5xl font-extrabold tracking-tight">{{ currentTime }}</div>
      <div class="mt-1.5 text-xs sm:text-sm text-slate-400 font-medium">{{ currentDate }} · {{ greetingText }}</div>
    </div>
  <!-- Hitokoto Widget (时钟与天气之间) -->
  <div class="glass-card rounded-2xl px-4 py-3 min-w-0 flex flex-col justify-center">
      <div class="flex items-center gap-2">
        <span class="text-xs font-bold shrink-0">💬 一言</span>
        <span class="flex-1 text-[11px] text-slate-400 truncate text-right">—— {{ hitokoto.from }}</span>
        <button
          type="button"
          class="text-[11px] text-slate-400 hover:text-indigo-400 transition disabled:opacity-40 shrink-0"
          :disabled="hitokotoLoading"
          title="换一句"
          @click="fetchHitokoto"
        >↻ 换一句</button>
      </div>
      <p class="mt-1.5 text-xs leading-relaxed line-clamp-2 cursor-pointer" :title="hitokoto.text" @click="fetchHitokoto">{{ hitokoto.text }}</p>
    </div>
  <div class="relative">
                  <div
                    class="glass-card rounded-2xl px-4 py-2.5 flex items-center gap-3 cursor-pointer h-full w-full"
                    title="点击切换城市或使用自动定位"
                    @click.stop="showWeatherPicker = !showWeatherPicker"
                  >
                    <span class="text-2xl sm:text-3xl select-none">{{ weatherData.icon }}</span>
                    <div class="text-left">
                      <div class="flex items-center gap-1.5">
                        <span class="text-xs sm:text-sm font-bold">{{ weatherCity.name }}</span>
                        <span v-if="weatherCity.isAuto" class="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 font-semibold">定位</span>
                        <span class="text-xs sm:text-sm font-extrabold text-indigo-400">{{ weatherData.temp }}°C</span>
                        <span class="text-xs text-slate-400">{{ weatherData.desc }}</span>
                        <span class="text-[10px] text-slate-400 ml-0.5">▾</span>
                      </div>
                  
                    <div class="text-[11px] text-slate-400 mt-0.5 max-w-[230px] sm:max-w-[260px] truncate">💡 {{ weatherData.reminder }}</div></div>
                  </div>

                  <!-- Weather City Picker Popover -->
                  <div
                    v-if="showWeatherPicker"
                    id="weatherPickerPopover"
                    class="absolute right-0 left-0 sm:left-auto mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900/95 border border-slate-700/80 p-4 shadow-2xl text-slate-100 z-50 backdrop-blur-xl"
                    @click.stop
                  >
                    <div class="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-800">
                      <span class="text-xs font-bold text-slate-200">📍 天气位置与提醒设置</span>
                      <div class="flex items-center gap-1.5">
                        <button
                          type="button"
                          class="px-2.5 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-300 text-[11px] font-semibold transition"
                          @click="locateUserWeather"
                        >
                          {{ locatingWeather ? '定位中...' : '📍 自动定位' }}
                        </button>
                        <button type="button" class="w-6 h-6 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white text-xs flex items-center justify-center" @click="showWeatherPicker = false">✕</button>
                      </div>
                    </div>
                      <div class="text-[11px] text-slate-400 mb-2">热门城市快速选择：</div>
                    <div class="flex flex-wrap gap-1.5 mb-3">
                      <button
                        v-for="city in presetCities"
                        :key="city.name"
                        type="button"
                        class="px-2.5 py-1 rounded-lg border text-xs transition"
                        :class="weatherCity.name === city.name
                          ? 'bg-indigo-600 text-white border-indigo-500 font-semibold'
                          : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'"
                        @click="selectPresetCity(city)"
                      >
                        {{ city.name }}
                      </button>
                    </div>

                    <form class="flex gap-1.5 pt-2 border-t border-slate-800" @submit.prevent="searchCustomCity">
                      <input
                        v-model="customCityQuery"
                        type="text"
                        placeholder="输入城市名称（如：杭州、成都、Tokyo）..."
                        class="flex-1 px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 outline-none focus:border-indigo-500"
                      />
                      <button type="submit" class="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition shrink-0">切换</button>
                    </form>
                  </div>
                </div>

          <!-- Todo Widget -->
          <div class="glass-card rounded-2xl px-4 py-3 flex flex-col">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold">📝 待办便签</span>
              <span class="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 font-semibold">{{ pendingTodoCount }} 待办</span>
            </div>
            <ul class="mt-2 space-y-1.5 flex-1">
              <li v-for="todo in visibleTodos" :key="todo.id" class="group flex items-center gap-1.5 text-xs">
                <input type="checkbox" :checked="todo.done" class="accent-indigo-500 shrink-0 cursor-pointer" @change="toggleTodo(todo.id)" />
                <span class="flex-1 truncate" :class="todo.done ? 'line-through text-slate-500' : ''">{{ todo.text }}</span>
                <button type="button" class="text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition shrink-0" title="删除" @click="removeTodo(todo.id)">✕</button>
              </li>
              <li v-if="todos.length === 0" class="text-[11px] text-slate-500">暂无待办，添加一条吧</li>
              <li v-else-if="todos.length > 4" class="text-[11px] text-slate-500">还有 {{ todos.length - 4 }} 条…</li>
            </ul>
            <form class="mt-2" @submit.prevent="addTodo">
              <input
                v-model="newTodoText"
                type="text"
                placeholder="写点什么，回车添加"
                class="w-full px-2.5 py-1.5 rounded-xl bg-slate-500/10 border border-slate-500/20 text-xs outline-none focus:border-indigo-500"
              />
            </form>
          </div>

          <!-- Exchange Rate Widget -->
          <div class="glass-card rounded-2xl px-4 py-3 flex flex-col">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold">💱 汇率牌</span>
              <button
                type="button"
                class="text-[11px] text-slate-400 hover:text-indigo-400 transition disabled:opacity-40"
                :disabled="fxLoading"
                title="刷新汇率"
                @click="loadFxRates(true)"
              >↻ {{ fxUpdatedText || '刷新' }}</button>
            </div>
            <div class="mt-2 flex items-center gap-1.5">
              <input
                v-model="fx.amount"
                type="number"
                min="0"
                step="any"
                placeholder="金额"
                class="flex-1 min-w-0 px-2.5 py-1.5 rounded-xl bg-slate-500/10 border border-slate-500/20 text-xs outline-none focus:border-indigo-500"
                @input="saveFxPrefs"
              />
              <select v-model="fx.from" class="px-1.5 py-1.5 rounded-xl bg-slate-500/10 border border-slate-500/20 text-xs outline-none focus:border-indigo-500 shrink-0" @change="saveFxPrefs">
                <option v-for="c in fxCurrencies" :key="c" :value="c">{{ c }}</option>
              </select>
            </div>
            <div class="mt-1.5 flex items-center gap-1.5">
              <div class="flex-1 min-w-0 px-2.5 py-1.5 text-xs font-bold text-indigo-400 truncate">= {{ fxResultText }}</div>
              <button type="button" class="w-6 h-6 rounded-lg hover:bg-slate-500/15 text-slate-400 hover:text-indigo-400 text-xs flex items-center justify-center shrink-0" title="交换货币" @click="swapFx">⇅</button>
              <select v-model="fx.to" class="px-1.5 py-1.5 rounded-xl bg-slate-500/10 border border-slate-500/20 text-xs outline-none focus:border-indigo-500 shrink-0" @change="saveFxPrefs">
                <option v-for="c in fxCurrencies" :key="c" :value="c">{{ c }}</option>
              </select>
            </div>
            <div class="mt-1.5 text-[11px] text-slate-400 truncate">1 {{ fx.from }} ≈ {{ fxUnitRateText }} {{ fx.to }} · 数据 open.er-api.com</div>
          </div>

          <!-- Countdown Widget -->
          <div class="relative">
            <div
              class="glass-card rounded-2xl px-4 py-3 h-full flex flex-col cursor-pointer"
              title="点击打开日期选择器设置倒计时"
              @click.stop="toggleCountdownPicker"
            >
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold">⏳ 倒计时</span>
                <span class="text-[10px] text-slate-400">{{ countdown.date }}</span>
              </div>
              <div class="mt-1.5 flex items-baseline gap-1">
                <span class="text-3xl font-extrabold text-indigo-400">{{ countdownDaysAbs }}</span>
                <span class="text-xs text-slate-400">天</span>
              </div>
              <div class="mt-0.5 text-[11px] text-slate-400 truncate">{{ countdownStatusText }}</div>
            </div>

            <!-- Countdown Settings Popover -->
            <div
              v-if="showCountdownPicker"
              class="absolute right-0 left-0 sm:left-auto mt-2 w-72 rounded-2xl bg-slate-900/95 border border-slate-700/80 p-4 shadow-2xl text-slate-100 z-50 backdrop-blur-xl"
              @click.stop
            >
              <div class="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-800">
                <span class="text-xs font-bold text-slate-200">⏳ 倒计时设置</span>
                <button type="button" class="w-6 h-6 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white text-xs flex items-center justify-center" @click="showCountdownPicker = false">✕</button>
              </div>
              <form class="space-y-2" @submit.prevent="saveCountdown">
                <input
                  v-model="countdownDraft.name"
                  type="text"
                  placeholder="事件名称（如：春节、考试、旅行）"
                  class="w-full px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 outline-none focus:border-indigo-500"
                />
                <input
                  ref="countdownDateRef"
                  v-model="countdownDraft.date"
                  type="date"
                  readonly
                  title="点击打开日期选择器"
                  class="w-full px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 outline-none focus:border-indigo-500 cursor-pointer"
                  @click="openCountdownDatePicker"
                />
                <button type="submit" class="w-full px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition">保存</button>
              </form>
            </div>
          </div>
        </div>

        <!-- Sub-menu Capsule Filter Bar (Supports Red Cross Delete in Edit Mode) -->
        <div
          v-if="activeMenu && activeMenu.subMenus && activeMenu.subMenus.length > 0 && !isGlobalFiltering"
          class="mt-4 flex flex-wrap items-center justify-center gap-2"
        >
          <button
            type="button"
            class="px-3.5 py-1.5 rounded-full text-xs font-semibold border transition"
            :class="activeSubMenu === null
              ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
              : 'bg-slate-500/10 border-slate-500/20 text-slate-400 hover:border-indigo-500/40'"
            @click="selectSubMenu(null)"
          >
            全部 {{ activeMenu.name }}
          </button>
          <div v-for="sub in activeMenu.subMenus" :key="sub.id" class="relative inline-flex">
            <button
              type="button"
              class="px-3.5 py-1.5 rounded-full text-xs font-semibold border transition"
              :class="[
                activeSubMenu && activeSubMenu.id === sub.id
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                  : 'bg-slate-500/10 border-slate-500/20 text-slate-400 hover:border-indigo-500/40',
                isEditMode ? 'edit-mode-item' : ''
              ]"
              @click="selectSubMenu(sub)"
            >
              {{ sub.name }}
            </button>
            <span
              v-if="isEditMode"
              class="quick-del-badge"
              :title="`删除子菜单「${sub.name}」`"
              @click.stop="handleQuickDeleteSubMenu(sub)"
            >✕</span>
          </div>
        </div>

        <!-- Global Search Status Banner -->
        <div v-if="isGlobalFiltering" class="mt-4 px-4 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-xs sm:text-sm flex items-center gap-3">
          <span>全站检索 “<strong>{{ searchQuery }}</strong>” 共找到 <strong>{{ filteredCards.length }}</strong> 个书签</span>
          <button type="button" class="text-indigo-400 font-semibold hover:underline" @click="searchQuery = ''">返回栏目浏览</button>
        </div>
      </section>

      <!-- Cards Grid Section -->
      <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pb-12 pt-2">
        <div v-if="filteredCards.length === 0" class="max-w-md mx-auto my-12 p-8 rounded-2xl glass-card text-center">
          <div class="w-12 h-12 mx-auto mb-3 rounded-2xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>
          <h3 class="text-base font-bold mb-1">未找到匹配的导航卡片</h3>
          <p class="text-xs text-slate-400">试试更换搜索关键词，或者切换到其他分类栏目查看</p>
        </div>

        <div
          v-else
          :class="viewMode === 'compact'
            ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3'
            : 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'"
        >
          <a
            v-for="(card, idx) in filteredCards"
            :key="card.id"
            :href="card.url"
            target="_blank"
            rel="noopener noreferrer"
            :draggable="isEditMode"
            :title="isEditMode ? '按住可拖拽调整卡片位置' : ''"
            :style="{ animationDelay: `${Math.min(idx * 0.02, 0.35)}s` }"
            :class="[
              'relative glass-card card-anim rounded-2xl p-4 group select-none',
              isEditMode ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer',
              viewMode === 'compact' ? 'flex flex-col items-center justify-center text-center gap-2.5' : 'flex items-center gap-3.5',
              isEditMode ? 'edit-mode-item' : '',
              draggedCardId === card.id ? 'is-dragging' : '',
              dragOverCardId === card.id && draggedCardId !== card.id ? 'is-drag-over' : ''
            ]"
            @click="onCardClick($event, card)"
            @dragstart="onCardDragStart($event, card)"
            @dragover.prevent="onCardDragOver($event, card)"
            @dragleave="onCardDragLeave(card)"
            @drop.prevent="onCardDrop($event, card)"
            @dragend="onCardDragEnd"
          >
            <!-- Top-right Red Cross Delete Button in Edit Mode -->
            <button
              v-if="isEditMode"
              type="button"
              class="quick-del-badge"
              :title="`删除「${card.title}」`"
              @click.prevent.stop="handleQuickDeleteCard(card)"
            >✕</button>

            <div
              :class="viewMode === 'compact'
                ? 'w-10 h-10 rounded-xl bg-indigo-500/15 border border-slate-500/15 flex items-center justify-center overflow-hidden shrink-0'
                : 'w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-slate-500/15 flex items-center justify-center overflow-hidden shrink-0'"
            >
              <img
                v-if="getLogo(card) && !logoErrors[card.id]"
                :src="getLogo(card)"
                alt=""
                class="w-6 h-6 object-contain group-hover:scale-110 transition"
                loading="lazy"
                @error="onLogoError(card.id)"
              />
              <span v-else class="text-sm font-bold text-indigo-400">{{ getFirstChar(card.title) }}</span>
            </div>

            <span v-if="viewMode === 'compact'" class="text-xs font-semibold truncate w-full">{{ card.title }}</span>

            <div v-else class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-2">
                <span class="text-sm font-semibold truncate">{{ card.title }}</span>
                <svg class="text-slate-400 opacity-0 group-hover:opacity-100 group-hover:text-indigo-400 transition shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7M7 7h10v10"/></svg>
              </div>
              <p class="text-xs text-slate-400 truncate mt-0.5">{{ card.desc || getHostname(card.url) }}</p>
            </div>
          </a>

          <!-- Edit Mode: Add Card Tile -->
          <button
            v-if="isEditMode && !isGlobalFiltering"
            type="button"
            class="glass-card rounded-2xl p-4 flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-indigo-400 transition min-h-[76px]"
            style="border: 1.5px dashed rgba(100, 116, 139, 0.45)"
            title="在此分类新增卡片"
            @click="openQuickCardEditModal(null, 'title', true)"
          >
            <span class="text-2xl leading-none">➕</span>
            <span class="text-xs font-medium">新增卡片</span>
          </button>
        </div>
      </main>

      <!-- Clean Minimal Footer -->
      <footer class="py-5 px-4 text-center border-t border-slate-500/10 text-xs text-slate-500">
        <p>Copyright © {{ new Date().getFullYear() }} NavItem · 现代化个人导航工作台</p>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import {
  getMenus,
  updateMenu,
  deleteMenu,
  updateSubMenu,
  deleteSubMenu,
  getCards,
  getAllCards,
  addCard,
  updateCard,
  deleteCard,
  reorderCards,
  uploadLogo,
  getActiveBackground,
  getSearchEngines,
  getCurrentUser,
  login
} from '../api';
import {
  DEFAULT_BACKGROUNDS,
  DEFAULT_SEARCH_ENGINES,
  PRESET_WEATHER_CITIES,
  themeMode,
  effectiveTheme,
  syncBodyThemeClass,
  cycleTheme
} from '../defaultData';

const router = useRouter();

const menus = ref([]);
const allCards = ref([]);
const activeMenu = ref(null);
const activeSubMenu = ref(null);
const activeBg = ref(DEFAULT_BACKGROUNDS[0]);

const searchEngines = ref([...DEFAULT_SEARCH_ENGINES]);
const selectedEngine = ref(DEFAULT_SEARCH_ENGINES[0]);
const searchQuery = ref('');
const searchInputRef = ref(null);
const logoErrors = ref({});
const isEditMode = ref(false);
const toastMsg = ref('');
let activeToastTimer = null;

function showToast(msg) {
  if (activeToastTimer) {
    clearTimeout(activeToastTimer);
    activeToastTimer = null;
  }
  toastMsg.value = msg;
  activeToastTimer = setTimeout(() => {
    toastMsg.value = '';
  }, 2200);
}

// Right-Click Context Menu & Quick Edit Modals State
const quickCardModal = ref({
  visible: false,
  isNew: false,
  targetCard: null,
  form: { title: '', url: '', logo_url: '', desc: '' }
});
const quickMenuModal = ref({
  visible: false,
  type: 'menu',
  target: null,
  title: '',
  name: ''
});
const qeTitleRef = ref(null);
const qeUrlRef = ref(null);
const qeLogoRef = ref(null);
const qeDescRef = ref(null);

function openQuickCardEditModal(card, focusField = 'title', isNew = false) {
  quickCardModal.value = {
    visible: true,
    isNew,
    targetCard: isNew ? null : card,
    form: {
      title: card?.title || '',
      url: card?.url || 'https://',
      logo_url: card?.logo_url || '',
      desc: card?.desc || ''
    }
  };
  setTimeout(() => {
    if (focusField === 'url') qeUrlRef.value?.focus();
    else if (focusField === 'logo') qeLogoRef.value?.focus();
    else if (focusField === 'desc') qeDescRef.value?.focus();
    else qeTitleRef.value?.focus();
  }, 30);
}

async function handleQuickLogoUpload(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  try {
    const res = await uploadLogo(file);
    if (res.data?.url) {
      quickCardModal.value.form.logo_url = res.data.url;
      showToast('图标已上传，点击「保存修改」即可生效');
      return;
    }
  } catch (err) {}
  const reader = new FileReader();
  reader.onload = () => {
    quickCardModal.value.form.logo_url = String(reader.result || '');
    showToast('本地图标已读取，点击「保存修改」即可生效');
  };
  reader.readAsDataURL(file);
}

async function submitQuickCardEdit() {
  const f = quickCardModal.value.form;
  if (!f.title.trim() || !f.url.trim()) return;
  if (quickCardModal.value.isNew) {
    const payload = {
      menu_id: activeMenu.value?.id || 1,
      sub_menu_id: activeSubMenu.value?.id || null,
      title: f.title.trim(),
      url: f.url.trim(),
      logo_url: f.logo_url.trim(),
      desc: f.desc.trim(),
      order: allCards.value.length + 1
    };
    try {
      const res = await addCard(payload);
      allCards.value.push({ id: res.data?.id || Date.now(), ...payload });
    } catch (e) {
      allCards.value.push({ id: Date.now(), ...payload });
    }
    quickCardModal.value.visible = false;
    showToast(`已新增卡片「${f.title.trim()}」`);
  } else if (quickCardModal.value.targetCard) {
    const t = quickCardModal.value.targetCard;
    t.title = f.title.trim();
    t.url = f.url.trim();
    t.logo_url = f.logo_url.trim();
    t.display_logo = f.logo_url.trim();
    t.desc = f.desc.trim();
    try {
      await updateCard(t.id, t);
    } catch (e) {}
    quickCardModal.value.visible = false;
    showToast(`已更新卡片「${t.title}」`);
  }
}

function openQuickMenuRename(type, item) {
  quickMenuModal.value = {
    visible: true,
    type,
    target: item,
    title: type === 'sub' ? `重命名子菜单「${item.name}」` : `重命名主菜单「${item.name}」`,
    name: item.name
  };
}

async function submitQuickMenuRename() {
  const newName = quickMenuModal.value.name.trim();
  const target = quickMenuModal.value.target;
  if (!newName || !target) return;
  target.name = newName;
  try {
    if (quickMenuModal.value.type === 'menu') {
      await updateMenu(target.id, { name: newName, order: target.order });
    } else {
      await updateSubMenu(target.id, { name: newName, order: target.order });
    }
  } catch (e) {}
  quickMenuModal.value.visible = false;
  showToast(`已重命名为「${newName}」`);
}

// Theme state
const theme = effectiveTheme;
const themeModeLabel = computed(() => {
  if (themeMode.value === 'light') return '浅色';
  if (themeMode.value === 'dark') return '深色';
  return `自动(${theme.value === 'dark' ? '深' : '浅'})`;
});
const themeButtonTitle = computed(() => {
  if (themeMode.value === 'light') return '当前：浅色主题（点击切换为深色主题）';
  if (themeMode.value === 'dark') return '当前：深色主题（点击切换为跟随系统自动主题）';
  return `当前：跟随系统自动切换（当前生效：${theme.value === 'dark' ? '深色' : '浅色'}）`;
});

function handleToggleTheme() {
  const next = cycleTheme();
  const names = {
    light: '已切换为：浅色主题（前台与后台已同步）',
    dark: '已切换为：深色主题（前台与后台已同步）',
    system: `已切换为：跟随系统自动主题（当前生效：${theme.value === 'dark' ? '深色' : '浅色'}）`
  };
  showToast(names[next]);
}

// 本地先看 token 是否存在且未过期，再向服务端复核（改密后旧 token 会被服务端作废）
function hasValidLocalToken() {
  const token = localStorage.getItem('token');
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return !payload.exp || payload.exp * 1000 > Date.now();
  } catch (e) {
    return false;
  }
}

function enterEditMode() {
  isEditMode.value = true;
  showToast('已进入快捷编辑模式：单击卡片直接修改，拖拽排序，点卡片右上角红叉 ✕ 删除');
}

async function toggleEditMode() {
  if (isEditMode.value) {
    isEditMode.value = false;
    showToast('已退出快捷编辑模式');
    return;
  }
  if (!hasValidLocalToken()) {
    openLoginModal();
    return;
  }
  try {
    await getCurrentUser();
  } catch (e) {
    localStorage.removeItem('token');
    openLoginModal('登录已过期，请重新登录');
    return;
  }
  enterEditMode();
}

// ===== 首页内登录弹窗（登录后原地激活编辑模式，不跳后台）=====
const loginModal = ref({ visible: false, username: '', password: '', error: '', loading: false });

function openLoginModal(error = '') {
  loginModal.value = { visible: true, username: '', password: '', error, loading: false };
}

async function submitHomeLogin() {
  if (loginModal.value.loading) return;
  loginModal.value.loading = true;
  loginModal.value.error = '';
  try {
    const res = await login(loginModal.value.username.trim(), loginModal.value.password);
    localStorage.setItem('token', res.data.token);
    loginModal.value.visible = false;
    enterEditMode();
  } catch (e) {
    loginModal.value.error = e.response?.data?.error || '用户名或密码错误';
  } finally {
    loginModal.value.loading = false;
  }
}

async function handleQuickDeleteMenu(menu) {
  if (menus.value.length <= 1) {
    showToast('至少需要保留一个主菜单分类');
    return;
  }
  try {
    await deleteMenu(menu.id);
  } catch (e) {}
  menus.value = menus.value.filter(m => m.id !== menu.id);
  allCards.value = allCards.value.filter(c => c.menu_id !== menu.id);
  if (activeMenu.value && activeMenu.value.id === menu.id) {
    activeMenu.value = menus.value[0] || null;
    activeSubMenu.value = null;
  }
  showToast(`已删除菜单「${menu.name}」`);
}

async function handleQuickDeleteSubMenu(sub) {
  try {
    await deleteSubMenu(sub.id);
  } catch (e) {}
  if (activeMenu.value && activeMenu.value.subMenus) {
    activeMenu.value.subMenus = activeMenu.value.subMenus.filter(s => s.id !== sub.id);
  }
  allCards.value = allCards.value.filter(c => c.sub_menu_id !== sub.id);
  if (activeSubMenu.value && activeSubMenu.value.id === sub.id) {
    activeSubMenu.value = null;
  }
  showToast(`已删除子菜单「${sub.name}」`);
}

async function handleQuickDeleteCard(card) {
  try {
    await deleteCard(card.id);
  } catch (e) {}
  allCards.value = allCards.value.filter(c => c.id !== card.id);
  showToast(`已删除「${card.title}」`);
}

// Homepage Card Drag-and-Drop Reordering
const draggedCardId = ref(null);
const dragOverCardId = ref(null);
let justDraggedCard = false;

function onCardClick(e, card) {
  if (justDraggedCard) {
    e.preventDefault();
    e.stopPropagation();
    return;
  }
  // 编辑模式下单击卡片直接打开修改弹窗（不跳转网站）
  if (isEditMode.value) {
    e.preventDefault();
    openQuickCardEditModal(card, 'title', false);
  }
}

function onCardDragStart(e, card) {
  if (!isEditMode.value) {
    e.preventDefault();
    return;
  }
  draggedCardId.value = card.id;
  justDraggedCard = true;
  e.dataTransfer.effectAllowed = 'move';
  try {
    e.dataTransfer.setData('text/plain', String(card.id));
  } catch (err) {}
}

function onCardDragOver(e, card) {
  if (draggedCardId.value === null) return;
  dragOverCardId.value = card.id;
}

function onCardDragLeave(card) {
  if (dragOverCardId.value === card.id) {
    dragOverCardId.value = null;
  }
}

async function onCardDrop(e, targetCard) {
  if (draggedCardId.value === null || draggedCardId.value === targetCard.id) {
    onCardDragEnd();
    return;
  }
  const currentList = [...filteredCards.value];
  const fromIdx = currentList.findIndex(c => c.id === draggedCardId.value);
  const toIdx = currentList.findIndex(c => c.id === targetCard.id);
  if (fromIdx !== -1 && toIdx !== -1) {
    const [moved] = currentList.splice(fromIdx, 1);
    currentList.splice(toIdx, 0, moved);
    const reorderPayload = [];
    currentList.forEach((item, index) => {
      const target = allCards.value.find(c => c.id === item.id);
      if (target) {
        target.order = index + 1;
        reorderPayload.push({ id: target.id, order: index + 1 });
      }
    });
    allCards.value = [...allCards.value];
    showToast('导航卡片排序已更新');
    try {
      await reorderCards(reorderPayload);
    } catch (err) {}
  }
  onCardDragEnd();
}

function onCardDragEnd() {
  draggedCardId.value = null;
  dragOverCardId.value = null;
  setTimeout(() => { justDraggedCard = false; }, 120);
}

// Weather state
const presetCities = ref(PRESET_WEATHER_CITIES);
const showWeatherPicker = ref(false);
const locatingWeather = ref(false);
const customCityQuery = ref('');
const weatherCity = ref({ name: '香港', lat: 22.3193, lon: 114.1694, isAuto: false });
const weatherData = ref({
  temp: 26,
  desc: '晴间多云',
  icon: '⛅',
  reminder: '今日体感舒适，适合专注高效办公 ✨'
});

function parseWeatherCode(code, temp) {
  let desc = '晴朗';
  let icon = '☀️';
  if (code === 0) { desc = '晴朗'; icon = '☀️'; }
  else if (code === 1 || code === 2) { desc = '晴间多云'; icon = '⛅'; }
  else if (code === 3) { desc = '阴天'; icon = '☁️'; }
  else if (code >= 45 && code <= 48) { desc = '有雾'; icon = '🌫️'; }
  else if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) { desc = '小到中雨'; icon = '🌧️'; }
  else if (code >= 71 && code <= 77) { desc = '降雪'; icon = '❄️'; }
  else if (code >= 95) { desc = '雷阵雨'; icon = '⛈️'; }

  let reminder = '今日体感舒适，适合专注高效办公 ✨';
  if (icon === '🌧️' || icon === '⛈️') reminder = '今日有降雨，出门请记得携带雨伞 ☂️';
  else if (icon === '❄️') reminder = '气温较低且有降雪，注意防寒保暖 🧣';
  else if (temp >= 30) reminder = '今日气温较高，注意防暑降温与补水 🥤';
  else if (temp <= 12) reminder = '天气微凉早晚温差大，外出建议添衣保暖 🧥';
  return { temp: Math.round(temp), desc, icon, reminder };
}

async function fetchWeatherByCoords(lat, lon, cityName, isAuto = false) {
  weatherCity.value = { name: cityName, lat, lon, isAuto };
  const found = PRESET_WEATHER_CITIES.find(c => c.name === cityName) || PRESET_WEATHER_CITIES[0];
  weatherData.value = parseWeatherCode(found.code, found.temp);
  try {
    localStorage.setItem('nav_weather_city', JSON.stringify(weatherCity.value));
  } catch (e) {}

  try {
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.current_weather) {
        weatherData.value = parseWeatherCode(data.current_weather.weathercode, data.current_weather.temperature);
      }
    }
  } catch (e) {}
}

function selectPresetCity(city) {
  showWeatherPicker.value = false;
  fetchWeatherByCoords(city.lat, city.lon, city.name, false);
  showToast(`已切换天气位置为：${city.name}`);
}

async function searchCustomCity() {
  const q = customCityQuery.value.trim();
  if (!q) return;
  const localMatch = PRESET_WEATHER_CITIES.find(c => c.name.includes(q) || q.includes(c.name));
  if (localMatch) {
    customCityQuery.value = '';
    selectPresetCity(localMatch);
    return;
  }
  try {
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=1&language=zh`);
    if (res.ok) {
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const item = data.results[0];
        customCityQuery.value = '';
        showWeatherPicker.value = false;
        await fetchWeatherByCoords(item.latitude, item.longitude, item.name, false);
        showToast(`已切换天气位置为：${item.name}`);
        return;
      }
    }
  } catch (e) {}
  customCityQuery.value = '';
  showWeatherPicker.value = false;
  fetchWeatherByCoords(31.2304, 121.4737, q, false);
  showToast(`已切换天气位置为：${q}`);
}

function locateUserWeather() {
  if (!navigator.geolocation) {
    fetchWeatherByCoords(22.3193, 114.1694, '香港', true);
    showWeatherPicker.value = false;
    showToast('已定位至当前默认位置：香港');
    return;
  }
  locatingWeather.value = true;
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      locatingWeather.value = false;
      showWeatherPicker.value = false;
      await fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude, '当前位置', true);
      showToast('已成功获取当前位置天气提醒');
    },
    () => {
      locatingWeather.value = false;
      showWeatherPicker.value = false;
      fetchWeatherByCoords(22.3193, 114.1694, '香港', true);
      showToast('已自动定位至当前默认位置：香港');
    },
    { timeout: 4500 }
  );
}

const viewMode = ref(localStorage.getItem('nav_view_mode') || 'detailed');
const currentTime = ref('');
const currentDate = ref('');
const greetingText = ref('');
let clockTimer = null;

function updateClock() {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  currentTime.value = `${hh}:${mm}`;

  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  currentDate.value = `${now.getMonth() + 1}月${now.getDate()}日 ${days[now.getDay()]}`;

  const hour = now.getHours();
  if (hour < 6) greetingText.value = '夜深了，注意休息';
  else if (hour < 12) greetingText.value = '早安，开启高效一天';
  else if (hour < 18) greetingText.value = '午后好，保持专注';
  else greetingText.value = '晚上好，享受静谧时光';

  refreshCountdown();
}

// ===== 首页小组件：一言 / 待办便签 / 倒计时（数据存浏览器本地，风格与天气卡片一致）=====
const hitokoto = ref({ text: '正在加载一言…', from: '' });
const hitokotoLoading = ref(false);
const fallbackQuotes = [
  { text: '山重水复疑无路，柳暗花明又一村。', from: '陆游《游山西村》' },
  { text: '路漫漫其修远兮，吾将上下而求索。', from: '屈原《离骚》' },
  { text: '不积跬步，无以至千里。', from: '《荀子·劝学》' },
  { text: '纸上得来终觉浅，绝知此事要躬行。', from: '陆游《冬夜读书示子聿》' }
];

async function fetchHitokoto() {
  if (hitokotoLoading.value) return;
  hitokotoLoading.value = true;
  try {
    const res = await fetch('https://v1.hitokoto.cn/?c=d&c=i&c=k&encode=json');
    const data = await res.json();
    if (data && data.hitokoto) {
      hitokoto.value = { text: data.hitokoto, from: data.from_who || data.from || '佚名' };
      localStorage.setItem('nav_hitokoto', JSON.stringify(hitokoto.value));
      return;
    }
    throw new Error('bad response');
  } catch (e) {
    hitokoto.value = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
  } finally {
    hitokotoLoading.value = false;
  }
}

const todos = ref([]);
const newTodoText = ref('');

function loadTodos() {
  try {
    const parsed = JSON.parse(localStorage.getItem('nav_todos') || '[]');
    if (Array.isArray(parsed)) todos.value = parsed;
  } catch (e) {}
}

function saveTodos() {
  localStorage.setItem('nav_todos', JSON.stringify(todos.value));
}

function addTodo() {
  const text = newTodoText.value.trim();
  if (!text) return;
  todos.value.unshift({ id: Date.now(), text, done: false });
  newTodoText.value = '';
  saveTodos();
}

function toggleTodo(id) {
  const item = todos.value.find(t => t.id === id);
  if (item) {
    item.done = !item.done;
    saveTodos();
  }
}

function removeTodo(id) {
  todos.value = todos.value.filter(t => t.id !== id);
  saveTodos();
}

const pendingTodoCount = computed(() => todos.value.filter(t => !t.done).length);
const visibleTodos = computed(() => [...todos.value].sort((a, b) => Number(a.done) - Number(b.done)).slice(0, 4));

const countdown = ref({ name: '元旦', date: `${new Date().getFullYear() + 1}-01-01` });
const countdownDraft = ref({ name: '', date: '' });
const countdownDateRef = ref(null);
const showCountdownPicker = ref(false);
const countdownDays = ref(0);

function refreshCountdown() {
  const target = new Date(countdown.value.date + 'T00:00:00');
  if (isNaN(target.getTime())) {
    countdownDays.value = 0;
    return;
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  countdownDays.value = Math.round((target - today) / 86400000);
}

function loadCountdown() {
  try {
    const saved = JSON.parse(localStorage.getItem('nav_countdown') || 'null');
    if (saved && saved.name && saved.date) countdown.value = saved;
  } catch (e) {}
  refreshCountdown();
}

function toggleCountdownPicker() {
  countdownDraft.value = { ...countdown.value };
  showCountdownPicker.value = !showCountdownPicker.value;
  // 打开设置即直接弹出系统日期选择器，日期只能点选、不用手填
  if (showCountdownPicker.value) {
    nextTick(() => openCountdownDatePicker());
  }
}

// 打开原生日期选择器（日历弹窗）；不支持 showPicker 的浏览器退回聚焦输入框
function openCountdownDatePicker() {
  const el = countdownDateRef.value;
  if (!el) return;
  if (typeof el.showPicker === 'function') {
    try { el.showPicker(); } catch (e) { el.focus(); }
  } else {
    el.focus();
  }
}

function saveCountdown() {
  const name = countdownDraft.value.name.trim();
  if (!name || !countdownDraft.value.date) return;
  countdown.value = { name, date: countdownDraft.value.date };
  localStorage.setItem('nav_countdown', JSON.stringify(countdown.value));
  refreshCountdown();
  showCountdownPicker.value = false;
  showToast(`倒计时已设为「${name}」`);
}

// ===== 汇率牌（数据 open.er-api.com，本地缓存 6 小时，可输金额双向换算）=====
const fxCurrencies = ['USD', 'CNY', 'HKD', 'EUR', 'GBP', 'JPY'];
const fx = ref({ amount: 100, from: 'USD', to: 'CNY' });
const fxRates = ref(null);
const fxLoading = ref(false);
const fxUpdatedText = ref('');
const FX_FALLBACK_RATES = { USD: 1, CNY: 7.12, HKD: 7.81, EUR: 0.92, GBP: 0.79, JPY: 155.9 };

async function loadFxRates(force = false) {
  if (!force) {
    try {
      const cached = JSON.parse(localStorage.getItem('nav_fx_rates') || 'null');
      if (cached && cached.rates && Date.now() - cached.ts < 6 * 3600 * 1000) {
        fxRates.value = cached.rates;
        fxUpdatedText.value = new Date(cached.ts).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
        return;
      }
    } catch (e) {}
  }
  if (fxLoading.value) return;
  fxLoading.value = true;
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD');
    const data = await res.json();
    if (data && data.rates) {
      fxRates.value = data.rates;
      const ts = Date.now();
      fxUpdatedText.value = new Date(ts).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
      localStorage.setItem('nav_fx_rates', JSON.stringify({ rates: data.rates, ts }));
      return;
    }
    throw new Error('bad response');
  } catch (e) {
    if (!fxRates.value) fxRates.value = FX_FALLBACK_RATES;
  } finally {
    fxLoading.value = false;
  }
}

function saveFxPrefs() {
  localStorage.setItem('nav_fx_prefs', JSON.stringify(fx.value));
}

function loadFxPrefs() {
  try {
    const saved = JSON.parse(localStorage.getItem('nav_fx_prefs') || 'null');
    if (saved && fxCurrencies.includes(saved.from) && fxCurrencies.includes(saved.to)) fx.value = saved;
  } catch (e) {}
}

function swapFx() {
  const t = fx.value.from;
  fx.value.from = fx.value.to;
  fx.value.to = t;
  saveFxPrefs();
}

const fxUnitRate = computed(() => {
  if (!fxRates.value) return null;
  const r = fxRates.value[fx.value.to] / fxRates.value[fx.value.from];
  return isFinite(r) ? r : null;
});
const fxUnitRateText = computed(() => (fxUnitRate.value == null ? '—' : fxUnitRate.value.toLocaleString('zh-CN', { maximumFractionDigits: 4 })));
const fxResultText = computed(() => {
  const a = parseFloat(fx.value.amount);
  if (isNaN(a) || fxUnitRate.value == null) return '—';
  return (a * fxUnitRate.value).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ' + fx.value.to;
});

const countdownDaysAbs = computed(() => Math.abs(countdownDays.value));
const countdownStatusText = computed(() => {
  if (countdownDays.value > 0) return `距离「${countdown.value.name}」`;
  if (countdownDays.value === 0) return `「${countdown.value.name}」就是今天 🎉`;
  return `「${countdown.value.name}」已过`;
});

const customBgStyle = computed(() => {
  if (theme.value === 'light' && (!activeBg.value || activeBg.value.id === 1)) {
    return {
      background: 'radial-gradient(circle at 15% 15%, rgba(99, 102, 241, 0.14), transparent 55%), radial-gradient(circle at 85% 25%, rgba(168, 85, 247, 0.12), transparent 55%), radial-gradient(circle at 40% 85%, rgba(14, 165, 233, 0.12), transparent 55%), linear-gradient(135deg, #f8fafc 0%, #eef2ff 50%, #f1f5f9 100%)'
    };
  }
  if (!activeBg.value) return {};
  const bg = activeBg.value;
  const blurPx = Number(bg.blur) || 0;
  if (bg.type === 'image') {
    return {
      backgroundImage: `url("${bg.value}")`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      filter: blurPx > 0 ? `blur(${blurPx}px)` : 'none',
      transform: blurPx > 0 ? 'scale(1.04)' : 'none'
    };
  }
  return {
    background: bg.value,
    filter: blurPx > 0 ? `blur(${blurPx}px)` : 'none'
  };
});

const customOverlayStyle = computed(() => {
  if (theme.value === 'light' && (!activeBg.value || activeBg.value.id === 1)) {
    return { background: 'transparent' };
  }
  if (!activeBg.value) return { background: 'transparent' };
  const op = (activeBg.value.overlay_opacity ?? 20) / 100;
  return {
    background: theme.value === 'light'
      ? `rgba(248, 250, 252, ${Math.max(op, 0.55)})`
      : `rgba(11, 17, 32, ${op})`
  };
});

onMounted(async () => {
  syncBodyThemeClass();
  updateClock();
  clockTimer = setInterval(updateClock, 15000);
  window.addEventListener('keydown', handleGlobalKeydown);

  // 首页小组件初始化：一言（先用缓存再拉新）、待办、倒计时
  try {
    const cachedQuote = JSON.parse(localStorage.getItem('nav_hitokoto') || 'null');
    if (cachedQuote && cachedQuote.text) hitokoto.value = cachedQuote;
  } catch (e) {}
  fetchHitokoto();
  loadTodos();
  loadCountdown();
  loadFxPrefs();
  loadFxRates();

  try {
    const savedCity = localStorage.getItem('nav_weather_city');
    if (savedCity) {
      const parsed = JSON.parse(savedCity);
      fetchWeatherByCoords(parsed.lat, parsed.lon, parsed.name, parsed.isAuto);
    } else {
      fetchWeatherByCoords(22.3193, 114.1694, '香港', false);
    }
  } catch (e) {
    fetchWeatherByCoords(22.3193, 114.1694, '香港', false);
  }

  try {
    const bgRes = await getActiveBackground();
    if (bgRes.data) activeBg.value = bgRes.data;
  } catch (e) {}

  try {
    const engRes = await getSearchEngines();
    if (Array.isArray(engRes.data) && engRes.data.length) {
      searchEngines.value = engRes.data;
      selectedEngine.value = searchEngines.value.find(e => e.is_default === 1) || searchEngines.value[0];
    }
  } catch (e) {}

  try {
    const res = await getMenus();
    menus.value = res.data || [];
    if (menus.value.length > 0) activeMenu.value = menus.value[0];
  } catch (e) {}

  await loadAllCards();
});

onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer);
  window.removeEventListener('keydown', handleGlobalKeydown);
});

function handleGlobalKeydown(e) {
  if (e.key === '/' && document.activeElement !== searchInputRef.value && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
    e.preventDefault();
    searchInputRef.value?.focus();
  }
}

async function loadAllCards() {
  try {
    const r = await getAllCards();
    if (Array.isArray(r.data) && r.data.length) {
      allCards.value = r.data;
      return;
    }
  } catch (e) {}
  const list = [];
  for (const m of menus.value) {
    try {
      const r = await getCards(m.id);
      if (Array.isArray(r.data)) list.push(...r.data);
      if (m.subMenus && m.subMenus.length) {
        for (const s of m.subMenus) {
          const sr = await getCards(m.id, s.id);
          if (Array.isArray(sr.data)) list.push(...sr.data);
        }
      }
    } catch (err) {}
  }
  const map = new Map();
  list.forEach(c => map.set(c.id, c));
  allCards.value = Array.from(map.values());
}

const isGlobalFiltering = computed(() => {
  return searchQuery.value.trim().length > 0 && selectedEngine.value && (selectedEngine.value.url_template === 'site://internal' || selectedEngine.value.name === 'site');
});

const filteredCards = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (q && selectedEngine.value && (selectedEngine.value.url_template === 'site://internal' || selectedEngine.value.name === 'site')) {
    return allCards.value.filter(c =>
      (c.title && c.title.toLowerCase().includes(q)) ||
      (c.desc && c.desc.toLowerCase().includes(q)) ||
      (c.url && c.url.toLowerCase().includes(q))
    );
  }
  if (!activeMenu.value) return [];
  let list = allCards.value.filter(c => {
    if (activeSubMenu.value) return c.sub_menu_id === activeSubMenu.value.id;
    return c.menu_id === activeMenu.value.id && !c.sub_menu_id;
  });
  if (q) {
    list = list.filter(c =>
      (c.title && c.title.toLowerCase().includes(q)) ||
      (c.desc && c.desc.toLowerCase().includes(q)) ||
      (c.url && c.url.toLowerCase().includes(q))
    );
  }
  return list.sort((a, b) => (a.order || 0) - (b.order || 0));
});

function selectMenu(menu) {
  activeMenu.value = menu;
  activeSubMenu.value = null;
}

function selectSubMenu(sub) {
  activeSubMenu.value = sub;
}

function resetToHome() {
  if (menus.value.length > 0) {
    activeMenu.value = menus.value[0];
    activeSubMenu.value = null;
  }
  searchQuery.value = '';
}

function selectEngine(eng) {
  selectedEngine.value = eng;
  searchInputRef.value?.focus();
}

function buildEngineSearchUrl(template, query) {
  const encoded = encodeURIComponent(query);
  if (template.includes('{q}')) return template.replace(/\{q\}/g, encoded);
  if (template.includes('%s')) return template.replace(/%s/g, encoded);
  return template + encoded;
}

function handleSearch() {
  const q = searchQuery.value.trim();
  if (!q || !selectedEngine.value) return;
  if (selectedEngine.value.url_template === 'site://internal' || selectedEngine.value.name === 'site') return;
  const targetUrl = buildEngineSearchUrl(selectedEngine.value.url_template, q);
  window.open(targetUrl, '_blank', 'noopener,noreferrer');
}

function toggleViewMode() {
  viewMode.value = viewMode.value === 'detailed' ? 'compact' : 'detailed';
  try {
    localStorage.setItem('nav_view_mode', viewMode.value);
  } catch (e) {}
  showToast(viewMode.value === 'detailed' ? '已切换为详情卡片视图' : '已切换为紧凑网格视图');
}

function goAdmin(tab = '') {
  if (tab) {
    router.push({ path: '/admin', query: { tab } });
  } else {
    router.push('/admin');
  }
}

function getLogo(card) {
  if (card.display_logo) return card.display_logo;
  if (card.custom_logo_path) return `/uploads/${card.custom_logo_path}`;
  if (card.logo_url) return card.logo_url;
  try {
    const urlObj = new URL(card.url);
    return `${urlObj.origin}/favicon.ico`;
  } catch {
    return '';
  }
}

function onLogoError(id) {
  logoErrors.value[id] = true;
}

function getFirstChar(title) {
  return title ? title.trim().charAt(0).toUpperCase() : 'N';
}

function getHostname(urlStr) {
  try {
    return new URL(urlStr).hostname.replace(/^www\./, '');
  } catch {
    return urlStr;
  }
}
</script>
