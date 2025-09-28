// Service Worker registration and management
const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(
    /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
  )
);

interface ServiceWorkerConfig {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onOfflineReady?: (registration: ServiceWorkerRegistration) => void;
}

export function registerServiceWorker(config: ServiceWorkerConfig = {}) {
  if ('serviceWorker' in navigator) {
    const publicUrl = new URL(process.env.PUBLIC_URL || '', window.location.href);
    if (publicUrl.origin !== window.location.origin) {
      // Service worker won't work if PUBLIC_URL is on a different origin
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/sw.js`;

      if (isLocalhost) {
        // Running on localhost. Check if a service worker still exists or not.
        checkValidServiceWorker(swUrl, config);
        
        // Add some additional logging to localhost
        navigator.serviceWorker.ready.then(() => {
          console.log(
            'This web app is being served cache-first by a service worker. ' +
            'To learn more, visit https://cra.link/PWA'
          );
        });
      } else {
        // Not localhost. Register service worker normally
        registerValidSW(swUrl, config);
      }
    });
  }
}

function registerValidSW(swUrl: string, config: ServiceWorkerConfig) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      console.log('Service Worker registered:', registration);
      
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (!installingWorker) {
          return;
        }

        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // At this point, the updated precached content has been fetched,
              // but the previous service worker will still serve the older
              // content until all client tabs are closed.
              console.log(
                'New content is available and will be used when all ' +
                'tabs for this page are closed. See https://cra.link/PWA.'
              );

              // Execute callback
              if (config.onUpdate) {
                config.onUpdate(registration);
              }
            } else {
              // At this point, everything has been precached.
              // It's the perfect time to display a
              // "Content is cached for offline use." message.
              console.log('Content is cached for offline use.');

              // Execute callback
              if (config.onOfflineReady) {
                config.onOfflineReady(registration);
              }
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error('Error during service worker registration:', error);
    });
}

function checkValidServiceWorker(swUrl: string, config: ServiceWorkerConfig) {
  // Check if the service worker can be found. If it can't reload the page.
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then((response) => {
      // Ensure service worker exists, and that we really are getting a JS file.
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        // No service worker found. Probably a different app. Reload the page.
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        // Service worker found. Proceed normally.
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log(
        'No internet connection found. App is running in offline mode.'
      );
    });
}

export function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}

// Service Worker management utilities
export class ServiceWorkerManager {
  private static instance: ServiceWorkerManager;
  private registration: ServiceWorkerRegistration | null = null;

  private constructor() {}

  public static getInstance(): ServiceWorkerManager {
    if (!ServiceWorkerManager.instance) {
      ServiceWorkerManager.instance = new ServiceWorkerManager();
    }
    return ServiceWorkerManager.instance;
  }

  public async initialize(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.ready;
        console.log('Service Worker Manager initialized');
      } catch (error) {
        console.error('Failed to initialize Service Worker Manager:', error);
      }
    }
  }

  public async updateCache(): Promise<void> {
    if (this.registration) {
      try {
        await this.registration.update();
        console.log('Service Worker cache updated');
      } catch (error) {
        console.error('Failed to update Service Worker cache:', error);
      }
    }
  }

  public async clearCache(): Promise<void> {
    if (this.registration) {
      try {
        // Send message to service worker to clear cache
        if (this.registration.active) {
          this.registration.active.postMessage({ type: 'CLEAR_CACHE' });
        }
        console.log('Service Worker cache cleared');
      } catch (error) {
        console.error('Failed to clear Service Worker cache:', error);
      }
    }
  }

  public async getCacheSize(): Promise<number> {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        let totalSize = 0;

        for (const cacheName of cacheNames) {
          const cache = await caches.open(cacheName);
          const keys = await cache.keys();
          totalSize += keys.length;
        }

        return totalSize;
      } catch (error) {
        console.error('Failed to get cache size:', error);
        return 0;
      }
    }
    return 0;
  }

  public isOnline(): boolean {
    return navigator.onLine;
  }

  public onOnline(callback: () => void): void {
    window.addEventListener('online', callback);
  }

  public onOffline(callback: () => void): void {
    window.addEventListener('offline', callback);
  }

  public async requestPermission(): Promise<NotificationPermission> {
    if ('Notification' in window) {
      return await Notification.requestPermission();
    }
    return 'denied';
  }

  public async showNotification(title: string, options: NotificationOptions = {}): Promise<void> {
    if (this.registration && 'showNotification' in this.registration) {
      try {
        await this.registration.showNotification(title, {
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          ...options,
        });
      } catch (error) {
        console.error('Failed to show notification:', error);
      }
    }
  }
}

// Export singleton instance
export const swManager = ServiceWorkerManager.getInstance();
