<template>
  <div class="space-y-5">
    <!-- Add Custom Background Bar -->
    <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
      <div>
        <h2 class="text-base font-bold text-slate-100">背景主题与壁纸切换</h2>
        <p class="text-xs text-slate-400 mt-0.5">点击任意预设或自定义卡片即可切换前台导航背景，支持调节背景模糊度与遮罩浓度</p>
      </div>

      <form class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-3 border-t border-slate-800" @submit.prevent="handleAddBg">
        <input v-model="newName" type="text" placeholder="背景名称（如：星空壁纸）*" required class="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 outline-none focus:border-indigo-500" />
        <select v-model="newType" class="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 outline-none focus:border-indigo-500">
          <option value="image">图片壁纸 (URL / 本地上传)</option>
          <option value="gradient">CSS 渐变表达式</option>
        </select>
        <input v-model="newValue" type="text" placeholder="输入图片 URL 或渐变表达式 *" required class="lg:col-span-2 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 outline-none focus:border-indigo-500" />
        <div class="flex gap-2">
          <label class="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer flex items-center justify-center shrink-0 transition" title="上传本地壁纸图片">
            <span>上传图片</span>
            <input type="file" accept="image/*" class="hidden" @change="handleFileUpload" />
          </label>
          <button type="submit" class="flex-1 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition">+ 添加背景</button>
        </div>
      </form>
    </div>

    <!-- Active Background Live Sliders -->
    <div v-if="activeBg" class="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center gap-2.5">
        <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(16,185,129,0.18)]"></span>
        <span class="text-xs text-slate-300">当前启用背景：<strong class="text-slate-100">{{ activeBg.name }}</strong></span>
      </div>
      <div class="flex flex-wrap items-center gap-6">
        <div class="flex items-center gap-3">
          <label class="text-xs text-slate-400">背景模糊度 (<span>{{ activeBg.blur || 0 }}</span>px)</label>
          <input v-model.number="activeBg.blur" type="range" min="0" max="20" step="1" class="accent-indigo-500 cursor-pointer" @change="saveBgSettings(activeBg)" />
        </div>
        <div class="flex items-center gap-3">
          <label class="text-xs text-slate-400">遮罩浓度 (<span>{{ activeBg.overlay_opacity ?? 20 }}</span>%)</label>
          <input v-model.number="activeBg.overlay_opacity" type="range" min="0" max="85" step="5" class="accent-indigo-500 cursor-pointer" @change="saveBgSettings(activeBg)" />
        </div>
      </div>
    </div>

    <!-- Background Cards Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="bg in backgrounds"
        :key="bg.id"
        class="bg-slate-900 border-2 rounded-2xl overflow-hidden transition flex flex-col"
        :class="bg.is_active === 1 ? 'border-indigo-500 ring-2 ring-indigo-500/30' : 'border-slate-800 hover:border-slate-700'"
      >
        <div class="h-36 relative cursor-pointer overflow-hidden group" :style="getPreviewStyle(bg)" @click="setActive(bg)">
          <div class="absolute inset-0 transition" :style="{ background: `rgba(11, 17, 32, ${(bg.overlay_opacity ?? 20) / 100})` }"></div>
          <span v-if="bg.is_active === 1" class="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-indigo-600 text-white text-[11px] font-bold shadow">✓ 当前使用中</span>
          <span v-else class="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-900/80 text-slate-200 text-[11px] opacity-0 group-hover:opacity-100 transition">点击启用</span>
          <span class="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-slate-950/75 text-slate-300 text-[11px] backdrop-blur-sm">{{ bg.is_bing ? '🌄 每日壁纸' : (bg.type === 'image' ? '图片壁纸' : '极光渐变') }}</span>
        </div>
        <div class="p-3.5 flex items-center justify-between gap-2 bg-slate-900">
          <div class="min-w-0 flex-1">
            <input v-model="bg.name" type="text" class="w-full px-2 py-1 rounded-lg bg-transparent hover:bg-slate-950 focus:bg-slate-950 border border-transparent focus:border-slate-700 text-xs font-bold text-slate-100 outline-none truncate" @change="saveBgSettings(bg)" />
            <div class="text-[11px] text-slate-500 px-2 mt-0.5">模糊 {{ bg.blur || 0 }}px · 遮罩 {{ bg.overlay_opacity ?? 20 }}%</div>
          </div>
          <div class="flex items-center gap-1.5 shrink-0">
            <button v-if="bg.is_active !== 1" type="button" class="px-2.5 py-1.5 rounded-lg bg-indigo-500/15 hover:bg-indigo-600 text-indigo-400 hover:text-white text-xs font-semibold transition" @click="setActive(bg)">启用</button>
            <button v-if="backgrounds.length > 1 && !bg.is_bing" type="button" class="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white text-xs transition" @click="removeBg(bg.id)">删除</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import {
  getBackgrounds,
  addBackground,
  updateBackground,
  activateBackground,
  deleteBackground,
  uploadLogo
} from '../../api';
import { DEFAULT_BACKGROUNDS } from '../../defaultData';

