/**
 * wAllICzech Studio - Hlavní JavaScriptový soubor
 * 
 * Tento soubor je tvůj neonový pas do Matrixu! 🖥️ Karty teď sedí vedle loga
 * a střídají se jako reklamy na kyberpunkovém billboardu. 😎
 */

// ===========================================
// KONFIGURACE TÉMAT
// ===========================================
if (typeof themeColors === 'undefined') {
    console.error('❌ Téma nebylo načteno! Zkontroluj, jestli je themeColors.js načtený, nebo Matrix zhasne! 😱');
}

/**
 * Seznam dostupných témat – vyber si svůj jed! 🐍
 * @type {string[]}
 */
const styleThemes = [
    'default', 'cyberWeed', 'cyberPink', 'cyberBlue', 'cyberOrange', 'cyberPurple', 'neonGrave', 'bloodRust',
    'toxicSlime', 'midnightOil', 'glitchRed', 'voidPurple', 'acidLemon', 'burntChrome', 'frostByte', 'plasmaPulse',
    'shadowLime', 'crimsonGlitch', 'electricAbyss', 'venomGreen', 'obsidianGlow', 'hellfireOrange', 'neonViper',
    'darkSakura', 'ghostCircuit', 'moltenCore', 'cyberAsh', 'toxicFuchsia', 'steelFrost', 'neonBlood', 'voidCyan',
    'radioactiveMint', 'duskEmber', 'cyberCrimson', 'phantomGreen', 'twilightNeon'
];

// ===========================================
// LOGOVACÍ KONZOLE
// ===========================================
/**
 * Pole pro ukládání zpráv konzole – jako logy z hacknutého serveru 🖥️
 * @type {string[]}
 */
const logMessages = [];

// Uložení původních metod konzole
const originalConsole = {
    log: console.log.bind(console),
    error: console.error.bind(console)
};

/**
 * Přepisuje console.log a console.error, aby to svítilo v UI jako neon! 😎
 */
function overrideConsole() {
    if (typeof console === 'undefined') {
        originalConsole.error('❌ Konzole není dostupná! Matrix je v háji! 😵');
        return;
    }

    console.log = function(...args) {
        try {
            const message = args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            ).join(' ');
            logMessages.push({ text: message, type: 'log' });
            updateConsoleDisplay();
            originalConsole.log(...args);
        } catch (e) {
            originalConsole.error('💥 Chyba v console.log: ', e);
        }
    };

    console.error = function(...args) {
        try {
            const message = args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            ).join(' ');
            logMessages.push({ text: message, type: 'error' });
            updateConsoleDisplay();
            originalConsole.error(...args);
        } catch (e) {
            originalConsole.error('💥 Chyba v console.error: ', e);
        }
    };

    originalConsole.log('✅ Konzole přepsána, připrav se na neonový výstup! 😎');
}

/**
 * Aktualizuje konzoli na stránce – ať to vypadá jako terminál z Matrixu! 📺
 * @returns {void}
 */
