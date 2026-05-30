import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

const themeChannel = typeof BroadcastChannel !== 'undefined'
  ? new BroadcastChannel('nexus-theme-sync')
  : null;

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem('nexus-theme') || 'light');

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('nexus-theme', theme);
  }, [theme]);

  // Listen for theme changes broadcast from other modules
  useEffect(() => {
    if (!themeChannel) return;
    themeChannel.onmessage = (e) => {
      if (e.data?.theme && e.data.theme !== theme) {
        setTheme(e.data.theme);
      }
    };
    return () => { themeChannel.onmessage = null; };
  }, [theme]);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    themeChannel?.postMessage({ theme: next });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
