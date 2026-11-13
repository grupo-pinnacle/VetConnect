import React, { useState, useEffect, useRef } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? !navigator.onLine : false;
  });
  const [reconnected, setReconnected] = useState<boolean>(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const clearTimer = () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const handleOffline = () => {
      clearTimer();
      setIsOffline(true);
      setReconnected(false);
    };

    const handleOnline = () => {
      clearTimer();
      setIsOffline(false);
      setReconnected(true);
      timerRef.current = window.setTimeout(() => {
        setReconnected(false);
        timerRef.current = null;
      }, 3500);
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      clearTimer();
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
        className="w-full bg-[#315f5d] text-[#fffbef] px-4 py-2.5 text-xs font-bold flex items-center justify-center gap-2 shadow-sm animate-fadeIn z-50 sticky top-0 font-['Manrope',sans-serif]"
      >
        <Wifi className="w-3.5 h-3.5 text-[#d9e8e4]" aria-hidden="true" />
        <span>Conexión restablecida — Sincronizando datos con la red de HuelliCam...</span>
      </aside>
    );
  }

  return (
    <aside
      role="alert"
      aria-live="assertive"
      data-testid="offline-network-banner"
      className="w-full bg-[#fbeee9] text-[#183c3a] px-4 py-2.5 text-xs font-bold flex items-center justify-center gap-2 shadow-sm animate-fadeIn z-50 sticky top-0 border-b border-[#e98b70]/45 font-['Manrope',sans-serif]"
    >
      <WifiOff className="w-4 h-4 text-[#ae4d45] shrink-0" aria-hidden="true" />
      <span>Sin conexión a internet — Reconectando automáticamente al restablecerse el enlace...</span>
    </aside>
  );
};

export default OfflineBanner;
