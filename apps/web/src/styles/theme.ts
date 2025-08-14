import { createTheme, PaletteOptions } from '@mui/material/styles';

export type SynthomaMode = 'default' | 'neon' | 'glitch' | 'sanity_breach';

// Kanonická paleta – MUI vyžaduje konkrétní barvy (#rrggbb),
// proto zde použijeme hex a CSS proměnné necháme pro efekty a globální styly.
const basePalette: PaletteOptions = {
  mode: 'dark',
  primary: { main: '#00ffff' },
  secondary: { main: '#ff00ff' },
  warning: { main: '#f6ff00' },
  background: {
    default: '#000d1a',
    paper: 'rgba(255,255,255,0.03)'
  },
  text: {
    primary: '#f8f8ff',
    secondary: 'rgba(248,248,255,0.7)'
  }
};

function withModeTweaks(mode: SynthomaMode) {
  switch (mode) {
    case 'neon':
      return {
        components: {
          MuiButton: { styleOverrides: { root: { textShadow: '0 0 6px rgba(0,255,255,.3)' } } },
        },
      };
    case 'glitch':
      return {
        components: {
          MuiPaper: { styleOverrides: { root: { boxShadow: '0 0 18px rgba(255,0,255,.12) inset' } } },
        },
      };
    case 'sanity_breach':
      return {
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              body: { filter: 'saturate(1.6) contrast(1.05)' },
            },
          },
        },
      };
    default:
      return {};
  }
}

export function makeTheme(mode: SynthomaMode) {
  const theme = createTheme({
    ...withModeTweaks(mode),
    palette: basePalette,
    typography: {
      // Základ pro běžný text
      fontFamily: [
        '"Text03"',
        '"Synthoma"',
        mode === 'sanity_breach' ? '"IBM Plex Mono"' : 'Inter',
        'system-ui',
        'Segoe UI',
        'Roboto',
        'sans-serif',
      ].join(', '),
      h1: {
        fontFamily: ['"Synthoma"', '"Text03"', 'Inter', 'system-ui', 'sans-serif'].join(', '),
        textTransform: 'uppercase',
        letterSpacing: '1px',
      },
      h2: {
        fontFamily: ['"Synthoma"', '"Text03"', 'Inter', 'system-ui', 'sans-serif'].join(', '),
        textTransform: 'uppercase',
        letterSpacing: '1px',
      },
      h3: { fontFamily: ['"Text01"', '"Synthoma"', 'Inter', 'system-ui', 'sans-serif'].join(', ') },
      h4: { fontFamily: ['"Text01"', '"Synthoma"', 'Inter', 'system-ui', 'sans-serif'].join(', ') },
      h5: { fontFamily: ['"Text01"', '"Synthoma"', 'Inter', 'system-ui', 'sans-serif'].join(', ') },
      h6: { fontFamily: ['"Text01"', '"Synthoma"', 'Inter', 'system-ui', 'sans-serif'].join(', ') },
      body1: { fontFamily: ['"Text03"', 'Inter', 'system-ui', 'sans-serif'].join(', ') },
      body2: { fontFamily: ['"Text03"', 'Inter', 'system-ui', 'sans-serif'].join(', ') },
      button: {
        fontFamily: ['"Synthoma"', '"Text03"', 'Inter', 'system-ui', 'sans-serif'].join(', '),
        textTransform: 'uppercase',
        letterSpacing: '1px',
      },
    },
    shape: { borderRadius: 12 },
  });
  return theme;
}
