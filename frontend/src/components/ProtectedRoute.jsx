import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute — wraps any route that requires authentication.
 * Shows a spinner while the session is being determined.
 * Redirects to /login if unauthenticated.
 */
const ProtectedRoute = ({ children }) => {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-surface">
        <div className="flex flex-col items-center gap-4">
          {/* Spinning leaf icon */}
          <div className="w-14 h-14 rounded-full bg-brand-dark flex items-center justify-center animate-spin">
            <svg className="w-8 h-8 text-brand-lime fill-current" viewBox="0 0 24 24">
              <path d="M21 3v2c0 6.075-4.925 11-11 11H8v5H5V8c0-2.76 2.24-5 5-5h11z" />
            </svg>
          </div>
          <p className="text-brand-muted font-semibold text-sm">Loading Harvest…</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
