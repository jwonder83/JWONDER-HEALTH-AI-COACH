/* JWONDER PWA — 소스: pwa/service-worker.js → 빌드/개발 전 public/sw.js 로 복사됨 */
const VERSION = "jws-sw-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(Promise.resolve());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

/**
 * 설치 가능 PWA 요건 충족 + 로그인 세션을 건드리지 않도록
 * HTML/API는 네트워크만 사용하고, 정적 청크만 가벼운 SWR 캐시.
 */
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (req.mode === "navigate" || url.pathname.startsWith("/api")) {
    event.respondWith(fetch(req));
    return;
  }

  if (url.pathname.startsWith("/_next/static")) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(VERSION);
        const cached = await cache.match(req);
        const network = fetch(req)
          .then((res) => {
            if (res.ok && res.type === "basic") {
              cache.put(req, res.clone());
            }
            return res;
          })
          .catch(() => cached);
        return cached || network;
      })(),
    );
    return;
  }

  event.respondWith(fetch(req));
});
