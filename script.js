document.addEventListener('DOMContentLoaded', () => {
    console.log('🎮 SYNTHOMA script initialized. System status: GLITCH_STABILIZED_RGB');
// Inicializace canvasu pro pozadí
    const canvas = document.getElementById('glitch-bg');
    let ctx, W, H;

    if (canvas) {
        ctx = canvas.getContext('2d');
     
     // Vlastní implementace plynulého scrollování bez scrollbaru
     function smoothScrollTo(targetY, duration = 1000) {
         const startY = window.scrollY;
         const distance = targetY - startY;
         let startTime = null;

         function animation(currentTime) {
             if (startTime === null) startTime = currentTime;
             const timeElapsed = currentTime - startTime;
             const run = easeInOutCubic(timeElapsed, startY, distance, duration);
             window.scrollTo(0, run);
             if (timeElapsed < duration) requestAnimationFrame(animation);
         }

         // Funkce pro plynulé zrychlování a zpomalování
         function easeInOutCubic(t, b, c, d) {
             t /= d/2;
             if (t < 1) return c/2*t*t*t + b;
             t -= 2;
             return c/2*(t*t*t + 2) + b;
         }

         requestAnimationFrame(animation);
     }

     // Skrolování stránky bez scrollbaru
     function scrollToBottom() {
         smoothScrollTo(document.body.scrollHeight);
     }

     function resize() {
         W = window.innerWidth;
         H = window.innerHeight;
         canvas.width = W;
         canvas.height = H;
     }
     
     window.addEventListener('resize', resize);
     resize();

     const colors = ['#00fff9', '#ff00c8', '#faff00', '#fff'];
     const MAX_LINES = 11;
     let lastDraw = 0;

     function draw(now) {
         if (!ctx) return;
         
         if (now - lastDraw < 60) {
             requestAnimationFrame(draw);
             return;
         }
         lastDraw = now;

         ctx.clearRect(0, 0, W, H);

         // Jemný tmavý šum
         ctx.globalAlpha = 0.14;
         for(let i = 0; i < 6; i++) {
             ctx.fillStyle = '#101015';
             ctx.fillRect(0, Math.random()*H, W, Math.random()*7+1);
         }
         ctx.globalAlpha = 1.0;

         for(let i = 0; i < MAX_LINES; i++) {
             if(Math.random() > 0.35) continue;

             let y = Math.random() * H;
             let h = Math.random() * 4 + 1;
             let x = Math.random() * W * 0.85;
             let w = Math.random() * W * 0.22 + 40;
             let color = colors[Math.floor(Math.random()*colors.length)];
             
             ctx.save();
             ctx.globalCompositeOperation = (Math.random() > 0.7) ? "lighter" : "screen";
             ctx.shadowBlur = 10 + Math.random()*12;
             ctx.shadowColor = color;
             ctx.globalAlpha = 0.13 + Math.random()*0.22;
             ctx.fillStyle = color;

             if(Math.random() > 0.77) {
                 ctx.transform(1, Math.random()*0.07-0.03, Math.random()*0.08-0.04, 1, 0, 0);
             }
             ctx.fillRect(x, y, w, h);
             ctx.restore();
         }

         // Velký glitch pruh
         if(Math.random() > 0.992) {
             ctx.save();
             let y = Math.random() * H;
             ctx.globalAlpha = 0.3;
             ctx.shadowBlur = 23;
             ctx.shadowColor = colors[Math.floor(Math.random()*colors.length)];
             ctx.fillStyle = colors[Math.floor(Math.random()*colors.length)];
             ctx.fillRect(0, y, W, Math.random()*7+3);
             ctx.restore();
         }

         requestAnimationFrame(draw);
     }

     requestAnimationFrame(draw);
 }

 // Konec inicializace
 
 // Uklidíme při odpojení komponenty
 return () => {
     if (cleanupCylinderScroll) cleanupCylinderScroll();
 };  
});





const SYNTHOMA_TEXT = "SYNTHOMA";
const GLITCH_CHARS = "!@#$%^&*_-+=/?\\|<>[]{};:~NYHSMT#¤%&@§÷×¤░▒▓█▄▀●◊O|/\\_^-~.*+";
const COLORS = ["#ff00ff", "#0ff", "#fff", "#faff00", "#ff2afd", "#00fff9"];

function createGlitchLayers(text) {
    return `
      <span class="glitch-fake1 glitch-span">${text}</span>
      <span class="glitch-fake2 glitch-span">${text}</span>
      <span class="glitch-real">${text.split('').map(c => c === ' ' ? ' ' : `<span class="glitch-char">${c}</span>`).join('')}</span>
    `;
}

