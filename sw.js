// Service Worker: الصفحة الأساسية من الكاش، والبيانات (episodes.json) من النت أولاً
// غيّر رقم النسخة عند تغيير ملفات الواجهة عشان الكاش القديم يتمسح
const VERSION = "v2";
const CACHE = "app-shell-" + VERSION;
const SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  // البيانات: النت أولاً، ولو مفيش نت نرجع آخر نسخة محفوظة
  if (url.pathname.endsWith("/episodes.json")) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // باقي الملفات: الكاش أولاً
  event.respondWith(caches.match(req).then((hit) => hit || fetch(req)));
});
