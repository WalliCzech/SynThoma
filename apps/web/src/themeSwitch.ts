// Minimal theme switch utility for client components
export const ALLOWED_THEMES = [
  'synthoma',
  'green-matrix',
  'neon-hellfire',
  'cyber-dystopia',
  'acid-glitch',
  'retro-arcade',
] as const;
export type ThemeName = (typeof ALLOWED_THEMES)[number];

export function getSavedTheme(): ThemeName {
  if (typeof window === 'undefined') return 'synthoma';
  try {
    const saved = localStorage.getItem('theme');
    return (ALLOWED_THEMES as readonly string[]).includes(saved as string)
      ? (saved as ThemeName)
      : 'synthoma';
  } catch {
    return 'synthoma';
  }
}

export function setTheme(name: ThemeName): void {
  if (typeof document === 'undefined') return;
  if (!(ALLOWED_THEMES as readonly string[]).includes(name)) return;
  document.body.setAttribute('data-theme', name);
  try { localStorage.setItem('theme', name); } catch {}
}
