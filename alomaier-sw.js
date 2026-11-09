// Alomaier Survey 2.0 offline helper: keeps the app, its icons and the 3D / photo-reader libraries on the phone.
// Live data (Firebase) and satellite tiles are never cached here.
const CACHE = 'as2-v33';
const CORE = ['./alomaier.html', './alomaier.webmanifest', './alomaier-192.png', './alomaier-512.png', './alomaier-180.png', './three.min.js', './jspdf.umd.min.js', './jspdf.plugin.autotable.min.js', './xlsx.full.min.js'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(CORE.map(u => c.add(u).catch(() => null)))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('as2-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const u = new URL(req.url);
  if (/firebase|identitytoolkit|securetoken|arcgisonline/.test(u.hostname + u.pathname)) return;
  if (/cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net|unpkg\.com|fonts\.googleapis\.com|fonts\.gstatic\.com/.test(u.hostname)) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { if (r.ok || r.type === 'opaque') { const c = r.clone(); caches.open(CACHE).then(x => x.put(req, c)); } return r; })));
    return;
  }
  if (u.origin !== location.origin) return;
  // the app page: open at once from the phone, refresh the stored copy in the background
  // (a link with ?v=… always loads fresh – the "Update now" button uses that)
  if (req.mode === 'navigate' || /\/alomaier\.html$/.test(u.pathname)) {
    const KEY = './alomaier.html';
    const net = () => fetch(u.pathname, { cache: 'no-cache', credentials: 'same-origin' }).then(r => { if (r.ok) { const c = r.clone(); caches.open(CACHE).then(x => x.put(KEY, c)); } return r; });
    if (u.searchParams.has('v')) { e.respondWith(net().catch(() => caches.match(KEY))); return; }
    e.respondWith(caches.match(KEY).then(hit => { if (hit) { e.waitUntil(net().catch(() => null)); return hit; } return net().catch(() => caches.match(KEY)); }));
    return;
  }
  // icons and libraries: from the phone first, refreshed in the background
  e.respondWith(caches.match(req).then(hit => {
    const net = fetch(req.url, { cache: 'no-cache', credentials: 'same-origin' }).then(r => { if (r.ok) { const c = r.clone(); caches.open(CACHE).then(x => x.put(req, c)); } return r; });
    if (hit) { e.waitUntil(net.catch(() => null)); return hit; }
    return net.catch(() => caches.match('./alomaier.html'));
  }));
});
