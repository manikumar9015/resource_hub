// frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // <-- ADD THIS LOADING STATE

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
        console.log('AuthContext: User loaded from localStorage.', JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("AuthContext: Failed to parse user from localStorage", error);
    } finally {
      // No matter what, we're done loading after the check.
      setLoading(false); 
    }
  }, []); // The empty dependency array means this runs only once on mount.

  const login = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    console.log('AuthContext: User has been set on login.', userData);
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  // Provide the loading state in the context value
  const value = {
    user,
    loading, // <-- PROVIDE LOADING STATE
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};