function updateConsoleDisplay() {
    const messagesContainer = document.getElementById('log-messages');
    if (!messagesContainer) {
        originalConsole.error('❌ Kontejner log-messages nenalezen! Zkontroluj HTML! 🌋');
        return;
    }

    while (logMessages.length > 7) {
        logMessages.shift();
    }

    messagesContainer.innerHTML = logMessages
        .map(msg => `<div class="log-console__message${msg.type === 'error' ? ' log-console__message--error' : ''}">${msg.text}</div>`)
        .join('');

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/**
 * Úvodní zpráva konzole – jako bys nabootoval AI z budoucnosti! 🤖
 */
const initialConsoleMessage = `
🌐 <span class="text-orange-400">wAllICzech Studio Console</span> initialized...
🤖 <span class="text-pink-400">Vallia AI</span> booted successfully.
📦 Modules loaded: [ Vision | Speech | Face | Style | Reality Bender ]
🔒 Access Level: <span class="text-red-500">Uživatel</span>
💬 Type "help" to see available commands.
> Awaiting your command, Uživateli... 😏
`;

/**
 * Inicializuje přepínání konzole – otevře portál do kyberprostoru! 🌌
 * @returns {void}
 */
function initConsoleToggle() {
    try {
        const toggleBtn = document.getElementById('log-toggle');
        const console = document.getElementById('log-console');
        const consoleInput = document.getElementById('console-input');
        if (!toggleBtn || !console || !consoleInput) {
            originalConsole.error('❌ Chybí DOM prvky pro konzoli! Zkontroluj HTML! 😱');
            return;
        }

        toggleBtn.addEventListener('click', () => {
            const isVisible = console.classList.toggle('log-console--visible');
            toggleBtn.classList.toggle('log-toggle--active', isVisible);

            if (isVisible && !console.dataset.initialized) {
                const logArea = document.getElementById('log-messages');
                logArea.innerHTML = initialConsoleMessage;
                console.dataset.initialized = 'true';
            }

            if (isVisible) consoleInput.focus();
        });

        consoleInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && consoleInput.value.trim()) {
                processConsoleCommand(consoleInput.value.trim());
                consoleInput.value = '';
            }
        });

        originalConsole.log('✅ Konzole inicializována, připrav se na Matrix! 😎');
    } catch (e) {
        originalConsole.error('💥 Chyba při inicializaci konzole:', e);
    }
}

/**
 * Zpracuje příkazy z konzole – jako bys hackoval Pentagon! 😈
 * @param {string} command - Zadaný příkaz
 */
function processConsoleCommand(command) {
    const messagesContainer = document.getElementById('log-messages');
    const normalizedCommand = command.toLowerCase();

    logMessages.push({ text: `> ${command}`, type: 'log' });

    if (normalizedCommand === 'help') {
        logMessages.push({
            text: `
📜 Dostupné příkazy:
- help: Zobrazí tuto nápovědu
- theme [název]: Přepne téma (např. theme cyberPink)
- clear: Vyčistí konzoli
- easteregg: Spustí glitch efekt
- rain: Spustí neonový déšť 🌧️
- card: Vynutí novou kartu vedle loga
            `,
            type: 'log'
        });
    } else if (normalizedCommand.startsWith('theme ')) {
        const themeName = normalizedCommand.split(' ')[1];
        if (styleThemes.includes(themeName)) {
            applyTheme(themeName);
            logMessages.push({ text: `🎨 Téma "${themeName}" aktivováno!`, type: 'log' });
        } else {
            logMessages.push({ text: `❌ Neznámé téma: ${themeName}. Zkus 'help'.`, type: 'error' });
        }
    } else if (normalizedCommand === 'clear') {
        logMessages.length = 0;
        messagesContainer.innerHTML = initialConsoleMessage;
    } else if (normalizedCommand === 'easteregg') {
        logMessages.push({ text: '🥚 Spouštím velikonoční vajíčko...', type: 'log' });
        triggerEasterEgg();
    } else if (normalizedCommand === 'rain') {
        logMessages.push({ text: '🌧️ Spouštím neonový déšť...', type: 'log' });
        triggerRainEffect();
    } else if (normalizedCommand === 'card') {
        logMessages.push({ text: '🃏 Vynucuji novou kartu vedle loga...', type: 'log' });
        spawnLogoCard();
    } else {
        logMessages.push({ text: `❌ Neznámý příkaz: ${command}. Zkus 'help'.`, type: 'error' });
    }

    updateConsoleDisplay();
}

/**
 * Spustí neonový déšť – jako scéna z Blade Runnera! 🌧️
 */
function triggerRainEffect() {
    try {
        const rainContainer = document.createElement('div');
        rainContainer.className = 'rain-effect';
        document.body.appendChild(rainContainer);

        for (let i = 0; i < 50; i++) {
            const drop = document.createElement('div');
            drop.className = 'rain-drop';
            drop.style.left = `${Math.random() * 100}vw`;
            drop.style.animationDelay = `${Math.random() * 2}s`;
            rainContainer.appendChild(drop);
        }

        setTimeout(() => rainContainer.remove(), 5000);
        originalConsole.log('🌧️ Neonový déšť spuštěn na 5 sekund!');
    } catch (e) {
        originalConsole.error('💥 Chyba při spuštění deště:', e);
    }
}

