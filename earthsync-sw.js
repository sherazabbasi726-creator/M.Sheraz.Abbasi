// EarthSync offline helper: keeps the app, its icons and the PDF/3D libraries on the phone.
// Live data (Firebase) is never cached here - it always goes to the internet.
const CACHE = 'earthsync-v17';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(CORE.map(u => c.add(u).catch(() => null)))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const u = new URL(req.url);
  if (/firebase|googleapis\.com\/identitytoolkit|securetoken/.test(u.hostname + u.pathname)) return; // live data: never cache
  const lib = /cdnjs\.cloudflare\.com|fonts\.googleapis\.com|fonts\.gstatic\.com/.test(u.hostname);
  if (lib) { // libraries and fonts: cache first
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put(req, c)); return r; })));
    return;
  }
  if (u.origin !== location.origin) return;
  // the app itself: newest from the internet, cached copy when offline
  e.respondWith(fetch(req).then(r => { if (r.ok) { const c = r.clone(); caches.open(CACHE).then(x => x.put(req, c)); } return r; })
    .catch(() => caches.match(req).then(hit => hit || caches.match('./index.html') || caches.match('./'))));
});
