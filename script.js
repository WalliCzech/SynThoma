document.addEventListener('DOMContentLoaded', () => {
    console.log(`🛠️ Script startuje. Připrav se na neonový chaos, nebo crashneš do /dev/null! 😈`);

    const themes = [
        'default', 'cyberWeed', 'cyberPink', 'cyberBlue', 'cyberOrange', 'cyberPurple',
        'neonGrave', 'bloodRust', 'toxicSlime', 'midnightOil', 'glitchRed', 'voidPurple',
        'acidLemon', 'burntChrome', 'frostByte'
    ];
    let currentThemeIndex = 0;

    const themeSwitcher = document.getElementById('theme-switcher');
    if (themeSwitcher) {
        themeSwitcher.addEventListener('click', () => {
            currentThemeIndex = (currentThemeIndex + 1) % themes.length;
            const newTheme = themes[currentThemeIndex];
            document.documentElement.setAttribute('data-theme', newTheme);
            document.querySelector('.theme-name').textContent = newTheme;
            console.log(`🔥 Téma přepnuto na ${newTheme}! Snad to nerozbije celý systém... 😎`);
        });
        console.log(`🎉 Theme-switcher nalezen. Přepínání témat ready na rozglitchování! 😏`);
    } else {
        console.warn(`⚠️ Tlačítko theme-switcher nenalezeno! Zkontroluj HTML, nebo tě Sarkasma shodí z billboardu! 😣`);
    }

    // Glitch efekt
    document.querySelectorAll('.glitch').forEach(el => {
        const originalText = el.textContent;
        setInterval(() => {
            let glitchedText = '';
            for (let char of originalText) {
                if (Math.random() < 0.1) {
                    glitchedText += String.fromCharCode(char.charCodeAt(0) + Math.floor(Math.random() * 10) - 5);
                } else {
                    glitchedText += char;
                }
            }
            el.textContent = glitchedText;
        }, 100);
        setInterval(() => {
            if (Math.random() > 0.985) {
                el.classList.add('glitch-quick');
                setTimeout(() => el.classList.remove('glitch-quick'), 150 + Math.random() * 130);
            }
        }, 800);
    });
    console.log(`🎉 Glitch efekt inicializován! Připrav se na neonový chaos. 😎`);
});