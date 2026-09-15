import React from 'react';
import ReactDOM from 'react-dom/client';

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <div>VetConnect Web</div>
    </React.StrictMode>
  );
}
