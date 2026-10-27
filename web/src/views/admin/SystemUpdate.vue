<template>
  <div class="max-w-2xl mx-auto space-y-6">
    <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h2 class="text-base font-bold text-slate-100">系统更新</h2>
          <p class="text-xs text-slate-400 mt-1">一键把本站升级到最新镜像：拉取 → 重建容器 → 健康检查，新版本起不来会自动回滚旧版本。更新期间站点会短暂中断几秒，数据库与上传文件不受影响。</p>
        </div>
        <button type="button" :disabled="loading" class="shrink-0 px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition disabled:opacity-50" @click="load(true)">
          {{ loading ? '查询中…' : '检查更新' }}
        </button>
      </div>

      <!-- 未启用 -->
      <div v-if="info && info.enabled === false" class="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 space-y-2 leading-relaxed">
        <p class="font-semibold">更新功能尚未启用（{{ info.error || 'updater 未就绪' }}）</p>
        <p class="text-amber-200/80">一次性启用步骤（在服务器部署目录执行）：</p>
        <ol class="list-decimal ml-4 space-y-1 text-amber-200/80">
          <li>把仓库最新版 <span class="font-mono">docker-compose.yml</span> 同步到部署目录</li>
          <li>在部署目录的 <span class="font-mono">.env</span> 里追加两行：<span class="font-mono">HOST_DEPLOY_DIR=部署目录的绝对路径</span>（用 <span class="font-mono">pwd</span> 查看）、<span class="font-mono">UPDATER_TOKEN=一段随机字符串</span>（如 <span class="font-mono">openssl rand -hex 24</span> 生成）</li>
          <li>执行一次 <span class="font-mono">docker compose pull && docker compose up -d</span>（会多起一个 navitem-updater 容器），之后回到本页点「检查更新」即可</li>
        </ol>
      </div>

      <!-- 版本信息 -->
      <div v-else-if="info" class="space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="bg-slate-950 border border-slate-800 rounded-xl p-4">
            <div class="text-[11px] text-slate-500 font-medium">当前运行镜像</div>
            <div class="font-mono text-xs text-slate-200 mt-1.5 break-all">{{ shortDigest(info.version?.current_digest) }}</div>
            <div class="text-[11px] text-slate-500 mt-1">{{ info.version?.image || '' }}</div>
          </div>
          <div class="bg-slate-950 border border-slate-800 rounded-xl p-4">
            <div class="text-[11px] text-slate-500 font-medium">仓库最新镜像</div>
            <div class="font-mono text-xs text-slate-200 mt-1.5 break-all">{{ shortDigest(info.version?.remote_digest) }}</div>
            <div class="mt-1">
              <span v-if="info.version?.update_available" class="text-[11px] font-semibold text-amber-400">有新版可用</span>
              <span v-else-if="info.version?.remote_digest" class="text-[11px] font-semibold text-emerald-400">已是最新</span>
              <span v-else class="text-[11px] text-slate-500">远程版本暂查不到（网络不通时不影响手动更新）</span>
            </div>
          </div>
        </div>

        <!-- 任务结果提示 -->
        <p v-if="job && job.state === 'success'" class="text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-center">
          更新完成，新版本已通过健康检查。<button type="button" class="underline font-semibold ml-1" @click="reloadPage">点此刷新页面</button>
        </p>
        <p v-else-if="job && job.state === 'up_to_date'" class="text-xs text-slate-300 bg-slate-800/60 border border-slate-700 rounded-lg p-3 text-center">已是最新版本，无需更新。</p>
        <p v-else-if="job && job.state === 'rolled_back'" class="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-center">新版本未能通过健康检查，已自动回滚到旧版本，站点运行正常。原因见下方日志。</p>
        <p v-else-if="job && (job.state === 'failed' || job.state === 'rollback_failed')" class="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-lg p-3 text-center">
          {{ job.state === 'rollback_failed' ? '更新失败且回滚未恢复，请尽快人工检查容器状态。' : '更新失败，站点未受影响。' }} {{ job.error }}
        </p>

        <!-- 更新按钮 -->
        <div v-if="!running">
          <div v-if="confirming" class="flex flex-wrap items-center gap-2.5">
            <span class="text-xs text-slate-300">确认更新？更新期间站点将短暂中断。</span>
            <button type="button" class="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 transition" @click="doStart">确认更新</button>
            <button type="button" class="px-4 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition" @click="confirming = false">取消</button>
          </div>
          <button v-else type="button" class="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 transition" @click="confirming = true">
            {{ info.version?.update_available ? '立即更新到最新版' : '立即更新（拉取并重建）' }}
          </button>
        </div>
        <div v-else class="flex items-center gap-2.5 text-xs text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3.5">
          <span class="w-3.5 h-3.5 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin shrink-0"></span>
          <span>正在更新：{{ stepLabel }}…期间请勿关闭页面，完成后这里会给出结果。</span>
        </div>

        <!-- 进度日志 -->
        <div v-if="job && job.logs && job.logs.length">
          <div class="text-[11px] text-slate-500 font-medium mb-1.5">更新日志</div>
          <pre ref="logBox" class="bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-[11px] leading-relaxed text-slate-400 font-mono max-h-52 overflow-y-auto whitespace-pre-wrap break-all">{{ job.logs.join('\n') }}</pre>
        </div>
      </div>

      <p v-else-if="!loading" class="text-xs text-slate-500 text-center py-4">还没查到更新服务状态，点右上角「检查更新」重试。</p>
      <p v-if="loadError" class="text-xs text-rose-400 text-center">{{ loadError }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { getSystemUpdateStatus, startSystemUpdate } from '../../api';

const info = ref(null);
const loading = ref(false);
const loadError = ref('');
const confirming = ref(false);
const logBox = ref(null);
let timer = null;

const job = computed(() => info.value?.job || null);
const running = computed(() => job.value?.state === 'running');
const stepLabel = computed(() => {
  const map = { precheck: '检查环境', pull: '拉取新镜像', recreate: '重建容器', health: '健康检查', rollback: '回滚旧版本' };
  return map[job.value?.step] || '处理中';
});

function shortDigest(d) {
  if (!d) return '未知';
  return d.length > 24 ? d.slice(0, 24) + '…' : d;
}

async function load(force = false) {
  loading.value = true;
  loadError.value = '';
  try {
    // 点「检查更新」时 force=true，绕过 updater 的 60 秒远程摘要缓存现查；
    // 进页自动检查和更新轮询走缓存，避免频繁打 GHCR
    const { data } = await getSystemUpdateStatus(force);
    info.value = data;
    if (data?.job?.state === 'running') startPolling();
    else stopPolling();
  } catch (e) {
    loadError.value = '状态查询失败：' + (e.response?.data?.error || e.message);
  } finally {
    loading.value = false;
  }
}

async function doStart() {
  confirming.value = false;
  loadError.value = '';
  try {
    await startSystemUpdate();
    await load();
    startPolling();
  } catch (e) {
    loadError.value = '启动更新失败：' + (e.response?.data?.error || e.message);
  }
}

function startPolling() {
  if (timer) return;
  timer = setInterval(load, 2000);
}
function stopPolling() {
  if (timer) { clearInterval(timer); timer = null; }
}

function reloadPage() {
  window.location.reload();
}

watch(() => job.value?.logs?.length, async () => {
  await nextTick();
  if (logBox.value) logBox.value.scrollTop = logBox.value.scrollHeight;
});

onMounted(load);
onUnmounted(stopPolling);
</script>
