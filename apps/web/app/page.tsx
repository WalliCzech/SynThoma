"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { runCinematicTitleIntro } from "@web/lib/cinematicTitle";
import { getSharedAudio } from "@web/lib/audio";
import { runTypewriter, typeExternalInfo, typeBooksList } from "@web/lib/typewriter";


const TITLE = "SYNTHOMA";
const MANIFEST = "Tma nikdy není opravdová, je jen světlem, které se vzdalo smyslu.";
const BTN_LABEL = "Pokračovat";

export default function HomePage() {
  const [showTitle, setShowTitle] = useState(false);
  const [showManifest, setShowManifest] = useState(false);
  const [typedDone, setTypedDone] = useState(false);
  const [btnVisible, setBtnVisible] = useState(false);
  const [showReader, setShowReader] = useState(false);
  const [showReaderDetails, setShowReaderDetails] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(false);
  // Ochrany proti dvojímu spuštění efektů v React 18 StrictMode (dev)
  const readerIntroRanRef = useRef(false);
  const readerSeqRanRef = useRef(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const glitchRootRef = useRef<HTMLDivElement | null>(null);
  // removed unused glitchTimerRef
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const btnGlitchRef = useRef<HTMLButtonElement | null>(null);
  const isStartingAudioRef = useRef(false);
  // Ref pro binární boot text, který musí být vždy na jednom řádku
  const bootBinaryRef = useRef<HTMLSpanElement | null>(null);

  // Handlery pro tlačítka – využij knihovnu z src/lib/typewriter.ts
  const handleInfoClick = () => { typeExternalInfo().catch((e) => console.error('INFO failed', e)); };
  const handleBooksClick = () => { typeBooksList().catch((e) => console.error('Books failed', e)); };

  // Orchestrace: nejdřív rozglitchovaný vstup nadpisu (4s intro), pak manifest s typewriterem
  useEffect(() => {
    // drobná prodleva na mount pro plynulejší přechod
    const t1 = window.setTimeout(() => setShowTitle(true), 30);
    // manifest po dojetí 4s intra (malý nádech navíc kvůli layout/paint): ~4.1s
    const t2 = window.setTimeout(() => setShowManifest(true), 4100);
    return () => { window.clearTimeout(t1); window.clearTimeout(t2); };
  }, []);

  // CSS přesunuto do src/styles/reader.css (žádné injektování stylů v runtime)

  // (reverted) Globální skrývání scrollbarů odstraněno – způsobovalo vedlejší efekty

  // Auto-fit pro binární boot text: udržuj na jednom řádku a přizpůsob font-size
  useEffect(() => {
    const el = bootBinaryRef.current;
    if (!el) return;
    const container = el.parentElement as HTMLElement | null;
    if (!container) return;
    // Vizuální garance jednoho řádku
    el.style.whiteSpace = 'nowrap';
    el.style.display = 'inline-block';
    container.style.overflow = 'hidden';

    const getPx = () => {
      const fs = getComputedStyle(el).fontSize;
      const v = parseFloat(fs || '16');
      return isFinite(v) ? v : 16;
    };
    const setPx = (px: number) => { el.style.fontSize = `${Math.max(1, Math.round(px))}px`; };

    // Považuj počáteční velikost za maximum, ale necháme bezpečné minimum ~30% nebo 10px
    let maxPx = getPx();
    let minPx = Math.max(10, Math.floor(maxPx * 0.3));

    const fit = () => {
      if (!el || !container) return;
      const cw = Math.max(0, container.clientWidth - 2);
      if (cw <= 0) return;
      // Začni z maxima a případně zmenši
      setPx(maxPx);
      let sw = el.scrollWidth;
      if (sw > cw) {
        const ratio = cw / sw;
        setPx(Math.max(minPx, Math.floor(getPx() * ratio * 0.98)));
        // Jemný doladění iteracemi
        let guard = 8;
        while (el.scrollWidth > cw && guard--) {
          const cur = getPx();
          if (cur <= minPx) break;
          setPx(Math.max(minPx, Math.floor(cur * 0.9)));
        }
      } else {
        // Případně dorůst až do maxima, ale nikdy nepřetéct
        let guard = 8;
        while (getPx() < maxPx && guard--) {
          const cur = getPx();
          const next = Math.min(maxPx, Math.floor(cur * 1.05));
          if (next === cur) break;
          setPx(next);
          if (el.scrollWidth > cw) { setPx(cur); break; }
        }
      }
    };

    const ro = new ResizeObserver(() => fit());
    try { ro.observe(container); } catch {}
    // Vícenásobné plánování pro stabilizaci po mountu/layoutu
    const id1 = window.setTimeout(fit, 0);
    const id2 = window.setTimeout(fit, 250);
    const id3 = window.setTimeout(fit, 1000);
    window.addEventListener('load', fit);
    return () => {
      try { ro.disconnect(); } catch {}
      window.clearTimeout(id1); window.clearTimeout(id2); window.clearTimeout(id3);
      window.removeEventListener('load', fit);
    };
  }, [showReader]);

  // Typewriter pro čtečku/terminál po kliknutí na Pokračovat
  useEffect(() => {
    if (!showReader) {
      // reset guardů při odchodu z readeru
      readerIntroRanRef.current = false;
      readerSeqRanRef.current = false;
      return;
    }
    // Zamez dvojitému spuštění v dev/StrictMode
    if (readerIntroRanRef.current) return;
    readerIntroRanRef.current = true;
    // Každý vstup do readeru začíná bez detailů; detail zobrazíme až po dopsání dialogu
    setShowReaderDetails(false);
    setControlsVisible(false);
    const logHost = document.querySelector('#reader-log') as HTMLElement | null;
    const dialogHost = document.querySelector('#reader-dialog') as HTMLElement | null;
    if (!logHost || !dialogHost) return;
    // Připrav cílové span prvky, podobně jako u tlačítka
    function ensureTarget(h: HTMLElement){
      let span = h.querySelector('.noising-text') as HTMLElement | null;
      if (!span) {
        span = document.createElement('span');
        span.className = 'noising-text';
        h.appendChild(span);
      } else { span.textContent = ''; }
      return span;
    }
    if (logHost) ensureTarget(logHost as HTMLElement);
    if (dialogHost) ensureTarget(dialogHost as HTMLElement);

    let cancelLog: (() => void) | null = null;
    let cancelDialog: (() => void) | null = null;

    // Napiš nejdřív LOG, pak dialog
    cancelLog = runTypewriter({
      text: '',
      host: logHost,
      getDurationMs: () => 1400,
      onStart: () => { /* no-op */ return; },
      onDone: () => {
        cancelDialog = runTypewriter({
          text: '„Vítej v SYNTHOMĚ, @&SĐYŁ !!! Tady jméno nikoho nezajímá, ale chyby? Ty jsou v paměti věčně.“',
          host: dialogHost,
          getDurationMs: () => {
            // zarovnat tempo k manifestu, ale trochu rychlejší
            const mw = document.getElementById('manifest-container');
            if (mw) {
              const cs = getComputedStyle(mw);
              const durVar = cs.getPropertyValue('--typewriter-duration').trim();
              if (durVar.endsWith('ms')) return parseFloat(durVar) * 0.7;
              if (durVar.endsWith('s')) return parseFloat(durVar) * 1000 * 0.7;
            }
            return 5200;
          },
          onStart: () => {
            // Najdi cílové termy z a11y obsahu: .sr-only .glitching (libovolné výskyty)
            const glitchTerms = Array.from(dialogHost.querySelectorAll('.sr-only .glitching'))
              .map(n => (n as HTMLElement).textContent || '')
              .filter(t => t && t.trim().length > 0);
            if (!glitchTerms.length) return;
            let tries = 0;
            const maxTries = 220; // ~26s při 120ms
            const doneTerms = new Set<string>();
            const poll = window.setInterval(() => {
              tries++;
              try {
                const span = dialogHost.querySelector('.noising-text') as HTMLElement | null;
                if (!span) return;
                const chars = Array.from(span.querySelectorAll('.tw-char')) as HTMLElement[];
                if (!chars.length) return;
                const textNow = chars.map(c => c.textContent || '').join('');
                for (const term of glitchTerms) {
                  if (doneTerms.has(term)) continue;
                  const idx = textNow.indexOf(term);
                  if (idx !== -1) {
                    // Vlož wrapper před první znak termu
                    const wrap = document.createElement('span');
                    wrap.className = 'glitching';
                    const first = chars[idx] as HTMLElement | undefined;
                    const parent = first && first.parentNode as HTMLElement | null;
                    if (parent && first) {
                      parent.insertBefore(wrap, first);
                      // Původní znaky skryj, aby finalizační fáze typewriteru nepřekreslila text vizuálně podruhé
                      for (let i = 0; i < term.length && (idx + i) < chars.length; i++) {
                        const el = chars[idx + i];
                        if (el) el.classList.add('tw-char-hidden');
                      }
                      // Nastav viditelný text do wrapperu (glitch engine jej interně rozdělí)
                      wrap.textContent = term;
                      try {
                        const w: any = window as any;
                        if (w.startGlitching) w.startGlitching('.glitching');
                      } catch {}
                      doneTerms.add(term);
                    }
                  }
                }
                // hotovo pro všechny termy
                if (doneTerms.size === glitchTerms.length) { window.clearInterval(poll); }
              } catch {}
              if (tries > maxTries) { try { window.clearInterval(poll); } catch {} }
            }, 120) as unknown as number;
          },
          onDone: () => { setShowReaderDetails(true); }
        });
      }
    });

    return () => {
      try { if (cancelLog) cancelLog(); } catch {}
      try { if (cancelDialog) cancelDialog(); } catch {}
      try {
        const w: any = window as any;
        if (w.stopGlitching) w.stopGlitching('.glitching');
      } catch {}
    };

    // Terminálový auto-scroll byl odstraněn (nepoužívá se)
  }, [showReader]);

  // Po dokončení úvodního dialogu napiš celý zbytek obsahu čtečky sekvenčně
  useEffect(() => {
    if (!showReader || !showReaderDetails) return;
    // Zamez dvojitému spuštění v dev/StrictMode
    if (readerSeqRanRef.current) return;
    readerSeqRanRef.current = true;
    // 1) Titulek
    const titleHost = document.querySelector('#reader-title') as HTMLElement | null;
    const bodyHost = document.querySelector('#reader-body') as HTMLElement | null;
    const userLogHost = document.querySelector('#reader-log') as HTMLElement | null;
    const userDialogHost = document.querySelector('#reader-dialog') as HTMLElement | null;
    if (!titleHost || !userLogHost || !userDialogHost) {
      console.log('typewriter: missing hosts', {
        title: !!titleHost, body: !!bodyHost, userLog: !!userLogHost, userDialog: !!userDialogHost
      });
      return;
    }

    // Lokální helper: posuň stránku na spodek (page-level scroll)
    const scrollTerminalBottom = () => {
      try { window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' }); } catch {}
    };

    function ensureTarget(h: HTMLElement){
      let span = h.querySelector('.noising-text') as HTMLElement | null;
      if (!span) {
        span = document.createElement('span');
        span.className = 'noising-text';
        // zachovej zalomení řádků během psaní
        (span.style as any).whiteSpace = 'pre-wrap';
        (span.style as any).display = 'block';
        h.appendChild(span);
      } else {
        // Nemazat existující obsah – historie musí zůstat. Jen pojistit styly.
        (span.style as any).whiteSpace = 'pre-wrap';
        (span.style as any).display = 'block';
      }
      return span;
    }
    if (titleHost) ensureTarget(titleHost as HTMLElement);
    if (bodyHost) ensureTarget(bodyHost as HTMLElement);

    // Získej text k vypsání s podporou zalomení: extrahuj z rich-hidden HTML a nahraď <br> za \n, ukončení bloků za \n\n
    const getHostText = (h: HTMLElement) => {
      const rich = h.querySelector('.rich-hidden') as HTMLElement | null;
      const normalize = (raw: string) => raw
        .replace(/&nbsp;|&#160;/gi, ' ')
        .replace(/\r\n?/g, '\n');
      if (rich) {
        // 🌃 OPRAVA: Filtruj skryté sekce před extrakcí textu!
        const richClone = rich.cloneNode(true) as HTMLElement;
        // Odstraň #story-cache a všechny .hidden elementy
        const hiddenElements = richClone.querySelectorAll('#story-cache, .hidden');
        hiddenElements.forEach(el => el.remove());
        
        const rawHtml = richClone.innerHTML || '';
        const html = normalize(rawHtml);
        let text = html
          .replace(/<br\s*\/>?/gi, '\n')
          .replace(/<\/(p|div|h[1-6]|li)>/gi, '</$1>\n')
          .replace(/<li[^>]*>/gi, '• ')
          .replace(/<style[\s\S]*?<\/style>/gi, '')
          .replace(/<script[\s\S]*?<\/script>/gi, '')
          .replace(/<[^>]+>/g, '')
          .replace(/[\t ]+\n/g, '\n')
          .replace(/\n{3,}/g, '\n\n')
          .trim();
        if (!text) {
          // fallback: použij textContent bohatého bloku (také filtrovaného)
          text = normalize(richClone.textContent || '').trim();
        }
        return text;
      }
      const s = h.querySelector('.sr-only') as HTMLElement | null;
      return s ? normalize(s.textContent || '').trim() : '';
    };

    // Po dopsání nahraď obsah bohatým HTML z hidden kontejneru (pokud existuje)
    const swapInRich = (host: HTMLElement) => {
      const rich = host.querySelector('.rich-hidden') as HTMLElement | null;
      if (rich) {
        // Zachovej host, ale vyměň jeho vnitřek za rich children
        host.innerHTML = rich.innerHTML;
        try {
          const sg = (window as any).startGlitching;
          // Inicializuj glitch pouze pro nové prvky (idempotentně)
          const nodes = host.querySelectorAll('.glitch-master, .glitching');
          const toInit: HTMLElement[] = [];
          nodes.forEach((el) => {
            const d = (el as HTMLElement).dataset as any;
            if (!d || !d.glitchInit) {
              (el as HTMLElement).classList.add('glitch-to-init');
              if (d) d.glitchInit = '1';
              toInit.push(el as HTMLElement);
            }
          });
          if (toInit.length && typeof sg === 'function') {
            sg('.glitch-to-init');
            toInit.forEach((el) => el.classList.remove('glitch-to-init'));
          }
        } catch {}
      }
    };

    let cancel1: null | (() => void) = null;
    let cancel2: null | (() => void) = null;

    cancel1 = runTypewriter({
      text: getHostText(titleHost),
      host: titleHost,
      getDurationMs: () => 1400,
      onStart: () => { /* no-op before typing CTA */ return; },
      onDone: () => {
        // Zpřístupni reader-controls až po dopsání titulku, stejně jako CTA po manifestu
        setControlsVisible(true);
        swapInRich(titleHost);
        // Pokud není bodyHost, skonči – log/dialog už byly vypsány v první fázi
        if (!bodyHost) { console.log('typewriter: no bodyHost, skipping body and not repeating log/dialog'); return; }
        console.log('typewriter: title done, starting body');
        // Line-by-line typing for body
        const fullText = getHostText(bodyHost);
        console.log('typewriter: body fullText', { len: fullText.length, sample: fullText.slice(0, 120) });
        let lines = fullText.split(/\n/);
        if (lines.length <= 1 && fullText.length > 300) {
          // Heuristicky rozsekej na věty, když nejsou newline
          lines = fullText.split(/\n|(?<=[\.!?…])\s+(?=[A-ZÁ-Ž0-9„(])/u);
        }
        if (!fullText || !fullText.trim()) {
          // žádné tělo? nic dalšího nespouštěj – log/dialog už proběhly v první fázi
          console.log('typewriter: body empty, skipping without repeating log/dialog');
          return;
        }
        let container = bodyHost.querySelector('.noising-text') as HTMLElement | null;
        if (!container) {
          // vytvoř kontejner, pokud nějaký chytrák v DOMu zmizel
          container = document.createElement('span');
          container.className = 'noising-text';
          bodyHost.appendChild(container);
        }
        if (container) {
          // Nemaž obsah – čtečka se musí zvětšovat a historie zůstávat
          (container.style as any).whiteSpace = 'pre-wrap';
          (container.style as any).display = 'block';
        }
        console.log('typewriter: body start', { lines: lines.length, sample: lines.slice(0,3) });

        const computeTotalDuration = () => {
          const mw = document.getElementById('manifest-container');
          if (mw) {
            const cs = getComputedStyle(mw);
            const durVar = cs.getPropertyValue('--typewriter-duration').trim();
            if (durVar.endsWith('ms')) return parseFloat(durVar) * 3.5;
            if (durVar.endsWith('s')) return parseFloat(durVar) * 1000 * 3.5;
          }
          return 24000;
        };

        const totalDuration = computeTotalDuration();
        const lengths = lines.map(l => l.length || 1);
        const totalChars = lengths.reduce((a,b)=>a+b,0) || 1;
        const cancels: (null | (()=>void))[] = [];
        let aborted = false;

        const startLine = (idx: number, onAllDone: () => void) => {
          if (aborted) return;
          if (idx >= lines.length) { onAllDone(); return; }
          const text = lines[idx];
          const lineEl = document.createElement('span');
          (lineEl.style as any).whiteSpace = 'pre-wrap';
          (lineEl.style as any).display = 'block';
          if (container) {
            container.appendChild(lineEl);
            scrollTerminalBottom();
          }
          const share = lengths[idx] / totalChars;
          // základ z celkové doby + rozumné omezení per-line, ať první megařádek netrvá věčně
          let dur = Math.max(250, Math.round(totalDuration * share));
          const perChar = Math.min(5000, Math.max(250, (text.length || 1) * 22));
          dur = Math.min(dur, perChar);
          if (idx === 0) {
            try { console.log('typewriter: body line0', { len: text.length, dur }); } catch {}
          }
          // Pokud je řádek prázdný/whitespace, jen vlož prázdný blok a pokračuj
          if (!text || text.trim() === '') {
            // malá pauza pro rytmus
            window.setTimeout(() => startLine(idx + 1, onAllDone), 10);
            return;
          }
          const cancel = runTypewriter({
            text,
            host: lineEl,
            getDurationMs: () => dur,
            onStart: () => { /* no-op before typing button label */ return; },
            onDone: () => { scrollTerminalBottom(); startLine(idx + 1, onAllDone); }
          });
          cancels.push(cancel);
        };

        // Expose a cancel for the whole body sequence
        cancel2 = () => {
          aborted = true;
          try { cancels.forEach(c => { if (c) c(); }); } catch {}
        };

        try {
          startLine(0, () => {
            if (!aborted) {
              // Po dopsání těla nic neopakuj – log/dialog už proběhly v první fázi
              scrollTerminalBottom();
            }
          });
        } catch (err) {
          console.error('typewriter: body sequence error', err);
        }
      }
    });

    return () => {
      try { if (cancel1) cancel1(); } catch {}
      try { if (cancel2) cancel2(); } catch {}
    };
  }, [showReader, showReaderDetails]);

  // Popup-tip: delegované tooltipy (short na hover, long po kliku) s čištěním
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    let popupElement: HTMLDivElement | null = null;
    let longTextTimeout: ReturnType<typeof setTimeout> | null = null;
    let currentTip: HTMLElement | null = null;

    const updatePopupPosition = (event: MouseEvent) => {
      if (!popupElement) return;
      const padding = 10;
      const popupWidth = popupElement.offsetWidth;
      const popupHeight = popupElement.offsetHeight;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let x = event.clientX + 15;
      let y = event.clientY + 15;

      if (x + popupWidth + padding > viewportWidth) {
        x = viewportWidth - popupWidth - padding;
      }
      if (x < padding) x = padding;

      if (y + popupHeight + padding > viewportHeight) {
        y = viewportHeight - popupHeight - padding;
      }
      if (y < padding) y = padding;

      popupElement.style.left = `${x}px`;
      popupElement.style.top = `${y}px`;
    };

    const hidePopup = () => {
      if (popupElement) {
        popupElement.remove();
        popupElement = null;
      }
      if (longTextTimeout) {
        clearTimeout(longTextTimeout);
        longTextTimeout = null;
      }
      document.removeEventListener('mousemove', updatePopupPosition as any);
      window.removeEventListener('scroll', hidePopup as any);
      currentTip = null;
    };

    const showPopup = (targetElement: HTMLElement, event: MouseEvent) => {
      if (popupElement) hidePopup();
      const shortText = (targetElement as any).dataset?.short as string | undefined;
      const longText = (targetElement as any).dataset?.long as string | undefined;
      if (!shortText) {
        console.warn('popup-tip: chybí data-short');
        return;
      }
      console.debug('popup-tip: show', { shortText, longText, target: targetElement });

      popupElement = document.createElement('div');
      popupElement.className = 'popup-container';
      popupElement.style.position = 'fixed';
      popupElement.style.pointerEvents = 'none';
      popupElement.style.opacity = '0';
      popupElement.style.zIndex = '3000';

      const content = document.createElement('p');
      content.className = 'popup-text';
      content.textContent = shortText;
      popupElement.appendChild(content);
      document.body.appendChild(popupElement);

      updatePopupPosition(event);
      popupElement.style.opacity = '1';

      document.addEventListener('mousemove', updatePopupPosition as any);
      window.addEventListener('scroll', hidePopup as any, { once: true } as any);

      if (longText) {
        longTextTimeout = setTimeout(() => {
          if (popupElement) {
            const p = popupElement.querySelector('.popup-text') as HTMLElement | null;
            if (p) p.textContent = longText;
            updatePopupPosition(event);
          }
        }, 3500);
      }
    };

    const showLongTextOnClick = (targetElement: HTMLElement, event: MouseEvent) => {
      if (!popupElement) showPopup(targetElement, event);
      const longText = (targetElement as any).dataset?.long as string | undefined;
      if (longText && popupElement) {
        if (longTextTimeout) {
          clearTimeout(longTextTimeout);
          longTextTimeout = null;
        }
        const p = popupElement.querySelector('.popup-text') as HTMLElement | null;
        if (p) p.textContent = longText;
        updatePopupPosition(event);
      }
    };
    
    const onMouseMove = (ev: Event) => {
      const e = ev as MouseEvent;
      let tip = (e.target as HTMLElement)?.closest('.popup-tip') as HTMLElement | null;
      if (!tip) {
        // Některé glitch overlay vrstvy mohou blokovat hit-test. Dočasně je vypneme.
        const overlays = (Array.from(document.querySelectorAll('[class*="glitch"]')) as HTMLElement[])
          .filter(el => !el.closest('.popup-tip'));
        const prevPE: [HTMLElement, string][] = [];
        overlays.forEach(el => { prevPE.push([el, el.style.pointerEvents]); el.style.pointerEvents = 'none'; });
        try {
          const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
          tip = el ? (el.closest('.popup-tip') as HTMLElement | null) : null;
        } finally {
          prevPE.forEach(([el, pe]) => { el.style.pointerEvents = pe; });
        }
      }
      if (tip !== currentTip) {
        if (currentTip) hidePopup();
        if (tip) showPopup(tip, e);
        currentTip = tip;
      }
      if (popupElement) updatePopupPosition(e);
    };

    const onPointerEnter = (ev: Event) => {
      const e = ev as PointerEvent;
      const tip = (e.target as HTMLElement)?.closest('.popup-tip') as HTMLElement | null;
      if (tip) {
        currentTip = tip;
        showPopup(tip, e as any as MouseEvent);
      }
    };

    const onPointerLeave = (ev: Event) => {
      const e = ev as PointerEvent;
      const tip = (e.target as HTMLElement)?.closest('.popup-tip') as HTMLElement | null;
      if (tip && tip === currentTip) {
        hidePopup();
        currentTip = null;
      }
    };

    const onClick = (ev: Event) => {
      const e = ev as MouseEvent;
      const target = currentTip || ((e.target as HTMLElement)?.closest('.popup-tip') as HTMLElement | null);
      if (target) showLongTextOnClick(target, e);
    };

    document.body.addEventListener('mousemove', onMouseMove as any);
    document.body.addEventListener('pointerenter', onPointerEnter as any, true);
    document.body.addEventListener('pointerleave', onPointerLeave as any, true);
    document.body.addEventListener('click', onClick as any);

    return () => {
      hidePopup();
      document.body.removeEventListener('mousemove', onMouseMove as any);
      document.body.removeEventListener('pointerenter', onPointerEnter as any, true);
      document.body.removeEventListener('pointerleave', onPointerLeave as any, true);
      document.body.removeEventListener('click', onClick as any);
    };
  }, []);

  // Typewriter pro tlačítko "Pokračovat" – stejné efekty jako manifest
  useEffect(() => {
    if (!btnVisible) return;
    const btn = btnGlitchRef.current as HTMLButtonElement | null;
    if (!btn) return;
    const host = btn.querySelector('.glitch-real') as HTMLElement | null;
    if (!host) return;
    // Zajistíme, že máme cílový span pro psaní
    let span = host.querySelector('.noising-text') as HTMLElement | null;
    if (!span) {
      span = document.createElement('span');
      span.className = 'noising-text';
      host.appendChild(span);
    } else {
      span.textContent = '';
    }
    // Vyprázdni fake vrstvy během psaní, ať neprozrazují text
    const f1 = btn.querySelector('.glitch-fake1') as HTMLElement | null;
    const f2 = btn.querySelector('.glitch-fake2') as HTMLElement | null;
    if (f1) f1.textContent = '';
    if (f2) f2.textContent = '';
    const cancel = runTypewriter({
      text: BTN_LABEL,
      host,
      getDurationMs: () => {
        // použij stejné tempo jako manifest (fallback 2200ms pro kratší text)
        const mw = document.getElementById('manifest-container');
        if (mw) {
          const cs = getComputedStyle(mw);
          const durVar = cs.getPropertyValue('--typewriter-duration').trim();
          if (durVar.endsWith('ms')) return parseFloat(durVar) * 0.35; // kratší label, zrychlíme
          if (durVar.endsWith('s')) return parseFloat(durVar) * 1000 * 0.35;
        }
        return 2200;
      },
      onStart: () => { /* no-op before typing CTA button */ return; },
      onDone: () => {
        // po dopsání naplň fake vrstvy pro hover glitch
        if (f1) f1.textContent = BTN_LABEL;
        if (f2) f2.textContent = BTN_LABEL;
        try {
          const w: any = window as any;
          if (w.startShinning) w.startShinning();
        } catch {}
        try {
          const w: any = window as any;
          if (w.startNoising) w.startNoising();
        } catch {}
      },
    });
    return () => { try { cancel(); } catch {} };
  }, [btnVisible]);

  // Přednačti/pořiď shared audio (bez autoplay)
  useEffect(() => {
    try {
      const a = getSharedAudio();
      audioRef.current = a;
      // inicializace stavu podle skutečného přehrávání
      const compute = () => setIsAudioPlaying(() => !!a && !a.paused && !a.ended && a.currentTime > 0);
      compute();
      const onPlay = () => setIsAudioPlaying(true);
      const onPause = () => setIsAudioPlaying(false);
      const onEnded = () => setIsAudioPlaying(false);
      a.addEventListener('play', onPlay);
      a.addEventListener('pause', onPause);
      a.addEventListener('ended', onEnded);
      return () => {
        try {
          a.removeEventListener('play', onPlay);
          a.removeEventListener('pause', onPause);
          a.removeEventListener('ended', onEnded);
        } catch {}
      };
    } catch {}
  }, []);

  const handleContinue = async () => {
    try {
      // Preferuj ovládání přes panel, aby se synchronizovala i UI ikonka
      const ensure = (window as any).audioPanelEnsurePlaying as undefined | (() => void);
      if (typeof ensure === 'function') {
        if (!isStartingAudioRef.current) {
          isStartingAudioRef.current = true;
          ensure();
          sessionStorage.setItem('synthoma_play_audio', '1');
          setTimeout(() => { isStartingAudioRef.current = false; }, 150);
        }
      } else {
        const a = audioRef.current || getSharedAudio();
        // Spusť hudbu jen pokud skutečně nehraje
        if (a && (a.paused || a.ended || a.currentTime === 0)) {
          if (!isStartingAudioRef.current) {
            isStartingAudioRef.current = true;
            await a.play().catch(() => { /* autoplay may be blocked */ return; });
            sessionStorage.setItem('synthoma_play_audio', '1');
            // reset flag krátce po onplay; play event nasadí isAudioPlaying
            setTimeout(() => { isStartingAudioRef.current = false; }, 150);
          }
        }
      }
    } catch {}
    // Místo přesměrování ukážeme čtečku/terminál na této stránce
    setShowReader(true);
    try {
      const w: any = window as any;
      if (w.stopShinning) w.stopShinning();
    } catch {}
  };

  // Cinematic intro pro nadpis – externalizováno
  useEffect(() => {
    if (!showTitle) return;
    const root = glitchRootRef.current as unknown as HTMLElement | null;
    if (!root) return;
    const cancel = runCinematicTitleIntro(root);
    return () => { try { cancel(); } catch {} };
  }, [showTitle]);

  // Počet kroků pro typewriter podle délky textu
  const typewriterSteps = useMemo(() => String(MANIFEST.length), []);

  // Nastav CSS proměnnou pro typewriter kroky bez inline JSX stylů
  useEffect(() => {
    const el = document.getElementById("manifest-container");
    if (el) {
      el.style.setProperty("--typewriter-steps", typewriterSteps);
      // Zpomalení typewriteru – lze ladit přes CSS proměnné
      el.style.setProperty("--typewriter-duration", "7.2s");
      el.style.setProperty("--caret-duration", "1.4s");
    }
  }, [typewriterSteps]);

  // Typewriter: externalizováno do helperu runTypewriter
  useEffect(() => {
    if (!showManifest) return;
    const host = document.getElementById('manifest-container') as HTMLElement | null;
    if (!host) return;
    const cancel = runTypewriter({
      text: MANIFEST,
      host,
      getDurationMs: () => {
        const cs = getComputedStyle(host);
        const durVar = cs.getPropertyValue('--typewriter-duration').trim();
        if (durVar.endsWith('ms')) return parseFloat(durVar);
        if (durVar.endsWith('s')) return parseFloat(durVar) * 1000;
        return 7200;
      },
      onStart: () => setTypedDone(false),
      onDone: () => setTypedDone(true),
    });
    return () => { try { cancel(); } catch {} };
  }, [showManifest]);

  // Spusť shining až po dokončení psaní (s retry, kdyby helper ještě nebyl načten)
  useEffect(() => {
    if (!typedDone) return;
    if (document.body?.classList.contains('no-animations')) return;
    let tries = 0;
    const startNow = () => { try { const w: any = window as any; if (typeof w.startShinning === 'function') w.startShinning(); } catch {} };
    const id = window.setInterval(() => {
      tries++;
      const w: any = window as any;
      if (typeof w.startShinning === 'function') { startNow(); window.clearInterval(id); }
      if (tries > 40) { window.clearInterval(id); }
    }, 50);
    return () => { window.clearInterval(id); };
  }, [typedDone]);

  // Post-typing hard fallback: guarantee visible flicker even if helper misbehaves
  useEffect(() => {
    if (!typedDone) return;
    // mírná prodleva, ať tlačítko vstoupí s jemným intrem
    const id = window.setTimeout(() => setBtnVisible(true), 300);
    const prefersReduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const animationsDisabled = typeof document !== 'undefined' && document.body?.classList.contains('no-animations');
    if (prefersReduced || animationsDisabled) return; // v tomto režimu necháme jen statický glow
    let flickerInterval: number | null = null;
    const host = document.querySelector('#manifest-container .noising-text') as HTMLElement | null;
    if (!host) return;
    const run = () => {
      const arr = host.querySelectorAll('.noising-char');
      if (!arr || !arr.length) return;
      const bursts = 1 + Math.floor(Math.random()*3);
      for (let b=0; b<bursts; b++){
        const i = Math.floor(Math.random()*arr.length);
        const el = arr[i] as HTMLElement;
        if (!el) continue;
        el.classList.add('flickering');
        window.setTimeout(() => { try { el.classList.remove('flickering'); } catch {} }, 140 + Math.random()*240);
      }
    };
    flickerInterval = window.setInterval(run, 360 + Math.random()*720) as unknown as number;
    return () => { if (flickerInterval) { clearInterval(flickerInterval); flickerInterval = null; } try { window.clearTimeout(id); } catch {} };
  }, [typedDone]);

  // Glitch efekt přepnut do helperu v /public/js/ui-helpers.js pro čistější page.tsx
  useEffect(() => {
    const prefersReduced = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;
    let detach: null | (() => void) = null;
    const root = glitchRootRef.current;
    if (!root) return;
    function tryAttach(){
      if (typeof window !== 'undefined' && typeof (window as any).attachGlitchHeading === 'function'){
        detach = (window as any).attachGlitchHeading(root, TITLE, { intervalMs: 260, chance: 0.08, restoreMin: 160, restoreJitter: 140 });
        return true;
      }
      return false;
    }
    if (!tryAttach()){
      const maxWait = 2000; const start = Date.now();
      const id = window.setInterval(() => { if (tryAttach() || Date.now()-start>maxWait) window.clearInterval(id); }, 50);
    }
    return () => { if (detach) try { detach(); } catch {} };
  }, []);

  return (
    <main className="home" role="main">
      <section className="hero-intro" aria-label="SYNTHOMA Intro">
        <div id="resizing-text" className={`intro-title ${showTitle ? "visible" : ""}`.trim()}>
          <h1 id="glitch-synthoma" className="glitch-master" ref={glitchRootRef} aria-label={TITLE}>
            <span className="glitch-fake1">{TITLE}</span>
            <span className="glitch-fake2">{TITLE}</span>
            <span className="glitch-real" aria-hidden="true">
              {TITLE.split("").map((ch, idx) => (
                <span key={idx} className="glitch-char">{ch}</span>
              ))}
            </span>
            <span className="sr-only">{TITLE}</span>
          </h1>
        </div>

        <div className={`manifest-wrapper ${typedDone ? 'has-cta' : ''}`.trim()}>
          <p className="manifest typewriter shinning" id="manifest-container" aria-live="polite" aria-atomic >
            <span className="noising-text" aria-hidden="true"></span>
            <span className="sr-only">{MANIFEST}</span>
          </p>
        </div>
        {typedDone && !showReader ? (
          <div className="hero-cta">
            <button
              className={`glitch-button appear ${btnVisible ? 'visible' : ''}`.trim()}
              onClick={handleContinue}
              aria-label={BTN_LABEL}
              ref={btnGlitchRef}
              disabled={isAudioPlaying || isStartingAudioRef.current}
            >
              <span className="glitch-fake1"></span>
              <span className="glitch-fake2"></span>
              <span className="glitch-real" aria-hidden="true">
                <span className="noising-text"></span>
              </span>
              <span className="sr-only">{BTN_LABEL}</span>
            </button>
          </div>
        ) : null}

        {showReader ? (
          <div className="reader-container" aria-live="polite">
            <div className="SYNTHOMAREADER terminal" role="region" aria-label="Terminál SYNTHOMA">
              <div id="reader-content">
                <div id="reader-log" className="log">
                  <span ref={bootBinaryRef} className="boot-binary halo glitchy glitching" style={{ opacity: 0.33, fontSize: '0.4em', whiteSpace: 'nowrap' }} aria-hidden="true">01010011 01011001 01001110 01010100 01001000 01001111 01001101 01000001</span>
                </div>
                {/* Minimal body host kvůli sekvenci typewriteru */}
                <div id="reader-body" className="text">
                  <span className="noising-text" aria-hidden="true"></span>
                </div>
                <p id="reader-dialog" className="dialog" style={{ marginLeft: '0.7rem' }}>
                  <span className="noising-text"></span>
                  <span className="sr-only">„Vítej v SYNTHOMĚ, <span className="glitching">@&SĐYŁ</span> !!! Tady jméno nikoho nezajímá, ale chyby? Ty jsou v paměti věčně.“</span>
                </p>
                <p id="reader-title" className="text" style={{ marginLeft: '0.7rem' }}>
                  <span className="noising-text" aria-hidden="true"></span>
                  <span className="rich-hidden" aria-hidden="true">
                    Chceš si přečíst něco o SYNTHOMĚ nebo rovnou začít číst?
                  </span>
                </p>
                <div className={`reader-controls appear ${controlsVisible ? 'visible' : ''}`.trim()}>
                  <button type="button" className="glitch-button small" onClick={handleInfoClick} aria-label="Zobrazit INFO">INFO</button>
                  <button type="button" className="glitch-button small" onClick={handleBooksClick} aria-label="Začít číst">ČÍST</button>
                </div>
                {/* Extra output area for dynamic lists (books/chapters) below controls */}
                <div id="reader-extra" className="text" aria-live="polite">
                  <span className="noising-text" aria-hidden="true"></span>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}
