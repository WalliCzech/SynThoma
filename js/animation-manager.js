/**
 * Globální manažer pro všechny vizuální efekty.
 * Umožňuje centrálně spouštět a zastavovat animace, glitche a videa.
 */
'use strict';

window.animationManager = {
    isPaused: false,

    // Inicializace, která zjistí počáteční stav z localStorage
    initialize: function() {
        this.isPaused = localStorage.getItem('animationsDisabled') === 'true';
        document.body.classList.toggle('animations-disabled', this.isPaused);

        if (!this.isPaused) {
            this.startAll();
        }

        // Sebe-oživení po krátké chvíli pro případ, že by jiný skript animace vypnul
        setTimeout(() => {
            if (!localStorage.getItem('animationsDisabled')) {
                console.log('Animation Manager: Kontrola a restart animací.');
                this.startAll();
            }
        }, 1500);
    },

    // Přepne stav všech animací a uloží ho
    toggleAll: function() {
        this.isPaused = !this.isPaused;
        localStorage.setItem('animationsDisabled', this.isPaused);
        document.body.classList.toggle('animations-disabled', this.isPaused);

        if (this.isPaused) {
            this.stopAll();
        } else {
            this.startAll();
        }
        return this.isPaused;
    },

    // Zastaví všechny JS efekty a videa
    stopAll: function() {
        console.log('STOPPING ALL JS ANIMATIONS 🛑');
        document.querySelectorAll('.video-background video').forEach(v => v.pause());
        if (window.stopVideoRotation) window.stopVideoRotation();
        if (window.stopGlitchBg) window.stopGlitchBg();
        if (window.stopGlitchHeading) window.stopGlitchHeading();
        if (window.stopGlitching) window.stopGlitching();
        if (window.stopNoising) window.stopNoising();
        if (window.stopShinning) window.stopShinning();
    },

    // Spustí všechny JS efekty a videa
    startAll: function() {
        if (document.body.classList.contains('animations-disabled')) {
            return;
        }
        console.log('STARTING ALL JS ANIMATIONS ▶️');
        document.querySelectorAll('.video-background video.active').forEach(v => v.play().catch(e => console.error("Video play failed:", e)));
        if (window.startVideoRotation) window.startVideoRotation();
        if (window.startGlitchBg) window.startGlitchBg();
        if (window.startGlitchHeading) window.startGlitchHeading();
        if (window.startGlitching) window.startGlitching();
        if (window.startNoising) window.startNoising();
        if (window.startShinning) window.startShinning();
   },

    // Znovu spustí efekty glitchingu a shinningu pro nově vložený obsah.
    // Pokud je předán konkrétní kontejner, efekty se aplikují pouze na jeho potomky.
    initializeEffects: function(container) {
        if (document.body.classList.contains('animations-disabled')) {
            return;
        }

        const root = container || document;

        if (window.startGlitching) window.startGlitching('.glitching', root);
        if (window.startShinning) window.startShinning(root);
    }
};

// Po načtení DOMu se manažer inicializuje
document.addEventListener('DOMContentLoaded', () => {
    window.animationManager.initialize();
});

// Pojistka pro spuštění animací po úplném načtení stránky
window.addEventListener('load', () => {
    if (window.animationManager && !window.animationManager.isPaused) {
        console.log('Pojistka: Restartuji animace po načtení okna.');
        window.animationManager.startAll();
    }
});
