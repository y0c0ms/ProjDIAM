/**
 * Code made by:
 * - Manuel Santos nº 111087
 * - Alexandre Mendes nº 111026
 * - Vlad Ganta nº 110672
 */

import axios from 'axios';

// Configuração global do axios (isso ajuda a prevenir problemas de CORS)
axios.defaults.withCredentials = false;  // Alterar para false se estiver tendo problemas de CORS
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';

// Use environment variable for API URL, fallback to localhost for development
const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api/auth/';
const BASE_API_URL = API_URL.endsWith('/auth/') ? API_URL.slice(0, -5) : API_URL;

// Function to get CSRF token from cookies
const getCsrfToken = () => {
  const name = 'csrftoken';
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        return decodeURIComponent(cookie.substring(name.length + 1));
      }
    }
  }
  return null;
};

// Save token to localStorage
const setToken = (token) => {
  if (token) {
    console.log('Setting token in localStorage:', token);
    try {
      localStorage.setItem('token', token);
      const storedToken = localStorage.getItem('token');
      if (storedToken !== token) {
        console.error('Token verification failed: stored token does not match original');
      } else {
        console.log('Token successfully stored and verified');
      }
    } catch (error) {
      console.error('Error storing token in localStorage:', error);
    }
  } else {
    console.warn('Attempted to set null/undefined token');
  }
};

// Remove token from localStorage
const removeToken = () => {
  localStorage.removeItem('token');
};

// Get CSRF Token first
const fetchCsrfToken = async () => {
  try {
    await axios.get(`${BASE_API_URL}/csrf/`);
    console.log('CSRF token fetched successfully');
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
  }
};

// Register user
const register = async (username, email, password, first_name, last_name) => {
  // First fetch a CSRF token
  await fetchCsrfToken();
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCsrfToken(),
    },
    withCredentials: true,
  };

  try {
    const response = await axios.post(API_URL + 'register/', {
      username,
      email,
      password,
      first_name,
      last_name
    }, config);
    
    if (response.data.token) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setToken(response.data.token);
    }
    
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

// Login user
const login = async (username, password) => {
  // First fetch a CSRF token
  await fetchCsrfToken();
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-CSRFToken': getCsrfToken(),
    },
    withCredentials: true,
  };

  try {
    // Use the new token-login endpoint to avoid conflicts with DRF login view
    const loginUrl = API_URL + 'token-login/';
    console.log(`Sending login request for ${username} to ${loginUrl}`);
    
    const response = await axios.post(loginUrl, {
      username,
      password,
    }, config);
    
    console.log('Login response type:', typeof response.data);
    console.log('Login response:', response.data);
    
    // Check if the response is HTML (error case)
    if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
      console.error('Received HTML response instead of JSON');
      throw new Error('Server returned HTML instead of JSON. Authentication failed.');
    }
    
    if (response.data && response.data.token) {
      console.log('Token received from server:', response.data.token);
      
      // Store token directly - this is the critical fix
      localStorage.setItem('token', response.data.token);
      
      // Store user data
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      // Verify token is stored
      const storedToken = localStorage.getItem('token');
      console.log('Immediately after storage - token in localStorage:', storedToken);
      
      if (!storedToken) {
        console.error('CRITICAL ERROR: Failed to store token in localStorage');
        alert('Authentication error: Please enable cookies and localStorage in your browser settings');
      }
    } else {
      console.error('No token received in login response:', response.data);
      throw new Error('Server did not provide an authentication token');
    }
    
    return response.data;
  } catch (error) {
    console.error('Login error details:', error);
    throw error;
  }
};

// Logout user
const logout = () => {
  localStorage.removeItem('user');
  removeToken();
};

// Get current user
const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('user'));
};

// Check if user is logged in
const isLoggedIn = () => {
  const token = localStorage.getItem('token');
  console.log('Checking if user is logged in, token:', token);
  return !!token;
};

// Check if user is admin
const isAdmin = () => {
  const user = getCurrentUser();
  return user && user.is_staff;
};

// Add authorization header to every request
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    // Add CSRF token to headers if available
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Test localStorage functionality
const testLocalStorage = () => {
  try {
    const testKey = 'testLocalStorage';
    const testValue = 'working_' + Date.now();
    
    // Test writing to localStorage
    localStorage.setItem(testKey, testValue);
    
    // Test reading from localStorage
    const retrieved = localStorage.getItem(testKey);
    
    // Clean up
    localStorage.removeItem(testKey);
    
    // Result
    if (retrieved === testValue) {
      console.log('localStorage test: SUCCESS');
      return true;
    } else {
      console.error('localStorage test: FAILED - value mismatch');
      return false;
    }
  } catch (error) {
    console.error('localStorage test: ERROR', error);
    return false;
  }
};

const authService = {
  register,
  login,
  logout,
  getCurrentUser,
  isLoggedIn,
  isAdmin,
  fetchCsrfToken,
  testLocalStorage
};

export default authService; 