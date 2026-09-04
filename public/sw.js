// JanCare Complete Offline-First Service Worker (v4)
const CACHE_NAME = "jancare-pwa-v4";
const OFFLINE_URL = "/offline.html";

// Pre-cache all core user dashboards and assets
const PRECACHE_ASSETS = [
  "/",
  "/login",
  "/patient/dashboard",
  "/doctor/dashboard",
  "/asha/dashboard",
  "/medicine-manager/dashboard",
  "/facility/dashboard",
  "/admin/dashboard",
  "/offline.html",
  "/manifest.json",
  "/favicon.ico",
  "/logo.png"
];

// Install: Cache all core dashboards and assets immediately
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const url of PRECACHE_ASSETS) {
        try {
          const response = await fetch(url, { cache: "no-cache" });
          if (response && response.ok) {
            await cache.put(url, response);
          }
        } catch (e) {
          console.warn("[JanCare SW] Pre-cache item skipped:", url);
        }
      }
    })
  );
});

// Activate: Take control of all tabs immediately and clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Complete offline interception
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only intercept HTTP GET requests
  if (request.method !== "GET" || !request.url.startsWith("http")) return;

  // 1. Navigation Requests (Page Loads / Tab switches / Dashboard routing)
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cache = await caches.open(CACHE_NAME);
          // 1. Try exact requested URL in cache
          const exactMatch = await cache.match(request, { ignoreSearch: true });
          if (exactMatch) return exactMatch;

          // 2. Try URL pathname
          const urlObj = new URL(request.url);
          const pathMatch = await cache.match(urlObj.pathname, { ignoreSearch: true });
          if (pathMatch) return pathMatch;

          // 3. Try Root
          const rootMatch = await cache.match("/", { ignoreSearch: true });
          if (rootMatch) return rootMatch;

          // 4. Fallback to offline page
          const offlineFallback = await cache.match(OFFLINE_URL);
          if (offlineFallback) return offlineFallback;

          return new Response(
            `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:30px;text-align:center;"><h2>📡 JanCare Offline Active</h2><p>Working in local offline mode.</p><button onclick="window.history.back()">Go Back</button></body></html>`,
            { headers: { "Content-Type": "text/html" } }
          );
        })
    );
    return;
  }

  // 2. Static Assets (JS Chunks, CSS, Images, Next.js static files)
  event.respondWith(
    caches.match(request, { ignoreSearch: true }).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch fresh copy in background if online
        fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
            }
          })
          .catch(() => {});
        return cachedResponse;
      }

      // Not in cache, try network and dynamically cache
      return fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => {
          if (request.destination === "image") {
            return new Response("", { status: 200, headers: { "Content-Type": "image/svg+xml" } });
          }
          return new Response("", { status: 503, statusText: "Offline" });
        });
    })
  );
});