// Náhodné per-znak glitchování (živý chaos)
function randomGlitchChar(orig) {
    if (Math.random() < 0.65) return orig;
    return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
}
function randomColor() {
    return COLORS[Math.floor(Math.random() * COLORS.length)];
}

function glitchCycle() {
    const root = document.getElementById('glitch-synthoma');
    if (!root) return;
    const spans = root.querySelectorAll('.glitch-char');
    for (let i = 0; i < spans.length; i++) {
        const orig = SYNTHOMA_TEXT[i];
        if (Math.random() < 0.19) {
            spans[i].textContent = randomGlitchChar(orig);
            spans[i].classList.add('glitchy');
            spans[i].style.color = randomColor();
            setTimeout(() => {
                spans[i].textContent = orig;
                spans[i].classList.remove('glitchy');
                spans[i].style.color = "#0ff";
            }, 85 + Math.random()*80);
        }
    }
    // Občas celé slovo ještě víc "rozstřel"
    if (Math.random() < 0.10) {
        root.querySelector('.glitch-real').style.filter = "blur(1.2px) brightness(1.15)";
        setTimeout(() => {
            root.querySelector('.glitch-real').style.filter = "";
        }, 110 + Math.random()*90);
    }
}

// Iniciační render
document.getElementById('glitch-synthoma').innerHTML = createGlitchLayers(SYNTHOMA_TEXT);

// Glitch cyklus
setInterval(glitchCycle, 120);




let currentAudio = null;


