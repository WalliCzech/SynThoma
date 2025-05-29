/* wAllICzech JS – Interakce, animace a trocha kybermagie 😈 */
document.addEventListener('DOMContentLoaded', () => {
    // Dark/Neon Mode Toggle
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
                    <div class="card-hover p-6 neon-border rounded-lg" onclick="openModal('${module.id}')">
                        <h3 class="text-xl">${module.icon} ${module.name}</h3>
                        <p>${module.description}</p>
                    </div>
                `).join('');
            })
            .catch(err => console.error('Chyba při načítání modulů, asi ti spadl server. 😜', err));
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
            faceswap: { title: 'FaceSwap', content: 'Vyměň obličeje ve videích! Tvoje tvář v kyberprostoru, instantně! 😎' },
            dubbing: { title: 'Dubbing (LipSync)', content: 'Synchronizuj rty s audiem – tvé postavy mluví, jako by žily v neonu! 🗣️' },
            tts: { title: 'Text-to-Speech', content: 'Převeď text na hlas! Od kybermonologů po neonové výkřiky. 🎙️' },
            upscale: { title: 'Upscale', content: 'Zlepši rozlišení obrázků! Real-ESRGAN dělá pixely ostřejší než laser. 🔼' },
            sam: { title: 'Segmentace', content: 'Rozsekej objekty od pozadí! SAM řeže přesněji než kyberkatana. ✂️' },
            sdxl: { title: 'SDXL Runner', content: 'Text v neonové umění! Stable Diffusion XL promění tvá slova v pixely. 🖌️' },
            flux: { title: 'Flux Runner', content: 'Generuj s Flux.1! Rychlejší, ostřejší, neonovější než cokoli předtím. 🌌' },
            wan: { title: 'Wan Runner', content: 'Obrázky v neonových videích! Wan model roztančí tvé pixely. 📽️' }
        };

        title.textContent = moduleData[id]?.title || 'Modul nenalezen';
        content.textContent = moduleData[id]?.content || 'Něco se pokazilo. Zkus to znova, nebo si kup nový GPU. 😜';
        modal.classList.remove('hidden');
    };

    window.closeModal = () => {
        document.getElementById('modal').classList.add('hidden');
    };
});
