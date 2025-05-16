/**
 * Code made by:
 * - Manuel Santos nº 111087
 * - Alexandre Mendes nº 111026
 * - Vlad Ganta nº 110672
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingToken, setFetchingToken] = useState(true);

  // Fetch CSRF token when component mounts
  useEffect(() => {
    const getCSRFToken = async () => {
      try {
        setFetchingToken(true);
        await authService.fetchCsrfToken();
        setFetchingToken(false);
      } catch (err) {
        console.error('Error fetching CSRF token:', err);
        setError('Error connecting to server. Please try again later.');
        setFetchingToken(false);
      }
    };
    
    getCSRFToken();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Test localStorage functionality
      const localStorageWorking = authService.testLocalStorage();
      if (!localStorageWorking) {
        setError('Your browser localStorage is not working. Please enable cookies and storage in your browser settings.');
        setLoading(false);
        return;
      }
      
      console.log('Attempting login with:', formData.username);
      const response = await authService.login(formData.username, formData.password);
      console.log('Login successful, response:', response);
      
      // Try to manually set the token again as a fallback
      if (response && response.token) {
        localStorage.setItem('token', response.token);
        console.log('Manually set token as fallback');
      }
      
      // Check if token is properly stored
      const token = localStorage.getItem('token');
      console.log('Storage after login:', token ? 'Token found' : 'No token found');
      
      if (!token) {
        // One last attempt with a delay
        setTimeout(() => {
          if (response && response.token) {
            localStorage.setItem('token', response.token);
            const retryToken = localStorage.getItem('token');
            if (retryToken) {
              console.log('Token storage successful after delay');
              navigate('/');
            } else {
              console.error('Final attempt to store token failed');
              setError('Login failed: Browser storage issue. Please enable cookies/localStorage.');
            }
          }
          setLoading(false);
        }, 500);
        return;
      }
      
      console.log('User is now logged in, token stored successfully');
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      let errMessage = '';
      
      if (err.response?.data) {
        if (err.response.data.error) {
          errMessage = err.response.data.error;
        } else if (err.response.data.non_field_errors) {
          errMessage = Array.isArray(err.response.data.non_field_errors) 
            ? err.response.data.non_field_errors.join(', ')
            : err.response.data.non_field_errors;
        }
      }
      
      if (!errMessage) {
        errMessage = err.message || 'Login failed. Please check your credentials.';
      }
      
      setError(errMessage);
      setLoading(false);
    }
  };

  if (fetchingToken) {
    return <div className="loading-container">Loading form...</div>;
  }

  return (
    <div className="login-page">
      <h2>Login</h2>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      
      <div className="form-footer">
        <p>
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage; 