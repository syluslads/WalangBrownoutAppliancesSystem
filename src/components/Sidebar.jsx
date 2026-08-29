import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();

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
        <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="icon">📊</span> Dashboard
        </NavLink>
        <NavLink to="/products" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="icon">📦</span> Products
        </NavLink>
        <NavLink to="/stock-in" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="icon">📥</span> Stock-In
        </NavLink>
        <NavLink to="/stock-out" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="icon">📤</span> Stock-Out
        </NavLink>
        <NavLink to="/audit-trails" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="icon">📜</span> Audit Trails
        </NavLink>
      </nav>
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={() => navigate('/')}>
          <span className="icon">🚪</span> Log Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;