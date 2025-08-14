export type CancelFn = () => void;

/**
 * Scripted cinematic intro for the CTA button. Similar sweep + reveal as the title,
 * but DOES NOT enable infinite glitch; hover CSS handles glitches.
 */
export function runCinematicButtonIntro(root: HTMLElement): CancelFn {
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
    (root as HTMLElement).style.animation = 'none';
    if (real) (real as HTMLElement).style.willChange = 'opacity, filter, clip-path, transform';
    chars.forEach(ch => { ch.style.opacity = '0'; ch.style.transition = 'opacity 220ms ease, filter 220ms ease'; });
  } catch {}

  if (!prefersReduced) {
    set(() => { try { root.style.transition = 'opacity 700ms ease, transform 900ms cubic-bezier(.2,.9,.1,1), filter 900ms ease'; } catch {} }, 10);
    set(() => { try { root.style.opacity = '0.18'; root.style.transform = 'translateY(4px) scale(0.985)'; root.style.filter = 'brightness(0.98) saturate(1.04)'; } catch {} }, 40);
    set(() => { try { root.style.opacity = '0.5'; root.style.transform = 'translateY(2px) scale(0.995)'; root.style.filter = 'brightness(1.05) saturate(1.1)'; } catch {} }, 420);

    const startT = performance.now() + 1000;
    const sweepDur = 1400;
    const totalChars = Math.max(1, chars.length);
    const sweep = () => {
      const now = performance.now();
      const t = Math.min(1, Math.max(0, (now - startT) / sweepDur));
      try { if (real) (real as HTMLElement).style.clipPath = `inset(0 ${100 - t*100}% 0 0)`; } catch {}
      const upto = Math.floor(t * totalChars);
      for (const el of chars.slice(0, upto)) {
        if (el && el.style.opacity !== '1') {
          el.style.opacity = '1';
          el.style.filter = 'brightness(1.08)';
          set(() => { try { el.style.filter = ''; } catch {} }, 140);
        }
      }
      if (t < 1) set(sweep, 16);
    };
    set(sweep, 1020);

    set(() => { try { root.style.filter = 'brightness(1.2) saturate(1.25)'; } catch {} }, 2700);
    set(() => { try { root.style.filter = 'brightness(1.0) saturate(1.15)'; } catch {} }, 2900);
    set(() => { try { root.style.filter = 'var(--filter-primary)'; root.style.transform = 'none'; } catch {} }, 3200);
    // end: keep hover-only glitch; only reset clipPath
    set(() => { try { if (real) (real as HTMLElement).style.clipPath = ''; } catch {} }, 3400);
    // enable shining/noising on button characters after intro settles
    set(() => {
      try {
        const animationsDisabled = typeof document !== 'undefined' && document.body?.classList.contains('no-animations');
        chars.forEach(ch => {
          const isVisible = (ch.textContent || '').trim().length > 0;
          ch.classList.remove('noising-burst','flickering');
          if (!isVisible) return;
          ch.classList.add('noising-char');
          if (!prefersReduced && !animationsDisabled) {
            ch.classList.add('noising');
            ch.classList.add('noising-burst');
            window.setTimeout(() => { try { ch.classList.remove('noising-burst'); } catch {} }, 220);
          } else {
            ch.classList.remove('noising');
            ch.classList.add('noising-static');
          }
        });
        try {
          const w: any = window as any;
          if (w.startShinning) w.startShinning();
        } catch {}
        try {
          const w: any = window as any;
          if (w.startNoising) w.startNoising();
        } catch {}
      } catch {}
    }, 3600);
  } else {
    set(() => { try { root.style.transition = 'opacity 600ms ease, transform 600ms ease'; root.style.opacity = '1'; root.style.transform = 'none'; } catch {} }, 30);
    // reduced motion: still mark static shining/noising immediately
    set(() => {
      try {
        chars.forEach(ch => {
          const isVisible = (ch.textContent || '').trim().length > 0;
          if (!isVisible) return;
          ch.classList.add('noising-char','noising-static');
          ch.classList.remove('noising');
        });
      } catch {}
    }, 80);
  }

  return () => {
    clearAll();
    try {
      root.style.transition = '';
      root.style.transform = '';
      root.style.filter = '';
      (root as HTMLElement).style.animation = '';
      if (real) (real as HTMLElement).style.clipPath = '';
      chars.forEach(ch => {
        ch.style.opacity = '';
        ch.style.transition = '';
        ch.classList.remove('noising','noising-burst','noising-static');
        // keep noising-char marker optional; remove if you want a pristine detach
        // ch.classList.remove('noising-char');
      });
    } catch {}
  };
}
