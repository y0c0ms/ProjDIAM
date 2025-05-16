/**
 * Code made by:
 * - Manuel Santos nº 111087
 * - Alexandre Mendes nº 111026
 * - Vlad Ganta nº 110672
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import authService from '../services/authService';

/**
 * ProtectedRoute component for handling authenticated routes
 * Redirects unauthenticated users to the login page
 * 
 * Usage example:
 * <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
 * 
 * @param {Object} children - The child components to render if authenticated
 * @returns {JSX.Element} Either the protected component or a redirect to login
 */
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = authService.isLoggedIn();
  console.log('ProtectedRoute: isAuthenticated =', isAuthenticated);

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute; 