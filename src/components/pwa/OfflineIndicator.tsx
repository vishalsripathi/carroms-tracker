// src/components/pwa/OfflineIndicator.tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff } from 'lucide-react';
import { setupNetworkStatusListener } from '../../utils/swRegistration';

const OfflineIndicator = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const cleanup = setupNetworkStatusListener(
      () => setIsOffline(false),
      () => setIsOffline(true)
    );

    return cleanup;
  }, []);

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-0 left-0 right-0 bg-background/95 border-b border-border backdrop-blur-sm px-4 py-2 flex items-center justify-center z-50 pt-safe"
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <WifiOff className="h-4 w-4" />
            <span className="text-sm font-medium">
              You're offline. Some features may be limited.
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfflineIndicator;