/* Unwoven service worker. Lets the game install as an app and keep playing offline.
   Same-origin files are served from cache first and refreshed in the background,
   so a new release is picked up the next time the game is opened. __VERSION__ is filled in by scripts/build.cjs. */
const CACHE = "unwoven-__VERSION__";
const SHELL = ["./", "index.html", "vendor.js", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png"];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith("unwoven-") && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(caches.open(CACHE).then(async (c) => {
    const hit = await c.match(req, { ignoreSearch: true });
    const net = fetch(req).then((res) => { if (res && res.ok && res.status === 200) c.put(req, res.clone()); return res; }).catch(() => hit);
    return hit || net;
  }));
});
