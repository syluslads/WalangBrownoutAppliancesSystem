import React, { useState } from 'react';
import { Routes, Route, Outlet, Navigate, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import RestrictedAccess from './components/RestrictedAccess';
import LoginForm from './pages/LoginForm';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import StockIn from './pages/StockIn';
import StockOut from './pages/StockOut';
import AuditTrails from './pages/AuditTrails';
import Settings from './pages/Settings';
import { canAccessPage, PAGES } from './data/permissions';
import './App.css';

const MainLayout = ({ user, onLogout }) => {
  return (
    <div className="app-container">
      <Sidebar user={user} onLogout={onLogout} />
      <div className="content-area">
        <Topbar user={user} />
        <main className="main-content">
          <Outlet context={{ user }} />
        </main>
      </div>
    </div>
  );
};

// Wraps a page element with a role check. If the signed-in role isn't
// permitted to view this page, an "Access Restricted" screen is shown
// instead — this is a UI/navigation guard only, not a security boundary.
const Guarded = ({ user, pageKey, children }) => {
  if (canAccessPage(user?.role, pageKey)) return children;
  return <RestrictedAccess role={user?.role} pageKey={pageKey} pageTitle={PAGES[pageKey]} />;
};

function App() {
  const navigate = useNavigate();
  // Prototype-only session state — no auth backend. Kept in memory so the
  // sidebar / topbar / settings pages can reflect the role chosen at login.
  const [user, setUser] = useState(null);

  const handleLogin = (loggedInUser) => setUser(loggedInUser);
  const handleLogout = () => {
    setUser(null);
    navigate('/');
  };

  return (
    <Routes>
      <Route path="/" element={<LoginForm onLogin={handleLogin} />} />

      <Route element={<MainLayout user={user} onLogout={handleLogout} />}>
        <Route path="/dashboard" element={<Guarded user={user} pageKey="dashboard"><Dashboard /></Guarded>} />
        <Route path="/products" element={<Guarded user={user} pageKey="products"><Products /></Guarded>} />
        <Route path="/stock-in" element={<Guarded user={user} pageKey="stock-in"><StockIn /></Guarded>} />
        <Route path="/stock-out" element={<Guarded user={user} pageKey="stock-out"><StockOut /></Guarded>} />
        <Route path="/audit-trails" element={<Guarded user={user} pageKey="audit-trails"><AuditTrails /></Guarded>} />
        <Route path="/settings" element={<Guarded user={user} pageKey="settings"><Settings /></Guarded>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