const backgrounds = ref([...DEFAULT_BACKGROUNDS]);
const newName = ref('');
const newType = ref('image');
const newValue = ref('');

const activeBg = computed(() => backgrounds.value.find(b => b.is_active === 1) || backgrounds.value[0]);

onMounted(loadBgs);

async function loadBgs() {
  try {
    const res = await getBackgrounds();
    if (Array.isArray(res.data) && res.data.length) {
      backgrounds.value = res.data;
    }
  } catch (e) {}
}

function getPreviewStyle(bg) {
  if (bg.type === 'image') {
    return {
      backgroundImage: `url(${bg.value})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    };
  }
  return { background: bg.value };
}

async function handleFileUpload(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  try {
    const res = await uploadLogo(file);
    if (res.data?.url) {
      newType.value = 'image';
      newValue.value = res.data.url;
      if (!newName.value) newName.value = file.name.replace(/\.[^.]+$/, '');
      return;
    }
  } catch (err) {}
  // Fallback to base64 DataURL
  const reader = new FileReader();
  reader.onload = () => {
    newType.value = 'image';
    newValue.value = String(reader.result || '');
    if (!newName.value) newName.value = file.name.replace(/\.[^.]+$/, '');
  };
  reader.readAsDataURL(file);
}

async function handleAddBg() {
  if (!newName.value.trim() || !newValue.value.trim()) return;
  const payload = {
    name: newName.value.trim(),
    type: newType.value,
    value: newValue.value.trim(),
    blur: newType.value === 'image' ? 2 : 0,
    overlay_opacity: newType.value === 'image' ? 35 : 20,
    is_active: 1,
    order: backgrounds.value.length + 1
  };
  try {
    await addBackground(payload);
    await loadBgs();
  } catch (e) {
    backgrounds.value.forEach(b => { b.is_active = 0; });
    backgrounds.value.push({ id: Date.now(), ...payload });
  }
  newName.value = '';
  newValue.value = '';
}

async function setActive(bg) {
  backgrounds.value.forEach(b => { b.is_active = (b.id === bg.id ? 1 : 0); });
  try {
    await activateBackground(bg.id);
    await loadBgs();
  } catch (e) {}
}

async function saveBgSettings(bg) {
  try {
    await updateBackground(bg.id, {
      name: bg.name,
      type: bg.type,
      value: bg.value,
      blur: bg.blur,
      overlay_opacity: bg.overlay_opacity,
      order: bg.order
    });
  } catch (e) {}
}

async function removeBg(id) {
  if (backgrounds.value.length <= 1) return;
  backgrounds.value = backgrounds.value.filter(b => b.id !== id);
  try {
    await deleteBackground(id);
    await loadBgs();
  } catch (e) {}
}
</script>
