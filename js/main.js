document.addEventListener('DOMContentLoaded', () => {
    const continueButton = document.getElementById('continue-button');

    if (continueButton) {
        continueButton.addEventListener('click', () => {
            console.log('Tlačítko "Pokračovat" bylo stisknuto.');

            // 1. Restartujeme animace
            if (window.animationManager) {
                console.log('Restartuji animace...');
                window.animationManager.stopAllAnimations();
                setTimeout(() => {
                    window.animationManager.startAllAnimations();
                    console.log('Animace restartovány.');
                }, 100);
            } else {
                console.error('Animation Manager není dostupný.');
            }

            // 2. Spustíme čtečku, ale jen jednou
            if (typeof window.loadInitialReaderContent === 'function' && !document.body.classList.contains('reader-started')) {
                console.log('Spouštím SYNTHOMAREADER...');
                document.body.classList.add('reader-started'); // Označíme, že čtečka byla spuštěna
                window.loadInitialReaderContent('data/SYNTHOMAINFO.html');
            }
        });
    }
});


document.addEventListener('DOMContentLoaded', () => {

    const resizeText = () => {
        const textWrapper = document.getElementById('resizing-text');
        const textElement = document.getElementById('glitch-synthoma');

        if (!textWrapper || !textElement) return;

        // Vypočítáme dostupnou šířku. Odečteme 4rem z každé strany.
        const viewportWidth = window.innerWidth;
        const availableWidth = viewportWidth - (4 * parseFloat(getComputedStyle(document.documentElement).fontSize) * 2);
        
        // Získáme textový obsah (včetně skrytých spanů)
        const textContent = textElement.querySelector('.glitch-real').textContent;
        
        // Odhadneme, jaká velikost písma je potřeba
        // Koeficient 0.65 je empirický a můžeš si ho doladit podle svého fontu
        const newFontSize = availableWidth / (textContent.length * 0.85);
        
        // Aplikujeme novou velikost písma.
        // Omezíme minimální velikost, aby text nebyl moc malý.
        textElement.style.fontSize = `${Math.max(12, newFontSize)}px`;
        // Omezíme maximální velikost, aby text nebyl moc velký .
        textElement.style.fontSize = `${Math.min(90, newFontSize)}px`;
    };

    // Spustíme funkci při načtení stránky
    resizeText();
    
    // Spustíme funkci pokaždé, když se změní velikost okna
    window.addEventListener('resize', resizeText);
});
