import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { canAccessSettingsTab, roleAccessNotes, pageAccess, PAGES } from '../data/permissions';
import {
  getSettings, updateSettings,
  getUsers, createUser, updateUser, deleteUser, toggleUserActive,
  getCategories, createCategory, updateCategory, deleteCategory,
  getSuppliers, createSupplier, updateSupplier, deleteSupplier,
  updateProfile,
} from '../lib/api';
import {
  IconUsers,
  IconLayers,
  IconBell,
  IconPalette,
  IconEdit,
  IconTrash,
  IconPlus,
  IconBuilding,
  IconLock,
  IconCheck,
  IconSun,
  IconMoon,
  IconMonitor,
} from '../components/Icons';
import {
  getStoredTheme,
  applyTheme as setGlobalTheme,
  getStoredCompact,
  applyCompact as setGlobalCompact,
  getSystemPreference,
} from '../lib/theme';

const initials = (name = '') =>
  name.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase()).join('') || 'U';

const roleTone = { Admin: 'pill-blue', Warehouse: 'pill-violet', Purchasing: 'pill-amber' };

const TABS = [
  { id: 'profile',    label: 'Profile',                icon: IconBuilding },
  { id: 'users',      label: 'Users & Roles',          icon: IconUsers    },
  { id: 'categories', label: 'Categories & Suppliers', icon: IconLayers   },
  { id: 'alerts',     label: 'Alerts & Thresholds',    icon: IconBell     },
  { id: 'appearance', label: 'Appearance',             icon: IconPalette  },
];

const BACKEND_ROLE_MAP = {
  admin:              'Admin',
  warehouse_staff:    'Warehouse Staff',
  purchasing_manager: 'Purchasing Manager',
};

const displayRole = (rawRole) =>
  BACKEND_ROLE_MAP[rawRole] ?? rawRole ?? '—';

// ---------------------------------------------------------------------------
// Reusable inline modal
// ---------------------------------------------------------------------------
const Modal = ({ title, onClose, children }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-content" onClick={e => e.stopPropagation()}>
      <div className="modal-header">
        <h3>{title}</h3>
      </div>
      {children}
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// User Form (Add / Edit)
// ---------------------------------------------------------------------------
const UserModal = ({ existingUser, currentUser, onClose, onSaved }) => {
  const isEdit = Boolean(existingUser);
  const isEditingSelf = isEdit && existingUser?.id === currentUser?.id;
  
  const [form, setForm] = useState({
    name:                  existingUser?.name  ?? '',
    email:                 existingUser?.email ?? '',
    role:                  existingUser?.role  ?? 'warehouse_staff',
    password:              '',
    password_confirmation: '',
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (isEditingSelf) {
      setError('You cannot edit your own role. Ask another admin to change it.');
      return;
    }
    
    if (isEdit) {
      // Edit mode: only send role
      setSaving(true);
      try {
        const updated = await updateUser(existingUser.id, { role: form.role });
        onSaved(updated, 'update');
        onClose();
      } catch (err) {
        const msg = err.response?.data?.message
          || Object.values(err.response?.data?.errors || {}).flat()[0]
          || 'Failed to update user.';
        setError(msg);
      } finally {
        setSaving(false);
      }
    } else {
      // Create mode: validate and send all fields
      if (!form.name.trim())  { setError('Name is required.');  return; }
      if (!form.email.trim()) { setError('Email is required.'); return; }
      if (!form.password)   { setError('Password is required.'); return; }
      if (form.password !== form.password_confirmation) { setError('Passwords do not match.'); return; }
      if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }

      setSaving(true);
      try {
        const created = await createUser({
          name:                  form.name,
          email:                 form.email,
          role:                  form.role,
          password:              form.password,
          password_confirmation: form.password_confirmation,
        });
        onSaved(created, 'create');
        onClose();
      } catch (err) {
        const msg = err.response?.data?.message
          || Object.values(err.response?.data?.errors || {}).flat()[0]
          || 'Failed to create user.';
        setError(msg);
      } finally {
        setSaving(false);
      }
    }
  };

  return (
    <Modal title={isEdit ? 'Edit User' : 'Add New User'} onClose={onClose}>
      {isEditingSelf && (
        <div className="inline-notice" style={{ background: '#fef3c7', color: '#92400e', borderColor: '#fcd34d', marginBottom: 12 }}>
          ℹ️ You are editing your own account. Role changes are disabled for security.
        </div>
      )}
      {error && (
        <div className="inline-notice" style={{ background: '#fee2e2', color: '#991b1b', borderColor: '#fca5a5', marginBottom: 12 }}>
          ⚠️ {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          {isEdit ? (
            // Edit mode: name and email are read-only display fields
            <>
              <div className="form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  value={form.name} 
                  disabled 
                  style={{ 
                    backgroundColor: 'var(--color-gray-100)', 
                    cursor: 'not-allowed',
                    color: 'var(--color-gray-600)'
                  }} 
                />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  value={form.email} 
                  disabled 
                  style={{ 
                    backgroundColor: 'var(--color-gray-100)', 
                    cursor: 'not-allowed',
                    color: 'var(--color-gray-600)'
                  }} 
                />
              </div>
              <div className="form-group">
                <label>Role *</label>
                <select 
                  value={form.role} 
                  onChange={e => set('role', e.target.value)} 
                  disabled={saving || isEditingSelf}
                  style={isEditingSelf ? {
                    backgroundColor: 'var(--color-gray-100)', 
                    cursor: 'not-allowed',
                    color: 'var(--color-gray-600)'
                  } : {}}
                >
                  <option value="admin">Admin</option>
                  <option value="warehouse_staff">Warehouse Staff</option>
                  <option value="purchasing_manager">Purchasing Manager</option>
                </select>
              </div>
            </>
          ) : (
            // Create mode: all fields editable
            <>
              <div className="form-group">
                <label>Full Name *</label>
                <input type="text" placeholder="John Doe" value={form.name} onChange={e => set('name', e.target.value)} disabled={saving} />
              </div>
              <div className="form-group">
                <label>Email Address *</label>
                <input type="email" placeholder="user@example.com" value={form.email} onChange={e => set('email', e.target.value)} disabled={saving} />
              </div>
              <div className="form-group">
                <label>Role *</label>
                <select value={form.role} onChange={e => set('role', e.target.value)} disabled={saving}>
                  <option value="admin">Admin</option>
                  <option value="warehouse_staff">Warehouse Staff</option>
                  <option value="purchasing_manager">Purchasing Manager</option>
                </select>
              </div>
              <div className="form-group">
                <label>Password *</label>
                <input type="password" placeholder="••••••••" value={form.password} onChange={e => set('password', e.target.value)} disabled={saving} autoComplete="new-password" />
              </div>
              <div className="form-group">
                <label>Confirm Password *</label>
                <input type="password" placeholder="••••••••" value={form.password_confirmation} onChange={e => set('password_confirmation', e.target.value)} disabled={saving} autoComplete="new-password" />
              </div>
            </>
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
          <button type="button" className="btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
          <button type="submit" className="btn-dark" disabled={saving || isEditingSelf}>
            {saving ? 'Saving…' : isEdit ? 'Update Role' : 'Create User'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// ---------------------------------------------------------------------------
// Category Form (Add / Edit)
// ---------------------------------------------------------------------------
const CategoryModal = ({ category, onClose, onSaved }) => {
  const isEdit = Boolean(category);
  const [name,  setName]  = useState(category?.name        ?? '');
  const [desc,  setDesc]  = useState(category?.description ?? '');
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('Category name is required.'); return; }
    setSaving(true);
    try {
      if (isEdit) {
        const updated = await updateCategory(category.id, { name, description: desc });
        onSaved(updated, 'update');
      } else {
        const created = await createCategory({ name, description: desc });
        onSaved(created, 'create');
      }
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message
        || Object.values(err.response?.data?.errors || {}).flat()[0]
        || 'Failed to save category.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={isEdit ? 'Edit Category' : 'Add Category'} onClose={onClose}>
      {error && (
        <div className="inline-notice" style={{ background: '#fee2e2', color: '#991b1b', borderColor: '#fca5a5', marginBottom: 12 }}>⚠️ {error}</div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Category Name *</label>
          <input type="text" placeholder="e.g. Air Conditioning" value={name} onChange={e => setName(e.target.value)} disabled={saving} />
        </div>
        <div className="form-group">
          <label>Description</label>
          <input type="text" placeholder="Optional description" value={desc} onChange={e => setDesc(e.target.value)} disabled={saving} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
          <button type="button" className="btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
          <button type="submit" className="btn-dark" disabled={saving}>{saving ? 'Saving…' : isEdit ? 'Update' : 'Add Category'}</button>
        </div>
      </form>
    </Modal>
  );
};

// ---------------------------------------------------------------------------
// Supplier Form (Add / Edit)
// ---------------------------------------------------------------------------
const SupplierModal = ({ supplier, onClose, onSaved }) => {
  const isEdit = Boolean(supplier);
  const [form, setForm] = useState({
    name:           supplier?.name           ?? '',
    contact_person: supplier?.contact_person ?? '',
    email:          supplier?.email          ?? '',
    phone:          supplier?.phone          ?? '',
    address:        supplier?.address        ?? '',
    lead_time_days: supplier?.lead_time_days ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) { setError('Supplier name is required.'); return; }
    setSaving(true);
    try {
      const payload = { ...form, lead_time_days: form.lead_time_days ? Number(form.lead_time_days) : null };
      if (isEdit) {
        const updated = await updateSupplier(supplier.id, payload);
        onSaved(updated, 'update');
      } else {
        const created = await createSupplier(payload);
        onSaved(created, 'create');
      }
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message
        || Object.values(err.response?.data?.errors || {}).flat()[0]
        || 'Failed to save supplier.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={isEdit ? 'Edit Supplier' : 'Add Supplier'} onClose={onClose}>
      {error && (
        <div className="inline-notice" style={{ background: '#fee2e2', color: '#991b1b', borderColor: '#fca5a5', marginBottom: 12 }}>⚠️ {error}</div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label>Supplier Name *</label>
            <input type="text" placeholder="e.g. Acme Appliances Inc." value={form.name} onChange={e => set('name', e.target.value)} disabled={saving} />
          </div>
          <div className="form-group">
            <label>Contact Person</label>
            <input type="text" placeholder="e.g. Juan Dela Cruz" value={form.contact_person} onChange={e => set('contact_person', e.target.value)} disabled={saving} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="supplier@example.com" value={form.email} onChange={e => set('email', e.target.value)} disabled={saving} />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input type="text" placeholder="09XX-XXX-XXXX" value={form.phone} onChange={e => set('phone', e.target.value)} disabled={saving} />
          </div>
          <div className="form-group">
            <label>Lead Time (days)</label>
            <input type="number" min="1" max="365" placeholder="7" value={form.lead_time_days} onChange={e => set('lead_time_days', e.target.value)} disabled={saving} />
          </div>
          <div className="form-group">
            <label>Address</label>
            <input type="text" placeholder="Optional address" value={form.address} onChange={e => set('address', e.target.value)} disabled={saving} />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
          <button type="button" className="btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
          <button type="submit" className="btn-dark" disabled={saving}>{saving ? 'Saving…' : isEdit ? 'Update' : 'Add Supplier'}</button>
        </div>
      </form>
    </Modal>
  );
};

// ---------------------------------------------------------------------------
// Main Settings Component
// ---------------------------------------------------------------------------
const Settings = () => {
  const { user, setUser } = useOutletContext() || {};
  const [activeTab, setActiveTab] = useState('profile');
  const [notice, setNotice]       = useState('');

  // Profile
  const [profileName,  setProfileName]  = useState(user?.name  ?? '');
  const [profileEmail, setProfileEmail] = useState(user?.email ?? '');
  const [profilePwd,   setProfilePwd]   = useState('');
  const [profilePwdC,  setProfilePwdC]  = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg,   setProfileMsg]   = useState('');

  // Users tab
  const [users, setUsers]               = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userModal, setUserModal]       = useState(null); // null | 'add' | user-object

  // Categories tab
  const [categories, setCategories]     = useState([]);
  const [catLoading, setCatLoading]     = useState(false);
  const [catModal, setCatModal]         = useState(null); // null | 'add' | category-object

  // Suppliers tab
  const [suppliers, setSuppliers]       = useState([]);
  const [supLoading, setSupLoading]     = useState(false);
  const [supModal, setSupModal]         = useState(null); // null | 'add' | supplier-object

  // Alerts tab
  const [thresholds, setThresholds]     = useState({
    seasonal_threshold_pct:   '30',
    expiry_warning_months:    '8',
    expiry_hard_limit_months: '9',
    low_stock_notifications:  'true',
    discrepancy_alerts:       'true',
  });
  const [thresholdsLoading, setThresholdsLoading] = useState(false);
  const [thresholdsSaving,  setThresholdsSaving]  = useState(false);
  const [thresholdsMsg,     setThresholdsMsg]     = useState('');

  // Appearance
  const [theme,   setThemeState] = useState(() => getStoredTheme());
  const [compact, setCompact]    = useState(() => getStoredCompact());

  useEffect(() => {
    const handleThemeEvent = (e) => setThemeState(e.detail.mode);
    const handleCompactEvent = (e) => setCompact(e.detail.isCompact);
    window.addEventListener('wb-theme-changed', handleThemeEvent);
    window.addEventListener('wb-compact-changed', handleCompactEvent);
    return () => {
      window.removeEventListener('wb-theme-changed', handleThemeEvent);
      window.removeEventListener('wb-compact-changed', handleCompactEvent);
    };
  }, []);

  const handleApplyTheme = (t) => {
    setThemeState(t);
    setGlobalTheme(t);
  };

  const handleApplyCompact = (v) => {
    setCompact(v);
    setGlobalCompact(v);
  };

  // ---- Data loaders ----

  useEffect(() => {
    if (activeTab !== 'alerts') return;
    setThresholdsLoading(true);
    getSettings()
      .then(data => setThresholds(prev => ({ ...prev, ...data })))
      .catch(() => {})
      .finally(() => setThresholdsLoading(false));
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== 'users') return;
    setUsersLoading(true);
    getUsers()
      .then(setUsers)
      .catch(() => {})
      .finally(() => setUsersLoading(false));
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== 'categories') return;
    setCatLoading(true);
    setSupLoading(true);
    getCategories().then(setCategories).catch(() => {}).finally(() => setCatLoading(false));
    getSuppliers().then(setSuppliers).catch(() => {}).finally(() => setSupLoading(false));
  }, [activeTab]);

  // ---- Handlers ----

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileMsg('');
    if (profilePwd && profilePwd !== profilePwdC) {
      setProfileMsg('⚠️ Passwords do not match.');
      return;
    }
    if (profilePwd && profilePwd.length < 8) {
      setProfileMsg('⚠️ Password must be at least 8 characters.');
      return;
    }
    setProfileSaving(true);
    try {
      const payload = { name: profileName, email: profileEmail };
      if (profilePwd) {
        payload.password = profilePwd;
        payload.password_confirmation = profilePwdC;
      }
      const res = await updateProfile(payload);
      // Update the stored user
      const updatedUser = { ...user, name: res.user?.name ?? profileName, email: res.user?.email ?? profileEmail };
      localStorage.setItem('wb_user', JSON.stringify(updatedUser));
      setProfileMsg('✓ Profile saved successfully.');
      setProfilePwd('');
      setProfilePwdC('');
    } catch (err) {
      const msg = err.response?.data?.message
        || Object.values(err.response?.data?.errors || {}).flat()[0]
        || 'Failed to update profile.';
      setProfileMsg(`⚠️ ${msg}`);
    } finally {
      setProfileSaving(false);
      setTimeout(() => setProfileMsg(''), 5000);
    }
  };

  const handleSaveThresholds = async (e) => {
    e.preventDefault();
    setThresholdsSaving(true);
    setThresholdsMsg('');
    try {
      await updateSettings(thresholds);
      setThresholdsMsg('✓ Thresholds saved successfully.');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save settings.';
      setThresholdsMsg(`⚠️ ${msg}`);
    } finally {
      setThresholdsSaving(false);
      setTimeout(() => setThresholdsMsg(''), 4000);
    }
  };

  const handleDeleteUser = async (userId) => {
    const userToDelete = users.find(u => u.id === userId);
    const confirmMsg = `Delete user "${userToDelete?.name}"?\n\nThis action cannot be undone.`;
    
    if (!window.confirm(confirmMsg)) return;
    
    try {
      await deleteUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
      alert(`✓ User "${userToDelete?.name}" deleted successfully.`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete user.';
      alert(`⚠️ ${msg}`);
      console.error('Delete user error:', err.response?.data);
    }
  };

  const handleToggleUserActive = async (userId) => {
    try {
      const updated = await toggleUserActive(userId);
      setUsers(prev => prev.map(u => u.id === userId ? updated : u));
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to toggle user status.';
      alert(`⚠️ ${msg}`);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await deleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete category.');
    }
  };

  const handleDeleteSupplier = async (id) => {
    if (!window.confirm('Delete this supplier?')) return;
    try {
      await deleteSupplier(id);
      setSuppliers(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete supplier.');
    }
  };

  const handleTabClick = (tab) => {
    if (!canAccessSettingsTab(user?.role, tab.id)) {
      setNotice(`🔒 ${tab.label} is restricted for ${user?.role || 'your role'}.`);
      clearTimeout(handleTabClick._t);
      handleTabClick._t = setTimeout(() => setNotice(''), 2800);
      return;
    }
    setNotice('');
    setActiveTab(tab.id);
  };

  const tabAllowed = canAccessSettingsTab(user?.role, activeTab);

  const noticeStyle = (msg) => ({
    background:  msg.startsWith('✓') ? '#dcfce7' : '#fee2e2',
    color:       msg.startsWith('✓') ? '#166534' : '#991b1b',
    borderColor: msg.startsWith('✓') ? '#86efac' : '#fca5a5',
    marginBottom: 8,
  });

  return (
    <div className="view-container">
      <h2>Settings</h2>
      <p className="view-subtitle">
        Manage your account, users, categories, suppliers, and system alert thresholds.
      </p>

      <div className="settings-layout">
        {/* ---- Sidebar tabs ---- */}
        <div className="settings-tabs">
          {TABS.map(tab => {
            const Icon    = tab.icon;
            const allowed = canAccessSettingsTab(user?.role, tab.id);
            return (
              <button
                key={tab.id}
                className={`settings-tab ${activeTab === tab.id ? 'active' : ''} ${!allowed ? 'locked' : ''}`}
                onClick={() => handleTabClick(tab)}
              >
                <Icon size={17} />
                {tab.label}
                {!allowed && <IconLock size={13} className="settings-tab-lock" />}
              </button>
            );
          })}
          {notice && <div className="settings-tab-notice">{notice}</div>}
        </div>

        {/* ---- Panel ---- */}
        <div className="settings-panel">
          {!tabAllowed ? (
            <div className="panel restricted-view restricted-view-inline">
              <div className="restricted-icon"><IconLock size={26} /></div>
              <h2>Access Restricted</h2>
              <p>Your role, <strong>{user?.role}</strong>, doesn't have permission to view this tab.</p>
              <button className="btn-dark" onClick={() => setActiveTab('profile')}>Back to Profile</button>
            </div>
          ) : (
            <>
              {/* ================= PROFILE ================= */}
              {activeTab === 'profile' && (
                <>
                  <div className="panel">
                    <h3>Profile Information</h3>
                    <div className="profile-header">
                      <span className="user-avatar" style={{ width: 56, height: 56, fontSize: 18 }}>
                        {initials(user?.name)}
                      </span>
                      <div>
                        <p className="profile-name">{user?.name || 'Guest User'}</p>
                        <span className={`status-pill ${roleTone[user?.role?.split(' ')[0]] || 'pill-blue'}`}>
                          {user?.role || 'Not signed in'}
                        </span>
                      </div>
                    </div>

                    <form onSubmit={handleSaveProfile}>
                      <div className="form-grid" style={{ marginTop: 24 }}>
                        <div className="form-group">
                          <label>Full Name</label>
                          <input type="text" value={profileName} onChange={e => setProfileName(e.target.value)} placeholder="Full name" disabled={profileSaving} />
                        </div>
                        <div className="form-group">
                          <label>Role</label>
                          <input type="text" value={user?.role || ''} disabled />
                        </div>
                        <div className="form-group">
                          <label>Email Address</label>
                          <input type="email" value={profileEmail} onChange={e => setProfileEmail(e.target.value)} placeholder="name@walangbrownout.ph" disabled={profileSaving} />
                        </div>
                        <div className="form-group">
                          <label>New Password <span style={{ color: '#94a3b8', fontWeight: 400 }}>(leave blank to keep)</span></label>
                          <input type="password" value={profilePwd} onChange={e => setProfilePwd(e.target.value)} placeholder="••••••••" disabled={profileSaving} autoComplete="new-password" />
                        </div>
                        <div className="form-group">
                          <label>Confirm New Password</label>
                          <input type="password" value={profilePwdC} onChange={e => setProfilePwdC(e.target.value)} placeholder="••••••••" disabled={profileSaving} autoComplete="new-password" />
                        </div>
                      </div>

                      {profileMsg && (
                        <div className="inline-notice" style={noticeStyle(profileMsg)}>
                          {profileMsg}
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
                        <button type="button" className="btn-secondary" onClick={() => { setProfileName(user?.name ?? ''); setProfileEmail(user?.email ?? ''); setProfilePwd(''); setProfilePwdC(''); }} disabled={profileSaving}>Cancel</button>
                        <button type="submit" className="btn-dark" disabled={profileSaving}>{profileSaving ? 'Saving…' : 'Save Changes'}</button>
                      </div>
                    </form>
                  </div>

                  {user?.role && (
                    <div className="panel" style={{ marginTop: 24 }}>
                      <h3>My Access</h3>
                      <p className="view-subtitle" style={{ marginBottom: 16 }}>{roleAccessNotes[user.role]}</p>
                      <div className="access-grid">
                        {Object.entries(PAGES).map(([key, label]) => {
                          const has = pageAccess[user.role]?.includes(key);
                          return (
                            <div key={key} className={`access-row ${has ? 'has' : 'no'}`}>
                              <span className="access-icon">{has ? <IconCheck size={13} /> : <IconLock size={13} />}</span>
                              {label}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* ================= USERS ================= */}
              {activeTab === 'users' && (
                <div className="panel">
                  <div className="panel-header-row">
                    <h3>Users &amp; Role-Based Access</h3>
                    <button className="btn-dark btn-with-icon" onClick={() => setUserModal('add')}>
                      <IconPlus size={15} /> Add User
                    </button>
                  </div>
                  <p className="view-subtitle" style={{ marginBottom: 18 }}>
                    Admins manage users, suppliers, and settings. Warehouse Staff handle Stock-In/Stock-Out.
                    Purchasing reviews reorder points before approving replenishment.
                  </p>
                  {usersLoading ? (
                    <p className="view-subtitle">Loading users…</p>
                  ) : (
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.length === 0 ? (
                          <tr><td colSpan={5} style={{ textAlign: 'center', color: '#94a3b8', padding: '16px 0' }}>No users found.</td></tr>
                        ) : users.map(u => {
                          const rd  = displayRole(u.role);
                          const tone = rd === 'Admin' ? 'pill-blue' : rd === 'Warehouse Staff' ? 'pill-violet' : 'pill-amber';
                          const isSelf = u.id === user?.id;
                          return (
                            <tr key={u.id}>
                              <td><strong>{u.name}</strong></td>
                              <td>{u.email}</td>
                              <td><span className={`status-pill ${tone}`}>{rd}</span></td>
                              <td>
                                <span className={`status-pill ${u.is_active ? 'pill-green' : 'pill-gray'}`}>
                                  {u.is_active ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td>
                                <button className="btn-micro" onClick={() => setUserModal(u)} title="Edit"><IconEdit size={13} /></button>
                                <button 
                                  className="btn-micro" 
                                  onClick={() => handleToggleUserActive(u.id)} 
                                  title={isSelf ? 'Cannot toggle your own status' : (u.is_active ? 'Deactivate' : 'Activate')}
                                  disabled={isSelf}
                                  style={isSelf ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
                                >
                                  {u.is_active ? '🔒' : '✓'}
                                </button>
                                <button 
                                  className="btn-micro danger" 
                                  onClick={() => handleDeleteUser(u.id)} 
                                  title={isSelf ? 'Cannot delete your own account' : 'Delete'}
                                  disabled={isSelf}
                                  style={isSelf ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
                                >
                                  <IconTrash size={13} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* ================= CATEGORIES & SUPPLIERS ================= */}
              {activeTab === 'categories' && (
                <>
                  <div className="panel" style={{ marginBottom: 24 }}>
                    <div className="panel-header-row">
                      <h3>Inventory Categories</h3>
                      <button className="btn-dark btn-with-icon" onClick={() => setCatModal('add')}>
                        <IconPlus size={15} /> Add Category
                      </button>
                    </div>
                    <p className="view-subtitle" style={{ marginBottom: 18 }}>
                      Classification drives which reorder logic and alert rules apply — seasonal forecasting,
                      formula-based ROP, or FIFO expiry tracking.
                    </p>
                    {catLoading ? (
                      <p className="view-subtitle">Loading categories…</p>
                    ) : (
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Category</th>
                            <th>Description</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {categories.length === 0 ? (
                            <tr><td colSpan={3} style={{ textAlign: 'center', color: '#94a3b8', padding: '16px 0' }}>No categories yet.</td></tr>
                          ) : categories.map(c => (
                            <tr key={c.id}>
                              <td><strong>{c.name}</strong></td>
                              <td>{c.description || '—'}</td>
                              <td>
                                <button className="btn-micro" onClick={() => setCatModal(c)} title="Edit"><IconEdit size={13} /></button>
                                <button className="btn-micro danger" onClick={() => handleDeleteCategory(c.id)} title="Delete"><IconTrash size={13} /></button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>

                  <div className="panel">
                    <div className="panel-header-row">
                      <h3>Suppliers</h3>
                      <button className="btn-dark btn-with-icon" onClick={() => setSupModal('add')}>
                        <IconPlus size={15} /> Add Supplier
                      </button>
                    </div>
                    {supLoading ? (
                      <p className="view-subtitle">Loading suppliers…</p>
                    ) : (
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Supplier</th>
                            <th>Contact Person</th>
                            <th>Phone</th>
                            <th>Email</th>
                            <th>Lead Time</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {suppliers.length === 0 ? (
                            <tr><td colSpan={6} style={{ textAlign: 'center', color: '#94a3b8', padding: '16px 0' }}>No suppliers yet.</td></tr>
                          ) : suppliers.map(s => (
                            <tr key={s.id}>
                              <td><strong>{s.name}</strong></td>
                              <td>{s.contact_person || '—'}</td>
                              <td>{s.phone || '—'}</td>
                              <td>{s.email || '—'}</td>
                              <td>{s.lead_time_days ? `${s.lead_time_days} days` : '—'}</td>
                              <td>
                                <button className="btn-micro" onClick={() => setSupModal(s)} title="Edit"><IconEdit size={13} /></button>
                                <button className="btn-micro danger" onClick={() => handleDeleteSupplier(s.id)} title="Delete"><IconTrash size={13} /></button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </>
              )}

              {/* ================= ALERTS ================= */}
              {activeTab === 'alerts' && (
                <div className="panel">
                  <h3>Alert &amp; Reorder Thresholds</h3>
                  <p className="view-subtitle" style={{ marginBottom: 22 }}>
                    Thresholds from the Analysis &amp; Architecture Blueprint — different rules for seasonal vs.
                    non-seasonal items, and an early-warning window for perishable filters.
                  </p>
                  {thresholdsLoading ? (
                    <p className="view-subtitle">Loading settings…</p>
                  ) : (
                    <form onSubmit={handleSaveThresholds}>
                      <div className="threshold-card">
                        <div className="threshold-card-head">
                          <span className="status-pill pill-blue">Seasonal Items</span>
                          <span className="threshold-example">e.g. Portable AC Units</span>
                        </div>
                        <p>Trigger a reorder 2–3 months before summer, or when stock falls below:</p>
                        <div className="form-group" style={{ maxWidth: 220 }}>
                          <label>Seasonal threshold (%)</label>
                          <input
                            type="number" min={0} max={100}
                            value={thresholds.seasonal_threshold_pct}
                            onChange={e => setThresholds(t => ({ ...t, seasonal_threshold_pct: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="threshold-card">
                        <div className="threshold-card-head">
                          <span className="status-pill pill-violet">Non-Seasonal Items</span>
                          <span className="threshold-example">e.g. Smart Thermostats, Air Purifiers</span>
                        </div>
                        <p>Use the formula-based Reorder Point:</p>
                        <div className="formula-box">
                          Reorder Point (ROP) = (Average Daily Demand × Lead Time) + Safety Stock
                        </div>
                      </div>

                      <div className="threshold-card">
                        <div className="threshold-card-head">
                          <span className="status-pill pill-amber">Perishable / FIFO Items</span>
                          <span className="threshold-example">e.g. Air Purifier Filters</span>
                        </div>
                        <p>Flag a batch once it has been in storage for:</p>
                        <div className="form-grid" style={{ maxWidth: 460 }}>
                          <div className="form-group">
                            <label>Expiry alert (months in storage)</label>
                            <input
                              type="number" min={0}
                              value={thresholds.expiry_warning_months}
                              onChange={e => setThresholds(t => ({ ...t, expiry_warning_months: e.target.value }))}
                            />
                          </div>
                          <div className="form-group">
                            <label>Hard expiration limit (months)</label>
                            <input
                              type="number" min={0}
                              value={thresholds.expiry_hard_limit_months}
                              onChange={e => setThresholds(t => ({ ...t, expiry_hard_limit_months: e.target.value }))}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="toggle-row">
                        <div>
                          <p className="toggle-title">Low-stock email notifications</p>
                          <p className="toggle-desc">Notify Purchasing when any item reaches its reorder point.</p>
                        </div>
                        <label className="switch">
                          <input
                            type="checkbox"
                            checked={thresholds.low_stock_notifications === 'true' || thresholds.low_stock_notifications === '1'}
                            onChange={e => setThresholds(t => ({ ...t, low_stock_notifications: e.target.checked ? 'true' : 'false' }))}
                          />
                          <span className="switch-track"><span className="switch-thumb" /></span>
                        </label>
                      </div>

                      <div className="toggle-row">
                        <div>
                          <p className="toggle-title">Discrepancy alerts (Mystery Shrinkage)</p>
                          <p className="toggle-desc">Flag mismatches between system count and physical cycle counts.</p>
                        </div>
                        <label className="switch">
                          <input
                            type="checkbox"
                            checked={thresholds.discrepancy_alerts === 'true' || thresholds.discrepancy_alerts === '1'}
                            onChange={e => setThresholds(t => ({ ...t, discrepancy_alerts: e.target.checked ? 'true' : 'false' }))}
                          />
                          <span className="switch-track"><span className="switch-thumb" /></span>
                        </label>
                      </div>

                      {thresholdsMsg && (
                        <div className="inline-notice" style={noticeStyle(thresholdsMsg)}>{thresholdsMsg}</div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
                        <button
                          type="button" className="btn-secondary"
                          onClick={() => setThresholds({ seasonal_threshold_pct: '30', expiry_warning_months: '8', expiry_hard_limit_months: '9', low_stock_notifications: 'true', discrepancy_alerts: 'true' })}
                          disabled={thresholdsSaving}
                        >
                          Reset to Defaults
                        </button>
                        <button type="submit" className="btn-dark" disabled={thresholdsSaving}>
                          {thresholdsSaving ? 'Saving…' : 'Save Thresholds'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* ================= APPEARANCE ================= */}
              {activeTab === 'appearance' && (
                <div className="panel">
                  <h3>Appearance</h3>
                  <p className="view-subtitle" style={{ marginBottom: 22 }}>
                    Personalize how the portal looks on your device. Changes apply immediately and are saved across sessions.
                  </p>

                  <h4 style={{ marginBottom: 14, fontSize: 13, fontWeight: 700, color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Color Theme</h4>
                  <div className="theme-grid">
                    {[
                      { id: 'light',  label: 'Light',  icon: IconSun,     desc: 'Clean & crisp' },
                      { id: 'dark',   label: 'Dark',   icon: IconMoon,    desc: 'High contrast' },
                      { id: 'system', label: 'System', icon: IconMonitor, desc: `Auto (${getSystemPreference()})` },
                    ].map(t => {
                      const Icon = t.icon;
                      const isSelected = theme === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          className={`theme-card ${isSelected ? 'selected' : ''}`}
                          onClick={() => handleApplyTheme(t.id)}
                        >
                          <div className={`theme-preview theme-preview-${t.id}`}>
                            <div className="theme-preview-bar" />
                            <div className="theme-preview-content">
                              <div className="theme-preview-line" />
                              <div className="theme-preview-box" />
                            </div>
                          </div>
                          <div className="theme-card-info">
                            <span className="theme-card-title">
                              <Icon size={15} />
                              {t.label}
                            </span>
                            <span className="theme-card-desc">{t.desc}</span>
                          </div>
                          {isSelected && (
                            <span className="theme-check-badge">
                              <IconCheck size={12} />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="toggle-row" style={{ marginTop: 28 }}>
                    <div>
                      <p className="toggle-title">Compact Table Density</p>
                      <p className="toggle-desc">Reduces row spacing on Products, Stock-In, and Audit Trails to fit more data on screen.</p>
                    </div>
                    <label className="switch">
                      <input type="checkbox" checked={compact} onChange={e => handleApplyCompact(e.target.checked)} />
                      <span className="switch-track"><span className="switch-thumb" /></span>
                    </label>
                  </div>

                  <div className="appearance-saved-notice">
                    <IconCheck size={16} />
                    <span>Appearance preferences are active and saved to your browser automatically.</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ---- Modals ---- */}
      {userModal && (
        <UserModal
          existingUser={userModal === 'add' ? null : userModal}
          currentUser={user}
          onClose={() => setUserModal(null)}
          onSaved={(saved, action) => {
            if (action === 'create') setUsers(prev => [saved, ...prev]);
            else setUsers(prev => prev.map(u => u.id === saved.id ? saved : u));
          }}
        />
      )}

      {catModal && (
        <CategoryModal
          category={catModal === 'add' ? null : catModal}
          onClose={() => setCatModal(null)}
          onSaved={(saved, action) => {
            if (action === 'create') setCategories(prev => [...prev, saved]);
            else setCategories(prev => prev.map(c => c.id === saved.id ? saved : c));
          }}
        />
      )}

      {supModal && (
        <SupplierModal
          supplier={supModal === 'add' ? null : supModal}
          onClose={() => setSupModal(null)}
          onSaved={(saved, action) => {
            if (action === 'create') setSuppliers(prev => [...prev, saved]);
            else setSuppliers(prev => prev.map(s => s.id === saved.id ? saved : s));
          }}
        />
      )}
    </div>
  );
};

export default Settings;
