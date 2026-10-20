<template>
  <div class="bg-manage">
    <!-- Header -->
    <div class="manage-header">
      <div class="header-info">
        <h2 class="header-title">背景设置</h2>
        <p class="header-desc">支持渐变色背景和图片背景，拖拽调整显示顺序</p>
      </div>
      <button type="button" class="btn-add" @click="showAddForm = !showAddForm">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        添加背景
      </button>
    </div>

    <!-- Add Form -->
    <div v-if="showAddForm" class="add-form-card">
      <h3 class="form-title">新增背景</h3>
      <form class="add-form" @submit.prevent="addBackground">
        <div class="form-row">
          <div class="form-group">
            <label>背景名称 *</label>
            <input v-model="newBg.name" placeholder="如: 星空渐变" class="form-input" required />
          </div>
          <div class="form-group">
            <label>背景类型 *</label>
            <select v-model="newBg.type" class="form-input form-select">
              <option value="gradient">渐变色</option>
              <option value="image">图片</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>背景值 *</label>
          <input v-model="newBg.value" :placeholder="newBg.type === 'gradient' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'https://example.com/bg.jpg'" class="form-input font-mono" required />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>模糊程度 <span class="label-hint">0-20px</span></label>
            <input v-model.number="newBg.blur" type="number" min="0" max="20" placeholder="0" class="form-input" />
          </div>
          <div class="form-group">
            <label>遮罩透明度 <span class="label-hint">0-100%</span></label>
            <input v-model.number="newBg.overlay_opacity" type="number" min="0" max="100" placeholder="30" class="form-input" />
          </div>
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
            <th style="width: 20%;">名称</th>
            <th style="width: 35%;">预览</th>
            <th style="width: 100px; text-align: center;">状态</th>
            <th style="width: 120px; text-align: center;">微调</th>
            <th style="width: 70px; text-align: center;">删除</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(bg, idx) in backgrounds"
            :key="bg.id"
            draggable="true"
            :class="{ 'is-dragging': dragBgIndex === idx, 'is-drag-over': dragOverBgIndex === idx && dragBgIndex !== idx }"
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
              <input v-model="bg.name" @change="updateBackground(bg)" class="inline-input font-semibold" placeholder="背景名称" />
            </td>
            <td>
              <div class="bg-preview" :style="getPreviewStyle(bg)">
                <span class="preview-label">{{ bg.type === 'gradient' ? '渐变色' : '图片' }}</span>
              </div>
            </td>
            <td style="text-align: center;">
              <button
                v-if="bg.is_active !== 1"
                type="button"
                class="btn-activate"
                @click="activateBackground(bg)"
              >激活</button>
              <span v-else class="badge-active">✓ 使用中</span>
            </td>
            <td style="text-align: center;">
              <div class="move-btns">
                <button type="button" class="btn-move" :disabled="idx === 0" title="上移" @click="moveBg(idx, -1)">↑</button>
                <button type="button" class="btn-move" :disabled="idx === backgrounds.length - 1" title="下移" @click="moveBg(idx, 1)">↓</button>
              </div>
            </td>
            <td style="text-align: center;">
              <button type="button" class="btn-delete" @click="deleteBackground(bg)">删除</button>
            </td>
          </tr>
          <tr v-if="backgrounds.length === 0">
            <td colspan="6" class="empty-cell">暂无背景设置，请点击上方「添加背景」创建</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import {
  getBackgrounds,
  addBackground as apiAddBackground,
  updateBackground as apiUpdateBackground,
  activateBackground as apiActivateBackground,
  deleteBackground as apiDeleteBackground,
  reorderBackgrounds as apiReorderBackgrounds
} from '../../api';

const backgrounds = ref([]);
const showAddForm = ref(false);
const newBg = ref({ name: '', type: 'gradient', value: '', blur: 0, overlay_opacity: 30 });

const dragBgIndex = ref(null);
const dragOverBgIndex = ref(null);

onMounted(() => {
  loadBackgrounds();
});

async function loadBackgrounds() {
  const res = await getBackgrounds();
  backgrounds.value = res.data;
}

function resetForm() {
  newBg.value = { name: '', type: 'gradient', value: '', blur: 0, overlay_opacity: 30 };
}

function getPreviewStyle(bg) {
  if (bg.type === 'gradient') {
    return { background: bg.value };
  } else {
    return { backgroundImage: `url(${bg.value})`, backgroundSize: 'cover', backgroundPosition: 'center' };
  }
}

