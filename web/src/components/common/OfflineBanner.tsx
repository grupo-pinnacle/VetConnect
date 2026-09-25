import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, AlertTriangle } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? !navigator.onLine : false;
  });
  const [reconnected, setReconnected] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOffline = () => {
      setIsOffline(true);
      setReconnected(false);
    };

    const handleOnline = () => {
      setIsOffline(false);
      setReconnected(true);
      const timer = window.setTimeout(() => {
        setReconnected(false);
      }, 3500);
      return () => window.clearTimeout(timer);
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  if (!isOffline && !reconnected) {
    return null;
  }

  if (reconnected) {
    return (
      <aside
        role="status"
        aria-live="polite"
        data-testid="online-reconnected-banner"
        className="w-full bg-emerald-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all animate-in fade-in slide-in-from-top-2 duration-300 z-50 sticky top-0"
      >
        <Wifi className="w-3.5 h-3.5" aria-hidden="true" />
        <span>Conexión restablecida — Sincronizando datos con la red de VetConnect...</span>
      </aside>
    );
  }

  return (
    <aside
      role="alert"
      aria-live="assertive"
      data-testid="offline-network-banner"
      className="w-full bg-amber-500 text-amber-950 px-4 py-2.5 text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all animate-in fade-in slide-in-from-top-2 duration-300 z-50 sticky top-0 border-b border-amber-600/30"
    >
      <WifiOff className="w-4 h-4 text-amber-950 shrink-0" aria-hidden="true" />
      <span>⚠️ Sin conexión a internet — Reconectando automáticamente al restablecerse el enlace...</span>
    </aside>
  );
};

export default OfflineBanner;
