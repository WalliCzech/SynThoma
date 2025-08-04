// Globální funkce pro spuštění SYNTHOMAREADERu
window.startSynthomaReader = async (filePath) => {
    const readerContainer = document.getElementById('SYNTHOMAREADER');
    if (!readerContainer) {
        console.error('Chyba: Kontejner #SYNTHOMAREADER nebyl nalezen.');
        return;
    }

    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`Chyba při načítání souboru: ${response.statusText}`);
        }
        const htmlContent = await response.text();

        // Vyčistíme kontejner a připravíme ho na psaní
        readerContainer.innerHTML = '';
        readerContainer.style.display = 'block'; // Ujistíme se, že je viditelný

        // Vytvoříme dočasný element pro parsování HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;

        const elements = Array.from(tempDiv.body.firstChild.childNodes);

        // Funkce pro psaní textu s typewriter efektem
        const typeWriter = (element, index) => {
            return new Promise(resolve => {
                if (element.nodeType === Node.TEXT_NODE) {
                    const text = element.textContent;
                    let i = 0;
                    const typing = () => {
                        if (i < text.length) {
                            readerContainer.innerHTML += text.charAt(i);
                            i++;
                            setTimeout(typing, 10); // Rychlost psaní
                        } else {
                            resolve();
                        }
                    };
                    typing();
                } else if (element.nodeType === Node.ELEMENT_NODE) {
                    // Pro elementy jen přidáme jejich HTML a pokračujeme
                    readerContainer.innerHTML += element.outerHTML;
                    resolve();
                } else {
                    resolve(); // Pro ostatní typy nodů (komentáře atd.)
                }
            });
        };

        // Sekvenčně projdeme všechny elementy a vypíšeme je
        for (let i = 0; i < elements.length; i++) {
            await typeWriter(elements[i], i);
        }

        // Po dokončení psaní znovu inicializujeme efekty, pokud je potřeba
        if (window.animationManager) {
            window.animationManager.initializeEffects(readerContainer);
        }

    } catch (error) {
        console.error('Došlo k chybě v SYNTHOMAREADER:', error);
        readerContainer.innerHTML = `<p class="dialog">[SYSTEM_ERROR: Nepodařilo se načíst data. Zkuste resetovat realitu.]</p>`;
    }
};
    const contentArea = document.getElementById('content-area');
    const loadingIndicator = document.querySelector('.loading');
    const navLinks = document.querySelectorAll('.nav-link');
    const typewriterContainer = document.getElementById('typewriter-container');
    let abortController = new AbortController();
    let currentAudio = null;
    let currentTailInterval = null;

    // Seznam kapitol - dynamicky načítaný ze složky books 📚
    const chapters = [
        { title: '0-∞ [RESTART]', file: 'books/SYNTHOMA-NULL/SYNTHOMANULL[RESTART].html' },
        { title: '0-0 [NULL]', file: 'books/SYNTHOMA-NULL/SYNTHOMANULL[NULL].html' },
        { title: '0-1 [START]', file: 'books/SYNTHOMA-NULL/SYNTHOMANULL[START].html' }
    ];

    // Funkce pro dynamické načítání knih a kapitol ze složky books
    async function loadBooksFromDirectory() {
        try {
            // Pro teď používáme statický seznam, ale v budoucnu by se dal rozšířit
            // o skutečné načítání ze složky přes API endpoint 🤖
            console.log('📚 LOG [BOOKS_LOADER]: Načítám knihy... (zatím staticky, ale s láskou! 💚)');
            return chapters;
        } catch (error) {
            console.error('💥 ERROR [BOOKS_LOADER]: Něco se posralo při načítání knih!', error);
            return chapters; // Fallback na statický seznam
        }
    }




    // Funkce pro načítání obsahu
    function fetchContent(url, setActive = true) {
        if (!url) {
            console.error('📜 LOG [FETCH_DEBUG]: Cesta k souboru chybí, asi se ztratila v kyberprostoru! 😡');
            return;
        }
        abortController.abort();
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
        }
        if (currentTailInterval) {
            clearInterval(currentTailInterval);
        }
        abortController = new AbortController();
        const signal = abortController.signal;
        loadingIndicator.style.opacity = '1';
        typewriterContainer.innerHTML = '';
        if (setActive) {
            navLinks.forEach(link => link.classList.remove('active'));
            const activeLink = document.querySelector(`.nav-link[data-file='${url}']`);
            if (activeLink) activeLink.classList.add('active');
        }

        fetch(url, { signal })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(htmlContent => typewriterWrite(htmlContent, typewriterContainer, signal))
            .then(() => {
                if (window.animationManager) {
                    window.animationManager.initializeEffects(typewriterContainer);
                }
            })

    // Funkce pro zobrazení seznamu kapitol - teď s extra stylem! 🎭
    async function showChapterSelection() {
        console.log('📖 LOG [CHAPTER_SELECTION]: Zobrazuji kapitoly... Připrav se na literární zážitek! 🎪');
        
        abortController.abort();
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
        }
        if (currentTailInterval) {
            clearInterval(currentTailInterval);
        }
        
        typewriterContainer.innerHTML = '';
        navLinks.forEach(link => link.classList.remove('active'));
        const bookLink = document.querySelector('[data-action="show-chapters"]');
        if (bookLink) bookLink.classList.add('active');
        
        // Načteme aktuální seznam knih
        const availableChapters = await loadBooksFromDirectory();
        
        const chapterListContainer = document.createElement('div');
        chapterListContainer.id = 'chapter-list-container';
        chapterListContainer.className = 'visible'; // KONEČNĚ! Přidávám třídu pro zobrazení! 🎯
        chapterListContainer.innerHTML = `
            <div class="chapter-list align-center">
                <h2 class="glitch-word2 align-center glitch">::: Kapitoly :::</h2>
                <div id="chapters" class="chapters"></div>
            </div>
        `;
        typewriterContainer.appendChild(chapterListContainer);
        
        console.log('📦 LOG [CHAPTER_CONTAINER]: Kontejner vytvořen s třídou "visible"! 🎉');
        
        const chaptersContainer = document.getElementById('chapters');
        
        if (availableChapters.length === 0) {
            console.warn('⚠️ WARNING [CHAPTER_SELECTION]: Žádné kapitoly nenalezeny! Někdo asi smazal knihovnu... 📚💀');
            chaptersContainer.innerHTML = '<div class="chapter-item">Žádné kapitoly k dispozici 😢</div>';
            return;
        }
        
        availableChapters.forEach((chapter, index) => {
            const chapterElement = document.createElement('div');
            chapterElement.className = 'chapter-item';
            chapterElement.textContent = chapter.title;
            chapterElement.dataset.chapterId = index;
            chapterElement.dataset.file = chapter.file;
            chapterElement.dataset.text = chapter.title; // Pro glitch efekt
            chapterElement.style.animationDelay = `${index * 0.1}s`;
            
            chapterElement.addEventListener('click', () => {
                console.log(`📜 LOG [CHAPTER_CLICK]: Načítám kapitolu "${chapter.title}"... 🎬`);
                fetchContent(chapter.file, false);
            });
            
            chaptersContainer.appendChild(chapterElement);
        });
        
        console.log(`✅ SUCCESS [CHAPTER_SELECTION]: Zobrazeno ${availableChapters.length} kapitol. Ať čtení začne! 🚀`);
    }

    // Funkce pro přepínání aktivního stavu v navigaci
    function handleNavClick(clickedLink) {
        navLinks.forEach(link => link.classList.remove('active'));
        clickedLink.classList.add('active');
    }

    // Funkce pro inicializaci event listenerů - volaná až po zobrazení čtečky! 🎯
    function initializeEventListeners() {
        console.log('🔧 LOG [EVENT_INIT]: Inicializuji event listenery... Konečně! 😈');
        
        // Znovu najdeme navigační prvky (pro případ, že se DOM změnil)
        const currentNavLinks = document.querySelectorAll('.nav-link');
        console.log(`🔍 LOG [EVENT_INIT]: Nalezeno ${currentNavLinks.length} navigačních odkazů`);
        
        currentNavLinks.forEach((link, index) => {
            console.log(`🔗 LOG [EVENT_INIT]: Přidávám listener na odkaz ${index}: ${link.textContent}`);
            
            link.addEventListener('click', (event) => {
                event.preventDefault();
                console.log('🖱️ LOG [NAV_CLICK]: Někdo kliknul na navigaci! 🎉');
                
                handleNavClick(event.target);
                const action = event.target.dataset.action;
                const filePath = event.target.dataset.file;
                
                console.log(`📋 LOG [NAV_CLICK]: Action: ${action}, FilePath: ${filePath}`);
                
                if (action === 'show-chapters') {
                    console.log('📚 LOG [NAV_CLICK]: Spouštím showChapterSelection()!');
                    showChapterSelection();
                } else if (filePath) {
                    console.log(`📄 LOG [NAV_CLICK]: Načítám soubor: ${filePath}`);
                    fetchContent(filePath);
                } else {
                    console.error('📜 LOG [NAV_DEBUG]: Cesta k souboru nebo akce chybí, někdo to zase zvorat! 😡');
                }
            });
        });
        
        console.log('✅ LOG [EVENT_INIT]: Event listenery inicializovány! Teď by to mělo fungovat... 🤞');
    }
    
    // Globální funkce pro inicializaci - volá se z intro-sequence.js
    window.initializeReaderEventListeners = initializeEventListeners;

    // Funkce pro externí spuštění načítání obsahu, volaná např. po úvodní sekvenci
    window.loadInitialReaderContent = (filePath) => {
        console.log('🚀 LOG [INITIAL_LOAD]: Spouštím loadInitialReaderContent...');
        
        // Nejdřív inicializujeme event listenery
        initializeEventListeners();
        if (filePath) {
            const link = document.querySelector(`.nav-link[data-file='${filePath}']`);
            if (link) {
                handleNavClick(link); // Nastaví odkaz jako aktivní
            }
            fetchContent(filePath);
        } else {
            console.error('📜 LOG [INIT_DEBUG]: Nebyl poskytnut žádný soubor k načtení!');
        }
    };

    // Inteligentní psací stroj 2.0
    async function typewriterWrite(htmlContent, container, signal) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        const body = doc.body;
        container.innerHTML = '';

        const speedMin = 10; // Rychlejší pro plynulost
        const speedMax = 30;

        async function revealNode(sourceNode, targetParent) {
            if (signal.aborted) return;

            for (const childNode of Array.from(sourceNode.childNodes)) {
                if (signal.aborted) return;

                if (childNode.nodeType === Node.ELEMENT_NODE) {
                    const newElement = document.createElement(childNode.tagName);
                    for (const attr of childNode.attributes) {
                        newElement.setAttribute(attr.name, attr.value);
                    }
                    targetParent.appendChild(newElement);
                                     if (targetParent.classList && targetParent.classList.contains('glitching')) {
                        for (let i = 0; i < text.length; i++) {
                            if (signal.aborted) return;
                            targetParent.appendChild(document.createTextNode(text[i]));
                            if (window.updateGlitchingElement) {
                                window.updateGlitchingElement(targetParent);
                            }
                            const speed = Math.random() * (speedMax - speedMin) + speedMin;
                            await new Promise(resolve => setTimeout(resolve, speed));
                        }
                    } else {
                        const textNode = document.createTextNode('');
                        targetParent.appendChild(textNode);
                        for (let i = 0; i < text.length; i++) {
                            if (signal.aborted) return;
                            textNode.data += text[i];
                            const speed = Math.random() * (speedMax - speedMin) + speedMin;
                            await new Promise(resolve => setTimeout(resolve, speed));
                        }
                    }
                }
            }
        }

        await revealNode(body, container);
    }

    // Skrytí načítací obrazovky
    setTimeout(() => {
        loadingIndicator.style.opacity = '0';
        setTimeout(() => loadingIndicator.remove(), 500);
    }, 1000);
