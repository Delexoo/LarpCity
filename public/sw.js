/* Minimal service worker so LARP viewers are installable as home-screen apps. */
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  // Network-first; keep installability without aggressive offline caching.
  // Never break navigations if the network fails mid-flight.
  event.respondWith(
    fetch(event.request).catch(() =>
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        if (event.request.mode === "navigate") {
          return new Response(
            "<!doctype html><title>Offline</title><p>Reconnect to open this dashboard.</p>",
            { headers: { "Content-Type": "text/html; charset=utf-8" } },
          );
        }
        return Response.error();
      }),
    ),
  );
});
