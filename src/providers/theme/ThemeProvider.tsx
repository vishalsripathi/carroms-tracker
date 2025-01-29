import { useState, useEffect } from 'react';
import { Theme } from '../../types';
import { ThemeContext } from './theme-context';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      // First check localStorage
      const saved = localStorage.getItem('theme') as Theme;
      if (saved) return saved;
      
      // If no saved preference, return dark as default
      return 'dark';
    }
    // Default to dark during SSR
    return 'dark';
  });

  useEffect(() => {
    // Ensure dark mode is applied immediately
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Add a second useEffect to prevent flash of light mode
  useEffect(() => {
    // Apply dark mode immediately on mount
    document.documentElement.classList.add('dark');
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};