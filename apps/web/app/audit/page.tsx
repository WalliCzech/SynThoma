'use client';

import { useEffect, useMemo, useState } from 'react';

interface Check { id: string; label: string; ok: boolean | null; note?: string }

const THEMES = ['synthoma','green-matrix','neon-hellfire','cyber-dystopia','acid-glitch','retro-arcade'] as const;
const CSS_VARS_REQUIRED = [
  '--text-primary','--text-secondary','--bg-secondary','--border-secondary',
  '--accent-primary','--accent-secondary','--glow-primary','--glow-secondary'
];
const CSS_SELECTORS_REQUIRED = [
  '.panel','.btn','.halo','.glitch-title','.scramble-title','.video-background','#glitch-bg','#noise-canvas','.fx-glitch'
];

export default function AuditPage() {
  const [checks, setChecks] = useState<Check[]>([]);
  const [currentTheme, setCurrentTheme] = useState<string>('');
  const [noAnim, setNoAnim] = useState<boolean>(false);
  const [videoReport, setVideoReport] = useState<string>('');

  const root = useMemo(() => (typeof document !== 'undefined' ? document.documentElement : null), []);

  useEffect(() => {
    const results: Check[] = [];

    // 1) Layout anchors
    const anchors = ['toaster','modal-run','noise-canvas'];
    anchors.forEach(id => {
      const el = typeof document !== 'undefined' ? document.getElementById(id) : null;
      results.push({ id: `anchor:${id}`, label: `Anchor #${id}`, ok: !!el, note: el ? 'OK' : 'missing' });
    });
    const vb = typeof document !== 'undefined' ? document.querySelector('.video-background') : null;
    const gb = typeof document !== 'undefined' ? document.getElementById('glitch-bg') : null;
    results.push({ id: 'anchor:video-background', label: 'Video background container', ok: !!vb });
    results.push({ id: 'anchor:glitch-bg', label: 'Glitch canvas #glitch-bg', ok: !!gb });

    // 2) CSS variables presence for current theme
    const style = root ? getComputedStyle(root) : (null as any);
    CSS_VARS_REQUIRED.forEach(v => {
      const val = style ? style.getPropertyValue(v) : '';
      results.push({ id: `var:${v}`, label: `CSS var ${v}`, ok: !!val && val.trim() !== '' , note: (val||'').trim() || 'unset' });
    });

    // 3) Selectors existence (rough)
    const foundSelectors: string[] = [];
    try {
      for (const sheet of Array.from(document.styleSheets) as CSSStyleSheet[]) {
        // Ignore cross-origin
        let rules: any;
        try { rules = sheet.cssRules; } catch { continue; }
        if (!rules) continue;
        for (const r of Array.from(rules) as CSSRule[]) {
          const t = r as CSSStyleRule;
          if ((t as any).selectorText) foundSelectors.push((t as any).selectorText);
        }
      }
    } catch {}
    CSS_SELECTORS_REQUIRED.forEach(sel => {
      const ok = foundSelectors.some(s => s.split(',').some(x => x.trim() === sel));
      results.push({ id: `selector:${sel}`, label: `Selector ${sel}`, ok });
    });

    // 4) prefers-reduced-motion + .no-animations behavior (best-effort)
    const prm = (()=>{ try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; } })();
    results.push({ id: 'motion:prefers-reduced', label: 'prefers-reduced-motion respected', ok: typeof prm === 'boolean' });

    // 5) Themes variability: check that at least one key var differs across themes
    let distinctThemes = 0;
    const sampleVar = '--accent-primary';
    const seen = new Set<string>();
    THEMES.forEach(t => {
      root?.setAttribute('data-theme', t);
      const v = getComputedStyle(root as Element).getPropertyValue(sampleVar).trim();
      if (v) seen.add(v);
    });
    distinctThemes = seen.size;
    // Restore body data-theme via setTheme if available
    const saved = (typeof localStorage !== 'undefined' ? localStorage.getItem('theme') : null) || 'synthoma';
    document.body?.setAttribute('data-theme', saved);
    results.push({ id: 'themes:variance', label: 'Themes change CSS vars', ok: distinctThemes > 1, note: `${sampleVar} variants: ${distinctThemes}` });

    setChecks(results);
    setCurrentTheme(document.body?.getAttribute('data-theme') || 'synthoma');
    setNoAnim(document.body?.classList.contains('no-animations') || false);
  }, [root]);

  // Probe videos
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const paths = Array.from({ length: 10 }, (_, i) => `/video/SYNTHOMA${i+1}.mp4`);
      let ok = 0, fail = 0;
      for (const p of paths) {
        try {
          const res = await fetch(p, { method: 'HEAD' });
          if (res.ok) ok++; else fail++;
        } catch {
          fail++;
        }
      }
      if (!cancelled) setVideoReport(`${ok} OK / ${fail} missing`);
    })();
    return () => { cancelled = true; };
  }, []);

  const toggleNoAnim = () => {
    document.body.classList.toggle('no-animations');
    setNoAnim(document.body.classList.contains('no-animations'));
  };

  const cycleTheme = () => {
    const idx = THEMES.indexOf(currentTheme as any);
    const next = THEMES[(idx + 1) % THEMES.length];
    (window as any).setTheme?.(next);
    document.body.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch {}
    setCurrentTheme(next);
  };

  return (
    <main style={{ padding: 16 }}>
      <section className="panel fx-noise" style={{ padding: 16, marginBottom: 12 }}>
        <h1 className="glitch-title" data-glitch="soft">Style & Effects Audit</h1>
        <p className="text">Tvoje CSS devadesátky volají, chtějí víc proměnných. Zkontrolovali jsme pár banalit, jestli se to celý nezhroutí.</p>
        <div style={{ display:'flex', gap:8, marginTop:8 }}>
          <button className="btn" onClick={cycleTheme}>Přepnout motiv ({currentTheme})</button>
          <button className="btn" onClick={toggleNoAnim}>{noAnim ? 'Zapnout animace' : 'Vypnout animace'}</button>
          <span className="text-muted" style={{ marginLeft: 'auto' }}>Video assets: {videoReport || '…'}</span>
        </div>
      </section>

      <section className="panel fx-noise" style={{ padding: 16 }}>
        <h2 className="halo">Kontroly</h2>
        <ul style={{ listStyle:'none', padding: 0, marginTop: 8, display:'grid', gap: 6 }}>
          {checks.map(c => (
            <li key={c.id} className="glass" style={{ padding: 8, borderRadius: 8, display:'flex', gap:8, alignItems:'baseline', border:'1px solid var(--border-tertiary)' }}>
              <span style={{ minWidth: 22, textAlign:'center' }}>{c.ok ? '✅' : c.ok === false ? '❌' : '…'}</span>
              <span>{c.label}</span>
              {c.note ? <span className="text-muted" style={{ marginLeft: 'auto' }}>{c.note}</span> : null}
            </li>
          ))}
        </ul>
      </section>

      <p className="text-muted" style={{ marginTop: 8 }}>
        Pokud chceš přidat další kontroly (např. validaci hodnot proměnných, dostupnost fontů, A11y průchod), pískni. Přidáme bez zbytečného moralizování.
      </p>
    </main>
  );
}
