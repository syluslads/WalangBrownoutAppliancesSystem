import React, { useState, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import {
  IconDashboard,
  IconBox,
  IconStockIn,
  IconStockOut,
  IconAudit,
  IconSettings,
  IconLogout,
  IconLock,
} from './Icons';
import { canAccessPage } from '../data/permissions';

const initials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('') || 'U';

const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [{ to: '/dashboard', key: 'dashboard', icon: IconDashboard, text: 'Dashboard' }],
  },
  {
    label: 'Inventory',
    items: [
      { to: '/products', key: 'products', icon: IconBox, text: 'Products' },
      { to: '/stock-in', key: 'stock-in', icon: IconStockIn, text: 'Stock-In' },
      { to: '/stock-out', key: 'stock-out', icon: IconStockOut, text: 'Stock-Out' },
      { to: '/audit-trails', key: 'audit-trails', icon: IconAudit, text: 'Audit Trails' },
    ],
  },
  {
    label: 'System',
    items: [{ to: '/settings', key: 'settings', icon: IconSettings, text: 'Settings' }],
  },
];

const Sidebar = ({ user, onLogout }) => {
  const [notice, setNotice] = useState('');
  const timeoutRef = useRef(null);

  const showRestrictedNotice = (label) => {
    setNotice(`🔒 ${label} is restricted for ${user?.role || 'your role'}.`);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setNotice(''), 2800);
  };

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="logo-box">WB</div>
        <div>
          <h3>WalangBrownout</h3>
          <p className="sub-text">Inventory Portal</p>
        </div>
      </div>

      <nav className="nav-menu">
        {NAV_SECTIONS.map((section) => (
          <React.Fragment key={section.label}>
            <p className="nav-section-label">{section.label}</p>
            {section.items.map((item) => {
              const Icon = item.icon;
              const allowed = canAccessPage(user?.role, item.key);

              if (!allowed) {
                return (
                  <button
                    key={item.key}
                    type="button"
                    className="nav-item nav-item-locked"
                    onClick={() => showRestrictedNotice(item.text)}
                  >
                    <span className="icon"><Icon size={18} /></span>
                    {item.text}
                    <span className="nav-lock"><IconLock size={13} /></span>
                  </button>
                );
              }

              return (
                <NavLink
                  key={item.key}
                  to={item.to}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                  <span className="icon"><Icon size={18} /></span>
                  {item.text}
                </NavLink>
              );
            })}
          </React.Fragment>
        ))}
      </nav>

      {notice && <div className="sidebar-notice">{notice}</div>}

      <div className="sidebar-footer">
        <div className="user-card">
          <span className="user-avatar">{initials(user?.name)}</span>
          <div className="user-card-text">
            <span className="user-card-name">{user?.name || 'Guest User'}</span>
            <span className="user-card-role">{user?.role || 'Not signed in'}</span>
          </div>
        </div>
        <button className="logout-btn" onClick={onLogout}>
          <span className="icon"><IconLogout size={18} /></span> Log Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
