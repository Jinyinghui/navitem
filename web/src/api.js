import axios from 'axios';
const BASE = '/api';

export const login = (username, password) => axios.post(`${BASE}/login`, { username, password });

// 登录态失效（token 过期、改密后会话版本变更等）时统一清理本地 token 并通知页面回登录页
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?.url?.includes('/login')) {
      localStorage.removeItem('token');
      window.dispatchEvent(new Event('auth-expired'));
    }
    return Promise.reject(error);
  }
);

function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// 菜单相关API
export const getMenus = () => axios.get(`${BASE}/menus`);
export const addMenu = (data) => axios.post(`${BASE}/menus`, data, { headers: authHeaders() });
export const updateMenu = (id, data) => axios.put(`${BASE}/menus/${id}`, data, { headers: authHeaders() });
export const deleteMenu = (id) => axios.delete(`${BASE}/menus/${id}`, { headers: authHeaders() });
export const reorderMenus = (items) => axios.put(`${BASE}/menus/reorder`, { items }, { headers: authHeaders() });

// 子菜单相关API
export const getSubMenus = (menuId) => axios.get(`${BASE}/menus/${menuId}/submenus`);
export const addSubMenu = (menuId, data) => axios.post(`${BASE}/menus/${menuId}/submenus`, data, { headers: authHeaders() });
export const updateSubMenu = (id, data) => axios.put(`${BASE}/menus/submenus/${id}`, data, { headers: authHeaders() });
export const deleteSubMenu = (id) => axios.delete(`${BASE}/menus/submenus/${id}`, { headers: authHeaders() });
export const reorderSubMenus = (items) => axios.put(`${BASE}/menus/submenus/reorder`, { items }, { headers: authHeaders() });

// 卡片相关API
export const getAllCards = () => axios.get(`${BASE}/cards`);
export const getCards = (menuId, subMenuId = null) => {
  const params = subMenuId ? { subMenuId } : {};
  return axios.get(`${BASE}/cards/${menuId}`, { params });
};
export const addCard = (data) => axios.post(`${BASE}/cards`, data, { headers: authHeaders() });
export const updateCard = (id, data) => axios.put(`${BASE}/cards/${id}`, data, { headers: authHeaders() });
export const deleteCard = (id) => axios.delete(`${BASE}/cards/${id}`, { headers: authHeaders() });
export const reorderCards = (items) => axios.put(`${BASE}/cards/reorder`, { items }, { headers: authHeaders() });

export const uploadLogo = (file) => {
  const formData = new FormData();
  formData.append('logo', file);
  return axios.post(`${BASE}/upload`, formData, { headers: { ...authHeaders(), 'Content-Type': 'multipart/form-data' } });
};

// 背景管理相关API
export const getBackgrounds = () => axios.get(`${BASE}/backgrounds`);
export const getActiveBackground = () => axios.get(`${BASE}/backgrounds/active`);
export const addBackground = (data) => axios.post(`${BASE}/backgrounds`, data, { headers: authHeaders() });
export const updateBackground = (id, data) => axios.put(`${BASE}/backgrounds/${id}`, data, { headers: authHeaders() });
export const activateBackground = (id) => axios.put(`${BASE}/backgrounds/${id}/activate`, {}, { headers: authHeaders() });
export const deleteBackground = (id) => axios.delete(`${BASE}/backgrounds/${id}`, { headers: authHeaders() });

// 用户API
export const getUserProfile = () => axios.get(`${BASE}/users/profile`, { headers: authHeaders() });
export const getCurrentUser = () => axios.get(`${BASE}/users/me`, { headers: authHeaders() });
export const changePassword = (oldPassword, newPassword) => axios.put(`${BASE}/users/password`, { oldPassword, newPassword }, { headers: authHeaders() });
export const getUsers = () => axios.get(`${BASE}/users`, { headers: authHeaders() });

// 搜索引擎配置相关API
export const getSearchEngines = () => axios.get(`${BASE}/search-engines`);
export const addSearchEngine = (data) => axios.post(`${BASE}/search-engines`, data, { headers: authHeaders() });
export const updateSearchEngine = (id, data) => axios.put(`${BASE}/search-engines/${id}`, data, { headers: authHeaders() });
export const setDefaultSearchEngine = (id) => axios.put(`${BASE}/search-engines/${id}/default`, {}, { headers: authHeaders() });
export const reorderSearchEngines = (items) => axios.put(`${BASE}/search-engines/reorder`, { items }, { headers: authHeaders() });
export const deleteSearchEngine = (id) => axios.delete(`${BASE}/search-engines/${id}`, { headers: authHeaders() });
