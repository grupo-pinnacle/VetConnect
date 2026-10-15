import React, { useEffect, useState, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useParams, useNavigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import OfflineBanner from './components/common/OfflineBanner';
import GlobalCallListener from './components/call/GlobalCallListener';
import CookieConsentBanner from './components/common/CookieConsentBanner';
import SessionTerminatedModal from './components/common/SessionTerminatedModal';

import landingCss from './styles/landing.css?inline';
import clientCss from './styles/client.css?inline';
import authCss from './styles/auth.css?inline';
import adminCss from './styles/admin.css?inline';

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
const AdminApp = lazy(() => import('./pages/AdminApp'));

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
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { replace: true });
    } else if (!loading && user?.role === 'VET') {
      navigate('/vet/dashboard', { replace: true });
    } else if (!loading && user?.role === 'ADMIN') {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  if (!loading && (!user || user?.role === 'VET' || user?.role === 'ADMIN')) {
    return <div className="route-loading" role="status">Redirigiendo…</div>;
  }

  return (
    <>
      <ScopedStyle id="client-style" css={clientCss} />
      <ClientApp />
    </>
  );
};

const VetWrapper: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { replace: true });
    } else if (!loading && user?.role === 'CLIENT') {
      navigate('/client/dashboard', { replace: true });
    } else if (!loading && user?.role === 'ADMIN') {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  if (!loading && (!user || user?.role !== 'VET')) {
    return <div className="route-loading" role="status">Redirigiendo…</div>;
  }

  return (
    <>
      <ScopedStyle id="client-style" css={clientCss} />
      <VetApp path={location.pathname} />
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

const AdminWrapper: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) {
      navigate('/login', { replace: true });
    }
  }, [user, loading, navigate]);

  if (!loading && (!user || user.role !== 'ADMIN')) {
    return <div className="route-loading" role="status">Acceso restringido. Redirigiendo a inicio de sesión…</div>;
  }

  return (
    <>
      <ScopedStyle id="client-style" css={clientCss} />
      <ScopedStyle id="admin-style" css={adminCss} />
      <AdminApp />
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
            <SessionTerminatedModal />
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

                {/* 6. Panel de Administración (Super Admin CRUD) */}
                <Route path="/admin/*" element={<AdminWrapper />} />
                <Route path="/admin" element={<AdminWrapper />} />

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
