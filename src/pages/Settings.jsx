import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { mockUsers, mockCategories, mockSuppliers } from '../data/product';
import { canAccessSettingsTab, roleAccessNotes, pageAccess, PAGES } from '../data/permissions';
import { getSettings, updateSettings } from '../lib/api';
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
} from '../components/Icons';

const initials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('') || 'U';

const roleTone = {
  Admin: 'pill-blue',
  Warehouse: 'pill-violet',
  Purchasing: 'pill-amber',
};

const TABS = [
  { id: 'profile', label: 'Profile', icon: IconBuilding },
  { id: 'users', label: 'Users & Roles', icon: IconUsers },
  { id: 'categories', label: 'Categories & Suppliers', icon: IconLayers },
  { id: 'alerts', label: 'Alerts & Thresholds', icon: IconBell },
  { id: 'appearance', label: 'Appearance', icon: IconPalette },
];

const Settings = () => {
  const { user } = useOutletContext() || {};
  const [activeTab, setActiveTab] = useState('profile');
  const [notice, setNotice] = useState('');

  // Alert thresholds — loaded from the API for the Alerts tab.
  const [thresholds, setThresholds] = useState({
    seasonal_threshold_pct:   '30',
    expiry_warning_months:    '8',
    expiry_hard_limit_months: '9',
    low_stock_notifications:  'true',
    discrepancy_alerts:       'true',
  });
  const [thresholdsLoading, setThresholdsLoading] = useState(false);
  const [thresholdsSaving,  setThresholdsSaving]  = useState(false);
  const [thresholdsMsg,     setThresholdsMsg]     = useState('');

  // Load settings when the alerts tab becomes active.
  useEffect(() => {
    if (activeTab !== 'alerts') return;
    setThresholdsLoading(true);
    getSettings()
      .then((data) => {
        setThresholds((prev) => ({ ...prev, ...data }));
      })
      .catch(() => { /* silently fall back to defaults */ })
      .finally(() => setThresholdsLoading(false));
  }, [activeTab]);

  const handleSaveThresholds = async (e) => {
    e.preventDefault();
    setThresholdsSaving(true);
    setThresholdsMsg('');
    try {
      await updateSettings(thresholds);
      setThresholdsMsg('✓ Thresholds saved successfully.');
    } catch (err) {
      const apiMsg = err.response?.data?.message || 'Failed to save settings.';
      setThresholdsMsg(`⚠️ ${apiMsg}`);
    } finally {
      setThresholdsSaving(false);
      setTimeout(() => setThresholdsMsg(''), 4000);
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

  return (
    <div className="view-container">
      <h2>Settings</h2>
      <p className="view-subtitle">
        Manage your account, users, categories, suppliers, and system alert thresholds. This screen is a UI
        prototype — nothing here is saved to a server yet.
      </p>

      <div className="settings-layout">
        <div className="settings-tabs">
          {TABS.map((tab) => {
            const Icon = tab.icon;
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

        <div className="settings-panel">
          {!tabAllowed ? (
            <div className="panel restricted-view restricted-view-inline">
              <div className="restricted-icon"><IconLock size={26} /></div>
              <h2>Access Restricted</h2>
              <p>
                Your role, <strong>{user?.role}</strong>, doesn't have permission to view this tab.
              </p>
              <button className="btn-dark" onClick={() => setActiveTab('profile')}>Back to Profile</button>
            </div>
          ) : (
            <>
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

                    <div className="form-grid" style={{ marginTop: 24 }}>
                      <div className="form-group">
                        <label>Full Name</label>
                        <input type="text" defaultValue={user?.name || ''} placeholder="Full name" />
                      </div>
                      <div className="form-group">
                        <label>Role</label>
                        <input type="text" defaultValue={user?.role || ''} disabled />
                      </div>
                      <div className="form-group">
                        <label>Email Address</label>
                        <input type="email" placeholder="name@walangbrownout.ph" />
                      </div>
                      <div className="form-group">
                        <label>Contact Number</label>
                        <input type="text" placeholder="09XX-XXX-XXXX" />
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
                      <button className="btn-secondary">Cancel</button>
                      <button className="btn-dark">Save Changes</button>
                    </div>
                  </div>

                  {user?.role && (
                    <div className="panel" style={{ marginTop: 24 }}>
                      <h3>My Access</h3>
                      <p className="view-subtitle" style={{ marginBottom: 16 }}>
                        {roleAccessNotes[user.role]}
                      </p>
                      <div className="access-grid">
                        {Object.entries(PAGES).map(([key, label]) => {
                          const has = pageAccess[user.role]?.includes(key);
                          return (
                            <div key={key} className={`access-row ${has ? 'has' : 'no'}`}>
                              <span className="access-icon">
                                {has ? <IconCheck size={13} /> : <IconLock size={13} />}
                              </span>
                              {label}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}

              {activeTab === 'users' && (
                <div className="panel">
                  <div className="panel-header-row">
                    <h3>Users &amp; Role-Based Access</h3>
                    <button className="btn-dark btn-with-icon"><IconPlus size={15} /> Add User</button>
                  </div>
                  <p className="view-subtitle" style={{ marginBottom: 18 }}>
                    Admins manage users, suppliers, and settings. Warehouse Staff handle Stock-In/Stock-Out.
                    Purchasing reviews reorder points before approving replenishment.
                  </p>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Username</th>
                        <th>Role</th>
                        <th>Email</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockUsers.map((u) => (
                        <tr key={u.id}>
                          <td><strong>{u.name}</strong></td>
                          <td>{u.username}</td>
                          <td><span className={`status-pill ${roleTone[u.role] || 'pill-blue'}`}>{u.role}</span></td>
                          <td>{u.email}</td>
                          <td>
                            <button className="btn-micro"><IconEdit size={13} /></button>
                            <button className="btn-micro danger"><IconTrash size={13} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'categories' && (
                <>
                  <div className="panel" style={{ marginBottom: 24 }}>
                    <div className="panel-header-row">
                      <h3>Inventory Categories</h3>
                      <button className="btn-dark btn-with-icon"><IconPlus size={15} /> Add Category</button>
                    </div>
                    <p className="view-subtitle" style={{ marginBottom: 18 }}>
                      Classification drives which reorder logic and alert rules apply — seasonal forecasting,
                      formula-based ROP, or FIFO expiry tracking.
                    </p>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Category</th>
                          <th>Type</th>
                          <th>Notes</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mockCategories.map((c) => (
                          <tr key={c.id}>
                            <td><strong>{c.name}</strong></td>
                            <td><span className="status-pill pill-blue">{c.type}</span></td>
                            <td>{c.description}</td>
                            <td>
                              <button className="btn-micro"><IconEdit size={13} /></button>
                              <button className="btn-micro danger"><IconTrash size={13} /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="panel">
                    <div className="panel-header-row">
                      <h3>Suppliers</h3>
                      <button className="btn-dark btn-with-icon"><IconPlus size={15} /> Add Supplier</button>
                    </div>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Supplier</th>
                          <th>Contact Person</th>
                          <th>Phone</th>
                          <th>Email</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mockSuppliers.map((s) => (
                          <tr key={s.id}>
                            <td><strong>{s.name}</strong></td>
                            <td>{s.contact}</td>
                            <td>{s.phone}</td>
                            <td>{s.email}</td>
                            <td>
                              <button className="btn-micro"><IconEdit size={13} /></button>
                              <button className="btn-micro danger"><IconTrash size={13} /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

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
                            type="number"
                            min={0}
                            max={100}
                            value={thresholds.seasonal_threshold_pct}
                            onChange={(e) => setThresholds((t) => ({ ...t, seasonal_threshold_pct: e.target.value }))}
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
                              type="number"
                              min={0}
                              value={thresholds.expiry_warning_months}
                              onChange={(e) => setThresholds((t) => ({ ...t, expiry_warning_months: e.target.value }))}
                            />
                          </div>
                          <div className="form-group">
                            <label>Hard expiration limit (months)</label>
                            <input
                              type="number"
                              min={0}
                              value={thresholds.expiry_hard_limit_months}
                              onChange={(e) => setThresholds((t) => ({ ...t, expiry_hard_limit_months: e.target.value }))}
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
                            onChange={(e) => setThresholds((t) => ({ ...t, low_stock_notifications: e.target.checked ? 'true' : 'false' }))}
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
                            onChange={(e) => setThresholds((t) => ({ ...t, discrepancy_alerts: e.target.checked ? 'true' : 'false' }))}
                          />
                          <span className="switch-track"><span className="switch-thumb" /></span>
                        </label>
                      </div>

                      {thresholdsMsg && (
                        <div
                          className="inline-notice"
                          style={{
                            background: thresholdsMsg.startsWith('✓') ? '#dcfce7' : '#fee2e2',
                            color:      thresholdsMsg.startsWith('✓') ? '#166534' : '#991b1b',
                            borderColor: thresholdsMsg.startsWith('✓') ? '#86efac' : '#fca5a5',
                            marginBottom: 8,
                          }}
                        >
                          {thresholdsMsg}
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => setThresholds({
                            seasonal_threshold_pct: '30',
                            expiry_warning_months: '8',
                            expiry_hard_limit_months: '9',
                            low_stock_notifications: 'true',
                            discrepancy_alerts: 'true',
                          })}
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

              {activeTab === 'appearance' && (
                <div className="panel">
                  <h3>Appearance</h3>
                  <p className="view-subtitle" style={{ marginBottom: 22 }}>
                    Personalize how the portal looks on your device.
                  </p>

                  <div className="theme-grid">
                    <button type="button" className="theme-card selected">
                      <span className="theme-preview theme-preview-light" />
                      Light
                    </button>
                    <button type="button" className="theme-card">
                      <span className="theme-preview theme-preview-dark" />
                      Dark
                    </button>
                    <button type="button" className="theme-card">
                      <span className="theme-preview theme-preview-system" />
                      System
                    </button>
                  </div>

                  <div className="toggle-row" style={{ marginTop: 24 }}>
                    <div>
                      <p className="toggle-title">Compact table rows</p>
                      <p className="toggle-desc">Show more items per screen on Products and Audit Trails.</p>
                    </div>
                    <label className="switch">
                      <input type="checkbox" />
                      <span className="switch-track"><span className="switch-thumb" /></span>
                    </label>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
