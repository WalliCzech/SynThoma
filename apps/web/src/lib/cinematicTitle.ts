export type CancelFn = () => void;

/**
 * Runs the scripted neon/glitch cinematic intro on a title root element that contains
 * .glitch-real and .glitch-char children. Mirrors existing timeline from page.tsx.
 * Returns a cleanup function to clear timeouts and reset styles.
 */
export function runCinematicTitleIntro(root: HTMLElement): CancelFn {
  const prefersReduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const real = root.querySelector('.glitch-real') as HTMLElement | null;
  const chars = Array.from(root.querySelectorAll('.glitch-char')) as HTMLElement[];

  const timers: number[] = [];
  const set = (fn: () => void, ms: number) => { const id = window.setTimeout(fn, ms) as unknown as number; timers.push(id); return id; };
  const clearAll = () => { while (timers.length) { const id = timers.pop(); if (typeof id === 'number') try { clearTimeout(id); } catch {} } };

  try {
    root.style.opacity = '0';
    root.style.transform = 'translateY(10px) scale(0.97)';
    root.style.filter = 'brightness(0.85) saturate(0.9)';
    root.style.animation = 'none';
    if (real) real.style.willChange = 'opacity, filter, clip-path, transform';
    chars.forEach(ch => { ch.style.opacity = '0'; ch.style.transition = 'opacity 240ms ease, filter 240ms ease'; });
  } catch {}

  set(() => { try { root.style.transition = 'opacity 800ms ease, transform 1000ms cubic-bezier(.2,.9,.1,1), filter 1000ms ease'; } catch {} }, 10);
  set(() => { try { root.style.opacity = '0.12'; root.style.transform = 'translateY(4px) scale(0.985)'; root.style.filter = 'brightness(0.95) saturate(1.02)'; } catch {} }, 40);
  set(() => { try { root.style.opacity = '0.35'; root.style.transform = 'translateY(2px) scale(0.995)'; root.style.filter = 'brightness(1.02) saturate(1.06)'; } catch {} }, 450);

  if (!prefersReduced) {
    set(() => { try { root.style.opacity = '0.6'; root.style.transform = 'translateY(0px) scale(1.006)'; root.style.filter = 'brightness(1.08) saturate(1.12)'; } catch {} }, 1200);
    set(() => { try { root.style.opacity = '0.75'; root.style.transform = 'translateY(0) scale(1.01)'; root.style.filter = 'brightness(1.12) saturate(1.18)'; } catch {} }, 2000);

    const startT = performance.now() + 1200;
    const sweepDur = 1600;
    const totalChars = Math.max(1, chars.length);
    const sweep = () => {
      const now = performance.now();
      const t = Math.min(1, Math.max(0, (now - startT) / sweepDur));
      try { if (real) real.style.clipPath = `inset(0 ${100 - t*100}% 0 0)`; } catch {}
      const upto = Math.floor(t * totalChars);
      for (const el of chars.slice(0, upto)) {
        if (el && el.style.opacity !== '1') {
          el.style.opacity = '1';
          el.style.filter = 'brightness(1.08)';
          set(() => { try { el.style.filter = ''; } catch {} }, 160);
        }
      }
      if (t < 1) set(sweep, 16);
    };
    set(sweep, 1220);

    set(() => { try { root.style.filter = 'brightness(1.2) saturate(1.25)'; } catch {} }, 3100);
    set(() => { try { root.style.filter = 'brightness(1.0) saturate(1.15)'; } catch {} }, 3260);
    set(() => { try { root.style.filter = 'brightness(1.22) saturate(1.28)'; } catch {} }, 3480);
    set(() => { try { root.style.filter = 'var(--filter-primary)'; root.style.transform = 'none'; } catch {} }, 3800);
    set(() => { try { root.style.animation = 'glitch 1.2s linear 0s infinite alternate-reverse'; if (real) real.style.clipPath = ''; } catch {} }, 4000);
  } else {
    set(() => { try { root.style.transition = 'opacity 1200ms ease, transform 1200ms ease'; root.style.opacity = '1'; root.style.transform = 'none'; } catch {} }, 30);
  }

  return () => {
    clearAll();
    try {
      root.style.transition = '';
      root.style.textShadow = '';
      root.style.transform = '';
      root.style.filter = '';
      root.style.animation = '';
      if (real) real.style.clipPath = '';
      chars.forEach(ch => { ch.style.opacity = ''; ch.style.transition = ''; });
    } catch {}
  };
}
