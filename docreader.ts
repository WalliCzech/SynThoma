// Deklarace Mammoth.js pro TypeScript
declare const mammoth: {
    convertToHtml: (options: { arrayBuffer: ArrayBuffer }) => Promise<{ value: string }>;
};

class DocumentLoader {
    private static currentElementIndex = 0;
    private static elementsToType: HTMLElement[] = [];
    private static contentContainer: HTMLElement;
    private static tocContainer: HTMLElement;

    static async loadDocument(contentElement: HTMLElement): Promise<void> {
        try {
            console.log('🔍 Načítám dokument...');
            const docxPath = 'SYNTHOMA - NULL.docx';
            
            // Vytvoříme kontejner pro obsah a navigaci
            contentElement.innerHTML = `
                <div id="toc-container" style="margin-bottom: 2rem; padding: 1rem; background: rgba(0,0,0,0.2); border-radius: 5px;">
                    <h2 style="color: #00ff00; margin-top: 0;">Obsah</h2>
                    <div id="toc" style="display: flex; flex-wrap: wrap; gap: 1rem;"></div>
                </div>
                <div id="book-content" style="margin-top: 1rem;">
                    <p style="color: #00ff00;">⏳ Načítám dokument... Prosím počkejte.</p>
                </div>
            `;
            
            this.contentContainer = document.getElementById('book-content') as HTMLElement;
            this.tocContainer = document.getElementById('toc') as HTMLElement;
            
            // Kontrola existence Mammoth.js
            if (typeof mammoth === 'undefined') {
                throw new Error('Mammoth.js není načten!');
            }
            
            // Načtení dokumentu
            console.log('⬇️ Stahuji dokument...');
            const response = await fetch(docxPath);
            
            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}`);
            }
            
            // Konverze na HTML
            console.log('📥 Dokument stažen, konvertuji na HTML...');
            const buffer = await response.arrayBuffer();
            const result = await mammoth.convertToHtml({ arrayBuffer: buffer });
            
            // Získání HTML obsahu
            const html = result.value;
            console.log('✅ Dokument načten!');
            
            // Zobrazení obsahu s animací psaní
            this.setupContent(html);
            
        } catch (error) {
            console.error('❌ Chyba při načítání dokumentu:', error);
            let errorMessage = "Neznámá chyba";
            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === 'string') {
                errorMessage = error;
            }
            this.contentContainer.innerHTML = `
                <p style="color: #ff5555;">
                    ❌ Chyba při načítání dokumentu: ${errorMessage}
                </p>
            `;
        }
    }
    
    static setupContent(html: string): void {
        // Vytvoříme dočasný element pro manipulaci s HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        // Najdeme všechny důležité elementy
        const allElements = Array.from(tempDiv.children);
        let currentChapter = 'Úvod';
        
        // Projdeme všechny elementy a připravíme je pro psaní
        allElements.forEach((el: Element, index: number) => {
            const tagName = el.tagName.toLowerCase();
            const isHeading = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName);
            
            // Vytvoříme nový element
            const newEl = document.createElement(tagName);
            
            // Pro nadpisy vytvoříme kotvu a přidáme do obsahu
            if (isHeading) {
                currentChapter = el.textContent || `Kapitola ${index + 1}`;
                const anchor = `chapter-${index}`;
                newEl.id = anchor;
                newEl.classList.add('chapter-heading');
                
                // Přidáme do obsahu
                const level = parseInt(tagName[1]) || 1;
                const tocItem = document.createElement('a');
                tocItem.href = `#${anchor}`;
                tocItem.textContent = currentChapter;
                tocItem.style.marginLeft = `${(level - 1) * 1}rem`;
                tocItem.style.display = 'block';
                tocItem.style.color = '#00ff00';
                tocItem.style.textDecoration = 'none';
                tocItem.onclick = (e) => {
                    e.preventDefault();
                    this.jumpToChapter(anchor);
                    return false;
                };
                this.tocContainer.appendChild(tocItem);
            }
            
