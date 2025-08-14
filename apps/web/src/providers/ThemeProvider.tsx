"use client";
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { makeTheme, SynthomaMode } from '../styles/theme';
import { setTheme as setCssTheme, ThemeName } from '../themeSwitch';

interface ModeCtx {
  mode: SynthomaMode;
  setMode: (m: SynthomaMode) => void;
}

const ModeContext = createContext<ModeCtx | undefined>(undefined);

export const ThemeRegistry: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<SynthomaMode>('default');

  // Mapování MUI režimů na CSS témata
  const MODE_TO_THEME: Record<SynthomaMode, ThemeName> = useMemo(() => ({
    default: 'synthoma',
    neon: 'neon-hellfire',
    glitch: 'acid-glitch',
    sanity_breach: 'cyber-dystopia',
  }), []);

  // aplikace atributu data-theme na <html> i <body> a persistence
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const themeName = MODE_TO_THEME[mode];
    document.documentElement.setAttribute('data-theme', themeName);
    if (document.body) document.body.setAttribute('data-theme', themeName);
    // ulož do localStorage a sjednoť přes utilitu
    setCssTheme(themeName);
  }, [mode, MODE_TO_THEME]);

  const theme = useMemo(() => makeTheme(mode), [mode]);

  const value = useMemo(() => ({ mode, setMode }), [mode]);

  return (
    <ModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ModeContext.Provider>
  );
};

export const useThemeMode = () => {
  const ctx = useContext(ModeContext);
  if (!ctx) throw new Error('useThemeMode musí být voláno uvnitř ThemeRegistry.');
  return ctx;
};
