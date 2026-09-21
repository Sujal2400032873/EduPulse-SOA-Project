import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem('edupulse_theme_mode') || 'light';
  });

  const [colorScheme, setColorScheme] = useState(() => {
    return localStorage.getItem('edupulse_color_scheme') || 'navy';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeMode);
    localStorage.setItem('edupulse_theme_mode', themeMode);
  }, [themeMode]);

  useEffect(() => {
    document.documentElement.setAttribute('data-color', colorScheme);
    localStorage.setItem('edupulse_color_scheme', colorScheme);
  }, [colorScheme]);

  // One-click cycle: Light -> Medium -> Dark -> Light
  const cycleThemeMode = () => {
    setThemeMode((prev) => {
      if (prev === 'light') return 'medium';
      if (prev === 'medium') return 'dark';
      return 'light';
    });
  };

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        setThemeMode,
        cycleThemeMode,
        colorScheme,
        setColorScheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
