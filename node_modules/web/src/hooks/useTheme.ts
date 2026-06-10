import { useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark';

/**
 * useTheme hook - manages light/dark theme
 */
export function useTheme(initialTheme: Theme = 'dark') {
  const [theme, setTheme] = useState<Theme>(() => {
    // Try to get theme from localStorage
    const saved = localStorage.getItem('dealscout-theme');
    return (saved as Theme) || initialTheme;
  });

  // Save theme to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('dealscout-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  return { theme, toggleTheme };
}

export default useTheme;
