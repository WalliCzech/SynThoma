'use strict';

(function() {
    const SYNTHOMA_TEXT = "SYNTHOMA";
    const GLITCH_CHARS = "!@#$%^&*_-+=/?\\|<>[]{};:~NYHSMT#¤%&@§÷×¤░▒▓█▄▀●◊O|/\\_^-~.*+";
    const COLORS = ["#ff00ff", "#0ff", "#fff", "#faff00", "#ff2afd", "#00fff9"];
    let glitchInterval = null;

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
        if (!spans.length) return;

        for (let i = 0; i < spans.length; i++) {
            const orig = SYNTHOMA_TEXT[i];
            if (Math.random() < 0.19) {
                spans[i].textContent = randomGlitchChar(orig);
                spans[i].classList.add('glitchy');
                spans[i].style.color = randomColor();
                setTimeout(() => {
                    if (spans[i]) {
                        spans[i].textContent = orig;
                        spans[i].classList.remove('glitchy');
                        spans[i].style.color = "#0ff";
                    }
                }, 85 + Math.random() * 80);
            }
        }
    }

    window.startGlitchHeading = function() {
        if (glitchInterval) return; // Zabráníme více intervalům
        console.log('Starting Glitch Heading...');
        glitchInterval = setInterval(glitchCycle, 120);
    };

    window.stopGlitchHeading = function() {
        if (!glitchInterval) return;
        console.log('Stopping Glitch Heading... ');
        clearInterval(glitchInterval);
        glitchInterval = null;
        // Reset stavu
        const root = document.getElementById('glitch-synthoma');
        if (!root) return;
        const spans = root.querySelectorAll('.glitch-char');
        spans.forEach((span, i) => {
            span.textContent = SYNTHOMA_TEXT[i];
            span.classList.remove('glitchy');
            span.style.color = "#0ff";
        });
    };

})();