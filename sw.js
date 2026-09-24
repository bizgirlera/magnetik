// Magnétik : fonctionnement hors connexion. Change VERSION à chaque mise à jour de l'app.
const VERSION = "magnetik-v3";
const FICHIERS = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "apple-touch-icon.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FICHIERS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
// Page : réseau d'abord (pour recevoir les mises à jour), cache si hors connexion.
// Autres fichiers : cache d'abord, puis mise en cache au passage.
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then((r) => { const copy = r.clone(); caches.open(VERSION).then((c) => c.put("index.html", copy)); return r; })
      .catch(() => caches.match("index.html")));
    return;
  }
  e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((r) => {
    if (r.ok && (req.url.startsWith(self.location.origin) || req.url.includes("fonts.g"))) { const copy = r.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); }
    return r;
  })));
});
