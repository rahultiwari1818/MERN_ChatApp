import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../Contexts/AuthProvider';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  return children;
}
