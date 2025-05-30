/**
 * wAllICzech Studio - Hlavní JavaScriptový soubor
 * 
 * Tento soubor obsahuje veškerou funkcionalitu pro správu témat a uživatelského rozhraní.
 */

// ===========================================
// KONFIGURACE TÉMAT
// ===========================================

/**
 * Seznam dostupných témat
 * @type {string[]}
 */
const styleThemes = [
    'default',      // Výchozí styl
    'cyberWeed',    // Zelené téma
    'cyberPink',    // Růžové téma
    'cyberBlue',    // Modré téma
    'cyberOrange',  // Oranžové téma
    'cyberPurple'   // Fialové téma
];

/**
 * Definice barev pro různá témata
 * @type {Object.<string, {primary: string, primaryInvert: string, accent: string, accentInvert: string, glow: string, bg: string, text: string, textInvert: string}>}
 */
const themeColors = {
    default: {
        primary: "#ff4500",
        primaryInvert: "#000000",
        accent: "#ff5500",
        accentInvert: "#ba1787",
        glow: "#ff007a",
        bg: "#0a0a0a",
        text: "#eaffea",
        textInvert: "#000000"
    },
    cyberWeed: {
        primary: "#00ff88",
        primaryInvert: "#000000",
        accent: "#33ffaa",
        accentInvert: "#000000",
        glow: "#00ffcc",
        bg: "#001f1a",
        text: "#eaffea",
        textInvert: "#000000"
    },
    cyberPink: {
        primary: "#ff77ff",
        primaryInvert: "#000000",
        accent: "#ff99ff",
        accentInvert: "#000000",
        glow: "#ffaaee",
        bg: "#2b002b",
        text: "#ffffff",
        textInvert: "#000000"
    },
    cyberBlue: {
        primary: "#00a8ff",
        primaryInvert: "#000000",
        accent: "#00f7ff",
        accentInvert: "#000000",
        glow: "#00e5ff",
        bg: "#000a1a",
        text: "#e6f7ff",
        textInvert: "#000000"
    },
    cyberOrange: {
        primary: "#ff8c00",
        primaryInvert: "#9b2525",
        accent: "#ffbb33",
        accentInvert: "#9b2525",
        glow: "#ffaa33",
        bg: "#1a0a00",
        text: "#fff0e6",
        textInvert: "#000000"
    },
    cyberPurple: {
        primary: "#b300ff",
        primaryInvert: "#000000",
        accent: "#cc66ff",
        accentInvert: "#000000",
        glow: "#cc99ff",
        bg: "#0a001a",
        text: "#f2e6ff",
        textInvert: "#000000"
    }
};

// ===========================================
// SPRÁVA TÉMAT
// ===========================================

/**
 * Aplikuje zvolené téma na stránku
 * @param {string} themeName - Název tématu z themeColors
 * @returns {void}
 */
function applyTheme(themeName) {
    console.log('🔄 Aplikuji barevné schéma:', themeName);
    
    // Získání barev pro zvolené téma nebo výchozího tématu
    const colors = themeColors[themeName] || themeColors.default;
    const root = document.documentElement;
    
    // Nastavení základních barevných proměnných
    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-primary-invert', colors.primaryInvert);
    root.style.setProperty('--color-accent', colors.accent);
    root.style.setProperty('--color-accent-invert', colors.accentInvert);
    root.style.setProperty('--color-glow', colors.glow);
    root.style.setProperty('--color-bg', colors.bg);
    root.style.setProperty('--color-text', colors.text);
    root.style.setProperty('--color-text-invert', colors.textInvert);
    
    // Definice efektů
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
    
    // Aplikování efektů jako CSS proměnných
    Object.entries(effects).forEach(([key, value]) => {
        root.style.setProperty(`--neon-${key.toLowerCase()}`, value);
    });
    
    // Aktualizace metatagu pro barvu adresního řádku
    updateThemeColor(colors.primary);
    
    // Uložení aktuálního tématu
    saveTheme(themeName);
    
    // Oznámení o změně tématu
    document.dispatchEvent(new CustomEvent('themeChanged', { 
        detail: { 
            theme: themeName,
            colors: colors
        } 
    }));
    
    // Přidání třídy na tělo pro aktuální téma
    document.body.className = '';
    document.body.classList.add(`theme-${themeName}`);
    
    console.log('✅ Téma úspěšně aplikováno:', themeName);
}

/**
 * Uloží vybrané téma do localStorage
 * @param {string} theme - Název tématu
 * @returns {void}
 */