/**
 * Spustí velikonoční vajíčko – glitch efekt, co tě hodí do rozbitého CRT monitoru! 📺
 */
function triggerEasterEgg() {
    try {
        document.body.classList.add('glitch-storm');
        setTimeout(() => document.body.classList.remove('glitch-storm'), 2000);
        originalConsole.log('🥚 Glitch efekt aktivován! Drž se, Matrix se třese!');
    } catch (e) {
        originalConsole.error('💥 Chyba při spuštění easter egg:', e);
    }
}

// ===========================================
// SPRÁVA TÉMAT
// ===========================================

/**
 * Aplikuje téma na stránku – ať to svítí jako Tokijská ulice v noci! 🌆
 * @param {string} themeName - Název tématu z themeColors
 * @returns {void}
 */
function applyTheme(themeName) {
    try {
        originalConsole.log(`🔄 Aplikuji téma: ${themeName}`);
        
        if (!themeColors[themeName]) {
            originalConsole.warn(`⚠️ Téma "${themeName}" nebylo nalezeno, vracím se k výchozímu.`);
            themeName = 'default';
        }
        
        const colors = themeColors[themeName];
        const root = document.documentElement;

        root.style.setProperty('--color-primary', colors.primary);
        root.style.setProperty('--color-primary-invert', colors.primaryInvert);
        root.style.setProperty('--color-accent', colors.accent);
        root.style.setProperty('--color-accent-invert', colors.accentInvert);
        root.style.setProperty('--color-glow', colors.glow);
        root.style.setProperty('--color-bg', colors.bg);
        root.style.setProperty('--color-text', colors.text);
        root.style.setProperty('--color-text-invert', colors.textInvert);

        const effects = {
            shadow: `0 0 5px ${colors.accent}, 0 0 10px ${colors.glow}`,
            glow: `0 0 5px #fff, 0 0 10px #fff, 0 0 20px ${colors.glow}, 0 0 40px ${colors.glow}`,
            strongGlow: `0 0 10px ${colors.accent}, 0 0 20px ${colors.glow}, 0 0 30px ${colors.glow}, 0 0 50px ${colors.glow}`,
            textGlow: `0 0 2px ${colors.accent}, 0 0 6px ${colors.glow}`,
            boxShadow: `0 0 10px ${colors.accent}, 0 0 20px ${colors.glow}`,
            border: `2px solid ${colors.primary}`,
            borderThin: `1px solid ${colors.primary}`,
            borderThick: `3px solid ${colors.primary}`,
            borderInset: `inset 0 0 10px ${colors.glow}, inset 0 0 20px ${colors.glow}`,
            gradient: `linear-gradient(45deg, ${colors.primary}, ${colors.accent})`,
            gradientHorizontal: `linear-gradient(90deg, ${colors.primary}, ${colors.accent})`,
            gradientVertical: `linear-gradient(180deg, ${colors.primary}, ${colors.accent})`
        };

        Object.entries(effects).forEach(([key, value]) => {
            root.style.setProperty(`--neon-${key.toLowerCase()}`, value);
        });

        updateThemeColor(colors.primary);
        saveTheme(themeName);

        document.dispatchEvent(new CustomEvent('themeChanged', { 
            detail: { theme: themeName, colors: colors } 
        }));

        document.body.className = `theme-${themeName}`;
        originalConsole.log(`✅ Téma ${themeName} úspěšně aplikováno!`);
    } catch (e) {
        originalConsole.error('💥 Chyba při aplikaci tématu:', e);
    }
}

/**
 * Uloží téma do localStorage – ať si Matrix pamatuje tvůj styl! 💾
 * @param {string} theme - Název tématu
 */
function saveTheme(theme) {
    try {
        localStorage.setItem('walliczech-theme', theme);
        originalConsole.log(`💾 Téma ${theme} uloženo do localStorage.`);
    } catch (e) {
        originalConsole.error('❌ Chyba při ukládání tématu:', e);
    }
}

