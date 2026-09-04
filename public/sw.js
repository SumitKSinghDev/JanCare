// JanCare Complete Offline-First Service Worker (v5)
const CACHE_NAME = "jancare-pwa-v5";
const OFFLINE_URL = "/offline.html";

// Pre-cache all core user dashboards and static assets
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
  "/logo.png",
  "/background_maharashtra.jpg"
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

// Fetch: Complete offline interception & resilient fallback
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only intercept HTTP GET requests
  if (request.method !== "GET" || !request.url.startsWith("http")) return;

  const urlObj = new URL(request.url);

  // 1. Navigation Requests (Page Loads / Tab switches / Hard navigations)
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
          const pathMatch = await cache.match(urlObj.pathname, { ignoreSearch: true });
          if (pathMatch) return pathMatch;

          // 3. Match role routes specifically
          const knownRoutes = [
            "/patient/dashboard",
            "/doctor/dashboard",
            "/asha/dashboard",
            "/medicine-manager/dashboard",
            "/facility/dashboard",
            "/admin/dashboard",
            "/login",
            "/"
          ];
          for (const route of knownRoutes) {
            if (urlObj.pathname.startsWith(route)) {
              const routeMatch = await cache.match(route, { ignoreSearch: true });
              if (routeMatch) return routeMatch;
            }
          }

          // 4. Fallback to offline page or root
          const offlineFallback = await cache.match(OFFLINE_URL);
          if (offlineFallback) return offlineFallback;

          const rootMatch = await cache.match("/", { ignoreSearch: true });
          if (rootMatch) return rootMatch;

          return new Response(
            `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:30px;text-align:center;"><h2>📡 JanCare Offline Active</h2><p>Working in local offline mode.</p><button onclick="window.history.back()">Go Back</button></body></html>`,
            { headers: { "Content-Type": "text/html" } }
          );
        })
    );
    return;
  }

  // 2. API Requests (/api/...)
  if (urlObj.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request).catch(() => {
        // Return 200 with offline status so client-side fetch/JSON does not throw unhandled exception
        return new Response(
          JSON.stringify({ success: false, offline: true, error: "Network offline. Working from local cache." }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      })
    );
    return;
  }

  // 3. Static Assets & Next.js RSC Chunks (JS, CSS, Images, Next.js static files)
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
        .catch(async () => {
          // If this is an RSC or page request, try serving cached base page
          if (urlObj.searchParams.has("_rsc") || request.headers.get("RSC")) {
            const cache = await caches.open(CACHE_NAME);
            const baseMatch = await cache.match(urlObj.pathname, { ignoreSearch: true });
            if (baseMatch) return baseMatch;
          }

          if (request.destination === "image") {
            return new Response("", { status: 200, headers: { "Content-Type": "image/svg+xml" } });
          }

          // Return benign 200 empty response so Next.js router does not crash to black screen
          return new Response("", { status: 200, headers: { "Content-Type": "text/plain" } });
        });
    })
  );
});
