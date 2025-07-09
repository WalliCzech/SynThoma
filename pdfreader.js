document.addEventListener('DOMContentLoaded', function() {
    let pdfDoc = null;
    let pageNum = 1;
    let pageRendering = false;
    let pageNumPending = null;
    const scale = 1.1;
    const canvas = document.getElementById('pdf-canvas');
    const ctx = canvas ? canvas.getContext('2d') : null;
    const pageCountLabel = document.getElementById('page-count');
    const pageCurrentLabel = document.getElementById('page-num');

    if (!canvas || !ctx) {
        console.error(`💥 Canvas pro PDF nenalezen! Zkontroluj HTML, nebo tohle skončí v /dev/null. 😣`);
        return;
    }

    // PDF.js inicializace
    if (typeof pdfjsLib === 'undefined') {
        console.error(`🚨 PDF.js není načtený! Přidej <script> pro PDF.js do HTML, nebo tě T-AI pošle do smyčky restartů! 😡`);
        // Fallback: Pokus o dynamické načtení PDF.js
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.6.347/pdf.min.js';
        script.onload = initPDF;
        script.onerror = () => console.error(`💀 CDN pro PDF.js je mrtvé! Zkus lokální kopii, nebo se modli. 😱`);
        document.head.appendChild(script);
        return;
    } else {
        initPDF();
    }

    function initPDF() {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.6.347/pdf.worker.min.js';
        console.log(`🛠️ PDF.js inicializován. Worker připraven k drcení dat. 😎`);

        pdfjsLib.getDocument('SYNTHOMA - NULL.pdf').promise.then(function(pdfDoc_) {
            pdfDoc = pdfDoc_;
            pageCountLabel.textContent = pdfDoc.numPages;
            renderPage(pageNum);
            console.log(`📖 PDF načteno! ${pdfDoc.numPages} stran připraveno k rozglitchování. 😈`);
        }).catch(err => {
            console.error(`💀 Chyba při načítání PDF: ${err}. Zkontroluj cestu k SYNTHOMA - NULL.pdf, nebo se připrav na neonový crash! 😱`);
        });
    }

    function renderPage(num) {
        pageRendering = true;
        pdfDoc.getPage(num).then(function(page) {
            const viewport = page.getViewport({ scale: scale });
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            const renderContext = { canvasContext: ctx, viewport: viewport };
            const renderTask = page.render(renderContext);

            renderTask.promise.then(function() {
                pageRendering = false;
                if (pageNumPending !== null) {
                    renderPage(pageNumPending);
                    pageNumPending = null;
                }
            });
        }).catch(err => {
            console.error(`🔥 Chyba při renderování stránky ${num}: ${err}. Snad to není konec světa. 😣`);
        });

        pageCurrentLabel.textContent = num;
        pageCountLabel.textContent = pdfDoc.numPages;
    }

    function queueRenderPage(num) {
        if (pageRendering) {
            pageNumPending = num;
        } else {
            renderPage(num);
        }
    }

    function onPrevPage() {
        if (pageNum <= 1) return;
        pageNum--;
        queueRenderPage(pageNum);
        console.log(`⬅️ Předchozí stránka ${pageNum}. Snad tam není glitch. 😏`);
    }

    function onNextPage() {
        if (pageNum >= pdfDoc.numPages) return;
        pageNum++;
        queueRenderPage(pageNum);
        console.log(`➡️ Další stránka ${pageNum}. Připrav se na neonový šok. 😈`);
    }

    // Glitch efekt na canvas
    function randomGlitch() {
        if (Math.random() > 0.985) {
            canvas.classList.add("glitch-quick");
            setTimeout(() => canvas.classList.remove("glitch-quick"), 250 + Math.random() * 200);
        }
        requestAnimationFrame(randomGlitch);
    }
    randomGlitch();

    const prevButton = document.getElementById('prev');
    const nextButton = document.getElementById('next');
    if (prevButton && nextButton) {
        prevButton.addEventListener('click', onPrevPage);
        nextButton.addEventListener('click', onNextPage);
    } else {
        console.warn(`⚠️ Navigační tlačítka (prev/next) nenalezena! PDF viewer je bez ovládání. 😣`);
    }
});