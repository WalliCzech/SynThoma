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
                    <div class="card-hover p-6 neon-border rounded-LG" onclick="openModal('${module.id}')">
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
            // Další moduly...
        };

        title.textContent = moduleData[id]?.title || 'Modul nenalezen';
        content.textContent = moduleData[id]?.content || 'Něco se pokazilo. Zkus to znova, nebo si kup nový GPU. 😜';
        modal.classList.remove('hidden');
    };

    window.closeModal = () => {
        document.getElementById('modal').classList.add('hidden');
    };
});
