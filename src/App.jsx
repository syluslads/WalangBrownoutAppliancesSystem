import React, { useState, useEffect } from 'react';
import { Routes, Route, Outlet, Navigate, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import RestrictedAccess from './components/RestrictedAccess';
import LoginForm from './pages/LoginForm';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import StockIn from './pages/StockIn';
import StockOut from './pages/StockOut';
import AuditTrails from './pages/AuditTrails';
import Settings from './pages/Settings';
import { canAccessPage, PAGES } from './data/permissions';
import { getStoredUser, logout as apiLogout } from './lib/api';
import { initThemeSystem } from './lib/theme';
import './App.css';

const MainLayout = ({ user, setUser, onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="app-container">
      <Sidebar
        user={user}
        onLogout={onLogout}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
      <div className="content-area">
        <Topbar
          user={user}
          onLogout={onLogout}
          onToggleMobileMenu={() => setMobileMenuOpen(prev => !prev)}
        />
        <main className="main-content">
          <Outlet context={{ user, setUser }} />
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

  // Apply theme and compact mode preferences on startup + listen to OS system changes
  useEffect(() => {
    initThemeSystem();
  }, []);

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    navigate('/dashboard');
  };

  const handleLogout = async () => {
    await apiLogout();
    setUser(null);
    navigate('/');
  };

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

      <Route
        path="/register"
        element={
          isLoggedIn
            ? <Navigate to="/dashboard" replace />
            : <Register onLogin={handleLogin} />
        }
      />

      {/* Protected layout — redirect to login if not authenticated */}
      <Route
        element={
          isLoggedIn
            ? <MainLayout user={user} setUser={setUser} onLogout={handleLogout} />
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
