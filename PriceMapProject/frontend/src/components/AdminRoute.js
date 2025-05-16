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
 * AdminRoute component for protecting admin-only routes
 * Performs two levels of checks:
 * 1. User must be authenticated (logged in)
 * 2. User must have admin privileges
 * 
 * Usage example:
 * <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
 * 
 * @param {Object} children - The child components to render if user is an authenticated admin
 * @returns {JSX.Element} The admin component, redirect to login, or redirect to homepage
 */
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