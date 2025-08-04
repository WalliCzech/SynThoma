/**
 * Glitch efekt, který náhodně mění a bliká znaky.
 * @param {string} selector CSS selektor pro elementy s efektem.
 * @param {number} changeProbability Pravděpodobnost (0.0 - 1.0), že se znak změní.
 * @param {number} glitchProbability Pravděpodobnost (0.0 - 1.0), že znak zabliká.
 */
function applyGlitch(selector, changeProbability = 0.05, glitchProbability = 0.05) {
    const elements = document.querySelectorAll(selector);

    if (elements.length === 0) return;

    elements.forEach(element => {
        if (element.dataset.glitchingActive === 'true') return;

        element.dataset.glitchingActive = 'true';
        const originalText = element.textContent;
        element.dataset.originalText = originalText;

        element.innerHTML = originalText.split('').map(char =>
            char === ' ' ? ' ' : `<span class="glitching-char">${char}</span>`
        ).join('');

        const chars = element.querySelectorAll('.glitching-char');

        // Funkce pro generování náhodného znaku
        const randomChar = () => String.fromCharCode(33 + Math.floor(Math.random() * 94));
        
        const changeInterval = setInterval(() => {
            chars.forEach((char, index) => {
                // Přidání a odebrání blikacích tříd
                char.classList.remove('glitch-1', 'glitch-2');
                if (Math.random() < glitchProbability) {
                    const glitchType = Math.random() > 0.5 ? 'glitch-1' : 'glitch-2';
                    char.classList.add(glitchType);
                }

                // Změna znaku
                if (Math.random() < changeProbability) {
                    char.textContent = randomChar();
                    // Vrácení původního znaku po krátké chvíli
                    setTimeout(() => {
                        char.textContent = originalText[index];
                    }, 100 + Math.random() * 150);
                }
            });
        }, 100);

        element.dataset.changeInterval = changeInterval;
    });
}

function removeGlitch(selector) {
    const elements = document.querySelectorAll(selector);

    elements.forEach(element => {
        if (element.dataset.glitchingActive !== 'true') return;

        clearInterval(element.dataset.changeInterval);
        element.innerHTML = element.dataset.originalText;
        delete element.dataset.glitchingActive;
        delete element.dataset.originalText;
        delete element.dataset.changeInterval;
    });
}

// Globalní funkce pro spouštění a zastavování efektu
window.startGlitching = function(selector = '.glitching') {
    if (document.body.classList.contains('animations-disabled')) return;
    console.log('Starting Glitching Effect...');
    applyGlitch(selector);
};

window.stopGlitching = function(selector = '.glitching') {
    console.log('Stopping Glitching Effect...');
    removeGlitch(selector);
};
