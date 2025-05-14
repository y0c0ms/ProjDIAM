import React from 'react';
import { Navigate } from 'react-router-dom';
import authService from '../services/authService';

const AdminRoute = ({ children }) => {
  const isAuthenticated = authService.isLoggedIn();
  const isAdmin = authService.isAdmin();
  console.log('AdminRoute: isAuthenticated =', isAuthenticated, 'isAdmin =', isAdmin);

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    // Redirect to home if authenticated but not admin
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute; 