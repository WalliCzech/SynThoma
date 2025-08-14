;(function(){
  'use strict';
  var reduced = false;
  try { reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch(e) {}
  function animationsDisabled(){
    var b = document.body;
    if (b && b.classList.contains('force-shine')) return false; // allow force override
    return reduced || (b && (b.classList.contains('no-animations') || b.classList.contains('animations-disabled')));
  }

  // ---------- VIDEO ROTATION (lazy + IO) ----------
  var videoContainer = null;
  var activeVideoIndex = -1;
  var transitionTimeout = null;
  var ioVideo = null;
  var rafScrollId = null;
  var lastScrollY = -1;
  // Stálé pozadí: parallax vypnut
  var PARALLAX = 0;
  // Repo přešlo na WEBM (SYNTHOMA1..10.webm). Jen WEBM, bez fallbacku na MP4.
  var paths = Array.from({length: 11}, function(_, i){
    var base = '/video/SYNTHOMA' + (i+1);
    return { webm: base + '.webm' };
  });

  function createVideoEl(src){
    var v = document.createElement('video');
    v.src = src; v.loop = true; v.muted = true; v.playsInline = true; v.preload = 'metadata'; v.playbackRate = 0.5;
    // Bez fallbacku – když webm chybí, neřešíme zde.
    return v;
  }

  function initializeVideos(){
    videoContainer = document.querySelector('.video-background');
    if (!videoContainer) return;
    // Použij již předrenderované <video> prvky v layoutu
    var vids = videoContainer.querySelectorAll('video');
    for (var i=0; i<vids.length && i<paths.length; i++){
      var src = paths[i].webm;
      if (vids[i].src !== src) vids[i].src = src;
      vids[i].loop = true; vids[i].muted = true; vids[i].playsInline = true; vids[i].preload = 'metadata'; vids[i].playbackRate = 0.5;
    }
    if (vids.length){
      vids.forEach(function(v){ v.classList.remove('active'); });
      // Náhodný startovní index, ať je jiné video po každém reloadu
      var max = Math.min(vids.length, paths.length);
      var startIndex = Math.floor(Math.random() * max);
      var startVid = vids[startIndex];
      if (startVid) {
        startVid.classList.add('active');
        activeVideoIndex = startIndex;
        if (!animationsDisabled()) startVid.play && startVid.play().catch(function(){})
      }
    }

    // Observe visibility to pause when offscreen
    if ('IntersectionObserver' in window){
      ioVideo && ioVideo.disconnect();
      ioVideo = new IntersectionObserver(function(entries){
        var vis = entries.some(function(e){ return e.isIntersecting; });
        if (!vis){
          stopVideoRotation();
          stopParallax();
          var vids2 = videoContainer.querySelectorAll('video'); vids2.forEach(function(v){ try{ v.pause(); }catch(e){} });
        } else {
          if (!animationsDisabled()) {
            startVideoRotation();
            startParallax();
            var active = videoContainer.querySelector('video.active');
            active && active.play && active.play().catch(function(){})
          }
        }
      }, { threshold: 0.05 });
      ioVideo.observe(videoContainer);
    }
  }

  function scheduleNextTransition(){
    if (transitionTimeout) clearTimeout(transitionTimeout);
    transitionTimeout = setTimeout(transitionToVideo, 15000 + Math.random()*15000);
  }
  function transitionToVideo(){
    if (!videoContainer) return;
    var vids = videoContainer.querySelectorAll('video'); if (vids.length < 2) return;
    // Vyber náhodný další index odlišný od aktuálního
    var max = vids.length; var nextIndex = activeVideoIndex;
    if (max > 1) {
      while (nextIndex === activeVideoIndex) { nextIndex = Math.floor(Math.random() * max); }
    }
    var currentVideo = vids[activeVideoIndex]; var nextVideo = vids[nextIndex];
    if (currentVideo) currentVideo.classList.remove('active');
    if (nextVideo){ nextVideo.classList.add('active'); if (!animationsDisabled()) nextVideo.play().catch(function(){}) }
    activeVideoIndex = nextIndex; scheduleNextTransition();
  }
  function startVideoRotation(){ scheduleNextTransition(); }
  function stopVideoRotation(){ if (transitionTimeout) { clearTimeout(transitionTimeout); transitionTimeout = null; } }
  window.startVideoRotation = startVideoRotation;
  window.stopVideoRotation = stopVideoRotation;

  // ---------- PARALLAX SCROLL (RAF throttled) ----------
  function applyParallax(y){
    if (!videoContainer) return;
    if (PARALLAX === 0) return; // žádný posun, stálé pozadí
    var vids = videoContainer.querySelectorAll('video');
    var offset = y * PARALLAX;
    for (var i=0; i<vids.length; i++) vids[i].style.transform = 'translate3d(0,'+ offset + 'px,0)';
  }
  function tickParallax(){
    rafScrollId = null;
    if (animationsDisabled()) { resetParallax(); return; }
    var y = window.scrollY || window.pageYOffset || 0;
    if (y === lastScrollY) return; // nic se nezměnilo
    lastScrollY = y;
    applyParallax(y);
  }
  function onScroll(){ if (rafScrollId) return; rafScrollId = requestAnimationFrame(tickParallax); }
  function startParallax(){
    // Stálé pozadí: nic nespouštěj
    resetParallax();
  }
  function stopParallax(){
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onScroll);
    if (rafScrollId) { cancelAnimationFrame(rafScrollId); rafScrollId = null; }
  }
  function resetParallax(){
    if (!videoContainer) return;
    var vids = videoContainer.querySelectorAll('video');
    for (var i=0; i<vids.length; i++) vids[i].style.transform = '';
  }

  // ---------- GLITCH CANVAS (throttle + IO) ----------
  var canvas = null, ctx = null, W = 0, H = 0; var rafId = null; var last = 0; var running = false; var ioGlitch = null;
  function resize(){ if (!canvas) return; W = window.innerWidth; H = window.innerHeight; canvas.width = W; canvas.height = H; }
  function draw(ts){
    if (!running) return;
    var now = ts || performance.now();
    // Slower, subtler motion (~5 FPS)
    if (now - last < 1000/5) { rafId = requestAnimationFrame(draw); return; }
    last = now;

    // Clear and apply a faint dark veil
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle = 'rgba(0,0,0,0.10)';
    ctx.fillRect(0,0,W,H);

    // Light error-like glitching: short segments from left/right edges
    var segments = 8 + (Math.random()*6|0); // fewer strokes per frame
    var palette = ['rgba(0,255,249,0.18)','rgba(255,0,200,0.14)','rgba(250,255,0,0.10)','rgba(255,255,255,0.06)'];

    for (var i=0; i<segments; i++){
      var fromLeft = Math.random() < 0.5;
      var y = (Math.random()*H)|0;
      var h = 2 + (Math.random()*5|0); // random thickness
      var len = Math.max(30, Math.min(W*0.55, (W * (0.15 + Math.random()*0.4))|0)); // random length up to ~55% width
      var x = fromLeft ? 0 : Math.max(0, W - len);

      // minor jitter to emulate signal error
      var jitter = ((Math.random()*6)|0) - 3; // -3..+2 px
      y = Math.max(0, Math.min(H-1, y + jitter));

      ctx.fillStyle = palette[(Math.random()*palette.length)|0];
      // base stroke
      ctx.fillRect(x, y, len, h);
      // lighter overlay for a subtle additive edge
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      var overlayLen = Math.max(10, (len * (0.4 + Math.random()*0.4))|0);
      var overlayX = fromLeft ? x : (x + (len - overlayLen));
      ctx.fillRect(overlayX, y, overlayLen, Math.max(1, h-1));
      ctx.restore();
    }

    // Faint scanline texture
    ctx.fillStyle = 'rgba(0,0,0,0.06)';
    for (var sy=0; sy<H; sy+=2) ctx.fillRect(0, sy, W, 1);

    rafId = requestAnimationFrame(draw);
  }
  function startGlitch(){
    if (!canvas || animationsDisabled()) return; if (running) return; running = true; canvas.style.display='block'; rafId = requestAnimationFrame(draw);
  }
  function stopGlitch(){ running = false; if (rafId) cancelAnimationFrame(rafId); rafId=null; if (ctx) ctx.clearRect(0,0,W,H); if(canvas) canvas.style.display='none'; }
  window.startGlitchBg = startGlitch; window.stopGlitchBg = stopGlitch;

  function boot(){
    initializeVideos();
    canvas = document.getElementById('glitch-bg');
    if (canvas){ ctx = canvas.getContext('2d'); window.addEventListener('resize', resize); resize(); }
    if ('IntersectionObserver' in window && canvas){
      ioGlitch && ioGlitch.disconnect();
      ioGlitch = new IntersectionObserver(function(entries){
        var vis = entries.some(function(e){ return e.isIntersecting; });
        if (vis && !animationsDisabled() && !document.hidden) startGlitch(); else stopGlitch();
      }, { threshold: 0.01 });
      ioGlitch.observe(canvas);
    }
    if (!animationsDisabled()) { startGlitch(); startVideoRotation(); /* stálé pozadí: bez parallaxu */ }
    document.addEventListener('visibilitychange', function(){
      if (document.hidden) { stopGlitch(); stopVideoRotation(); /* parallax není aktivní */ }
      else if (!animationsDisabled()) { startGlitch(); startVideoRotation(); /* bez parallaxu */ }
    });

    // Reaguj na toggle animací (pokud UI přepíná .no-animations)
    var mo = new MutationObserver(function(muts){
      for (var i=0;i<muts.length;i++){
        if (muts[i].attributeName === 'class'){
          if (animationsDisabled()) { stopParallax(); resetParallax(); }
          else { startParallax(); }
          break;
        }
      }
    });
    try { mo.observe(document.body, { attributes: true }); } catch(e) {}
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();

;(function(){
  'use strict';
  // Retro Arcade: guarantee pixelation by drawing video into a canvas with smoothing off
  var container = null; var rCanvas = null; var rCtx = null; var rRaf = null; var rRunning = false; var rIo = null; var lastW=0,lastH=0;
  var oCanvas = null; var oCtx = null; // offscreen low-res buffer
  function isRetro(){ try { return (document.body && document.body.getAttribute('data-theme') === 'retro-arcade'); } catch(e){ return false; } }
  function retroPixelateEnabled(){
    try{
      var rs = getComputedStyle(document.documentElement);
      var v = rs.getPropertyValue('--retro-canvas-pixelate').trim();
      if (!v) return false; var n = parseFloat(v);
      return !!n && !isNaN(n);
    }catch(e){ return false; }
  }
  function animationsDisabled(){
    var b = document.body; var reduced=false; try{ reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){}
    if (b && b.classList.contains('force-shine')) return false; return reduced || (b && (b.classList.contains('no-animations') || b.classList.contains('animations-disabled')));
  }
  function ensureCanvas(){
    container = document.querySelector('.video-background'); if (!container) return null;
    var c = document.getElementById('retro-video-canvas');
    if (!c){ c = document.createElement('canvas'); c.id = 'retro-video-canvas'; container.appendChild(c); }
    rCanvas = c; rCtx = rCanvas.getContext('2d');
    if (!oCanvas){ try { oCanvas = document.createElement('canvas'); oCtx = oCanvas.getContext('2d'); } catch(e){} }
    return rCanvas;
  }
  function resize(){
    if (!rCanvas || !container) return;
    // Match the actual video background container, not the window
    var rect = container.getBoundingClientRect();
    var w = Math.max(1, rect.width);
    var h = Math.max(1, rect.height);
    if (w===lastW && h===lastH) return; lastW=w; lastH=h;
    rCanvas.width = w; rCanvas.height = h;
  }
  function currentScale(){
    var s = 5;
    try { var cs = getComputedStyle(document.documentElement).getPropertyValue('--pixelate-scale').trim(); if (cs) s = parseFloat(cs) || s; } catch(e){}
    return Math.max(1, s);
  }
  function targetSize(){
    // Prefer explicit target width/height if provided (e.g., 320x180)
    var w = 0, h = 0;
    try {
      var rs = getComputedStyle(document.documentElement);
      var tw = parseInt(rs.getPropertyValue('--pixelate-target-width').trim(), 10);
      var th = parseInt(rs.getPropertyValue('--pixelate-target-height').trim(), 10);
      if (tw > 0 && th > 0) { w = tw; h = th; }
    } catch(e){}
    return { w:w, h:h };
  }
  function draw(){
    if (!rCanvas || !rCtx || !container || !rRunning) return;
    var v = container.querySelector('video.active');
    if (v && v.videoWidth && v.videoHeight){
      resize();
      var ts = targetSize();
      var tw, th;
      if (ts.w && ts.h) { tw = ts.w; th = ts.h; }
      else {
        var scale = currentScale();
        tw = Math.max(1, (rCanvas.width/scale)|0);
        th = Math.max(1, (rCanvas.height/scale)|0);
      }
      try {
        // 1) Draw into low-res offscreen buffer using exact cover scaling with center-top
        if (!oCanvas || !oCtx) { oCanvas = document.createElement('canvas'); oCtx = oCanvas.getContext('2d'); }
        oCanvas.width = tw; oCanvas.height = th;
        var vw = v.videoWidth, vh = v.videoHeight; var cw = tw, ch = th;
        // Scale so that the video covers the canvas, then align center-top
        var s = Math.max(cw / vw, ch / vh);
        var dw = vw * s; var dh = vh * s;
        var dx = (cw - dw) / 2; // center horizontally
        var dy = 0;             // top align vertically
        oCtx.imageSmoothingEnabled = false;
        oCtx.clearRect(0,0,tw,th);
        oCtx.drawImage(v, 0, 0, vw, vh, dx, dy, dw, dh);

        // 2) Upscale the low-res buffer to full viewport with smoothing disabled
        rCtx.imageSmoothingEnabled = false;
        rCtx.clearRect(0,0,rCanvas.width,rCanvas.height);
        rCtx.drawImage(oCanvas, 0, 0, tw, th, 0, 0, rCanvas.width, rCanvas.height);
      } catch(e){}
    }
    rRaf = requestAnimationFrame(draw);
  }
  function start(){
    if (rRunning || animationsDisabled()) return; ensureCanvas(); if (!rCanvas || !rCtx) return;
    rRunning = true; if (container) container.classList.add('retro-canvas-on');
    // Disable glitch background when retro is active
    try { if (typeof window.stopGlitchBg === 'function') window.stopGlitchBg(); } catch(e){}
    if ('IntersectionObserver' in window && rIo){ try{ rIo.disconnect(); }catch(e){} }
    rIo = new IntersectionObserver(function(entries){ var vis = entries.some(function(e){ return e.isIntersecting; }); if (vis && rRunning){ if (!rRaf) rRaf = requestAnimationFrame(draw); } else { if (rRaf){ cancelAnimationFrame(rRaf); rRaf=null; } } }, { threshold: 0.01 });
    try { rIo.observe(rCanvas); } catch(e) {}
    if (!rRaf) rRaf = requestAnimationFrame(draw);
    window.addEventListener('resize', resize);
  }
  function stop(){
    rRunning = false; if (container) container.classList.remove('retro-canvas-on');
    if (rRaf){ cancelAnimationFrame(rRaf); rRaf=null; }
    if (rIo){ try{ rIo.disconnect(); }catch(e){} rIo=null; }
    window.removeEventListener('resize', resize);
    if (rCtx && rCanvas) { try { rCtx.clearRect(0,0,rCanvas.width,rCanvas.height); } catch(e){} }
  }
  window.startRetroPixelation = start; window.stopRetroPixelation = stop;

  function update(){ if (isRetro() && retroPixelateEnabled() && !animationsDisabled()) start(); else stop(); }
  // react to theme changes and animation toggles
  var mo = new MutationObserver(function(muts){
    for (var i=0;i<muts.length;i++){
      if (muts[i].attributeName === 'data-theme' || muts[i].attributeName === 'class'){ update(); break; }
    }
  });
  function boot(){ try { mo.observe(document.body, { attributes:true }); } catch(e){} update(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
