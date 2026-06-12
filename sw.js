// 💡 注意：我把 v1 改成了 v2，這樣手機就會知道有大更新要下載！
const CACHE_NAME = 'subsidy-calc-v2'; 
const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
];

// 【安裝階段】
self.addEventListener('install', event => {
  self.skipWaiting(); // 魔法指令：強制手機立刻拋棄舊版，安裝新版！
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// 【啟動階段】把舊的 v1 快取垃圾清掉
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 【抓取階段】改為「網路優先 (Network First)」策略
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // 如果網路有通，就把最新抓到的檔案存進快取備用
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return response; // 吐出最新版的網頁給使用者
      })
      .catch(() => {
        // 如果沒網路 (斷網或深山裡)，就從快取裡面拿舊資料擋著用
        return caches.match(event.request);
      })
  );
});
