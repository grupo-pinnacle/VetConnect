import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cookie } from 'lucide-react';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  timestamp: string;
}

export const CookieConsentBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('vetconnect_cookie_consent');
      if (!stored) {
        setShowBanner(true);
      }
    } catch {
      // In case localStorage is blocked/restricted
      setShowBanner(false);
    }
  }, []);

  const savePreferences = (analyticsAllowed: boolean) => {
    const prefs: CookiePreferences = {
      necessary: true,
      analytics: analyticsAllowed,
      timestamp: new Date().toISOString(),
    };
    try {
      localStorage.setItem('vetconnect_cookie_consent', JSON.stringify(prefs));
    } catch (e) {
      console.warn('No se pudo guardar la preferencia de cookies en localStorage:', e);
    }
    setShowBanner(false);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <aside
      role="region"
      aria-label="Aviso sobre cookies y privacidad"
      data-testid="cookie-consent-banner"
      className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-5 bg-[#183c3a]/95 backdrop-blur-md border-t border-[#fffbef]/15 text-[#fffbef] shadow-2xl animate-fadeIn font-['Manrope',sans-serif]"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5 max-w-3xl">
          <div className="w-10 h-10 rounded-2xl bg-[#609f9c]/25 text-[#d9e8e4] border border-[#d9e8e4]/20 flex items-center justify-center shrink-0 mt-0.5">
            <Cookie className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="text-xs sm:text-sm text-[#d9e8e4] leading-relaxed">
            <p className="font-bold text-[#fffbef] mb-1">
              Valoramos tu privacidad y la de tus mascotas
            </p>
            <p>
              Utilizamos cookies técnicas necesarias para la autenticación y la seguridad de tus sesiones. Opcionalmente, podemos utilizar telemetría anónima para optimizar la calidad de audio y video en tus consultas. Podés consultar todos los detalles en nuestra{' '}
              <Link
                to="/cookies"
                className="text-[#fffbef] font-semibold underline decoration-[#609f9c] hover:text-[#d9e8e4] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#609f9c] rounded"
              >
                Política de Cookies
              </Link>{' '}
              y nuestra{' '}
              <Link
                to="/privacy"
                className="text-[#fffbef] font-semibold underline decoration-[#609f9c] hover:text-[#d9e8e4] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#609f9c] rounded"
              >
                Política de Privacidad
              </Link>
              .
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto shrink-0">
          <button
            type="button"
            data-testid="cookie-accept-necessary"
            onClick={() => savePreferences(false)}
            className="flex-1 md:flex-none px-5 py-2.5 bg-transparent hover:bg-[#fffbef]/10 text-[#fffbef] border border-[#fffbef]/30 rounded-full text-xs font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#609f9c] cursor-pointer"
          >
            Solo Necesarias
          </button>
          <button
            type="button"
            data-testid="cookie-accept-all"
            onClick={() => savePreferences(true)}
            className="flex-1 md:flex-none px-6 py-2.5 bg-[#609f9c] hover:bg-[#4d8d89] active:bg-[#315f5d] text-white rounded-full text-xs font-bold transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#fffbef] cursor-pointer"
          >
            Aceptar Todas
          </button>
        </div>
      </div>
    </aside>
  );
};

export default CookieConsentBanner;
