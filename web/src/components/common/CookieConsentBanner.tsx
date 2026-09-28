import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cookie, ShieldCheck, X } from 'lucide-react';

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
      className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 text-white shadow-2xl animate-fadeIn"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5 max-w-3xl">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
            <Cookie className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            <p className="font-bold text-white mb-1">
              Valoramos tu privacidad y la de tus mascotas
            </p>
            <p>
              Utilizamos cookies técnicas necesarias para la autenticación y la seguridad de tus sesiones. Opcionalmente, podemos utilizar telemetría anónima para optimizar la calidad de audio y video en tus consultas. Puedes consultar todos los detalles en nuestra{' '}
              <Link
                to="/cookies"
                className="text-emerald-400 underline hover:text-emerald-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded"
              >
                Política de Cookies
              </Link>{' '}
              y nuestra{' '}
              <Link
                to="/privacy"
                className="text-emerald-400 underline hover:text-emerald-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded"
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
            className="flex-1 md:flex-none px-4 py-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-950 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer"
          >
            Solo Necesarias
          </button>
          <button
            type="button"
            data-testid="cookie-accept-all"
            onClick={() => savePreferences(true)}
            className="flex-1 md:flex-none px-5 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-md shadow-emerald-900/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
          >
            Aceptar Todas
          </button>
        </div>
      </div>
    </aside>
  );
};

export default CookieConsentBanner;
