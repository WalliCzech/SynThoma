// Funkce pro detekci změny měřítka (zoom)
function handleZoom() {
    const viewport = document.querySelector('meta[name=viewport]');
    const scale = window.visualViewport.scale;
    
    // Pokud je zoom větší než 1, upravíme viewport pro lepší čitelnost
    if (scale > 1) {
        document.documentElement.style.overflowX = 'auto';
        document.body.style.overflowX = 'auto';
        document.body.style.touchAction = 'pan-x pan-y pinch-zoom';
        
        // Zvýšíme základní velikost písma pro lepší čitelnost při zoomu
        const baseFontSize = Math.max(16, 16 * scale * 0.8);
        document.documentElement.style.setProperty('--mobile-font-size', `${baseFontSize}px`);
    } else {
        // Vrátíme výchozí hodnoty
        document.documentElement.style.overflowX = 'hidden';
        document.body.style.overflowX = 'hidden';
        document.documentElement.style.setProperty('--mobile-font-size', '1rem');
    }
    
    console.log(`🔍 Zoom detekován: ${Math.round(scale * 100)}%. Oči už tě pálí, nebo ještě vydržíš? 😆`);
}

// Inicializace event listenerů pro zoom
function initZoomHandlers() {
    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', handleZoom);
        window.visualViewport.addEventListener('scroll', handleZoom);
    }
    
    // Přidáme třídu pro detekci touch zařízení
    if ('ontouchstart' in window || navigator.maxTouchPoints) {
        document.documentElement.classList.add('touch-device');
        console.log('📱 Detekován touch. Prsty připravené na glitchovou jízdu?');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('🎮 SYNTHOMA script initialized. System status: GLITCH_STABILIZED_RGB... nebo možná jen přetížený neon! 😎');
    initZoomHandlers();
    
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

// ===== POPUP FUNCTIONALITY =====
// Inicializace popupů po načtení DOM
function initPopups() {
    // Najdeme všechny elementy s třídou popup-tip
    const popupTips = document.querySelectorAll('.popup-tip');
    
    // Přidáme event listenery pro každý popup
    popupTips.forEach(tip => {
        const shortText = tip.getAttribute('data-short');
        const longText = tip.getAttribute('data-long');
        
        if (!shortText || !longText) return; // Přeskočíme, pokud chybí data
        
        // Vytvoříme element pro krátký popup (tooltip)
        const shortPopup = document.createElement('div');
        shortPopup.className = 'popup-short';
        shortPopup.textContent = shortText;
        tip.appendChild(shortPopup);
        
        // Vytvoříme element pro dlouhý popup
        const longPopup = document.createElement('div');
        longPopup.className = 'popup-long';
        longPopup.innerHTML = `
            <div class="popup-long-close">&times;</div>
            <div class="popup-content">${longText}</div>
        `;
        document.body.appendChild(longPopup);
        
        // Zobrazíme krátký popup při najetí myší
        tip.addEventListener('mouseenter', () => {
            shortPopup.style.display = 'block';
        });
        
        // Skryjeme krátký popup při odjetí myši
        tip.addEventListener('mouseleave', () => {
            shortPopup.style.display = 'none';
        });
        
        // Kliknutí na text zobrazí dlouhý popup
        tip.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Zavřeme všechny ostatní popupy
            document.querySelectorAll('.popup-long').forEach(popup => {
                popup.style.display = 'none';
            });
            
            // Zobrazíme aktuální popup
            longPopup.style.display = 'block';
            document.body.style.overflow = 'hidden'; // Zablokujeme scrollování stránky
        });
        
        // Kliknutí na křížek zavře popup
        const closeBtn = longPopup.querySelector('.popup-long-close');
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            longPopup.style.display = 'none';
            document.body.style.overflow = 'auto'; // Obnovíme scrollování stránky
        });
        
        // Kliknutí mimo popup ho také zavře
        longPopup.addEventListener('click', (e) => {
            if (e.target === longPopup) {
                longPopup.style.display = 'none';
                document.body.style.overflow = 'auto'; // Obnovíme scrollování stránky
            }
        });
    });
    
    console.log('🎯 Popup systém aktivován. Klikni na zvýrazněný text pro více informací!');
}

// Spustíme inicializaci popupů a textového šumu po načtení stránky
document.addEventListener('DOMContentLoaded', () => {
    initPopups();
    startTextNoise('.noisy-text', 0.45, 30);
});
 
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