/**
 * Načte uložené téma – nebo default, když si Matrix dělá, co chce! 😒
 * @returns {string} Název tématu
 */
function loadTheme() {
    try {
        const theme = localStorage.getItem('walliczech-theme');
        if (theme) originalConsole.log(`📖 Načteno téma: ${theme}`);
        return theme || 'default';
    } catch (e) {
        originalConsole.error('❌ Chyba při načítání tématu:', e);
        return 'default';
    }
}

/**
 * Aktualizuje barvu adresního řádku – ať to ladí s tvým neonem! 🎨
 * @param {string} color - Barva v hex formátu
 */
function updateThemeColor(color) {
    try {
        const themeColor = document.querySelector('meta[name="theme-color"]');
        if (themeColor) {
            themeColor.setAttribute('content', color);
            originalConsole.log(`🎨 Barva adresního řádku aktualizována na: ${color}`);
        }
    } catch (e) {
        originalConsole.error('❌ Chyba při aktualizaci barvy adresního řádku:', e);
    }
}

/**
 * Vrátí aktuální téma – nebo default, když se něco pokazí! 😅
 * @returns {string} Název tématu
 */
function getCurrentTheme() {
    return loadTheme();
}

/**
 * Vrátí index aktuálního tématu – pro snadné přepínání! 🔢
 * @returns {number} Index tématu
 */
function getCurrentThemeIndex() {
    return styleThemes.indexOf(getCurrentTheme());
}

/**
 * Přepne na další téma – jako když přepínáš kanály na starém CRT! 📺
 * @returns {string} Název nového tématu
 */
function cycleToNextTheme() {
    try {
        const currentIndex = getCurrentThemeIndex();
        const nextIndex = (currentIndex + 1) % styleThemes.length;
        const nextTheme = styleThemes[nextIndex];
        applyTheme(nextTheme);
        return nextTheme;
    } catch (e) {
        originalConsole.error('❌ Chyba při přepínání tématu:', e);
        return 'default';
    }
}

/**
 * Inicializuje tlačítko pro přepínání témat – ať to svítí! 💡
 */
function initThemeToggle() {
    try {
        const toggleBtn = document.getElementById('theme-toggle');
        if (!toggleBtn) {
            originalConsole.error('❌ Tlačítko #theme-toggle nenalezeno! Zkontroluj HTML! 😵');
            return;
        }

        toggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const newTheme = cycleToNextTheme();
            toggleBtn.classList.add('theme-toggle--active');
            setTimeout(() => toggleBtn.classList.remove('theme-toggle--active'), 300);
            originalConsole.log(`🔄 Přepnuto na téma: ${newTheme}`);
        });

        originalConsole.log('✅ Tlačítko pro přepínání témat inicializováno.');
    } catch (e) {
        originalConsole.error('❌ Chyba při inicializaci přepínání témat:', e);
    }
}

