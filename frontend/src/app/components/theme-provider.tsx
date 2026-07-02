import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const stored = localStorage.getItem('quickped-theme');
      return (stored as Theme) || 'light';
    } catch {
      return 'light';
    }
  });

  const applyTheme = (t: Theme) => {
    // Apply to both <html> and <body> so both .dark selectors and CSS variable scoping work
    const root = document.documentElement;
    const body = document.body;
    root.classList.remove('light', 'dark');
    root.classList.add(t);
    body.classList.remove('light', 'dark');
    body.classList.add(t);
    try {
      localStorage.setItem('quickped-theme', t);
    } catch { /* ignore */ }
  };

  // Apply on mount immediately (before paint)
  const mounted = useRef(false);
  if (!mounted.current) {
    applyTheme(theme);
    mounted.current = true;
  }

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = (t: Theme) => setThemeState(t);
  const toggleTheme = () => setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
