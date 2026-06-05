// VJ STUDIO Service Worker — オフライン対応（静的アセットのみキャッシュ）
const CACHE = 'vj-studio-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './fonts/bebas-neue.woff2',
  './fonts/inter-400.woff2',
  './fonts/inter-600.woff2'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.map(k => k === CACHE ? null : caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  let u;
  try { u = new URL(e.request.url); } catch (_) { return; }
  // blob:（動画）・data:・他オリジンは触らない＝通常どおり再生
  if (u.protocol !== 'https:' && u.protocol !== 'http:') return;
  if (u.origin !== location.origin) return;
  // 静的アセットは cache-first（オフラインでも開ける）
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(resp => {
      if (resp && resp.status === 200 && resp.type === 'basic') {
        const cp = resp.clone();
        caches.open(CACHE).then(c => c.put(e.request, cp));
      }
      return resp;
    }).catch(() => caches.match('./index.html')))
  );
});
