/* Bao Chinese — offline shell. No build step, no dependencies. */
// Bump this on every deploy so cache-first assets are invalidated.
const VERSION = 'bao-v0.1.0';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './src/css/app.css',
  './src/js/app.js',
  './src/js/core.js',
  './src/js/audio.js',
  './src/js/pinyin.js',
  './src/js/lesson-engine.js',
  './src/data/course.js',
  './src/js/ui/common.js',
  './src/js/ui/onboarding.js',
  './src/js/ui/home.js',
  './src/js/ui/lesson.js',
  './src/js/ui/review.js',
  './src/js/ui/words.js',
  './src/js/ui/profile.js',
  './assets/icon.svg',
  './assets/icon-maskable.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(VERSION)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== VERSION).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('./index.html').then((response) => response || caches.match('./')))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(VERSION).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});
