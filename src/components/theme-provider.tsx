'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';

type ThemeMode = 'light' | 'dark' | 'system';
type ThemeContextType = {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  resolvedTheme: 'light' | 'dark';
};
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getSystemTheme() {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    let t = theme;
    if (t === 'system') {
      t = getSystemTheme();
    }
    setResolvedTheme(t as 'light' | 'dark');
    if (typeof window !== 'undefined') {
      document.documentElement.classList.toggle('dark', t === 'dark');
      localStorage.setItem('floyd-theme', theme);
    }
  }, [theme]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('floyd-theme');
      if (saved) setTheme(saved as ThemeMode);
      if (theme === 'system') {
        const listener = (e: MediaQueryListEvent) => {
          setResolvedTheme(e.matches ? 'dark' : 'light');
          document.documentElement.classList.toggle('dark', e.matches);
        };
        const mql = window.matchMedia('(prefers-color-scheme: dark)');
        mql.addEventListener('change', listener);
        return () => mql.removeEventListener('change', listener);
      }
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
} 