import { useState, useEffect, useCallback } from 'react';

export interface NetworkStatus {
  isOnline: boolean;
  isApiReachable: boolean;
  lastOnlineAt: Date | null;
  lastCheckedAt: Date;
  wasOffline: boolean;
}

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });
  const [isApiReachable, setIsApiReachable] = useState<boolean>(true);
  const [lastOnlineAt, setLastOnlineAt] = useState<Date | null>(new Date());
  const [lastCheckedAt, setLastCheckedAt] = useState<Date>(new Date());
  const [wasOffline, setWasOffline] = useState<boolean>(false);

  // Connectivity check helper
  const checkApiConnectivity = useCallback(async () => {
    if (!navigator.onLine) {
      setIsOnline(false);
      setIsApiReachable(false);
      return false;
    }

    try {
      // Fast lightweight ping to check actual Internet / API reachability
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      
      const response = await fetch('/api/weather/current?city=Delhi&state=Delhi', {
        method: 'HEAD',
        signal: controller.signal,
        cache: 'no-store',
      }).catch(() => null);

      clearTimeout(timeoutId);

      const reachable = response !== null ? response.ok || response.status < 500 : true;
      setIsApiReachable(reachable);
      setIsOnline(true);
      setLastCheckedAt(new Date());
      if (reachable) {
        setLastOnlineAt(new Date());
      }
      return reachable;
    } catch {
      // In standalone client preview mode or offline
      setIsApiReachable(navigator.onLine);
      return navigator.onLine;
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setLastOnlineAt(new Date());
      checkApiConnectivity();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsApiReachable(false);
      setWasOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Periodic heartbeat every 45s
    const interval = setInterval(() => {
      if (navigator.onLine) {
        checkApiConnectivity();
      }
    }, 45000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [checkApiConnectivity]);

  const retryConnection = useCallback(async () => {
    return await checkApiConnectivity();
  }, [checkApiConnectivity]);

  return {
    isOnline,
    isApiReachable,
    isWorkingOffline: !isOnline || !isApiReachable,
    lastOnlineAt,
    lastCheckedAt,
    wasOffline,
    retryConnection,
  };
}
