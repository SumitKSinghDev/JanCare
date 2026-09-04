// JanCare Super-Resilient Offline Service Worker (v3)
const CACHE_NAME = "jancare-pwa-v3";
const OFFLINE_URL = "/offline.html";

const PRECACHE_ASSETS = [
  "/",
  "/offline.html",
  "/manifest.json",
  "/favicon.ico",
  "/logo.png"
];

// Install: Cache critical assets individually with error tolerance
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const url of PRECACHE_ASSETS) {
        try {
          const response = await fetch(url, { cache: "no-cache" });
          if (response.ok) {
            await cache.put(url, response);
          }
        } catch (e) {
          console.warn("[JanCare SW] Pre-cache item skipped:", url, e);
        }
      }
    })
  );
});

// Activate: Clean up old caches and claim all open tabs immediately
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

// Fetch: Intercept all network traffic
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle GET requests with http/https
  if (request.method !== "GET" || !request.url.startsWith("http")) return;

  // 1. Navigation Requests (HTML Page Loads / Reloads)
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
          // Network failed (Offline) - search cache
          const cache = await caches.open(CACHE_NAME);
          const cachedMatch = await cache.match(request, { ignoreSearch: true });
          if (cachedMatch) return cachedMatch;

          const rootMatch = await cache.match("/", { ignoreSearch: true });
          if (rootMatch) return rootMatch;

          const offlineFallback = await cache.match(OFFLINE_URL);
          if (offlineFallback) return offlineFallback;

          return new Response(
            `<!DOCTYPE html>
            <html lang="en">
            <head><meta charset="UTF-8"><title>JanCare Offline</title><style>body{font-family:sans-serif;background:#F8FAFC;padding:40px;text-align:center;} .box{background:white;padding:30px;border-radius:20px;max-width:400px;margin:auto;box-shadow:0 10px 20px rgba(0,0,0,0.05);}</style></head>
            <body><div class="box"><h2>📡 जनCare Offline Active</h2><p>You are currently offline. Your local data and health records are safe.</p><button onclick="window.history.back()" style="background:#1464D2;color:white;padding:10px 20px;border:none;border-radius:10px;font-weight:bold;cursor:pointer;">Go Back</button></div></body>
            </html>`,
            { headers: { "Content-Type": "text/html" } }
          );
        })
    );
    return;
  }

  // 2. Static Resources (JS, CSS, Images, Fonts, Next.js chunks)
  event.respondWith(
    caches.match(request, { ignoreSearch: true }).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached instantly, fetch fresh copy in background if online
        fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
            }
          })
          .catch(() => {});
        return cachedResponse;
      }

      // Not in cache, try network and cache the result
      return fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => {
          // If it's an image request, return nothing or empty SVG
          if (request.destination === "image") {
            return new Response("", { status: 408, headers: { "Content-Type": "image/png" } });
          }
          return new Response("", { status: 503, statusText: "Offline" });
        });
    })
  );
});
