export type CancelFn = () => void;
export type SpeedMode = 'instant' | 'fast' | 'normal' | 'slow';

// 🚀 Global speed control
let currentSpeed: SpeedMode = 'normal';

export function setCurrentSpeed(speed: SpeedMode): void {
  currentSpeed = speed;
  try {
    localStorage.setItem('typewriterSpeed', speed);
  } catch (e) {
    console.warn('💥 Could not save typewriter speed to localStorage:', e);
  }
}

// --- Upgrade inline <p class="choice"> na klikatelné volby s implicitním cílem ---
function enhanceInlineChoices(scope: HTMLElement): void {
  const process = (root: HTMLElement) => {
    // Najdi všechny doposud neupravené skupiny <p class="choice">
    const all = Array.from(root.querySelectorAll('p.choice')) as HTMLParagraphElement[];
    if (!all.length) return;
    let i = 0;
    while (i < all.length) {
      const start = all[i];
      if (!start.isConnected) { i++; continue; }
      // Seskup sousední choice odstavce
      const group: HTMLParagraphElement[] = [start];
      let j = i + 1;
      while (j < all.length && all[j].previousElementSibling === group[group.length - 1]) {
        group.push(all[j]);
        j++;
      }
      i = j;
      // Vytvoř box a nahraď skupinu
      const box = document.createElement('div');
      box.className = 'choice-box';
      // Urči implicitní další blok: první prvek po skupině, který není choice
      const afterGroup = group[group.length - 1].nextElementSibling as HTMLElement | null;
      let nextTarget: HTMLElement | null = afterGroup;
      while (nextTarget && nextTarget.matches('p.choice')) {
        nextTarget = nextTarget.nextElementSibling as HTMLElement | null;
      }
      let targetId = '';
      if (nextTarget) {
        if (!nextTarget.id) {
          nextTarget.id = `auto-block-${Math.random().toString(36).slice(2, 8)}`;
        }
        targetId = nextTarget.id;
      }
      // Zkus propsat stejné ID do odpovídajícího prvku v .rich-hidden zrcadle (podle tagu a textu)
      if (targetId && nextTarget) {
        const textKey = (nextTarget.innerText || '').trim().slice(0, 64);
        const tag = nextTarget.tagName;
        const mirrors = Array.from((root.closest('#reader-content') || document).querySelectorAll('.rich-hidden')) as HTMLElement[];
        for (let m = mirrors.length - 1; m >= 0; m--) {
          const candList = Array.from(mirrors[m].children) as HTMLElement[];
          const match = candList.find(el => el.tagName === tag && (el.innerText || '').trim().startsWith(textKey));
          if (match && !match.id) { match.id = targetId; break; }
        }
      }
      for (const p of group) {
        const a = document.createElement('a');
        a.className = 'choice-link';
        a.href = '#';
        a.setAttribute('aria-disabled', 'false');
        
        // 🌃 OPRAVA: Zachovej původní data-next atribut z HTML, pokud existuje!
        const originalDataNext = p.getAttribute('data-next');
        if (originalDataNext) {
          a.setAttribute('data-next', originalDataNext);
        } else if (targetId) {
          a.setAttribute('data-next', targetId);
        }
        
        // zachovej vnitřní obsah (včetně <span>▼)
        a.innerHTML = p.innerHTML;
        box.appendChild(a);
      }
      // Vlož box před první položku a odstraň původní p.choice
      group[0].parentElement?.insertBefore(box, group[0]);
      for (const p of group) { p.remove(); }
    }
  };
  // Proveď nad viditelným scope
  process(scope);
  // A také nad případnými .rich-hidden zrcadly uvnitř stejného scope (pokud existují)
  const mirrors = Array.from(scope.querySelectorAll('.rich-hidden')) as HTMLElement[];
  for (const m of mirrors) process(m);
}

function getCurrentSpeed(): SpeedMode {
  try {
    const saved = localStorage.getItem('typewriterSpeed') as SpeedMode;
    if (saved && ['instant', 'fast', 'normal', 'slow'].includes(saved)) {
      return saved;
    }
  } catch (e) {
    console.warn('💥 Could not load typewriter speed from localStorage:', e);
  }
  return 'normal';
}

// Initialize speed from localStorage
currentSpeed = getCurrentSpeed();

// Idle callback polyfill (best-effort)
type IdleDeadlineLike = { timeRemaining: () => number; didTimeout?: boolean };
const requestIdle = ((): ((cb: (deadline: IdleDeadlineLike) => void) => number) => {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    // @ts-ignore
    return window.requestIdleCallback.bind(window);
  }
  return (cb: (deadline: IdleDeadlineLike) => void) => {
    return window.setTimeout(() => cb({ timeRemaining: () => 50, didTimeout: false }), 200);
  };
})();

function debugLog(...args: any[]) {
  try {
    const ls = (typeof localStorage !== 'undefined') ? localStorage.getItem('debug') : null;
    const enabled = (ls === '1' || ls === 'true' || (typeof process !== 'undefined' && (process as any).env && (process as any).env.NODE_ENV !== 'production'));
    if (enabled) console.log(...args);
  } catch {
    // if anything explodes, stay quiet – debug is optional
  }
}

// 🎧 Global listener for speed changes from control panel
const handleSpeedChange = (e: any) => {
  const speed = e.detail?.speed as SpeedMode;
  if (speed) {
    setCurrentSpeed(speed);
    debugLog(`💀 Typewriter speed updated from control panel: ${speed}`);
  }
};

// Set up global listener once
if (typeof document !== 'undefined') {
  document.removeEventListener('synthoma:speed-changed', handleSpeedChange);
  document.addEventListener('synthoma:speed-changed', handleSpeedChange);
  debugLog('💀 Global speed change listener attached');
}

interface TypewriterOptions {
  text: string;
  host: HTMLElement; // container that has a span.noising-text inside
  getDurationMs?: () => number; // returns the total typing duration from CSS variables
  onStart?: () => void;
  onDone?: () => void;
  speed?: 'slow' | 'normal' | 'fast' | 'instant'; // 🚀 Nová možnost rychlosti
  glitchIntensity?: 'minimal' | 'normal' | 'intense'; // 💀 Intenzita glitch efektů
  enableSound?: boolean; // 🔊 Zvukové efekty (pro budoucnost)
}

