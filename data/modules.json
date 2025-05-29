<!DOCTYPE html>
<html lang="cs">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <meta name="description" content="Moduly wAllICzech AI Studio – Kyberpunkové nástroje pro generování, dabing, upscale a analýzu."/>
    <meta property="og:title" content="Moduly – wAllICzech AI Studio"/>
    <meta property="og:description" content="Prozkoumej sadu AI modulů, co rozsekají realitu! Od FaceSwap po forenzní analýzu, vše s neonovým šmrncem. 😈⚡"/>
    <meta property="og:image" content="assets/Vallia.png"/>
    <link rel="icon" type="image/x-icon" href="assets/favicon.ico"/>
    <title>Moduly – wAllICzech AI Studio</title>
    <link rel="stylesheet" href="css/style.css"/>
</head>
<body class="bg-black text-white font-orbitron">
    <button id="theme-toggle" class="fixed top-4 right-4 z-50 neon-button px-5 py-2.5 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-neon animate-pulse">Přepnout Neon 🌌</button>

    <header class="min-h-[50vh] flex items-center justify-center bg-gradient-to-b from-black to-gray-900">
        <div class="text-center">
            <h1 class="neon-text glitch text-5xl md:text-7xl" data-text="🧩 Moduly wAllICzech">🧩 Moduly wAllICzech</h1>
            <p class="text-lg md:text-xl mt-6 max-w-3xl mx-auto opacity-90 animate-fade-in">
                Sada nástrojů, co hackne realitu rychleji, než stihneš napsat „AI“. Každej modul je jako kyberkatana – ostrý a trochu nebezpečný. 😈⚡
            </p>
        </div>
    </header>

    <main class="module-container fade-out">
        <section class="module-card card-hover" onclick="openModal('faceswap')">
            <h2 class="neon-text text-2xl">🎭 FaceSwap Modul</h2>
            <p class="mt-4">
                Vyměň obličeje jako profík. RetinaFace a YOLOv8 detekují tváře s přesností FBI, zatímco InSwapper ONNX je nahradí tak hladce, že ani tvá babička nepozná rozdíl. GFPGAN to vyleští do Hollywoodské kvality. Ideální pro memy, parodie nebo když chceš dát svýmu šéfovi obličej Shreka. 😏
            </p>
            <ul class="list-disc ml-6 mt-4 text-sm">
                <li><strong>Technologie:</strong> RetinaFace, YOLOv8, InSwapper ONNX, GFPGAN.</li>
                <li><strong>Funkce:</strong> Detekce, výměna, vylepšení obličejů.</li>
                <li><strong>Výstup:</strong> HD fotky/videa, kompatibilní s většinou formátů.</li>
                <li><strong>Použití:</strong> Memy, deepfake parodie, live streamy.</li>
            </ul>
        </section>

        <section class="module-card card-hover" onclick="openModal('dubbing')">
            <h2 class="neon-text text-2xl">🗣️ Dubbing Modul (LipSync)</h2>
            <p class="mt-4">
                Přemluv komukoliv cokoliv. Wav2Lip synchronizuje rty s novým hlasem tak, že to vypadá jako dabing od Netflixu. Vyber si hlas od robotického kyberpunku po dramatickou divu a dej videu nový život. Perfektní pro parodie nebo když chceš, aby tvůj pes zněl jako Morgan Freeman. 😎
            </p>
            <ul class="list-disc ml-6 mt-4 text-sm">
                <li><strong>Technologie:</strong> Wav2Lip, hlasové modely.</li>
                <li><strong>Funkce:</strong> Synchronizace rtů, výběr hlasu, emoce.</li>
                <li><strong>Výstup:</strong> MP4, MOV, až 1080p.</li>
                <li><strong>Použití:</strong> Animace, herní postavy, virální videa.</li>
            </ul>
        </section>

        <section class="module-card card-hover" onclick="openModal('tts')">
            <h2 class="neon-text text-2xl">🔈 TTS Modul</h2>
            <p class="mt-4">
                Text na řeč, co zní líp než většina influencerů. Bark, ElevenLabs a Coqui vytvoří hlas, co tě donutí zapomenout na Siri. Od sarkastického kyberpunku po milou babičku – vyber si styl a nech text promluvit. Ideální pro podcasty nebo když chceš, aby tvůj kód četl chyby nahlas. 🗣️
            </p>
            <ul class="list-disc ml-6 mt-4 text-sm">
                <li><strong>Technologie:</strong> Bark, ElevenLabs, Coqui.</li>
                <li><strong>Funkce:</strong> Přizpůsobení tónu, rychlosti, emocí.</li>
                <li><strong>Výstup:</strong> WAV, MP3, integrace do videa.</li>
                <li><strong>Použití:</strong> Audioknihy, voiceovery, automatizované komentáře.</li>
            </ul>
        </section>

        <section class="module-card card-hover" onclick="openModal('sdxl')">
            <h2 class="neon-text text-2xl">🎨 SDXL Generátor</h2>
            <p class="mt-4">
                Generuj umění, co by zahanbilo i Da Vinciho. Stable Diffusion XL s ControlNetem přemění tvé prompty na obrázky s detaily, které zlomí tvůj GPU. Hi-res fix a kompozice zajistí, že tvůj výstup vypadá jako z produkčního studia. Perfektní pro NFT, plakáty nebo prostě flex. 🎨
            </p>
            <ul class="list-disc ml-6 mt-4 text-sm">
                <li><strong>Technologie:</strong> Stable Diffusion XL, ControlNet.</li>
                <li><strong>Funkce:</strong> Pokročilé prompty, stylizace, hi-res fix.</li>
                <li><strong>Výstup:</strong> Až 8K, PNG/JPEG.</li>
                <li><strong>Použití:</strong> Grafika, marketing, umělecké projekty.</li>
            </ul>
        </section>

        <section class="module-card card-hover" onclick="openModal('flux')">
            <h2 class="neon-text text-2xl">🧬 Flux.dev Modul</h2>
            <p class="mt-4">
                Flux.dev je SDXL na steroidech. Generuje scény, co vypadají, jako by je maloval AI bůh z roku 2077. Animované tváře, dynamické kompozice a výstupy připravené pro lipsync nebo video. Ideální pro filmová intra nebo když chceš ohromit klienty bez rozpočtu na CGI. 😏
            </p>
            <ul class="list-disc ml-6 mt-4 text-sm">
                <li><strong>Technologie:</strong> Flux.1Dev, vlastní pipeline.</li>
                <li><strong>Funkce:</strong> Animované obličeje, dynamické scény, lipsync integrace.</li>
                <li><strong>Výstup:</strong> Vysoké rozlišení, PNG/JPEG.</li>
                <li><strong>Použití:</strong> Animace, herní assety, filmové efekty.</li>
            </ul>
        </section>

        <section class="module-card card-hover" onclick="openModal('upscale')">
            <h2 class="neon-text text-2xl">🔼 Upscale Modul</h2>
            <p class="mt-4">
                Vezme tvůj rozmazaný obrázek z flip telefonu a udělá z něj 4K masterpiece. Real-ESRGAN, CodeFormer a GFPGAN jsou jako digitální plastický chirurgové. Dávkové zpracování a náhledy ti ušetří čas, zatímco tvůj starý selfie vypadá jako z Vogue. 📸
            </p>
            <ul class="list-disc ml-6 mt-4 text-sm">
                <li><strong>Technologie:</strong> Real-ESRGAN, CodeFormer, GFPGAN.</li>
                <li><strong>Funkce:</strong> Až 4K upscale, dávkové zpracování, náhledy.</li>
                <li><strong>Výstup:</strong> JPEG, PNG, WebP.</li>
                <li><strong>Použití:</strong> Fotografie, archivní materiály, grafika.</li>
            </ul>
        </section>

        <section class="module-card card-hover" onclick="openModal('sam')">
            <h2 class="neon-text text-2xl">✂️ Segmentační Modul (SAM)</h2>
            <p class="mt-4">
                Segment Anything od Meta AI je digitální skalpel, co rozřeže obrázek přesněji než chirurg. Vytvoří masky a výřezy objektů pro AR, koláže nebo když chceš oddělit svého psa od gauče. GroundingDINO přidává extra přesnost pro složité scény. 🐶
            </p>
            <ul class="list-disc ml-6 mt-4 text-sm">
                <li><strong>Technologie:</strong> SAM, GroundingDINO.</li>
                <li><strong>Funkce:</strong> Automatická segmentace, masky, výřezy.</li>
                <li><strong>Výstup:</strong> PNG s průhledností, masky.</li>
                <li><strong>Použití:</strong> AR, grafické úpravy, preprocessing.</li>
            </ul>
        </section>

        <section class="module-card card-hover" onclick="openModal('wan')">
            <h2 class="neon-text text-2xl">🎥 WAN Modul (image-to-video)</h2>
            <p class="mt-4">
                Proměň statický obrázek na plynulou video animaci, co vypadá jako z Pixar studia. Latentní interpolace a RIFE zajistí hladké přechody, prompty umožní stylizaci. Ideální pro TikTok memy, intra nebo když chceš ohromit klienty bez rozpočtu. 🎬
            </p>
            <ul class="list-disc ml-6 mt-4 text-sm">
                <li><strong>Technologie:</strong> WAN 2.1, RIFE, latentní interpolace.</li>
                <li><strong>Funkce:</strong> Animace z obrázku, prompt-based stylizace.</li>
                <li><strong>Výstup:</strong> MP4, MOV, až 1080p.</li>
                <li><strong>Použití:</strong> Sociální sítě, prezentace, storytelling.</li>
            </ul>
        </section>

        <section class="module-card card-hover" onclick="openModal('clip_interrogator')">
            <h2 class="neon-text text-2xl">🧠 CLIP Interrogator / Tagger</h2>
            <p class="mt-4">
                AI detektiv, co prohlédne tvůj obrázek a řekne, co na něm je, rychleji než tvůj šéf najde tvé chyby. Danbooru, BLIP2 a CLIP generují tagy a popisy, ideální pro organizaci datasetů nebo když chceš zjistit, jestli je na fotce kočka nebo divný koberec. 😹
            </p>
            <ul class="list-disc ml-6 mt-4 text-sm">
                <li><strong>Technologie:</strong> Danbooru, BLIP2, CLIP.</li>
                <li><strong>Funkce:</strong> Automatické tagy, popisy, analýza obsahu.</li>
                <li><strong>Výstup:</strong> JSON, textové popisy.</li>
                <li><strong>Použití:</strong> Dataset curation, SEO, archivace.</li>
            </ul>
        </section>

        <section class="module-card card-hover" onclick="openModal('face_detector')">
            <h2 class="neon-text text-2xl">👁️ Detekce obličeje</h2>
            <p class="mt-4">
                Najde obličeje rychleji, než tvá máma najde tvé špatné známky. YOLOv8 a RetinaFace detekují tváře s přesností, zvýrazní je a umožní výřezy. Perfektní pro forenzní analýzu nebo když chceš zjistit, kolik lidí je na tvém selfíčku. 😜
            </p>
            <ul class="list-disc ml-6 mt-4 text-sm">
                <li><strong>Technologie:</strong> YOLOv8, RetinaFace, Dlib landmarks.</li>
                <li><strong>Funkce:</strong> Detekce, zvýraznění, výřezy obličejů.</li>
                <li><strong>Výstup:</strong> Bounding boxy, PNG výřezy.</li>
                <li><strong>Použití:</strong> Forenzní analýza, automatické tagování.</li>
            </ul>
        </section>

        <section class="module-card card-hover" onclick="openModal('ocr')">
            <h2 class="neon-text text-2xl">🔎 OCR Modul</h2>
            <p class="mt-4">
                Přečte text z obrázků, i když je napsaný křivě na rozmazaném plakátu. Tesseract a EasyOCR vytáhnou text a bounding boxy rychleji, než bys stačil opsat. Ideální pro digitalizaci dokumentů nebo když chceš zjistit, co je na tom starým lístku. 📜
            </p>
            <ul class="list-disc ml-6 mt-4 text-sm">
                <li><strong>Technologie:</strong> Tesseract, EasyOCR.</li>
                <li><strong>Funkce:</strong> Rozpoznávání textu, bounding boxy, strukturovaný výstup.</li>
                <li><strong>Výstup:</strong> Text, JSON, CSV.</li>
                <li><strong>Použití:</strong> Digitalizace, automatizace, archivace.</li>
            </ul>
        </section>

        <section class="module-card card-hover" onclick="openModal('forensic')">
            <h2 class="neon-text text-2xl">🕵️ Forenzní AI Analýza</h2>
            <p class="mt-4">
                Odhalí manipulace v obrázcích rychleji, než politik slíbí nesplnitelné. Analyzuje metadata, textury a kompresní vrstvy, aby našel deepfakes nebo úpravy. Perfektní pro ověřování pravosti nebo když chceš dokázat, že ten „dokonalý“ Instagram post je podvod. 🕵️
            </p>
            <ul class="list-disc ml-6 mt-4 text-sm">
                <li><strong>Technologie:</strong> deeDet, analýza metadat, textur.</li>
                <li><strong>Funkce:</strong> Detekce deepfake, heatmapy úprav, ověření pravosti.</li>
                <li><strong>Výstup:</strong> Zpráva, heatmapy, JSON.</li>
                <li><strong>Použití:</strong> Forenzní analýza, bezpečnost, ověřování obsahu.</li>
            </ul>
        </section>
    </main>

    <footer class="neon-border py-8 text-center">
        <p class="text-sm opacity-80">
            © 2025 wAllICzech AI Studio. Vytvořeno s ❤️ a kávou. Realita? Jen další pixel k rozsekání. ☕
        </p>
        <div class="flex justify-center gap-4 mt-4">
            <a href="index.html" class="text-sm hover:text-[#ff4500] transition-colors">Zpět na hlavní stránku</a>
            <a href="https://github.com" class="text-sm hover:text-[#ff4500] transition-colors">GitHub</a>
            <a href="https://docs.walliczech.ai" class="text-sm hover:text-[#ff4500] transition-colors">Dokumentace</a>
        </div>
    </footer>

    <div id="modal" class="fixed inset-0 bg-black bg-opacity-75 hidden flex items-center justify-center z-50">
        <div class="module-card p-8 max-w-lg">
            <h3 id="modal-title" class="neon-text text-2xl mb-4">Placeholder</h3>
            <p id="modal-content">Tenhle modal je zatím prázdný, protože někdo zapomněl napsat obsah. 😏</p>
            <button id="modal-close" class="neon-button pulse px-6 py-3 mt-6 rounded-full">Zavřít</button>
        </div>
    </div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
    <script src="js/scripts.js"></script>
</body>
</html>
