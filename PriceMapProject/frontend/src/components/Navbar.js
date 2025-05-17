/**
 * Code made by:
 * - Manuel Santos nº 111087
 * - Alexandre Mendes nº 111026
 * - Vlad Ganta nº 110672
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import SearchBar from './SearchBar';
import '../styles/components/Navbar.css';

/**
 * Navbar component that provides site-wide navigation
 * Features:
 * - Displays different links based on authentication state
 * - Shows admin link for admin users
 * - Username links to profile page
 * - Handles logout functionality
 * - Includes search bar for product search
 * 
 * @returns {JSX.Element} The navigation bar component
 */
const Navbar = () => {
  const navigate = useNavigate();
  const isLoggedIn = authService.isLoggedIn();
  const user = authService.getCurrentUser();
  const isAdmin = authService.isAdmin();

  /**
   * Handles user logout
   * Clears authentication state and redirects to login page
   */
  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/">
            <h1>PriceMap</h1>
          </Link>
        </div>
        
        <div className="navbar-menu">
          {/* Search bar component */}
          {isLoggedIn && <SearchBar />}
          
          {isLoggedIn ? (
            <>
              {isAdmin && (
                <Link to="/admin" className="navbar-item admin-link">
                  <i className="fas fa-cog"></i> Admin
                </Link>
              )}
              {/* Removed Profile button, made username clickable and link to profile */}
              <Link to="/profile" className="navbar-item user-greeting">
                <i className="fas fa-user"></i> {user?.username || 'User'}
              </Link>
              <button onClick={handleLogout} className="logout-btn">
                <i className="fas fa-sign-out-alt"></i> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-item">Login</Link>
              <Link to="/register" className="navbar-item">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 