// Funkce pro glitchování jednoho slova
function startGlitchWord(selector = '.glitch-word2', interval = 50, intensity = 0.27, duration = 110) {
    document.querySelectorAll(selector).forEach(el => {
        const origText = el.getAttribute('data-text') || el.textContent;
        el.textContent = origText;

        setInterval(() => {
            // Pro každý frame vyměň některé znaky za glitch znaky
            let glitched = '';
            for (let i = 0; i < origText.length; i++) {
                if (Math.random() < intensity && origText[i] !== ' ') {
                    glitched += GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
                } else {
                    glitched += origText[i];
                }
            }
            el.textContent = glitched;

            // Po krátké chvíli vrať zpět originál
            setTimeout(() => {
                el.textContent = origText;
            }, duration + Math.random() * 70);
        }, interval + Math.random() * 40);
    });
}

// Spustíme na všech .glitch-word
startGlitchWord('.glitch-word2', 72, 0.31, 90);





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
        const glitchSet = ['N', 'Y', 'H', 'S', 'M', 'T','#', '¤', '%', '&', '@', '§', '÷', '×', '¤', '░', '▒', '▓', '█', '▄', '▀', '●', '◊', 'O', '|', '/', '\\', '_', '-', '^', '~', '.', '*', '+'];
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
        // Upravíme styl kurzoru, aby byl na stejném řádku
        cursor.style.display = 'inline';
        cursor.style.position = 'relative';
        cursor.style.top = '0';
        cursor.style.verticalAlign = 'baseline';
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
            // Dokončeno! Zachováme styly a přidáme finální efekt
            element.classList.add('typing-done');
            element.querySelectorAll('.typewriter-cursor, .glitch-tail').forEach(c => c.remove());
            // Zajistíme, že barva a efekty zůstanou
            element.style.color = '#0ff';
            element.style.textShadow = '0 0 5px #0ff, 0 0 10px #ff00ff';
            if (options.onCompleteEffect !== false) {
                element.classList.add('glitch-word');
                setTimeout(() => {
                    element.classList.remove('glitch-word');
                    // Udržíme barvu a stín i po efektu
                    element.style.color = '#0ff';
                    element.style.textShadow = '0 0 5px #0ff, 0 0 10px #ff00ff';
                }, 1000);
            }
            if (onDone) onDone();
            console.log('📜 Text dopisován. SYNTHOMAREADER žije v neonové slávě! 😎');
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

