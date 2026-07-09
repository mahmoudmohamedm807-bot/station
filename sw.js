const CACHE_NAME = 'station-v2';
const URLS = ['./', './index.html'];

self.addEventListener('install', function(e) {
    e.waitUntil(caches.open(CACHE_NAME).then(function(c) { return c.addAll(URLS); }));
    self.skipWaiting();
});

self.addEventListener('activate', function(e) {
    e.waitUntil(caches.keys().then(function(names) {
        return Promise.all(names.filter(function(n) { return n !== CACHE_NAME; }).map(function(n) { return caches.delete(n); }));
    }));
    self.clients.claim();
});

self.addEventListener('fetch', function(e) {
    if (e.request.url.includes('firebaseio.com') || e.request.url.includes('googleapis.com')) return;
    e.respondWith(caches.match(e.request).then(function(r) {
        if (r) return r;
        return fetch(e.request).then(function(res) {
            if (!res || res.status !== 200) return res;
            var clone = res.clone();
            caches.open(CACHE_NAME).then(function(c) { c.put(e.request, clone); });
            return res;
        }).catch(function() {
            if (e.request.mode === 'navigate') return caches.match('./index.html');
        });
    }));
});