async function addBackground() {
  await apiAddBackground({
    name: newBg.value.name,
    type: newBg.value.type,
    value: newBg.value.value,
    blur: newBg.value.blur ?? 0,
    overlay_opacity: newBg.value.overlay_opacity ?? 30
  });
  showAddForm.value = false;
  resetForm();
  await loadBackgrounds();
}

async function updateBackground(bg) {
  await apiUpdateBackground(bg.id, {
    name: bg.name,
    value: bg.value
  });
}

async function activateBackground(bg) {
  await apiActivateBackground(bg.id);
  backgrounds.value.forEach(item => {
    item.is_active = item.id === bg.id ? 1 : 0;
  });
}

async function deleteBackground(bg) {
  if (!confirm(`确定要删除「${bg.name}」吗？`)) return;
  await apiDeleteBackground(bg.id);
  await loadBackgrounds();
}

function moveBg(idx, dir) {
  const target = idx + dir;
  if (target < 0 || target >= backgrounds.value.length) return;
  const list = [...backgrounds.value];
  const [moved] = list.splice(idx, 1);
  list.splice(target, 0, moved);
  list.forEach((bg, i) => { bg.order = i + 1; });
  backgrounds.value = list;
  apiReorderBackgrounds(list.map((bg, i) => ({ id: bg.id, order: i + 1 })));
}

function onDragStart(e, idx) {
  dragBgIndex.value = idx;
  e.dataTransfer.effectAllowed = 'move';
  e.currentTarget.classList.add('is-dragging');
}

function onDragOver(e, idx) {
  if (dragBgIndex.value === null) return;
  dragOverBgIndex.value = idx;
  e.currentTarget.classList.add('is-drag-over');
}

function onDragLeave(e) {
  e.currentTarget.classList.remove('is-drag-over');
}

async function onDrop(e, targetIdx) {
  if (dragBgIndex.value === null || dragBgIndex.value === targetIdx) {
    onDragEnd();
    return;
  }
  const list = [...backgrounds.value];
  const [moved] = list.splice(dragBgIndex.value, 1);
  list.splice(targetIdx, 0, moved);
  list.forEach((bg, i) => { bg.order = i + 1; });
  backgrounds.value = list;
  onDragEnd();
  await apiReorderBackgrounds(list.map((bg, i) => ({ id: bg.id, order: i + 1 })));
}

function onDragEnd() {
  dragBgIndex.value = null;
  dragOverBgIndex.value = null;
  document.querySelectorAll('[draggable="true"]').forEach(el => {
    el.classList.remove('is-dragging', 'is-drag-over');
  });
}
</script>

<style scoped>
.bg-manage { display: flex; flex-direction: column; gap: 1.25rem; }
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
.form-select { cursor: pointer; }
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
.data-table tr:hover { background: rgba(30, 41, 59, 0.5); }
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

.bg-preview { height: 48px; width: 160px; border-radius: 0.5rem; border: 1px solid #334155; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; }
.preview-label { font-size: 0.65rem; color: rgba(255,255,255,0.7); text-shadow: 0 1px 2px rgba(0,0,0,0.5); }

.badge-active { display: inline-block; padding: 0.375rem 0.75rem; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 9999px; color: #34d399; font-size: 0.75rem; font-weight: 600; }
.btn-activate { padding: 0.375rem 0.75rem; background: #334155; border: none; border-radius: 0.5rem; color: #94a3b8; font-size: 0.75rem; cursor: pointer; transition: all 0.2s; }
.btn-activate:hover { background: #6366f1; color: #fff; }

.move-btns { display: inline-flex; gap: 0.375rem; }
.btn-move { width: 1.75rem; height: 1.75rem; display: flex; align-items: center; justify-content: center; background: #334155; border: none; border-radius: 0.375rem; color: #94a3b8; font-size: 0.875rem; cursor: pointer; transition: all 0.2s; }
.btn-move:hover:not(:disabled) { background: #6366f1; color: #fff; }
.btn-move:disabled { opacity: 0.3; cursor: not-allowed; }

.btn-delete { padding: 0.375rem 0.75rem; background: rgba(244, 63, 94, 0.15); border: none; border-radius: 0.5rem; color: #fb7185; font-size: 0.75rem; cursor: pointer; transition: all 0.2s; }
.btn-delete:hover { background: #dc2626; color: #fff; }

.empty-cell { text-align: center; padding: 3rem; color: #64748b; }
</style>
