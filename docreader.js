document.addEventListener('DOMContentLoaded', () => {
    console.log(`🛠️ docreader.js startuje. Připrav se na literární jízdu bez glitchů... nebo snad ne? 😏`);

    const bookContent = document.getElementById('book-content');
    if (!bookContent) {
        console.error(`💥 Div pro text knihy nenalezen! Zkontroluj HTML, nebo skončíme v datovém pekla! 😣`);
        return;
    }

    // Načtení .docx souboru
    if (typeof mammoth === 'undefined') {
        console.error(`🚨 Mammoth.js není načtený! Přidej <script> do HTML, nebo tě T-AI pošle do smyčky restartů! 😡`);
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.4.2/mammoth.browser.min.js';
        script.onload = loadDocx;
        script.onerror = () => console.error(`💀 CDN pro Mammoth.js je mrtvé! Zkus lokální kopii, nebo se modli. 😱`);
        document.head.appendChild(script);
        return;
    } else {
        loadDocx();
    }

    function loadDocx() {
        console.log(`📖 Načítám SYNTHOMA - NULL.docx. Snad to není jen další datový šum... 😈`);
        fetch('SYNTHOMA - NULL.docx')
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error ${response.status}`);
                return response.arrayBuffer();
            })
            .then(buffer => mammoth.convertToHtml({ arrayBuffer: buffer }))
            .then(result => {
                const html = result.value;
                bookContent.innerHTML = html;
                console.log(`🎉 Dokument načten! ${html.length} znaků připraveno k vykreslení. 😎`);
                setupScrollReveal();
            })
            .catch(err => {
                console.error(`💀 Chyba při načítání .docx: ${err}. Zkontroluj cestu k souboru, nebo se připrav na neonový crash! 😱`);
                bookContent.innerHTML = '<p>Chyba při načítání dokumentu. T-AI je naštvaná. 😡</p>';
            });
    }

    // Scrollovací efekt
    function setupScrollReveal() {
        const paragraphs = bookContent.querySelectorAll('p, h1, h2, h3, h4, h5, h6');
        if (paragraphs.length === 0) {
            console.warn(`⚠️ Žádné odstavce k vykreslení! Dokument je prázdnější než Prázdnota. 😣`);
            return;
        }

        paragraphs.forEach((element, index) => {
            element.classList.add('reveal');
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            element.style.transition = `opacity 0.5s ease, transform 0.5s ease ${index * 0.1}s`;
        });

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1 }
        );

        paragraphs.forEach(element => observer.observe(element));
        console.log(`🖥️ Scrollovací efekt inicializován. Text se bude odkrývat jako tajemství T-AI. 😏`);
    }
});