<template>
  <div class="space-y-5">
    <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
      <div>
        <h2 class="text-base font-bold text-slate-100">首页搜索引擎与地址自定义配置</h2>
        <p class="text-xs text-slate-400 mt-0.5">
          支持自由添加、修改或删除搜索引擎及查询 URL 模板（使用 <code class="text-indigo-400">{q}</code> 代表搜索词，或 <code class="text-indigo-400">site://internal</code> 代表站内书签搜索），按住左侧 ⠿ 手柄可上下拖拽调整顺序
        </p>
      </div>

      <form class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-3 border-t border-slate-800" @submit.prevent="handleAddEngine">
        <input v-model="newLabel" type="text" placeholder="显示名称（如：Perplexity）*" required class="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 outline-none focus:border-indigo-500" />
        <input v-model="newUrlTemplate" type="text" placeholder="搜索地址 URL（含 {q}）*" required class="lg:col-span-2 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 outline-none focus:border-indigo-500" />
        <input v-model="newPlaceholder" type="text" placeholder="输入框占位提示词（可选）" class="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 outline-none focus:border-indigo-500" />
        <button type="submit" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition">+ 添加搜索引擎</button>
      </form>
    </div>

    <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="border-b border-slate-800 text-[11px] font-semibold text-slate-400 bg-slate-900/60">
            <th class="py-3 px-4 w-20">拖拽</th>
            <th class="py-3 px-3 w-36">显示名称</th>
            <th class="py-3 px-3">搜索地址模板 (URL)</th>
            <th class="py-3 px-3">占位提示文案</th>
            <th class="py-3 px-3 text-center w-24">默认引擎</th>
            <th class="py-3 px-3 text-center w-20">微调</th>
            <th class="py-3 px-4 text-center w-20">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800/70 text-xs">
          <tr
            v-for="(eng, idx) in engines"
            :key="eng.id"
            :draggable="dragHandleIdx === idx"
            class="hover:bg-slate-900/40 transition"
            :class="{
              'is-dragging': dragIdx === idx,
              'is-drag-over': dragOverIdx === idx && dragIdx !== idx
            }"
            @dragstart="onDragStart($event, idx)"
            @dragover.prevent="onDragOver($event, idx)"
            @drop.prevent="onDrop($event, idx)"
            @dragend="onDragEnd"
          >
            <td class="py-2.5 px-4">
              <div class="flex items-center gap-1.5">
                <span
                  class="drag-handle p-1 rounded text-slate-500 hover:text-indigo-400 transition"
                  title="按住上下拖动调整搜索引擎顺序"
                  @mousedown.stop="onHandlePress(idx)"
                  @touchstart.stop="onHandlePress(idx)"
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
                <span class="text-[11px] font-bold text-slate-500">#{{ idx + 1 }}</span>
              </div>
            </td>
            <td class="py-2.5 px-3">
              <input v-model="eng.label" type="text" class="w-full px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 font-semibold" @change="saveEngine(eng)" />
            </td>
            <td class="py-2.5 px-3">
              <input v-model="eng.url_template" type="text" class="w-full px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-indigo-300 font-mono" @change="saveEngine(eng)" />
            </td>
            <td class="py-2.5 px-3">
              <input v-model="eng.placeholder" type="text" class="w-full px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300" @change="saveEngine(eng)" />
            </td>
            <td class="py-2.5 px-3 text-center">
              <span v-if="eng.is_default === 1" class="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">✓ 默认</span>
              <button v-else type="button" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white text-[11px] transition" @click="setAsDefault(eng.id)">设为默认</button>
            </td>
            <td class="py-2.5 px-3 text-center">
              <div class="inline-flex items-center gap-1">
                <button type="button" :disabled="idx === 0" class="w-6 h-6 rounded bg-slate-800 hover:bg-indigo-600 disabled:opacity-30 text-xs font-bold text-slate-300 hover:text-white transition" title="上移" @click="moveEngine(idx, -1)">↑</button>
                <button type="button" :disabled="idx === engines.length - 1" class="w-6 h-6 rounded bg-slate-800 hover:bg-indigo-600 disabled:opacity-30 text-xs font-bold text-slate-300 hover:text-white transition" title="下移" @click="moveEngine(idx, 1)">↓</button>
              </div>
            </td>
            <td class="py-2.5 px-4 text-center">
              <button type="button" :disabled="engines.length <= 1" class="px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-600 hover:text-white disabled:opacity-30 text-rose-400 text-xs transition" @click="removeEngine(eng.id)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import {
  getSearchEngines,
  addSearchEngine,
  updateSearchEngine,
  setDefaultSearchEngine,
  reorderSearchEngines,
  deleteSearchEngine
} from '../../api';
import { DEFAULT_SEARCH_ENGINES } from '../../defaultData';