// --- Kapitoly: injektuj <style>/<link> z HTML kapitoly do <head> a vrať obsah <body> ---
function absolutizeUrl(raw: string, baseUrl: string): string {
  const url = raw.trim().replace(/^['"]|['"]$/g, '');
  if (!url) return url;
  if (/^(?:[a-z]+:)?\/\//i.test(url)) return url; // http(s): or protocol-relative
  if (/^(?:data:|blob:|about:)/i.test(url)) return url;
  if (url.startsWith('/')) return url; // already root-based
  return baseUrl.replace(/\/[^/]*$/, '/') + url; // ensure trailing slash then append
}

function rewriteCssUrls(cssText: string, baseUrl: string): string {
  return cssText.replace(/url\(([^)]+)\)/gi, (m, p1) => {
    const abs = absolutizeUrl(String(p1), baseUrl);
    return `url(${abs})`;
  }).replace(/@import\s+url\(([^)]+)\)/gi, (m, p1) => {
    const abs = absolutizeUrl(String(p1), baseUrl);
    return `@import url(${abs})`;
  }).replace(/@import\s+['"]([^'\"]+)['"]/gi, (m, p1) => {
    const abs = absolutizeUrl(String(p1), baseUrl);
    return `@import url(${abs})`;
  });
}

function clearPreviousChapterAssets(): void {
  const head = document.head;
  const nodes = Array.from(head.querySelectorAll('[data-chapter-asset="1"]')) as HTMLElement[];
  nodes.forEach(n => { try { n.remove(); } catch {} });
}

function installChapterAssetsAndGetBody(html: string, baseUrl: string, _key: string): string {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const head = document.head;
    // Vyčisti předchozí injekce
    clearPreviousChapterAssets();

    // <link rel="stylesheet"/preload font>
    const links = Array.from(doc.querySelectorAll('link')) as HTMLLinkElement[];
    for (const l of links) {
      const rel = (l.getAttribute('rel') || '').toLowerCase();
      if (!rel) continue;
      if (rel === 'stylesheet' || (rel === 'preload' && (l.getAttribute('as') || '').toLowerCase() === 'font') || rel === 'preconnect') {
        const el = document.createElement('link');
        el.rel = l.rel;
        const href = l.getAttribute('href') || '';
        if (href) el.href = absolutizeUrl(href, baseUrl);
        const asv = l.getAttribute('as'); if (asv) el.as = asv as any;
        const cross = l.getAttribute('crossorigin'); if (cross) el.setAttribute('crossorigin', cross);
        const media = l.getAttribute('media'); if (media) el.media = media;
        el.setAttribute('data-chapter-asset', '1');
        head.appendChild(el);
      }
    }

    // <style> bloky (z headu i body)
    const styles = Array.from(doc.querySelectorAll('style')) as HTMLStyleElement[];
    for (const s of styles) {
      const el = document.createElement('style');
      el.type = s.type || 'text/css';
      el.textContent = rewriteCssUrls(s.textContent || '', baseUrl);
      el.setAttribute('data-chapter-asset', '1');
      head.appendChild(el);
    }

    // Přepiš relativní URL v body (img/src, video/audio/source/src, a[href] na kapitolu)
    const body = doc.body;
    if (body) {
      const rewriteAttr = (el: Element, attr: string) => {
        const val = el.getAttribute(attr);
        if (!val) return;
        el.setAttribute(attr, absolutizeUrl(val, baseUrl));
      };
      body.querySelectorAll('img, video, audio, source, track').forEach((el) => rewriteAttr(el as Element, 'src'));
      body.querySelectorAll('a[href]').forEach((el) => {
        const href = el.getAttribute('href') || '';
        // ponech #anchor a absolutní odkazy
        if (href.startsWith('#') || /^(?:[a-z]+:)?\/\//i.test(href)) return;
        (el as Element).setAttribute('href', absolutizeUrl(href, baseUrl));
      });

      // Lazy a decoding pro obrázky; snížení špiček při renderu
      const imgs = Array.from(body.querySelectorAll('img')) as HTMLImageElement[];
      for (const img of imgs) {
        if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
        if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async');
        // Pokud je to obří ilustrace bez width/height, nastav aspoň fetchpriority nízko
        if (!img.hasAttribute('fetchpriority')) img.setAttribute('fetchpriority', 'low');
      }
      // Metadata only pro videa (pokud autor výslovně neurčil jinak)
      const videos = Array.from(body.querySelectorAll('video')) as HTMLVideoElement[];
      for (const v of videos) { if (!v.hasAttribute('preload')) v.setAttribute('preload', 'metadata'); }
      
      // 🌃 OPRAVA ZRUŠENA: Nesmíme odstranit #story-cache z DOM - potřebujeme ho pro dynamické načítání bloků!
      // Filtrování se děje jen při extrakci textu v getHostText() a extractTextFromRichHost()
      
      return body.innerHTML;
    }
    return html;
  } catch (e) {
    console.warn('chapter assets install failed', e);
    return html;
  }
}

// --- Externí utilitky pro typewriter na #reader-body ---

function extractTextFromRichHost(host: HTMLElement): string {
  const rich = host.querySelector('.rich-hidden') as HTMLElement | null;
  const normalize = (raw: string) => raw
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/\r\n?/g, '\n');
  if (rich) {
    // 🌃 OPRAVA: Filtruj skryté sekce před extrakcí textu (stejně jako v getHostText)!
    const richClone = rich.cloneNode(true) as HTMLElement;
    // Odstraň #story-cache a všechny .hidden elementy
    const hiddenElements = richClone.querySelectorAll('#story-cache, .hidden');
    hiddenElements.forEach(el => el.remove());
    
    const rawHtml = richClone.innerHTML || '';
    const html2 = normalize(rawHtml);
    let text = html2
      .replace(/<br\s*\/?>(?=\s*\n?)/gi, '\n')
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
  return '';
}

interface Segment {
  text: string;
  classes: string;
  style?: string;
  inline?: boolean;
}

// Vytvoř segmenty z bohatého HTML: rozlož blokové prvky na střídání textových úseků a inline prvků v původním pořadí
function extractSegmentsFromRichHost(host: HTMLElement): Segment[] {
  const riches = Array.from(host.querySelectorAll('.rich-hidden')) as HTMLElement[];
  const rich = riches.length ? (riches[riches.length - 1]) : null;
  if (!rich) return [];
  
  // 🌃 OPRAVA: Filtruj jen volby, ale zachovej hlavní obsah pro segmentaci!
  const richClone = rich.cloneNode(true) as HTMLElement;
  
  // DEBUG: Zjisti, co obsahuje před filtrováním
  console.log('🔍 DEBUG segmentace - před filtrováním:', richClone.innerHTML.substring(0, 200) + '...');
  
  // Odstraň jen volby (p.choice), ale zachovej nadpis a text pro postupné vypisování
  const choiceElements = richClone.querySelectorAll('p.choice, .choice-box');
  console.log('🔍 DEBUG segmentace - našel voleb k odstranění:', choiceElements.length);
  choiceElements.forEach(el => el.remove());
  
  // Také odstraň #story-cache a .hidden
  const hiddenElements = richClone.querySelectorAll('#story-cache, .hidden');
  console.log('🔍 DEBUG segmentace - našel skrytých elementů:', hiddenElements.length);
  hiddenElements.forEach(el => el.remove());
  
  console.log('🔍 DEBUG segmentace - po filtrování:', richClone.innerHTML.substring(0, 200) + '...');
  
  // Použij filtrovaný klon místo původního rich elementu
  const richToProcess = richClone;
  const out: Segment[] = [];
  const isBlock = (el: Element) => /^(P|DIV|H[1-6]|LI|PRE|BLOCKQUOTE|SECTION)$/i.test(el.tagName);
  const hasBlockClass = (el: Element) => {
    const cls = el.getAttribute('class') || '';
    return /(\b|_)(log|dialog|text|title)(\b|_)/.test(cls);
  };
  const isBlockLike = (el: Element) => isBlock(el) || hasBlockClass(el) || el.tagName.toUpperCase() === 'LOG';
  const needsOwnSegment = (el: Element) => {
    // Inline element zajímavý stylem nebo třídou (např. span s style/class)
    const tag = el.tagName.toUpperCase();
    if (tag === 'BR') return true;
    const cls = (el.getAttribute('class') || '').trim();
    const sty = (el.getAttribute('style') || '').trim();
    return !!cls || !!sty;
  };
  const normText = (s: string) => s
    .replace(/\u00A0/g, ' ')
    .replace(/\r\n?/g, '\n');

  const flushText = (buf: string, parentEl: Element) => {
    const txt = buf
      .replace(/[\t ]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n');
    if (!txt) return;
    const classes = (parentEl.getAttribute('class') || '').trim();
    const style = parentEl.getAttribute('style') || undefined;
    out.push({ text: txt, classes, style, inline: false });
  };

  const pushInline = (el: Element) => {
    const txt = normText((el as HTMLElement).innerText || '');
    if (!txt) return;
    const classes = (el.getAttribute('class') || '').trim();
    const style = el.getAttribute('style') || undefined;
    out.push({ text: txt, classes, style, inline: true });
  };

  const processBlock = (el: Element) => {
    let textBuf = '';
    el.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        textBuf += normText(node.textContent || '');
        return;
      }
      if (node.nodeType === Node.ELEMENT_NODE) {
        const child = node as Element;
        if (child.tagName.toUpperCase() === 'BR') {
          textBuf += '\n';
          return;
        }
        if (needsOwnSegment(child)) {
          // Nejprve vyprázdni dosavadní plain text z rodiče
          flushText(textBuf, el);
          textBuf = '';
          // Přidej inline segment
          pushInline(child);
          return;
        }
        // Rekurze: pokud je vnořený blok, nejprve vyprázdni buff a pak zpracuj vnitřek
        if (isBlock(child)) {
          flushText(textBuf, el);
          textBuf = '';
          processBlock(child);
          return;
        }
        // Obyčejný inline bez class/style – přidej jeho text do bufferu
        textBuf += normText((child as HTMLElement).innerText || '');
      }
    });
    flushText(textBuf, el);
  };

  // Projdi přímé děti a rozlož blokové prvky v pořadí DOM
  Array.from(richToProcess.childNodes).forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const txt = (node.textContent || '').trim();
      if (txt) out.push({ text: txt, classes: '', inline: false });
      return;
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element;
      if (isBlockLike(el)) {
        processBlock(el);
      } else {
        // Neznámý inline kontejner – vezmi jeho text jako inline segment v rámci okolního bloku
        const txt = (el as HTMLElement).innerText || '';
        const cls = (el.getAttribute('class') || '').trim();
        const sty = el.getAttribute('style') || undefined;
        if (txt.trim()) out.push({ text: txt, classes: cls, style: sty, inline: true });
      }
    }
  });
  // Fallback: když nic nenašlo, vrať jeden segment z celého filtrovaného rich
  if (!out.length) {
    const txt = (richToProcess.innerText || '').trim();
    if (txt) out.push({ text: txt, classes: '' });
  }
  return out;
}

// --- Helper: odstraň blokové třídy z kontejneru, aby se nestackovaly s klonem ---
function stripBlockClasses(el: HTMLElement): void {
  try {
    const blocks = ['text', 'log', 'dialog', 'title', 'choice', 'choice-box'];
    blocks.forEach(cls => el.classList.remove(cls));
  } catch {}
}

// 🎮 Utility funkce pro speed controls
// Plovoucí ovladače rychlosti byly odstraněny – spravuje je výhradně ovládací panel v layoutu.

// 🎭 Debug utility pro vývojáře
export function toggleDebugMode(): void {
  document.body.classList.toggle('debug-mode');
  const isDebug = document.body.classList.contains('debug-mode');
  debugLog(`🔧 Debug mode: ${isDebug ? 'ON' : 'OFF'}`);
}

// 🎪 Easter egg: Konami kód aktivace
let konamiSequence: string[] = [];
const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
let konamiAbort: AbortController | null = null;

export function initKonamiCode(): void {
  // Reattach safely – abort previous listener if exists
  try { konamiAbort?.abort(); } catch {}
  konamiAbort = new AbortController();
  const signal = konamiAbort.signal;
  document.addEventListener('keydown', (e) => {
    konamiSequence.push(e.code);
    if (konamiSequence.length > konamiCode.length) {
      konamiSequence.shift();
    }
    
    if (konamiSequence.length === konamiCode.length && 
        konamiSequence.every((key, i) => key === konamiCode[i])) {
      document.body.classList.toggle('konami-activated');
      debugLog('🎉 KONAMI CODE ACTIVATED! Welcome to the matrix... 😎');
      konamiSequence = []; // reset
    }
  }, { signal });
}

// 🚀 Hlavní funkce pro setup speed controls
// setupTypewriterControls odstraněno – žádné automatické vkládání plovoucích tlačítek.

