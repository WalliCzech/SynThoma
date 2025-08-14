import './globals.css';
import '@web/styles/base.css';
import '@web/styles/themes.css';
import '@web/styles/components.css';
import '@web/styles/reader.css';
import '@web/styles/effects.css';
import type { Metadata } from 'next';
import { ThemeRegistry } from '@web/providers/ThemeProvider';
import Script from 'next/script';
import ControlPanelClient from '@web/client/ControlPanelClient';
import UiHelpersClient from '@web/client/UiHelpersClient';
import VideoVisualsClient from '@web/client/VideoVisualsClient';

export const metadata: Metadata = {
  title: 'SYNTHOMA',
  description: 'Neon, glitch a paměťové jizvy. Pěkný večer.',
  icons: {
    icon: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/assets/favicon.ico`,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs" data-theme="synthoma" suppressHydrationWarning>
      <body data-theme="synthoma">
        {/* Video pozadí a glitch canvas (respektuje .no-animations a prefers-reduced-motion) */}
        <div className="video-background" aria-hidden="true">
          <video id="bgvid1" muted playsInline></video>
          <video id="bgvid2" muted playsInline></video>
          <video id="bgvid3" muted playsInline></video>
          <video id="bgvid4" muted playsInline></video>
          <video id="bgvid5" muted playsInline></video>
          <video id="bgvid6" muted playsInline></video>
          <video id="bgvid7" muted playsInline></video>
          <video id="bgvid8" muted playsInline></video>
          <video id="bgvid9" muted playsInline></video>
          <video id="bgvid10" muted playsInline></video>
        </div>
        <canvas id="glitch-bg" className="clitchbg" aria-hidden="true"></canvas>
        {/* Bootstrap script pro načtení tématu co nejdřív (před hydratací) */}
        <Script id="theme-bootstrap" strategy="beforeInteractive">
          {`
            (function(){
              var ALLOWED = ["synthoma","green-matrix","neon-hellfire","cyber-dystopia","acid-glitch","retro-arcade"];
              try {
                var saved = localStorage.getItem('theme');
                var next = ALLOWED.indexOf(saved) !== -1 ? saved : 'synthoma';
                // Nastav co nejdřív na <html> kvůli FOUC
                if (typeof document !== 'undefined') {
                  document.documentElement.setAttribute('data-theme', next);
                  document.addEventListener('DOMContentLoaded', function(){
                    document.body && document.body.setAttribute('data-theme', next);
                  });
                }
                // Exponovat rituál pro přepínání, žádné hračky (čisté JS, žádný TS cast)
                window.setTheme = function(name){
                  if (ALLOWED.indexOf(name) === -1) return;
                  document.documentElement && document.documentElement.setAttribute('data-theme', name);
                  document.body && document.body.setAttribute('data-theme', name);
                  try { localStorage.setItem('theme', name); } catch(e) {}
                };
              } catch (e) {
                // Když localStorage trucuje, necháme synthoma
              }
            })();
          `}
        </Script>
        <ThemeRegistry>{children}</ThemeRegistry>
        {/* UI kotvy */}
        <div id="toaster" aria-live="polite" aria-atomic="true"></div>
        <div className="modal" id="modal-run" hidden aria-hidden="true" role="dialog" aria-modal="true">
          <div className="modal-content panel" role="document">
            <h3 className="halo no-top-margin">Potvrdit riziko?</h3>
            <p className="text-muted">Jistý si opravdu nejsi. Chceš pokračovat?</p>
            <div className="modal-actions">
              <button className="btn" data-action="cancel">Zrušit</button>
              <button className="btn accent" data-action="confirm">Pokračovat</button>
            </div>
          </div>
        </div>
        <canvas id="noise-canvas" aria-hidden="true"></canvas>
        {/* Video rotátor a glitch BG jako client komponenta */}
        <VideoVisualsClient />
        {/* UI helpers (toast/modal/popover/noise) jako client komponenta */}
        <UiHelpersClient />
        {/* Shinning effect for manifest */}
        <Script id="shinning-effect" strategy="afterInteractive">{
          `;(function(){
            'use strict';
            // If ui-helpers.js already provided startShinning/stopShinning, keep those
            if (window.startShinning && window.stopShinning) return;
            var timers = [];
            function qs(){ return document.querySelectorAll('.shinning .noising-text'); }
            function apply(){
              var hosts = qs();
              hosts.forEach(function(host){
                var chars = host.querySelectorAll('.noising-char');
                chars.forEach(function(c){ c.classList.add('noising'); });
                // very light random toggling to simulate flicker without rewrapping
                function flick(h){
                  if (!h.dataset || h.dataset.shineOff === '1') return;
                  var arr = h.querySelectorAll('.noising-char'); if (!arr.length) return;
                  var i = Math.floor(Math.random()*arr.length); var el = arr[i];
                  el && el.classList.add('flickering');
                  var t1 = setTimeout(function(){ el && el.classList && el.classList.remove('flickering'); }, 100 + Math.random()*200);
                  timers.push(t1);
                  var t2 = setTimeout(function(){ flick(h); }, 500 + Math.random()*2000);
                  timers.push(t2);
                }
                flick(host);
              });
            }
            function remove(){
              timers.forEach(clearTimeout); timers = [];
              var hosts = qs();
              hosts.forEach(function(host){ host.dataset.shineOff = '1'; });
              setTimeout(function(){
                hosts.forEach(function(host){
                  delete host.dataset.shineOff;
                  var chars = host.querySelectorAll('.noising-char');
                  chars.forEach(function(c){ c.classList.remove('flickering'); });
                });
              }, 20);
            }
            window.startShinning = function(){ apply(); };
            window.stopShinning  = function(){ remove(); };
          })();`
        }</Script>
        {/* Control Panel UI */}
        <button id="toggle-panel-btn" className="panel-toggle-button" aria-controls="control-panel" aria-expanded="false" aria-label="Ovládací panel">🔧️</button>
        <div id="control-panel" role="region" aria-label="Ovládací panel">
          <div className="panel-section">
            <h3 className="panel-heading">Nastavení displeje</h3>
            <div className="setting-item">
              <label htmlFor="font-size-slider">Velikost písma</label>
              <input type="range" id="font-size-slider" min="0.8" max="2.7" step="0.05" defaultValue="1" />
            </div>
            <div className="setting-item">
              <label htmlFor="opacity-slider">Průhlednost pozadí</label>
              <input type="range" id="opacity-slider" min="0" max="1" step="0.05" defaultValue="0.8" />
            </div>
            <div className="setting-item">
              <label htmlFor="typewriter-speed">Rychlost psaní</label>
              <div className="speed-controls">
                <button id="speed-instant" className="speed-btn" data-speed="instant" type="button">⚡ Okamžitě</button>
                <button id="speed-fast" className="speed-btn" data-speed="fast" type="button">🏃 Rychle</button>
                <button id="speed-normal" className="speed-btn active" data-speed="normal" type="button">🚶 Normálně</button>
                <button id="speed-slow" className="speed-btn" data-speed="slow" type="button">🐌 Pomalu</button>
              </div>
            </div>
            <div className="setting-item flex gap-8 items-center flex-wrap">
              <button id="toggle-animations" className="panel-button" type="button">Animace: Zapnuty</button>
              <button id="toggle-glass" className="panel-button" type="button">Sklo</button>
            </div>
          </div>
          <div className="panel-section">
            <h3 className="panel-heading">Motivy</h3>
            <div className="theme-buttons">
              <button className="theme-button" data-theme="synthoma" type="button">Synthoma</button>
              <button className="theme-button" data-theme="green-matrix" type="button">Green Matrix</button>
              <button className="theme-button" data-theme="neon-hellfire" type="button">Neon Hellfire</button>
              <button className="theme-button" data-theme="cyber-dystopia" type="button">Cyber Dystopia</button>
              <button className="theme-button" data-theme="acid-glitch" type="button">Acid Glitch</button>
              <button className="theme-button" style={{ fontFamily: "VT323" }} data-theme="retro-arcade" type="button">Retro Arcade</button>
            </div>
          </div>
          <div className="panel-section">
            <h3 className="panel-heading">Audio přehrávač</h3>
            <div id="audio-player-controls">
              <div id="custom-audio-controls">
                <button id="play-pause-btn" className="panel-button" type="button" aria-label="Play/Pause">▶️</button>
                <button id="stop-btn" className="panel-button" type="button" aria-label="Stop">⏹️</button>
                <div id="progress-bar-container" aria-label="Průběh">
                  <div id="progress-bar"></div>
                </div>
              </div>
              <div id="playlist-container" aria-label="Playlist"></div>
            </div>
          </div>
        </div>
        <ControlPanelClient />
      </body>
    </html>
  );
}
