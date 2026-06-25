'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    // Read the current attribute on mount
    const currentTheme = document.documentElement.getAttribute('data-theme') as 'dark' | 'light' || 'dark';
    setTheme(currentTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('theme', nextTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className="btn btn-ghost btn-icon"
      style={{
        width: 38,
        height: 38,
        borderRadius: '50%',
        padding: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        cursor: 'pointer',
      }}
      aria-label="Toggle theme"
      id="theme-toggle-btn"
      type="button"
    >
      {theme === 'dark' ? (
        <Sun size={16} color="#fbbf24" style={{ filter: 'drop-shadow(0 0 4px rgba(251,191,36,0.3))' }} />
      ) : (
        <Moon size={16} color="#8b5cf6" style={{ filter: 'drop-shadow(0 0 4px rgba(139,92,246,0.3))' }} />
      )}
    </button>
  );
}
