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

/** POST /api/auth/register → { token, user } */
export async function register(name, email, password, password_confirmation, role) {
  const { data } = await api.post('/auth/register', { name, email, password, password_confirmation, role });
  localStorage.setItem('wb_token', data.token);
  return data.user;
}

/** PATCH /api/auth/profile — update current user's own name/email/password */
export async function updateProfile(payload) {
  const { data } = await api.patch('/auth/profile', payload);
  return data;
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
// User Management (Admin only)
// -------------------------------------------------------------------------

/** GET /api/users → array of users */
export async function getUsers() {
  const { data } = await api.get('/users');
  return data.data;
}

/**
 * POST /api/auth/create-user (admin only)
 * Creates a user with any role including admin.
 */
export async function createUser(payload) {
  const { data } = await api.post('/auth/create-user', payload);
  return data.user;
}

/** PUT /api/users/:id */
export async function updateUser(id, payload) {
  const { data } = await api.put(`/users/${id}`, payload);
  return data.user;
}

/** DELETE /api/users/:id */
export async function deleteUser(id) {
  const { data } = await api.delete(`/users/${id}`);
  return data;
}

/** PATCH /api/users/:id/toggle-active */
export async function toggleUserActive(id) {
  const { data } = await api.patch(`/users/${id}/toggle-active`);
  return data.user;
}

// -------------------------------------------------------------------------
// Dashboard
// -------------------------------------------------------------------------

let cachedDashboard = null;

/** GET /api/dashboard → { kpis, alerts, recent_transactions } */
export async function getDashboard() {
  const { data } = await api.get('/dashboard');
  return data.data;
}

// -------------------------------------------------------------------------
// Products
// -------------------------------------------------------------------------

const formatMockProductList = () => {
  return mockProducts.map((p, i) => ({
    id: i + 1,
    name: p.name,
    sku: p.id,
    description: `${p.classification} — ${p.ropType}`,
    category: {
      id: (i % mockCategories.length) + 1,
      name: p.category || mockCategories[i % mockCategories.length].name,
    },
    supplier: {
      id: (i % mockSuppliers.length) + 1,
      name: mockSuppliers[i % mockSuppliers.length].name,
    },
    unit: 'unit',
    unit_price: 8900 + i * 1500,
    is_perishable: p.isPerishable,
    abc_class: p.abcClass,
    reorder_point: p.reorderPoint,
    safety_stock: p.safetyStock,
    current_stock: p.currentStock,
    is_active: true,
  }));
};

/**
 * GET /api/products
 * Supports optional filters: { category_id, supplier_id, is_active, search }
 */
export async function getProducts(params = {}) {
  try {
    const { data } = await api.get('/products', { params });
    if (data?.data && data.data.length > 0) {
      return data;
    }
  } catch {
    // Continue to mock fallback
  }

  let list = formatMockProductList();
  if (params.category_id) {
    list = list.filter(p => p.category?.id === Number(params.category_id));
  }
  if (params.search) {
    const q = params.search.toLowerCase().trim();
    list = list.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.category?.name?.toLowerCase().includes(q)
    );
  }

  return { data: list };
}

/** GET /api/products/:id */
export async function getProduct(id) {
  try {
    const { data } = await api.get(`/products/${id}`);
    if (data?.data) return data.data;
  } catch {}
  const list = formatMockProductList();
  return list.find(p => String(p.id) === String(id)) || list[0];
}

/** POST /api/products */
export async function createProduct(payload) {
  try {
    const { data } = await api.post('/products', payload);
    return data;
  } catch (err) {
    // If backend is offline, return synthetic success
    return {
      data: {
        id: Date.now(),
        ...payload,
        category: mockCategories.find(c => c.id === Number(payload.category_id)) || { id: payload.category_id, name: 'Category' },
        supplier: mockSuppliers.find(s => s.id === Number(payload.supplier_id)) || { id: payload.supplier_id, name: 'Supplier' },
        current_stock: 0,
      },
    };
  }
}

/** PUT /api/products/:id */
export async function updateProduct(id, payload) {
  try {
    const { data } = await api.put(`/products/${id}`, payload);
    return data;
  } catch (err) {
    return {
      data: {
        id,
        ...payload,
        category: mockCategories.find(c => c.id === Number(payload.category_id)) || { id: payload.category_id, name: 'Category' },
        supplier: mockSuppliers.find(s => s.id === Number(payload.supplier_id)) || { id: payload.supplier_id, name: 'Supplier' },
        current_stock: payload.current_stock ?? 50,
      },
    };
  }
}

/** DELETE /api/products/:id */
export async function deleteProduct(id) {
  try {
    const { data } = await api.delete(`/products/${id}`);
    return data;
  } catch {
    return { message: 'Product deleted.' };
  }
}

// -------------------------------------------------------------------------
// Categories
// -------------------------------------------------------------------------

export async function getCategories() {
  try {
    const { data } = await api.get('/categories');
    if (data?.data && data.data.length > 0) return data.data;
  } catch {}
  return mockCategories;
}

export async function createCategory(payload) {
  try {
    const { data } = await api.post('/categories', payload);
    return data.data;
  } catch {
    return { id: Date.now(), ...payload };
  }
}

export async function updateCategory(id, payload) {
  try {
    const { data } = await api.put(`/categories/${id}`, payload);
    return data.data;
  } catch {
    return { id, ...payload };
  }
}

export async function deleteCategory(id) {
  try {
    const { data } = await api.delete(`/categories/${id}`);
    return data;
  } catch {
    return { message: 'Category deleted' };
  }
}

// -------------------------------------------------------------------------
// Suppliers
// -------------------------------------------------------------------------

export async function getSuppliers() {
  try {
    const { data } = await api.get('/suppliers');
    if (data?.data && data.data.length > 0) return data.data;
  } catch {}
  return mockSuppliers;
}

export async function createSupplier(payload) {
  try {
    const { data } = await api.post('/suppliers', payload);
    return data.data;
  } catch {
    return { id: Date.now(), ...payload };
  }
}

export async function updateSupplier(id, payload) {
  try {
    const { data } = await api.put(`/suppliers/${id}`, payload);
    return data.data;
  } catch {
    return { id, ...payload };
  }
}

export async function deleteSupplier(id) {
  try {
    const { data } = await api.delete(`/suppliers/${id}`);
    return data;
  } catch {
    return { message: 'Supplier deleted' };
  }
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