// ===========================================
// KARTY VEDLE LOGA
// ===========================================
const moduleCardsData = [
    {
        "title": "FluxRunner",
        "description": "Flux.1 generuje obsah rychleji, než hacker crackne heslo! 🌌 Text nebo obrázek? Vytvoří neonové vizuály, co tě teleportují do kyberprostoru. Rychlé, ostré, epické. 😎",
        "colorClass": "color-primary neon-text-glow"
    },
    {
        "title": "Lipsync",
        "description": "Rty v syncu s audiem jako v pasážním kině! 🗣️ Nahraj video, přihoď zvuk a tvé postavy mluví, jako by žily v Matrixu. Hollywood bez rozpočtu. 💋",
        "colorClass": "color-accent neon-text-glow"
    },
    {
        "title": "Dubbing Master",
        "description": "Předabuj videa rychleji, než se Matrix rebootne! 🎙️ Automatický dabing s překladem do jakéhokoli jazyka. Hlasy, co zní jako AI rockstar. 😜",
        "colorClass": "color-primary neon-text-glow"
    },
    {
        "title": "FaceSwap Ninja",
        "description": "Vyměň obličeje jako kyberšpion! 🧬 Fotky, videa – vše v bulvární kvalitě. Proměň kámoše v Elona nebo psa v kyberhrdinu. 😈",
        "colorClass": "color-accent neon-text-glow"
    },
    {
        "title": "Face Detector",
        "description": "Najde každý ksicht v obraze rychleji, než FBI! 🕵️ Používá YOLOv5 nebo ResNet50. Ideální pro analýzu davů nebo špehování v pasáži. 🍺",
        "colorClass": "color-primary neon-text-glow"
    },
    {
        "title": "SDXL Wizard",
        "description": "Kouzli kyberpunkové obrázky jako AI Picasso! 🎨 Text2img, img2img, inpainting – tvůj prompt se mění v neonový sen. 🌌",
        "colorClass": "color-accent neon-text-glow"
    },
    {
        "title": "SAM Segmenter",
        "description": "Řež pixely jako nindža s laserem! ✂️ Segmentace obrázků s přesností skalpelu. Klikni body nebo nech AI sekat automaticky. 😈",
        "colorClass": "color-primary neon-text-glow"
    },
    {
        "title": "TTS Bard",
        "description": "Text v řeč, co zní jako kybernetický bard! 🔊 Zadej text, vyber hlas a jazyk – audioknihy, pranky nebo dabing? Vše zvládne! 😎",
        "colorClass": "color-accent neon-text-glow"
    },
    {
        "title": "Upscale King",
        "description": "Z rozmazanýho obrázku udělá 8K klenot! 🔍 Zachraň staré fotky nebo vytvoř billboard z náčrtku. Pixely, co svítí jako diamanty. 😜",
        "colorClass": "color-primary neon-text-glow"
    },
    {
        "title": "Neon Progress",
        "description": "Sleduj AI kouzla v reálném čase přes WebSocket! 📊 Progress bar svítí jako neon a chyby ti vyplivne rovnou do ksichtu. 😈",
        "colorClass": "color-accent neon-text-glow"
    },
    {
        "title": "OCRNinja",
        "description": "Rozluští text z obrázku rychleji, než hacker PIN! 📝🔍 Rukopisy, billboardy, cokoli – OCR, co čte vše. Perfektní pro digitalizaci. 😎",
        "colorClass": "color-primary neon-text-glow"
    },
    {
        "title": "Depth Mapper",
        "description": "Z 2D obrázku udělá 3D hloubkovou mapu! 🕶️🌐 Ideální pro VR nebo frajeřinu. Tvoje fotky dostanou kyberprostorový rozměr! 🚀",
        "colorClass": "color-accent neon-text-glow"
    },
    {
        "title": "Audio Slicer",
        "description": "Rozseká audio jako kyberkuchař! 🎵🔪 Tracky, podcasty, beaty – vše na kousky s přesností. Perfektní pro remixy nebo analýzu. 😈",
        "colorClass": "color-primary neon-text-glow"
    },
    {
        "title": "Motion Tracker",
        "description": "Sleduje pohyb ve videu jako kyberstalker! 📍🚨 Detekce s laserovou přesností – ideální pro analýzu nebo špehování v pasáži. 😜",
        "colorClass": "color-accent neon-text-glow"
    },
    {
        "title": "Chroma Keyer",
        "description": "Vymění pozadí videa jako v Hollywoodu! 🎬🟢 Nahraj video, přihoď neonovou pasáž nebo Mars. Magie bez zelenýho plátna! 😎",
        "colorClass": "color-primary neon-text-glow"
    },
    {
        "title": "Voice Cloner",
        "description": "Naklonuj hlas jako pravý kyberpadouch! 🎙️😈 Z referenčního audia vytvoří deepfake hlas. Pranky nebo AI herec? Tady to máš! 🚀",
        "colorClass": "color-accent neon-text-glow"
    },
    {
        "title": "Text2Scene",
        "description": "Text promění v kyberpunkovou scénu! 📜🎥 Zadej popis a sleduj, jak vzniká animace nebo 3D svět. Jsi scénárista Matrixu! 🌌",
        "colorClass": "color-primary neon-text-glow"
    }
];