// ===== Funkce pro psaní textu s efektem psacího stroje a glitch efekty =====
function typewriterWrite(element, fullHTML, options = {}, onDone = null) {
    // --- Nastavení základních parametrů ---
    const playPattern = /^<play\s+([^\s>]+\.mp3)>/i;
    const speedMin = options.speedMin || 6;
    const speedMax = options.speedMax || 26;
    const paragraphPause = options.paragraphPause || 240;
    const glitchProbability = options.glitchProbability || 0.03; // 3% šance na glitch

    
    // Vymažeme všechny staré kurzory a glitch-taily
    element.querySelectorAll('.typewriter-cursor, .glitch-tail').forEach(c => c.remove());
    element.innerHTML = '<span class="typewriter-cursor">|<span class="glitch-tail"></span></span>';
    let i = 0;
    let openTags = [];
    let lastGlitchTime = 0;

    // Paleta barev pro glitchující ocas a efekty
    const glitchColors = ['#00fff9', '#ff00c8', '#faff00', '#fff', '#ff0040', '#00cc00', '#ff6600'];
    const glitchEffects = ['glitch-char', 'glitch-word'];

    // --- Funkce pro generování náhodných glitch znaků (pro ocas a efekty) ---
    function getGlitchTail() {
        const glitchSet = [
    '', 'N', 'Y', 'H', 'S', 'M', 'T','#', '¤', '%', '&', '@', '§', '÷', '×', '¤', '░', '▒', '▓', '█', '▄', '▀', '●', '◊', 'O', '|', '/', '\\', '_', '-', '^', '~', '.', '*', '+' ];
        const count = 5 + Math.floor(Math.random() * 5); // 5–10 znaků
        let result = '';
        for (let j = 0; j < count; j++) {
            result += glitchSet[Math.floor(Math.random() * glitchSet.length)];
        }
        return result;
    }

    
    // --- Funkce pro náhodné přidání glitch efektu k písmenu ---
    function maybeAddGlitch(char, isTag = false) {
        if (isTag || Math.random() > glitchProbability) return char;
        const now = Date.now();
        // Omezení frekvence glitchů
        if (now - lastGlitchTime < 300) return char;
        lastGlitchTime = now;
        
        // Vytvoříme unikátní ID pro každý glitch element
        const glitchId = 'glitch-' + Math.random().toString(36).substr(2, 9);
        const effect = glitchEffects[Math.floor(Math.random() * glitchEffects.length)];
        const color = glitchColors[Math.floor(Math.random() * glitchColors.length)];
        
        if (effect === 'glitch-char') {
            const glitchChar = `<span id="${glitchId}" class="glitch-char" style="color: ${color}">${char}</span>`;
            
            // Náhodná doba trvání glitche (300-1000ms)
            const duration = 300 + Math.random() * 700;
            
            // Po uplynutí času odstraníme glitch efekt
            setTimeout(() => {
                const element = document.getElementById(glitchId);
                if (element) {
                    // Zachováme obsah, ale odstraníme třídu a inline styly
                    element.outerHTML = char;
                }
            }, duration);
            
            return glitchChar;
        } else {
            return char;
        }
    }

    // --- Náhodná barva z palety ---
    function getRandomGlitchColor() {
        return glitchColors[Math.floor(Math.random() * glitchColors.length)];
    }

    // --- Vytvoří glitch tail (ocas) ---
    function createGlitchTail() {
        const tail = document.createElement('span');
        tail.className = 'glitch-tail';
        tail.textContent = getGlitchTail();
        // Náhodná barva a stín
        const color = getRandomGlitchColor();
        tail.style.color = color;
        tail.style.textShadow = `0 0 8px ${color}, 0 0 16px ${color}`;
        // Náhodná rotace a posun
        const rotation = Math.random() * 10 - 5;
        const xShift = Math.random() * 4 - 2;
        tail.style.transform = `rotate(${rotation}deg) translateX(${xShift}px)`;
        return tail;
    }

    // --- Vytvoří kurzor s ocasem ---
    function createCursor() {
        const cursor = document.createElement('span');
        cursor.className = 'typewriter-cursor';
        cursor.textContent = '|';
        // Glitch tail přidáme za kurzor
        const tail = createGlitchTail();
        cursor.appendChild(tail);
        return { cursor, tail };
    }

    // --- Aktualizuje kurzor na konci textu ---
    function updateCursor() {
        // Vymažeme staré kurzory a ocásky
        element.querySelectorAll('.typewriter-cursor, .glitch-tail').forEach(c => c.remove());
        // Nový kurzor
        const { cursor, tail } = createCursor();
        element.appendChild(cursor);
        // Náhodná velikost a průhlednost kurzoru
        cursor.style.fontSize = `${0.8 + Math.random() * 0.4}em`;
        cursor.style.opacity = 0.8 + Math.random() * 0.2;
        // Glitch ocas pravidelně mění znaky a barvy
        const glitchInterval = setInterval(() => {
            if (!tail || !tail.parentNode) {
                clearInterval(glitchInterval);
                return;
            }
            // 70% šance na změnu obsahu
            if (Math.random() > 0.3) {
                tail.textContent = getGlitchTail();
                // 30% šance na změnu barvy
                if (Math.random() > 0.7) {
                    const newColor = getRandomGlitchColor();
                    tail.style.color = newColor;
                    tail.style.textShadow = `0 0 8px ${newColor}, 0 0 16px ${newColor}`;
                }
                // 10% šance na krátký animovaný glitch
                if (Math.random() > 0.9) {
                    tail.style.animation = 'none';
                    tail.offsetHeight;
                    tail.style.animation = 'glitch 0.2s linear';
                }
            }
            // 20% šance na změnu pozice
            if (Math.random() > 0.8) {
                const rotation = Math.random() * 10 - 5;
                const xShift = Math.random() * 4 - 2;
                tail.style.transform = `rotate(${rotation}deg) translateX(${xShift}px)`;
            }
        }, 80 + Math.random() * 40);
        // Vrací funkci pro vyčištění intervalu
        return () => clearInterval(glitchInterval);
    }

    // --- Rekurzivní psaní po znacích (nebo HTML tagách) ---
    function writeNext() {

            element.querySelectorAll('.typewriter-cursor, .glitch-tail').forEach(c => c.remove());
        
            // === DETEKCE HUDEBNÍHO TAGU ===
            let rest = fullHTML.slice(i);
            let match = rest.match(playPattern);
            if (match) {
                let mp3file = match[1];
                // Zastav předchozí audio, pokud hraje
                if (currentAudio) { 
                    currentAudio.pause();
                    currentAudio.currentTime = 0;
                }
                // Spusť nové audio
                currentAudio = new Audio(mp3file);
                currentAudio.volume = 0.6;
                currentAudio.play();
                // Můžeš do textu vložit symbol hudby
                if (openTags.length) {
                    let targetTag = element.querySelectorAll(openTags[openTags.length-1]);
                    if (targetTag.length) {
                        targetTag[targetTag.length-1].insertAdjacentHTML('beforeend', "🎵");
                    } else {
                        element.innerHTML += "🎵";
                    }
                } else {
                    element.innerHTML += "🎵";
                }
                // Posuň i za značku <play ...mp3>
                i += match[0].length;
                updateCursor();
                setTimeout(writeNext, 900); // malá pauza pro efekt
                return;
            }
        // Vymažeme staré kurzory a ocásky
        element.querySelectorAll('.typewriter-cursor, .glitch-tail').forEach(c => c.remove());
        if (i < fullHTML.length) {
            if (fullHTML[i] === "<") {
                // Zpracování HTML tagu
                let end = fullHTML.indexOf(">", i);
                if (end === -1) end = fullHTML.length - 1;
                let tag = fullHTML.slice(i, end + 1);
                // Vložíme tag na správné místo (pokud je otevřený blok)
                if (openTags.length) {
                    let targetTag = element.querySelectorAll(openTags[openTags.length-1]);
                    if (targetTag.length) {
                        targetTag[targetTag.length-1].insertAdjacentHTML('beforeend', tag);
                    } else {
                        element.innerHTML += tag;
                    }
                } else {
                    element.innerHTML += tag;
                }
                // Správa otevřených tagů
                if (!tag.startsWith("</")) {
                    let tagNameMatch = tag.match(/^<([a-zA-Z0-9]+)/);
                    if (tagNameMatch) {
                        let tagName = tagNameMatch[1].toLowerCase();
                        // NEPŘIDÁVAT DO openTags samouzavírací tagy
                        const selfClosing = ['br', 'hr', 'img', 'input', 'meta', 'link', 'area', 'base', 'col', 'command', 'embed', 'keygen', 'param', 'source', 'track', 'wbr'];
                        if (!selfClosing.includes(tagName)) {
                            openTags.push(tagName);
                        }
                    }
                } else {
                    openTags.pop();
                }
                i = end + 1;
                updateCursor();
                // Speciální pauza po <br>, <p>, <div>, <hX>
                if (tag.toLowerCase().match(/^<(br|p|div|h[1-6])/)) {
                    setTimeout(writeNext, paragraphPause + Math.random() * 170);
                    return;
                }
                setTimeout(writeNext, speedMin);
                return;
            }
            // Zpracování znaku
            const char = fullHTML[i++];
            const isWhitespace = /\s/.test(char);
            let displayChar = char;
            // Náhodný glitch (ne na mezeru)
            if (!isWhitespace && char.length > 0) {
                displayChar = maybeAddGlitch(char);
            }
            // Vložíme znak do správného tagu (pokud máme otevřený)
            if (openTags.length) {
                let targetTag = element.querySelectorAll(openTags[openTags.length-1]);
                if (targetTag.length) {
                    targetTag[targetTag.length-1].insertAdjacentHTML('beforeend', displayChar);
                } else {
                    element.innerHTML += displayChar;
                }
            } else {
                element.innerHTML += displayChar;
            }
            // Kurzor na konci textu
            updateCursor();
            // Pauzy: delší po interpunkci, kratší po mezeře
            let delay = speedMin + Math.random() * (speedMax - speedMin);
            if (/[.,!?;:]$/.test(char)) {
                delay *= 3;
            } else if (char === ' ') {
                delay *= 0.7;
            }
            setTimeout(writeNext, delay);
        } else {
            // Dokončeno!
            element.classList.add('typing-done');
            element.querySelectorAll('.typewriter-cursor, .glitch-tail').forEach(c => c.remove());
            if (options.onCompleteEffect !== false) {
                element.classList.add('glitch-word');
                setTimeout(() => {
                    element.classList.remove('glitch-word');
                }, 1000);
            }
            if (onDone) onDone();
        }
    }

    // Spustí animaci kurzoru, potom začíná psaní
    const cleanupCursor = updateCursor();
    writeNext();
    // Vrací funkci pro stopnutí případné animace kurzoru
    return () => {
        if (cleanupCursor) cleanupCursor();
    };
}

