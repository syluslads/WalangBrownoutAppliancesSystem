import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { IconSearch, IconBell } from './Icons';

const pageMeta = {
  '/dashboard': { title: 'Dashboard Overview', crumb: 'Dashboard' },
  '/products': { title: 'Product Catalog', crumb: 'Products' },
  '/stock-in': { title: 'Stock-In Operations', crumb: 'Stock-In' },
  '/stock-out': { title: 'Stock-Out & Dispatch', crumb: 'Stock-Out' },
  '/audit-trails': { title: 'System Audit Trails', crumb: 'Audit Trails' },
  '/settings': { title: 'Settings', crumb: 'Settings' },
};

const initials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('') || 'U';

const Topbar = ({ user }) => {
  const { pathname } = useLocation();
  const meta = pageMeta[pathname] || { title: '', crumb: '' };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <p className="topbar-breadcrumb">WalangBrownout / <span>{meta.crumb}</span></p>
        <h1 className="topbar-title">{meta.title}</h1>
      </div>

      <div className="topbar-right">
        <div className="topbar-search">
          <IconSearch size={16} />
          <input type="text" placeholder="Search anything…" />
        </div>

        <button className="topbar-icon-btn" aria-label="Notifications">
          <IconBell size={18} />
          <span className="topbar-dot" />
        </button>

        <Link to="/settings" className="topbar-user">
          <span className="topbar-avatar">{initials(user?.name)}</span>
          <span className="topbar-user-text">
            <span className="topbar-user-name">{user?.name || 'Guest'}</span>
            <span className="topbar-user-role">{user?.role || 'Not signed in'}</span>
          </span>
        </Link>
      </div>
    </header>
  );
};

export default Topbar;
