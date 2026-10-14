import React, { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { getDashboard } from '../lib/api';
import { mockCategoryBreakdown } from '../data/product';
import { canAccessPage, canManageProducts } from '../data/permissions';
import {
  IconBox,
  IconTrendDown,
  IconClock,
  IconLock,
  IconAlert,
  IconStockIn,
  IconStockOut,
  IconPlus,
} from '../components/Icons';

const kpiIcon = {
  box: IconBox,
  'trend-down': IconTrendDown,
  clock: IconClock,
  lock: IconLock,
};

const severityClass = {
  high: 'alert-item-high',
  medium: 'alert-item-medium',
  low: 'alert-item-low',
};

const typeClass = {
  'Stock-In': 'pill-green',
  'IN': 'pill-green',
  'Stock-Out': 'pill-red',
  'OUT': 'pill-red',
  Adjustment: 'pill-amber',
};

// Module-level cache — survives route changes, cleared on page refresh
let _dashboardCache = null;

const Dashboard = () => {
  const { user } = useOutletContext() || {};
  const [notice, setNotice] = useState('');

  // Initialize from module-level cache so navigating back never flickers
  const [dashboardData, setDashboardData] = useState(() => _dashboardCache);
  const [apiError, setApiError] = useState('');

  // Real-time clock
  const [clock, setClock] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const clockDate = clock.toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const clockTime = clock.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const kpis    = dashboardData?.kpis ?? [];
  const alerts  = dashboardData?.alerts ?? [];
  const recentTx = dashboardData?.recent_transactions ?? [];

  useEffect(() => {
    let cancelled = false;

    getDashboard()
      .then((data) => {
        if (cancelled || !data) return;
        _dashboardCache = data;
        setDashboardData(data);
      })
      .catch(() => {
        if (!cancelled) setApiError('');
      });

    return () => { cancelled = true; };
  }, []);

  const blocked = (label) => {
    setNotice(`🔒 ${label} is restricted for ${user?.role || 'your role'}.`);
    clearTimeout(blocked._t);
    blocked._t = setTimeout(() => setNotice(''), 2800);
  };

  const canStockIn = canAccessPage(user?.role, 'stock-in');
  const canStockOut = canAccessPage(user?.role, 'stock-out');
  const canAddProduct = canManageProducts(user?.role);

  return (
    <div className="view-container">
      <div className="dashboard-hero">
        <div>
          <h2 style={{ marginBottom: 6 }}>Welcome back 👋</h2>
          <p className="view-subtitle">
            Here's what's happening across WalangBrownout Appliances' inventory right now.
          </p>
          <p className="dashboard-clock">📅 {clockDate} &nbsp;·&nbsp; 🕐 {clockTime}</p>
        </div>
        <div className="quick-actions">
          {canStockIn ? (
            <Link to="/stock-in" className="btn-dark btn-with-icon"><IconStockIn size={15} /> Stock-In</Link>
          ) : (
            <button className="btn-secondary btn-with-icon" onClick={() => blocked('Stock-In')}>
              <IconLock size={14} /> Stock-In
            </button>
          )}
          {canStockOut ? (
            <Link to="/stock-out" className="btn-secondary btn-with-icon"><IconStockOut size={15} /> Stock-Out</Link>
          ) : (
            <button className="btn-secondary btn-with-icon" onClick={() => blocked('Stock-Out')}>
              <IconLock size={14} /> Stock-Out
            </button>
          )}
          {canAddProduct ? (
            <Link to="/products" className="btn-secondary btn-with-icon"><IconPlus size={15} /> Add Product</Link>
          ) : (
            <button className="btn-secondary btn-with-icon" onClick={() => blocked('Add Product')}>
              <IconLock size={14} /> Add Product
            </button>
          )}
        </div>
      </div>

      {notice && <div className="inline-notice">{notice}</div>}
      {apiError && (
        <div className="inline-notice" style={{ background: '#fef3c7', color: '#92400e', borderColor: '#fcd34d' }}>
          ⚠️ {apiError}
        </div>
      )}

      {/* KPI Cards */}
      <div className="kpi-grid">
        {dashboardData === null ? (
          [0,1,2,3].map(i => <div key={i} className="kpi-card skeleton-pulse" style={{ minHeight: 90 }} />)
        ) : (
          kpis.map((kpi, index) => {
            const Icon = kpiIcon[kpi.icon] || IconBox;
            return (
              <div key={index} className={`kpi-card kpi-tone-${kpi.tone}`}>
                <div className="kpi-card-top">
                  <span className="kpi-icon"><Icon size={18} /></span>
                </div>
                <h3>{kpi.value}</h3>
                <p>{kpi.label}</p>
              </div>
            );
          })
        )}
      </div>

      <div className="dashboard-columns">
        {/* System Alerts */}
        <div className="panel">
          <h3>SYSTEM ALERTS</h3>
          {dashboardData === null ? (
            <p className="view-subtitle">Loading alerts…</p>
          ) : alerts.length === 0 ? (
            <p className="view-subtitle">No active alerts. All stock levels are healthy.</p>
          ) : (
            <ul className="alerts-list">
              {alerts.map((alert, index) => (
                <li key={index} className={`alert-item ${severityClass[alert.severity]}`}>
                  <span className="alert-icon"><IconAlert size={16} /></span>
                  <div>
                    <span className="alert-type">{alert.type}</span>
                    <p>{alert.message}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="panel">
          <h3>RECENT TRANSACTIONS</h3>
          {dashboardData === null ? (
            <p className="view-subtitle">Loading transactions…</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date/Time</th>
                  <th>Product</th>
                  <th>Type</th>
                  <th>Qty</th>
                  <th>Staff</th>
                </tr>
              </thead>
              <tbody>
                {recentTx.map((tx, index) => (
                  <tr key={index}>
                    <td>{tx.date}</td>
                    <td>{tx.product}</td>
                    <td>
                      <span className={`status-pill ${typeClass[tx.type] || 'pill-blue'}`}>
                        {tx.type}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: String(tx.qty).startsWith('+') ? '#16a34a' : '#dc2626' }}>
                      {tx.qty}
                    </td>
                    <td>{tx.staff}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ABC Analysis */}
      {dashboardData !== null && (
        <div className="panel" style={{ marginTop: 24 }}>
          <h3>INVENTORY CATEGORIZATION (ABC ANALYSIS)</h3>
          <p className="view-subtitle" style={{ marginBottom: 18 }}>
            Products are classified by value and turnover so each item gets the right monitoring policy —
            from frequent demand forecasting down to periodic manual review.
          </p>
          <div className="category-breakdown">
            {mockCategoryBreakdown.map((cat) => (
              <div className="category-row" key={cat.label}>
                <div className="category-row-label">
                  <span className="category-dot" style={{ backgroundColor: cat.color }} />
                  <div>
                    <p className="category-name">{cat.label}</p>
                    <p className="category-example">{cat.example}</p>
                  </div>
                </div>
                <div className="category-bar-track">
                  <div className="category-bar-fill" style={{ width: `${cat.pct}%`, backgroundColor: cat.color }} />
                </div>
                <span className="category-pct">{cat.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
