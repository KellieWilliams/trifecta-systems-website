const CACHE_NAME = 'trifecta-systems-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/web-development.html',
  '/data-analytics.html',
  '/cybersecurity.html',
  '/ai-custom-solutions.html',
  '/about-the-owner.html',
  '/offline.html',
  '/style.css',
  '/script.js',
  '/Gallery/Trifecta_Logo.png',
  '/Gallery/Gemini_Generated_Image_Hero_Background.webp',
  '/Gallery/Gemini_Generated_Image_Web_Development.png',
  '/Gallery/Gemini_Generated_Image_Data_Analytics.png',
  '/Gallery/Gemini_Generated_Image_Cybersecurity.png',
  '/Gallery/Gemini_Generated_Image_Custom_AI.png',
  '/Gallery/Gemini_Generated_Image_About_Us_Monitor.png',
  '/Gallery/favicon/favicon.ico',
  '/Gallery/favicon/favicon-96x96.png',
  '/Gallery/favicon/apple-touch-icon.png',
  '/Gallery/favicon/site.webmanifest',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap',
  'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.woff2',
  'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmEU9fBBc4.woff2',
  'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlfBBc4.woff2',
  'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmYUtfBBc4.woff2'
];

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        return fetch(event.request)
          .then(response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // If offline and requesting a page, return offline page
            if (event.request.destination === 'document') {
              return caches.match('/offline.html');
            }
          });
      }
    )
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
}); 