<template>
  <div class="user-manage">
    <div class="user-card">
      <h2 class="section-title">管理员密码安全</h2>
      <p class="section-desc">定期更换高强度密码有助于保障导航站后台数据安全。</p>

      <form class="password-form" @submit.prevent="handleChangePassword">
        <div class="form-group">
          <label>当前密码</label>
          <input v-model="oldPassword" type="password" placeholder="请输入当前密码" class="input" />
        </div>
        <div class="form-group">
          <label>新密码（至少 6 位）</label>
          <input v-model="newPassword" type="password" placeholder="请输入新密码" class="input" />
        </div>
        <div class="form-group">
          <label>确认新密码</label>
          <input v-model="confirmPassword" type="password" placeholder="请再次输入新密码" class="input" />
        </div>

        <p v-if="message" :class="['message', messageType]">{{ message }}</p>

        <button type="submit" class="btn-submit" :disabled="loading">
          {{ loading ? '提交更新中...' : '确认修改密码' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { changePassword } from '../../api';

const oldPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const message = ref('');
const messageType = ref('success');

async function handleChangePassword() {
  if (!oldPassword.value || !newPassword.value || !confirmPassword.value) {
    showMessage('请填写所有密码字段', 'error');
    return;
  }
  if (newPassword.value !== confirmPassword.value) {
    showMessage('两次输入的新密码不一致', 'error');
    return;
  }
  if (newPassword.value.length < 6) {
    showMessage('新密码长度至少6位', 'error');
    return;
  }

  loading.value = true;
  message.value = '';
  try {
    await changePassword(oldPassword.value, newPassword.value);
    showMessage('密码修改成功，即将重新登录...', 'success');
    oldPassword.value = '';
    newPassword.value = '';
    confirmPassword.value = '';
    setTimeout(() => {
      localStorage.removeItem('token');
      window.location.reload();
    }, 1800);
  } catch (error) {
    showMessage(error.response?.data?.message || '密码修改失败', 'error');
  } finally {
    loading.value = false;
  }
}

function showMessage(text, type) {
  message.value = text;
  messageType.value = type;
}
</script>

<style scoped>
.user-manage {
  display: flex;
  justify-content: center;
  padding-top: 1rem;
}

.user-card {
  width: 100%;
  max-width: 520px;
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  padding: 2rem;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);
}

.section-title {
  margin: 0 0 0.35rem 0;
  font-size: 1.25rem;
  color: #0f172a;
}

.section-desc {
  margin: 0 0 1.5rem 0;
  font-size: 0.88rem;
  color: #64748b;
}

.password-form {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #334155;
}

.input {
  padding: 0.7rem 0.9rem;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  font-size: 0.92rem;
  outline: none;
}

.input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
}

.btn-submit {
  margin-top: 0.5rem;
  padding: 0.75rem;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
}

.message {
  margin: 0;
  padding: 0.65rem 0.9rem;
  border-radius: 8px;
  font-size: 0.86rem;
}

.message.success {
  background: #ecfdf5;
  color: #047857;
  border: 1px solid #a7f3d0;
}

.message.error {
  background: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}
</style>
