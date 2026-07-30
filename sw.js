// Service Worker – hält die App aktuell (network-first) und offline-fähig.
// network-first: online immer die neueste Version laden + Cache auffrischen;
// nur wenn offline, wird die gespeicherte Version ausgeliefert.
const CACHE = "vocabulario-v30";
const ASSETS = [
  "index.html",
  "style.css",
  "app.js",
  "vocab.js",
  "verbs.js",
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
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
