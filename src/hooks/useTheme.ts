import { useState, useEffect, useCallback } from 'react';

type Theme = 'dark' | 'light';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('md-viewer-theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [fontSize, setFontSize] = useState(() => {
    const saved = localStorage.getItem('md-viewer-font-size');
    return saved ? parseInt(saved, 10) : 16;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('md-viewer-theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.setProperty('--md-font-size', `${fontSize}px`);
    localStorage.setItem('md-viewer-font-size', String(fontSize));
  }, [fontSize]);

  const toggleTheme = useCallback(() => {
    setTheme(t => (t === 'dark' ? 'light' : 'dark'));
  }, []);

  const increaseFontSize = useCallback(() => {
    setFontSize(s => Math.min(s + 2, 28));
  }, []);

  const decreaseFontSize = useCallback(() => {
    setFontSize(s => Math.max(s - 2, 12));
  }, []);

  return { theme, toggleTheme, fontSize, setFontSize, increaseFontSize, decreaseFontSize };
}
