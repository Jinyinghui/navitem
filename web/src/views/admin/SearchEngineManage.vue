<template>
  <div class="se-manage">
    <!-- Header -->
    <div class="manage-header">
      <div class="header-info">
        <h2 class="header-title">搜索引擎配置</h2>
        <p class="header-desc">拖拽调整排序，直接编辑字段即可实时保存</p>
      </div>
      <button type="button" class="btn-add" @click="showAddForm = !showAddForm">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        添加引擎
      </button>
    </div>

    <!-- Add Form -->
    <div v-if="showAddForm" class="add-form-card">
      <h3 class="form-title">新增搜索引擎</h3>
      <form class="add-form" @submit.prevent="addSearchEngine">
        <div class="form-group">
          <label>显示标签 *</label>
          <input v-model="newSe.label" placeholder="如: Perplexity" class="form-input" required />
        </div>
        <div class="form-group">
          <label>URL 模板 * <span class="label-hint">使用 {q} 表示搜索关键词</span></label>
          <input v-model="newSe.url_template" placeholder="https://www.google.com/search?q={q}" class="form-input font-mono" required />
        </div>
        <div class="form-group">
          <label>占位提示文字 <span class="label-hint">留空则自动生成「使用 标签 搜索…」</span></label>
          <input v-model="newSe.placeholder" placeholder="可选的搜索框提示" class="form-input" />
        </div>
        <div class="form-actions">
          <button type="button" class="btn-cancel" @click="showAddForm = false; resetForm()">取消</button>
          <button type="submit" class="btn-submit">确认添加</button>
        </div>
      </form>
    </div>

    <!-- Table -->
    <div class="table-card">
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 80px;">排序</th>
            <th style="width: 18%;">标签</th>
            <th style="width: 30%;">URL 模板</th>
            <th style="width: 20%;">占位提示</th>
            <th style="width: 90px; text-align: center;">默认</th>
            <th style="width: 120px; text-align: center;">微调</th>
            <th style="width: 70px; text-align: center;">删除</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(se, idx) in searchEngines"
            :key="se.id"
            draggable="true"
            :class="{ 'is-dragging': dragSeIndex === idx, 'is-drag-over': dragOverSeIndex === idx && dragSeIndex !== idx }"
            @dragstart="onDragStart($event, idx)"
            @dragover.prevent="onDragOver($event, idx)"
            @drop.prevent="onDrop($event, idx)"
            @dragend="onDragEnd"
          >
            <td>
              <div class="drag-cell">
                <span class="drag-handle" title="按住拖动排序">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="9" cy="6" r="1.7"/><circle cx="15" cy="6" r="1.7"/>
                    <circle cx="9" cy="12" r="1.7"/><circle cx="15" cy="12" r="1.7"/>
                    <circle cx="9" cy="18" r="1.7"/><circle cx="15" cy="18" r="1.7"/>
                  </svg>
                </span>
                <span class="order-num">#{{ idx + 1 }}</span>
              </div>
            </td>
            <td>
              <input v-model="se.label" @change="updateSearchEngine(se)" class="inline-input font-semibold" placeholder="标签" />
            </td>
            <td>
              <input v-model="se.url_template" @change="updateSearchEngine(se)" class="inline-input font-mono text-indigo-300" placeholder="URL 模板" />
            </td>
            <td>
              <input v-model="se.placeholder" @change="updateSearchEngine(se)" class="inline-input" placeholder="提示文字" />
            </td>
            <td style="text-align: center;">
              <span v-if="se.is_default === 1" class="badge-default">✓ 默认</span>
              <button v-else type="button" class="btn-set-default" @click="setDefault(se)">设为默认</button>
            </td>
            <td style="text-align: center;">
              <div class="move-btns">
                <button type="button" class="btn-move" :disabled="idx === 0" title="上移" @click="moveSe(idx, -1)">↑</button>
                <button type="button" class="btn-move" :disabled="idx === searchEngines.length - 1" title="下移" @click="moveSe(idx, 1)">↓</button>
              </div>
            </td>
            <td style="text-align: center;">
              <button type="button" class="btn-delete" :disabled="searchEngines.length <= 1" @click="deleteSearchEngine(se)">删除</button>
            </td>
          </tr>
          <tr v-if="searchEngines.length === 0">
            <td colspan="7" class="empty-cell">暂无搜索引擎配置，请点击上方「添加引擎」创建</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import {
  getSearchEngines,
  addSearchEngine as apiAddSearchEngine,
  updateSearchEngine as apiUpdateSearchEngine,
  setDefaultSearchEngine as apiSetDefaultSearchEngine,
  deleteSearchEngine as apiDeleteSearchEngine,
  reorderSearchEngines as apiReorderSearchEngines
} from '../../api';

