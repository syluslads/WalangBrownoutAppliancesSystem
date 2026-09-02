// Role-based access control — UI/navigation only. There is no auth backend;
// this simply reflects, visually, the permission levels already described on
// the login screen and in the case study ("Admins manage users, suppliers,
// and system settings, while staff handle day-to-day stock transactions").

export const PAGES = {
  dashboard: 'Dashboard',
  products: 'Products',
  'stock-in': 'Stock-In',
  'stock-out': 'Stock-Out',
  'audit-trails': 'Audit Trails',
  settings: 'Settings',
};

// Which top-level pages each role can open.
export const pageAccess = {
  Admin: ['dashboard', 'products', 'stock-in', 'stock-out', 'audit-trails', 'settings'],
  'Warehouse Staff': ['dashboard', 'products', 'stock-in', 'stock-out', 'audit-trails', 'settings'],
  'Purchasing Manager': ['dashboard', 'products', 'audit-trails', 'settings'],
};

// Which Settings tabs each role can open.
export const settingsTabAccess = {
  Admin: ['profile', 'users', 'categories', 'alerts', 'appearance'],
  'Warehouse Staff': ['profile', 'appearance'],
  'Purchasing Manager': ['profile', 'categories', 'alerts', 'appearance'],
};

// Who can Add / Edit / Delete catalog items vs. view-only.
export const productManageRoles = ['Admin', 'Purchasing Manager'];

// Plain-language summary shown on Settings → Profile and used in tooltips.
export const roleAccessNotes = {
  Admin: 'Full system access — manage users, suppliers, categories, and alert thresholds, plus every inventory screen.',
  'Warehouse Staff': 'Can log Stock-In / Stock-Out, and view Products & Audit Trails. Cannot manage users, categories, suppliers, or alert thresholds.',
  'Purchasing Manager': 'Can review the product catalog, manage categories & suppliers, and set alert thresholds. Cannot perform Stock-In / Stock-Out or manage user accounts.',
};

export const canAccessPage = (role, pageKey) => {
  if (!role) return true; // not signed in yet (demo/guest preview) — leave unlocked
  return pageAccess[role]?.includes(pageKey) ?? false;
};

export const canAccessSettingsTab = (role, tabKey) => {
  if (!role) return true;
  return settingsTabAccess[role]?.includes(tabKey) ?? false;
};

export const canManageProducts = (role) => {
  if (!role) return true;
  return productManageRoles.includes(role);
};
