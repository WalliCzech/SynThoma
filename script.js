function typewriterWrite(element, fullHTML, options = {}, onDone = null) {
    const speedMin = options.speedMin || 13;
    const speedMax = options.speedMax || 46;
    const paragraphPause = options.paragraphPause || 240;
    
    // Vymažeme všechny staré kurzory a glitch-taily, ať je klid na neonovém hřbitově 🪦
    element.querySelectorAll('.typewriter-cursor, .glitch-tail').forEach(c => c.remove());
    element.innerHTML = '<span class="typewriter-cursor">|<span class="glitch-tail"></span></span>';
    let i = 0;
    let openTags = [];

    // Paleta barev pro glitchující ocas – ať to svítí jako rozbitý CRT monitor! 🌈
    const glitchColors = ['#00fff9', '#ff00c8', '#faff00', '#fff', '#ff0040', '#00cc00', '#ff6600'];
    
    // Funkce pro generování náhodných glitch znaků
    function getGlitchTail() {
        const glitchSet = ['N', 'Y', 'H', 'S', 'M', 'T', '#', '¤', '%', '&', '@', '§', '÷', '×', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '●', '◊', '|', '/', '\\', '_', '-', '^', '~', '.', '*', '+'];
        const count = 5 + Math.floor(Math.random() * 5); // 5–10 znaků
        let result = '';
        for (let j = 0; j < count; j++) {
            result += glitchSet[Math.floor(Math.random() * glitchSet.length)];
        }
        return result;
    }

    function updateCursor() {
        // Všechny staré kurzory a glitch-taily do šrotu, žádné digitální zombie! 🔪
        element.querySelectorAll('.typewriter-cursor, .glitch-tail').forEach(c => c.remove());
        const cursor = document.createElement('span');
        cursor.className = 'typewriter-cursor';
        cursor.innerHTML = '|<span class="glitch-tail">' + getGlitchTail() + '</span>';
        element.appendChild(cursor);

        // Glitchující ocas, co hledá znaky i barvy jako šílený AI na Red Bullu 😵
        const glitchTail = cursor.querySelector('.glitch-tail');
        const glitchInterval = setInterval(() => {
            if (!glitchTail || !glitchTail.parentNode) {
                clearInterval(glitchInterval); // Zastav, pokud kurzor zmizí
                console.log('🛑 Glitch tail interval zrušen – kurzor je mrtvý!');
                return;
            }
            glitchTail.textContent = getGlitchTail();
            const newColor = glitchColors[Math.floor(Math.random() * glitchColors.length)];
            glitchTail.style.color = newColor;
            glitchTail.style.textShadow = `0 0 8px ${newColor}, 0 0 16px ${newColor}, 0 0 24px ${newColor}`;
            console.log(`🎨 Glitch tail barva: ${newColor}, font-size: ${getComputedStyle(glitchTail).fontSize}`); // Debug stylů
        }, 100); // Obnova každých 100ms pro pořádný chaos
    }

    function writeNext() {
        // Všechny staré kurzory a glitch-taily pryč, ať to není bordel jako kód z 90. let 🧹
        element.querySelectorAll('.typewriter-cursor, .glitch-tail').forEach(c => c.remove());

        if (i < fullHTML.length) {
            if (fullHTML[i] === "<") {
                let end = fullHTML.indexOf(">", i);
                let tag = fullHTML.slice(i, end + 1);
                element.innerHTML += tag;
                // Správa tagů, protože HTML je jako minové pole – špatný krok a bum! 💥
                if (!tag.startsWith("</")) {
                    let tagName = tag.match(/^<([a-zA-Z0-9]+)/);
                    if (tagName) openTags.push(tagName[1]);
                } else {
                    openTags.pop();
                }
                i = end + 1;
                updateCursor();
                // Pauza po <br>, protože i kód potřebuje odpočívat ☕
                if (tag.toLowerCase().startsWith('<br')) {
                    setTimeout(writeNext, paragraphPause + Math.random()*170);
                    return;
                }
                setTimeout(writeNext, speedMin);
                return;
            }
            // Vypisuj písmena s grácií, ne jako tiskárna na speedu 🖨️
            if (openTags.length) {
                let targetTag = element.querySelectorAll(openTags[openTags.length-1]);
                if (targetTag.length) {
                    targetTag[targetTag.length-1].innerHTML += fullHTML[i++];
                } else {
                    element.innerHTML += fullHTML[i++];
                }
            } else {
                element.innerHTML += fullHTML[i++];
            }
            updateCursor();
            // Debug: Zalogujeme font-size aktuálního elementu
            console.log(`✍️ Píšeme: font-size: ${getComputedStyle(element).fontSize}`);
            setTimeout(writeNext, speedMin + Math.random() * (speedMax-speedMin));
        } else {
            // Konec psaní, aplikujeme .typing-done a zkontrolujeme styly
            element.classList.add('typing-done');
            element.querySelectorAll('.typewriter-cursor, .glitch-tail').forEach(c => c.remove());
            if (onDone) onDone();
            console.log(`✅ Typewriter dokončil, font-size po dokončení: ${getComputedStyle(element).fontSize}`);
        }
    }
    writeNext();
}

