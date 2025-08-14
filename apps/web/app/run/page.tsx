'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { getSharedAudio } from '@web/lib/audio';
import { useRunStore } from '@web/stores/runStore';
import { NODES } from '@shared/data/nodes';
import type { NodeDef, Option, OptionTag } from '@shared/schemas/game';

/** ———————————————————————————————————————————————————————————
 * Defaultní mapování TAGŮ na drobné MBTI posuny (aplikuje se
 * jen když volba NEMÁ explicitní e.type==='mbti').
 * Bias podle motivu přidáme extra (viz níže).
 */
const TAG_TO_MBTI: Partial<Record<OptionTag, { axis:'EI'|'NS'|'TF'|'PJ', toward:any, weight:number }>> = {
  analysis: { axis:'TF', toward:'T', weight:1 },
  social:   { axis:'EI', toward:'E', weight:1 },
  symbol:   { axis:'NS', toward:'N', weight:1 },
  plan:     { axis:'PJ', toward:'J', weight:1 },
  improv:   { axis:'PJ', toward:'P', weight:1 },
  empathy:  { axis:'TF', toward:'F', weight:1 },
  // risk řeší motivy + modaly
};

function optionHasExplicitMBTI(opt: Option) {
  return opt.effects?.some(e => (e as any).type === 'mbti');
}

function deriveMBTIEffectsFromTags(opt: Option) {
  if (!opt.tags || !opt.tags.length) return [];
  return opt.tags
    .map(t => TAG_TO_MBTI[t as OptionTag])
    .filter(Boolean)
    .map(v => ({ type:'mbti', value: v })) as any[];
}

/** ———————————————————————————————————————————————————————————
 * Teleport: preferuj portálové uzly (tagy začínající 'portal:').
 * Když nejsou, vezmi 'glitch' nebo 'memory_trap', jinak libovolný jiný než aktuální.
 */
function pickTeleportTarget(currentId: string): NodeDef {
  const portals = NODES.filter(n => n.id !== currentId && (n.tags?.some(t => t.startsWith('portal:'))));
  const glitchy = NODES.filter(n => n.id !== currentId && (n.tags?.includes('glitch') || n.tags?.includes('memory_trap')));
  const pool = (portals.length ? portals : (glitchy.length ? glitchy : NODES.filter(n => n.id !== currentId)));
  return pool[Math.floor(Math.random()*pool.length)];
}

/** ———————————————————————————————————————————————————————————
 * UI orchestrátor: modal/overlay/delay/toast se řeší v UI,
 * numerika/MBTI jde přes store (kvůli persistu a RT heuristice).
 */
