var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
document.addEventListener('DOMContentLoaded', () => {
    console.log(`🛠️ docreader.ts startuje. Připrav se na literární masakr v neonovém šumu! 😏`);
    const bookContent = document.getElementById('book-content');
    if (!bookContent) {
        console.error(`💥 Div #book-content nenalezen! HTML je prázdnější než Prázdnota po crashi! 😣`);
        return;
    }
    console.log(`📍 #book-content nalezen, jdeme dál! 😎`);
    // Načtení mammoth.js
    if (typeof mammoth === 'undefined') {
        console.warn(`🚨 Mammoth.js není načtený! Pokusím se ho přitáhnout, nebo T-AI spustí apokalypsu! 😡`);
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.4.2/mammoth.browser.min.js';
        script.onload = () => {
            console.log(`🎉 Mammoth.js načten dynamicky. Jdeme na .docx! 😈`);
            loadDocx();
        };
        script.onerror = () => console.error(`💀 CDN pro Mammoth.js je mrtvé! Zkus lokální kopii, nebo se modli. 😱`);
        document.head.appendChild(script);
        return;
    }
    else {
        console.log(`📚 Mammoth.js je ready. Jdeme rovnou na .docx! 😎`);
        loadDocx();
    }
    function loadDocx() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`📖 Načítám SYNTHOMA - NULL.docx. Snad to není jen další datový šum... 😈`);
            try {
                const response = yield fetch('SYNTHOMA - NULL.docx');
                if (!response.ok)
                    throw new Error(`HTTP error ${response.status}`);
                const buffer = yield response.arrayBuffer();
                const result = yield mammoth.convertToHtml({ arrayBuffer: buffer });
                const html = result.value;
                bookContent.innerHTML = html;
                console.log(`🎉 Dokument načten! ${html.length} znaků připraveno k psacímu chaosu. 😎`);
                setupTypingEffect();
            }
            catch (err) {
                console.error(`💀 Chyba při načítání .docx: ${String(err)}. Zkontroluj cestu, nebo čekej neonový crash! 😱`);
                bookContent.innerHTML = '<p>Chyba při načítání dokumentu. T-AI je naštvaná. 😡</p>';
            }
        });
    }
    function setupTypingEffect() {
        const elements = bookContent.querySelectorAll('p, h1, h2, h3, h4, h5, h6');
        if (elements.length === 0) {
            console.warn(`⚠️ Žádné odstavce k vykreslení! Dokument je prázdnější než duše NPC! 😣`);
            return;
        }
        console.log(`📜 Nalezeno ${elements.length} elementů k vypisování. Připrav se na terminálový vibe! 😏`);
        let currentElementIndex = 0;
        function typeElement(element, callback) {
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
                        element.classList.add('glitch-quick');
                        setTimeout(() => {
                            element.classList.remove('glitch-quick');
                        }, 180);
                    }
                    setTimeout(typeChar, 10);
                }
                else {
                    element.classList.remove('glitch-quick');
                    callback();
                }
            };
            typeChar();
        }
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && currentElementIndex <= Array.from(elements).indexOf(entry.target)) {
                    typeElement(entry.target, () => {
                        currentElementIndex++;
                        if (currentElementIndex < elements.length) {
                            observer.observe(elements[currentElementIndex]);
                        }
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        elements.forEach((element, index) => {
            element.style.opacity = '0';
            if (index === 0)
                observer.observe(element);
        });
        console.log(`🖥️ Psací efekt inicializován. Text se píše jako v terminálu z pekla, s glitchem! 😏`);
    }
});
