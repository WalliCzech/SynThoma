let glitchInterval;

function applyGlitch(selector) {
    const element = document.querySelector(selector);
    if (!element || element.dataset.glitchingActive === 'true') return;

    element.dataset.glitchingActive = 'true';
    const originalText = element.textContent;
    element.dataset.originalText = originalText;

    element.innerHTML = originalText.split('').map(char => 
        char === ' ' ? ' ' : `<span class="glitching-char">${char}</span>`
    ).join('');

    const chars = element.querySelectorAll('.glitching-char');

    glitchInterval = setInterval(() => {
        chars.forEach(char => {
            char.classList.remove('glitch-1', 'glitch-2');
            if (Math.random() > 0.95) {
                const glitchType = Math.random() > 0.5 ? 'glitch-1' : 'glitch-2';
                char.classList.add(glitchType);
            }
        });
    }, 100);
}

function removeGlitch(selector) {
    const element = document.querySelector(selector);
    if (!element || element.dataset.glitchingActive !== 'true') return;

    clearInterval(glitchInterval);
    element.innerHTML = element.dataset.originalText;
    delete element.dataset.glitchingActive;
}

window.startGlitching = function() {
    if (document.body.classList.contains('animations-disabled')) return;
    console.log('Starting Glitching Effect...');
    applyGlitch('.glitching');
};

window.stopGlitching = function() {
    console.log('Stopping Glitching Effect...');
    removeGlitch('.glitching');
};

document.addEventListener('DOMContentLoaded', () => {
    // Spustíme efekt automaticky, pokud animace nejsou zakázané
    if (!document.body.classList.contains('animations-disabled')) {
        window.startGlitching();
    }
});