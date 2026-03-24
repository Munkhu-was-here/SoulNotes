const CACHE_NAME = "soulnotes-v1";

self.addEventListener("install", (e) => {
  self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});