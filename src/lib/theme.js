/**
 * src/lib/theme.js
 *
 * Centralized theme and appearance management.
 * Handles 'light', 'dark', and 'system' modes, including dynamic
 * prefers-color-scheme media query listeners.
 */

const THEME_KEY = 'wb_theme';
const COMPACT_KEY = 'wb_compact';

export const getStoredTheme = () => {
  return localStorage.getItem(THEME_KEY) || 'system';
};

export const getSystemPreference = () => {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const getEffectiveTheme = (mode = getStoredTheme()) => {
  if (mode === 'system') {
    return getSystemPreference();
  }
  return mode === 'dark' ? 'dark' : 'light';
};

export const applyTheme = (mode) => {
  const effective = getEffectiveTheme(mode);
  document.documentElement.setAttribute('data-theme', effective);
  document.documentElement.setAttribute('data-theme-mode', mode);
  document.documentElement.style.colorScheme = effective;
  localStorage.setItem(THEME_KEY, mode);
  window.dispatchEvent(new CustomEvent('wb-theme-changed', { detail: { mode, effective } }));
  return effective;
};

export const getStoredCompact = () => {
  return localStorage.getItem(COMPACT_KEY) === 'true';
};

export const applyCompact = (isCompact) => {
  document.documentElement.setAttribute('data-compact', String(isCompact));
  localStorage.setItem(COMPACT_KEY, String(isCompact));
  window.dispatchEvent(new CustomEvent('wb-compact-changed', { detail: { isCompact } }));
};

export const initThemeSystem = () => {
  const currentMode = getStoredTheme();
  applyTheme(currentMode);

  const currentCompact = getStoredCompact();
  applyCompact(currentCompact);

  if (typeof window !== 'undefined' && window.matchMedia) {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => {
      if (getStoredTheme() === 'system') {
        applyTheme('system');
      }
    };

    if (mq.addEventListener) {
      mq.addEventListener('change', handleSystemChange);
    } else if (mq.addListener) {
      mq.addListener(handleSystemChange);
    }
  }
};
