// This is the service worker with the Cache-first network

const CACHE = "pwabuilder-precache";
const precacheFiles = ['nicolasbastos.github.io/kathe-y-juank/styles/styles.css',
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
'nicolasbastos.github.io/kathe-y-juank/images',
  /* Add an array of files to precache for your app */
];

self.addEventListener("install", function (event) {
  console.log("[PWA Builder] Install Event processing");

  console.log("[PWA Builder] Skip waiting on install");
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      console.log("[PWA Builder] Caching pages during install");
      return cache.addAll(precacheFiles);
    })
  );
});

// Allow sw to control of current page
self.addEventListener("activate", function (event) {
  console.log("[PWA Builder] Claiming clients for current page");
  event.waitUntil(self.clients.claim());
});

// If any fetch fails, it will look for the request in the cache and serve it from there first
self.addEventListener("fetch", function (event) { 
  if (event.request.method !== "GET") return;

  event.respondWith(
    fromCache(event.request).then(
      function (response) {
        // The response was found in the cache so we responde with it and update the entry

        // This is where we call the server to get the newest version of the
        // file to use the next time we show view
        event.waitUntil(
          fetch(event.request).then(function (response) {
            return updateCache(event.request, response);
          })
        );

        return response;
      },
      function () {
        // The response was not found in the cache so we look for it on the server
        return fetch(event.request)
          .then(function (response) {
            // If request was success, add or update it in the cache
            event.waitUntil(updateCache(event.request, response.clone()));

            return response;
          })
          .catch(function (error) {
            console.log("[PWA Builder] Network request failed and no cache." + error);
          });
      }
    )
  );
});

function fromCache(request) {
  // Check to see if you have it in the cache
  // Return response
  // If not in the cache, then return
  return caches.open(CACHE).then(function (cache) {
    return cache.match(request).then(function (matching) {
      if (!matching || matching.status === 404) {
        return Promise.reject("no-match");
      }

      return matching;
    });
  });
}

function updateCache(request, response) {
  return caches.open(CACHE).then(function (cache) {
    return cache.put(request, response);
  });
}
