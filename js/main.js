document.addEventListener('DOMContentLoaded', () => {
    const continueButton = document.getElementById('continue-button');

    if (continueButton) {
        continueButton.addEventListener('click', () => {
            console.log('Tlačítko "Pokračovat" bylo stisknuto. Restartuji animace...');
            // Zastaví a znovu spustí všechny animace, aby se "probudily"
            if (window.animationManager) {
                window.animationManager.stopAllAnimations();
                // Krátká pauza, aby se vše stihlo "uklidit"
                setTimeout(() => {
                    window.animationManager.startAllAnimations();
                    console.log('Animace restartovány.');
                }, 100);
            } else {
                console.error('Animation Manager není dostupný.');
            }
        });
    }
});
