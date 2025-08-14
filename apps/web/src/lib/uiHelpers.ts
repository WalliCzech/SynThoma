/* UI Helpers as ESM module. Exposes initUiHelpers to attach helpers and start observers. */
export type ToastType = 'info' | 'success' | 'error' | 'warn';

export function initUiHelpers(options?: { attachToWindow?: boolean }) {
  const attach = options?.attachToWindow !== false;
  const w = window as any;
  const d = document;

  // prefers-reduced-motion
  let reduced = false;
  try { reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch {}

  // ---------- TOAST ----------
  let toaster: HTMLElement | null = null;
  function ensureToaster(){ if (!toaster) toaster = d.getElementById('toaster'); return toaster; }
  function toast(msg: string, type: ToastType = 'info'){
    const host = ensureToaster(); if (!host) return;
    const el = d.createElement('div');
    el.className = `toast ${type}`;
    el.setAttribute('role','status'); el.setAttribute('aria-live','polite');
    el.textContent = msg || '';
    host.appendChild(el);
    setTimeout(()=>{ el.classList.add('show'); }, 10);
    setTimeout(()=>{ el.classList.remove('show'); el.remove(); }, 2400);
  }

  // ---------- MODAL CONFIRM (a11y) ----------
  let modal: HTMLElement | null = null; let lastFocus: Element | null = null;
  function ensureModal(){ if (!modal) modal = d.getElementById('modal-run'); return modal; }
  function openModal(){
    const m = ensureModal(); if (!m) return;
    lastFocus = (d.activeElement as Element) || null;
    m.removeAttribute('hidden'); m.setAttribute('aria-hidden','false');
    const btn = m.querySelector('[data-action="confirm"]') as HTMLButtonElement | null;
    if (btn) btn.focus();
  }
  function closeModal(){ const m = ensureModal(); if (!m) return; m.setAttribute('hidden',''); m.setAttribute('aria-hidden','true'); (lastFocus as any)?.focus?.(); }
  function confirmRisk(): Promise<boolean> { return new Promise((resolve)=>{
    const m = ensureModal(); if (!m) return resolve(false);
    openModal();
    function onKey(e: KeyboardEvent){ if (e.key==='Escape'){ cleanup(); resolve(false);} }
    function onClick(e: MouseEvent){ const t = e.target as Element; if (!t) return; const act = t.getAttribute('data-action'); if (act==='confirm'){ cleanup(); resolve(true);} if (act==='cancel'){ cleanup(); resolve(false);} }
    function cleanup(){ d.removeEventListener('keydown', onKey); m!.removeEventListener('click', onClick); closeModal(); }
    d.addEventListener('keydown', onKey); m!.addEventListener('click', onClick);
  }); }

  // ---------- POPOVER ----------
  function togglePopover(anchorId: string, html?: string){
    const a = d.getElementById(anchorId); if (!a) return;
    let pop = a.querySelector('.popover');
    if (!pop){ pop = d.createElement('div'); (pop as HTMLElement).className = 'popover'; (pop as HTMLElement).innerHTML = html||''; a.appendChild(pop); }
    else { (pop as HTMLElement).remove(); }
  }

  // ---------- INLINE GLITCHING TEXT (chars mutate/flicker) ----------
  const runningSelectors = new Set<string>();
  function animationsDisabled(){ return !!(d.body && d.body.classList.contains('no-animations')); }
  function prefersReduced(){ try { return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch{ return false; } }
  function randomPrintable(){ return String.fromCharCode(33 + Math.floor(Math.random()*94)); }
  function startGlitching(selector = '.glitching', changeP = 0.05, glitchP = 0.05){
    const elements = d.querySelectorAll(selector);
    if (!elements || !elements.length) return;
    elements.forEach((element)=>{
      if (!(element instanceof Element)) return;
      if ((element as any).dataset.glitchingActive === 'true') return;
      (element as any).dataset.glitchingActive = 'true';
      const originalText = element.textContent || '';
      (element as any).dataset.originalText = originalText;
      let html = '';
      for (const ch of originalText){
        const safe = ch === '<' ? '&lt;' : ch === '>' ? '&gt;' : ch === '&' ? '&amp;' : ch;
        html += '<span class="glitching-char">'+safe+'</span>';
      }
      element.innerHTML = html;
      const chars = element.querySelectorAll('.glitching-char');
      chars.forEach((charEl: any)=>{
        try {
          charEl.style.display = 'inline-block';
          charEl.style.whiteSpace = 'pre';
          charEl.style.width = 'auto';
          charEl.style.minWidth = '0';
          charEl.style.maxWidth = 'none';
          const w = (charEl as HTMLElement).offsetWidth;
          charEl.style.width = w + 'px';
          charEl.style.minWidth = w + 'px';
          charEl.style.maxWidth = w + 'px';
          charEl.style.textAlign = 'center';
          charEl.style.overflow = 'hidden';
        } catch {}
      });
      const id = window.setInterval(()=>{
        if (animationsDisabled() || prefersReduced()) return;
        chars.forEach((charEl: any, idx: number)=>{
          try {
            charEl.classList.remove('glitch-1','glitch-2');
            if (Math.random() < glitchP){ charEl.classList.add(Math.random()>0.5?'glitch-1':'glitch-2'); }
            if (Math.random() < changeP){
              const orig = ((element as any).dataset.originalText || '')[idx] || '';
              const tmp = randomPrintable();
              charEl.textContent = tmp;
              setTimeout((el: any, o: string)=>{ try{ el.textContent = o; } catch {} }, 100 + Math.random()*150, charEl, orig);
            }
          } catch {}
        });
      }, 100);
      (element as any).dataset.changeInterval = String(id);
    });
    try { runningSelectors.add(selector); } catch{}
  }
  function stopGlitching(selector = '.glitching'){
    const elements = d.querySelectorAll(selector);
    elements.forEach((element)=>{
      if (!(element instanceof Element)) return;
      if ((element as any).dataset.glitchingActive !== 'true') return;
      try { if ((element as any).dataset.changeInterval){ clearInterval(Number((element as any).dataset.changeInterval)); } } catch{}
      element.innerHTML = (element as any).dataset.originalText || '';
      delete (element as any).dataset.glitchingActive;
      delete (element as any).dataset.originalText;
      delete (element as any).dataset.changeInterval;
    });
    try { runningSelectors.delete(selector); } catch{}
  }

  // ---------- GLITCH HEADING ATTACHER (for main H1) ----------
  function attachGlitchHeading(root: Element, title: string, opts?: { intervalMs?: number; chance?: number; restoreMin?: number; restoreJitter?: number; chars?: string }){
    try {
      if (!root || !(root instanceof Element)) return () => { /* no-op detach */ };
      let reducedLocal = false; try { reducedLocal = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch {}
      const intervalMs = (opts && opts.intervalMs) || 260;
      const chance = (opts && opts.chance) || 0.08;
      const restoreMin = (opts && opts.restoreMin) || 160;
      const restoreJitter = (opts && opts.restoreJitter) || 140;
      const GLITCH_CHARS = (opts && opts.chars) || "!@#$%^&*_-+=?/\\|<>[]{};:~NYHSMT#¤%&@§÷×¤░▒▓█▄▀●◊O|/\\_^-~.*+";
      function randomGlitchChar(orig: string){ return Math.random() < 0.65 ? orig : GLITCH_CHARS[(Math.random()*GLITCH_CHARS.length)|0] || orig; }

      let id: number | null = null;
      let mo: MutationObserver | null = null;

      function resetSpans(){
        const spans = root.querySelectorAll('.glitch-char');
        spans.forEach((span, i)=>{ (span as HTMLElement).textContent = title[i] || ''; (span as HTMLElement).classList.remove('glitchy'); try { (span as HTMLElement).style.removeProperty('color'); } catch {} });
      }
      function cycle(){
        if (animationsDisabled() || reducedLocal) return;
        const spans = root.querySelectorAll('.glitch-char'); if (!spans.length) return;
        for (let i=0;i<spans.length;i++){
          const span = spans[i] as HTMLElement; const orig = title[i] || '';
          if (Math.random() < chance){
            span.textContent = randomGlitchChar(orig);
            span.classList.add('glitchy');
            window.setTimeout(((s: HTMLElement, o: string)=>()=>{ if (!s) return; s.textContent = o; s.classList.remove('glitchy'); try { s.style.removeProperty('color'); } catch {} })(span, orig), restoreMin + Math.random()*restoreJitter);
          }
        }
      }
      function start(){ if (reducedLocal) return; if (id) return; id = window.setInterval(cycle, intervalMs); }
      function stop(){ if (id){ window.clearInterval(id); id = null; } resetSpans(); }

      if (!animationsDisabled()) start();
      mo = new MutationObserver((muts)=>{
        for (let i=0;i<muts.length;i++){
          if (muts[i].attributeName === 'class'){
            if (d.body.classList.contains('no-animations')) stop(); else start();
            break;
          }
        }
      });
      try { d.body && mo.observe(d.body, { attributes: true }); } catch {}
      return () => { try { mo && mo.disconnect(); } catch {} stop(); };
    } catch { return () => { /* noop */ }; }
  }

  // ---------- NOISE CANVAS (throttled) ----------
  function bootNoiseCanvas(){
    const canvasEl = d.getElementById('noise-canvas') as HTMLCanvasElement | null; if (!canvasEl) return;
    const ctxEl = canvasEl.getContext('2d'); if (!ctxEl) return;
    function resize(){ canvasEl!.width = innerWidth; canvasEl!.height = innerHeight; }
    resize(); window.addEventListener('resize', resize);
    let running = false; let id: number | null = null; let last = 0;
    function loop(ts: number){
      if (!running) return;
      const now = ts || performance.now();
      if (now - last < 1000/6) { id = requestAnimationFrame(loop); return; }
      last = now;
      const w=canvasEl!.width,h=canvasEl!.height; const img = ctxEl!.createImageData(w,h);
      for (let i=0;i<img.data.length;i+=4){ const v=(Math.random()*255)|0; img.data[i]=img.data[i+1]=img.data[i+2]=v; img.data[i+3]=20; }
      ctxEl!.putImageData(img,0,0);
      id = requestAnimationFrame(loop);
    }
    function start(){ if (reduced || d.body.classList.contains('no-animations')) return; if (running) return; running = true; loop(0 as any); }
    function stop(){
      running=false;
      if (id){ cancelAnimationFrame(id); id=null; }
      try { window.removeEventListener('resize', resize); } catch {}
      ctxEl!.clearRect(0,0,canvasEl!.width,canvasEl!.height);
    }
    w.startNoise = start; w.stopNoise = stop;
    if (!d.body.classList.contains('no-animations')) start();
  }

  // ---------- Shinning API: expose stubs if not provided elsewhere ----------
  if (typeof w.startShinning !== 'function') w.startShinning = function(){ /* no-op bootstrap, provided by page */ return; };
  if (typeof w.stopShinning !== 'function') w.stopShinning = function(){ /* noop */ return; };

  // attach to window if requested
  if (attach){
    w.toast = toast;
    w.confirmRisk = confirmRisk;
    w.togglePopover = togglePopover;
    w.startGlitching = startGlitching;
    w.stopGlitching = stopGlitching;
    w.attachGlitchHeading = attachGlitchHeading;
  }

  // auto boot noise canvas
  bootNoiseCanvas();

  return { toast, confirmRisk, togglePopover, startGlitching, stopGlitching, attachGlitchHeading };
}
