// Rhinox Code Studio: the offline service worker.
//
// Its only job is to let Code Studio open and run with no internet, AFTER the
// learner has pressed "Save for offline use" on the page. It is registered with
// the scope /coding-robotics/code-studio, so it only ever controls that one
// page (and the files that page loads), never the rest of the site.
//
// What it does:
//   - The Code Studio page and the Arduino Studio page: network first (so a new version arrives as soon as
//     there is a connection), the saved copy when the network fails.
//   - Files that never change (/_next/static/ and the self-hosted Python
//     runtime in /pyodide/): saved copy first, then the network.
//   - The Python worker (under the page's own path), the manifest and the icons:
//     network first, the saved copy when the network fails. The worker has to sit
//     inside this scope: browsers only let a service worker serve a worker script
//     that is in its scope.
//   - Pictures and fonts of the page: the saved copy at once, refreshed quietly.
//   - Anything else (other sites, other methods, /api/, page data requests):
//     left alone, the browser handles it as usual.
// It does nothing at all until the page has saved the offline copy (the cache
// below exists only then), and nothing it keeps ever leaves this browser.
//
// The cache name must match lib/code-studio/offline.ts (a test checks this).

const CACHE = "rhinox-code-studio-offline-v1";
const CACHE_PREFIX = "rhinox-code-studio-offline-";
const PAGE = "/coding-robotics/code-studio";
const ARDUINO_PAGE = "/coding-robotics/code-studio/arduino";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Old versions of the saved copy are removed; the current one is kept.
      for (const name of await caches.keys()) {
        if (name.startsWith(CACHE_PREFIX) && name !== CACHE) await caches.delete(name);
      }
      await self.clients.claim();
    })(),
  );
});

function storable(response) {
  // Only complete, successful answers from this site are kept.
  return response && response.status === 200 && response.type === "basic" && !response.redirected;
}

async function networkFirst(request, key) {
  const cache = await caches.open(CACHE);
  try {
    const fresh = await fetch(request);
    if (storable(fresh)) await cache.put(key, fresh.clone());
    return fresh;
  } catch (error) {
    const saved = await cache.match(key, { ignoreVary: true });
    if (saved) return saved;
    throw error;
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const saved = await cache.match(request, { ignoreVary: true });
  if (saved) return saved;
  const fresh = await fetch(request);
  if (storable(fresh)) await cache.put(request, fresh.clone());
  return fresh;
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE);
  const saved = await cache.match(request, { ignoreVary: true });
  const refresh = fetch(request)
    .then(async (fresh) => {
      if (storable(fresh)) await cache.put(request, fresh.clone());
      return fresh;
    })
    .catch(() => null);
  if (saved) return saved;
  const fresh = await refresh;
  if (fresh) return fresh;
  return Response.error();
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  const path = url.pathname;
  if (path.startsWith("/api/") || url.searchParams.has("_rsc")) return;

  const handle = (work) =>
    event.respondWith(
      (async () => {
        // Until the learner has saved the offline copy, behave as if this worker were not here.
        if (!(await caches.has(CACHE))) return fetch(request);
        return work();
      })(),
    );

  if (request.mode === "navigate") {
    if (path === PAGE || path === ARDUINO_PAGE) handle(() => networkFirst(request, path));
    return;
  }
  if (path.startsWith("/_next/static/") || path.startsWith("/pyodide/")) {
    handle(() => cacheFirst(request));
  } else if (path.startsWith("/code-studio/") || path.startsWith(PAGE + "/")) {
    // The Python worker, the manifest and the icons.
    handle(() => networkFirst(request, path));
  } else if (["image", "font", "style"].includes(request.destination) && !path.startsWith("/_next/image")) {
    handle(() => staleWhileRevalidate(request));
  }
});
