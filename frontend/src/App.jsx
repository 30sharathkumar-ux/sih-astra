import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import AuthCallback from './pages/AuthCallback';

// Simple placeholder for routes under development
const Placeholder = ({ title }) => (
  <div className="flex-1 flex flex-col p-5 sm:p-6 lg:p-8 space-y-6 overflow-y-auto w-full">
    <div className="bg-white rounded-3xl p-8 shadow-card h-full flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
      <p className="text-gray-500 mt-2">This module is currently under development.</p>
    </div>
  </div>
);

/**
 * AppShell — the authenticated layout wrapper (Sidebar + main content).
 * Only rendered for protected routes.
 */
const AppShell = ({ children }) => (
  <div className="min-h-screen flex flex-col lg:flex-row w-full bg-brand-surface font-sans antialiased text-gray-900">
    <Sidebar />
    {children}
  </div>
);

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* ── Public routes ── */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* ── Protected routes ── */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppShell><Dashboard /></AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <AppShell><ProfilePage /></AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/monitoring"
            element={
              <ProtectedRoute>
                <AppShell><Placeholder title="Farm Monitoring" /></AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/disease-detection"
            element={
              <ProtectedRoute>
                <AppShell><Placeholder title="Disease Detection (Edge AI)" /></AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/weather"
            element={
              <ProtectedRoute>
                <AppShell><Placeholder title="Weather Forecast" /></AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/alerts"
            element={
              <ProtectedRoute>
                <AppShell><Placeholder title="System Alerts" /></AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <AppShell><Placeholder title="Settings" /></AppShell>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
