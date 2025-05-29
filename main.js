// Kyberpunkový JS, co rozsvítí tvůj web jako neonový bar v Night City! 😈
document.addEventListener('DOMContentLoaded', () => {
    // Hamburger menu – protože i kyberpunkáři mají rádi burgery! 🍔
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobile-menu');
    hamburger.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
        gsap.to(mobileMenu, { height: mobileMenu.classList.contains('hidden') ? 0 : 'auto', duration: 0.3 });
        console.log('Hamburger kliknut! Ne, fakt to není jídlo. 😅');
    });

    // Sticky navbar – přilepí se k vršku jako tvůj špatný kodérský návyk! 😜
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('bg-gray-900', 'neon-border');
        } else {
            navbar.classList.remove('bg-gray-900', 'neon-border');
        }
    });

    // Theme toggle – neon nebo CRT, vyber si svůj kyberpunkový osud! 😎
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.addEventListener('click', () => {
        document.body.dataset.theme = document.body.dataset.theme === 'neon' ? 'crt' : 'neon';
        console.log('Téma přepnuto! Neon nebo CRT, co je víc sexy? 🤔');
    });

    // Language toggle – placeholder, protože překlady jsou dražší než moje káva! ☕
    const langToggle = document.getElementById('lang-toggle');
    langToggle.addEventListener('click', () => {
        langToggle.textContent = langToggle.textContent === 'CZ' ? 'EN' : 'CZ';
        console.log('Jazyk přepnut! Ale zatím jen na oko, šéfe. 😜');
    });

    // GSAP animace – protože bez animací by to byl jen nudný web! 🚀
    gsap.utils.toArray('.fade-out').forEach(element => {
        gsap.from(element, {
            opacity: 0,
            y: 20,
            duration: 1,
            scrollTrigger: {
                trigger: element,
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            }
        });
    });

    // Hover zvuk – protože každý kyberpunkový web potřebuje *bzzzt*! 🔊
    document.querySelectorAll('.card-hover').forEach(card => {
        card.addEventListener('mouseenter', () => {
            const audio = new Audio('/hover-sound.mp3');
            audio.play().catch(() => console.log('Hover zvuk selhal! 😢 Možná máš vypnutý zvuk, šéfe.'));
        });
    });

    // Intersection Observer – aby navbar věděl, kde jsi, jako Velký bratr! 🕵️
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('#nav-links a, #mobile-menu a');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navLinks.forEach(link => {
                    link.classList.remove('neon-button');
                    if (link.getAttribute('href').substring(1) === entry.target.id) {
                        link.classList.add('neon-button');
                    }
                });
            }
        });
    }, { threshold: 0.3 });
    sections.forEach(section => observer.observe(section));
});

// Service Worker – offline mód, protože i v apokalypse chceš web! 😎
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
        .then(reg => console.log('Service Worker zaregistrován! Web přežije i výpadek Matrixu! 😎'))
        .catch(err => console.log('Service Worker selhal! 😢 Možná je čas koupit nový server.', err));
}
