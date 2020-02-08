const PRECACHE = 'precache-v1';
const RUNTIME = 'runtime';

// A list of local resources we always want to be cached.
const PRECACHE_URLS = [
  'nicolasbastos.github.io/kathe-y-juank/styles/styles.css',
'nicolasbastos.github.io/kathe-y-juank/script/main.js',
'nicolasbastos.github.io/kathe-y-juank/common-css/bootstrap.css',
'nicolasbastos.github.io/kathe-y-juank/common-css/fluidbox.min.css',
'nicolasbastos.github.io/kathe-y-juank/common-css/font-icon.css',
'nicolasbastos.github.io/kathe-y-juank/01-homepage/css/styles.css',
'nicolasbastos.github.io/kathe-y-juank/01-homepage/css/responsive.css',
'nicolasbastos.github.io/kathe-y-juank/manifest.json',
'https://fonts.googleapis.com/css?family=Playball%7CBitter',
'nicolasbastos.github.io/kathe-y-juank/common-js/jquery-3.1.1.min.js',
'nicolasbastos.github.io/kathe-y-juank/common-js/tether.min.js',
'nicolasbastos.github.io/kathe-y-juank/index.html',
'nicolasbastos.github.io/kathe-y-juank/common-js/bootstrap.js',
'nicolasbastos.github.io/kathe-y-juank/common-js/jquery.countdown.min.js',
'nicolasbastos.github.io/kathe-y-juank/common-js/jquery.fluidbox.min.js',
'nicolasbastos.github.io/kathe-y-juank/common-js/scripts.js',
'nicolasbastos.github.io/kathe-y-juank/sw.js',
'nicolasbastos.github.io/kathe-y-juank/images'
];

// The install handler takes care of precaching the resources we always need.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(PRECACHE)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(self.skipWaiting())
  );
});

// The activate handler takes care of cleaning up old caches.
self.addEventListener('activate', event => {
  const currentCaches = [PRECACHE, RUNTIME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
    }).then(cachesToDelete => {
      return Promise.all(cachesToDelete.map(cacheToDelete => {
        return caches.delete(cacheToDelete);
      }));
    }).then(() => self.clients.claim())
  );
});

// The fetch handler serves responses for same-origin resources from a cache.
// If no response is found, it populates the runtime cache with the response
// from the network before returning it to the page.
self.addEventListener('fetch', event => {
  // Skip cross-origin requests, like those for Google Analytics.
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return caches.open(RUNTIME).then(cache => {
          return fetch(event.request).then(response => {
            // Put a copy of the response in the runtime cache.
            return cache.put(event.request, response.clone()).then(() => {
              return response;
            });
          });
        });
      })
    );
  }
});
