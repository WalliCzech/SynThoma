'use strict';

(function() {
    let activeTimers = [];
    let originalStates = new Map();

    function applyShinning(selector, root = document) {
        const elements = root.querySelectorAll(selector);

        elements.forEach(el => {
            if (el.dataset.neonActive) return;

            el.dataset.neonActive = true;
            originalStates.set(el, { html: el.innerHTML });

            const originalText = el.textContent;
            const chars = originalText.split('').map(char =>
                char === ' ' ? ' ' : `<span class="neon-char bright">${char}</span>`
            );
            el.innerHTML = chars.join('');

            const charsElements = Array.from(el.querySelectorAll('.neon-char'));

            function flicker() {
                if (!el.dataset.neonActive) return;

                const selectedChar = charsElements[Math.floor(Math.random() * charsElements.length)];
                if (!selectedChar) return;

                selectedChar.classList.add('flickering');
                const t1 = setTimeout(() => {
                    selectedChar.classList.remove('flickering');
                }, 100 + Math.random() * 200);
                activeTimers.push(t1);

                const nextFlicker = setTimeout(flicker, 500 + Math.random() * 2000);
                activeTimers.push(nextFlicker);
            }

            flicker();
        });
    }

    function removeShinning(selector, root = document) {
        activeTimers.forEach(clearTimeout);
        activeTimers = [];

        const elements = root.querySelectorAll(selector);
        elements.forEach(el => {
            if (originalStates.has(el)) {
                el.innerHTML = originalStates.get(el).html;
                delete el.dataset.neonActive;
                originalStates.delete(el);
            }
        });
    }

    window.startShinning = (root) => applyShinning('.shinning', root || document);
    window.stopShinning = (root) => removeShinning('.shinning', root || document);

})();