/**
 * Vytvoří kartu vedle loga – jako neonový billboard v Matrixu! 🖼️
 * @returns {HTMLElement|null} Vytvořená karta nebo null při chybě
 */
function spawnLogoCard() {
    try {
        if (document.hidden) {
            console.warn('🕵️‍♂️ Uživatel se loudá v offline světě, karta čeká v digitálním éteru!');
            return null;
        }
        if (!moduleCardsData.length) {
            console.error('💥 Žádná data karet? To je jako matrix bez zelených čísel!');
            return null;
        }

        const container = document.querySelector('.logo-card-overlay');
        if (!container) {
            console.error('🛑 Kontejner .logo-card-overlay se vypařil do kybermlhy!');
            return null;
        }

        // Vymažeme všechny staré karty, aby nezůstávaly v DOMu
        const oldCards = container.querySelectorAll('.floating-card');
        oldCards.forEach(oldCard => {
            oldCard.style.zIndex = '5'; // Nižší z-index pro odchozí kartu
            oldCard.classList.add('card-exit');
            setTimeout(() => oldCard.remove(), 300); // Synchronizováno s CSS
            console.log('💨 Stará karta se rozpadla na kyberpixely!');
        });

        // Nová karta – skládá se z pixelů jako z datového proudu
        const card = document.createElement('div');
        card.className = 'floating-card card-enter';
        card.style.zIndex = '5'; // Vyšší z-index pro novou kartu
        const randomCard = moduleCardsData[Math.floor(Math.random() * moduleCardsData.length)];
        card.innerHTML = `
            <h3 style="font-size: 1.4rem; color: var(--color-primary); text-shadow: var(--neon-text-glow);">${randomCard.title}</h3>
            <p style="font-size: 1.15rem;">${randomCard.description}</p>
        `;

        container.appendChild(card);

        // Skládací animace – pixely se spojují
        setTimeout(() => {
            card.classList.remove('card-enter');
            card.classList.add('card-enter-active');
        }, 20);

        // Kliknutí = karta se depixelizuje
        card.addEventListener('click', function onClick() {
            card.removeEventListener('click', onClick);
            card.style.zIndex = '5'; // Snížíme z-index při odchodu
            card.classList.add('card-exit');
            setTimeout(() => card.remove(), 300);
            setTimeout(() => spawnLogoCard(), 320); // Rychlý respawn
            console.log('💥 Karta explodovala do kyberčástic! *bzzz*');
        });

        // Automatické přepnutí po 5 sekundách
        setTimeout(() => {
            if (card.isConnected) { // Ověříme, že karta je stále v DOMu
                card.style.zIndex = '5'; // Snížíme z-index
                card.classList.add('card-exit');
                setTimeout(() => card.remove(), 300);
                setTimeout(() => spawnLogoCard(), 320);
                console.log('🔄 Karta se automaticky depixelizovala do datového proudu! *vrrrr*');
            }
        }, 10000);

        return card;
    } catch (error) {
        console.error('🔥 Systémový crash v kyberprostoru! Chyba při vytváření karty:', error);
        return null;
    }
}

/**
 * Spustí cyklus střídání karet vedle loga – jako kyberpunkový slideshow! 📽️
 */
function startLogoCardCycle() {
    try {
        originalConsole.log('🃏 Inicializace cyklu karet vedle loga...');

        if (window.cardCycleInterval) {
            clearInterval(window.cardCycleInterval);
        }

        spawnLogoCard();
        window.cardCycleInterval = setInterval(() => {
            if (!document.hidden) {
                originalConsole.log('🃏 Střídám kartu vedle loga...');
                spawnLogoCard();
            }
        }, 10000);

        originalConsole.log('🃏 Cyklus karet nastaven na 10 sekund.');
    } catch (e) {
        originalConsole.error('❌ Chyba při inicializaci cyklu karet:', e);
    }
}

