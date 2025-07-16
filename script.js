function typewriterWrite(element, fullHTML, options = {}, onDone = null) {
    const speedMin = options.speedMin || 13;
    const speedMax = options.speedMax || 46;
    const paragraphPause = options.paragraphPause || 240;
    element.innerHTML = '<span class="typewriter-cursor">|</span>';
    let i = 0;
    let openTags = [];

    function updateCursor() {
        // Najdi kurzor, přesun ho na konec
        const c = element.querySelector('.typewriter-cursor');
        if (c) element.appendChild(c);
    }

    function writeNext() {
        // Odeber kurzor
        const cursor = element.querySelector('.typewriter-cursor');
        if (cursor) cursor.remove();

        if (i < fullHTML.length) {
            if (fullHTML[i] === "<") {
                let end = fullHTML.indexOf(">", i);
                let tag = fullHTML.slice(i, end + 1);
                element.innerHTML += tag;
                // Správa otevřených tagů
                if (!tag.startsWith("</")) {
                    let tagName = tag.match(/^<([a-zA-Z0-9]+)/);
                    if (tagName) openTags.push(tagName[1]);
                } else {
                    openTags.pop();
                }
                i = end + 1;
                element.innerHTML += '<span class="typewriter-cursor">|</span>';
                updateCursor();
                // Pauza po <br>
                if (tag.toLowerCase().startsWith('<br')) {
                    setTimeout(writeNext, paragraphPause + Math.random()*170);
                    return;
                }
                setTimeout(writeNext, speedMin);
                return;
            }
            // Vypisuj písmena i s kurzorem
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
            element.innerHTML += '<span class="typewriter-cursor">|</span>';
            updateCursor();
            setTimeout(writeNext, speedMin + Math.random() * (speedMax-speedMin));
        } else {
            // Na konci: odeber kurzor, nebo ho nech blikat jak chceš
            if (cursor) cursor.remove();
            if (onDone) onDone();
        }
    }
    writeNext();
}



function typewriterParagraphs(element, text, options = {}, onDone = null) {
    const paragraphs = text
        .replace(/\r\n/g, '\n')    // sjednotí formát řádků
        .split(/\n\s*\n/)          // rozdělí podle prázdné řádky (více mezer nebo \n)
        .filter(p => p.trim() !== '');

    let idx = 0;
    function writeNextParagraph() {
        if (idx < paragraphs.length) {
            // Vytvoř a přidej nový odstavec
            const p = document.createElement('p');
            element.appendChild(p);
            // Písmenko po písmenku – stejný efekt jako předtím:
            typewriterWrite(p, paragraphs[idx], options, () => {
                idx++;
                setTimeout(writeNextParagraph, 250); // Pauza mezi odstavci
            });
        } else if (onDone) {
            onDone();
        }
    }
    writeNextParagraph();
}


// Inicializace po načtení stránky
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎮 SYNTHOMA script initialized. System status: GLITCH_ACTIVE');

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

    // Inicializace typewritter efektu
    const fullText = `
    Digitální glitch-noir na pomezí knihy, sebezpytné simulace a hledání sebe sama.
    Světa, kde je identita paměťová chyba, démoni mají jména a systém tě přinutí přepsat sám sebe.
   
    Je to svět fragmentů manifestů, surové logy, rozbité dialogy i kapky ironie v pixelovém dešti.
   
    Procházej kapitoly, ztrácej se v archivu, nebo prostě jen glitchuj do rytmu sarkasmu.
   
    Tohle není pro slabé povahy. Jen pro ty, kdo chtějí vidět vlastní log a nezhroutit se při bluescreenu.
   
    Začni číst, anebo se rovnou...
  
    SYNTHOMA je otevřená, systém nestabilní, exit port neexistuje.

    LOG [SYSTEM]:

    <a href="kniha.html" class="button-simple" style="cursor: pointer;">Klikni pro vlastní restart</a>
      
    `;
    
    const target = document.getElementById('myGlitchText');
    target.innerHTML = ''; // Prázdné
    typewriterParagraphs(target, fullText, {
            speedMin: 13,
            speedMax: 46,
            paragraphPause: 240
        }, () => {
            gentleGlitchify(target, {
                delayMin: 1400,
                delayMax: 2900,
                glitchDuration: 90,
                glitchChance: 0.07
            });
        });
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
    chars.forEach(char => {
        const span = document.createElement('span');
        if (char === ' ') span.innerHTML = '&nbsp;';
        else span.textContent = char;
        span.classList.add('glitch-char');
        span.dataset.original = char;
        fragment.appendChild(span);
    });
    element.appendChild(fragment);

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
                span.textContent = getGentleGlitchChar(orig);
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
