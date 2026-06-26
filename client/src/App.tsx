import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { useEffect } from 'react';
import { connectSocket } from './lib/socket';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import BoardPage from './pages/BoardPage';
import Layout from './components/layout/Layout';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function AppContent() {
  const { isAuthenticated, logout, token } = useAuthStore();

  // On mount, validate the stored token against the server
  // This catches stale/mismatched tokens from previous sessions
  useEffect(() => {
    if (isAuthenticated && token) {
      import('./lib/axios').then(({ default: api }) => {
        api.get('/auth/me').catch(() => {
          // Token is invalid or belongs to wrong user — wipe everything and force login
          localStorage.clear();
          sessionStorage.clear();
          window.location.href = '/login';
        });
      });
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) connectSocket();
  }, [isAuthenticated]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="projects/:projectId" element={<BoardPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#1e293b', color: '#e2e8f0', border: '1px solid #334155' },
        }}
      />
      <AppContent />
    </BrowserRouter>
  );
}