function saveTheme(theme) {
    try {
        localStorage.setItem('walliczech-theme', theme);
        console.log('💾 Ukládám téma do localStorage:', theme);
    } catch (e) {
        console.error('❌ Nepodařilo se uložit téma do localStorage:', e);
    }
}

/**
 * Načte uložené téma z localStorage
 * @returns {string} Název tématu nebo null, pokud není uloženo
 */
function loadTheme() {
    try {
        const theme = localStorage.getItem('walliczech-theme');
        if (theme) {
            console.log('📖 Načítám uložené téma:', theme);
            return theme;
        }
        return null;
    } catch (e) {
        console.error('❌ Nepodařilo se načíst téma z localStorage:', e);
        return null;
    }
}

/**
 * Aktualizuje barvu adresního řádku v prohlížeči
 * @param {string} color - Barva v hex formátu
 * @returns {void}
 */
function updateThemeColor(color) {
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) {
        themeColor.setAttribute('content', color);
        console.log('🎨 Aktualizuji barvu adresního řádku na:', color);
    }
}

/**
 * Vrátí název aktuálního tématu
 * @returns {string} Název aktuálního tématu
 */
function getCurrentTheme() {
    const savedTheme = loadTheme();
    return savedTheme || 'default';
}

/**
 * Vrátí index aktuálního tématu v poli styleThemes
 * @returns {number} Index tématu
 */
function getCurrentThemeIndex() {
    const currentTheme = getCurrentTheme();
    return styleThemes.indexOf(currentTheme);
}

/**
 * Přepne na další téma v pořadí
 * @returns {string} Název nového tématu
 */
function cycleToNextTheme() {
    const currentIndex = getCurrentThemeIndex();
    const nextIndex = (currentIndex + 1) % styleThemes.length;
    const nextTheme = styleThemes[nextIndex];
    applyTheme(nextTheme);
    return nextTheme;
}

/**
 * Inicializuje tlačítko pro přepínání témat
 * @returns {void}
 */
function initThemeToggle() {
    const toggleBtn = document.getElementById('theme-toggle');
    if (!toggleBtn) return;
    
    toggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const newTheme = cycleToNextTheme();
        
        // Animace tlačítka
        toggleBtn.classList.add('theme-toggle--active');
        setTimeout(() => {
            toggleBtn.classList.remove('theme-toggle--active');
        }, 300);
        
        console.log('🔄 Přepínám na téma:', newTheme);
    });
    
    console.log('✅ Inicializováno tlačítko pro přepínání témat');
}

// ===========================================
// INICIALIZACE APLIKACE
// ===========================================

/**
 * Hlavní funkce pro inicializaci aplikace
 * @returns {void}
 */
function initApp() {
    // Načtení uloženého tématu
    const savedTheme = loadTheme() || 'default';
    applyTheme(savedTheme);
    
    // Inicializace komponent
    initThemeToggle();
    initInteractiveElements();
    
    console.log('🚀 Aplikace inicializována s tématem:', savedTheme);
}

/**
 * Inicializuje interaktivní prvky na stránce
 * @returns {void}
 */
function initInteractiveElements() {
    // Inicializace tooltipů
    initTooltips();
    
    // Inicializace formulářů
    initForms();
    
    // Inicializace tlačítek s efekty
    initButtonEffects();
    
    console.log('✅ Inicializovány interaktivní prvky');
}

/**
 * Inicializuje tooltipy
 * @returns {void}
 */
function initTooltips() {
    const tooltips = document.querySelectorAll('[data-tooltip]');
    
    tooltips.forEach(tooltip => {
        tooltip.addEventListener('mouseenter', showTooltip);
        tooltip.addEventListener('mouseleave', hideTooltip);
    });
    
    console.log('✅ Inicializovány tooltipy');
}

/**
 * Zobrazí tooltip
 * @param {MouseEvent} e - Událost myši
 * @returns {void}
 */
function showTooltip(e) {
    const tooltip = e.currentTarget;
    const tooltipText = tooltip.getAttribute('data-tooltip');
    if (!tooltipText) return;
    
    const tooltipElement = document.createElement('div');
    tooltipElement.className = 'tooltip';
    tooltipElement.textContent = tooltipText;
    
    document.body.appendChild(tooltipElement);
    
    const rect = tooltip.getBoundingClientRect();
    const tooltipRect = tooltipElement.getBoundingClientRect();
    
    // Pozicování tooltipu
    const top = rect.top - tooltipRect.height - 10;
    const left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
    
    tooltipElement.style.top = `${Math.max(10, top)}px`;
    tooltipElement.style.left = `${Math.max(10, Math.min(window.innerWidth - tooltipRect.width - 10, left))}px`;
    tooltipElement.classList.add('show');
    
    // Uložení reference pro pozdější odstranění
    tooltip._tooltipElement = tooltipElement;
}

