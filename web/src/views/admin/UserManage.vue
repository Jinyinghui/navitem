<template>
  <div class="max-w-md mx-auto">
    <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
      <div>
        <h2 class="text-base font-bold text-slate-100">修改管理员密码</h2>
        <p class="text-xs text-slate-400 mt-1">定期更新密码以确保导航站后台安全</p>
      </div>
      <form class="space-y-3.5" @submit.prevent="handleChangePwd">
        <div>
          <label class="block text-xs text-slate-400 mb-1">当前密码</label>
          <input v-model="oldPassword" type="password" placeholder="请输入当前密码" class="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 outline-none focus:border-indigo-500" />
        </div>
        <div>
          <label class="block text-xs text-slate-400 mb-1">新密码（至少 6 位）</label>
          <input v-model="newPassword" type="password" placeholder="请输入新密码" class="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 outline-none focus:border-indigo-500" />
        </div>
        <div>
          <label class="block text-xs text-slate-400 mb-1">确认新密码</label>
          <input v-model="confirmPassword" type="password" placeholder="请再次输入新密码" class="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 outline-none focus:border-indigo-500" />
        </div>
        <p v-if="msg" class="text-xs text-center" :class="isErr ? 'text-rose-400' : 'text-emerald-400'">{{ msg }}</p>
        <button type="submit" class="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition">
          保存新密码
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { changePassword } from '../../api';

const emit = defineEmits(['password-changed']);

const oldPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const msg = ref('');
const isErr = ref(false);

async function handleChangePwd() {
  if (!oldPassword.value || !newPassword.value || !confirmPassword.value) {
    isErr.value = true;
    msg.value = '请填写所有密码字段';
    return;
  }
  if (newPassword.value.length < 6) {
    isErr.value = true;
    msg.value = '新密码长度至少为 6 位';
    return;
  }
  if (newPassword.value !== confirmPassword.value) {
    isErr.value = true;
    msg.value = '两次输入的新密码不一致';
    return;
  }
  try {
    await changePassword(oldPassword.value, newPassword.value);
    isErr.value = false;
    msg.value = '密码修改成功';
    emit('password-changed');
    oldPassword.value = '';
    newPassword.value = '';
    confirmPassword.value = '';
  } catch (e) {
    isErr.value = true;
    msg.value = e.response?.data?.error || '密码修改失败';
  }
}
</script>