const engines = ref([...DEFAULT_SEARCH_ENGINES]);
const newLabel = ref('');
const newUrlTemplate = ref('');
const newPlaceholder = ref('');

const dragIdx = ref(null);
const dragOverIdx = ref(null);
const dragHandleIdx = ref(null);

onMounted(() => {
  loadEngines();
  window.addEventListener('mouseup', onHandleRelease);
  window.addEventListener('touchend', onHandleRelease);
});

onBeforeUnmount(() => {
  window.removeEventListener('mouseup', onHandleRelease);
  window.removeEventListener('touchend', onHandleRelease);
});

async function loadEngines() {
  try {
    const res = await getSearchEngines();
    if (Array.isArray(res.data) && res.data.length) {
      engines.value = res.data;
    }
  } catch (e) {}
}

async function handleAddEngine() {
  if (!newLabel.value.trim() || !newUrlTemplate.value.trim()) return;
  const payload = {
    name: newLabel.value.trim().toLowerCase().replace(/\s+/g, '_'),
    label: newLabel.value.trim(),
    url_template: newUrlTemplate.value.trim(),
    placeholder: newPlaceholder.value.trim() || `使用 ${newLabel.value.trim()} 搜索...`,
    is_default: 0,
    order: engines.value.length + 1
  };
  try {
    await addSearchEngine(payload);
    await loadEngines();
  } catch (e) {
    engines.value.push({ id: Date.now(), ...payload });
  }
  newLabel.value = '';
  newUrlTemplate.value = '';
  newPlaceholder.value = '';
}

async function saveEngine(eng) {
  try {
    await updateSearchEngine(eng.id, {
      label: eng.label,
      url_template: eng.url_template,
      placeholder: eng.placeholder,
      order: eng.order
    });
  } catch (e) {}
}

async function setAsDefault(id) {
  engines.value.forEach(x => { x.is_default = (x.id === id ? 1 : 0); });
  try {
    await setDefaultSearchEngine(id);
    await loadEngines();
  } catch (e) {}
}

async function removeEngine(id) {
  if (engines.value.length <= 1) return;
  engines.value = engines.value.filter(x => x.id !== id);
  try {
    await deleteSearchEngine(id);
    await loadEngines();
  } catch (e) {}
}

function onHandlePress(idx) {
  dragHandleIdx.value = idx;
}

function onHandleRelease() {
  dragHandleIdx.value = null;
}

function onDragStart(e, idx) {
  if (dragHandleIdx.value !== idx) {
    e.preventDefault();
    return;
  }
  dragIdx.value = idx;
  e.dataTransfer.effectAllowed = 'move';
}

function onDragOver(e, idx) {
  if (dragIdx.value === null) return;
  dragOverIdx.value = idx;
}

async function onDrop(e, targetIdx) {
  if (dragIdx.value === null || dragIdx.value === targetIdx) {
    onDragEnd();
    return;
  }
  const list = [...engines.value];
  const [moved] = list.splice(dragIdx.value, 1);
  list.splice(targetIdx, 0, moved);
  list.forEach((item, i) => { item.order = i + 1; });
  engines.value = list;
  onDragEnd();
  await persistOrder();
}

function onDragEnd() {
  dragIdx.value = null;
  dragOverIdx.value = null;
  dragHandleIdx.value = null;
}

async function moveEngine(idx, delta) {
  const target = idx + delta;
  if (target < 0 || target >= engines.value.length) return;
  const list = [...engines.value];
  const [moved] = list.splice(idx, 1);
  list.splice(target, 0, moved);
  list.forEach((item, i) => { item.order = i + 1; });
  engines.value = list;
  await persistOrder();
}

async function persistOrder() {
  try {
    const items = engines.value.map((item, i) => ({ id: item.id, order: i + 1 }));
    await reorderSearchEngines(items);
  } catch (e) {}
}
</script>
