let noiseInterval;

function applyNoising(selector, probability = 0.015, interval = 1200) {
    const element = document.querySelector(selector);
    if (!element || element.dataset.noisingActive === 'true') return;

    element.dataset.noisingActive = 'true';
    const originalText = element.textContent;
    element.dataset.originalText = originalText;

    element.innerHTML = originalText.split('').map(char => 
        char === ' ' ? ' ' : `<span class="noising-char">${char}</span>`
    ).join('');

    const chars = element.querySelectorAll('.noising-char');

    noiseInterval = setInterval(() => {
        chars.forEach(charEl => {
            if (Math.random() < probability) {
                charEl.classList.add('noising');
                setTimeout(() => {
                    charEl.classList.remove('noising');
                }, 200);
            }
        });
    }, interval);
}

function removeNoising(selector) {
    const element = document.querySelector(selector);
    if (!element || element.dataset.noisingActive !== 'true') return;

    clearInterval(noiseInterval);
    element.innerHTML = element.dataset.originalText;
    delete element.dataset.noisingActive;
}

window.startNoising = function() {
    if (document.body.classList.contains('animations-disabled')) return;
    console.log('Starting Noising Effect...');
    applyNoising('.noising');
};

window.stopNoising = function() {
    console.log('Stopping Noising Effect...');
    removeNoising('.noising');
};

document.addEventListener('DOMContentLoaded', () => {
    // Spustíme efekt automaticky, pokud animace nejsou zakázané
    if (!document.body.classList.contains('animations-disabled')) {
        window.startNoising();
    }
});