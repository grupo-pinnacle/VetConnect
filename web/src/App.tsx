import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

// Code-Splitting: Lazy load heavy clinical rooms and dashboards to optimize Landing LCP
const DashboardClient = React.lazy(() => import('./pages/DashboardClient'));
const DashboardVet = React.lazy(() => import('./pages/DashboardVet'));
const AdminVets = React.lazy(() => import('./pages/AdminVets'));
const ConsultationRoom = React.lazy(() => import('./pages/ConsultationRoom'));
const PrescriptionView = React.lazy(() => import('./pages/PrescriptionView'));

const PageLoader: React.FC = () => (
  <div className="w-full h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300">
    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
    <p className="text-sm font-medium">Cargando...</p>
  </div>
);

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
            <React.Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/prescriptions/:id" element={<PrescriptionView />} />

                <Route element={<ProtectedRoute allowedRoles={['CLIENT']} />}>
                  <Route path="/client/dashboard" element={<DashboardClient />} />
                </Route>

                <Route element={<ProtectedRoute allowedRoles={['VET']} />}>
                  <Route path="/vet/dashboard" element={<DashboardVet />} />
                </Route>

                <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                  <Route path="/admin/vets" element={<AdminVets />} />
                  <Route path="/admin/dashboard" element={<AdminVets />} />
                </Route>

                <Route element={<ProtectedRoute allowedRoles={['CLIENT', 'VET', 'ADMIN']} />}>
                  <Route path="/call/:id" element={<ConsultationRoom />} />
                </Route>

                {/* Wildcard 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </React.Suspense>
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
