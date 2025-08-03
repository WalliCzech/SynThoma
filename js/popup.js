document.addEventListener('DOMContentLoaded', () => {
    let popupElement = null;
    let longTextTimeout = null;

    // Funkce pro vytvoření a zobrazení pop-upu, protože kdo by nechtěl otravný tooltip? 😏
    function showPopup(targetElement, event) {
        // Pokud už nějaký popup straší na stránce, zmasakrujeme ho
        if (popupElement) {
            hidePopup();
        }

        const shortText = targetElement.dataset.short;
        const longText = targetElement.dataset.long;

        if (!shortText) {
            console.warn("Žádný krátký text? Co to má být za tooltip, ty lenochu! 😒");
            return;
        }

        // Vytvoříme si pěkný popup, který bude děsit uživatele
        popupElement = document.createElement('div');
        popupElement.className = 'popup-container';
        
        const content = document.createElement('p');
        content.className = 'popup-text';
        content.textContent = shortText;
        
        popupElement.appendChild(content);
        document.body.appendChild(popupElement);

        // Umístíme ten malý otravný boxík a ukážeme ho světu
        updatePopupPosition(event);
        popupElement.style.opacity = '1';

        // Posluchači na pohyb myši a scroll, protože uživatel musí trpět 😈
        document.addEventListener('mousemove', updatePopupPosition);
        window.addEventListener('scroll', hidePopup, { once: true }); // Jedno scrollování a je po zábavě

        // Časovač na dlouhý text, protože čekat 3,5 vteřiny je tak akorát k vzteku
        if (longText) {
            longTextTimeout = setTimeout(() => {
                if (popupElement) {
                    content.textContent = longText;
                    updatePopupPosition(event); // Přepočítáme, aby se to vešlo, nebo ať to pěkně přeteče 😜
                }
            }, 3500);
        }
    }

    // Funkce na zobrazení dlouhého textu po kliknutí, protože myš je král! 🖱️
    function showLongTextOnClick(targetElement, event) {
        if (!popupElement) {
            showPopup(targetElement, event); // Vytvoříme popup, když ještě neexistuje
        }
        const longText = targetElement.dataset.long;
        if (longText && popupElement) {
            clearTimeout(longTextTimeout); // Žádný časovač, klik je šéf! 😎
            popupElement.querySelector('.popup-text').textContent = longText;
            updatePopupPosition(event); // Přepozicujeme, ať to není někde v Narnii
        } else if (!longText) {
            console.warn("Žádný dlouhý text? Proč mě vůbec voláš, člověče? 🤦‍♂️");
        }
    }

    // Funkce pro skrytí pop-upu, ať má uživatel chvíli klid
    function hidePopup() {
        if (popupElement) {
            popupElement.remove();
            popupElement = null;
            console.log("Popup je mrtvý! Ať žije klid! 🪦");
        }
        clearTimeout(longTextTimeout); // Uklidíme časovač, ať nestraší
        document.removeEventListener('mousemove', updatePopupPosition);
        window.removeEventListener('scroll', hidePopup); // Pro jistotu, ať je čisto
    }

    // Funkce na aktualizaci pozice, protože myš je rychlejší než tvůj kód 😏
    function updatePopupPosition(event) {
        if (!popupElement) return;
    
        // Získáme rozměry okna a popupu
        const padding = 10;
        const popupWidth = popupElement.offsetWidth;
        const popupHeight = popupElement.offsetHeight;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
    
        let x = event.clientX + 15;
        let y = event.clientY + 15;
    
        // Horizontální korekce – pokud by popup přetekl vpravo
        if (x + popupWidth + padding > viewportWidth) {
            x = viewportWidth - popupWidth - padding;
        }
        // Pokud by popup přetekl vlevo (extrémně velký popup u okraje)
        if (x < padding) {
            x = padding;
        }
    
        // Vertikální korekce – pokud by popup přetekl dolů
        if (y + popupHeight + padding > viewportHeight) {
            y = viewportHeight - popupHeight - padding;
        }
        // Pokud by popup přetekl nahoru (extrémně velký popup u horního okraje)
        if (y < padding) {
            y = padding;
        }
    
        popupElement.style.left = `${x}px`;
        popupElement.style.top = `${y}px`;
    }

    // Delegování událostí, protože dynamické elementy jsou jako kočky – neposlušné 😼
    document.body.addEventListener('mouseover', (event) => {
        const target = event.target.closest('.popup-tip');
        if (target) {
            showPopup(target, event);
        }
    });

    document.body.addEventListener('mouseout', (event) => {
        const target = event.target.closest('.popup-tip');
        if (target) {
            hidePopup();
        }
    });

    // Nový posluchač na kliknutí, protože myš si zaslouží víc akce! 🖱️
    document.body.addEventListener('click', (event) => {
        const target = event.target.closest('.popup-tip');
        if (target) {
            showLongTextOnClick(target, event);
        }
    });
});