// Intro sekvence pro SYNTHOMA Reader
document.addEventListener('DOMContentLoaded', () => {
    // KONSTANTA VE STYLU ZOMBIE: Text manifestu
    const MANIFEST_TEXT = "Tma nikdy není opravdová, je jen světlem, které se vzdalo smyslu.";
    
    // Kontejnery a elementy
    const manifestContainer = document.getElementById('manifest-container');
    const continueButtonContainer = document.getElementById('continue-button-container');
    const continueButton = document.getElementById('continue-button');
    const readerContent = document.getElementById('reader-content');
    
    // Funkce kontrolující existenci shinning efektu
    function isShinningSupportedFn() {
        return typeof window.startShinning === 'function';
    }
    
    // =======================================
    // SUPER ZOMBIE OCHRANA PŘED ANIMATION MANAGEREM
    // =======================================
    function setupZombieProtection() {
        // 1. Uložíme originální funkce, které budeme měnit
        const originalStopShinning = window.stopShinning;
        const originalStopAll = window.animationManager ? window.animationManager.stopAll : null;
        
        // 2. Udržuje stav textu manifestu
        let savedManifestHTML = '';
        
        // 3. Uchovej stav manifestu před jakýmkoliv zásahem
        function saveManifestState() {
            if (manifestContainer && manifestContainer.innerHTML) {
                console.log('🤡 ZOMBIE: Ukládám stav manifestu pro přežití!'); 
                savedManifestHTML = manifestContainer.innerHTML;
                // Uložíme i jako dataset pro záložní obnovu přímo v DOM
                manifestContainer.dataset.zombieContent = savedManifestHTML;
            }
        }
        
        // 4. Obnov manifest pokud byl smazán
        function restoreManifest() {
            if (manifestContainer && savedManifestHTML && !manifestContainer.innerHTML.trim()) {
                console.log('💥 ZOMBIE OŽIVEN: Obnovení zmizelého textu manifestu!');
                manifestContainer.innerHTML = savedManifestHTML;
                manifestContainer.classList.add('shinning');
                
                // Reset shinning efektu pokud existuje funkce
                if (typeof window.startShinning === 'function') {
                    try {
                        window.startShinning();
                    } catch (e) {
                        console.error('ZOMBIE ERR: Nelze obnovit shinning', e);
                    }
                }
            }
        }
        
        // 5. Přepisujeme funkci stopShinning, aby ignorovala náš manifest!
        if (typeof window.stopShinning === 'function') {
            console.log('💀 ZOMBIE PATCH: Nahrazuji stopShinning...');
            window.stopShinning = function() {
                // Uložíme stav manifestu před akcí originální funkce
                saveManifestState();
                
                // Zavoláme originální funkci
                if (originalStopShinning) originalStopShinning();
                
                // Obnovíme manifest
                setTimeout(restoreManifest, 50);
                setTimeout(restoreManifest, 250); // Dvojité jištění pro vytížené systémy
            };
        }
        
        // 6. Přepisujeme také stopAll v animationManageru, aby nám neponizel manifest
        if (window.animationManager && typeof window.animationManager.stopAll === 'function') {
            console.log('💀 ZOMBIE PATCH: Nahrazuji animationManager.stopAll...');
            window.animationManager.stopAll = function() {
                // Uložíme stav manifestu před akcí
                saveManifestState();
                
                // Zavoláme originální funkci
                if (originalStopAll) originalStopAll.call(window.animationManager);
                
                // Obnovíme manifest
                setTimeout(restoreManifest, 50);
                setTimeout(restoreManifest, 250); // Dvojité jištění pro vytížené systémy
            };
        }
        
        // 7. Přidáváme MutationObserver pro sledování změn v manifestu
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.target === manifestContainer && 
                    mutation.type === 'childList' &&
                    !manifestContainer.innerHTML.trim() && 
                    savedManifestHTML) {
                    console.log('💥 OBSERVER: Manifest byl vymazán! Obnovení...');
                    setTimeout(() => {
                        restoreManifest();
                        if (typeof window.startShinning === 'function') {
                            window.startShinning();
                        }
                    }, 50);
                }
            });
        });
        
        observer.observe(manifestContainer, {
            childList: true,
            subtree: true,
            characterData: true
        });
        
        // 8. Záložní interval pro pravidelné kontroly, že máme stav uložený
        let zombieInterval = setInterval(() => {
            // Ukládáme obsah, pokud je v manifestu něco k uložení
            if (manifestContainer && manifestContainer.innerHTML.trim()) {
                saveManifestState();
            } 
            // Obnovujeme obsah, pokud je manifest prázdný ale máme co obnovit
            else if (manifestContainer && !manifestContainer.innerHTML.trim() && savedManifestHTML) {
                restoreManifest();
            }
        }, 1000);
        
        // Vrať funkci pro čištění intervalů, kdyby bylo potřeba
        return function cleanup() {
            observer.disconnect();
            clearInterval(zombieInterval);
        };
    }
    
    // Nastartujeme zombifikovanou ochranu před zásahem animation managera
    const zombieCleanup = setupZombieProtection();
    
    // ZOMBIE OPRAVUJE: Vyčistíme kontejner od všech mých pokusů
    manifestContainer.innerHTML = '';
    
    // FIX: Zjištění existence shinning skriptu
    const isShiningSupported = typeof window.startShinning === 'function' && 
                              typeof window.stopShinning === 'function';
    
    console.log('ZOMBIE LOG: 💥 Shinning skripty ' + (isShiningSupported ? 'EXISTUJÍ 😈' : 'NEEXISTUJÍ 😭'));
    
    /**
     * Vytvoření struktury pro shinning efekt - rozdělí text na jednotlivé 
     * znaky obalene ve span s potřebnými třídami
     */
    function createShiningHTML(text) {
        let html = '';
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            if (char === ' ') {
                html += ' ';
            } else {
                html += `<span class="neon-char bright">${char}</span>`;
            }
        }
        return html;
    }
    
    /**
     * Nový typewriter efekt - mnohem jednodušší a funkční čistý přístup
     * - Vypisuje text přímo jako span elementy s náležitou třídou
     * - Vůbec nemodifikuje DOM vícekrát, jen jednou zapíše výsledek
     * - Po ukončení aktivuje shinning efekt pomocí původního skriptu
     */
    async function typewriterEffect() {
        // 0. Ujistíme se, že manifest je prázdný a tlačítko skryté
        manifestContainer.innerHTML = '';
        continueButtonContainer.classList.add('hidden');
        
        // 1. Nastavíme parametry efektu
        const speedMin = 50; // ms
        const speedMax = 120; // ms
        const text = MANIFEST_TEXT;
        let currentHTML = '';
        
        // !!! ZOMBIE FIX !!! Přidáváme shinning třídu, bez ní to nefunguje!!!
        manifestContainer.classList.add('shinning');
        
        // 2. Postupně vypisujeme každý znak jako span element
        try {
            for (let i = 0; i < text.length; i++) {
                // Přidáme znak buď jako span nebo jako mezeru
                if (text[i] === ' ') {
                    currentHTML += ' ';
                } else {
                    currentHTML += `<span class="neon-char bright">${text[i]}</span>`;
                }
                
                // Aktualizujeme obsah a čekáme
                manifestContainer.innerHTML = currentHTML;
                
                // Náhodná prodleva pro přirozenější efekt
                const delay = Math.random() * (speedMax - speedMin) + speedMin;
                await new Promise(resolve => setTimeout(resolve, delay));
            }
            
            // 🤡 VÝpis ZOMBIE: Pokud jsme se dostali sem, typování bylo dokončeno
            console.log('🤡 Typování HOTOVO! - Aktivuji shinning efekt...');
            
            // 3. Aktivace shinning efektu - TED UZ OPRAVDU FUNGUJICI ZOMBIE VERZE!!!
            try {
                console.log('💥 ZOMBIE KONECNE OZIVUJE SHINNING EFEKT! 💥');
                
                // Zajistíme, že máme správné třídy
                if (!manifestContainer.classList.contains('shinning')) {
                    console.log('🔥 Přidávám shinning třídu na manifest!'); 
                    manifestContainer.classList.add('shinning');
                }
                
                // MOCNÉ ZOMBIE OŽIVENÍ: Víme, že startShinning() bere selektor '.shinning'
                // a s ním pracuje. Zajistíme, že funkce bude volána až PO kompletním vykreslení DOM!
                setTimeout(() => {
                    if (typeof window.startShinning === 'function') {
                        // Právě teď by měl manifest mít všechny span tagy s classou "neon-char bright"
                        window.startShinning();
                        console.log('✨✨✨ SHINNING BYL AKTIVOVÁN! ✨✨✨');
                    } else {
                        console.error('⚠️ KRITICKÁ CHYBA: window.startShinning neexistuje!');
                        // Záložní řešení - pokusme se reaplikovat flicker efekt přímo
                        const flickerChars = manifestContainer.querySelectorAll('.neon-char');
                        console.log(`Našel jsem ${flickerChars.length} znaků k animaci...`);
                        
                        // Pokud nemáme startShinning, vytvoříme vlastní flicker 
                        flickerChars.forEach(char => {
                            setTimeout(() => {
                                char.classList.add('flickering');
                                setTimeout(() => char.classList.remove('flickering'), 100 + Math.random() * 200);
                            }, Math.random() * 2000);
                        });
                    }
                }, 100); // Počkáme na vykreslení DOM
                
                // Nikdy není dost jištění
                setTimeout(() => {
                    // Druhý pokus o aktivaci (pro jistotu)
                    if (typeof window.startShinning === 'function') {
                        window.startShinning();
                    }
                }, 500);
                
            } catch (e) {
                console.error('💥 ZOMBIE ERR: Selhalo aktivování shinning efektu:', e);
            }
            
            // 4. Po krátké prodlevě zobrazíme tlačítko
            setTimeout(() => {
                continueButtonContainer.classList.remove('hidden');
                continueButton.classList.add('fade-in');
                console.log('🤡 Tlačítko ODHALENO!');
            }, 800);
            
        } catch (error) {
            // Pokud něco selže, přímo vložíme celý text s efektem
            console.error('🤡 Chyba při typewriter efektu:', error);
            manifestContainer.innerHTML = createShiningHTML(text);
            
            // Obnovíme shinning efekt a zobrazíme tlačítko
            if (isShiningSupported) window.startShinning();
            
            continueButtonContainer.classList.remove('hidden');
            continueButton.classList.add('fade-in');
        }
    }
    
    /**
     * Přehrání hudby - hledá různé možnosti přehrávačů
     * ZOMBIE FIX: Použito správné ID 'play-pause-btn' místo 'audio-play-button'
     */
    function playBackgroundMusic() {
        try {
            console.log('💥 ZOMBIE ŘVE: Spouštím hudební podkres apokalypsy!');
            
            // 1. Nejprve zkusíme tlačítko z HTML - ID=play-pause-btn
            const playPauseBtn = document.getElementById('play-pause-btn');
            if (playPauseBtn) {
                console.log('🎵 Nalezeno tlačítko pro přehrávání - klikám na něj!');
                playPauseBtn.click();
                return true;
            }
            
            // 2. Záložní varianta - audio přes querySelector
            const playButton = document.querySelector('#audio-play-button');
            if (playButton) {
                console.log('🎵 Nalezen sekundární přehrávač');
                playButton.click();
                return true;
            }
            
            // 3. Přímé přehrání pomocí audio elementu
            const audioPlayer = document.querySelector('audio');
            if (audioPlayer) {
                console.log('🎵 Přímé přehrání audia - může selhat kvůli zásahu ZOMBIE BLOKERŮ!');
                audioPlayer.play().catch(e => {
                    console.error('😱 Autoplay selhalo:', e);
                    console.log('Uživatel musí kliknout na přehrávač!');
                    
                    // Jestli máme fallback tlačítko, použijeme ho
                    if (playPauseBtn) {
                        console.log('Zkusme fallback přehrání po chybě...');
                        setTimeout(() => playPauseBtn.click(), 500);
                    }
                });
                return true;
            }
            
            console.error('💥 Žádný zombie přehrávač nebyl nalezen! MRTVO TICHO.');
            return false;
        } catch (e) {
            console.error('💥 ZOMBIE PŘEHRÁVAČ EXPLODOVAL:', e);
            return false;
        }
    }
    
    // Spustíme celý proces po načtení stránky
    setTimeout(() => {
        console.log('💥 ZOMBIE INICIOVÁN! Spouštím sekvenci...');
        // Nejprve se ujistíme, že tlačítko je skryté
        continueButtonContainer.classList.add('hidden');
        
        // Nastartujeme typewriter efekt
        typewriterEffect();
    }, 1000);
    
    // Tlačítko Pokračovat - odhaluje obsah a spouští zvuk
    continueButton.addEventListener('click', () => {
        console.log('💀 Uživatel klikl na Pokračovat!');
        
        // 1. Spustit audio
        playBackgroundMusic();
        
        // 2. Animace tlačítka - odchod
        continueButton.classList.remove('fade-in');
        continueButton.classList.add('fade-out');
        
        // 3. Po krátké prodlevě skrýt tlačítko a ukázat čtečku
        setTimeout(() => {
            // Skrýt kontejner s tlačítkem
            continueButtonContainer.classList.add('hidden');
            
            // Zobrazit obsah čtečky s pěknou animací
            readerContent.classList.remove('hidden');
            readerContent.classList.add('fade-in');
            
            console.log('🔥 ČTEČKA AKTIVOVÁNA!');
            
            // Inicializace event listenerů pro čtečku - KONEČNĚ! 🎯
            setTimeout(() => {
                if (typeof window.initializeReaderEventListeners === 'function') {
                    console.log('🔧 INTRO: Volám inicializaci event listenerů...');
                    window.initializeReaderEventListeners();
                } else {
                    console.error('💥 INTRO ERROR: Funkce initializeReaderEventListeners nebyla nalezena! 😱');
                }
            }, 100); // Krátká prodleva pro ujištění, že DOM je připravený
            
        }, 500); // Prodleva pro animaci
    });
}); // Konec DOMContentLoaded
