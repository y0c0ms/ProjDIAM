import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import './Navbar.css';

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
          <Link to="/" className="navbar-item">Home</Link>
          
          {isLoggedIn ? (
            <>
              {isAdmin && (
                <Link to="/admin" className="navbar-item admin-link">
                  <i className="fas fa-cog"></i> Admin
                </Link>
              )}
              <Link to="/profile" className="navbar-item">
                <i className="fas fa-user-circle"></i> Profile
              </Link>
              <span className="navbar-item user-greeting">
                <i className="fas fa-user"></i> {user?.username || 'User'}
              </span>
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