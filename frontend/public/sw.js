// Service Worker for WordWeave
const CACHE_NAME = 'wordweave-v1';
const STATIC_CACHE_NAME = 'wordweave-static-v1';
const DYNAMIC_CACHE_NAME = 'wordweave-dynamic-v1';

// Assets to cache for offline functionality
const STATIC_ASSETS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico',
  // Add other critical static assets
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /\/api\/generate/,
  /\/api\/analyze-theme/,
  /\/health/,
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Install event');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Static assets cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Failed to cache static assets', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activate event');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle API requests with network-first strategy
  if (API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static assets with cache-first strategy
  if (isStaticAsset(request)) {
    event.respondWith(handleStaticAsset(request));
    return;
  }

  // Handle navigation requests with network-first strategy
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request));
    return;
  }

  // Default: network-first strategy
  event.respondWith(handleDefault(request));
});

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      const responseClone = networkResponse.clone();
      cache.put(request, responseClone);
    }
    
    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      // Return cached response with offline indicator
      const responseClone = cachedResponse.clone();
      responseClone.headers.set('X-Served-From', 'cache');
      return responseClone;
    }
    
    // No cache available, return offline page or error
    return new Response(
      JSON.stringify({
        error: 'Network unavailable',
        offline: true,
        message: 'You are offline. Some features may not be available.'
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle static assets with cache-first strategy
async function handleStaticAsset(request) {
  const cache = await caches.open(STATIC_CACHE_NAME);
  
  // Try cache first
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Cache miss, try network
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const responseClone = networkResponse.clone();
      cache.put(request, responseClone);
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Service Worker: Failed to fetch static asset', error);
    return new Response('Offline', { status: 503 });
  }
}

// Handle navigation requests
async function handleNavigation(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const responseClone = networkResponse.clone();
      cache.put(request, responseClone);
    }
    
    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page
    return cache.match('/') || new Response('Offline', { status: 503 });
  }
}

// Handle default requests with network-first strategy
async function handleDefault(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const responseClone = networkResponse.clone();
      cache.put(request, responseClone);
    }
    
    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// Check if request is for a static asset
function isStaticAsset(request) {
  const url = new URL(request.url);
  return (
    url.pathname.startsWith('/static/') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.gif') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.ico')
  );
}

// Background sync for failed requests
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync event', event.tag);
  
  if (event.tag === 'poem-generation') {
    event.waitUntil(handleBackgroundSync());
  }
});

// Handle background sync
async function handleBackgroundSync() {
  try {
    // Get failed requests from IndexedDB or localStorage
    const failedRequests = await getFailedRequests();
    
    for (const request of failedRequests) {
      try {
        await fetch(request);
        await removeFailedRequest(request);
      } catch (error) {
        console.error('Service Worker: Background sync failed for request', error);
      }
    }
  } catch (error) {
    console.error('Service Worker: Background sync error', error);
  }
}

// Get failed requests (placeholder implementation)
async function getFailedRequests() {
  // In a real implementation, you would store failed requests in IndexedDB
  return [];
}

// Remove failed request (placeholder implementation)
async function removeFailedRequest(request) {
  // In a real implementation, you would remove the request from IndexedDB
  console.log('Service Worker: Removed failed request', request);
}

// Push notifications (if needed in the future)
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push event', event);
  
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'New content available',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: data.tag || 'default',
      data: data.data || {}
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'WordWeave', options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification click', event);
  
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});

// Message handling for cache management
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(clearAllCaches());
  }
});

// Clear all caches
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.map(cacheName => caches.delete(cacheName))
  );
  console.log('Service Worker: All caches cleared');
}
