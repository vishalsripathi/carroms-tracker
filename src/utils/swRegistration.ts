// src/utils/swRegistration.ts
export const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });
  
        if (registration.installing) {
          console.log('Service worker installing');
        } else if (registration.waiting) {
          console.log('Service worker installed');
        } else if (registration.active) {
          console.log('Service worker active');
        }
  
        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;
  
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available, show update prompt
              dispatchEvent(new CustomEvent('swUpdateAvailable'));
            }
          });
        });
  
      } catch (error) {
        console.error('Service worker registration failed:', error);
      }
    }
  };
  
  // Function to check if app is installed
  export const isAppInstalled = () => {
    return window.matchMedia('(display-mode: standalone)').matches || 
           (window.navigator as any).standalone === true;
  };
  
  // Function to check network status
  export const setupNetworkStatusListener = (
    onOnline: () => void,
    onOffline: () => void
  ) => {
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
  
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  };