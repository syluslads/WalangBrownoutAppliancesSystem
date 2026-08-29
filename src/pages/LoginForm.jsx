import React, { useState } from 'react';
import background from "../assets/background.png"
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';

const LoginForm = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();

    if (username.trim() === 'admin' && password === 'admin123456') {
      setErrorMsg('');
      navigate('/dashboard'); 
    } else {
      setErrorMsg('Invalid username or password. Please try again.');
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginLeft}>
        <div className={styles.brandHeader}>
          <div className={styles.logoBoxLarge}>W</div>
          <span className={styles.brandName}>WalangBrownout</span>
        </div>
        
        <h2 className={styles.title}>Welcome Back</h2>
        <p className={styles.subtitle}>Please enter your credentials to access inventory.</p>
        
        {errorMsg && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #ef4444',
            color: '#f87171',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '13px',
            marginBottom: '20px',
            fontWeight: '500'
          }}>
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className={styles.formGroup}>
            <label>Username or Email</label>
            <input 
              type="text" 
              placeholder="Enter username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required 
            />
          </div>
          <div className={styles.formGroup}>
            <label>Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          <button type="submit" className={styles.loginBtn}>Sign In</button>
        </form>
      </div>

      <div className={styles.loginRight}>
        <div className={styles.imageWrapper}>
          <img 
            src={background} 
            alt="Background of WalangBrownout Inventory System" 
            className={styles.loginHeroImage}
          />
          <div className={styles.imageOverlay}></div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;