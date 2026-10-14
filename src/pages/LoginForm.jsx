import React, { useState } from 'react';
import background from '../assets/background.png';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';
import { login as apiLogin } from '../lib/api';
import { IconEye, IconEyeOff, IconCheck } from '../components/Icons';

// Maps backend role strings to the display labels used in permissions.js
const backendRoleToDisplayRole = {
  admin: 'Admin',
  warehouse_staff: 'Warehouse Staff',
  purchasing_manager: 'Purchasing Manager',
};

const LoginForm = ({ onLogin }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter your email and password to continue.');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    try {
      // Call the real Laravel API. The api.js helper stores the token in
      // localStorage and returns the raw user object.
      const rawUser = await apiLogin(email.trim(), password.trim());

      // Map the backend role string to the display label used by permissions.js
      const displayRole = backendRoleToDisplayRole[rawUser.role] ?? rawUser.role;
      const displayUser = { ...rawUser, role: displayRole };

      // Persist the display-mapped user so App.jsx can rehydrate on page refresh.
      localStorage.setItem('wb_user', JSON.stringify(displayUser));

      onLogin?.(displayUser);
      // Navigation is handled in App.jsx after onLogin updates state.
    } catch (err) {
      const status = err.response?.status;
      if (status === 401 || status === 422) {
        const apiMsg =
          err.response?.data?.message ||
          Object.values(err.response?.data?.errors || {}).flat()[0];
        setErrorMsg(apiMsg || 'Invalid email or password.');
      } else if (status === 403) {
        setErrorMsg('Your account is inactive. Please contact an administrator.');
      } else {
        setErrorMsg('Could not connect to the server. Make sure the Laravel API is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginLeft}>
        <div className={styles.brandHeader}>
          <div className={styles.logoBoxLarge}>W</div>
          <span className={styles.brandName}>WalangBrownout</span>
        </div>

        <h2 className={styles.title}>Welcome back</h2>
        <p className={styles.subtitle}>Enter your email and password to continue.</p>

        {errorMsg && (
          <div className={styles.errorBanner}>⚠️ {errorMsg}</div>
        )}

        <form onSubmit={handleLogin}>
          <div className={styles.formGroup}>
            <label>Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              autoComplete="email"
              disabled={loading}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Password</label>
            <div className={styles.passwordWrap}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={loading}
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword((s) => !s)}
                aria-label="Toggle password visibility"
                disabled={loading}
              >
                {showPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
              </button>
            </div>
          </div>

          <div className={styles.rememberRow}>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" defaultChecked />
              <span className={styles.checkboxBox}><IconCheck size={12} /></span>
              Remember me
            </label>
          </div>

          <button
            type="submit"
            className={styles.loginBtn}
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className={styles.registerLink}>
          Don't have an account?{' '}
          <button type="button" onClick={() => navigate('/register')}>
            Create one
          </button>
        </p>
      </div>

      <div className={styles.loginRight}>
        <div className={styles.imageWrapper}>
          <img
            src={background}
            alt="Background of WalangBrownout Inventory System"
            className={styles.loginHeroImage}
          />
          <div className={styles.imageOverlay}></div>
          <div className={styles.heroCaption}>
            <span className={styles.heroTag}>Real-Time Inventory</span>
            <h3>Stop the Summer Crunch, the Mystery Shrinkage,<br />and the Expiry Trap.</h3>
            <p>Categorized stock, live triggers, and FIFO-enforced picking for WalangBrownout Appliances.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
