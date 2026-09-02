import React, { useState } from 'react';
import background from "../assets/background.png";
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';
import { roles } from '../data/product';
import { IconShield, IconBox, IconCart, IconEye, IconEyeOff, IconCheck } from '../components/Icons';

const roleIcon = {
  shield: IconShield,
  box: IconBox,
  cart: IconCart,
};

const LoginForm = ({ onLogin }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState('role'); // 'role' | 'credentials'
  const [selectedRole, setSelectedRole] = useState(roles[0]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChooseRole = (role) => {
    setSelectedRole(role);
    setErrorMsg('');
    setStep('credentials');
  };

  const handleLogin = (e) => {
    e.preventDefault();

    // UI-only demo: any non-empty username/password signs in — there is no
    // authentication backend in this prototype.
    if (username.trim().length === 0 || password.trim().length === 0) {
      setErrorMsg('Please enter a username and password to continue.');
      return;
    }

    setErrorMsg('');
    onLogin?.({ name: username.trim(), role: selectedRole.label });
    navigate('/dashboard');
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginLeft}>
        <div className={styles.brandHeader}>
          <div className={styles.logoBoxLarge}>W</div>
          <span className={styles.brandName}>WalangBrownout</span>
        </div>

        {step === 'role' ? (
          <>
            <h2 className={styles.title}>Select your role</h2>
            <p className={styles.subtitle}>Choose how you'll use the inventory portal today.</p>

            <div className={styles.roleList}>
              {roles.map((role) => {
                const Icon = roleIcon[role.icon];
                return (
                  <button
                    type="button"
                    key={role.id}
                    className={styles.roleCard}
                    onClick={() => handleChooseRole(role)}
                  >
                    <span className={styles.roleIcon}><Icon size={20} /></span>
                    <span className={styles.roleText}>
                      <span className={styles.roleLabel}>{role.label}</span>
                      <span className={styles.roleDesc}>{role.desc}</span>
                    </span>
                    <span className={styles.roleChevron}>›</span>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <button type="button" className={styles.backLink} onClick={() => setStep('role')}>
              ‹ Back to role selection
            </button>

            <div className={styles.selectedRolePill}>
              <span className={styles.roleIcon}>
                {(() => { const Icon = roleIcon[selectedRole.icon]; return <Icon size={16} />; })()}
              </span>
              Signing in as <strong>&nbsp;{selectedRole.label}</strong>
            </div>

            <h2 className={styles.title}>Welcome back</h2>
            <p className={styles.subtitle}>Enter any username and password to continue — this is a UI prototype.</p>

            {errorMsg && (
              <div className={styles.errorBanner}>⚠️ {errorMsg}</div>
            )}

            <form onSubmit={handleLogin}>
              <div className={styles.formGroup}>
                <label>Username or Email</label>
                <input
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoFocus
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
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label="Toggle password visibility"
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
                <span className={styles.forgotLink}>Forgot password?</span>
              </div>

              <button type="submit" className={styles.loginBtn}>
                Sign In as {selectedRole.label}
              </button>
            </form>
          </>
        )}
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
