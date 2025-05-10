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
  const [isMounted, setIsMounted] = useState(false);

  // Initialize theme from localStorage
  useEffect(() => {
    setIsMounted(true);
    const savedTheme = localStorage.getItem('floyd-theme');
    if (savedTheme) {
      setTheme(savedTheme as ThemeMode);
    }
  }, []);

  // Update the DOM and localStorage when theme changes
  useEffect(() => {
    if (!isMounted) return;
    
    let resolvedThemeValue: 'light' | 'dark' = 'light';
    
    if (theme === 'system') {
      resolvedThemeValue = getSystemTheme();
    } else {
      resolvedThemeValue = theme as 'light' | 'dark';
    }
    
    setResolvedTheme(resolvedThemeValue);
    
    if (resolvedThemeValue === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    localStorage.setItem('floyd-theme', theme);
  }, [theme, isMounted]);

  // Listen for system theme changes
  useEffect(() => {
    if (!isMounted) return;
    
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = (e: MediaQueryListEvent) => {
        const newTheme = e.matches ? 'dark' : 'light';
        setResolvedTheme(newTheme);
        
        if (newTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme, isMounted]);

  // Avoid rendering with incorrect theme
  if (!isMounted) {
    return null;
  }

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