/**
 * Skryje tooltip
 * @param {MouseEvent} e - Událost myši
 * @returns {void}
 */
function hideTooltip(e) {
    const tooltip = e.currentTarget;
    if (tooltip._tooltipElement) {
        tooltip._tooltipElement.remove();
        delete tooltip._tooltipElement;
    }
}

/**
 * Inicializuje formuláře
 * @returns {void}
 */
function initForms() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', handleFormSubmit);
    });
    
    console.log('✅ Inicializovány formuláře');
}

/**
 * Zpracuje odeslání formuláře
 * @param {Event} e - Událost odeslání formuláře
 * @returns {Promise<void>}
 */
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const form = e.currentTarget;
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton ? submitButton.innerHTML : '';
    
    // Zobrazení načítání
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner"></span> Odesílám...';
    }
    
    try {
        // Zde by bylo odeslání formuláře
        // const formData = new FormData(form);
        // const response = await fetch(form.action, {
        //     method: form.method,
        //     body: formData
        // });
        // const result = await response.json();
        
        // Simulace zpoždění
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Zobrazení úspěchu
        showNotification('Hotovo!', 'Formulář byl úspěšně odeslán.', 'success');
    } catch (error) {
        console.error('Chyba při odesílání formuláře:', error);
        showNotification('Chyba', 'Něco se pokazilo při odesílání formuláře.', 'error');
    } finally {
        // Obnovení tlačítka
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.innerHTML = originalText;
        }
    }
}

/**
 * Inicializuje efekty tlačítek
 * @returns {void}
 */
function initButtonEffects() {
    const buttons = document.querySelectorAll('.btn, button, [role="button"]');
    
    buttons.forEach(button => {
        // Efekt při najetí myší
        button.addEventListener('mouseenter', createRippleEffect);
        
        // Efekt při stisknutí
        button.addEventListener('mousedown', (e) => {
            button.style.transform = 'scale(0.98)';
        });
        
        button.addEventListener('mouseup', () => {
            button.style.transform = '';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = '';
        });
    });
    
    console.log('✅ Inicializovány efekty tlačítek');
}

/**
 * Vytvoří efekt vlnky při najetí myší na tlačítko
 * @param {MouseEvent} e - Událost myši
 * @returns {void}
 */
function createRippleEffect(e) {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    
    button.appendChild(ripple);
    
    // Odstranění efektu po dokončení animace
    ripple.addEventListener('animationend', () => {
        ripple.remove();
    });
}

/**
 * Zobrazí notifikaci
 * @param {string} title - Nadpis notifikace
 * @param {string} message - Zpráva
 * @param {string} type - Typ notifikace (success, error, warning, info)
 * @returns {void}
 */
function showNotification(title, message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    
    const iconMap = {
        success: '✓',
        error: '✗',
        warning: '⚠',
        info: 'ℹ'
    };
    
    notification.innerHTML = `
        <div class="notification__icon">${iconMap[type] || 'ℹ'}</div>
        <div class="notification__content">
            <div class="notification__title">${title}</div>
            <div class="notification__message">${message}</div>
        </div>
        <button class="notification__close">×</button>
    `;
    
    document.body.appendChild(notification);
    
    // Přidání třídy pro animaci zobrazení
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Nastavení časovače pro automatické skrytí
    const timeout = setTimeout(() => {
        hideNotification(notification);
    }, 5000);
    
    // Tlačítko pro zavření
    const closeButton = notification.querySelector('.notification__close');
    closeButton.addEventListener('click', () => {
        clearTimeout(timeout);
        hideNotification(notification);
    });
    
    // Kliknutí mimo notifikaci ji také zavře
    notification.addEventListener('click', (e) => {
        if (e.target === notification) {
            clearTimeout(timeout);
            hideNotification(notification);
        }
    });
    
    console.log(`📢 Zobrazena notifikace: ${title} - ${message}`);
}

/**
 * Skryje notifikaci
 * @param {HTMLElement} notification - Element notifikace
 * @returns {void}
 */
function hideNotification(notification) {
    notification.classList.remove('show');
    notification.classList.add('hide');
    
    // Odstranění z DOMu po skončení animace
    notification.addEventListener('transitionend', () => {
        notification.remove();
    }, { once: true });
}

// Spuštění aplikace po načtení DOMu
document.addEventListener('DOMContentLoaded', initApp);
