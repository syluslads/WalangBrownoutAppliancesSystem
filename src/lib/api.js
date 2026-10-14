/**
 * src/lib/api.js
 *
 * Axios instance pre-configured for the WalangBrownout Laravel API.
 * All pages import this instead of using fetch() directly so the base URL
 * and auth header are applied automatically everywhere.
 *
 * Token storage key: 'wb_token'
 * User storage key:  'wb_user'
 */
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',
  headers: { Accept: 'application/json' },
});

// Attach the Sanctum Bearer token from localStorage on every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('wb_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// -------------------------------------------------------------------------
// Auth helpers
// -------------------------------------------------------------------------

/** POST /api/auth/login → { token, user } */
export async function login(email, password) {
  const { data } = await api.post('/auth/login', { email, password });
  localStorage.setItem('wb_token', data.token);
  // Return the raw user — callers are responsible for mapping the role
  // to any display labels before storing in localStorage.
  return data.user;
}

/** POST /api/auth/logout */
export async function logout() {
  try {
    await api.post('/auth/logout');
  } finally {
    localStorage.removeItem('wb_token');
    localStorage.removeItem('wb_user');
  }
}

/** GET /api/auth/me → user object */
export async function me() {
  const { data } = await api.get('/auth/me');
  return data.user;
}

/** Read the persisted user from localStorage without a network call. */
export function getStoredUser() {
  try {
    const raw = localStorage.getItem('wb_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** True when a token exists in localStorage (not verified against server). */
export function isAuthenticated() {
  return Boolean(localStorage.getItem('wb_token'));
}

// -------------------------------------------------------------------------
// Dashboard
// -------------------------------------------------------------------------

/** GET /api/dashboard → { kpis, alerts, recent_transactions } */
export async function getDashboard() {
  const { data } = await api.get('/dashboard');
  return data.data;
}

// -------------------------------------------------------------------------
// Products
// -------------------------------------------------------------------------

/**
 * GET /api/products
 * Supports optional filters: { category_id, supplier_id, is_active, search }
 */
export async function getProducts(params = {}) {
  const { data } = await api.get('/products', { params });
  return data;
}

/** GET /api/products/:id */
export async function getProduct(id) {
  const { data } = await api.get(`/products/${id}`);
  return data.data;
}

/** POST /api/products */
export async function createProduct(payload) {
  const { data } = await api.post('/products', payload);
  return data;
}

/** PUT /api/products/:id */
export async function updateProduct(id, payload) {
  const { data } = await api.put(`/products/${id}`, payload);
  return data;
}

/** DELETE /api/products/:id */
export async function deleteProduct(id) {
  const { data } = await api.delete(`/products/${id}`);
  return data;
}

// -------------------------------------------------------------------------
// Categories
// -------------------------------------------------------------------------

export async function getCategories() {
  const { data } = await api.get('/categories');
  return data.data;
}

export async function createCategory(payload) {
  const { data } = await api.post('/categories', payload);
  return data;
}

export async function updateCategory(id, payload) {
  const { data } = await api.put(`/categories/${id}`, payload);
  return data;
}

export async function deleteCategory(id) {
  const { data } = await api.delete(`/categories/${id}`);
  return data;
}

// -------------------------------------------------------------------------
// Suppliers
// -------------------------------------------------------------------------

export async function getSuppliers() {
  const { data } = await api.get('/suppliers');
  return data.data;
}

export async function createSupplier(payload) {
  const { data } = await api.post('/suppliers', payload);
  return data;
}

export async function updateSupplier(id, payload) {
  const { data } = await api.put(`/suppliers/${id}`, payload);
  return data;
}

export async function deleteSupplier(id) {
  const { data } = await api.delete(`/suppliers/${id}`);
  return data;
}

// -------------------------------------------------------------------------
// Stock-In
// -------------------------------------------------------------------------

/** POST /api/inventory/stock-in */
export async function stockIn(payload) {
  const { data } = await api.post('/inventory/stock-in', payload);
  return data;
}

/** GET /api/inventory/stock-in/:productId */
export async function getStockInHistory(productId) {
  const { data } = await api.get(`/inventory/stock-in/${productId}`);
  return data.data;
}

// -------------------------------------------------------------------------
// Stock-Out
// -------------------------------------------------------------------------

/**
 * POST /api/inventory/stock-out
 * payload: { product_id, quantity, reason?, notes? }
 */
export async function stockOut(payload) {
  const { data } = await api.post('/inventory/stock-out', payload);
  return data;
}

/**
 * GET /api/inventory/stock-out
 * Returns paginated stock-out records.
 */
export async function getStockOutRecords(params = {}) {
  const { data } = await api.get('/inventory/stock-out', { params });
  return data.data;
}

/** GET /api/inventory/stock-out/:id */
export async function getStockOutRecord(id) {
  const { data } = await api.get(`/inventory/stock-out/${id}`);
  return data.data;
}

// -------------------------------------------------------------------------
// Audit Trail
// -------------------------------------------------------------------------

/**
 * GET /api/audit
 * Supports filters: { product_id, type, user_id, date_from, date_to, search, per_page }
 */
export async function getAuditTrail(params = {}) {
  const { data } = await api.get('/audit', { params });
  return data.data;
}

// -------------------------------------------------------------------------
// System Settings
// -------------------------------------------------------------------------

/** GET /api/settings → flat key→value object */
export async function getSettings() {
  const { data } = await api.get('/settings');
  return data.data;
}

/** PUT /api/settings (admin only) */
export async function updateSettings(payload) {
  const { data } = await api.put('/settings', payload);
  return data;
}

export default api;
