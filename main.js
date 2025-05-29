document.addEventListener('DOMContentLoaded', () => {
    // Hamburger menu
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobile-menu');
    hamburger.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
        gsap.to(mobileMenu, { height: mobileMenu.classList.contains('hidden') ? 0 : 'auto', duration: 0.3 });
    });

    // Sticky navbar
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('bg-gray-900', 'neon-border');
        } else {
            navbar.classList.remove('bg-gray-900', 'neon-border');
        }
    });

    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.addEventListener('click', () => {
        document.body.dataset.theme = document.body.dataset.theme === 'neon' ? 'crt' : 'neon';
    });

    // Language toggle (placeholder)
    const langToggle = document.getElementById('lang-toggle');
    langToggle.addEventListener('click', () => {
        langToggle.textContent = langToggle.textContent === 'CZ' ? 'EN' : 'CZ';
        // TODO: Implementovat překlad obsahu
    });

    // GSAP animations
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

    // Hover sound effect
    document.querySelectorAll('.card-hover').forEach(card => {
        card.addEventListener('mouseenter', () => {
            const audio = new Audio('/hover-sound.mp3');
            audio.play().catch(() => console.log('Hover sound failed 😢'));
        });
    });

    // Intersection Observer for active nav links
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

// Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
        .then(reg => console.log('Service Worker Registered 😎'))
        .catch(err => console.log('Service Worker Failed 😢', err));
}