// Service Worker – macht die App offline nutzbar.
// Bei Änderungen an den Dateien: CACHE-Version hochzählen (v1 -> v2 ...).
const CACHE = "vocabulario-v1";
const ASSETS = [
  "index.html",
  "style.css",
  "app.js",
  "vocab.js",
  "manifest.json",
  "icon-180.png",
  "icon-192.png",
  "icon-512.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((r) => r || fetch(e.request))
  );
});
