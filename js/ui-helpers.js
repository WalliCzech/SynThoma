;(function(){
  'use strict';
  var reduced = false;
  try { reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch(e) {}

  // ---------- TOAST ----------
  var toaster = null;
  function ensureToaster(){ if (!toaster) toaster = document.getElementById('toaster'); return toaster; }
  function toast(msg, type){
    var host = ensureToaster(); if (!host) return;
    var el = document.createElement('div');
    el.className = 'toast ' + (type||'info');
    el.setAttribute('role','status'); el.setAttribute('aria-live','polite');
    el.textContent = msg || '';
    host.appendChild(el);
    setTimeout(function(){ el.classList.add('show'); }, 10);
    setTimeout(function(){ el.classList.remove('show'); el.remove(); }, 2400);
  }
  window.toast = toast;

  // ---------- MODAL CONFIRM (a11y) ----------
  var modal = null; var lastFocus = null;
  function ensureModal(){ if (!modal) modal = document.getElementById('modal-run'); return modal; }
  function openModal(){
    var m = ensureModal(); if (!m) return;
    lastFocus = document.activeElement;
    m.removeAttribute('hidden'); m.setAttribute('aria-hidden','false');
    var btn = m.querySelector('[data-action="confirm"]'); btn && btn.focus();
  }
  function closeModal(){ var m = ensureModal(); if (!m) return; m.setAttribute('hidden',''); m.setAttribute('aria-hidden','true'); lastFocus && lastFocus.focus && lastFocus.focus(); }
  function confirmModal(){ return new Promise(function(resolve){
    var m = ensureModal(); if (!m) return resolve(false);
    openModal();
    function onKey(e){ if (e.key==='Escape'){ cleanup(); resolve(false);} }
    function onClick(e){ var t = e.target; if (!(t instanceof Element)) return; if (t.getAttribute('data-action')==='confirm'){ cleanup(); resolve(true);} if (t.getAttribute('data-action')==='cancel'){ cleanup(); resolve(false);} }
    function cleanup(){ document.removeEventListener('keydown', onKey); m.removeEventListener('click', onClick); closeModal(); }
    document.addEventListener('keydown', onKey); m.addEventListener('click', onClick);
  }); }
  window.confirmRisk = confirmModal;

  // ---------- POPOVER ----------
  window.togglePopover = function(anchorId, html){
    var a = document.getElementById(anchorId); if (!a) return;
    var pop = a.querySelector('.popover');
    if (!pop){ pop = document.createElement('div'); pop.className = 'popover'; pop.innerHTML = html||''; a.appendChild(pop); }
    else { pop.remove(); }
  };

  // ---------- INLINE GLITCHING TEXT (chars mutate/flicker) ----------
  (function(){
    var runningSelectors = new Set();
    function animationsDisabled(){ return !!(document.body && document.body.classList.contains('no-animations')); }
    function prefersReduced(){ try { return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch(e){ return false; } }
    function randomPrintable(){ return String.fromCharCode(33 + Math.floor(Math.random()*94)); }

    function applyGlitch(selector, changeP, glitchP){
      if (!selector) selector = '.glitching';
      var changeProbability = typeof changeP === 'number' ? changeP : 0.05;
      var glitchProbability = typeof glitchP === 'number' ? glitchP : 0.05;
      var elements = document.querySelectorAll(selector);
      if (!elements || !elements.length) return;
      elements.forEach(function(element){
        if (!(element instanceof Element)) return;
        if (element.dataset.glitchingActive === 'true') return;
        element.dataset.glitchingActive = 'true';
        var originalText = element.textContent || '';
        element.dataset.originalText = originalText;
        // Wrap into spans
        var html = '';
        for (var i=0;i<originalText.length;i++){
          var ch = originalText[i];
          // vždy wrapni (včetně mezer); white-space: pre zajistí šířku mezery
          var safe = ch === '<' ? '&lt;' : ch === '>' ? '&gt;' : ch === '&' ? '&amp;' : ch;
          html += '<span class="glitching-char">'+safe+'</span>';
        }
        element.innerHTML = html;
        var chars = element.querySelectorAll('.glitching-char');
        // Zamkni šířku každého znaku podle původní šířky, aby se při glitchi neměnila
        chars.forEach(function(charEl){
          try {
            // Připrav pro měření přirozené šířky
            charEl.style.display = 'inline-block';
            charEl.style.whiteSpace = 'pre';
            charEl.style.width = 'auto';
            charEl.style.minWidth = '0';
            charEl.style.maxWidth = 'none';
            // Vypočti přirozenou šířku
            var w = charEl.offsetWidth; // px
            // Zamkni šířku
            charEl.style.width = w + 'px';
            charEl.style.minWidth = w + 'px';
            charEl.style.maxWidth = w + 'px';
            charEl.style.textAlign = 'center';
            charEl.style.overflow = 'hidden';
          } catch(e){}
        });
        var id = setInterval(function(){
          if (animationsDisabled() || prefersReduced()) return; // remain idle but keep interval
          chars.forEach(function(charEl, idx){
            try {
              charEl.classList.remove('glitch-1','glitch-2');
              if (Math.random() < glitchProbability){ charEl.classList.add(Math.random()>0.5?'glitch-1':'glitch-2'); }
              if (Math.random() < changeProbability){
                var orig = (element.dataset.originalText || '')[idx] || '';
                var tmp = randomPrintable();
                charEl.textContent = tmp;
                setTimeout(function(el, o){ return function(){ try{ el.textContent = o; } catch(e){} }; }(charEl, orig), 100 + Math.random()*150);
              }
            } catch(e){}
          });
        }, 100);
        element.dataset.changeInterval = String(id);
      });
      try { runningSelectors.add(selector); } catch(e){}
    }

    function removeGlitch(selector){
      if (!selector) selector = '.glitching';
      var elements = document.querySelectorAll(selector);
      elements.forEach(function(element){
        if (!(element instanceof Element)) return;
        if (element.dataset.glitchingActive !== 'true') return;
        try { if (element.dataset.changeInterval){ clearInterval(Number(element.dataset.changeInterval)); } } catch(e){}
        element.innerHTML = element.dataset.originalText || '';
        delete element.dataset.glitchingActive;
        delete element.dataset.originalText;
        delete element.dataset.changeInterval;
      });
      try { runningSelectors.delete(selector); } catch(e){}
    }

    window.startGlitching = function(selector, changeP, glitchP){ if (animationsDisabled() || prefersReduced()) return; try { applyGlitch(selector, changeP, glitchP); } catch(e){} };
    window.stopGlitching = function(selector){ try { removeGlitch(selector); } catch(e){} };
  })();
  
  // ---------- INCREMENTAL SHINING FOR MANIFEST ----------
  (function(){
    // Always (re)define shining APIs to ensure consistent behavior
    var mo = null; var bodyMo = null; var running = false; var rescanId = null; var retryId = null; var retries = 0; var flickerTimers = []; var noisingId = null;
    function animationsDisabled(){ return !!(document.body && document.body.classList.contains('no-animations')) && !window.__forceShine; }
    function prefersReduced(){ try { return !window.__forceShine && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch(e){ return false; } }
    function findContainer(){
      var el = document.querySelector('#manifest-container .noising-text')
        || document.querySelector('.hero-intro .manifest .noising-text')
        || document.querySelector('.manifest .noising-text');
      try { console.debug('[shining] findContainer ->', !!el, el); } catch(e){}
      return el;
    }
    function adopt(container){
      if (!container) return;
      // If there are no span nodes yet (e.g., reduced-motion path set raw text), wrap into spans for shining
      var existing = container.querySelectorAll('.noising-char, .tw-char');
      if (!existing.length && container.childNodes && container.childNodes.length === 1 && container.childNodes[0].nodeType === 3){
        var raw = container.textContent || '';
        container.textContent = '';
        for (var i=0;i<raw.length;i++){
          var ch = raw[i];
          if (ch === ' '){ container.appendChild(document.createTextNode(' ')); continue; }
          var span = document.createElement('span'); span.className = 'noising-char'; span.textContent = ch; container.appendChild(span);
        }
      }
      // Upgrade .tw-char into .noising-char if needed, then ensure .noising present
      var nodes = container.querySelectorAll('.noising-char, .tw-char');
      nodes.forEach(function(el){
        if (el.classList.contains('tw-char') && !el.classList.contains('noising-char')) el.classList.add('noising-char');
        el.classList.add('noising');
      });
      try { console.debug('[shining] adopt: upgraded/activated', nodes.length, 'nodes'); } catch(e){}
    }
    function start(){
      if (running) return; if (prefersReduced() || animationsDisabled()) return;
      var host = findContainer();
      if (!host){
        // retry to find host shortly; bail out if too many attempts
        try { if (retryId) clearTimeout(retryId); } catch(e){}
        if (retries > 120) return; // ~36s worst-case if interval below stays 300ms
        retryId = setTimeout(function(){ retries++; start(); }, 300);
        try { console.debug('[shining] start: host not found, retry', retries); } catch(e){}
        return;
      }
      // found host
      retries = 0; try { if (retryId) { clearTimeout(retryId); retryId = null; } } catch(e){}
      adopt(host); running = true; try { console.debug('[shining] STARTED'); } catch(e){}
      // start random flicker loop across host
      function flick(h){
        if (!running) return;
        var arr = h && h.querySelectorAll ? h.querySelectorAll('.noising-char') : [];
        if (arr && arr.length){
          var bursts = 1 + Math.floor(Math.random()*3); // 1-3 chars per cycle
          for (var b=0; b<bursts; b++){
            var i = Math.floor(Math.random()*arr.length); var el = arr[i];
            if (el){
              el.classList.add('flickering');
              var t1 = setTimeout(function(e){ return function(){ try{ e.classList.remove('flickering'); }catch(ex){} }; }(el), 120 + Math.random()*260);
              flickerTimers.push(t1);
            }
          }
        }
        var t2 = setTimeout(function(){ flick(h); }, 260 + Math.random()*940);
        flickerTimers.push(t2);
      }
      try { flick(host); } catch(e){}
      // start periodic noising-burst pulses (short stronger glow pulses)
      try { if (noisingId) { clearInterval(noisingId); noisingId = null; } } catch(e){}
      noisingId = setInterval(function(){
        if (!running) return; if (animationsDisabled()) return;
        var h = findContainer(); if (!h) return;
        var chars = h.querySelectorAll('.noising-char'); if (!chars || !chars.length) return;
        var prob = 0.02; // 2% chance per char per interval
        for (var i=0;i<chars.length;i++){
          if (Math.random() < prob){
            var el = chars[i];
            el.classList.add('noising-burst');
            (function(e){ setTimeout(function(){ try{ e.classList.remove('noising-burst'); }catch(ex){} }, 200 + Math.random()*160); })(el);
          }
        }
      }, 900);
      if (mo) { try { mo.disconnect(); } catch(e){} mo=null; }
      try {
        mo = new MutationObserver(function(muts){
          muts.forEach(function(m){
            if (!m.addedNodes) return;
            m.addedNodes.forEach(function(n){
              if (n && n.nodeType === 1){ // Element
                // upgrade and adopt newly added elements
                if (n.classList.contains('tw-char') && !n.classList.contains('noising-char')) n.classList.add('noising-char');
                if (n.classList.contains('noising-char')) n.classList.add('noising');
                // also adopt any descendants
                var ds = n.querySelectorAll && n.querySelectorAll('.noising-char, .tw-char');
                ds && ds.forEach(function(el){ if (el.classList.contains('tw-char') && !el.classList.contains('noising-char')) el.classList.add('noising-char'); el.classList.add('noising'); });
                try { console.debug('[shining] MO adopt node + descendants'); } catch(e){}
              }
            });
          });
        });
        mo.observe(host, { childList: true, subtree: true });
      } catch(e){}
      // periodic rescan to adopt nodes whose classes changed (e.g., after finalize)
      try { if (rescanId) clearInterval(rescanId); } catch(e){}
      rescanId = setInterval(function(){ if (!running) return; if (animationsDisabled()) { stop(); return; } adopt(findContainer()); }, 600);
      if (!bodyMo){
        bodyMo = new MutationObserver(function(muts){ for (var i=0;i<muts.length;i++){ if (muts[i].attributeName==='class'){ if (animationsDisabled()) stop(); else start(); break; } } });
        try { document.body && bodyMo.observe(document.body, { attributes: true }); } catch(e){}
      }
    }
    function stop(){
      if (!running) return; running = false;
      try { mo && mo.disconnect(); } catch(e){} mo=null;
      try { if (rescanId) { clearInterval(rescanId); rescanId = null; } } catch(e){}
      try { if (retryId) { clearTimeout(retryId); retryId = null; } } catch(e){}
      try { while(flickerTimers.length){ var id=flickerTimers.pop(); clearTimeout(id); } } catch(e){}
      try { if (noisingId) { clearInterval(noisingId); noisingId = null; } } catch(e){}
      var host = findContainer(); if (!host) return;
      try { host.querySelectorAll('.noising-char.noising').forEach(function(el){ el.classList.remove('noising'); }); } catch(e){}
      try { console.debug('[shining] STOPPED'); } catch(e){}
    }
    // expose simple noising API compatible with user's inspiration
    window.startNoising = function(){ try { start(); } catch(e){} };
    window.stopNoising = function(){ try { stop(); } catch(e){} };
    window.startShinning = start;
    window.stopShinning = stop;
    window.forceShineOn = function(){ try { window.__forceShine = true; document.body && document.body.classList.add('force-shine'); start(); } catch(e){} };
    window.forceShineOff = function(){ try { window.__forceShine = false; document.body && document.body.classList.remove('force-shine'); stop(); } catch(e){} };
    // Auto-start if allowed
    if (!prefersReduced() && !animationsDisabled()) start();
  })();

  // ---------- NOISE CANVAS (12 FPS + IO) ----------
  (function(){
    var canvas = document.getElementById('noise-canvas'); if (!canvas) return;
    var ctx = canvas.getContext('2d'); if (!ctx) return;
    function resize(){ canvas.width = innerWidth; canvas.height = innerHeight; }
    resize(); window.addEventListener('resize', resize);
    var running = false; var id = null; var last = 0; var io = null;
    function loop(ts){
      if (!running) return;
      var now = ts || performance.now();
      if (now - last < 1000/6) { id = requestAnimationFrame(loop); return; } // slowed: ~6 FPS
      last = now;
      var w=canvas.width,h=canvas.height; var img = ctx.createImageData(w,h);
      for (var i=0;i<img.data.length;i+=4){ var v=(Math.random()*255)|0; img.data[i]=img.data[i+1]=img.data[i+2]=v; img.data[i+3]=20; }
      ctx.putImageData(img,0,0);
      id = requestAnimationFrame(loop);
    }
    function start(){ if (reduced || document.body.classList.contains('no-animations')) return; if (running) return; running = true; loop(); }
    function stop(){ running=false; if (id){ cancelAnimationFrame(id); id=null; } ctx.clearRect(0,0,canvas.width,canvas.height); }
    window.startNoise = start; window.stopNoise = stop;
    if ('IntersectionObserver' in window){
      io = new IntersectionObserver(function(entries){
        var vis = entries.some(function(e){ return e.isIntersecting; });
        if (vis) start(); else stop();
      }, { threshold: 0.01 });
      io.observe(canvas);
    } else {
      if (!document.body.classList.contains('no-animations')) start();
    }
  })();

  // ---------- GLITCH HEADING ATTACHER ----------
  window.attachGlitchHeading = function(root, title, opts){
    try {
      if (!root || !(root instanceof Element)) return function(){};
      var reduced = false; try { reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch(e) {}
      var intervalMs = (opts && opts.intervalMs) || 260;
      var chance = (opts && opts.chance) || 0.08;
      var restoreMin = (opts && opts.restoreMin) || 160;
      var restoreJitter = (opts && opts.restoreJitter) || 140;
      var GLITCH_CHARS = (opts && opts.chars) || "!@#$%^&*_-+=?/\\|<>[]{};:~NYHSMT#¤%&@§÷×¤░▒▓█▄▀●◊O|/\\_^-~.*+";
      function randomGlitchChar(orig){ return Math.random()<0.65 ? orig : GLITCH_CHARS[(Math.random()*GLITCH_CHARS.length)|0]; }
      var id = null; var mo = null;
      function resetSpans(){
        var spans = root.querySelectorAll('.glitch-char');
        spans.forEach(function(span, i){ span.textContent = title[i] || ''; span.classList.remove('glitchy'); try{ span.style.removeProperty('color'); }catch(e){} });
      }
      function cycle(){
        if (document.body && document.body.classList.contains('no-animations')) return;
        var spans = root.querySelectorAll('.glitch-char'); if (!spans.length) return;
        for (var i=0;i<spans.length;i++){
          var span = spans[i]; var orig = title[i] || '';
          if (Math.random() < chance){
            span.textContent = randomGlitchChar(orig);
            span.classList.add('glitchy');
            setTimeout(function(s,o){ return function(){ if (!s) return; s.textContent=o; s.classList.remove('glitchy'); try{ s.style.removeProperty('color'); }catch(e){} }; }(span, orig), restoreMin + Math.random()*restoreJitter);
          }
        }
      }
      function start(){ if (reduced) return; if (id) return; id = setInterval(cycle, intervalMs); }
      function stop(){ if (id){ clearInterval(id); id = null; } resetSpans(); }
      if (document && document.body && !document.body.classList.contains('no-animations')) start();
      mo = new MutationObserver(function(muts){ for (var i=0;i<muts.length;i++){ if (muts[i].attributeName==='class'){ if (document.body.classList.contains('no-animations')) stop(); else start(); break; } } });
      try { document.body && mo.observe(document.body, { attributes: true }); } catch(e){}
      return function(){ try { mo && mo.disconnect(); } catch(e){} stop(); };
    } catch(e){ return function(){}; }
  };
})();
