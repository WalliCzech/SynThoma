/* Video background rotation + glitch canvas + retro pixelation, as ESM module. */
export function initVideoVisuals(options?: { attachToWindow?: boolean }){
  const attach = options?.attachToWindow !== false;
  const w = window as any;
  const d = document;
  const BP = process.env.NEXT_PUBLIC_BASE_PATH || '';

  // Run-once guard (React Strict Mode volá efekty dvakrát – díky, příteli ironie)
  try {
    if (w.__videoVisualsBooted) {
      console.info('[SYNTHOMA][video] initVideoVisuals už běží – nebudu to spouštět podruhé, přísahám.');
      return w.__videoVisualsAPI || { };
    }
  } catch {}

  function prefersReduced(){ try { return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; } }
  function animationsDisabled(){ const b = d.body; if (b && b.classList.contains('force-shine')) return false; return prefersReduced() || !!(b && (b.classList.contains('no-animations') || b.classList.contains('animations-disabled'))); }

  // ---------- VIDEO ROTATION ----------
  let videoContainer: HTMLElement | null = null;
  let activeVideoIndex = -1;
  let transitionTimeout: number | null = null;
  let ioVideo: IntersectionObserver | null = null;
  let rafScrollId: number | null = null;
  let rotationStarted: boolean = false;
  let bootMo: MutationObserver | null = null;

  // Některé dev servery neumí spolehlivě HEAD; neřešme existenci a prostě zdroj nastavme
  async function exists(url: string): Promise<boolean> {
    try {
      const res = await fetch(url, { method: 'HEAD' });
      if (res.ok) return true;
    } catch {}
    // fallback: budeme předpokládat, že public assets existují
    return true;
  }

  function hasAnySource(v: HTMLVideoElement){
    return Array.from(v.querySelectorAll('source')).length > 0;
  }

  const paths = Array.from({ length: 10 }, (_, i) => {
    const base = `${BP}/video/SYNTHOMA${i + 1}`;
    return { webm: `${base}.webm` } as const;
  });

  function initializeVideos(){
    try { console.info('%c[SYNTHOMA][video] Start init – jdeme vykopat videa z hrobu.', 'color:#0ff'); } catch {}
    videoContainer = d.querySelector('.video-background') as HTMLElement | null;
    if (!videoContainer) return;
    const vids = videoContainer.querySelectorAll('video');
    try { console.info('[SYNTHOMA][video] nalezeno <video> kusů:', vids.length); } catch {}
    for (const [i, vEl] of Array.from(vids).entries()){
      if (i >= paths.length) break;
      const v = vEl as HTMLVideoElement;
      const p = paths[i];
      // Konfigurace
      v.loop = true; v.muted = true; v.playsInline = true; v.preload = 'auto'; v.playbackRate = 0.5;
      // Vyčisti existující sources a nastav obě varianty, ať si prohlížeč vybere co existuje
      try {
        while (v.firstChild) v.removeChild(v.firstChild);
      } catch {}
      (async ()=>{
        // Nastav rovnou webm zdroj; fallback exists() vždy true pro public
        const s = d.createElement('source'); s.src = p.webm; s.type = 'video/webm'; v.appendChild(s);
        try { (v as any).src = p.webm; } catch {}
        try { v.addEventListener('error', ()=>{ console.warn('[SYNTHOMA][video] decode/playback error pro', p.webm, v.error); }, { once: true }); } catch {}
        try {
          const onReady = () => {
            try { console.info('[SYNTHOMA][video] canplay pro slot', i, '=>', p.webm); } catch {}
            // Pokud zatím žádné video není aktivní, aktivuj tohle
            const hasActive = !!videoContainer?.querySelector('video.active');
            if (!hasActive) {
              try { v.classList.add('active'); activeVideoIndex = i; } catch {}
              try { console.info('[SYNTHOMA][video] označeno jako .active slot', i); } catch {}
            }
            try { v.play().catch(()=>{}); } catch {}
          };
          if (v.readyState < 2) { v.addEventListener('canplay', onReady, { once: true }); }
          v.load();
        } catch {}
      })();
    }
    if (vids.length){
      vids.forEach(v => v.classList.remove('active'));
      const max = Math.min(vids.length, paths.length);
      const startIndex = 0; // deterministicky první, ať se neroztočí prázdný slot
      const startVid = vids[startIndex] as HTMLVideoElement | undefined;
      if (startVid){
        startVid.classList.add('active');
        activeVideoIndex = startIndex;
        try { console.info('[SYNTHOMA][video] init aktivoval slot', startIndex); } catch {}
        if (hasAnySource(startVid)) {
          const safePlay = () => { try { startVid.play(); } catch {} };
          if (startVid.readyState < 2) { try { startVid.addEventListener('canplay', safePlay, { once: true }); } catch {} try { startVid.load(); } catch {} }
          else { safePlay(); }
        }
      }
    }
    // Watchdog: pokud do 2s není žádné aktivní video nebo žádný zdroj, zkus to ještě jednou hrubou silou
    setTimeout(()=>{
      try {
        const container = videoContainer || d.querySelector('.video-background');
        if (!container) return;
        const arr = container.querySelectorAll('video');
        const anyActive = container.querySelector('video.active');
        if (!anyActive && arr.length){
          const v0 = arr[0] as HTMLVideoElement;
          v0.classList.add('active'); activeVideoIndex = 0;
          try { v0.load(); v0.play().catch(()=>{}); } catch {}
        }
        const act = container.querySelector('video.active') as HTMLVideoElement | null;
        if (!act || !hasAnySource(act)) {
          console.warn('[SYNTHOMA][video] žádný aktivní zdroj – přidávám source znovu, protože proč ne.');
          const v = (act || arr[0]) as HTMLVideoElement | undefined;
          if (v) {
            try {
              while (v.firstChild) v.removeChild(v.firstChild);
              const s = d.createElement('source'); s.src = `${BP}/video/SYNTHOMA1.webm`; s.type = 'video/webm'; v.appendChild(s);
              v.load(); v.play().catch(()=>{});
            } catch {}
          }
        }
      } catch {}
    }, 2000);
    if ('IntersectionObserver' in window){
      if (ioVideo) ioVideo.disconnect();
      ioVideo = new IntersectionObserver((entries)=>{
        const vis = entries.some(e => e.isIntersecting);
        try { console.info('[SYNTHOMA][video] container visibility:', vis); } catch {}
        if (!vis){ stopVideoRotation(); const vids2 = videoContainer!.querySelectorAll('video'); vids2.forEach((v:any)=>{ try{ v.pause(); }catch{} }); }
        else { if (!animationsDisabled()){ startVideoRotation(); const active = videoContainer!.querySelector('video.active') as HTMLVideoElement | null; if (active){ const safePlay = () => { try{ active.play(); } catch {} }; if (active.readyState < 2) { try { active.addEventListener('canplay', safePlay, { once: true }); } catch {} try { active.load(); } catch {} } else { safePlay(); } } } }
      }, { threshold: 0.05 });
      ioVideo.observe(videoContainer);
    }
  }
  function scheduleNextTransition(){ if (transitionTimeout) window.clearTimeout(transitionTimeout); transitionTimeout = window.setTimeout(transitionToVideo, 15000 + Math.random()*15000); }
  function transitionToVideo(){
    if (!videoContainer) return;
    const vids = videoContainer.querySelectorAll('video');
    if (vids.length < 2) return;
    let nextIndex = activeVideoIndex; const max = vids.length;
    if (max > 1){ while (nextIndex === activeVideoIndex){ nextIndex = Math.floor(Math.random()*max); } }
    const currentVideo = vids[activeVideoIndex] as HTMLVideoElement | undefined;
    const nextVideo = vids[nextIndex] as HTMLVideoElement | undefined;
    if (currentVideo) currentVideo.classList.remove('active');
    if (nextVideo){
      nextVideo.classList.add('active');
      if (!animationsDisabled() && hasAnySource(nextVideo)) {
        const safePlay = () => { try { nextVideo.play(); } catch {} };
        if (nextVideo.readyState < 2) { try { nextVideo.addEventListener('canplay', safePlay, { once: true }); } catch {} try { nextVideo.load(); } catch {} }
        else { safePlay(); }
      }
    }
    activeVideoIndex = nextIndex;
    scheduleNextTransition();
  }
  function startVideoRotation(){
    if (transitionTimeout) { try { console.info('[SYNTHOMA][video] startVideoRotation – už běží, klid.'); } catch {} return; }
    try { console.info('[SYNTHOMA][video] startVideoRotation – kola se točí.'); } catch {}
    rotationStarted = true;
    scheduleNextTransition();
  }
  function stopVideoRotation(){ if (transitionTimeout){ clearTimeout(transitionTimeout); transitionTimeout = null; } }

  // ---------- SCROLL-LINKED CROP (no gaps) ----------
  function clamp(n:number, min:number, max:number){ return Math.max(min, Math.min(max, n)); }
  function easeInOutCubic(t:number){ return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3)/2; }
  function docScrollProgress(){ const sh = d.documentElement.scrollHeight || d.body.scrollHeight || 1; const ih = window.innerHeight || 1; const y = window.scrollY || window.pageYOffset || 0; return clamp(sh <= ih ? 0 : y / (sh - ih), 0, 1); }
  function applyScrollCrop(){
    if (!videoContainer) return;
    // Easing + vnitřní pásmo, aby okraje nezaskakovaly (např. 6% až 94%)
    const raw = docScrollProgress();
    const eased = easeInOutCubic(raw);
    const innerMin = 6, innerMax = 94; // vyhni se tvrdým krajům
    const pct = (innerMin + (innerMax - innerMin) * eased).toFixed(3);
    const vids = videoContainer.querySelectorAll('video');
    vids.forEach((v:any)=>{
      try {
        // Zajisti vyplnění plochy bez mezer
        const el = v as HTMLVideoElement;
        if (el.style.objectFit !== 'cover') el.style.objectFit = 'cover';
        el.style.objectPosition = `0% ${pct}%`; // kotva vlevo nahoře
      } catch {}
    });
  }
  function onScroll(){ if (animationsDisabled()) return; if (rafScrollId) return; rafScrollId = requestAnimationFrame(()=>{ rafScrollId = null; applyScrollCrop(); }); }

  // Vynucení fixního rozložení a ukotvení vlevo nahoře (bez spoléhání jen na CSS)
  function applyFixedLayout(){
    if (!videoContainer) return;
    const s = (videoContainer as HTMLElement).style;
    s.position = 'fixed'; s.top = '0'; s.left = '0'; s.right = '0'; s.bottom = '0';
    s.width = '100vw'; s.height = '100dvh'; s.overflow = 'hidden'; s.pointerEvents = 'none';
    const vids = videoContainer.querySelectorAll('video');
    vids.forEach((v:any)=>{
      const el = v as HTMLVideoElement;
      const vs = el.style;
      vs.position = 'absolute'; vs.top = '0'; vs.left = '0';
      vs.width = '100%'; vs.height = '100%';
      vs.objectFit = 'cover'; vs.objectPosition = 'left top';
      vs.transform = 'none';
    });
  }
  function onResizeApplyFixed(){ try { applyFixedLayout(); } catch {} }

  // ---------- GLITCH CANVAS ----------
  let canvas: HTMLCanvasElement | null = null;
  let ctx: CanvasRenderingContext2D | null = null;
  let W = 0, H = 0; let rafId: number | null = null; let last = 0; let running = false; let ioGlitch: IntersectionObserver | null = null;
  let onVis: (() => void) | null = null;
  function resize(){ if (!canvas) return; W = window.innerWidth; H = window.innerHeight; canvas.width = W; canvas.height = H; }
  function draw(ts?: number){ if (!running) return; const now = ts || performance.now(); if (now - last < 1000/5) { rafId = requestAnimationFrame(draw); return; } last = now; if (!ctx) { rafId = requestAnimationFrame(draw); return; } ctx.clearRect(0,0,W,H); ctx.fillStyle = 'rgba(0,0,0,0.10)'; ctx.fillRect(0,0,W,H); const segments = 8 + ((Math.random()*6)|0); const palette = ['rgba(0,255,249,0.18)','rgba(255,0,200,0.14)','rgba(250,255,0,0.10)','rgba(255,255,255,0.06)']; for (let i=0;i<segments;i++){ const fromLeft = Math.random() < 0.5; let y = (Math.random()*H)|0; const h = 2 + ((Math.random()*5)|0); const len = Math.max(30, Math.min(W*0.55, (W * (0.15 + Math.random()*0.4))|0)); const x = fromLeft ? 0 : Math.max(0, W - len); const jitter = ((Math.random()*6)|0) - 3; y = Math.max(0, Math.min(H-1, y + jitter)); ctx.fillStyle = palette[(Math.random()*palette.length)|0]; ctx.fillRect(x, y, len, h); ctx.save(); ctx.globalCompositeOperation = 'lighter'; const overlayLen = Math.max(10, (len * (0.4 + Math.random()*0.4))|0); const overlayX = fromLeft ? x : (x + (len - overlayLen)); ctx.fillRect(overlayX, y, overlayLen, Math.max(1, h-1)); ctx.restore(); } ctx.fillStyle = 'rgba(0,0,0,0.06)'; for (let sy=0; sy<H; sy+=2) ctx.fillRect(0, sy, W, 1); rafId = requestAnimationFrame(draw); }
  function startGlitch(){ if (!canvas || animationsDisabled()) return; if (running) return; running = true; (canvas as any).style.display='block'; rafId = requestAnimationFrame(draw); }
  function stopGlitch(){ running = false; if (rafId) cancelAnimationFrame(rafId); rafId=null; if (ctx) ctx.clearRect(0,0,W,H); if(canvas) (canvas as any).style.display='none'; }

  function boot(){
    initializeVideos();
    canvas = d.getElementById('glitch-bg') as HTMLCanvasElement | null;
    if (canvas){ ctx = canvas.getContext('2d'); window.addEventListener('resize', resize); resize(); }
    // vynucení fixního layoutu hned po bootu
    try { applyFixedLayout(); } catch {}
    if ('IntersectionObserver' in window && canvas){
      if (ioGlitch) ioGlitch.disconnect();
      ioGlitch = new IntersectionObserver((entries)=>{
        const vis = entries.some(e => e.isIntersecting);
        if (vis && !animationsDisabled() && !d.hidden) startGlitch(); else stopGlitch();
      }, { threshold: 0.01 });
      ioGlitch.observe(canvas);
    }
    if (!animationsDisabled()) { startGlitch(); startVideoRotation(); }
    // Scroll-linked crop init + listeners (bez mezer při žádném scrollu)
    try { applyScrollCrop(); } catch {}
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    window.addEventListener('resize', onResizeApplyFixed, { passive: true } as any);
    onVis = () => {
      if (d.hidden) { stopGlitch(); stopVideoRotation(); }
      else { if (!animationsDisabled()) { startGlitch(); startVideoRotation(); } try { applyFixedLayout(); applyScrollCrop(); } catch {} }
    };
    d.addEventListener('visibilitychange', onVis);
    if (bootMo) { try { bootMo.disconnect(); } catch {} bootMo = null; }
    bootMo = new MutationObserver((muts)=>{ for (const mut of muts){ if (mut.attributeName==='class'){ /* react on class toggles if needed */ break; } } });
    try { bootMo.observe(d.body, { attributes: true }); } catch {}
  }

  function teardown(){
    try { if (transitionTimeout) { clearTimeout(transitionTimeout); transitionTimeout = null; } } catch {}
    try { if (rafScrollId) { cancelAnimationFrame(rafScrollId); rafScrollId = null; } } catch {}
    try { stopVideoRotation(); } catch {}
    try { stopGlitch(); } catch {}
    if (ioVideo) { try { ioVideo.disconnect(); } catch {} ioVideo = null; }
    if (ioGlitch) { try { ioGlitch.disconnect(); } catch {} ioGlitch = null; }
    if (bootMo) { try { bootMo.disconnect(); } catch {} bootMo = null; }
    window.removeEventListener('scroll', onScroll as any);
    window.removeEventListener('resize', onScroll as any);
    window.removeEventListener('resize', onResizeApplyFixed as any);
    window.removeEventListener('resize', resize as any);
    if (onVis) { try { d.removeEventListener('visibilitychange', onVis as any); } catch {} onVis = null; }
    // canvas cleanup
    try { if (ctx && canvas) { ctx.clearRect(0,0,canvas.width, canvas.height); } } catch {}
  }

  // ---------- RETRO PIXELATION ----------
  let rCanvas: HTMLCanvasElement | null = null; let rCtx: CanvasRenderingContext2D | null = null; let rRaf: number | null = null; let rRunning = false; let rIo: IntersectionObserver | null = null; let lastW=0,lastH=0; let oCanvas: HTMLCanvasElement | null = null; let oCtx: CanvasRenderingContext2D | null = null;
  function isRetro(){ try { return (d.body && d.body.getAttribute('data-theme') === 'retro-arcade'); } catch { return false; } }
  function retroPixelateEnabled(){ try { const rs = getComputedStyle(d.documentElement); const v = rs.getPropertyValue('--retro-canvas-pixelate').trim(); if (!v) return false; const n = parseFloat(v); return !!n && !isNaN(n); } catch { return false; } }
  function ensureRetroCanvas(){ const container = d.querySelector('.video-background') as HTMLElement | null; if (!container) return null; let c = d.getElementById('retro-video-canvas') as HTMLCanvasElement | null; if (!c){ c = d.createElement('canvas'); c.id = 'retro-video-canvas'; container.appendChild(c); } rCanvas = c; rCtx = rCanvas.getContext('2d'); if (!oCanvas){ try { oCanvas = d.createElement('canvas'); oCtx = oCanvas.getContext('2d'); } catch {} } return rCanvas; }
  function styleRetroCanvas(){
    if (!rCanvas) return;
    const cs = (rCanvas as HTMLCanvasElement).style as CSSStyleDeclaration;
    cs.position = 'absolute'; cs.inset = '0';
    cs.width = '100%'; cs.height = '100%';
    cs.display = 'block'; cs.pointerEvents = 'none';
    cs.imageRendering = 'pixelated';
    // jemný podklad, ať neprosvítá nic pod tím
    try { (rCtx as any).fillStyle = 'rgba(0,0,0,1)'; } catch {}
  }
  function resizeRetro(){ if (!rCanvas) return; const container = d.querySelector('.video-background') as HTMLElement | null; if (!container) return; const rect = container.getBoundingClientRect(); const w = Math.max(1, rect.width); const h = Math.max(1, rect.height); if (w===lastW && h===lastH) return; lastW=w; lastH=h; rCanvas.width = w; rCanvas.height = h; }
  function currentScale(){ let s = 5; try { const cs = getComputedStyle(d.documentElement).getPropertyValue('--pixelate-scale').trim(); if (cs) s = parseFloat(cs) || s; } catch {} return Math.max(1, s); }
  function targetSize(){ let w = 0, h = 0; try { const rs = getComputedStyle(d.documentElement); const tw = parseInt(rs.getPropertyValue('--pixelate-target-width').trim(), 10); const th = parseInt(rs.getPropertyValue('--pixelate-target-height').trim(), 10); if (tw > 0 && th > 0) { w = tw; h = th; } } catch {} return { w, h }; }
  function drawRetro(){ if (!rCanvas || !rCtx) return; const container = d.querySelector('.video-background') as HTMLElement | null; if (!container) return; const v = container.querySelector('video.active') as HTMLVideoElement | null; if (v && v.videoWidth && v.videoHeight){ try { (rCanvas as any).style.display = 'block'; } catch {} resizeRetro(); const ts = targetSize(); let tw:number, th:number; if (ts.w && ts.h){ tw = ts.w; th = ts.h; } else { const scale = currentScale(); tw = Math.max(1, (rCanvas.width/scale)|0); th = Math.max(1, (rCanvas.height/scale)|0); } try { if (!oCanvas || !oCtx) { oCanvas = d.createElement('canvas'); oCtx = oCanvas.getContext('2d'); } if (!oCanvas || !oCtx) return; oCanvas.width = tw; oCanvas.height = th; const vw = v.videoWidth, vh = v.videoHeight; const cw = tw, ch = th; const s = Math.max(cw / vw, ch / vh); const dw = vw * s; const dh = vh * s; const dx = (cw - dw) / 2; const dy = 0; oCtx.imageSmoothingEnabled = false; oCtx.clearRect(0,0,tw,th); oCtx.drawImage(v, 0, 0, vw, vh, dx, dy, dw, dh); rCtx.imageSmoothingEnabled = false; rCtx.clearRect(0,0,rCanvas.width,rCanvas.height); rCtx.drawImage(oCanvas, 0, 0, tw, th, 0, 0, rCanvas.width, rCanvas.height); } catch {} } else { try { (rCanvas as any).style.display = 'none'; } catch {} }
    rRaf = requestAnimationFrame(drawRetro);
  }
  function startRetro(){
    try { console.info('%c[SYNTHOMA][retro] start – z pikselů bude obraz, snad.', 'color:#f0f'); } catch {}
    if (rRunning || animationsDisabled()) return;
    ensureRetroCanvas(); if (!rCanvas || !rCtx) return; styleRetroCanvas();
    rRunning = true;
    const container = d.querySelector('.video-background') as HTMLElement | null;
    if (container) container.classList.add('retro-canvas-on');
    // Vypni glitch background
    try { if (typeof w.stopGlitchBg === 'function') w.stopGlitchBg(); } catch {}
    // Retro = jen pixel canvas. Zastav rotaci a skryj reálná videa (ponecháme přehrávat pouze aktivní jako zdroj pro pixelaci).
    try { if (typeof w.stopVideoRotation === 'function') w.stopVideoRotation(); } catch {}
    try {
      const vids = d.querySelectorAll<HTMLVideoElement>('.video-background video');
      let active = d.querySelector<HTMLVideoElement>('.video-background video.active');
      if (!active && vids.length) { active = vids[0]; try { active.classList.add('active'); } catch {} }
      vids.forEach(v => {
        if (active && v !== active) { try { v.pause(); } catch {} }
        try { v.style.opacity = '0'; v.style.pointerEvents = 'none'; } catch {}
      });
      if (active) { try { active.play().catch(()=>{}); } catch {} }
    } catch {}
    // Start pozorování pro rCanvas
    if ('IntersectionObserver' in window && rIo){ try{ rIo.disconnect(); }catch{} }
    rIo = new IntersectionObserver((entries)=>{
      const vis = entries.some(e=>e.isIntersecting);
      if (vis && rRunning){ if (!rRaf) rRaf = requestAnimationFrame(drawRetro); }
      else { if (rRaf){ cancelAnimationFrame(rRaf); rRaf=null; } }
    }, { threshold: 0.01 });
    try { rIo.observe(rCanvas); } catch {}
    if (!rRaf) rRaf = requestAnimationFrame(drawRetro);
    window.addEventListener('resize', resizeRetro);
  }
  function stopRetro(){
    rRunning = false;
    const container = d.querySelector('.video-background') as HTMLElement | null;
    if (container) container.classList.remove('retro-canvas-on');
    if (rRaf){ cancelAnimationFrame(rRaf); rRaf=null; }
    if (rIo){ try{ rIo.disconnect(); }catch{} rIo=null; }
    window.removeEventListener('resize', resizeRetro);
    if (rCtx && rCanvas) { try { rCtx.clearRect(0,0,rCanvas.width,rCanvas.height); } catch {} }
    // Zpět zobrazit videa a případně obnovit rotaci (pokud nejsou animace zakázané)
    try {
      const vids = d.querySelectorAll<HTMLVideoElement>('.video-background video');
      vids.forEach(v => { try { v.style.opacity=''; v.style.pointerEvents='none'; } catch {} });
      if (!animationsDisabled()) { try { startVideoRotation(); } catch {} }
    } catch {}
  }
  function updateRetro(){ if (isRetro() && retroPixelateEnabled() && !animationsDisabled()) startRetro(); else stopRetro(); }
  function bootRetro(){ const mo = new MutationObserver((muts)=>{ for (const mut of muts){ if (mut.attributeName === 'data-theme' || mut.attributeName === 'class'){ updateRetro(); break; } } }); try { mo.observe(d.body, { attributes:true }); } catch {} updateRetro(); }

  // attach to window
  if (attach){ w.startGlitchBg = startGlitch; w.stopGlitchBg = stopGlitch; w.startVideoRotation = startVideoRotation; w.stopVideoRotation = stopVideoRotation; w.startRetroPixelation = startRetro; w.stopRetroPixelation = stopRetro; w.teardownVideoVisuals = teardown; }

  // boot
  boot(); bootRetro();
  // ensure teardown on page unload to avoid zombies
  const onPageHide = () => { try { teardown(); } catch {} };
  window.addEventListener('pagehide', onPageHide);
  window.addEventListener('beforeunload', onPageHide);

  // Zapiš flag a API pro případné další volání (které zdvořile odmítneme)
  try { w.__videoVisualsBooted = true; } catch {}
  
  const api = { startGlitch, stopGlitch, startVideoRotation, stopVideoRotation, startRetro: startRetro, stopRetro: stopRetro, teardown };
  try { w.__videoVisualsAPI = api; } catch {}
  return api;
}
