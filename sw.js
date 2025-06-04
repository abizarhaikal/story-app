import { precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import {
  StaleWhileRevalidate,
  CacheFirst,
  NetworkFirst,
} from "workbox-strategies";

// ⛔️ HARUS ADA (Workbox akan ganti ini saat build)
precacheAndRoute(self.__WB_MANIFEST);

// Caching strategy untuk API StoryApp
registerRoute(
  ({ url }) => url.origin === "https://story-api.dicoding.dev",
  new NetworkFirst({
    cacheName: "story-api-cache",
    networkTimeoutSeconds: 3,
  })
);

// Caching untuk gambar
registerRoute(
  ({ request }) => request.destination === "image",
  new CacheFirst({
    cacheName: "images-cache",
    plugins: [
      {
        cacheKeyWillBeUsed: async ({ request }) => {
          return `${request.url}?v=${Date.now()}`;
        },
      },
    ],
  })
);

// Caching semua halaman navigation
registerRoute(
  ({ request }) => request.mode === "navigate",
  new NetworkFirst({
    cacheName: "pages-cache",
    networkTimeoutSeconds: 3,
  })
);

// Caching untuk static assets
registerRoute(
  ({ request }) =>
    request.destination === "script" ||
    request.destination === "style" ||
    request.destination === "font",
  new StaleWhileRevalidate({
    cacheName: "static-assets",
  })
);

// Push notification handler
self.addEventListener("push", (event) => {
  console.log("Service worker received push event:", event);

  let notificationData = {
    title: "Ada story baru nih!",
    body: "Cek sekarang dengan klik notif ini!",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-192x192.png",
    tag: "story-notification",
    data: {
      url: "/",
      timestamp: Date.now(),
    },
    actions: [
      {
        action: "open",
        title: "Buka App",
        icon: "/icons/icon-192x192.png",
      },
      {
        action: "close",
        title: "Tutup",
      },
    ],
    requireInteraction: true,
    vibrate: [200, 100, 200],
  };

  // Jika ada data dari push payload
  if (event.data) {
    try {
      const pushData = event.data.json();
      notificationData = {
        ...notificationData,
        title: pushData.title || notificationData.title,
        body: pushData.body || notificationData.body,
        data: {
          ...notificationData.data,
          ...pushData.data,
        },
      };
    } catch (error) {
      console.error("Error parsing push data:", error);
    }
  }

  const promiseChain = self.registration.showNotification(
    notificationData.title,
    notificationData
  );

  event.waitUntil(promiseChain);
});

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  console.log("Notification clicked:", event);

  event.notification.close();

  if (event.action === "close") {
    return;
  }

  // Default action atau action "open"
  const urlToOpen = event.notification.data?.url || "/";

  const promiseChain = clients
    .matchAll({
      type: "window",
      includeUncontrolled: true,
    })
    .then((windowClients) => {
      // Cek apakah ada window yang sudah terbuka
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.includes(self.location.origin)) {
          client.focus();
          client.navigate(urlToOpen);
          return;
        }
      }

      // Jika tidak ada window yang terbuka, buka yang baru
      return clients.openWindow(urlToOpen);
    });

  event.waitUntil(promiseChain);
});

// Background sync untuk offline functionality
self.addEventListener("sync", (event) => {
  console.log("Background sync triggered:", event.tag);

  if (event.tag === "background-sync") {
    const promiseChain = doBackgroundSync();
    event.waitUntil(promiseChain);
  }
});

async function doBackgroundSync() {
  try {
    // Implementasi background sync
    console.log("Performing background sync...");

    // Sync data yang pending
    // Misalnya: upload stories yang belum terupload
  } catch (error) {
    console.error("Background sync failed:", error);
  }
}

// Error handling
self.addEventListener("error", (event) => {
  console.error("Service Worker error:", event.error);
});

self.addEventListener("unhandledrejection", (event) => {
  console.error("Service Worker unhandled promise rejection:", event.reason);
});

console.log("Service Worker loaded successfully");
