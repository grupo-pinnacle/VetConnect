import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import DashboardClient from './pages/DashboardClient';
import DashboardVet from './pages/DashboardVet';
import AdminVets from './pages/AdminVets';
import ConsultationRoom from './pages/ConsultationRoom';

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
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Navigate to="/login" replace />} />

            <Route element={<ProtectedRoute allowedRoles={['CLIENT']} />}>
              <Route path="/client/dashboard" element={<DashboardClient />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['VET']} />}>
              <Route path="/vet/dashboard" element={<DashboardVet />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route path="/admin/vets" element={<AdminVets />} />
              <Route path="/admin/dashboard" element={<Navigate to="/admin/vets" replace />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['CLIENT', 'VET', 'ADMIN']} />}>
              <Route path="/call/:id" element={<ConsultationRoom />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
