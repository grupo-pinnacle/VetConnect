import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

if (import.meta.env.VITE_SENTRY_DSN) {
  const win = window as Window & { requestIdleCallback?: (cb: () => void) => number };
  const schedule = win.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1500));
  schedule(() => {
    void import('./lib/sentry').then((m) => m.initSentry());
  });
}

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

