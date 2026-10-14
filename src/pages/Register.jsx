import React, { useState } from 'react';
import background from '../assets/background.png';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';
import { register as apiRegister, createUser as apiCreateUser } from '../lib/api';
import { IconShield, IconBox, IconCart, IconEye, IconEyeOff } from '../components/Icons';

// All role cards — Admin role requires an existing admin account (backend enforced)
const roleCards = [
  { id: 'admin',              label: 'Admin',              backendRole: 'admin',              desc: 'Full system access — manage users, suppliers, categories & settings.', icon: 'shield' },
  { id: 'warehouse_staff',    label: 'Warehouse Staff',    backendRole: 'warehouse_staff',    desc: 'Handles day-to-day Stock-In / Stock-Out and scanning.',               icon: 'box'    },
  { id: 'purchasing_manager', label: 'Purchasing Manager', backendRole: 'purchasing_manager', desc: 'Reviews reorder points and approves replenishment.',                   icon: 'cart'   },
];

const roleIcon = { shield: IconShield, box: IconBox, cart: IconCart };

// Maps backend role strings to the display labels used in permissions.js
const backendRoleToDisplayRole = {
  admin: 'Admin',
  warehouse_staff: 'Warehouse Staff',
  purchasing_manager: 'Purchasing Manager',
};

const Register = ({ onLogin }) => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState(roleCards[0]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    try {
      const rawUser = await apiRegister(name.trim(), email.trim(), password, confirmPassword, selectedRole.backendRole);

      // Map the backend role string to the display label used by permissions.js
      const displayRole = backendRoleToDisplayRole[rawUser.role] ?? rawUser.role;
      const displayUser = { ...rawUser, role: displayRole };

      // Persist the display-mapped user so App.jsx can rehydrate on page refresh.
      localStorage.setItem('wb_user', JSON.stringify(displayUser));

      onLogin?.(displayUser);
      navigate('/dashboard');
    } catch (err) {
      const status = err.response?.status;
      if (status === 422) {
        const apiMsg =
          err.response?.data?.message ||
          Object.values(err.response?.data?.errors || {}).flat()[0];
        setErrorMsg(apiMsg || 'Invalid input. Please check your details.');
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

        <h2 className={styles.title}>Create your account</h2>
        <p className={styles.subtitle}>Fill in the details below to get started.</p>

        {errorMsg && (
          <div className={styles.errorBanner}>⚠️ {errorMsg}</div>
        )}

        <form onSubmit={handleRegister}>
          <div className={styles.formGroup}>
            <label>Select your role</label>
            <div className={styles.roleList}>
              {roleCards.map((role) => {
                const Icon = roleIcon[role.icon];
                const isSelected = selectedRole.id === role.id;
                return (
                  <button
                    type="button"
                    key={role.id}
                    className={`${styles.roleCard} ${isSelected ? styles.roleCardSelected : ''}`}
                    onClick={() => setSelectedRole(role)}
                  >
                    <span className={styles.roleIcon}><Icon size={20} /></span>
                    <span className={styles.roleText}>
                      <span className={styles.roleLabel}>{role.label}</span>
                      <span className={styles.roleDesc}>{role.desc}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Full Name</label>
            <input
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
                autoComplete="new-password"
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

          <div className={styles.formGroup}>
            <label>Confirm Password</label>
            <div className={styles.passwordWrap}>
              <input
                type={showConfirm ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                disabled={loading}
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowConfirm((s) => !s)}
                aria-label="Toggle password visibility"
                disabled={loading}
              >
                {showConfirm ? <IconEyeOff size={16} /> : <IconEye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={styles.loginBtn}
            disabled={loading}
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className={styles.registerLink}>
          Already have an account?{' '}
          <button type="button" onClick={() => navigate('/')}>
            Sign In
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

export default Register;
