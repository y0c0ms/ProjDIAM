import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
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
    
    // Validate form
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);

    try {
      console.log('Registering user with data:', {
        username: formData.username,
        email: formData.email,
        first_name: formData.firstName,
        last_name: formData.lastName
      });
      
      await authService.register(
        formData.username,
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName
      );
      
      // Login the user after registration
      await authService.login(formData.username, formData.password);
      navigate('/');
    } catch (err) {
      console.error("Registration error details:", err);
      const errData = err.response?.data;
      if (errData) {
        // Format the error message
        const errMessages = [];
        Object.keys(errData).forEach(key => {
          if (Array.isArray(errData[key])) {
            errMessages.push(`${key}: ${errData[key].join(', ')}`);
          } else {
            errMessages.push(`${key}: ${errData[key]}`);
          }
        });
        setError(errMessages.join('\n'));
      } else {
        setError('Registration failed. Please try again.');
      }
      setLoading(false);
    }
  };

  if (fetchingToken) {
    return <div className="loading-container">Loading form...</div>;
  }

  return (
    <div className="register-page">
      <h2>Register</h2>
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
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="firstName">First Name:</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="lastName">Last Name:</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
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
        
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password:</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      
      <div className="form-footer">
        <p>
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage; 