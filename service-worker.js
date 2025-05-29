const CACHE_NAME = 'walli-czech-v3';
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/tailwind.min.css',
    '/main.js',
    '/favicon.png',
    '/favicon-512.png',
    '/og-image.jpg',
    '/logo.png',
    '/hover-sound.mp3'
];

// Cache při instalaci – ukládáme vše, co potřebujeme, jako pravý kyberpunkový prepper! 😈
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
            .then(() => self.skipWaiting())
    );
});

// Fetch z cache – když síť zkolabuje, pořád máš web! 😎
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
            .catch(() => caches.match('/index.html'))
    );
});