function typewriterParagraphs(target, text, options = {}, onComplete = () => {}) {
    // Uložíme celý text pro případ, že bychom ho potřebovali zobrazit najednou
    target._fullText = text;
    
    const paragraphs = text
        .replace(/\r\n/g, '\n')    // Sjednoť řádky, ať to není digitální apokalypsa 🔥
        .split(/\n\s*\n/)          // Rozděl na odstavce, žádné halucinace
        .filter(p => p.trim() !== '');

    let idx = 0;
    function writeNextParagraph() {
        if (idx < paragraphs.length) {
            // Nový odstavec, čistý jako duše nově vytvořeného divu 🙏
            const p = document.createElement('p');
            target.appendChild(p);
            typewriterWrite(p, paragraphs[idx], options, () => {
                idx++;
                setTimeout(writeNextParagraph, 250); // Pauza, ať čtenář nekolabuje 😴
            });
        } else if (onDone) {
            onComplete();
        }
    }
    writeNextParagraph();
}

// Inicializace efektu válce při scrollování
function initCylinderScroll() {
    const container = document.querySelector('.scroll-container');
    const content = document.querySelector('.main-description');
    const track = document.querySelector('.scrollbar-track');
    const thumb = document.querySelector('.scrollbar-thumb');
    
    if (!container || !content || !track || !thumb) return null;
    
    let isDragging = false;
    let startY, scrollStartTop;
    let scrollTimeout;
    let isUserScrolling = false;
    
    // Nastavení velikosti posuvníku
    function updateScrollbar() {
        const containerHeight = container.clientHeight;
        const contentHeight = container.scrollHeight;
        const thumbHeight = Math.max((containerHeight / contentHeight) * 100, 20);
        
        thumb.style.height = `${thumbHeight}px`;
        updateThumbPosition();
    }
    
    // Aktualizace pozice posuvníku
    function updateThumbPosition() {
        const scrollPercentage = container.scrollTop / (container.scrollHeight - container.clientHeight);
        const trackHeight = track.clientHeight - thumb.clientHeight;
        const thumbTop = scrollPercentage * trackHeight;
        
        thumb.style.transform = `translateY(${thumbTop}px)`;
        
        // Aplikujeme efekt válce
        applyCylinderEffect(scrollPercentage);
    }
    
    // Efekt válce a rozpadu textu
    function applyCylinderEffect(scrollPercentage) {
        // Výpočet rotace na základě pozice scrollování
        const rotation = scrollPercentage * 15 - 7.5; // -7.5° až +7.5°
        const scale = 1 - (scrollPercentage * 0.05); // Velmi mírné zmenšení
        
        // Aplikujeme transformaci
        content.style.transform = `perspective(1000px) rotateX(${rotation}deg) scale(${scale})`;
        
        // Efekt rozpadu textu nahoře - intenzivnější a viditelnější
        const topGlitchIntensity = Math.min(scrollPercentage * 8, 1.5);
        if (topGlitchIntensity > 0.1) {
            content.classList.add('scrolling');
            
            // Vytvoříme výraznější glitch efekt
            const glitchX = (Math.random() - 0.5) * 15 * topGlitchIntensity;
            const glitchY = (Math.random() - 0.5) * 8 * topGlitchIntensity;
            const glitchOpacity = Math.min(0.7, topGlitchIntensity * 0.8);
            
            content.style.setProperty('--glitch-x', `${glitchX}px`);
            content.style.setProperty('--glitch-y', `${glitchY}px`);
            content.style.setProperty('--glitch-opacity', glitchOpacity);
            
            // Přidáme náhodné změny barev pro větší efekt
            const hueRotate = Math.sin(Date.now() * 0.01) * 60 * topGlitchIntensity;
            content.style.filter = `hue-rotate(${hueRotate}deg)`;
        } else {
            content.classList.remove('scrolling');
            content.style.filter = 'none';
        }
        
        // Resetujeme timer pro detekci konce scrollování
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            content.classList.remove('scrolling');
            content.style.filter = 'none';
        }, 200);
    }
    
    // Události myši pro přetahování posuvníku
    thumb.addEventListener('mousedown', (e) => {
        isDragging = true;
        startY = e.clientY;
        scrollStartTop = container.scrollTop;
        e.preventDefault();
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        const deltaY = e.clientY - startY;
        const trackHeight = track.clientHeight - thumb.clientHeight;
        const scrollRatio = (container.scrollHeight - container.clientHeight) / trackHeight;
        
        container.scrollTop = scrollStartTop + deltaY * scrollRatio;
    });
    
    document.addEventListener('mouseup', () => {
        isDragging = false;
    });
    
    // Kliknutí na track pro skok na danou pozici
    track.addEventListener('click', (e) => {
        const rect = track.getBoundingClientRect();
        const clickPosition = e.clientY - rect.top;
        const thumbHeight = thumb.clientHeight;
        const scrollRatio = (container.scrollHeight - container.clientHeight) / (rect.height - thumbHeight);
        
        container.scrollTop = (clickPosition - thumbHeight / 2) * scrollRatio;
    });
    
    // Scroll kontejneru
    container.addEventListener('scroll', () => {
        updateThumbPosition();
        
        // Zastavení automatického psaní, pokud uživatel scrolluje
        if (window.typewriterInterval && !isUserScrolling) {
            isUserScrolling = true;
            clearInterval(window.typewriterInterval);
            window.typewriterInterval = null;
            
            // Zobrazíme celý text, pokud uživatel scrolluje
            const target = document.getElementById('myGlitchText');
            if (target && target._fullText) {
                target.innerHTML = target._fullText;
            }
        }
    });
    
    // Detekce začátku scrollování myší
    container.addEventListener('mousedown', () => {
        isUserScrolling = true;
        if (window.typewriterInterval) {
            clearInterval(window.typewriterInterval);
            window.typewriterInterval = null;
        }
    });
    
    // Detekce dotykového scrollování
    container.addEventListener('touchstart', () => {
        isUserScrolling = true;
        if (window.typewriterInterval) {
            clearInterval(window.typewriterInterval);
            window.typewriterInterval = null;
        }
    }, { passive: true });
    
    // Inicializace
    updateScrollbar();
    
    // Přidání události pro změnu velikosti okna
    const resizeObserver = new ResizeObserver(updateScrollbar);
    resizeObserver.observe(container);
    
    // Vrátíme funkci pro čištění
    return () => {
        resizeObserver.disconnect();
        container.removeEventListener('scroll', updateThumbPosition);
    };
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('🎮 SYNTHOMA script initialized. System status: GLITCH_STABILIZED_RGB');
    
    // Inicializace efektu válce
    const cleanupCylinderScroll = initCylinderScroll();

    // Inicializace typewritter efektu
    const target = document.getElementById('myGlitchText');
    if (target) {
        const fullText = `
            <h5 class="glitch">LOG [WELCOME]:</h5>
            „Vstupuješ do SYNTHOMY. Nelekej se, pokud ti při čtení začne lehce škubat levé oko – je to běžný vedlejší efekt.“
            <h5 class="glitch">LOG [WHAT_IS_THIS]:</h5>
            „SYNTHOMA je kniha i svět. Glitch-noir příběh z temné digitální budoucnosti, kde se každý tvůj strach a každé trauma mění v datový log. Paměť je tu šelma. AI tě provede – se sarkasmem místo empatie. Všechno, co cítíš, se zálohuje. Tady je bezpečí jen iluze. Restart je rutina, chyba je součást cesty.“
            <h5 class="glitch">LOG [FOR_READERS]:</h5>
            „Tato kniha není manuál ke štěstí. Je to průvodce městem rozbitých emocí, kde hlavní hrdina NULL je sběratel cizích chyb – a jeho parťák je ironická AI. Humor je černý, atmosféra temná, a většina vtipů bolí ještě minutu po přečtení.“
            <h5 class="glitch">LOG [WARNING]:</h5>
            „Varování: SYNTHOMA analyzuje i vaše selhání. Pokud se vám něco bude zdát povědomé, je to tím, že v tom nejste sami. Čtení může způsobit mírnou existenciální krizi, smích přes slzy a nutkání restartovat vlastní život.“
            <h5 class="glitch">LOG [SUMMARY]:</h5>
            „SYNTHOMA – NULL je cyberpunková kniha o terapii, vině a touze po smyslu ve světě, kde všechno důležité někdo zalogoval a pak zapomněl heslo.“
            <h5 class="glitch">LOG [HELP]:</h5>
            „Potíže s existencí? Klidně pokračuj ve čtení. Systém tě v tom nenechá samotného. Přinejhorším dostaneš vtipnou poznámku od AI."
            <a href="kniha.html" class="button-simple" style="cursor: pointer;">Klikni pro vlastní restart</a>
        `;

        target.innerHTML = ''; // Vyprázdníme cílový element
        typewriterParagraphs(target, fullText.trim(), {
            speedMin: 13,
            speedMax: 46,
            paragraphPause: 240
        }, () => {
            if (typeof gentleGlitchify === 'function') {
                gentleGlitchify(target, {
                    delayMin: 1400,
                    delayMax: 2900,
                    glitchDuration: 90,
                    glitchChance: 0.07
                });
            }
        });
    } else {
        console.warn('⚠️ Element s ID myGlitchText nebyl nalezen');
    }

    // Inicializace glitch efektu pro .glitch elementy
    document.querySelectorAll('.glitch').forEach(el => {
        const originalText = el.textContent;
        el.textContent = ''; // Vyčisti původní text

        // Rozbij text na spany
        [...originalText].forEach(char => {
            const span = document.createElement('span');
            span.textContent = char;
            span.classList.add('glitch-char');
            el.appendChild(span);
        });

        const spans = el.querySelectorAll('.glitch-char');
        setInterval(() => {
            spans.forEach((span, idx) => {
                if (span.textContent.trim() && Math.random() < 0.08) {
                    // Malý glitch na jednotlivé písmeno
                    span.textContent = getGlitchChar(span.dataset.original || span.textContent);
                    span.classList.add('glitchy');
                    setTimeout(() => {
                        span.textContent = span.dataset.original || originalText[idx];
                        span.classList.remove('glitchy');
                    }, 10 + Math.random() * 60);
                }
            });
        }, 60);

        // Ulož originál do datasetu (pro správné vracení)
        spans.forEach((span, i) => {
            span.dataset.original = originalText[i];
        });

        // Někdy extra efekt na celý element
        setInterval(() => {
            if (Math.random() > 0.985) {
                el.classList.add('glitch-quick');
                setTimeout(() => el.classList.remove('glitch-quick'), 120 + Math.random() * 140);
            }
        }, 1850);
    });

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
    }
);

