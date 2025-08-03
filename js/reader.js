document.addEventListener('DOMContentLoaded', () => {
    const contentArea = document.getElementById('content-area');
    const loadingIndicator = document.querySelector('.loading');
    const navLinks = document.querySelectorAll('.nav-link');
    const typewriterContainer = document.getElementById('typewriter-container');
    let abortController = new AbortController();
    let currentAudio = null;
    let currentTailInterval = null;

    // Seznam kapitol
    const chapters = [
        { title: '0-∞ [RESTART]', file: 'books/SYNTHOMA-NULL/SYNTHOMANULL[RESTART].html' },
        { title: '0-0 [NULL]', file: 'books/SYNTHOMA-NULL/SYNTHOMANULL[NULL].html' },
        { title: '0-1 [START]', file: 'books/SYNTHOMA-NULL/SYNTHOMANULL[START].html' }
    ];




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
            .then(htmlContent => {
                typewriterWrite(htmlContent, typewriterContainer, signal);
            })
            .catch(error => {
                if (error.name !== 'AbortError') {
                    console.error('📜 LOG [FETCH_ERROR]: Chyba při načítání obsahu, asi sabotáž! 💣', error);
                    typewriterContainer.innerHTML = `<p class="dialogS">**Chyba:** Nelze načíst obsah. Síťová chyba nebo poškozený soubor.</p>`;
                }
            })
            .finally(() => {
                loadingIndicator.style.opacity = '0';
                setTimeout(() => loadingIndicator.remove(), 500);
            });
    }

    // Funkce pro zobrazení seznamu kapitol
    function showChapterSelection() {
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
        const chapterListContainer = document.createElement('div');
        chapterListContainer.id = 'chapter-list-container';
        chapterListContainer.innerHTML = `
            <div class="chapter-list align-center">
                <h2 class="glitch-word2 align-center">::: KAPITOLY :::</h2>
                <div id="chapters" class="chapters"></div>
            </div>
        `;
        typewriterContainer.appendChild(chapterListContainer);
        const chaptersContainer = document.getElementById('chapters');
        chapters.forEach((chapter, index) => {
            const chapterElement = document.createElement('div');
            chapterElement.className = 'chapter-item';
            chapterElement.textContent = chapter.title;
            chapterElement.dataset.chapterId = index;
            chapterElement.dataset.file = chapter.file;
            chapterElement.style.animationDelay = `${index * 0.1}s`;
            chapterElement.addEventListener('click', () => {
                fetchContent(chapter.file, false);
            });
            chaptersContainer.appendChild(chapterElement);
        });
    }

    // Funkce pro přepínání aktivního stavu v navigaci
    function handleNavClick(clickedLink) {
        navLinks.forEach(link => link.classList.remove('active'));
        clickedLink.classList.add('active');
    }

    // Inicializace event listenerů
    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            handleNavClick(event.target);
            const action = event.target.dataset.action;
            const filePath = event.target.dataset.file;
            if (action === 'show-chapters') {
                showChapterSelection();
            } else if (filePath) {
                fetchContent(filePath);
            } else {
                console.error('📜 LOG [NAV_DEBUG]: Cesta k souboru nebo akce chybí, někdo to zase zvorat! 😡');
            }
        });
    });

    // Načtení výchozího obsahu a nastavení aktivního stavu
    const defaultLink = navLinks[0];
    const defaultFilePath = defaultLink.dataset.file;
    if (defaultFilePath) {
        fetchContent(defaultFilePath);
    } else {
        console.error('📜 LOG [INIT_DEBUG]: Výchozí soubor nenalezen, asi ho ukradli mimozemšťani! 👽');
    }

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
                    await revealNode(childNode, newElement);
                } else if (childNode.nodeType === Node.TEXT_NODE) {
                    const text = childNode.textContent;
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

        await revealNode(body, container);
    }

    // Skrytí načítací obrazovky
    setTimeout(() => {
        loadingIndicator.style.opacity = '0';
        setTimeout(() => loadingIndicator.remove(), 500);
    }, 1000);
});