export async function startBodyTypingFromHtml(html: string, hostSelector = '#reader-body'): Promise<void> {
  const bodyHost = document.querySelector(hostSelector) as HTMLElement | null;
  if (!bodyHost) { debugLog('typewriter: no bodyHost'); return; }
  const ds = (bodyHost as any).dataset as Record<string, string | undefined>;
  if (ds.twBusy === '1') { debugLog('typewriter: external busy, skipping'); return; }
  ds.twBusy = '1';

  // vlož/nahraď externí rich obsah
  let ext = bodyHost.querySelector('.rich-external') as HTMLElement | null;
  if (!ext) {
    ext = document.createElement('div');
    ext.className = 'rich-hidden rich-external';
    (ext.style as any).display = 'none';
    bodyHost.appendChild(ext);
  }
  ext.innerHTML = html || '';
  try { enhanceInlineChoices(ext); } catch {}
  // Ulož trvalé zrcadlo celého těla kapitoly pro pozdější navigaci mezi volbami
  try {
    const root = document.querySelector('#reader-content') as HTMLElement | null;
    const inAppend = hostSelector === '#reader-extra';
    if (root && !inAppend) {
      let master = root.querySelector('#rich-master') as HTMLElement | null;
      if (!master) {
        master = document.createElement('div');
        master.id = 'rich-master';
        master.className = 'rich-hidden';
        (master.style as any).display = 'none';
        root.appendChild(master);
      }
      master.innerHTML = html || '';
      try { enhanceInlineChoices(master); } catch {}
    }
  } catch {}

  // 🎯 Označit, že components.css styly by se měly používat
  bodyHost.classList.add('components-loaded');
  // ❌ Zrušeno: žádné dynamic CSS override. Styling patří do reader.css. Díky.
  
  // připrav zobrazovací kontejner
  let container = bodyHost.querySelector('.noising-text') as HTMLElement | null;
  const appendMode = hostSelector === '#reader-extra';
  if (appendMode) {
    // V append módu nikdy nečisti existující obsah; vytvoř nový wrapper pro tento běh
    const wrapper = document.createElement('div');
    wrapper.className = 'tw-block';
    container = document.createElement('span');
    container.className = 'noising-text';
    wrapper.appendChild(container);
    bodyHost.appendChild(wrapper);
  } else {
    if (!container) {
      container = document.createElement('span');
      container.className = 'noising-text';
      bodyHost.appendChild(container);
    } else {
      container.textContent = '';
    }
  }
  (container.style as any).whiteSpace = 'pre-wrap';
  (container.style as any).display = 'block';

  // Nově: segmenty z bohatého HTML, abychom přenesli třídy/styly už při psaní
  const segments = extractSegmentsFromRichHost(bodyHost);
  // Nikdy nepiš volby – odfiltruj je hned na vstupu
  const segmentsNoChoices = segments.filter(s => !/(^|\s)(choice|choice-box)(\s|$)/.test(s.classes || ''));
  let lines = segmentsNoChoices.length ? segmentsNoChoices.map(s => s.text) : extractTextFromRichHost(bodyHost).split(/\n/);
  if (!segments.length && lines.length <= 1 && (lines[0]?.length || 0) > 300) {
    lines = lines[0].split(/\n|(?<=[\.?!…])\s+(?=[A-ZÁ-Ž0-9„(])/u);
  }
  const lengths = lines.map(l => l.length || 1);
  const totalChars = lengths.reduce((a,b)=>a+b,0) || 1;
  // Najdi první index segmentu, který patří do <p class="choice"> – tam se psaní zastaví
  const firstChoiceIdx = segments.findIndex(s => /(^|\s)(choice|choice-box)(\s|$)/.test(s.classes || ''));
  const richList = Array.from(bodyHost.querySelectorAll('.rich-hidden')) as HTMLElement[];
  const richHost = richList.length ? (richList[richList.length - 1] as HTMLElement) : null;
  const master = document.getElementById('rich-master') as HTMLElement | null;
  // Záložní výpočet indexu první volby podle pořadí elementů v richHostu
  let firstChoiceIdxRich = -1;
  if (master || richHost) {
    const src = master || richHost!;
    // Stejná logika jako pro richNodes: pokud je uvnitř jen SECTION, procházej jeho děti
    const rawChildren = Array.from(src.children) as HTMLElement[];
    let baseNodes: HTMLElement[] = rawChildren;
    if (rawChildren.length === 1 && rawChildren[0].tagName.toUpperCase() === 'SECTION') {
      baseNodes = Array.from(rawChildren[0].children) as HTMLElement[];
    }
    for (let i = 0; i < baseNodes.length; i++) {
      const el = baseNodes[i];
      if (el.classList.contains('choice-box') || (typeof el.matches === 'function' && el.matches('p.choice'))) {
        firstChoiceIdxRich = i;
        break;
      }
    }
  }
  const firstChoiceIdxFinal = (firstChoiceIdx >= 0 ? firstChoiceIdx : firstChoiceIdxRich);
  // Převod indexu první volby (počítaného mezi VŠEMI segmenty) na index v lines (kde jsou volby vyfiltrované)
  const firstChoiceIdxForLines = (() => {
    if (firstChoiceIdxFinal < 0) return -1;
    let countNonChoice = 0;
    for (let i = 0; i < segments.length && i < firstChoiceIdxFinal; i++) {
      const s = segments[i];
      const isChoice = /(^|\s)(choice|choice-box)(\s|$)/.test(s.classes || '');
      if (!isChoice) countNonChoice++;
    }
    return countNonChoice;
  })();
  // Tvrdý stop: nepiš nic za indexem první volby (ve smyslu lines bez voleb)
  if (firstChoiceIdxForLines >= 0 && lines.length > firstChoiceIdxForLines) {
    lines = lines.slice(0, firstChoiceIdxForLines);
  }
  try {
    if (firstChoiceIdxFinal === 0 && master) {
      // Pokud master obsahuje před .choice-box ne-choice elementy, je něco špatně se zdrojem fragmentu
      const hasPre = !!master.querySelector(':scope > :not(.choice-box):not(p.choice)');
      if (hasPre) console.warn('🧩 firstChoiceIdx=0, ale #rich-master má obsah před volbami – zkontroluj zdroj segmentů.');
    }
  } catch {}
  // 🎯 Vylepšená kalkulace rychlosti s user preferencemi
  const computeTotalDuration = () => {
    const mw = document.getElementById('manifest-container');
    let baseDuration = 24000; // default fallback
    
    if (mw) {
      const cs = getComputedStyle(mw);
      const durVar = cs.getPropertyValue('--typewriter-duration').trim();
      if (durVar.endsWith('ms')) baseDuration = parseFloat(durVar) * 3.5;
      else if (durVar.endsWith('s')) baseDuration = parseFloat(durVar) * 1000 * 3.5;
    }
    
    // 🚀 Aplikuj speed multiplier z aktuální rychlosti (řízení z ControlPanelu)
    const speedPref = currentSpeed || 'normal';
    const speedMultipliers = {
      'instant': 0.02,
      'fast': 0.2,
      'normal': 1.0,
      'slow': 6.0  // 💀 Slow má být OPRAVDU OPRAVDU pomalý!
    };
    
    return Math.max(500, baseDuration * (speedMultipliers[speedPref as keyof typeof speedMultipliers] || 1.0));
  };
  // Nevyčítat napevno – rychlost může změnit uživatel za běhu
  const getTotalDuration = () => computeTotalDuration();

  const scrollTerminalBottom = () => {
    // Auto-scroll vypnuto ve výchozím stavu. Zapni přes localStorage 'synthoma-autoscroll' = '1' nebo body.dataset.autoscroll = '1'
    try {
      const ls = (typeof localStorage !== 'undefined') ? localStorage.getItem('synthoma-autoscroll') : null;
      const enable = (ls === '1') || (document?.body?.dataset?.autoscroll === '1');
      if (!enable) return;
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
    } catch {}
  };

  // Připrav iterátor bohatého HTML pro okamžité nahrazování řádků po dopsání
  // Používej pouze elementy – textové uzly rozbíjejí mapování segmentů
  const richNodes: Element[] = richHost
    ? (() => {
        const rawChildren = Array.from(richHost.children);
        // Pokud je uvnitř pouze SECTION (story-block), mapuj jeho přímé děti
        let baseNodes: Element[] = rawChildren;
        if (rawChildren.length === 1 && rawChildren[0].tagName.toUpperCase() === 'SECTION') {
          baseNodes = Array.from((rawChildren[0] as HTMLElement).children);
        }
        return baseNodes.filter(el => {
          const hasClassList = !!(el as HTMLElement).classList;
          const isChoiceBox = hasClassList && (el as HTMLElement).classList.contains('choice-box');
          const isPChoice = typeof (el as HTMLElement).matches === 'function' && (el as HTMLElement).matches('p.choice');
          return !(isChoiceBox || isPChoice);
        });
      })()
    : [];
  let richIdx = 0;
  let didPerLineSwap = false;
  let didPreInject = false;
  // Helper: collect text nodes depth-first with their original content
  const collectTextNodes = (root: Node): { node: Text, original: string }[] => {
    const list: { node: Text, original: string }[] = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    let n: Node | null;
    while ((n = walker.nextNode())) {
      const t = n as Text;
      const raw = t.nodeValue || '';
      // Skip pure whitespace text nodes that come from formatting (but keep real spaces)
      if (raw.length === 0) continue;
      list.push({ node: t, original: raw });
    }
    return list;
  };

  // Progressive typing on a rich cloned element: reveal text nodes gradually
  const typeRichProgressive = (
    hostEl: HTMLElement,
    srcNode: Element,
    plainText: string,
    durationMs: number,
    onDone: () => void
  ): (() => void) => {
    // Prepare clone
    const clone = srcNode.cloneNode(true) as HTMLElement;
    // Sjednoť styling: pokud klon nemá žádnou ze známých tříd bloků, přidej .text
    try {
      const cls = (clone.getAttribute('class') || '').trim();
      if (!/(^|\b)(log|dialog|title|text)(\b|$)/.test(cls)) {
        clone.className = (cls ? cls + ' ' : '') + 'text';
      }
    } catch {}
    // Clean existing host content (lineEl just created for this line)
    hostEl.innerHTML = '';
    hostEl.classList.add('typewriter');
    
    // 🎯 Vytvoř .noising-text wrapper pro caret (stejně jako char-by-char)
    const noisingWrapper = document.createElement('span');
    noisingWrapper.className = 'noising-text';
    noisingWrapper.appendChild(clone);
    hostEl.appendChild(noisingWrapper);
    
    // 🚀 Aktualizuj CSS proměnné podle aktuální rychlosti
    const updateCaretSpeed = () => {
      const speedPref = currentSpeed || 'normal';
      const speedMultipliers = {
        'instant': 0.1,
        'fast': 0.6,
        'normal': 1.2,
        'slow': 4.5  // 💀 Caret má blikat ještě pomaleji pro slow mód!
      };
      const caretDuration = speedMultipliers[speedPref as keyof typeof speedMultipliers] || 1.2;
      hostEl.style.setProperty('--caret-duration', `${caretDuration}s`);
      debugLog(`💀 Rich HTML caret speed: ${speedPref} (${caretDuration}s)`);
    };
    updateCaretSpeed();
    
    // 🎯 Aktualizuj typing rychlost podle aktuální rychlosti
    const updateTypingSpeed = () => {
      const speedPref = currentSpeed || 'normal';
      const speedMultipliers = {
        'instant': 0.02,
        'fast': 0.2,
        'normal': 1.0,
        'slow': 6.0
      };
      const newDuration = Math.max(100, durationMs * (speedMultipliers[speedPref as keyof typeof speedMultipliers] || 1.0));
      debugLog(`💀 Rich HTML typing speed: ${speedPref} → ${newDuration}ms (base: ${durationMs}ms)`);
      return newDuration;
    };
    // Initialize effects/choices for the clone
    try { enhanceInlineChoices(clone); } catch {}
    try { setupInteractiveHandlers(); } catch {}
    try {
      const sg = (window as any).startGlitching;
      if (typeof sg === 'function') {
        const recent = clone.querySelectorAll('.glitch-master, .glitching');
        if (recent && recent.length) sg('.glitching');
      }
    } catch {}
    
    // 🎧 Naslouchej změnám rychlosti (stejně jako char-by-char)
    const speedListener = (e: any) => {
      if (e.detail?.speed) {
        updateCaretSpeed();
        // 🔥 Aktualizuj typing rychlost za běhu
        durationMs = updateTypingSpeed();
        debugLog(`💀 Rich HTML reaguje na změnu rychlosti: ${e.detail.speed}`);
      }
    };
    document.addEventListener('synthoma:speed-changed', speedListener);
    
    // 🚀 Inicializuj typing rychlost
    durationMs = updateTypingSpeed();

    // 💀 KOMPLETNĚ NOVÁ LOGIKA: Vytvoř .tw-char elementy jako runTypewriter!
    const allText = clone.textContent || plainText || '';
    const tokens = allText.split('');
    
    if (tokens.length === 0) {
      try { hostEl.classList.remove('typewriter'); } catch {}
      try { document.removeEventListener('synthoma:speed-changed', speedListener); } catch {}
      onDone();
      return () => {};
    }
    
    // Vymaz původní obsah a připrav pro .tw-char elementy
    clone.innerHTML = '';
    
    const GLITCH_CHARS = "!@#$%^&*_-+=?/|<>[]{};:~NYHSMT#¤%&@§÷×¤░▒▓█▄▀●◊O|/_^-~.*+";
    const pending: number[] = [];
    let typingId: number | null = null;
    
    const clearAll = () => {
      if (typingId) { try { clearTimeout(typingId); } catch {} typingId = null; }
      while (pending.length) { const id = pending.pop(); if (typeof id === 'number') try { clearTimeout(id); } catch {} }
    };
    
    const totalMs = Math.max(200, durationMs);
    const perStep = Math.max(8, Math.round(totalMs / Math.max(1, tokens.length)));
    
    debugLog(`💀 Rich HTML char-by-char: ${tokens.length} znaků, ${perStep}ms per step, total: ${totalMs}ms`);
    
    let idx = 0;
    const tick = () => {
      if (stopped || !clone) return;
      const ch = tokens[idx++] || '';
      const node = document.createElement('span');
      node.className = 'tw-char';

      if (ch.trim().length > 0) {
        // 💀 Glitch sekvence (stejně jako runTypewriter)
        const rand0 = GLITCH_CHARS[(Math.random() * GLITCH_CHARS.length) | 0] || ch;
        node.textContent = rand0;
        const frame = Math.max(12, Math.min(40, Math.round(perStep / 3)));
        const steps = Math.max(2, Math.min(4, Math.round(perStep / frame)));
        
        for (let s = 0; s < steps; s++) {
          const id = window.setTimeout(() => {
            if (!node || stopped) return;
            const r = GLITCH_CHARS[(Math.random() * GLITCH_CHARS.length) | 0] || ch;
            node.textContent = r;
          }, s * frame) as unknown as number;
          pending.push(id);
        }
        
        const finalId = window.setTimeout(() => {
          if (!node || stopped) return;
          node.textContent = ch;
          const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          const animationsDisabled = document.body && document.body.classList.contains('no-animations');
          if (!prefersReduced && !animationsDisabled) {
            node.classList.add('noising-char');
            node.classList.add('noising');
            try { 
              node.classList.add('noising-burst'); 
              window.setTimeout(() => { 
                try { node.classList.remove('noising-burst'); } catch {} 
              }, 200); 
            } catch {}
          }
        }, steps * frame) as unknown as number;
        pending.push(finalId);
      } else {
        node.textContent = ch;
      }

      // 🎯 Glitch efekty na znaku (stejně jako runTypewriter)
      if (ch.trim().length > 0) {
        node.classList.add('tw-glitch');
        window.setTimeout(() => { 
          try { node.classList.remove('tw-glitch'); } catch {}
        }, Math.max(60, Math.min(140, Math.round(perStep * 0.8))));
      }
      
      clone.appendChild(node);
      
      // 🎯 Random efekty (stejně jako runTypewriter)
      if (ch.trim().length > 0 && Math.random() < 0.10) {
        node.classList.add('tw-split');
        window.setTimeout(() => { 
          try { node.classList.remove('tw-split'); } catch {}
        }, 100);
      }
      if (Math.random() < 0.06) {
        noisingWrapper.classList.add('tw-blip');
        window.setTimeout(() => { 
          try { noisingWrapper.classList.remove('tw-blip'); } catch {}
        }, 100);
      }

      if (idx < tokens.length) {
        typingId = window.setTimeout(tick, perStep) as unknown as number;
      } else {
        // 🎯 Dokončení (stejně jako runTypewriter)
        try { noisingWrapper.classList.remove('tw-blip'); } catch {}
        clearAll();
        
        try {
          const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          const animationsDisabled = document.body && document.body.classList.contains('no-animations');
          const chars = allText.split('');
          let nodes = Array.from(clone.querySelectorAll('.tw-char')) as HTMLElement[];
          
          for (let i = 0; i < chars.length; i++) {
            const ch = chars[i] || '';
            let el = nodes[i];
            if (!el) { 
              el = document.createElement('span'); 
              el.className = 'tw-char'; 
              clone.appendChild(el); 
            }
            el.textContent = ch;
            el.classList.remove('tw-glitch', 'tw-split', 'flickering');
            if (!prefersReduced && !animationsDisabled && ch.trim().length > 0) {
              el.classList.add('noising-char', 'noising');
            } else {
              el.classList.remove('noising');
              el.classList.add('noising-char');
              if (ch.trim().length > 0) el.classList.add('noising-static');
            }
            if (ch.trim().length > 0) {
              el.classList.add('noising-burst');
              window.setTimeout(() => { 
                try { el.classList.remove('noising-burst'); } catch {} 
              }, 200);
            }
          }
        } catch {}
        
        // 🎯 Spusť shining/noising (stejně jako runTypewriter)
        try {
          const w: any = window as any;
          if (typeof w.startShinning === 'function') w.startShinning();
        } catch {}
        try {
          const w: any = window as any;
          if (typeof w.startNoising === 'function') w.startNoising();
        } catch {}
        
        try { hostEl.classList.remove('typewriter'); } catch {}
        try { document.removeEventListener('synthoma:speed-changed', speedListener); } catch {}
        try { onDone(); } catch {}
        typingId = null;
      }
    };
    
    let stopped = false;
    typingId = window.setTimeout(tick, Math.max(8, Math.round(perStep))) as unknown as number;

    // Provide cancel: stop loop and finalize to current state
    const cancel = () => {
      try { stopped = true; } catch {}
      try { clearAll(); } catch {}
      try { hostEl.classList.remove('typewriter'); } catch {}
      try { document.removeEventListener('synthoma:speed-changed', speedListener); } catch {}
    };
    return cancel;
  };

  const swapLineWithRich = (lineEl: HTMLElement, idxForRich: number) => {
    try {
      const node = richNodes[idxForRich] || null;
      if (!node) return;
      // Použili jsme per-line rich swap → vyhneme se finálnímu hromadnému přepisu
      didPerLineSwap = true;
      // Zachovej host (lineEl) – vyměň jen jeho vnitřek za rich children
      const html = (node as HTMLElement).innerHTML || '';
      lineEl.innerHTML = html;
      // 🚿 Zabraň dvojímu stylování: parent nesmí mít stejné blokové třídy jako vložený klon
      stripBlockClasses(lineEl);
      didPerLineSwap = true;
      // Re-attach choices and effects pro nově injektovaný kus
      try { enhanceInlineChoices(lineEl); } catch {}
      try { setupInteractiveHandlers(); } catch {}
      // 🎬 Postupné zobrazení voleb, pokud jsme právě injektovali choice-box
      try {
        const links = Array.from(lineEl.querySelectorAll('.choice-box .choice-link')) as HTMLElement[];
        if (links.length) {
          links.forEach((a, i) => {
            a.classList.add('choice-appear');
            window.setTimeout(() => {
              try { a.classList.add('visible'); } catch {}
              // po dokončení přechodu odstraň technickou třídu
              window.setTimeout(() => { try { a.classList.remove('choice-appear'); } catch {} }, 380);
            }, i * 800);
          });
        }
      } catch {}
      try {
        const sg = (window as any).startGlitching;
        // Inicializuj glitch pouze pro nové prvky (idempotentně)
        const nodes = lineEl.querySelectorAll('.glitch-master, .glitching');
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
    } catch {}
  };

  const startLine = (idx: number, onAllDone: () => void) => {
    // ⚠️ Speciální případ: volby jsou hned po posledním ne-choice řádku
    // => firstChoiceIdxForLines ukazuje na konec pole `lines`
    if (firstChoiceIdxForLines >= 0 && idx === lines.length && lines.length === firstChoiceIdxForLines) {
      try {
        const target = (container.parentElement && (container.parentElement as HTMLElement).classList.contains('tw-block'))
          ? (container.parentElement as HTMLElement)
          : bodyHost;
        if (richHost) {
          const choiceBox = richHost.querySelector('.choice-box') as HTMLElement | null;
          if (choiceBox) {
            const boxClone = choiceBox.cloneNode(true) as HTMLElement;
            const linksClone = Array.from(boxClone.querySelectorAll('a.choice-link')) as HTMLAnchorElement[];
            const missingNext = linksClone.some(l => !l.getAttribute('data-next'));
            if (missingNext) {
              let nextTarget = choiceBox.nextElementSibling as HTMLElement | null;
              while (nextTarget && (nextTarget.matches('p.choice') || nextTarget.classList.contains('choice-box'))) {
                nextTarget = nextTarget.nextElementSibling as HTMLElement | null;
              }
              if (nextTarget) {
                if (!nextTarget.id) nextTarget.id = `auto-block-${Math.random().toString(36).slice(2,8)}`;
                const nid = `#${nextTarget.id}`;
                linksClone.forEach(a => { if (!a.getAttribute('data-next')) a.setAttribute('data-next', nid); });
              }
            }
            target.appendChild(boxClone);
            try { enhanceInlineChoices(target); } catch {}
            try { setupInteractiveHandlers(); } catch {}
            // postupné odhalení
            try {
              const links = Array.from(boxClone.querySelectorAll('.choice-link')) as HTMLElement[];
              links.forEach((a, i) => {
                a.classList.add('choice-appear');
                window.setTimeout(() => {
                  try { a.classList.add('visible'); } catch {}
                  window.setTimeout(() => { try { a.classList.remove('choice-appear'); } catch {} }, 380);
                }, i * 140);
              });
            } catch {}
            didPreInject = true;
            debugLog('⏸️ Typewriter: volby injektovány po dopsání posledního řádku (.choice-box @ end).');
            try { ds.twBusy = '0'; } catch {}
            return; // nezahajuj další line – jsme hotovi
          }
        }
        // Fallback: p.choice → vyrob box z bodyHost
        try {
          const allChoices = Array.from((richHost || bodyHost).querySelectorAll('p.choice')) as HTMLElement[];
          if (allChoices.length) {
            const first = allChoices[0];
            const group: HTMLElement[] = [first];
            let sib = first.nextElementSibling as HTMLElement | null;
            while (sib && sib.matches('p.choice')) { group.push(sib); sib = sib.nextElementSibling as HTMLElement | null; }
            let nextTarget = group[group.length - 1].nextElementSibling as HTMLElement | null;
            while (nextTarget && nextTarget.matches('p.choice')) { nextTarget = nextTarget.nextElementSibling as HTMLElement | null; }
            let targetId = '';
            if (nextTarget) {
              if (!nextTarget.id) nextTarget.id = `auto-block-${Math.random().toString(36).slice(2,8)}`;
              targetId = nextTarget.id;
            }
            const box = document.createElement('div');
            box.className = 'choice-box';
            for (const p of group) {
              const a = document.createElement('a');
              a.className = 'choice-link';
              a.href = '#';
              try {
                const ds = (p as HTMLElement).dataset as Record<string, string>;
                for (const key in ds) {
                  if (!Object.prototype.hasOwnProperty.call(ds, key)) continue;
                  a.setAttribute(`data-${key}`, ds[key]);
                }
              } catch {}
              if (!a.getAttribute('data-next') && targetId) a.setAttribute('data-next', targetId);
              a.innerHTML = p.innerHTML;
              box.appendChild(a);
            }
            target.appendChild(box);
            try { enhanceInlineChoices(target); } catch {}
            try { setupInteractiveHandlers(); } catch {}
            try {
              const links = Array.from(box.querySelectorAll('.choice-link')) as HTMLElement[];
              links.forEach((a, i) => {
                a.classList.add('choice-appear');
                window.setTimeout(() => {
                  try { a.classList.add('visible'); } catch {}
                  window.setTimeout(() => { try { a.classList.remove('choice-appear'); } catch {} }, 380);
                }, i * 140);
              });
            } catch {}
            didPreInject = true;
            debugLog('⏸️ Typewriter: volby injektovány po dopsání posledního řádku (p.choice @ end).');
            try { ds.twBusy = '0'; } catch {}
            return;
          }
        } catch {}
      } catch {}
    }
    // ⏸️ Když narazíme na první choice/choice-box, zastav psaní a vlož jen volby
    if (firstChoiceIdxForLines >= 0 && lines.length > 0 && idx === firstChoiceIdxForLines && idx < lines.length) {
      try {
        const target = (container.parentElement && (container.parentElement as HTMLElement).classList.contains('tw-block'))
          ? (container.parentElement as HTMLElement)
          : bodyHost;
        if (richHost) {
          // 1) Preferuj již vytvořený .choice-box v hidden zdroji
          const choiceBox = richHost.querySelector('.choice-box') as HTMLElement | null;
          if (choiceBox) {
            try {
              // Přidej klonovaný box a zajisti data-next (bez pre-injectu předchozího obsahu)
              const boxClone = choiceBox.cloneNode(true) as HTMLElement;
              const linksClone = Array.from(boxClone.querySelectorAll('a.choice-link')) as HTMLAnchorElement[];
              const missingNext = linksClone.some(l => !l.getAttribute('data-next'));
              if (missingNext) {
                // Najdi první nenavazující element za původním choiceBoxem v richHostu
                let nextTarget = choiceBox.nextElementSibling as HTMLElement | null;
                while (nextTarget && (nextTarget.matches('p.choice') || nextTarget.classList.contains('choice-box'))) {
                  nextTarget = nextTarget.nextElementSibling as HTMLElement | null;
                }
                if (nextTarget) {
                  if (!nextTarget.id) nextTarget.id = `auto-block-${Math.random().toString(36).slice(2,8)}`;
                  const nid = `#${nextTarget.id}`;
                  linksClone.forEach(a => { if (!a.getAttribute('data-next')) a.setAttribute('data-next', nid); });
                }
              }
              target.appendChild(boxClone);
              try { enhanceInlineChoices(target); } catch {}
              try { setupInteractiveHandlers(); } catch {}
              // 🎬 postupné odhalení klonovaných voleb
              try {
                const links = Array.from(boxClone.querySelectorAll('.choice-link')) as HTMLElement[];
                links.forEach((a, i) => {
                  a.classList.add('choice-appear');
                  window.setTimeout(() => {
                    try { a.classList.add('visible'); } catch {}
                    window.setTimeout(() => { try { a.classList.remove('choice-appear'); } catch {} }, 380);
                  }, i * 140);
                });
              } catch {}
              try {
                const sg = (window as any).startGlitching;
                if (typeof sg === 'function') {
                  const recent = (target as HTMLElement).querySelectorAll('.glitch-master, .glitching');
                  if (recent && recent.length) sg('.glitching');
                }
              } catch {}
            } catch {}
            debugLog('⏸️ Typewriter: zastaveno u voleb (.choice-box). Klikni a svět se ti sám dopíše. 🧪');
            try { ds.twBusy = '0'; } catch {}
            return;
          } else {
            // 2) Fallback: vyrob .choice-box ze skupiny <p class="choice">
            const allChoices = Array.from(richHost.querySelectorAll('p.choice')) as HTMLElement[];
            if (allChoices.length) {
              const first = allChoices[0];
              const group: HTMLElement[] = [first];
              let sib = first.nextElementSibling as HTMLElement | null;
              while (sib && sib.matches('p.choice')) { group.push(sib); sib = sib.nextElementSibling as HTMLElement | null; }
              // Žádný pre-inject – ponecháme už napsaný obsah typewriterem, pouze vložíme box voleb
              let nextTarget = group[group.length - 1].nextElementSibling as HTMLElement | null;
              while (nextTarget && nextTarget.matches('p.choice')) {
                nextTarget = nextTarget.nextElementSibling as HTMLElement | null;
              }
              let targetId = '';
              if (nextTarget) {
                if (!nextTarget.id) nextTarget.id = `auto-block-${Math.random().toString(36).slice(2,8)}`;
                targetId = nextTarget.id;
              }
              const box = document.createElement('div');
              box.className = 'choice-box';
              for (const p of group) {
                const a = document.createElement('a');
                a.className = 'choice-link';
                a.href = '#';
                // Přenes data-* atributy z původního <p class="choice">
                try {
                  const ds = (p as HTMLElement).dataset as Record<string, string>;
                  for (const key in ds) {
                    if (!Object.prototype.hasOwnProperty.call(ds, key)) continue;
                    a.setAttribute(`data-${key}`, ds[key]);
                  }
                } catch {}
                // Pokud původní prvek neměl data-next, nastav fallback na další blok
                if (!a.getAttribute('data-next') && targetId) {
                  a.setAttribute('data-next', targetId);
                }
                a.innerHTML = p.innerHTML;
                box.appendChild(a);
              }
              target.appendChild(box);
              try { enhanceInlineChoices(target); } catch {}
              try { setupInteractiveHandlers(); } catch {}
              // 🎬 postupné odhalení fallback voleb
              try {
                const links = Array.from(box.querySelectorAll('.choice-link')) as HTMLElement[];
                links.forEach((a, i) => {
                  a.classList.add('choice-appear');
                  window.setTimeout(() => {
                    try { a.classList.add('visible'); } catch {}
                    window.setTimeout(() => { try { a.classList.remove('choice-appear'); } catch {} }, 380);
                  }, i * 140);
                });
              } catch {}
              debugLog('⏸️ Typewriter: zastaveno u voleb (p.choice). Klikni a uvidíš, co jsi si nadrobil. 🧪');
              try { ds.twBusy = '0'; } catch {}
              return;
            }
          }
        } else {
          // 🌪️ Poslední jistota: nemáme richHost → postav choice-box přímo z bodyHost
          try {
            const allChoices = Array.from(bodyHost.querySelectorAll('p.choice')) as HTMLElement[];
            if (allChoices.length) {
              const first = allChoices[0];
              const group: HTMLElement[] = [first];
              let sib = first.nextElementSibling as HTMLElement | null;
              while (sib && sib.matches('p.choice')) { group.push(sib); sib = sib.nextElementSibling as HTMLElement | null; }
              let nextTarget = group[group.length - 1].nextElementSibling as HTMLElement | null;
              while (nextTarget && nextTarget.matches('p.choice')) { nextTarget = nextTarget.nextElementSibling as HTMLElement | null; }
              let targetId = '';
              if (nextTarget) {
                if (!nextTarget.id) nextTarget.id = `auto-block-${Math.random().toString(36).slice(2,8)}`;
                targetId = nextTarget.id;
              }
              const box = document.createElement('div');
              box.className = 'choice-box';
              for (const p of group) {
                const a = document.createElement('a');
                a.className = 'choice-link';
                a.href = '#';
                try {
                  const ds = (p as HTMLElement).dataset as Record<string, string>;
                  for (const key in ds) {
                    if (!Object.prototype.hasOwnProperty.call(ds, key)) continue;
                    a.setAttribute(`data-${key}`, ds[key]);
                  }
                } catch {}
                if (!a.getAttribute('data-next') && targetId) a.setAttribute('data-next', targetId);
                a.innerHTML = p.innerHTML;
                box.appendChild(a);
              }
              target.appendChild(box);
              try { enhanceInlineChoices(target as HTMLElement); } catch {}
              try { setupInteractiveHandlers(); } catch {}
              try {
                const links = Array.from(box.querySelectorAll('.choice-link')) as HTMLElement[];
                links.forEach((a, i) => {
                  a.classList.add('choice-appear');
                  window.setTimeout(() => {
                    try { a.classList.add('visible'); } catch {}
                    window.setTimeout(() => { try { a.classList.remove('choice-appear'); } catch {} }, 380);
                  }, i * 140);
                });
              } catch {}
              debugLog('⏸️ Typewriter: fallback volby z bodyHost (p.choice).');
            }
          } catch {}
        }
      } catch {}
      try { ds.twBusy = '0'; } catch {}
      // Nevolej onAllDone – čekáme na klik
      return;
    }
    if (idx >= lines.length) { onAllDone(); return; }
    const text = lines[idx];
    const lineEl = document.createElement('span');
    (lineEl.style as any).whiteSpace = 'pre-wrap';
    // default blokově, ale pokud segment říká inline, tak inline
    const seg = segments[idx];
    const isInline = !!(seg && seg.inline);
    (lineEl.style as any).display = isInline ? 'inline' : 'block';
    // Rozhodni předem, zda existuje rich zdroj pro tento řádek
    const srcNode = richNodes[idx] as Element | undefined;

    // Přenes třídy/styly z původního segmentu jen pokud NEbudeme používat rich zdroj (fallback)
    const willUseRich = !!srcNode;
    if (!willUseRich && seg) {
      if (seg.classes) lineEl.className = seg.classes + ' tw-line';
      if (seg.style) {
        try {
          // sloučit bez zničení již nastaveného display/whiteSpace
          (lineEl as HTMLElement).style.cssText += ';' + seg.style;
          // a jistota, že klíčové vlastnosti zůstanou
          (lineEl.style as any).whiteSpace = 'pre-wrap';
          (lineEl.style as any).display = isInline ? 'inline' : 'block';
        } catch {}
      }
    } else {
      // Parent ponech jen jako technický držák řádku
      lineEl.classList.add('tw-line');
      stripBlockClasses(lineEl);
    }
    // Pokud je blokový a nemá žádnou z klíčových tříd a zároveň nepoužijeme rich, přidej .text
    if (!willUseRich && !isInline) {
      const cls = lineEl.className || '';
      if (!/(^|\b)(log|dialog|title|text)(\b|$)/.test(cls)) {
        lineEl.className = (cls ? cls + ' ' : '') + 'text tw-line';
      }
    }
    
    // 🎯 Zjisti speed preference (sync s ControlPanelem)
    const speedPref = currentSpeed || 'normal';
    
    // Přidej speed class pro instant mód
    if (speedPref === 'instant') {
      lineEl.classList.add('typewriter-instant');
    }
    container!.appendChild(lineEl);
    scrollTerminalBottom();
    const share = lengths[idx] / totalChars;
    let dur = Math.max(250, Math.round(getTotalDuration() * share));
    const perChar = Math.min(5000, Math.max(250, (text.length || 1) * 22));
    dur = Math.min(dur, perChar);
    
    // 💀 Adaptivní rychlost podle typu obsahu
    if (seg?.classes) {
      if (seg.classes.includes('log')) dur *= 0.7; // logy rychleji
      if (seg.classes.includes('dialog')) dur *= 1.2; // dialogy pomaleji pro dramatičnost
      if (seg.classes.includes('title')) dur *= 1.5; // titulky s důrazem
    }
    if (!text || text.trim() === '') {
      window.setTimeout(() => startLine(idx + 1, onAllDone), 10);
      return;
    }
    
    // 🚀 Instant mód: přeskoč typing a zobraz rovnou
    if (speedPref === 'instant') {
      const srcNode = richNodes[idx] as Element | undefined;
      if (srcNode) {
        try {
          const clone = (srcNode as Element).cloneNode(true) as HTMLElement;
          // Sjednoť styling i v instant režimu, pokud chybí známé blokové třídy
          try {
            const cls = (clone.getAttribute('class') || '').trim();
            if (!/(^|\b)(log|dialog|title|text)(\b|$)/.test(cls)) {
              clone.className = (cls ? cls + ' ' : '') + 'text';
            }
          } catch {}
          lineEl.innerHTML = '';
          // 🚿 Zabraň dvojímu stylování z parentu
          stripBlockClasses(lineEl);
          // Instant: vlož přímo bohatý DOM bez caret animace
          lineEl.appendChild(clone);
          try { enhanceInlineChoices(lineEl); } catch {}
          try { setupInteractiveHandlers(); } catch {}
          try {
            const sg = (window as any).startGlitching;
            if (typeof sg === 'function') {
              const recent = lineEl.querySelectorAll('.glitch-master, .glitching');
              if (recent && recent.length) sg('.glitching');
            }
          } catch {}
        } catch {}
      } else {
        // Fallback: bez zdroje napiš plain a nech následný swap (bezpečnost)
        const plain = document.createElement('span');
        plain.className = 'noising-text';
        plain.textContent = text;
        lineEl.appendChild(plain);
        swapLineWithRich(lineEl, idx);
      }
      window.setTimeout(() => startLine(idx + 1, onAllDone), 10);
      return;
    }

    // 🎯 Progressive typing: použij rich element pokud existuje, jinak fallback na plain text
    const srcNode2 = richNodes[idx] as Element | undefined;
    if (srcNode2) {
      // Rich-progressive typing: odhaluj text přímo ve vnořených text nodech bohatého klonu
      debugLog(`🎯 Rich progressive typing pro řádek ${idx} (${text.slice(0, 30)}...)`);
      // 🚿 Pro jistotu odeber blokové třídy z parentu
      stripBlockClasses(lineEl);
      // signalizuj, že probíhá per-line render bohatého obsahu → přeskočíme závěrečný batch replace
      didPerLineSwap = true;
      const cancel = typeRichProgressive(lineEl, srcNode2, text, dur, () => {
        scrollTerminalBottom();
        // Není potřeba swap – lineEl už obsahuje finální rich DOM
        startLine(idx + 1, onAllDone);
      });
    } else {
      // 💀 Fallback: char-by-char typing s .noising-text (stejně jako runTypewriter)
      debugLog(`💀 Rich HTML fallback: char-by-char pro řádek ${idx} (${text.slice(0, 50)}...)`);
      const noisingSpan = document.createElement('span');
      noisingSpan.className = 'noising-text';
      lineEl.appendChild(noisingSpan);
      
      // 🎯 Přidej typewriter třídu pro CSS caret
      lineEl.classList.add('typewriter');
      
      // Použij runTypewriter logiku pro tento řádek s glitch efekty
      const cancel = runTypewriter({
        text: text,
        host: lineEl,
        getDurationMs: () => {
          // 🔥 Respektuj speed multiplier i pro fallback
          const speedPref = currentSpeed || 'normal';
          const speedMultipliers = {
            'instant': 0.05,
            'fast': 0.3,
            'normal': 1.0,
            'slow': 4.0
          };
          const baseDur = Math.max(500, dur);
          const finalDur = baseDur * (speedMultipliers[speedPref as keyof typeof speedMultipliers] || 1.0);
          debugLog(`💀 Fallback speed: ${speedPref} → ${finalDur}ms (base: ${baseDur}ms)`);
          return finalDur;
        },
        onStart: () => {
          debugLog(`💀 Fallback typing start: ${text.slice(0, 30)}...`);
        },
        onDone: () => {
          debugLog(`💀 Fallback typing done: ${text.slice(0, 30)}...`);
          try { lineEl.classList.remove('typewriter'); } catch {}
          scrollTerminalBottom();
          swapLineWithRich(lineEl, idx);
          startLine(idx + 1, onAllDone);
        }
      });
    }
    // void cancel; // už není potřeba
  };

  // 🎮 Auto-setup controls při prvním spuštění
  // Auto-setup plovoucích ovladačů odstraněn – používáme pouze ovládací panel.
  
  debugLog('typewriter: external start', { lines: lines.length, speed: (typeof currentSpeed !== 'undefined' ? currentSpeed : (localStorage.getItem('typewriterSpeed') || 'normal')) });
  startLine(0, () => {
    debugLog('typewriter: external done');
    try { ds.twBusy = '0'; } catch {}
    // Po dopsání nahraď skeleton za skutečné bohaté HTML
    try {
      // Pokud jsme už průběžně nahrazovali (nebo pre-injectli před volbami),
      // finální dávkové nahrazení přeskoč, jinak hrozí duplicity.
      if (didPerLineSwap || didPreInject) return;
      const rich = bodyHost.querySelector('.rich-hidden') as HTMLElement | null;
      if (rich) {
        const sg = (window as any).startGlitching;
        const tmp = document.createElement('div');
        tmp.innerHTML = rich.innerHTML;
        const batchSize = 20;
        const nodes: ChildNode[] = Array.from(tmp.childNodes);
        const frag = document.createDocumentFragment();

        const flushFrag = (target: HTMLElement) => {
          target.appendChild(frag);
          try {
            if (typeof sg === 'function') {
              const recent = target.querySelectorAll('.glitch-master, .glitching');
              if (recent && recent.length) sg('.glitching');
            }
          } catch {}
        };

        const processBatchInto = (target: HTMLElement) => {
          let count = 0;
          while (nodes.length && count < batchSize) {
            const n = nodes.shift()!;
            frag.appendChild(n);
            count++;
          }
          flushFrag(target);
          if (nodes.length) {
            if ('requestIdleCallback' in window) {
              (window as any).requestIdleCallback(() => processBatchInto(target), { timeout: 32 });
            } else {
              setTimeout(() => processBatchInto(target), 16);
            }
          }
        };

        if (appendMode) {
          // V append módu pracuj pouze v rámci lokálního wrapperu .tw-block
          const wrapper = container.parentElement && (container.parentElement as HTMLElement).classList.contains('tw-block')
            ? (container.parentElement as HTMLElement)
            : null;
          const target = wrapper || bodyHost;
          try { container.remove(); } catch {}
          processBatchInto(target);
          try { enhanceInlineChoices(target as HTMLElement); } catch {}
          try { setupInteractiveHandlers(); } catch {}
        } else {
          // V normálním módu nahraď celý host
          try { bodyHost.replaceChildren(); } catch { bodyHost.innerHTML = ''; }
          processBatchInto(bodyHost);
          try { enhanceInlineChoices(bodyHost as HTMLElement); } catch {}
          try { setupInteractiveHandlers(); } catch {}
        }
      }
    } catch {}
  });
}

export async function typeExternalInfo(): Promise<void> {
  const BP = (process as any).env?.NEXT_PUBLIC_BASE_PATH || '';
  const url = `${BP}/data/SYNTHOMAINFO.html`;
  const res = await fetch(url, { cache: 'no-store' });
  const html = await res.text();
  const baseUrl = `${BP}/data/`;
  const bodyHtml = installChapterAssetsAndGetBody(html, baseUrl, 'info');
  // Zrcadla pro interaktivní navigaci (stejně jako v startInteractiveStory)
  try {
    const root = document.querySelector('#reader-content') as HTMLElement | null;
    if (root) {
      const cache = ensureStoryCache(root);
      cache.innerHTML = bodyHtml || '';
      let master = root.querySelector('#rich-master') as HTMLElement | null;
      if (!master) {
        master = document.createElement('div');
        master.id = 'rich-master';
        master.className = 'rich-hidden';
        (master.style as any).display = 'none';
        root.appendChild(master);
      }
      master.innerHTML = bodyHtml || '';
      try { enhanceInlineChoices(master); } catch {}
    }
  } catch {}
  // INFO musí jít pod tlačítka stejně jako obsah kapitoly
  await startBodyTypingFromHtml(bodyHtml, '#reader-extra');
}

function setupBooksHandlers() {
  // UI knih/kapitol bylo odstraněno. Tato funkce je záměrně prázdná.
  return;
}

function ensureStoryCache(root: HTMLElement): HTMLElement {
  let cache = root.querySelector('#story-cache') as HTMLElement | null;
  if (!cache) {
    cache = document.createElement('div');
    cache.id = 'story-cache';
    (cache.style as any).display = 'none';
    root.appendChild(cache);
  }
  return cache;
}

function setupInteractiveHandlers(): void {
  const container = document.querySelector('#reader-content') as HTMLElement | null;
  if (!container) return;
  const d = (container as any).dataset as Record<string, string|undefined>;
  if ((d as any).interactiveHandlers) return;
  (d as any).interactiveHandlers = '1';
  // Prefetch assetů pro další blok (obrázky/videa), ať to působí věštecky rychle
  function prefetchNextBlockAssets(nextId: string) {
    requestIdle(() => {
      try {
        const root = document.querySelector('#reader-content') as HTMLElement | null;
        if (!root) return;
        const cache = root.querySelector('#story-cache') as HTMLElement | null;
        if (!cache) return;
        const next = cache.querySelector(`section.story-block#${CSS.escape(nextId)}`) as HTMLElement | null;
        if (!next) return;
        const assets = [
          ...Array.from(next.querySelectorAll('img[src]')) as HTMLImageElement[],
          ...Array.from(next.querySelectorAll('video[src], audio[src], source[src], track[src]')) as HTMLMediaElement[],
        ];
        const head = document.head || document.getElementsByTagName('head')[0];
        for (const el of assets) {
          const url = el.getAttribute('src') || '';
          if (!url) continue;
          if (!head.querySelector(`link[rel="prefetch"][href="${url}"]`)){
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = url;
            // @ts-ignore
            link.as = 'fetch';
            link.crossOrigin = 'anonymous';
            head.appendChild(link);
          }
        }
        debugLog('🔮 Prefetched assets for next block:', nextId, assets.length);
      } catch {}
    });
  }
  container.addEventListener('click', (ev) => {
    const target = ev.target as HTMLElement | null;
    if (!target) return;
    const a = target.closest('a.choice-link') as HTMLAnchorElement | null;
    if (!a) return;
    ev.preventDefault();
    // Pokud je box již zamknut, ignoruj
    const box = a.closest('.choice-box') as HTMLElement | null;
    if (!box) return;
    if (box.getAttribute('data-locked') === '1') return;
    // Zamkni všechny v boxu a vyznač volbu
    try {
      const links = Array.from(box.querySelectorAll('a.choice-link')) as HTMLAnchorElement[];
      links.forEach((el)=>{
        el.setAttribute('aria-disabled','true');
        el.classList.add('disabled');
        el.style.pointerEvents = 'none';
        el.removeAttribute('aria-current');
      });
      a.classList.add('selected');
      a.setAttribute('aria-current','true');
      box.setAttribute('data-locked','1');
    } catch {}
    // Najdi další blok podle data-next
    const rawNext = a.getAttribute('data-next') || '';
    if (!rawNext) { console.warn('🪦 Žádný data-next. Volba vede do prázdna.'); return; }
    const nextId = rawNext.replace(/^#+/, '');
    const w = window as any;
    w.__synthomaStory = w.__synthomaStory || { visited: new Set<string>(), current: '' };
    const visited: Set<string> = w.__synthomaStory.visited;
    // Povolit návrat do již navštívených bloků (backtracking). Stále sleduj historii, ale neblokuj.
    visited.add(nextId);
    // Vytáhni blok z cache a appendně přepiš do #reader-extra přes typewriter
    const root = document.querySelector('#reader-content') as HTMLElement | null;
    if (!root) return;
    const cache = root.querySelector('#story-cache') as HTMLElement | null;
    let html: string | null = null;
    if (cache) {
      const block = cache.querySelector(`section.story-block#${CSS.escape(nextId)}`) as HTMLElement | null;
      if (block) html = block.outerHTML;
    }
    // Fallback: podívej se do živého DOMu (auto-upgrade pro inline <p class="choice">)
    // Pokud nejsme ve story-cache, slož fragment: od nextId až po další skupinu voleb (včetně)
    if (!html) {
      const live = document.getElementById(nextId) as HTMLElement | null;
      // Najdi správný hidden kontejner, který skutečně obsahuje nextId (může být z předchozího fragmentu)
      const richContainers = Array.from(root.querySelectorAll('#rich-master, .rich-hidden')) as HTMLElement[];
      let source: HTMLElement | null = null;
      for (let i = richContainers.length - 1; i >= 0; i--) {
        const cand = richContainers[i].querySelector(`#${CSS.escape(nextId)}`) as HTMLElement | null;
        if (cand) { source = cand as HTMLElement; break; }
      }
      // Poslední možnost – použij live (může vést jen na jeden odstavec)
      if (!source) {
        source = live as HTMLElement | null;
      }
      // Když jsme skončili u live, zkus namapovat do masteru podle tagu a textu
      if (source === live && live) {
        const key = (live.innerText || '').trim().slice(0, 64);
        const tag = live.tagName;
        for (let i = richContainers.length - 1; i >= 0; i--) {
          const items = Array.from(richContainers[i].children) as HTMLElement[];
          const match = items.find(el => el.tagName === tag && (el.innerText || '').trim().startsWith(key));
          if (match) { source = match; break; }
        }
      }
      if (source) {
        // Pokud jsme narazili přímo na <section> (např. ve story-cache), použij jeho obsah přímo
        if ((source.tagName || '').toUpperCase() === 'SECTION') {
          html = source.innerHTML;
        } else {
          const wrapper = document.createElement('div');
          const rootScope = (source.closest('#rich-master') || source.closest('.rich-hidden') || source.parentElement) as Element;
          const appendNode = (el: Element) => wrapper.appendChild(el.cloneNode(true));
          // Vytvoř dopředný průchod DOMem od source napříč sourozenci i rodiči až k rootScope
          let n: Element | null = source;
          const nextForward = (el: Element | null): Element | null => {
            if (!el) return null;
            // přednost má další sourozenec
            let cand = el.nextElementSibling as Element | null;
          // vystoupej k rodiči a hledej další sourozence, ale nepřekroč rootScope
          let p = el.parentElement as Element | null;
          while (p && p !== rootScope) {
            cand = p.nextElementSibling as Element | null;
            if (cand) return cand;
            p = p.parentElement as Element | null;
          }
          // na úrovni rootScope poslední: další sourozenec rootScope nemá smysl – konec
          return null;
        };
        while (n) {
          appendNode(n);
          // Podívej se dopředu, zda další element je začátek choice skupiny
          const peek = nextForward(n);
          if (peek && peek.matches('p.choice')) {
            let c: Element | null = peek;
            while (c && c.matches('p.choice')) {
              appendNode(c);
              c = c.nextElementSibling as Element | null;
            }
            if (c && !c.matches('p.choice')) appendNode(c);
            break;
          }
          n = nextForward(n);
        }
        html = wrapper.innerHTML;
        }
      }
    }
    if (!html) {
      console.warn('🧱 Blok nenalezen (ani v cache, ani v DOM):', nextId);
      // Odemkni box a dovol jinou volbu, když cíl neexistuje
      try {
        const bx = a.closest('.choice-box') as HTMLElement | null;
        if (bx) {
          bx.removeAttribute('data-locked');
          const links = Array.from(bx.querySelectorAll('a.choice-link')) as HTMLAnchorElement[];
          links.forEach((el)=>{
            el.removeAttribute('aria-disabled');
            el.classList.remove('disabled');
            el.style.pointerEvents = '';
          });
        }
      } catch {}
      return;
    }
    // Předběžně prefetchnout assety pro navazující blok, ať další přechod neškube
    try { prefetchNextBlockAssets(nextId); } catch {}
    startBodyTypingFromHtml(html, '#reader-extra').catch(()=>{});
  }, true);
}

async function startInteractiveStory(book: string, file: string, bodyHtml: string): Promise<void> {
  const root = document.querySelector('#reader-content') as HTMLElement | null;
  if (!root) return;
  const cache = ensureStoryCache(root);
  cache.innerHTML = bodyHtml || '';
  // Vytvoř trvalé zrcadlo celé kapitoly pro lookup po volbách
  try {
    let master = root.querySelector('#rich-master') as HTMLElement | null;
    if (!master) {
      master = document.createElement('div');
      master.id = 'rich-master';
      master.className = 'rich-hidden';
      (master.style as any).display = 'none';
      root.appendChild(master);
    }
    master.innerHTML = bodyHtml || '';
    try { enhanceInlineChoices(master); } catch {}
  } catch {}
  const first = cache.querySelector('section.story-block#b1') as HTMLElement | null
    || cache.querySelector('section.story-block') as HTMLElement | null;
  if (!first) {
    console.warn('🪦 Nebyly nalezeny žádné story-block sekce, padám zpět na normální režim.');
    await startBodyTypingFromHtml(bodyHtml, '#reader-extra');
    return;
  }
  try {
    const w = window as any;
    w.__synthomaStory = { visited: new Set<string>(), current: first.id || 'b1', book, file };
    if (first.id) w.__synthomaStory.visited.add(first.id);
  } catch {}
  setupInteractiveHandlers();
  await startBodyTypingFromHtml(first.outerHTML, '#reader-extra');
}

async function loadChapter(book: string, file: string): Promise<void> {
  const url = `/books/${encodeURIComponent(book)}/${encodeURIComponent(file)}`;
  const baseUrl = `/books/${encodeURIComponent(book)}/`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();

  // Nainstaluj CSS/font assety z kapitoly do <head> a vrať čisté body HTML
  const key = `chapter:${book}/${file}`;
  const bodyHtml = installChapterAssetsAndGetBody(html, baseUrl, key);
  // Detekce interaktivního příběhu pomocí section.story-block
  if (/<section[^>]*class=["'][^"']*\bstory-block\b/i.test(bodyHtml)) {
    debugLog('🎮 Interaktivní kapitola detekována – spouštím story flow');
    await startInteractiveStory(book, file, bodyHtml);
  } else {
    await startBodyTypingFromHtml(bodyHtml, '#reader-extra');
  }
}

export async function typeBooksList(_book?: string): Promise<void> {
  // Nové chování: žádná knihovna, žádný výběr. Prostě čti.
  const DEFAULT_BOOK = 'SYNTHOMA-NULL';
  const DEFAULT_FILE = '0-∞ [RESTART].html';
  try {
    // vyčisti případné zbytky seznamů
    const extra = document.querySelector('#reader-extra') as HTMLElement | null;
    if (extra) extra.innerHTML = '';
  } catch {}
  await loadChapter(DEFAULT_BOOK, DEFAULT_FILE);
}

/**
 * Runs the char-by-char typewriter with glitchy searcher and integrates with shining/noising helpers on window.
 * Mirrors the previous implementation from page.tsx but packaged for reuse.
 */
export function runTypewriter(opts: TypewriterOptions): CancelFn {
  const { text, host, getDurationMs, onStart, onDone } = opts;
  const prefersReduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const animationsDisabled = typeof document !== 'undefined' && document.body?.classList.contains('no-animations');
  const span = host.querySelector('.noising-text') as HTMLElement | null;
  if (!span) return () => { /* noop */ return; };

  const pending: number[] = [];
  let typingId: number | null = null;

  const clearAll = () => {
    if (typingId) { try { clearTimeout(typingId); } catch {} typingId = null; }
    while (pending.length) { const id = pending.pop(); if (typeof id === 'number') try { clearTimeout(id); } catch {} }
  };

  // If animations are off, render immediately
  if (prefersReduced || animationsDisabled) {
    if (onStart) try { onStart(); } catch {}
    span.textContent = '';
    const chars = text.split('');
    for (const ch of chars) {
      const el = document.createElement('span');
      el.className = 'tw-char noising-char';
      el.textContent = ch;
      if (ch.trim().length > 0) el.classList.add('noising-static');
      span.appendChild(el);
    }
    if (onDone) try { onDone(); } catch {}
    return clearAll;
  }

  // Normal animated flow
  if (onStart) try { onStart(); } catch {}
  span.textContent = '';
  const tokens = text.split('');
  // start shining engine so it can adopt settled chars
  try {
    const w: any = window as any;
    if (typeof w.startShinning === 'function') w.startShinning();
  } catch {}

  let totalMs = 7200;
  try {
    if (getDurationMs) totalMs = Math.max(100, getDurationMs());
  } catch {}
  const perStep = Math.max(12, Math.round(totalMs / Math.max(1, tokens.length)));
  const GLITCH_CHARS = "!@#$%^&*_-+=?/|<>[]{};:~NYHSMT#¤%&@§÷×¤░▒▓█▄▀●◊O|/_^-~.*+";

  let idx = 0;
  const tick = () => {
    if (!span) return;
    const ch = tokens[idx++] || '';
    const node = document.createElement('span');
    node.className = 'tw-char';

    if (ch.trim().length > 0) {
      const rand0 = GLITCH_CHARS[(Math.random() * GLITCH_CHARS.length) | 0] || ch;
      node.textContent = rand0;
      const frame = Math.max(18, Math.min(48, Math.round(perStep / 3)));
      const steps = Math.max(2, Math.min(5, Math.round(perStep / frame)));
      for (let s = 0; s < steps; s++) {
        const id = window.setTimeout(() => {
          if (!node) return;
          const r = GLITCH_CHARS[(Math.random() * GLITCH_CHARS.length) | 0] || ch;
          node.textContent = r;
        }, s * frame) as unknown as number;
        pending.push(id);
      }
      const finalId = window.setTimeout(() => {
        if (!node) return;
        node.textContent = ch;
        const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const animationsDisabled = document.body && document.body.classList.contains('no-animations');
        if (!prefersReduced && !animationsDisabled) {
          node.classList.add('noising-char');
          node.classList.add('noising');
          try { node.classList.add('noising-burst'); window.setTimeout(() => { try { node.classList.remove('noising-burst'); } catch {} }, 200); } catch {}
        }
      }, steps * frame) as unknown as number;
      pending.push(finalId);
    } else {
      node.textContent = ch;
    }

    if (ch.trim().length > 0) {
      node.classList.add('tw-glitch');
      window.setTimeout(() => { node.classList.remove('tw-glitch'); }, Math.max(80, Math.min(180, Math.round(perStep*0.9))));
    }
    span.appendChild(node);
    if (ch.trim().length > 0 && Math.random() < 0.10) {
      node.classList.add('tw-split');
      window.setTimeout(() => { node.classList.remove('tw-split'); }, 120);
    }
    if (Math.random() < 0.06) {
      span.classList.add('tw-blip');
      window.setTimeout(() => { span.classList.remove('tw-blip'); }, 120);
    }

    if (idx < tokens.length) {
      typingId = window.setTimeout(tick, perStep) as unknown as number;
    } else {
      try { span.classList.remove('tw-blip'); } catch {}
      while (pending.length) { const id = pending.pop(); if (typeof id === 'number') try { clearTimeout(id); } catch {} }
      try {
        const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const animationsDisabled = document.body && document.body.classList.contains('no-animations');
        const chars = text.split('');
        let nodes = Array.from(span.querySelectorAll('.tw-char')) as HTMLElement[];
        for (let i=0;i<chars.length;i++){
          const ch = chars[i] || '';
          let el = nodes[i];
          if (!el){ el = document.createElement('span'); el.className = 'tw-char'; span.appendChild(el); }
          el.textContent = ch;
          el.classList.remove('tw-glitch','tw-split','flickering');
          if (!prefersReduced && !animationsDisabled && ch.trim().length>0) {
            el.classList.add('noising-char','noising');
          } else {
            el.classList.remove('noising');
            el.classList.add('noising-char');
            if (ch.trim().length > 0) el.classList.add('noising-static');
          }
          if (ch.trim().length > 0) {
            el.classList.add('noising-burst');
            window.setTimeout(() => { try { el.classList.remove('noising-burst'); } catch {} }, 200);
          }
        }
        nodes = Array.from(span.querySelectorAll('.tw-char')) as HTMLElement[];
        for (let j=nodes.length-1; j>=chars.length; j--){ nodes[j].remove(); }
      } catch {}
      try {
        const w: any = window as any;
        if (typeof w.startShinning === 'function') w.startShinning();
      } catch {}
      try {
        const w: any = window as any;
        if (typeof w.startNoising === 'function') w.startNoising();
      } catch {}
      if (onDone) try { onDone(); } catch {}
      typingId = null;
    }
  };

  typingId = window.setTimeout(tick, Math.max(10, Math.round(perStep))) as unknown as number;
  return clearAll;
}