export default function RunPage() {
  const {
    nodeId, theme, hp, sanity, access,
    enterNode, choose, applyEffect, setTheme
  } = useRunStore(s => ({
    nodeId: s.nodeId, theme: s.theme, hp: s.hp, sanity: s.sanity, access: s.access,
    enterNode: s.enterNode, choose: s.choose, applyEffect: s.applyEffect, setTheme: s.setTheme
  }));

  const [overlay, setOverlay] = useState<null | { kind:'loading'|'error', until:number }>(null);

  const node = useMemo(() => NODES.find(n => n.id === nodeId)!, [nodeId]);

  // Po příchodu z úvodu: případně spusť hudbu
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const shouldPlay = sessionStorage.getItem('synthoma_play_audio') === '1';
      if (!shouldPlay) return;
      sessionStorage.removeItem('synthoma_play_audio');
      const w = window as any;
      if (!w.__synthomaAudio) {
        w.__synthomaAudio = getSharedAudio();
      }
      w.__synthomaAudio.play?.().catch(() => { /* no-op: autoplay může být blokován */ return; });
    } catch { /* ignore audio init errors */ }
  }, []);

  // Init první běh (pokud by někdo přišel rovnou sem bez state)
  useEffect(() => {
    if (!node) {
      // Fail-safe: pošli do prázdnoty
      enterNode('void-boot');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // onEnter pipeline: spustit efekty uzlu + acid teleport 5 %
  useEffect(() => {
    if (!node) return;

    // UI: spustit onEnter „lehká“ upozornění (overlay/toast), numeriku necháme na store.applyEffect
    (node.onEnter || []).forEach(e => {
      if ((e as any).type === 'overlay') {
        const ms = (e as any).ms ?? 250;
        setOverlay({ kind: (e as any).value, until: performance.now() + ms });
        setTimeout(() => setOverlay(null), ms);
      }
      if ((e as any).type === 'toast') {
        (window as any).toast?.((e as any).message, (e as any).value, 2400);
      }
      // numerika: poslat do store
      if (['hp','sanity','access','theme','mbti'].includes((e as any).type)) {
        applyEffect(e, `onEnter:${node.id}`);
      }
    });

    // Acid-glitch teleport: 5 % šance po vstupu
    if (theme === 'acid-glitch' && Math.random() < 0.05) {
      (window as any).toast?.('Mapa přepisuje okraje…', 'info', 2400);
      const next = pickTeleportTarget(node.id);
      // drobný N bias za „symbolickou“ odchylku
      applyEffect({ type:'mbti', value:{ axis:'NS', toward:'N', weight:0.5 }}, 'acid-teleport');
      setTimeout(() => enterNode(next.id), 260);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodeId, theme]);

  const handleThemeSwitch = useCallback((t: any) => {
    setTheme(t);
    // MBTI drobek za rituál motivu (UI vrstvě patří bias)
    const bias: Record<string, any> = {
      'green-matrix': { axis:'TF', toward:'T', weight:1 },
      'neon-hellfire': { axis:'PJ', toward:'P', weight:1 },
      'cyber-dystopia': { axis:'PJ', toward:'J', weight:1 },
      'acid-glitch': { axis:'NS', toward:'N', weight:1 },
      'retro-arcade': { axis:'EI', toward:'E', weight:1 },
    };
    if (bias[t]) applyEffect({ type:'mbti', value: bias[t] }, 'ritual:theme');
    (window as any).toast?.(`Rituál: ${t} aktivní.`, 'info', 1800);
  }, [applyEffect, setTheme]);

  // Volba: modal confirm (risk, nebo cyber-dystopia implicitně na risk tagu),
  // RT se měří uvnitř store.choose(), tak UI efekty řešíme až po něm.
  const onChoose = useCallback(async (opt: Option) => {
    const hasModal = opt.effects?.some(e => (e as any).type === 'modal');
    const isRiskTag = opt.tags?.includes('risk');
    const needConfirm = !!hasModal || (theme === 'cyber-dystopia' && isRiskTag);

    if (needConfirm) {
      const ok = await ((window as any).confirmRisk?.('Tahle akce může rozleptat realitu. Pokračovat?') ?? Promise.resolve(confirm('Tahle akce může rozleptat realitu. Pokračovat?')));
      if (!ok) {
        (window as any).toast?.('Akce zrušena. Systém si to zapíše.', 'warning', 2000);
        return;
      }
      // Drobné MBTI biasy za potvrzení rizika podle motivu
      if (theme === 'cyber-dystopia') applyEffect({ type:'mbti', value:{ axis:'PJ', toward:'J', weight:0.5 }}, 'confirm:dystopia');
      if (theme === 'neon-hellfire') applyEffect({ type:'mbti', value:{ axis:'PJ', toward:'P', weight:0.5 }}, 'confirm:hellfire');
    }

    // Necháme store.choose spočítat RT a aplikovat numeriku a explicitní MBTI
    choose(opt);

    // UI efekty z opt.effects: overlay/delay/toast (bez numeriky, tu udělal store)
    for (const e of (opt.effects || [])) {
      if ((e as any).type === 'overlay') {
        const ms = (e as any).ms ?? 250;
        setOverlay({ kind: (e as any).value, until: performance.now() + ms });
        await new Promise(r => setTimeout(r, ms));
        setOverlay(null);
      }
      if ((e as any).type === 'delay') {
        await new Promise(r => setTimeout(r, (e as any).ms));
      }
      if ((e as any).type === 'toast') {
        (window as any).toast?.((e as any).message, (e as any).value, 2400);
      }
    }

    // Pokud volba neměla explicitní MBTI, aplikuj default z TAGŮ
    if (!optionHasExplicitMBTI(opt)) {
      const derived = deriveMBTIEffectsFromTags(opt);
      derived.forEach(d => applyEffect(d, `tags:${(opt.tags||[]).join(',')}`));
    }

    // Přechod do dalšího uzlu
    enterNode(opt.nextId);
  }, [choose, applyEffect, enterNode, theme]);

  // Render
  return (
    <main className="p-16">
      {/* Horní bar: staty */}
      <div className="panel fx-noise p-8-12 mb-12 flex gap-16 items-baseline">
        <span>HP: <b>{hp}</b></span>
        <span>Sanity: <b>{sanity}</b></span>
        <span>Access: <b>{access}</b></span>
        <span className="ml-auto opacity-75">Motiv:</span>
        <div className="flex gap-6">
          {(['synthoma','green-matrix','neon-hellfire','cyber-dystopia','acid-glitch','retro-arcade'] as const).map(t => (
            <button key={t}
              className="btn fx-glitch btn-sm"
              data-glitch="soft"
              data-text={t}
              onClick={()=>handleThemeSwitch(t)}
              aria-pressed={theme === t}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Uzel */}
      <section className="panel fx-noise p-16">
        <h1 className="glitch-title scramble-title" data-glitch={node.unstable ? 'on' : 'soft'}>
          <span className="scramble-base">{node.title}</span>
          <span className="scramble-layer" data-target={node.title} aria-hidden="true"></span>
          <span className="sr-only">{node.title}</span>
        </h1>
        <p className="opacity-90 mt-8">{node.text}</p>

        {/* Volby */}
        <div className="grid gap-8 mt-12">
          {node.options.map(opt => (
            <div key={opt.id} className="grid gap-6">
              <button
                className="btn fx-glitch btn-lg text-left"
                data-glitch="soft"
                data-text={opt.label}
                onClick={()=>onChoose(opt)}
                aria-describedby={opt.hint ? `hint-${opt.id}` : undefined}
              >
                {opt.label}
              </button>
              {opt.hint ? (
                <small id={`hint-${opt.id}`} className="text-muted opacity-70">
                  {opt.hint}
                </small>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      {/* Overlay stavy */}
      {overlay ? (
        <div
          aria-live="polite"
          className="modal overlay-center bg-overlay"
        >
          <div className="panel p-12 rounded-12">
            {overlay.kind === 'loading' ? 'Hackuješ…' : 'Chyba ve vrstvě reality…'}
          </div>
        </div>
      ) : null}
    </main>
  );
}
