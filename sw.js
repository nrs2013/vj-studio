// VJ STUDIO Service Worker — HTMLは常に最新(network-first)、素材はcache-first(オフライン対応)
const CACHE = 'vj-studio-v2';
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
  if (u.protocol !== 'https:' && u.protocol !== 'http:') return; // blob:(動画)等は触らない
  if (u.origin !== location.origin) return;

  // HTML（index.html / ナビゲーション）は network-first＝常に最新コードを取得
  const isHTML = e.request.mode === 'navigate' || u.pathname.endsWith('/') || u.pathname.endsWith('.html');
  if (isHTML) {
    e.respondWith(
      fetch(e.request).then(resp => {
        const cp = resp.clone();
        caches.open(CACHE).then(c => c.put(e.request, cp));
        return resp;
      }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
    );
    return;
  }

  // それ以外（fonts/icon等）は cache-first＝オフラインでも開ける
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(resp => {
      if (resp && resp.status === 200 && resp.type === 'basic') {
        const cp = resp.clone();
        caches.open(CACHE).then(c => c.put(e.request, cp));
      }
      return resp;
    }))
  );
});
