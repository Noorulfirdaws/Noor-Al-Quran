// Service Worker — Noor-ul-Quran
// Rend l'app utilisable HORS-LIGNE : précache le shell + les données Coran
// locales, et met l'audio de récitation en cache à la demande.
// (Les routes /api restent en réseau direct — pas de mise en cache de l'auth.)

const CACHE = "noor-quran-v2"; // bump to purge stale cached pages (e.g. old home scroll)
const PRECACHE = [
  "/",
  "/quran",
  "/manifest.json",
  "/data/quran/surahs.json",
  "/data/quran/uthmani.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

function cacheFirst(request) {
  return caches.match(request).then(
    (hit) =>
      hit ||
      fetch(request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {});
        return res;
      })
  );
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Ne jamais mettre en cache l'API (auth, scoring, etc.) — réseau direct.
  if (url.origin === self.location.origin && url.pathname.startsWith("/api/")) {
    return;
  }

  // Données Coran locales : cache d'abord → hors-ligne garanti.
  if (url.origin === self.location.origin && url.pathname.startsWith("/data/quran/")) {
    event.respondWith(cacheFirst(req));
    return;
  }

  // Audio de récitation (souvent cross-origin) : cache d'abord à la demande.
  if (/\.(mp3|ogg|m4a|wav)(\?|$)/i.test(url.pathname)) {
    event.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req)
            .then((res) => {
              const copy = res.clone();
              caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
              return res;
            })
            .catch(() => hit)
      )
    );
    return;
  }

  // Même origine (shell, pages, assets) : réseau d'abord, repli cache hors-ligne.
  if (url.origin === self.location.origin) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(req).then((hit) => hit || caches.match("/")))
    );
  }
});
