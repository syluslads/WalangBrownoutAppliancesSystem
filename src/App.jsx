import React, { useState, useEffect } from 'react';
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
import { getStoredUser, logout as apiLogout } from './lib/api';
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

  // Rehydrate user from localStorage on first load so a page refresh does
  // not drop the session (the token is persisted; we just need the user object).
  const [user, setUser] = useState(() => getStoredUser());

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    navigate('/dashboard');
  };

  const handleLogout = async () => {
    await apiLogout();
    setUser(null);
    navigate('/');
  };

  // If the page is refreshed while on a protected route but there is no
  // stored user, redirect to login.
  const isLoggedIn = Boolean(user);

  return (
    <Routes>
      <Route
        path="/"
        element={
          isLoggedIn
            ? <Navigate to="/dashboard" replace />
            : <LoginForm onLogin={handleLogin} />
        }
      />

      {/* Protected layout — redirect to login if not authenticated */}
      <Route
        element={
          isLoggedIn
            ? <MainLayout user={user} onLogout={handleLogout} />
            : <Navigate to="/" replace />
        }
      >
        <Route path="/dashboard"    element={<Guarded user={user} pageKey="dashboard"><Dashboard /></Guarded>} />
        <Route path="/products"     element={<Guarded user={user} pageKey="products"><Products /></Guarded>} />
        <Route path="/stock-in"     element={<Guarded user={user} pageKey="stock-in"><StockIn /></Guarded>} />
        <Route path="/stock-out"    element={<Guarded user={user} pageKey="stock-out"><StockOut /></Guarded>} />
        <Route path="/audit-trails" element={<Guarded user={user} pageKey="audit-trails"><AuditTrails /></Guarded>} />
        <Route path="/settings"     element={<Guarded user={user} pageKey="settings"><Settings /></Guarded>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
