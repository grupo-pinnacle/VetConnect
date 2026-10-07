import React, { useEffect, useState, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import OfflineBanner from './components/common/OfflineBanner';
import GlobalCallListener from './components/call/GlobalCallListener';
import CookieConsentBanner from './components/common/CookieConsentBanner';

import landingCss from './styles/landing.css?inline';
import clientCss from './styles/client.css?inline';
import authCss from './styles/auth.css?inline';

import Landing from './pages/Landing';
import AuthExperience from './pages/AuthExperience';
const ClientApp = lazy(() => import('./pages/ClientApp'));
const VetApp = lazy(() => import('./vet/VetApp'));
const CallRoom = lazy(() => import('./vet/CallRoom'));

// Compliance & Extra Pages
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsConditions = lazy(() => import('./pages/TermsConditions'));
const CookiePolicy = lazy(() => import('./pages/CookiePolicy'));
const RefundPolicy = lazy(() => import('./pages/RefundPolicy'));
const PrescriptionView = lazy(() => import('./pages/PrescriptionView'));

export function ScopedStyle({ css, id }: { css: string; id: string }) {
  useEffect(() => {
    let style = document.getElementById(id) as HTMLStyleElement | null;
    if (!style) {
      style = document.createElement('style');
      style.id = id;
      style.textContent = css;
      document.head.appendChild(style);
    }
    return () => {
      style?.remove();
    };
  }, [css, id]);
  return null;
}

const LandingWrapper: React.FC = () => {
  return (
    <>
      <ScopedStyle id="landing-style" css={landingCss} />
      <Landing />
    </>
  );
};

const AuthWrapper: React.FC = () => {
  return (
    <>
      <ScopedStyle id="landing-style" css={landingCss} />
      <ScopedStyle id="auth-style" css={authCss} />
      <AuthExperience />
    </>
  );
};

const ClientWrapper: React.FC = () => {
  return (
    <>
      <ScopedStyle id="client-style" css={clientCss} />
      <ClientApp />
    </>
  );
};

const VetWrapper: React.FC = () => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const onPop = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  return (
    <>
      <ScopedStyle id="client-style" css={clientCss} />
      <VetApp path={currentPath} />
    </>
  );
};

const CallWrapper: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  return (
    <>
      <ScopedStyle id="client-style" css={clientCss} />
      <CallRoom id={id || 'milo'} />
    </>
  );
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <OfflineBanner />
            <GlobalCallListener />
            <CookieConsentBanner />
            <Suspense fallback={<div className="route-loading" role="status">Cargando...</div>}>
              <Routes>
                {/* 1. Landing & Inicio */}
                <Route path="/" element={<LandingWrapper />} />

                {/* 2. Autenticación (Login, Registro Tutores/Vets, Olvidé Contraseña) */}
                <Route path="/login" element={<AuthWrapper />} />
                <Route path="/register/*" element={<AuthWrapper />} />
                <Route path="/register" element={<AuthWrapper />} />
                <Route path="/forgot-password" element={<AuthWrapper />} />

                {/* 3. Portal de Tutores (Cliente) */}
                <Route path="/client/*" element={<ClientWrapper />} />
                <Route path="/client" element={<ClientWrapper />} />

                {/* 4. Portal Profesional (Veterinario) */}
                <Route path="/vet/*" element={<VetWrapper />} />
                <Route path="/vet" element={<VetWrapper />} />

                {/* 5. Videoconsultas en vivo */}
                <Route path="/call/:id" element={<CallWrapper />} />

                {/* Recetas y verificaciones SENASA */}
                <Route path="/prescriptions/:id" element={<PrescriptionView />} />
                <Route path="/verify-rx" element={<PrescriptionView />} />

                {/* Páginas Legales */}
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsConditions />} />
                <Route path="/cookies" element={<CookiePolicy />} />
                <Route path="/refunds" element={<RefundPolicy />} />

                {/* Fallback */}
                <Route path="*" element={<LandingWrapper />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
