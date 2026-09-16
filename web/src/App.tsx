import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardClient from './pages/DashboardClient';
import DashboardVet from './pages/DashboardVet';
import AdminVets from './pages/AdminVets';
import ConsultationRoom from './pages/ConsultationRoom';
import PrescriptionView from './pages/PrescriptionView';
import NotFound from './pages/NotFound';

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
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