const searchEngines = ref([]);
const showAddForm = ref(false);
const newSe = ref({ label: '', url_template: '', placeholder: '' });

const dragSeIndex = ref(null);
const dragOverSeIndex = ref(null);

onMounted(() => {
  loadSearchEngines();
});

async function loadSearchEngines() {
  const res = await getSearchEngines();
  searchEngines.value = res.data;
}

function resetForm() {
  newSe.value = { label: '', url_template: '', placeholder: '' };
}

async function addSearchEngine() {
  const label = newSe.value.label.trim();
  if (!label) return;
  await apiAddSearchEngine({
    // name 为内部标识，与静态页面一致：由显示标签自动派生（小写、空格转下划线）
    name: label.toLowerCase().replace(/\s+/g, '_'),
    label,
    url_template: newSe.value.url_template,
    placeholder: newSe.value.placeholder.trim() || `使用 ${label} 搜索...`
  });
  showAddForm.value = false;
  resetForm();
  await loadSearchEngines();
}

async function updateSearchEngine(se) {
  await apiUpdateSearchEngine(se.id, {
    name: se.label.toLowerCase().replace(/\s+/g, '_'),
    label: se.label,
    url_template: se.url_template,
    placeholder: se.placeholder
  });
}

async function setDefault(se) {
  await apiSetDefaultSearchEngine(se.id);
  searchEngines.value.forEach(item => {
    item.is_default = item.id === se.id ? 1 : 0;
  });
}

async function deleteSearchEngine(se) {
  if (searchEngines.value.length <= 1) return;
  if (!confirm(`确定要删除「${se.label}」吗？`)) return;
  await apiDeleteSearchEngine(se.id);
  await loadSearchEngines();
}

function moveSe(idx, dir) {
  const target = idx + dir;
  if (target < 0 || target >= searchEngines.value.length) return;
  const list = [...searchEngines.value];
  const [moved] = list.splice(idx, 1);
  list.splice(target, 0, moved);
  list.forEach((se, i) => { se.order = i + 1; });
  searchEngines.value = list;
  apiReorderSearchEngines(list.map((se, i) => ({ id: se.id, order: i + 1 })));
}

function onDragStart(e, idx) {
  dragSeIndex.value = idx;
  e.dataTransfer.effectAllowed = 'move';
  e.currentTarget.classList.add('is-dragging');
}

function onDragOver(e, idx) {
  if (dragSeIndex.value === null) return;
  dragOverSeIndex.value = idx;
  e.currentTarget.classList.add('is-drag-over');
}

function onDragLeave(e) {
  e.currentTarget.classList.remove('is-drag-over');
}

async function onDrop(e, targetIdx) {
  if (dragSeIndex.value === null || dragSeIndex.value === targetIdx) {
    onDragEnd();
    return;
  }
  const list = [...searchEngines.value];
  const [moved] = list.splice(dragSeIndex.value, 1);
  list.splice(targetIdx, 0, moved);
  list.forEach((se, i) => { se.order = i + 1; });
  searchEngines.value = list;
  onDragEnd();
  await apiReorderSearchEngines(list.map((se, i) => ({ id: se.id, order: i + 1 })));
}

function onDragEnd() {
  dragSeIndex.value = null;
  dragOverSeIndex.value = null;
  document.querySelectorAll('[draggable="true"]').forEach(el => {
    el.classList.remove('is-dragging', 'is-drag-over');
  });
}
</script>