// Upravená funkce pro načítání obsahu
function loadContent() {
    fetch('SYNTHOMANULL.html')
        .then(response => response.text())
        .then(html => {
            const reader = document.getElementById('SYNTHOMAREADER');
            
            // Vytvoříme kontejner pro tlačítko, který zůstane vždy viditelný
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'audio-controls';
            buttonContainer.style.margin = '20px 0';
            
            // Vytvoříme tlačítko přímo v DOMu
            const changeTrackBtn = document.createElement('button');
            changeTrackBtn.className = 'glitch-btn change-track-btn';
            changeTrackBtn.setAttribute('data-audio', 'audio/ambient.mp3');
            changeTrackBtn.textContent = '🎵 Změnit skladbu';
            
            // Přidáme tlačítko do kontejneru a kontejner do čtečky
            buttonContainer.appendChild(changeTrackBtn);
            reader.appendChild(buttonContainer);
            
            // Spustíme psaní zbytku textu
            typewriterWrite(reader, html, {}, () => {
                // Callback po dokončení psaní
            });
        });
}

// Spustíme načítání obsahu po načtení stránky
document.addEventListener('DOMContentLoaded', () => {
    // Načteme obsah
    loadContent();
});










const SYNTHOMA_VIDEOS = [
    "video/SYNTHOMA1.mp4",
    "video/SYNTHOMA2.mp4",
    "video/SYNTHOMA3.mp4",
    "video/SYNTHOMA4.mp4",
    "video/SYNTHOMA5.mp4",
    "video/SYNTHOMA6.mp4",
    "video/SYNTHOMA7.mp4",
    "video/SYNTHOMA8.mp4"
];
  
