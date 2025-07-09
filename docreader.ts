document.addEventListener('DOMContentLoaded', () => {
    console.log(`🛠️ docreader.ts startuje. Připrav se na literární masakr v neonovém šumu! 😏`);

    const bookContent: HTMLElement | null = document.getElementById('book-content');
    if (!bookContent) {
        console.error(`💥 Div pro text knihy nenalezen! HTML je prázdnější než mysl NPC v SynThomě! 😣`);
        return;
    }

    // Načtení .docx
    if (typeof mammoth === 'undefined') {
        console.error(`🚨 Mammoth.js není načtený! Přidej <script>, nebo T-AI spustí nekonečnou smyčku! 😡`);
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.4.2/mammoth.browser.min.js';
        script.onload = loadDocx;
        script.onerror = () => console.error(`💀 CDN pro Mammoth.js je mrtvé! Zkus lokální kopii, nebo se modli. 😱`);
        document.head.appendChild(script);
        return;
    } else {
        loadDocx();
    }

    async function loadDocx(): Promise<void> {
        console.log(`📖 Načítám SYNTHOMA - NULL.docx. Snad to není jen další datový šum... 😈`);
        try {
            const response = await fetch('SYNTHOMA - NULL.docx');
            if (!response.ok) throw new Error(`HTTP error ${response.status}`);
            const buffer = await response.arrayBuffer();
            const result = await mammoth.convertToHtml({ arrayBuffer: buffer });
            const html = result.value;
            bookContent.innerHTML = html;
            console.log(`🎉 Dokument načten! ${html.length} znaků připraveno k psacímu chaosu. 😎`);
            setupTypingEffect();
        } catch (err) {
            console.error(`💀 Chyba při načítání .docx: ${err}. Zkontroluj cestu, nebo čekej neonový crash! 😱`);
            bookContent.innerHTML = '<p>Chyba při načítání dokumentu. T-AI je naštvaná. 😡</p>';
        }
    }

    // Psací a glitch efekt
    function setupTypingEffect(): void {
        const elements: NodeListOf<HTMLElement> = bookContent.querySelectorAll('p, h1, h2, h3, h4, h5, h6');
        if (elements.length === 0) {
            console.warn(`⚠️ Žádné odstavce k vykreslení! Dokument je prázdnější než Prázdnota! 😣`);
            return;
        }

        let currentElementIndex = 0;

        function typeElement(element: HTMLElement, callback: () => void): void {
            const text = element.textContent || '';
            element.textContent = '';
            element.style.opacity = '1';
            let charIndex = 0;
            const shouldGlitch = Math.random() < 0.3; // 30% šance na glitch

            const typeChar = () => {
                if (charIndex < text.length) {
                    element.textContent += text[charIndex];
                    charIndex++;
                    if (shouldGlitch && Math.random() < 0.1) {
                        // Aplikace glitchQuick animace
                        element.classList.add('glitch-quick');
                        setTimeout(() => {
                            element.classList.remove('glitch-quick');
                        }, 180); // Doba trvání glitchQuick
                    }
                    setTimeout(typeChar, 10); // Rychlost psaní
                } else {
                    element.classList.remove('glitch-quick'); // Uklidit glitch
                    callback();
                }
            };

            typeChar();
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && currentElementIndex <= Array.from(elements).indexOf(entry.target as HTMLElement)) {
                        typeElement(entry.target as HTMLElement, () => {
                            currentElementIndex++;
                            if (currentElementIndex < elements.length) {
                                observer.observe(elements[currentElementIndex]);
                            }
                        });
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1 }
        );

        elements.forEach((element, index) => {
            element.style.opacity = '0';
            if (index === 0) observer.observe(element); // Začni s prvním
        });

        console.log(`🖥️ Psací efekt inicializován. Text se píše jako v terminálu z pekla, s glitchem! 😏`);
    }
});