<style scoped>
.se-manage { display: flex; flex-direction: column; gap: 1.25rem; }
.manage-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; }
.header-title { margin: 0; font-size: 1.25rem; font-weight: 700; color: #f8fafc; }
.header-desc { margin: 0.35rem 0 0; font-size: 0.875rem; color: #64748b; }
.btn-add { display: flex; align-items: center; gap: 0.5rem; padding: 0.625rem 1.25rem; background: #6366f1; color: #fff; border: none; border-radius: 0.75rem; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.btn-add:hover { background: #4f46e5; transform: translateY(-1px); }

.add-form-card { background: #1e293b; border: 1px solid #334155; border-radius: 1rem; padding: 1.5rem; }
.form-title { margin: 0 0 1.25rem; font-size: 1rem; font-weight: 600; color: #f1f5f9; }
.add-form { display: flex; flex-direction: column; gap: 1rem; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.form-group { display: flex; flex-direction: column; gap: 0.5rem; }
.form-group label { font-size: 0.8rem; font-weight: 600; color: #94a3b8; }
.label-hint { font-weight: 400; color: #64748b; margin-left: 0.5rem; }
.form-input { padding: 0.625rem 0.875rem; background: #0f172a; border: 1px solid #334155; border-radius: 0.625rem; color: #f1f5f9; font-size: 0.875rem; transition: border-color 0.2s; }
.form-input:focus { outline: none; border-color: #6366f1; }
.form-input.font-mono { font-family: monospace; }
.form-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 0.5rem; }
.btn-cancel { padding: 0.625rem 1.25rem; background: transparent; border: 1px solid #475569; border-radius: 0.625rem; color: #94a3b8; font-size: 0.875rem; cursor: pointer; transition: all 0.2s; }
.btn-cancel:hover { background: #334155; }
.btn-submit { padding: 0.625rem 1.5rem; background: #6366f1; border: none; border-radius: 0.625rem; color: #fff; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.btn-submit:hover { background: #4f46e5; }

.table-card { background: #1e293b; border: 1px solid #334155; border-radius: 1rem; overflow: hidden; }
.data-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
.data-table th { background: #0f172a; padding: 0.875rem 0.75rem; text-align: left; font-weight: 600; color: #94a3b8; border-bottom: 1px solid #334155; }
.data-table td { padding: 0.75rem; border-bottom: 1px solid #1e293b; vertical-align: middle; }
.data-table tr:last-child td { border-bottom: none; }
.data-table tr:hover:not(.empty-row) { background: rgba(30, 41, 59, 0.5); }
.data-table tr.is-dragging { opacity: 0.4; }
.data-table tr.is-drag-over { background: rgba(99, 102, 241, 0.1) !important; border-color: #6366f1; }

.drag-cell { display: flex; align-items: center; gap: 0.5rem; }
.drag-handle { cursor: grab; color: #475569; display: flex; padding: 0.25rem; border-radius: 0.375rem; transition: color 0.2s; }
.drag-handle:hover { color: #6366f1; }
.drag-handle:active { cursor: grabbing; }
.order-num { font-size: 0.75rem; font-weight: 600; color: #64748b; }
.inline-input { width: 100%; padding: 0.5rem 0.625rem; background: #0f172a; border: 1px solid transparent; border-radius: 0.5rem; color: #f1f5f9; font-size: 0.8rem; transition: border-color 0.2s; }
.inline-input:hover { border-color: #475569; }
.inline-input:focus { outline: none; border-color: #6366f1; background: #1e293b; }
.font-semibold { font-weight: 600; }
.font-mono { font-family: monospace; }
.text-indigo-300 { color: #a5b4fc; }

.badge-default { display: inline-block; padding: 0.375rem 0.75rem; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 9999px; color: #34d399; font-size: 0.75rem; font-weight: 600; }
.btn-set-default { padding: 0.375rem 0.75rem; background: #334155; border: none; border-radius: 0.5rem; color: #94a3b8; font-size: 0.75rem; cursor: pointer; transition: all 0.2s; }
.btn-set-default:hover { background: #6366f1; color: #fff; }

.move-btns { display: inline-flex; gap: 0.375rem; }
.btn-move { width: 1.75rem; height: 1.75rem; display: flex; align-items: center; justify-content: center; background: #334155; border: none; border-radius: 0.375rem; color: #94a3b8; font-size: 0.875rem; cursor: pointer; transition: all 0.2s; }
.btn-move:hover:not(:disabled) { background: #6366f1; color: #fff; }
.btn-move:disabled { opacity: 0.3; cursor: not-allowed; }

.btn-delete { padding: 0.375rem 0.75rem; background: rgba(244, 63, 94, 0.15); border: none; border-radius: 0.5rem; color: #fb7185; font-size: 0.75rem; cursor: pointer; transition: all 0.2s; }
.btn-delete:hover:not(:disabled) { background: #dc2626; color: #fff; }
.btn-delete:disabled { opacity: 0.3; cursor: not-allowed; }

.empty-cell { text-align: center; padding: 3rem; color: #64748b; }
</style>