            // Uložíme původní obsah
            newEl.setAttribute('data-original-text', el.innerHTML);
            newEl.innerHTML = '';
            newEl.style.opacity = '0';
            newEl.style.transition = 'opacity 0.3s';
            
            // Přidáme do dokumentu
            this.contentContainer.appendChild(newEl);
            this.elementsToType.push(newEl);
        });
        
        // Spustíme psaní prvního elementu
        if (this.elementsToType.length > 0) {
            this.typeNextElement();
        }
    }
    
    static jumpToChapter(chapterId: string): void {
        const element = document.getElementById(chapterId);
        if (element) {
            // Najdeme index kapitoly
            const chapterIndex = this.elementsToType.findIndex(el => el.id === chapterId);
            if (chapterIndex !== -1) {
                // Zastavíme aktuální psaní
                this.currentElementIndex = chapterIndex;
                
                // Zobrazíme všechny předchozí elementy
                for (let i = 0; i < this.elementsToType.length; i++) {
                    const el = this.elementsToType[i];
                    if (i < chapterIndex) {
                        // Pro již napsaný text
                        el.style.opacity = '1';
                        el.innerHTML = el.getAttribute('data-original-text') || '';
                        this.applyEffects(el);
                    } else if (i === chapterIndex) {
                        // Pro aktuální kapitolu
                        el.style.opacity = '0.9';
                        el.innerHTML = '';
                        this.typeText(el, el.getAttribute('data-original-text') || '', 0);
                    } else {
                        // Pro následující kapitoly
                        el.style.opacity = '0';
                        el.innerHTML = '';
                    }
                }
                
                // Scroll k vybrané kapitole
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }
    
    static typeNextElement(): void {
        if (this.currentElementIndex < this.elementsToType.length) {
            const element = this.elementsToType[this.currentElementIndex];
            const originalText = element.getAttribute('data-original-text') || '';
            
            element.style.opacity = '0.9';
            this.typeText(element, originalText, 0);
        }
    }
    
    static typeText(element: HTMLElement, text: string, index: number): void {
        if (index < text.length) {
            // Přidáme znak
            element.innerHTML = text.substring(0, index + 1);
            
            // Náhodné zpoždění pro přirozenější psaní (rychlejší pro mezery)
            const isSpace = text[index] === ' ';
            const delay = isSpace ? 5 : Math.random() * 15 + 20; // Zrychlené psaní
            
            // Častější a výraznější glitch efekt při psaní (10% šance)
            if (!isSpace && Math.random() < 0.1) {
                const glitchChars = '!@#$%^&*()_+{}|:"<>?~`';
                const glitchLength = 3 + Math.floor(Math.random() * 8); // Více náhodných znaků
                let glitchText = '';
                
                // Vytvoříme delší a výraznější glitch efekt
                for (let i = 0; i < glitchLength; i++) {
                    glitchText += glitchChars[Math.floor(Math.random() * glitchChars.length)];
                }
                

                const glitchSpan = document.createElement('span');
                glitchSpan.className = 'glitch-char';
                glitchSpan.textContent = glitchText;
                glitchSpan.style.color = '#ff00ff';
                glitchSpan.style.textShadow = '0 0 5px #ff00ff';
                
                element.appendChild(glitchSpan);
                
                // Kratší zpoždění pro rychlejší psaní
                setTimeout(() => {
                    if (element.contains(glitchSpan)) {
                        element.removeChild(glitchSpan);
                    }
                    setTimeout(() => this.typeText(element, text, index + 1), 10);
                }, 30 + Math.random() * 50);
            } else {
                setTimeout(() => this.typeText(element, text, index + 1), delay);
            }
        } else {
            // Po dokončení psaní zobrazíme element plně
            element.style.opacity = '1';
            this.applyEffects(element);
            
            // Po krátké pauze začneme psát další element
            this.currentElementIndex++;
            const isHeading = element.classList.contains('chapter-heading');
            setTimeout(() => this.typeNextElement(), isHeading ? 500 : 100);
        }
    }
    
    static applyEffects(element: HTMLElement): void {
        // Efekty pro kurzívu
        const italicElements = element.querySelectorAll('em, i');
        italicElements.forEach(el => {
            el.classList.add('glow-text');
            const delay = Math.random() * 0.5;
            (el as HTMLElement).style.animationDelay = `${delay}s`;
        });

        // Efekty pro text v závorkách
        const speechElements = element.querySelectorAll('.speech-text');
        speechElements.forEach(el => {
            el.classList.add('speech-effect');
        });

        // Náhodné glitchování slov
        this.setupWordGlitch(element);

        // Zásadní kapitoly pro lore - přidání ASCII artu
        const loreKeywords = ['NULL', 'SYNTHOMA', 'realita', 'anomálie', 'kód'];
        const isLoreChapter = loreKeywords.some(keyword => element.textContent?.includes(keyword));
        if (isLoreChapter && Math.random() < 0.25) {
            this.showAsciiArt();
        }

    }

    static showAsciiArt(): void {
        const asciiArts = [
            `
<pre style="color: #00ff00; opacity: 0.2; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: -1; font-size: 8px; text-align: center;">
  _   _   _   _   _   _   _   _ 
 / \ / \ / \ / \ / \ / \ / \ / \ 
( S | Y | N | T | H | O | M | A )
 \_/ \_/ \_/ \_/ \_/ \_/ \_/ \_/ 
</pre>
            `,
            `
<pre style="color: #00ff00; opacity: 0.2; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: -1; font-size: 8px; text-align: center;">
  [01010011 01011001 01001110]
  [01010100 01001000 01001111]
  [01001101 01000001 00111111]
</pre>
            `
        ];

        const art = asciiArts[Math.floor(Math.random() * asciiArts.length)];
        const artContainer = document.createElement('div');
        artContainer.innerHTML = art;
        document.body.appendChild(artContainer);

        setTimeout(() => {
            document.body.removeChild(artContainer);
        }, 15000 + Math.random() * 20000);
    }

    
    static setupWordGlitch(element: HTMLElement): void {
        let mainGlitchInterval: number | null = null;

        const cleanup = () => {
            if (mainGlitchInterval) clearInterval(mainGlitchInterval);
            mainGlitchInterval = null;
        };

        const glitchWord = (word: string): string => {
            const glitchChars = '!@#$%^&*()_+{}|:"<>?~`';
            return word.split('').map(char => (char.trim() === '' ? char : glitchChars[Math.floor(Math.random() * glitchChars.length)])).join('');
        };

        const findWords = (): { node: Text; startIndex: number; endIndex: number }[] => {
            const words: { node: Text; startIndex: number; endIndex: number }[] = [];
            const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
                acceptNode: (node) => {
                    if (node.nodeValue && node.nodeValue.trim().length > 2 && node.parentNode && !node.parentNode.nodeName.match(/^(H[1-6]|A|SCRIPT|STYLE)$/)) {
                        if ((node.parentNode as HTMLElement).classList && !(node.parentNode as HTMLElement).classList.contains('glitch-word')) {
                            return NodeFilter.FILTER_ACCEPT;
                        }
                    }
                    return NodeFilter.FILTER_REJECT;
                }
            });

            let currentNode;
            while (currentNode = walker.nextNode() as Text) {
                const text = currentNode.nodeValue || '';
                const wordRegex = /\b\w{3,}\b/g; // Slova s alespoň 3 znaky
                let match;
                while ((match = wordRegex.exec(text))) {
                    words.push({ node: currentNode, startIndex: match.index, endIndex: match.index + match[0].length });
                }
            }
            return words;
        };

        const triggerGlitch = () => {
            const words = findWords();
            if (words.length === 0) return;

            const { node, startIndex, endIndex } = words[Math.floor(Math.random() * words.length)];
            const range = document.createRange();
            range.setStart(node, startIndex);
            range.setEnd(node, endIndex);

            const originalWord = range.toString();
            if (originalWord.trim().length < 3) return; 

            const glitchColors = ['#ffffff'];
            const selectedColor = glitchColors[Math.floor(Math.random() * glitchColors.length)];

            const span = document.createElement('span');
            span.className = 'glitch-word';
            span.style.color = selectedColor;
            span.style.textShadow = `0 0 5px ${selectedColor}`;
            
            try {
                range.surroundContents(span);
                
                let blinkCount = 0;
                const maxBlinks = 4 + Math.floor(Math.random() * 10); // 4-7 blinks
                const blinkInterval = setInterval(() => {
                    if (!document.body.contains(span) || blinkCount >= maxBlinks) {
                        clearInterval(blinkInterval);
                        const parent = span.parentNode;
                        if (parent) {
                            const textNode = document.createTextNode(originalWord);
                            parent.replaceChild(textNode, span);
                            parent.normalize();
                        }
                        return;
                    }

                    span.textContent = blinkCount % 2 === 0 ? glitchWord(originalWord) : originalWord;
                    blinkCount++;
                }, 50); // Ještě pomalejší blikání

            } catch (e) {
                // Ignorovat chyby, pokud se nepodaří obalit (stává se)
            }
        };

        const startGlitching = () => {
            cleanup();
            mainGlitchInterval = window.setInterval(() => {
                if (document.body.contains(element)) {
                    triggerGlitch();
                } else {
                    cleanup();
                }
            }, 4000 + Math.random() * 4000); // Ještě pomalejší spouštění
        };

        startGlitching();

        // Observer pro restart, pokud se změní obsah
        const observer = new MutationObserver(() => {
            startGlitching();
        });
        observer.observe(element, { childList: true, subtree: true });

        // Cleanup, když element zmizí
        const disconnectObserver = new MutationObserver(() => {
            if (!document.body.contains(element)) {
                cleanup();
                observer.disconnect();
                disconnectObserver.disconnect();
                window.removeEventListener('beforeunload', cleanup);
            }
        });
        disconnectObserver.observe(document.body, { childList: true, subtree: true });
        window.addEventListener('beforeunload', cleanup);
    }
    
    static initialize(): void {
        console.log('🖥️ Inicializace DocumentLoader...');
        
        const appContainer = document.getElementById('app');
        if (!appContainer) {
            console.error('❌ Element #app nenalezen!');
            return;
        }

        // Vytvoříme základní strukturu
        appContainer.innerHTML = `
            <div id="book-container" style="max-width: 800px; margin: 0 auto; padding: 20px; font-family: 'Courier New', monospace; color: #ffffff; background: #111; line-height: 1.6;">
                <h1 style="color: #0ff; text-align: center; margin-bottom: 2rem;">SYNTHOMA</h1>
                <div id="content-container"></div>
            </div>
        `;

        // Načtení dokumentu
        const contentContainer = document.getElementById('content-container');
        if (contentContainer) {
            this.loadDocument(contentContainer);
        }
    }
}

// Přidáme styly pro efekty
const style = document.createElement('style');
style.textContent = `
    .glow-text {
        color: #00ff88;
        text-shadow: 0 0 5px #00ffff, 0 0 10px #00ff88;
    }
    
    .speech-effect {
        color: #88aaff;
        font-style: italic;
    }
    
    .glitch-char {
        color: #00ffff;
        opacity: 0.7;
    }
    
    .chapter-heading {
        margin-top: 2rem;
        color: #00ffff;
        border-bottom: 1px solid #00ffff;
        padding-bottom: 0.5rem;
    }
    
    #toc a:hover {
        color: #ffffff !important;
        text-decoration: underline !important;
    }
`;
document.head.appendChild(style);

// Spuštění po načtení stránky
document.addEventListener('DOMContentLoaded', () => {
    DocumentLoader.initialize();
});