// ===========================================
// INICIALIZACE APLIKACE
// ===========================================

/**
 * Hlavní inicializace – jako bootování AI v kyberprostoru! 🚀
 */
function initApp() {
    try {
        if (!document.getElementById('log-console') || !document.getElementById('log-toggle')) {
            originalConsole.warn('❌ DOM prvky nejsou připraveny, čekám na Matrix...');
            setTimeout(initApp, 100);
            return;
        }

        originalConsole.log('🧠 Inicializace aplikace...');

        // Přepsat konzoli
        overrideConsole();

        // Aplikovat téma
        const savedTheme = loadTheme();
        applyTheme(savedTheme);

        // Inicializovat komponenty
        initThemeToggle();
        initConsoleToggle();
        startLogoCardCycle();
        startRandomRainLoop();

        // Ukázkový déšť
        setTimeout(() => {
            originalConsole.log('🌧️ Spouštím ukázkový déšť...');
            triggerRainEffect();
        }, 2000);

        originalConsole.log('🚀 Aplikace inicializována! Zadej "help" pro příkazy.');
    } catch (error) {
        originalConsole.error('💥 Chyba při inicializaci:', error);
        showNotification('Chyba', `Inicializace selhala: ${error.message}`, 'error');
    }
}

/**
 * Zobrazí notifikaci – jako by Matrix poslal zprávu! 📢
 * @param {string} title - Nadpis
 * @param {string} message - Zpráva
 * @param {string} type - Typ (success, error, warning, info)
 */
function showNotification(title, message, type = 'info') {
    try {
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;

        const iconMap = {
            success: '✓',
            error: '✗',
            warning: '⚠',
            info: 'ℹ'
        };

        notification.innerHTML = `
            <div class="notification__icon">${iconMap[type]}</div>
            <div class="notification__content">
                <div class="notification__title">${title}</div>
                <div class="notification__message">${message}</div>
            </div>
            <button class="notification__close">×</button>
        `;

        document.body.appendChild(notification);
        setTimeout(() => notification.classList.add('show'), 10);

        const timeout = setTimeout(() => hideNotification(notification), 5000);
        notification.querySelector('.notification__close').addEventListener('click', () => {
            clearTimeout(timeout);
            hideNotification(notification);
        });

        originalConsole.log(`📢 Notifikace: ${title} - ${message}`);
    } catch (e) {
        originalConsole.error('❌ Chyba při zobrazení notifikace:', e);
    }
}

/**
 * Skryje notifikaci – ať nezaclání v Matrixu! 🙈
 * @param {HTMLElement} notification - Element notifikace
 */
function hideNotification(notification) {
    try {
        notification.classList.remove('show');
        notification.classList.add('hide');
        notification.addEventListener('transitionend', () => notification.remove(), { once: true });
    } catch (e) {
        originalConsole.error('❌ Chyba při skrývání notifikace:', e);
    }
}

/**
 * Spustí cyklus náhodného deště – ať to prší jako v Blade Runnerovi! 🌧️
 */
function startRandomRainLoop() {
    try {
        originalConsole.log('🌧️ Inicializace náhodného deště...');

        if (window.rainInterval) {
            clearInterval(window.rainInterval);
        }

        triggerRainEffect();
        window.rainInterval = setInterval(() => {
            if (!document.hidden) {
                originalConsole.log('🌧️ Spouštím náhodný déšť...');
                triggerRainEffect();
            }
        }, 15000 + Math.random() * 15000);
        originalConsole.log('🌧️ Interval deště nastaven.');
    } catch (e) {
        originalConsole.error('❌ Chyba při inicializaci deště:', e);
    }
}

// Spuštění po načtení DOMu
document.addEventListener('DOMContentLoaded', initApp);

// Globální funkce pro konzoli
window.wallICzech = {
    spawnLogoCard,
    startLogoCardCycle,
    triggerRainEffect,
    startRandomRainLoop,
    initApp
};

originalConsole.log('ℹ️ wAllICzech Studio připraveno! Použij wallICzech.funkce() v konzoli.');
