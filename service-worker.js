const CACHE_NAME = 'walli-czech-v2';
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/tailwind.min.css',
    '/main.js',
    '/favicon.png',
    '/og-image.jpg',
    '/hover-sound.mp3'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
            .catch(() => caches.match('/index.html'))
    );
});