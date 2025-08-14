"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    animationManager?: { toggleAll: () => void };
    setTheme?: (name: string) => void;
    __synthomaAudio?: HTMLAudioElement;
    audioPanelPlay?: (file?: string) => void;
    audioPanelEnsurePlaying?: () => void;
    startShinning?: () => void;
    stopShinning?: () => void;
    startGlitchBg?: () => void;
    stopGlitchBg?: () => void;
    startVideoRotation?: () => void;
    stopVideoRotation?: () => void;
    startNoise?: () => void;
    stopNoise?: () => void;
    __cpBootedOnce?: boolean;
    __cpDelegationAttached?: boolean; // legacy
    __cpPanelDelegationAttached?: boolean;
    __cpActionsDelegationAttached?: boolean;
  }
}

export default function ControlPanelClient() {
  useEffect(() => {
    const abort = new AbortController();
    const { signal } = abort;
    function debugLog(...args: any[]) {
      try {
        const ls = (typeof localStorage !== 'undefined') ? localStorage.getItem('debug') : null;
        const enabled = (ls === '1' || ls === 'true' || (typeof process !== 'undefined' && (process as any).env && (process as any).env.NODE_ENV !== 'production'));
        if (enabled) console.log(...args);
      } catch {}
    }
    // Nepoužívej tvrdý guard, HMR může DOM vyměnit a listenery zaniknou.
    // Místo toho použijeme delegaci na document (přidána jen jednou níže).
    const root = document.documentElement;
    const body = document.body;

    // Animation manager exposed on window
    window.animationManager = window.animationManager || {
      toggleAll: function () {
        const disabled = localStorage.getItem("animationsDisabled") === "true";
        const next = !disabled;
        localStorage.setItem("animationsDisabled", String(next));
        body.classList.toggle("no-animations", next);
        // update glitch/video helpers
        if (typeof window.stopGlitchBg === "function" && next) window.stopGlitchBg();
        if (typeof window.startGlitchBg === "function" && !next) window.startGlitchBg();
        if (typeof window.stopVideoRotation === "function" && next) window.stopVideoRotation();
        if (typeof window.startVideoRotation === "function" && !next) window.startVideoRotation();
        if (typeof window.stopNoise === "function" && next) window.stopNoise();
        if (typeof window.startNoise === "function" && !next) window.startNoise();
        if (typeof window.stopShinning === "function" && next) window.stopShinning();
        if (typeof window.startShinning === "function" && !next) window.startShinning();
        // hard pause/resume all background videos
        const vids = document.querySelectorAll<HTMLVideoElement>(".video-background video");
        vids.forEach((v) => {
          try {
            if (next) {
              v.pause();
            } else {
              v.play().catch(() => { /* ignore */ });
            }
          } catch {}
        });
        // Button label update
        const btn = document.getElementById("toggle-animations");
        // Když jsou animace vypnuté (next=true), ukaž "Vypnuty"
        if (btn) btn.textContent = next ? "Animace: Vypnuty" : "Animace: Zapnuty";
      },
    };

    function initPersisted() {
      try {
        const areDisabled = localStorage.getItem("animationsDisabled") === "true";
        body.classList.toggle("no-animations", areDisabled);
        if (areDisabled) {
          if (typeof window.stopGlitchBg === "function") window.stopGlitchBg();
          if (typeof window.stopVideoRotation === "function") window.stopVideoRotation();
          if (typeof window.stopNoise === "function") window.stopNoise();
          if (typeof window.stopShinning === "function") window.stopShinning();
          const vids0 = document.querySelectorAll<HTMLVideoElement>(".video-background video");
          vids0.forEach((v) => {
            try {
              v.pause();
            } catch {}
          });
        } else {
          if (typeof window.startGlitchBg === "function") window.startGlitchBg();
          if (typeof window.startVideoRotation === "function") window.startVideoRotation();
          if (typeof window.startNoise === "function") window.startNoise();
          if (typeof window.startShinning === "function") window.startShinning();
        }
        const fs = localStorage.getItem("fontSizeMultiplier");
        if (fs) root.style.setProperty("--font-size-multiplier", fs);
        const op = localStorage.getItem("readerBgOpacity");
        if (op) root.style.setProperty("--reader-bg-opacity", op);
        // Glass mode
        const isGlass = localStorage.getItem("glassMode") === "true";
        body.classList.toggle("glass-mode", isGlass);
        const glassTargets: HTMLElement[] = [];
        try {
          const cp = document.getElementById("control-panel");
          if (cp) glassTargets.push(cp);
          // Správně: čtečka má třídu .SYNTHOMAREADER (bez .terminal)
          const readerEl = document.querySelector<HTMLElement>(".SYNTHOMAREADER");
          if (readerEl) {
            glassTargets.push(readerEl);
            if (isGlass) {
              // vyčisti případné inline pozadí z předchozího NORMAL módu
              try { (readerEl as HTMLElement).style.removeProperty('background-color'); } catch {}
            }
          }
        } catch {}
        glassTargets.forEach((el) => {
          el.classList.toggle("glass", isGlass);
        });
        const savedBlur = localStorage.getItem("glassBlur") || "12";
        root.style.setProperty("--glass-blur", savedBlur + "px");
      } catch {}
    }

    function applySetting(key: string, value: string, cssVar?: string) {
      try {
        localStorage.setItem(key, value);
      } catch {}
      if (cssVar) root.style.setProperty(cssVar, value);
    }

    function boot() {
      // Reentrancy lock: zabraň paralelním bootům (HMR může být záludné)
      if ((window as any).__cpBooting) {
        try { debugLog?.('[ControlPanel] boot() skipped – already booting'); } catch {}
        return;
      }
      (window as any).__cpBooting = true;
      const togglePanelBtn = document.getElementById("toggle-panel-btn");
      const controlPanel = document.getElementById("control-panel");
      // Nastav aria-controls hned při bootu (nečekej až na první toggle)
      try { if (togglePanelBtn && controlPanel) togglePanelBtn.setAttribute('aria-controls', 'control-panel'); } catch {}
      const doTogglePanel = (force?: boolean) => {
        if (!controlPanel || !togglePanelBtn) return;
        const wasVisible = controlPanel.classList.contains("visible");
        const next = typeof force === 'boolean' ? force : !wasVisible;
        controlPanel.classList.toggle("visible", next);
        togglePanelBtn.setAttribute("aria-expanded", String(next));
        try { togglePanelBtn.setAttribute('aria-controls', 'control-panel'); } catch {}
        if (!wasVisible && next) {
          controlPanel.style.opacity = "1";
          controlPanel.style.pointerEvents = "auto";
          controlPanel.style.transform = "none";
        } else if (wasVisible && !next) {
          controlPanel.style.opacity = "";
          controlPanel.style.pointerEvents = "";
          controlPanel.style.transform = "";
        }
        try { debugLog?.("[ControlPanel] toggle", { expanded: next }); } catch {}
      };
      if (togglePanelBtn && controlPanel) {
        // Delegace pouze jednou, v bubble fázi (třetí parametr undefined)
        if (!window.__cpPanelDelegationAttached) {
          document.addEventListener('click', function(ev){
            const t = ev.target as HTMLElement | null;
            if (!t) return;
            // Optional inline Debug toggle button
            const dbg = t.closest('#debug-toggle');
            if (dbg) {
              try { ev.preventDefault(); ev.stopPropagation(); } catch {}
              const ls = (typeof localStorage !== 'undefined') ? localStorage.getItem('debug') : null;
              const next = !(ls === '1' || ls === 'true');
              try { localStorage.setItem('debug', next ? '1' : '0'); } catch {}
              try { (dbg as HTMLElement).setAttribute('aria-pressed', String(next)); } catch {}
              debugLog?.(`🐞 Debug ${next ? 'enabled' : 'disabled'} via button`);
              return;
            }
            const btn = t.closest('#toggle-panel-btn');
            if (!btn) return;
            try { ev.preventDefault(); } catch {}
            doTogglePanel();
          }, { signal });
          document.addEventListener('keydown', function(ev: KeyboardEvent){
            if (ev.key === 'Escape') {
              doTogglePanel(false);
            }
            // Ctrl+Alt+D toggles debug flag
            if ((ev.key === 'd' || ev.key === 'D') && ev.ctrlKey && ev.altKey) {
              try { ev.preventDefault(); } catch {}
              const ls = (typeof localStorage !== 'undefined') ? localStorage.getItem('debug') : null;
              const next = !(ls === '1' || ls === 'true');
              try { localStorage.setItem('debug', next ? '1' : '0'); } catch {}
              debugLog?.(`🐞 Debug ${next ? 'enabled' : 'disabled'} via Ctrl+Alt+D`);
              const btn = document.getElementById('debug-toggle');
              if (btn) btn.setAttribute('aria-pressed', String(next));
            }
          }, { signal });
          window.__cpPanelDelegationAttached = true;
        }
      } else {
        try { console.warn("[ControlPanel] Nenalezen toggle nebo panel", { hasBtn: !!togglePanelBtn, hasPanel: !!controlPanel }); } catch {}
      }

      // animations
      const toggleAnimationsBtn = document.getElementById("toggle-animations");
      const toggleGlassBtn = document.getElementById("toggle-glass");
      function updateButtonState() {
        const areAnimationsDisabled = localStorage.getItem("animationsDisabled") === "true";
        if (toggleAnimationsBtn){
          toggleAnimationsBtn.textContent = areAnimationsDisabled ? "Animace: Vypnuty" : "Animace: Zapnuty";
          toggleAnimationsBtn.setAttribute('aria-pressed', String(!areAnimationsDisabled));
        }
        const isGlass = localStorage.getItem("glassMode") === "true";
        if (toggleGlassBtn){
          toggleGlassBtn.textContent = isGlass ? "Sklo: Zapnuto" : "Sklo: Vypnuto";
          toggleGlassBtn.setAttribute('aria-pressed', String(isGlass));
        }
      }
      // Přímé listenery nejsou potřeba, delegujeme níže; jen nastav počáteční stav
      if (toggleAnimationsBtn) { updateButtonState(); }
      if (toggleGlassBtn) { updateButtonState(); }

      // 🎛️ NOVÝ SYNCHRONIZOVANÝ SYSTÉM PRO SLIDERY A GLASS MODE
      
      // 📊 Centrální stav pro glass mode a slidery
      let currentGlassMode = localStorage.getItem('glassMode') === 'true';
      let currentOpacity = parseFloat(localStorage.getItem("readerBgOpacity") || "0.8");
      let currentBlur = parseInt(localStorage.getItem("glassBlur") || "12");
      // sanity clamp – protože někdo rád tahá slider úplně do pekla
      if (Number.isNaN(currentBlur)) currentBlur = 12;
      currentBlur = Math.max(0, Math.min(24, currentBlur));
      
      // 🔧 Funkce pro aplikaci glass mode (ČISTÉ CSS ŘEŠENÍ)
      function applyGlassMode(isGlass: boolean, updateSlider: boolean = true) {
        currentGlassMode = isGlass;
        
        debugLog(`🔮 Switching to ${isGlass ? 'GLASS' : 'NORMAL'} mode... Time to make things ${isGlass ? 'blurry like my vision after coding 12 hours straight' : 'solid like my commitment issues'} 😵‍💫`);
        
        // Aktualizuj body class
        body.classList.toggle('glass-mode', isGlass);
        
        // Najdi čtečku
        const reader = document.querySelector('.SYNTHOMAREADER') as HTMLElement;
        
        if (isGlass) {
          // 🔮 GLASS MODE: Aplikuj .glass třídu na čtečku a vyčisti inline bg
          if (reader) {
            reader.classList.add('glass');
            // Nastav i inline backdrop pro případ, že by kaskáda zlobila
            try {
              reader.style.removeProperty('background-color');
              (reader.style as any).backdropFilter = `blur(${currentBlur}px)`;
              (reader.style as any).webkitBackdropFilter = `blur(${currentBlur}px)`;
            } catch {}
            debugLog(`💀 Reader glass class applied - "CSS dělá magii, já jen koukám" ✨`);
          }
          root.style.setProperty("--glass-blur", `${currentBlur}px`);
          debugLog(`🎚️ Glass blur set to ${currentBlur}px`);
        } else {
          // 🎨 NORMAL MODE: Odstraň .glass třídu; background řídí CSS var
          if (reader) {
            reader.classList.remove('glass');
            try {
              // Vypni případný inline backdrop-filter a obnov pozadí
              (reader.style as any).backdropFilter = 'none';
              (reader.style as any).webkitBackdropFilter = 'none';
              reader.style.backgroundColor = `rgba(var(--bg-secondary-rgb), ${currentOpacity})`;
            } catch {}
            debugLog(`💀 Normal mode applied: opacity var(--reader-bg-opacity)=${currentOpacity}`);
          }
          // Nastav CSS proměnnou pro reader opacity
          root.style.setProperty("--reader-bg-opacity", currentOpacity.toString());
        }
        
        // 🎚️ Synchronizuj slider s aktuálním módem
        const opacitySlider = document.getElementById("opacity-slider") as HTMLInputElement | null;
        if (opacitySlider && updateSlider) {
          if (isGlass) {
            // Slider reprezentuje blur (0-24px → 0-1)
            opacitySlider.value = (currentBlur / 24).toString();
            debugLog(`🎚️ Slider sync: blur mode, value=${opacitySlider.value} - "Slider teď ovládá blur jako DJ ovládá beat" 🎧`);
          } else {
            // Slider reprezentuje opacity (0-1)
            opacitySlider.value = currentOpacity.toString();
            debugLog(`🎚️ Slider sync: opacity mode, value=${opacitySlider.value} - "Slider teď ovládá průhlednost jako ghost ovládá strach" 👻`);
          }
        }
        
        // 🔄 Aktualizuj text tlačítka
        const toggleGlassBtn = document.getElementById("toggle-glass");
        if (toggleGlassBtn) {
          toggleGlassBtn.textContent = isGlass ? "Sklo: Zapnuto" : "Sklo: Vypnuto";
          toggleGlassBtn.setAttribute('aria-pressed', String(isGlass));
          debugLog(`🔘 Button updated: "${toggleGlassBtn.textContent}" - "Tlačítko je teď synchronizované jako Swiss hodinky" ⌚`);
        }
        
        // Ulož do localStorage
        try {
          localStorage.setItem('glassMode', String(isGlass));
          debugLog(`💾 Glass mode ${isGlass ? 'ENABLED' : 'DISABLED'} saved - "LocalStorage si to pamatuje lépe než já své heslo" 🧠`);
        } catch (e) {
          console.error("💥 Error saving glass mode - LocalStorage odmítá spolupracovat jako můj kód v pondělí ráno:", e);
        }
      }
      
      // 🎚️ Font size slider
      const fontSizeSlider = document.getElementById("font-size-slider") as HTMLInputElement | null;
      if (fontSizeSlider) {
        const savedFontSize = localStorage.getItem("fontSizeMultiplier") || "1";
        fontSizeSlider.value = savedFontSize;
        root.style.setProperty("--font-size-multiplier", savedFontSize);
        fontSizeSlider.addEventListener("input", function (e) {
          const target = e.target as HTMLInputElement;
          applySetting("fontSizeMultiplier", target.value, "--font-size-multiplier");
        });
      }
      
      // 🎚️ Opacity/Blur slider (inteligentní)
      const opacitySlider = document.getElementById("opacity-slider") as HTMLInputElement | null;
      // 🚀 DŮLEŽITÉ: Aplikuj glass mode při inicializaci vždy (i když slider není v DOMu)
      debugLog(`🔄 Initializing glass mode: ${currentGlassMode} - "Čas aplikovat magii při startu!" ✨`);
      applyGlassMode(currentGlassMode, true);

      // 🕵️‍♂️ Watchdog: čtečka se renderuje až později → zajisti resync, jakmile se objeví
      try {
        const ensureReaderSync = () => {
          const reader = document.querySelector('.SYNTHOMAREADER') as HTMLElement | null;
          if (!reader) return;
          if (currentGlassMode) {
            if (!reader.classList.contains('glass')) {
              reader.classList.add('glass');
              try { reader.style.removeProperty('background-color'); } catch {}
              debugLog('🧪 Reader appeared late → applied .glass');
            }
          } else {
            if (reader.classList.contains('glass')) {
              reader.classList.remove('glass');
              debugLog('🧪 Reader appeared late → removed .glass (normal mode)');
            }
            try { reader.style.removeProperty('background-color'); } catch {}
          }
        };
        // rychlý poke teď hned
        ensureReaderSync();
        // a pozorovatel pro nové nody (mount čtečky)
        const mo = new MutationObserver(() => {
          // debounce přes rAF, ať to nespamuje při větších mutacích
          requestAnimationFrame(ensureReaderSync);
        });
        mo.observe(document.body, { childList: true, subtree: true });
        // uložit pro cleanup
        (window as any).__cpReaderObserver = mo;
      } catch {}
      if (opacitySlider) {
        const onSlider = function (e: Event) {
          const target = e.target as HTMLInputElement;
          const val = parseFloat(target.value);
          
          debugLog(`🎚️ Slider moved to ${val} - "Někdo si hraje se sliderem jako dítě s hračkou" 🎮`);
          
          if (currentGlassMode) {
            // 🔮 GLASS MODE: slider mění --glass-blur CSS proměnnou
            currentBlur = Math.round(val * 24); // 0-1 → 0-24px
            
            // 🎯 ČISTÉ ŘEŠENÍ: Jen nastav CSS proměnnou, .glass třída udělá zbytek
            root.style.setProperty("--glass-blur", `${currentBlur}px`);
            
            try {
              localStorage.setItem("glassBlur", String(currentBlur));
              debugLog(`💀 Glass blur saved: ${currentBlur}px - "CSS proměnné jsou jako dobré víno, čím starší, tím lepší" 🍷`);
            } catch (e) {
              console.error("💥 Error saving blur - LocalStorage má horší paměť než já po kávě:", e);
            }
            if (currentBlur === 0) {
              console.warn("🧊 Blur nastaven na 0px – jestli nevidíš sklo, není to bug, je to umělecký statement. ✨");
            }
            
          } else {
            // 🎨 NORMAL MODE: slider mění opacity
            currentOpacity = val;
            
            root.style.setProperty("--reader-bg-opacity", val.toString());
            
            const reader = document.querySelector('.SYNTHOMAREADER') as HTMLElement;
            if (reader) {
              reader.style.backgroundColor = `rgba(var(--bg-secondary-rgb), ${val})`;
            }
            
            try {
              localStorage.setItem("readerBgOpacity", val.toString());
              debugLog(`💀 Background opacity saved: ${val} - "Průhlednost level: ${val > 0.8 ? 'Solid as my excuses' : val > 0.5 ? 'Semi-transparent like my intentions' : 'Ghost mode activated'}" 👻`);
            } catch (e) {
              console.error("💥 Error saving opacity - Saving failed harder than my last relationship:", e);
            }
          }
        };
        opacitySlider.addEventListener("input", onSlider);
        opacitySlider.addEventListener("change", onSlider);
      }

      // theme buttons
      const themeButtons = document.querySelectorAll<HTMLButtonElement>(".theme-button");
      if (themeButtons.length) {
        const savedTheme = localStorage.getItem("theme") || "synthoma";
        body.setAttribute("data-theme", savedTheme);
        try { document.documentElement.setAttribute('data-theme', savedTheme); } catch {}
        themeButtons.forEach((button) => {
          button.addEventListener("click", function () {
            const theme = button.getAttribute("data-theme");
            if (!theme) return;
            if (typeof window.setTheme === "function") window.setTheme(theme);
            else {
              body.setAttribute("data-theme", theme);
              try { document.documentElement.setAttribute('data-theme', theme); } catch {}
            }
            try {
              localStorage.setItem("theme", theme);
            } catch {}
            themeButtons.forEach((b) => {
              b.classList.toggle("active", b.getAttribute("data-theme") === theme);
            });
            // Po změně motivu znovu spusť video rotaci a pokus se přehrát videa (některé prohlížeče pauznou)
            try { if (typeof window.startVideoRotation === 'function') window.startVideoRotation(); } catch {}
            try {
              document.querySelectorAll<HTMLVideoElement>('.video-background video').forEach(v => {
                try { v.play().catch(()=>{}); } catch {}
              });
            } catch {}
          });
        });
        themeButtons.forEach((b) => {
          b.classList.toggle("active", b.getAttribute("data-theme") === savedTheme);
        });
      }

      // audio
      const BP = process.env.NEXT_PUBLIC_BASE_PATH || '';
      const playlistContainer = document.getElementById("playlist-container");
      const playPauseBtn = document.getElementById("play-pause-btn");
      const stopBtn = document.getElementById("stop-btn");
      const progressBar = document.getElementById("progress-bar") as HTMLDivElement | null;
      const progressBarContainer = document.getElementById("progress-bar-container");
      const audioTracks = [
        { title: "SynthBachmoff", file: `${BP}/audio/SynthBachmoff.mp3` },
        { title: "Glitch Ambient", file: `${BP}/audio/SYNTHOMA1.mp3` },
        { title: "Nuova", file: `${BP}/audio/Nuova.mp3` },
      ];
      let currentTrackIndex = -1;
      // Vytvoř/skonfiguruj sdílený <audio> a připevni do DOM (některé prohlížeče jsou cimprlich)
      let audio = window.__synthomaAudio ? window.__synthomaAudio : new Audio();
      audio.preload = 'auto';
      audio.controls = false;
      audio.setAttribute('playsinline', 'true');
      try {
        if (!document.getElementById('synthoma-audio')) {
          const holder = document.createElement('div');
          holder.id = 'synthoma-audio';
          holder.style.position = 'fixed';
          holder.style.inset = 'auto auto -9999px -9999px'; // nenápadně mimo viewport
          holder.style.width = '1px'; holder.style.height = '1px'; holder.style.overflow = 'hidden';
          holder.appendChild(audio);
          document.body.appendChild(holder);
        } else {
          const holder = document.getElementById('synthoma-audio');
          if (holder && !holder.contains(audio)) holder.appendChild(audio);
        }
      } catch {}
      if (!window.__synthomaAudio) {
        window.__synthomaAudio = audio;
      }
      function playAudio(filePath?: string) {
        if (filePath) {
          audio.src = filePath;
          try { audio.load(); } catch {}
        }
        const doPlay = () => audio.play().catch(() => { /* ignore */ });
        // Pokud ještě není připravené bufferování, počkej na canplaythrough (méně “klik a nic”)
        if (audio.readyState < 3) {
          const onReady = () => { try { audio.removeEventListener('canplaythrough', onReady); } catch {} doPlay(); };
          try { audio.addEventListener('canplaythrough', onReady, { once: true }); } catch { doPlay(); }
        } else {
          doPlay();
        }
        if (playPauseBtn) playPauseBtn.textContent = "⏸️";
      }
      function updatePlaylistActiveState() {
        const items = document.querySelectorAll<HTMLAnchorElement>("#playlist-container a");
        items.forEach((item, index) => {
          item.classList.toggle("active", index === currentTrackIndex);
        });
      }
      function playNextTrack() {
        if (!audioTracks.length) return;
        currentTrackIndex = (currentTrackIndex + 1) % audioTracks.length;
        const track = audioTracks[currentTrackIndex];
        playAudio(track.file);
        updatePlaylistActiveState();
      }
      function playPrevTrack() {
        if (!audioTracks.length) return;
        currentTrackIndex = (currentTrackIndex - 1 + audioTracks.length) % audioTracks.length;
        const track = audioTracks[currentTrackIndex];
        playAudio(track.file);
        updatePlaylistActiveState();
      }
      if (playlistContainer) {
        // Vyčisti staré položky při re-initu (HMR)
        try { (playlistContainer as HTMLElement).innerHTML = ''; } catch {}
        audioTracks.forEach((track, index) => {
          const trackElement = document.createElement("a");
          trackElement.href = "#";
          trackElement.textContent = track.title;
          (trackElement as any).dataset.index = String(index);
          trackElement.addEventListener("click", function (e) {
            e.preventDefault();
            currentTrackIndex = index;
            playAudio(track.file);
            updatePlaylistActiveState();
          });
          playlistContainer.appendChild(trackElement);
        });
      }
      // ZÁMĚRNĚ: Necháváme pouze delegovanou obsluhu (níže), aby se klik nevyhodnotil 2× a nestřelil se do nohy.
      audio.addEventListener("timeupdate", function () {
        if (progressBar && audio.duration) {
          const progress = (audio.currentTime / audio.duration) * 100;
          progressBar.style.width = progress + "%";
        }
      });
      audio.addEventListener("play", function () {
        if (playPauseBtn) { playPauseBtn.textContent = "⏸️"; playPauseBtn.setAttribute('aria-pressed','true'); }
      });
      audio.addEventListener("pause", function () {
        if (playPauseBtn) { playPauseBtn.textContent = "▶️"; playPauseBtn.setAttribute('aria-pressed','false'); }
      });
      audio.addEventListener("error", function(){
        try { console.warn('[Audio] Chyba přehrávání, přeskakuji na další skladbu'); } catch {}
        // zkus další skladbu, ať se UI necítí jak ve výtahu bez hudby
        playNextTrack();
      });
      if (progressBarContainer) {
        progressBarContainer.addEventListener("click", function (e: MouseEvent) {
          if (!audio.duration) return;
          const rect = (progressBarContainer as HTMLElement).getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          audio.currentTime = (clickX / rect.width) * audio.duration;
        });
      }
      audio.addEventListener("ended", playNextTrack);

      // Delegace kliknutí pro audio ovladače (robustní proti HMR a reflow)
      if (!(window as any).__cpAudioDelegationAttached) {
        document.addEventListener('click', function(ev){
          const t = ev.target as HTMLElement | null;
          if (!t) return;
          const btn = t.closest('button');
          if (!btn) return;
          if (btn.id === 'play-pause-btn'){
            try { ev.preventDefault(); ev.stopPropagation(); } catch {}
            try { console.debug('[Audio] play/pause click; paused=', audio.paused, 'src=', !!audio.src); } catch {}
            if (audio.paused) {
              if (audio.src) {
                audio.play().catch(() => {});
              } else {
                // žádný src? Nakopni playlist od začátku
                currentTrackIndex = -1;
                playNextTrack();
              }
            } else {
              audio.pause();
            }
          } else if (btn.id === 'stop-btn'){
            try { ev.preventDefault(); ev.stopPropagation(); } catch {}
            try { console.debug('[Audio] stop click'); } catch {}
            audio.pause();
            audio.currentTime = 0;
          }
        }, { capture: true, signal });
        (window as any).__cpAudioDelegationAttached = true;
      }

      // 🔘 Event handlers pro tlačítka (s novou glass mode logikou)
      if (!window.__cpActionsDelegationAttached) {
        document.addEventListener('click', function(ev){
          const target = ev.target as HTMLElement | null;
          if (!target) return;
          const btn = target.closest('button');
          if (!btn) return;
          
          if (btn.id === 'toggle-animations') {
            try { ev.preventDefault(); ev.stopPropagation(); } catch {}
            try { console.debug('[ControlPanel] click toggle-animations'); } catch {}
            window.animationManager?.toggleAll();
            try { document.dispatchEvent(new CustomEvent('synthoma:animations-changed')); } catch {}
            updateButtonState();
            
          } else if (btn.id === 'toggle-glass') {
            try { ev.preventDefault(); ev.stopPropagation(); } catch {}
            debugLog(`🔘 Glass button clicked - "Někdo chce přepnout mezi realitou a iluzí" ✨`);
            
            // 🔮 Použij nový synchronizovaný systém
            const next = !currentGlassMode;
            debugLog(`🔄 Switching from ${currentGlassMode ? 'GLASS' : 'NORMAL'} to ${next ? 'GLASS' : 'NORMAL'} mode - "Plot twist incoming!" 🎭`);
            
            applyGlassMode(next, true);
            
            // updateButtonState už není potřeba - applyGlassMode to dělá
            debugLog(`✅ Glass mode toggle complete - "Synchronizace dokončena jako boss fight" 🎮`);
          }
        }, { capture: true, signal });
        window.__cpActionsDelegationAttached = true;
      }

      // ⚡ Speed controls pro typewriter
      const speedButtons = document.querySelectorAll<HTMLButtonElement>(".speed-btn");
      const savedSpeed = localStorage.getItem("typewriterSpeed") || "normal";
      
      function updateSpeedButtons(activeSpeed: string) {
        speedButtons.forEach(btn => {
          const isActive = btn.getAttribute("data-speed") === activeSpeed;
          btn.classList.toggle("active", isActive);
          btn.setAttribute('aria-pressed', String(isActive));
        });
      }
      
      // 🎯 Inicializuj s uloženou hodnotou
      updateSpeedButtons(savedSpeed);
      
      // 🔥 Pošli initial event pro typewriter (pokud není default)
      if (savedSpeed !== "normal") {
        setTimeout(() => {
          document.dispatchEvent(new CustomEvent('synthoma:speed-changed', { 
            detail: { speed: savedSpeed } 
          }));
          debugLog(`💀 Initial typewriter speed set to: ${savedSpeed}`);
        }, 100);
      }
      
      speedButtons.forEach(btn => {
        btn.addEventListener("click", function() {
          const speed = btn.getAttribute("data-speed");
          if (!speed) return;
          
          try {
            localStorage.setItem("typewriterSpeed", speed);
            updateSpeedButtons(speed);
            
            // 🔥 Pošli event pro typewriter
            document.dispatchEvent(new CustomEvent('synthoma:speed-changed', { 
              detail: { speed } 
            }));
            
            debugLog(`💀 Typewriter speed changed to: ${speed}`);
          } catch (e) {
            console.error("💥 Error setting typewriter speed:", e);
          }
        });
      });

      // Hover micro-interaction
      const hoverElements = document.querySelectorAll<HTMLElement>("[data-hover-text]");
      hoverElements.forEach((element) => {
        element.addEventListener("mouseover", function () {
          element.style.transform = "translateY(-2px)";
        });
        element.addEventListener("mouseout", function () {
          element.style.transform = "translateY(0)";
        });
      });

      // Na remount/refresh vždy resync persistent stavu bez ohledu na guardy
      initPersisted();
      // Sync aria-pressed on #debug-toggle if present
      try {
        const btn = document.getElementById('debug-toggle');
        if (btn) {
          const ls = (typeof localStorage !== 'undefined') ? localStorage.getItem('debug') : null;
          const active = (ls === '1' || ls === 'true');
          btn.setAttribute('aria-pressed', String(active));
        }
      } catch {}
      try { (window as any).__cpBootedOnce = true; } catch {}
      try { (window as any).__cpBooting = false; } catch {}

      return () => {
        try { abort.abort(); } catch {}
        try { (window as any).__cpPanelDelegationAttached = false; } catch {}
        try { (window as any).__cpActionsDelegationAttached = false; } catch {}
        try { (window as any).__cpAudioDelegationAttached = false; } catch {}
        try { const mo = (window as any).__cpReaderObserver as MutationObserver | undefined; if (mo) mo.disconnect(); } catch {}
      };
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", boot);
      return () => document.removeEventListener("DOMContentLoaded", boot);
    } else {
      boot();
    }
    // No teardown for many 1-off listeners; page-level lifetime like before
    return;
  }, []);

  return null;
}
