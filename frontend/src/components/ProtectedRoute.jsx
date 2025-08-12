// frontend/src/components/ProtectedRoute.jsx
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  // 1. First, check if we are still loading the user state
  if (loading) {
    // If we are loading, show a simple loading message.
    // This prevents the redirect from happening before we've checked localStorage.
    return <div className="text-center mt-20">Loading...</div>;
  }

  // 2. After loading is false, check if there is a user
  if (!user) {
    // If there's no user, THEN we redirect to login.
    return <Navigate to="/login" replace />;
  }

  // 3. If loading is done and there is a user, show the page.
  return children;
};

export default ProtectedRoute;