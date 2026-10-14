import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  IconSearch,
  IconBell,
  IconMenu,
  IconSun,
  IconMoon,
  IconMonitor,
  IconUser,
  IconSettings,
  IconLogout,
  IconChevronDown,
} from './Icons';
import { getStoredTheme, applyTheme } from '../lib/theme';
import { getDashboard, getProducts } from '../lib/api';

const pageMeta = {
  '/dashboard':    { title: 'Dashboard Overview',    crumb: 'Dashboard'    },
  '/products':     { title: 'Product Catalog',       crumb: 'Products'     },
  '/stock-in':     { title: 'Stock-In Operations',   crumb: 'Stock-In'     },
  '/stock-out':    { title: 'Stock-Out & Dispatch',  crumb: 'Stock-Out'    },
  '/audit-trails': { title: 'System Audit Trails',   crumb: 'Audit Trails' },
  '/settings':     { title: 'Settings',              crumb: 'Settings'     },
};

const initials = (name = '') =>
  name.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase()).join('') || 'U';

const Topbar = ({ user, onToggleMobileMenu, onLogout }) => {
  const { pathname } = useLocation();
  const navigate     = useNavigate();
  const meta         = pageMeta[pathname] || { title: '', crumb: '' };
  const [query, setQuery] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(() => getStoredTheme());
  const [alerts, setAlerts] = useState([]);
  const [liveProducts, setLiveProducts] = useState([]);

  const userDropdownRef = useRef(null);
  const notifDropdownRef = useRef(null);

  // Sync theme changes if modified elsewhere (e.g. Settings page)
  useEffect(() => {
    const handleThemeChange = (e) => {
      setCurrentTheme(e.detail.mode);
    };
    window.addEventListener('wb-theme-changed', handleThemeChange);
    return () => window.removeEventListener('wb-theme-changed', handleThemeChange);
  }, []);

  // Fetch alerts on mount and refresh every 30 seconds; also listen for wb:refresh-alerts
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const dash = await getDashboard();
        setAlerts(dash?.alerts ?? []);
      } catch {}
    };
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30_000);
    window.addEventListener('wb:refresh-alerts', fetchAlerts);
    return () => {
      clearInterval(interval);
      window.removeEventListener('wb:refresh-alerts', fetchAlerts);
    };
  }, []);

  // Fetch real products for search autocomplete
  useEffect(() => {
    getProducts({ per_page: 200 })
      .then(res => setLiveProducts(res?.data ?? []))
      .catch(() => {});
  }, []);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(e.target)) {
        setNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setUserDropdownOpen(false);
    setNotifDropdownOpen(false);
  }, [pathname]);

  const [searchFocused, setSearchFocused] = useState(false);
  const searchContainerRef = useRef(null);

  const searchablePages = [
    { name: 'Dashboard Overview', path: '/dashboard', keywords: ['dashboard', 'overview', 'kpi', 'metrics', 'home'] },
    { name: 'Product Catalog', path: '/products', keywords: ['products', 'catalog', 'items', 'sku', 'inventory'] },
    { name: 'Stock-In Operations', path: '/stock-in', keywords: ['stock-in', 'stock in', 'receive', 'receiving', 'inbound', 'shipment', 'batch'] },
    { name: 'Stock-Out & Dispatch', path: '/stock-out', keywords: ['stock-out', 'stock out', 'dispatch', 'release', 'issue', 'outbound', 'fifo'] },
    { name: 'System Audit Trails', path: '/audit-trails', keywords: ['audit', 'trails', 'history', 'logs', 'transactions', 'audit trails'] },
    { name: 'Settings & Appearance', path: '/settings', keywords: ['settings', 'appearance', 'theme', 'dark mode', 'users', 'profile', 'system mode'] },
  ];

  const q = query.trim().toLowerCase();
  const matchedPages = q ? searchablePages.filter(p =>
    p.name.toLowerCase().includes(q) || p.keywords.some(k => k.includes(q))
  ) : [];

  const matchedProducts = q ? liveProducts.filter(p =>
    p.name?.toLowerCase().includes(q) ||
    p.sku?.toLowerCase().includes(q) ||
    p.category?.name?.toLowerCase().includes(q)
  ) : [];

  const hasSearchMatches = matchedPages.length > 0 || matchedProducts.length > 0;

  // Click outside to close search dropdown
  useEffect(() => {
    const handleOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const term = query.trim().toLowerCase();
    if (!term) return;

    setSearchFocused(false);

    // 1. Direct page intent match
    const pageMatch = searchablePages.find(p =>
      p.name.toLowerCase() === term || p.keywords.some(k => k === term)
    );
    if (pageMatch) {
      navigate(pageMatch.path);
      return;
    }

    // 2. Exact product SKU match
    const skuMatch = liveProducts.find(p => p.sku?.toLowerCase() === term);
    if (skuMatch) {
      navigate(`/products?search=${encodeURIComponent(skuMatch.sku)}`);
      return;
    }

    // 3. Fallback to product search filter
    navigate(`/products?search=${encodeURIComponent(query.trim())}`);
  };

  const handleSelectPage = (path) => {
    setSearchFocused(false);
    setQuery('');
    navigate(path);
  };

  const handleSelectProduct = (sku) => {
    setSearchFocused(false);
    setQuery('');
    navigate(`/products?search=${encodeURIComponent(sku)}`);
  };

  const handleSelectTheme = (mode) => {
    setCurrentTheme(mode);
    applyTheme(mode);
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          type="button"
          className="mobile-hamburger-btn"
          onClick={onToggleMobileMenu}
          aria-label="Open navigation menu"
        >
          <IconMenu size={22} />
        </button>

        <div>
          <p className="topbar-breadcrumb">WalangBrownout / <span>{meta.crumb}</span></p>
          <h1 className="topbar-title">{meta.title}</h1>
        </div>
      </div>

      <div className="topbar-right">
        <div className="topbar-search-container" ref={searchContainerRef} style={{ position: 'relative' }}>
          <form className="topbar-search" onSubmit={handleSearch}>
            <IconSearch size={16} />
            <input
              type="text"
              placeholder="Search products, SKU, pages…"
              value={query}
              onChange={e => { setQuery(e.target.value); setSearchFocused(true); }}
              onFocus={() => setSearchFocused(true)}
              aria-label="Global search"
            />
          </form>

          {/* Autocomplete Quick-Jump Dropdown */}
          {searchFocused && q && hasSearchMatches && (
            <div className="topbar-menu-dropdown search-autocomplete-dropdown" style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: 8,
              zIndex: 1000,
              maxHeight: 360,
              overflowY: 'auto',
            }}>
              {matchedPages.length > 0 && (
                <div style={{ padding: '6px 0' }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', padding: '4px 14px', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                    Pages &amp; Sections
                  </p>
                  {matchedPages.map(page => (
                    <button
                      key={page.path}
                      type="button"
                      className="search-item-btn"
                      onClick={() => handleSelectPage(page.path)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 14px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'inherit',
                      }}
                    >
                      <span style={{ fontWeight: 600, fontSize: 13.5 }}>📄 {page.name}</span>
                      <span style={{ fontSize: 11, color: '#64748b' }}>Jump to page →</span>
                    </button>
                  ))}
                </div>
              )}

              {matchedPages.length > 0 && matchedProducts.length > 0 && <div className="dropdown-divider" style={{ margin: '4px 0' }} />}

              {matchedProducts.length > 0 && (
                <div style={{ padding: '6px 0' }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', padding: '4px 14px', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                    Products &amp; Inventory
                  </p>
                  {matchedProducts.map(prod => (
                    <button
                      key={prod.sku}
                      type="button"
                      className="search-item-btn"
                      onClick={() => handleSelectProduct(prod.sku)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 14px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'inherit',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13.5 }}>📦 {prod.name}</div>
                        <div style={{ fontSize: 11.5, color: '#64748b' }}>{prod.sku} · {prod.category?.name ?? prod.category}</div>
                      </div>
                      <span style={{ fontSize: 11, color: '#3b82f6' }}>View details →</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Notifications Button & Dropdown */}
        <div className="topbar-dropdown-anchor" ref={notifDropdownRef}>
          <button
            type="button"
            className="topbar-icon-btn"
            style={{ position: 'relative' }}
            aria-label="Notifications"
            onClick={() => {
              setNotifDropdownOpen(prev => !prev);
              setUserDropdownOpen(false);
            }}
          >
            <IconBell size={18} />
            {alerts.length > 0 && (
              <span className="topbar-notif-badge">{alerts.length > 9 ? '9+' : alerts.length}</span>
            )}
          </button>

          {notifDropdownOpen && (
            <div className="topbar-menu-dropdown notif-dropdown">
              <div className="notif-header">
                <h4>Notifications</h4>
                <span className="notif-badge">{alerts.length} Active</span>
              </div>
              <div className="notif-list">
                {alerts.length === 0 ? (
                  <div className="notif-item">
                    <div className="notif-text">
                      <p className="notif-title">All clear</p>
                      <p className="notif-time">No active alerts.</p>
                    </div>
                  </div>
                ) : (
                  alerts.slice(0, 10).map((alert, i) => (
                    <div key={i} className={`notif-item ${alert.severity === 'high' ? 'unread' : ''}`}>
                      <span className="notif-dot" style={{ backgroundColor: alert.severity === 'high' ? '#ef4444' : '#f59e0b' }} />
                      <div className="notif-text">
                        <p className="notif-title">{alert.type}</p>
                        <p className="notif-time">{alert.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Button & Lively Dropdown Menu */}
        <div className="topbar-dropdown-anchor" ref={userDropdownRef}>
          <button
            type="button"
            className={`topbar-user-btn ${userDropdownOpen ? 'active' : ''}`}
            onClick={() => {
              setUserDropdownOpen(prev => !prev);
              setNotifDropdownOpen(false);
            }}
            aria-expanded={userDropdownOpen}
          >
            <span className="topbar-avatar">{initials(user?.name)}</span>
            <span className="topbar-user-text">
              <span className="topbar-user-name">{user?.name || 'Guest'}</span>
              <span className="topbar-user-role">{user?.role || 'User'}</span>
            </span>
            <IconChevronDown size={14} className={`topbar-chevron ${userDropdownOpen ? 'rotated' : ''}`} />
          </button>

          {userDropdownOpen && (
            <div className="topbar-menu-dropdown user-dropdown">
              <div className="dropdown-user-header">
                <span className="user-avatar-large">{initials(user?.name)}</span>
                <div className="dropdown-user-meta">
                  <p className="dropdown-name">{user?.name || 'Guest User'}</p>
                  <p className="dropdown-email">{user?.email || 'user@walangbrownout.ph'}</p>
                  <span className="dropdown-role-pill">{user?.role || 'Guest'}</span>
                </div>
              </div>

              <div className="dropdown-divider" />

              {/* Quick Theme Switcher */}
              <div className="dropdown-theme-section">
                <p className="dropdown-section-title">THEME PREFERENCE</p>
                <div className="theme-toggle-chips">
                  <button
                    type="button"
                    className={`theme-chip ${currentTheme === 'light' ? 'selected' : ''}`}
                    onClick={() => handleSelectTheme('light')}
                  >
                    <IconSun size={14} /> Light
                  </button>
                  <button
                    type="button"
                    className={`theme-chip ${currentTheme === 'dark' ? 'selected' : ''}`}
                    onClick={() => handleSelectTheme('dark')}
                  >
                    <IconMoon size={14} /> Dark
                  </button>
                  <button
                    type="button"
                    className={`theme-chip ${currentTheme === 'system' ? 'selected' : ''}`}
                    onClick={() => handleSelectTheme('system')}
                  >
                    <IconMonitor size={14} /> System
                  </button>
                </div>
              </div>

              <div className="dropdown-divider" />

              <div className="dropdown-links">
                <Link to="/settings" className="dropdown-link" onClick={() => setUserDropdownOpen(false)}>
                  <IconUser size={16} />
                  <span>My Profile</span>
                </Link>
                <Link to="/settings" className="dropdown-link" onClick={() => setUserDropdownOpen(false)}>
                  <IconSettings size={16} />
                  <span>Settings &amp; Appearance</span>
                </Link>
              </div>

              <div className="dropdown-divider" />

              <button
                type="button"
                className="dropdown-logout-btn"
                onClick={() => {
                  setUserDropdownOpen(false);
                  onLogout?.();
                }}
              >
                <IconLogout size={16} />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
