/* wAllICzech JS – Kybermagie, animace a trocha sarkasmu 😈 */
document.addEventListener('DOMContentLoaded', () => {
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const currentTheme = localStorage.getItem('theme') || 'neon';
    body.classList.toggle('neon-alt', currentTheme === 'neon-alt');
    themeToggle.textContent = currentTheme === 'neon' ? 'Přepnout Neon 🌌' : 'Přepnout Dark 🖤';

    themeToggle.addEventListener('click', () => {
        body.classList.toggle('neon-alt');
        const newTheme = body.classList.contains('neon-alt') ? 'neon-alt' : 'neon';
        localStorage.setItem('theme', newTheme);
        themeToggle.textContent = newTheme === 'neon' ? 'Přepnout Neon 🌌' : 'Přepnout Dark 🖤';
    });

    // GSAP Animations
    gsap.registerPlugin(ScrollTrigger);
    document.querySelectorAll('.fade-out').forEach(item => {
        gsap.to(item, {
            scrollTrigger: {
                trigger: item,
                start: 'top 80%',
                toggleClass: 'fade-in',
                once: true
            }
        });
    });

    // Dynamické načítání modulů
    const moduleGrid = document.getElementById('module-grid');
    if (moduleGrid) {
        fetch('data/modules.json')
            .then(response => response.json())
            .then(modules => {
                moduleGrid.innerHTML = modules.map(module => `
                    <div class="module-card card-hover p-6 cursor-pointer" onclick="openModal('${module.id}')">
                        <h3 class="neon-text text-xl">${module.icon} ${module.name}</h3>
                        <p class="text-sm mt-2">${module.description}</p>
                    </div>
                `).join('');
            })
            .catch(err => console.error('Chyba při načítání modulů. Server asi zaspal. 😜', err));
    }

    // Modální okno
    window.openModal = (id) => {
        const modal = document.getElementById('modal');
        const title = document.getElementById('modal-title');
        const content = document.getElementById('modal-content');
        
        const moduleData = {
            vallia: {
                title: 'AI Vallia',
                content: 'Vallia je tvůj kyberpunkový průvodce! Zadej příkaz jako „Vygeneruj neonový portrét“ a sleduj, jak propojuje moduly rychleji, než stihneš dopít kafe. ☕'
            },
            faceswap: {
                title: 'FaceSwap',
                content: 'Vyměň obličeje ve videích! Tvoje tvář v kyberprostoru, instantně! RetinaFace a YOLOv8 detekují, InSwapper nahradí, GFPGAN vyleští. 😎'
            },
            dubbing: {
                title: 'Dubbing (LipSync)',
                content: 'Synchronizuj rty s audiem! Wav2Lip dává tvým postavám hlas, jako by žily v neonovém světě. Perfektní pro parodie. 🗣️'
            },
            tts: {
                title: 'Text-to-Speech',
                content: 'Převeď text na hlas! Bark, ElevenLabs a Coqui dělají monology ostřejší než kyberkatana. 🎙️'
            },
            upscale: {
                title: 'Upscale',
                content: 'Zlepši rozlišení obrázků! Real-ESRGAN a GFPGAN dělají pixely tak ostré, že bys je mohl použít jako zbraň. 🔼'
            },
            sam: {
                title: 'Segmentace',
                content: 'Rozsekej objekty od pozadí! SAM a GroundingDINO řežou přesněji než laser v dystopickém filmu. ✂️'
            },
            sdxl: {
                title: 'SDXL Runner',
                content: 'Text v neonové umění! Stable Diffusion XL promění tvá slova v pixely, co by zahanbily Hollywood. 🖌️'
            },
            flux: {
                title: 'Flux Runner',
                content: 'Generuj s Flux.1! Rychlejší, ostřejší, neonovější než cokoli předtím. Připrav se na budoucnost. 🌌'
            },
            wan: {
                title: 'Wan Runner',
                content: 'Obrázky v neonových videích! Wan 2.1 roztančí tvé pixely jako v kyberklubu. 📽️'
            },
            clip_interrogator: {
                title: 'CLIP Interrogator',
                content: 'Automatické popisy a tagy obrázků. Danbooru, BLIP2 a CLIP ti ušetří čas na psaní popisků. 🧠'
            },
            face_detector: {
                title: 'Face Detector',
                content: 'Najde obličeje i ve tmě! YOLOv8 a RetinaFace detekují s přesností, co by zahanbila FBI. 👁️'
            },
            ocr: {
                title: 'OCR',
                content: 'Čti text z obrázků! Tesseract a EasyOCR přečtou i tvůj křivý rukopis na starém plakátu. ✍️'
            },
            forensic: {
                title: 'Forenzní analýza',
                content: 'Odhal deepfaky a manipulace! deeDet a analýza metadat ti ukážou, kdo lže v pixelech. 🕵️'
            }
        };

        title.textContent = moduleData[id]?.title || 'Modul nenalezen';
        content.textContent = moduleData[id]?.content || 'Něco se pokazilo. Zkus to znova, nebo si kup nový GPU. 😜';
        modal.classList.remove('hidden');
    };

    window.closeModal = () => {
        document.getElementById('modal').classList.add('hidden');
    };

    // Zavření modálního okna kliknutím na pozadí
    document.getElementById('modal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('modal')) {
            closeModal();
        }
    });

    // Zavření modálního okna klávesou Esc
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !document.getElementById('modal').classList.contains('hidden')) {
            closeModal();
        }
    });
});
