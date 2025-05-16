import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import '../styles/components/Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const isLoggedIn = authService.isLoggedIn();
  const user = authService.getCurrentUser();
  const isAdmin = authService.isAdmin();

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
          {/* Removed Home button */}
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