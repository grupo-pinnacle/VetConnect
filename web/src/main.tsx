import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { initSentry, Sentry } from './lib/sentry';

initSentry();

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <Sentry.ErrorBoundary
        fallback={({ error }) => (
          <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center bg-gray-50">
            <div className="max-w-md p-6 bg-white rounded-xl shadow-lg border border-red-100">
              <h2 className="text-xl font-bold text-red-600 mb-2">Error inesperado en la aplicación</h2>
              <p className="text-sm text-gray-600 mb-4">
                El equipo técnico ha sido notificado automáticamente a través de la telemetría.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                Recargar página
              </button>
            </div>
          </div>
        )}
      >
        <App />
      </Sentry.ErrorBoundary>
    </React.StrictMode>
  );
}

