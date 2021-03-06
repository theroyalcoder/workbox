importScripts('/__WORKBOX/buildFile/workbox-core');
importScripts('/__WORKBOX/buildFile/workbox-background-sync');

/* globals workbox */

const queue = new workbox.backgroundSync.Queue('myQueueName');

self.addEventListener('fetch', (event) => {
  const pathname = new URL(event.request.url).pathname;
  if (pathname === '/test/workbox-background-sync/static/basic-example/example.txt') {
    const queuePromise = (async () => {
      await queue.addRequest(event.request);
      // This is a horrible hack :(
      // In non-sync supporting browsers we only replay requests when the SW starts up
      // but there is no API to force close a service worker, so just force a replay in
      // this situation to "fake" a sw starting up......
      if (!('sync' in registration)) {
        await queue.replayRequests();
      }
    })();

    event.respondWith(Promise.resolve(new Response(`Added to BG Sync`)));
    event.waitUntil(queuePromise);
  }
});

self.addEventListener('install', (event) => event.waitUntil(self.skipWaiting()));
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
