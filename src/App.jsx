import React from 'react';
import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import LoginForm from './pages/LoginForm';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import StockIn from './pages/StockIn';
import StockOut from './pages/StockOut';
import AuditTrails from './pages/AuditTrails';
import './App.css';

const MainLayout = () => {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginForm />} />

      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/stock-in" element={<StockIn />} />
        <Route path="/stock-out" element={<StockOut />} />
        <Route path="/audit-trails" element={<AuditTrails />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;