// Upravená funkce pro načítání obsahu podle aktuální stránky
function loadContent() {
    // Zjistíme, na jaké stránce jsme
    const isIndexPage = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/');
    const isKnihaPage = window.location.pathname.endsWith('kniha.html');
    const isAutorPage = window.location.pathname.endsWith('autor.html');
    
    // Vybereme soubor k načtení podle stránky
    const fileToLoad = isIndexPage ? 'SYNTHOMAINFO.html' : 
                       isKnihaPage ? 'SYNTHOMANULL.html' : isAutorPage ? 'SYNTHOMAAUTOR.html' : 'SYNTHOMANULL.html';

    
    console.log(`🔍 Načítám obsah z: ${fileToLoad}. Doufám, že to není jen další glitch v matrixu... 😏`);
    
    fetch(fileToLoad)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}. Server asi zrovna pije kyberkávu. ☕`);
            }
            return response.text();
        })
        .then(html => {
            const reader = document.getElementById('SYNTHOMAREADER');
            if (!reader) {
                console.error('❌ Element SYNTHOMAREADER nebyl nalezen! Kde se ta čtečka schovává? 😤');
                return;
            }
            
            // Vyčistíme obsah čtečky
            reader.innerHTML = '';
            
            // Vytvoříme kontejner pro tlačítko, který zůstane vždy viditelný
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'audio-controls';
            buttonContainer.style.margin = '20px 0';
            
            // Vytvoříme tlačítko přímo v DOMu
            const changeTrackBtn = document.createElement('button');
            changeTrackBtn.className = 'glitch-btn change-track-btn';
            changeTrackBtn.setAttribute('data-audio', 'audio/SynthBachmoff-main.mp3');
            changeTrackBtn.textContent = '🎵 Změnit skladbu';
            
            // Přidáme tlačítko do kontejneru a kontejner do čtečky
            buttonContainer.appendChild(changeTrackBtn);
            reader.appendChild(buttonContainer);
            
            // Spustíme psaní zbytku textu
            typewriterWrite(reader, html, {}, () => {
                startGlitchWord('.glitch-word2', 75, 0.29, 80);
                console.log('✅ Obsah úspěšně načten a zobrazen. Neon svítí, svět se točí! 🌌');
            });
        })
        .catch(error => {
            console.error('❌ Chyba při načítání obsahu:', error, 'Zkus to znovu, nebo to zabalíme. 😣');
            const reader = document.getElementById('SYNTHOMAREADER');
            if (reader) {
                reader.innerHTML = '<div class="error">Chyba při načítání obsahu. Zkuste obnovit stránku, nebo si dejte kyberpivo. 🍺</div>';
            }
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
    "video/SYNTHOMA8.mp4",
    "video/SYNTHOMA9.mp4",
    "video/SYNTHOMA10.mp4"
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
            }, 100);
        }).catch(e => {
            console.error('Chyba při přehrávání videa:', e, 'Video se zaseklo, asi má kocovinu. 😵');
            isTransitioning = false;
        });
    };
    
    nextVideo.onerror = () => {
        console.error('Chyba při načítání videa:', SYNTHOMA_VIDEOS[toIdx], 'Tohle video je asi na dark webu. 🌚');
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
        console.log('🎥 Video běží. Připrav se na kyberpunkový trip! 🚀');
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
            console.log('🖱️ Klik! Přepínám video, ať se to hýbe! 😜');
        }
    });
});



document.addEventListener('DOMContentLoaded', function() {
    const glitchName = document.getElementById('glitch-name');
    
    // Kontrola, zda element existuje
    if (glitchName) {
        const originalText = glitchName.textContent;
        const chars = '!@#$%^&*()_+-=[]{}|;:,.<>?/░▒▓█▄▀●◊';
        
        function getRandomChar() {
            return chars[Math.floor(Math.random() * chars.length)];
        }
        
        function glitch() {
            const text = originalText.split('');
            // Náhodně vybereme 1-2 znaky k nahrazení
            const indices = [];
            const numGlitches = 1 + Math.floor(Math.random() * 2);
            
            while (indices.length < numGlitches) {
                const idx = Math.floor(Math.random() * text.length);
                if (text[idx] !== ' ' && text[idx] !== '\n') {
                    indices.push(idx);
                }
            }
            
            indices.forEach(idx => {
                text[idx] = getRandomChar();
            });
            
            glitchName.textContent = text.join('');
            
            // Náhodné zpoždění pro další glitch efekt
            const delay = 50 + Math.random() * 150; // 50-200ms
            setTimeout(() => {
                if (glitchName) { // Kontrola znovu, pro jistotu
                    glitchName.textContent = originalText;
                    setTimeout(glitch, 50 + Math.random() * 200);
                }
            }, delay);
        }
        
        // Spustíme glitch efekt s malým zpožděním po načtení stránky
        setTimeout(glitch, 1000);
    } else {
        console.log("Element 'glitch-name' nebyl nalezen. Přeskočeno nastavení glitch efektu.");
    }
});




// Inicializace popupů po načtení stránky
document.addEventListener('DOMContentLoaded', () => {
    // Krátký hover popisek
    document.body.addEventListener('mouseenter', function(e) {
        if (e.target.classList.contains('popup-tip')) {
            let tip = e.target;
            // Pokud už má popisek, neřešíme
            if (tip.querySelector('.popup-short')) return;
            let short = tip.getAttribute('data-short');
            if (short) {
                let el = document.createElement('span');
                el.className = 'popup-short';
                el.textContent = short;
                tip.appendChild(el);
               
                
                
            // --- OCHRANA PROTI PŘESAHU ---
            setTimeout(() => {
                let rect = el.getBoundingClientRect();
                let parentRect = tip.parentElement.getBoundingClientRect();
                let rightOverflow = (rect.right - window.innerWidth);
                if (rightOverflow > 0) {
                    el.style.left = `-${rightOverflow + 8}px`;
                }
                let leftOverflow = (rect.left);
                if (leftOverflow < 0) {
                    el.style.left = `${8 - leftOverflow}px`;
                }
            }, 10);
            }
        }
    }, true);

    // Skryjeme tooltip při odjetí myši
    document.body.addEventListener('mouseleave', function(e) {
        if (e.target.classList.contains('popup-tip')) {
            let tip = e.target;
            let short = tip.querySelector('.popup-short');
            if (short) short.remove();
        }
    }, true);

    // Kliknutí – zobrazí velký detailní popup
    document.body.addEventListener('click', function(e) {
        // Zavřít popup kliknutím na křížek
        if (e.target.classList.contains('popup-long-close')) {
            let pop = document.querySelector('.popup-long');
            if (pop) {
                pop.remove();
                document.body.style.overflow = 'auto'; // Obnovíme scrollování
            }
            return;
        }
        
        // Zavřít popup kliknutím mimo obsah
        if (e.target.classList.contains('popup-long')) {
            let pop = document.querySelector('.popup-long');
            if (pop) {
                pop.remove();
                document.body.style.overflow = 'auto'; // Obnovíme scrollování
            }
            return;
        }
        
        // Otevřít popup při kliknutí na .popup-tip
        if (e.target.classList.contains('popup-tip')) {
            e.preventDefault();
            e.stopPropagation();
            
            let tip = e.target;
            let long = tip.getAttribute('data-long');
            if (long) {
                // Zavřeme případný otevřený popup
                let existingPopup = document.querySelector('.popup-long');
                if (existingPopup) existingPopup.remove();
                
                // Zobrazíme nový popup
                showLongPopup(long);
            }
        }
    });
    
    console.log('🎯 Popup systém aktivován. Klikni na zvýrazněný text pro více informací!');
});

// Funkce na vykreslení velkého popupu
function showLongPopup(text) {
    // Vytvoříme overlay pro ztmavení pozadí
    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay';
    
    // Vytvoříme obsah popupu
    const popup = document.createElement('div');
    popup.className = 'popup-long';
    popup.innerHTML = `
        <div class="popup-content">
            <button class="popup-long-close" aria-label="Zavřít">&times;</button>
            <div class="popup-text">${text}</div>
        </div>
    `;
    
    // Přidáme popup do stránky
    document.body.appendChild(overlay);
    document.body.appendChild(popup);
    
    // Zablokujeme scrollování stránky
    document.body.style.overflow = 'hidden';
    
    // Přidáme event listener pro klávesu ESC
    const closePopup = () => {
        popup.remove();
        overlay.remove();
        document.body.style.overflow = 'auto';
        document.removeEventListener('keydown', handleEsc);
    };
    
    const handleEsc = (e) => {
        if (e.key === 'Escape') {
            closePopup();
        }
    };
    
    // Přidáme event listener pro kliknutí na overlay
    overlay.addEventListener('click', closePopup);
    
    // Přidáme event listener pro tlačítko zavřít
    const closeBtn = popup.querySelector('.popup-long-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closePopup();
        });
    }
    
    // Přidáme event listener pro klávesu ESC
    document.addEventListener('keydown', handleEsc);
    
    // Zajistíme, aby se popup zobrazil správně
    setTimeout(() => {
        popup.style.opacity = '1';
        popup.style.transform = 'translate(-50%, -50%) scale(1)';
    }, 10);
    
    // Vrátíme referenci na popup pro případné další úpravy
    return popup;
}


function startTextNoise(selector = '.noisy-text', intensity = 0.33, interval = 41) {
    document.querySelectorAll(selector).forEach(el => {
        // Uložíme původní HTML obsah
        const originalHTML = el.innerHTML;
        
        // Rozdělíme obsah na slova a mezery, abychom je mohli správně zpracovat
        const wordsAndSpaces = originalHTML.split(/(\s+)/);
        
        // Vyčistíme obsah elementu
        el.innerHTML = '';
        
        // Projdeme všechna slova a mezery
        wordsAndSpaces.forEach(item => {
            if (item.trim() === '') {
                // Zachováme původní mezery
                el.appendChild(document.createTextNode(' '));
                return;
            }
            
            // Pro každé slovo vytvoříme span, který bude obsahovat jednotlivá písmena
            const wordSpan = document.createElement('span');
            wordSpan.className = 'noisy-word';
            wordSpan.style.whiteSpace = 'nowrap'; // Zajistíme, že se slovo nerozbije
            
            // Rozdělíme slovo na písmena
            for (let i = 0; i < item.length; i++) {
                const char = item[i];
                const charSpan = document.createElement('span');
                charSpan.className = 'noisy-char';
                charSpan.textContent = char;
                wordSpan.appendChild(charSpan);
            }
            
            el.appendChild(wordSpan);
        });
        
        // Aplikujeme šum na písmena
        setInterval(() => {
            el.querySelectorAll('.noisy-char').forEach(char => {
                if (Math.random() < intensity) {
                    char.style.color = Math.random() > 0.5 ? '#eee' : '#888';
                    char.style.opacity = 0.7 + Math.random() * 0.3;
                } else {
                    char.style.color = '#dcdcdc';
                    char.style.opacity = '1';
                }
            });
        }, interval);
    });
}
document.addEventListener('DOMContentLoaded', () => {
    startTextNoise('.noisy-text', 0.45, 30);
});