let currentVid = 0;
let isTransitioning = false;
let videoTimeout;
  
  // Náhodné video, které není aktuální
  function getRandomVideoIdx(excludeIdx) {
    if (SYNTHOMA_VIDEOS.length <= 1) return 0;
    let idx;
    do { 
      idx = Math.floor(Math.random() * SYNTHOMA_VIDEOS.length); 
    } while (idx === excludeIdx);
    return idx;
  }
  
  // Hladký přechod mezi videi s glitch efektem
  function glitchTransition(toIdx) {
    if (isTransitioning) return;
    isTransitioning = true;
    
    const vid1 = document.getElementById('bgvid1');
    const vid2 = document.getElementById('bgvid2');
    const glitch = document.getElementById('bgvid-glitch');
    
    const currentVideo = vid1.style.opacity === '1' ? vid1 : vid2;
    const nextVideo = currentVideo === vid1 ? vid2 : vid1;
    
    // Nastav nové video s 50% rychlostí
    nextVideo.src = SYNTHOMA_VIDEOS[toIdx];
    nextVideo.playbackRate = 0.5;
    nextVideo.defaultPlaybackRate = 0.5;
    nextVideo.load();
    
    // Počkej na načtení metadat videa
    nextVideo.onloadeddata = () => {
      // Spusť přehrávání
      nextVideo.play().then(() => {
        // Spusť glitch efekt
        glitch.style.animation = 'none';
        void glitch.offsetHeight; // Trigger reflow
        glitch.style.animation = '';
        
        // Plynulý přechod mezi videi
        nextVideo.style.opacity = '1';
        currentVideo.style.opacity = '0';
        
        // Reset stavu po dokončení přechodu
        setTimeout(() => {
          isTransitioning = false;
          currentVid = toIdx;
          // Naplánuj další přechod
          scheduleNextTransition();
        }, 1000);
      }).catch(e => {
        console.error('Chyba při přehrávání videa:', e);
        isTransitioning = false;
      });
    };
    
    nextVideo.onerror = () => {
      console.error('Chyba při načítání videa:', SYNTHOMA_VIDEOS[toIdx]);
      isTransitioning = false;
    };
  }
  
  // Naplánuj další přechod
  function scheduleNextTransition() {
    if (videoTimeout) clearTimeout(videoTimeout);
    const nextTime = 15000 + Math.random() * 15000; // 15-30 sekund
    videoTimeout = setTimeout(() => {
      const nextIdx = getRandomVideoIdx(currentVid);
      glitchTransition(nextIdx);
    }, nextTime);
  }
  
  // Inicializace po načtení stránky
  window.addEventListener('DOMContentLoaded', () => {
    const vid1 = document.getElementById('bgvid1');
    const vid2 = document.getElementById('bgvid2');
    
    // Nastartuj první video s 50% rychlostí
    vid1.src = SYNTHOMA_VIDEOS[0];
    vid1.playbackRate = 0.5; // 50% rychlosti
    vid1.defaultPlaybackRate = 0.5; // Pro jistotu i defaultní rychlost
    vid1.play().then(() => {
      vid1.style.opacity = '1';
      // Naplánuj první přechod
      scheduleNextTransition();
    });
    
    // Nastav 50% rychlost i pro druhé video
    vid2.playbackRate = 0.5;
    vid2.defaultPlaybackRate = 0.5;
    
    // Nastav náhodné přehrávání pro druhé video (pro plynulé přechody)
    vid2.loop = true;
    vid2.muted = true;
    
    // Při kliknutí na stránku přepne na další video (pro testování)
    document.addEventListener('click', () => {
      if (!isTransitioning) {
        const nextIdx = getRandomVideoIdx(currentVid);
        glitchTransition(nextIdx);
      }
    });
  });