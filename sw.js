/* BUX שירותים — service worker בסיסי (מאפשר התקנה כאפליקציה) */
const CACHE = "bux-services-v1";
const ASSETS = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(()=>{}));
  self.skipWaiting();
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  // נתוני הענן (Firebase) — תמיד מהרשת, לא מהמטמון
  if (url.hostname.endsWith("firebasedatabase.app")) return;
  // שאר הקבצים — רשת קודם, נפילה למטמון (כדי שעדכונים ייקלטו)
  e.respondWith(
    fetch(e.request).then(r => {
      if (e.request.method === "GET" && r.ok) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); }
      return r;
    }).catch(() => caches.match(e.request).then(r => r || caches.match("./index.html")))
  );
});
