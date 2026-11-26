/* Open Mic Songbook service worker: keeps the app working offline. Bump VERSION on every release. */
var VERSION = 'songbook-1.2.1';
var SHELL = ['./', 'index.html', 'app.js', 'songs.js', 'riffs.js', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png'];
var FONT_CACHE = 'songbook-fonts';

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(SHELL); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== VERSION && k !== FONT_CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('message', function (e) {
  if (e.data === 'skipWaiting') self.skipWaiting();
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);

  // Google Fonts: cache first, so the app keeps its type offline.
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(caches.open(FONT_CACHE).then(function (c) {
      return c.match(req).then(function (hit) {
        return hit || fetch(req).then(function (res) { c.put(req, res.clone()); return res; });
      });
    }));
    return;
  }
  if (url.origin !== self.location.origin) return;

  // App files: serve from the cache straight away; a new version arrives through the update prompt.
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(function (hit) {
    return hit || fetch(req).then(function (res) {
      if (res.ok && req.mode === 'navigate') {
        var copy = res.clone();
        caches.open(VERSION).then(function (c) { c.put('index.html', copy); });
      }
      return res;
    }).catch(function () {
      return req.mode === 'navigate' ? caches.match('index.html') : Response.error();
    });
  }));
});
