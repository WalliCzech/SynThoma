// Deklarace mammoth pro TypeScript
declare const mammoth: {
  convertToHtml: (options: { arrayBuffer: ArrayBuffer }) => Promise<{ value: string }>;
};

document.addEventListener('DOMContentLoaded', () => {
    console.log(`🛠️ docreader.ts startuje. Připrav se na literární masakr v neonovém šumu! 😏`);

    const bookContent: HTMLElement | null = document.getElementById('book-content');
    if (!bookContent) {
        console.error(`💥 Div #book-content nenalezen! HTML je prázdnější než Prázdnota po crashi! 😣`);
        return;
    }
    console.log(`📍 #book-content nalezen, jdeme dál! 😎`);

    // Načtení mammoth.js
    if (typeof mammoth === 'undefined') {
        console.warn(`🚨 Mammoth.js není načtený! Pokusím se ho přitáhnout, nebo T-AI spustí apokalypsu! 😡`);
        const script: HTMLScriptElement = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.4.2/mammoth.browser.min.js';
        script.onload = () => {
            console.log(`🎉 Mammoth.js načten dynamicky. Jdeme na .docx! 😈`);
            loadDocx();
        };
        script.onerror = () => console.error(`💀 CDN pro Mammoth.js je mrtvé! Zkus lokální kopii, nebo se modli. 😱`);
        document.head.appendChild(script);
        return;
    } else {
        console.log(`📚 Mammoth.js je ready. Jdeme rovnou na .docx! 😎`);
        loadDocx();
    }

    async function loadDocx(): Promise<void> {
        console.log(`📖 Načítám SYNTHOMA - NULL.docx. Snad to není jen další datový šum... 😈`);
        try {
            const response: Response = await fetch('SYNTHOMA - NULL.docx');
            if (!response.ok) throw new Error(`HTTP error ${response.status}`);
            const buffer: ArrayBuffer = await response.arrayBuffer();
            const result = await mammoth.convertToHtml({ arrayBuffer: buffer });
            const html: string = result.value;
            bookContent.innerHTML = html;
            console.log(`🎉 Dokument načten! ${html.length} znaků připraveno k psacímu chaosu. 😎`);
            setupTypingEffect();
        } catch (err: unknown) {
            console.error(`💀 Chyba při načítání .docx: ${String(err)}. Zkontroluj cestu, nebo čekej neonový crash! 😱`);
            bookContent.innerHTML = '<p>Chyba při načítání dokumentu. T-AI je naštvaná. 😡</p>';
        }
    }

    function setupTypingEffect(): void {
        const elements: NodeListOf<HTMLElement> = bookContent.querySelectorAll('p, h1, h2, h3, h4, h5, h6');
        if (elements.length === 0) {
            console.warn(`⚠️ Žádné odstavce k vykreslení! Dokument je prázdnější než duše NPC! 😣`);
            return;
        }
        console.log(`📜 Nalezeno ${elements.length} elementů k vypisování. Připrav se na terminálový vibe! 😏`);

        let currentElementIndex: number = 0;

        function typeElement(element: HTMLElement, callback: () => void): void {
            const text: string = element.textContent || '';
            element.textContent = '';
            element.style.opacity = '1';
            let charIndex: number = 0;
            const shouldGlitch: boolean = Math.random() < 0.3; // 30% šance na glitch

            const typeChar = () => {
                if (charIndex < text.length) {
                    element.textContent += text[charIndex];
                    charIndex++;
                    if (shouldGlitch && Math.random() < 0.1) {
                        element.classList.add('glitch-quick');
                        setTimeout(() => {
                            element.classList.remove('glitch-quick');
                        }, 180);
                    }
                    setTimeout(typeChar, 10);
                } else {
                    element.classList.remove('glitch-quick');
                    element.classList.add('typing-done');
                    console.log(`✅ Třída typing-done přidána pro element: ${element.tagName}. Kursor by měl zmizet! 😎`);
                    callback();
                }
            };

            typeChar();
        }

        const observer: IntersectionObserver = new IntersectionObserver(
            (entries: IntersectionObserverEntry[]) => {
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

        elements.forEach((element: HTMLElement, index: number) => {
            element.style.opacity = '0';
            if (index === 0) observer.observe(element);
        });

        console.log(`🖥️ Psací efekt inicializován. Text se píše jako v terminálu z pekla, bez otravného kurzoru na konci! 😏`);
    }
});