/* 极简 service worker，手写，不引 next-pwa 之类的依赖。
   策略刻意保守 —— 演示场合最怕的是缓存把旧版本钉死：

   - /api/* 一律不碰，永远走网络（分析结果不该被缓存）
   - 静态资源（字体、图标）走 cache-first，装到桌面后离线也能开
   - 其余导航请求走 network-first，网络不通才回落缓存

   换版本号即可让旧缓存整体失效。 */
const CACHE = "sihat-v1";
const PRECACHE = [
  "/",
  "/icon.svg",
  "/icon-192.png",
  "/fonts/SourceSans3-Variable-latin.woff2",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(PRECACHE))
      .catch(() => {}) // 某个资源 404 不该让整个安装失败
      .then(() => self.skipWaiting())
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

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return; // 分析结果永远要新鲜的

  const isStatic =
    url.pathname.startsWith("/fonts/") ||
    url.pathname.startsWith("/_next/static/") ||
    /\.(png|svg|woff2|ico)$/.test(url.pathname);

  if (isStatic) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((res) => {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(request, copy));
            return res;
          })
      )
    );
    return;
  }

  event.respondWith(
    fetch(request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(request, copy));
        return res;
      })
      .catch(() => caches.match(request).then((hit) => hit || caches.match("/")))
  );
});