function getGlitchChar(char) {
    const glitchSet = ['', 'N', 'Y', 'H', 'S', 'M', 'T','#', '¤', '%', '&', '@', '§', '÷', '×', '¤', '░', '▒', '▓', '█', '▄', '▀', '●', '◊', 'O', '|', '/', '\\', '_', '-', '^', '~', '.', '*', '+'];
    if (Math.random() < 0.95) {
        return glitchSet[Math.floor(Math.random() * glitchSet.length)];
    }
    return char;
}

function gentleGlitchify(element, options = {}) {
    const delayMin = options.delayMin || 1500;
    const delayMax = options.delayMax || 3500;
    const glitchDuration = options.glitchDuration || 80;
    const glitchChance = options.glitchChance || 0.08;

    // Najdi všechny textové uzly (rekurzivně!)
    function getTextNodes(node) {
        let textNodes = [];
        if (node.nodeType === 3) { // text node
            textNodes.push(node);
        } else if (node.nodeType === 1 && node.childNodes) {
            node.childNodes.forEach(child => textNodes = textNodes.concat(getTextNodes(child)));
        }
        return textNodes;
    }

    const textNodes = getTextNodes(element);

    // Rozděl všechny textové uzly na spany, pokud už nejsou!
    textNodes.forEach(node => {
        const parent = node.parentNode;
        const fragment = document.createDocumentFragment();
        const chars = node.textContent.split('');
        chars.forEach(char => {
            const span = document.createElement('span');
            if (char === ' ') span.innerHTML = ' ';
            else span.textContent = char;
            span.classList.add('glitch-char');
            span.dataset.original = char;
            fragment.appendChild(span);
        });
        parent.replaceChild(fragment, node);
    });

    // Teď všechny .glitch-char uvnitř elementu
    const chars = element.querySelectorAll('.glitch-char');

    function randomGlitch() {
        let num = 1 + Math.floor(Math.random() * 2);
        for (let i = 0; i < num; i++) {
            let idx, guard = 0;
            do {
                idx = Math.floor(Math.random() * chars.length);
                guard++;
                if (guard > 10) break;
            } while (
                chars[idx].textContent === ' ' ||
                chars[idx].classList.contains('glitchy')
            );
            const span = chars[idx];
            if (Math.random() < glitchChance) {
                const orig = span.dataset.original;
                span.textContent = getGlitchChar(orig);
                span.classList.add('glitchy');
                setTimeout(() => {
                    span.textContent = orig;
                    span.classList.remove('glitchy');
                }, glitchDuration + Math.random()*glitchDuration);
            }
        }
        const next = delayMin + Math.random() * (delayMax - delayMin);
        setTimeout(randomGlitch, next);
    }
    randomGlitch();
}

function getGentleGlitchChar(char) {
    const safe = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    if (safe.includes(char)) {
        return safe[Math.floor(Math.random() * safe.length)];
    } else {
        const glitchSet = ['¤', '*', '#', '@', '&', '/', '_', '|', '-', '~', '.', '+'];
        return glitchSet[Math.floor(Math.random() * glitchSet.length)];
    }
}