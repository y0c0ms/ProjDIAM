/**
 * Code made by:
 * - Manuel Santos nº 111087
 * - Alexandre Mendes nº 111026
 * - Vlad Ganta nº 110672
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import authService from '../services/authService';
import badWordsService from '../services/badWordsService';
import StarDisplay from '../components/StarDisplay';
import '../styles/pages/AdminPage.css';

const AdminPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [prices, setPrices] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isCheckingComments, setIsCheckingComments] = useState(false);
  const [filteredComments, setFilteredComments] = useState([]);
  const [showFilteredOnly, setShowFilteredOnly] = useState(false);

  // Check if user is admin
  useEffect(() => {
    if (!authService.isAdmin()) {
      navigate('/');
    }
  }, [navigate]);

  // Get auth token
  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
      }
    };
  };

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('http://localhost:8000/api/users/', getAuthHeader());
      setUsers(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users. ' + (err.response?.data?.message || err.message));
      setLoading(false);
    }
  };

  // Fetch locations
  const fetchLocations = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('http://localhost:8000/api/locations/', getAuthHeader());
      setLocations(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching locations:', err);
      setError('Failed to fetch locations. ' + (err.response?.data?.message || err.message));
      setLoading(false);
    }
  };

  // Fetch prices
  const fetchPrices = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('http://localhost:8000/api/prices/', getAuthHeader());
      setPrices(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching prices:', err);
      setError('Failed to fetch prices. ' + (err.response?.data?.message || err.message));
      setLoading(false);
    }
  };

  // Fetch comments
  const fetchComments = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('http://localhost:8000/api/comments/', getAuthHeader());
      setComments(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Failed to fetch comments. ' + (err.response?.data?.message || err.message));
      setLoading(false);
    }
  };

  // Load data based on active tab
  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'locations') {
      fetchLocations();
    } else if (activeTab === 'prices') {
      fetchPrices();
    } else if (activeTab === 'comments') {
      fetchComments();
    }
  }, [activeTab]);

  // Delete user
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      setLoading(true);
      await axios.delete(`http://localhost:8000/api/users/${userId}/`, getAuthHeader());
      setSuccessMessage('User deleted successfully');
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user. ' + (err.response?.data?.message || err.message));
      setLoading(false);
    }
  };

  // Delete location
  const handleDeleteLocation = async (locationId) => {
    if (!window.confirm('Are you sure you want to delete this location?')) return;
    
    try {
      setLoading(true);
      await axios.delete(`http://localhost:8000/api/locations/${locationId}/`, getAuthHeader());
      setSuccessMessage('Location deleted successfully');
      fetchLocations();
    } catch (err) {
      console.error('Error deleting location:', err);
      setError('Failed to delete location. ' + (err.response?.data?.message || err.message));
      setLoading(false);
    }
  };

  // Delete price
  const handleDeletePrice = async (priceId) => {
    if (!window.confirm('Are you sure you want to delete this price?')) return;
    
    try {
      setLoading(true);
      await axios.delete(`http://localhost:8000/api/prices/${priceId}/`, getAuthHeader());
      setSuccessMessage('Price deleted successfully');
      fetchPrices();
    } catch (err) {
      console.error('Error deleting price:', err);
      setError('Failed to delete price. ' + (err.response?.data?.message || err.message));
      setLoading(false);
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    
    try {
      setLoading(true);
      await axios.delete(`http://localhost:8000/api/comments/${commentId}/`, getAuthHeader());
      setSuccessMessage('Comment deleted successfully');
      fetchComments();
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError('Failed to delete comment. ' + (err.response?.data?.message || err.message));
      setLoading(false);
    }
  };

  // Clear messages after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Update this function to use synchronous methods
  const checkCommentsForProfanity = () => {
    setIsCheckingComments(true);
    
    try {
      const profanityResults = comments.map(comment => {
        try {
          const result = badWordsService.checkProfanity(comment.text);
          return {
            ...comment,
            hasProfanity: result.bad_words_total > 0,
            profanityCount: result.bad_words_total,
            badWords: result.bad_words_list
          };
        } catch (error) {
          console.error(`Error checking comment ${comment.id}:`, error);
          return {
            ...comment,
            hasProfanity: false,
            profanityCount: 0,
            badWords: []
          };
        }
      });
      
      const filtered = profanityResults.filter(comment => comment.hasProfanity);
      setFilteredComments(filtered);
      setShowFilteredOnly(filtered.length > 0);
      
      if (filtered.length > 0) {
        setSuccessMessage(`Found ${filtered.length} comments with potential profanity.`);
      } else {
        setSuccessMessage('No comments with profanity found.');
      }
    } catch (error) {
      console.error('Error checking comments for profanity:', error);
      setError('Failed to check comments for profanity.');
    } finally {
      setIsCheckingComments(false);
    }
  };
  
  // Update this function to use synchronous censor
  const handleCensorComment = async (commentId) => {
    try {
      const comment = comments.find(c => c.id === commentId);
      if (!comment) return;
      
      setLoading(true);
      
      // Get censored version - now synchronous
      const censoredText = badWordsService.censorProfanity(comment.text);
      
      // Update the comment in the database
      await axios.patch(`http://localhost:8000/api/comments/${commentId}/`, {
        text: censoredText
      }, getAuthHeader());
      
      // Show success notification
      setSuccessMessage('Comment censored successfully.');
      
      // Refresh comments
      fetchComments();
    } catch (error) {
      console.error('Error censoring comment:', error);
      setError('Failed to censor comment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <h1>Admin Dashboard</h1>
      
      {successMessage && <div className="success-message">{successMessage}</div>}
      {error && <div className="error-message">{error}</div>}
      
      <div className="admin-tabs">
        <button 
          className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button 
          className={`tab-button ${activeTab === 'locations' ? 'active' : ''}`}
          onClick={() => setActiveTab('locations')}
        >
          Locations
        </button>
        <button 
          className={`tab-button ${activeTab === 'prices' ? 'active' : ''}`}
          onClick={() => setActiveTab('prices')}
        >
          Prices
        </button>
        <button 
          className={`tab-button ${activeTab === 'comments' ? 'active' : ''}`}
          onClick={() => setActiveTab('comments')}
        >
          Comments
        </button>
      </div>
      
      <div className="admin-content">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
            {activeTab === 'users' && (
              <div className="users-tab">
                <h2>Manage Users</h2>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Date Joined</th>
                      <th>Admin</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.username}</td>
                        <td>{user.email}</td>
                        <td>{new Date(user.date_joined).toLocaleDateString()}</td>
                        <td>{user.is_staff ? 'Yes' : 'No'}</td>
                        <td>
                          <button 
                            className="delete-btn"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {activeTab === 'locations' && (
              <div className="locations-tab">
                <h2>Manage Locations</h2>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Address</th>
                      <th>Created By</th>
                      <th>Date Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {locations.map(location => (
                      <tr key={location.id}>
                        <td>{location.id}</td>
                        <td>{location.name}</td>
                        <td>{location.address}</td>
                        <td>{location.created_by?.username || 'Unknown'}</td>
                        <td>{new Date(location.created_at).toLocaleDateString()}</td>
                        <td>
                          <button 
                            className="delete-btn"
                            onClick={() => handleDeleteLocation(location.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {activeTab === 'prices' && (
              <div className="prices-tab">
                <h2>Manage Prices</h2>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Location</th>
                      <th>Reported By</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prices.map(price => (
                      <tr key={price.id}>
                        <td>{price.id}</td>
                        <td>{price.product_name}</td>
                        <td>€{price.price}</td>
                        <td>{price.location_name}</td>
                        <td>{price.reported_by?.username || 'Unknown'}</td>
                        <td>{new Date(price.date_reported).toLocaleDateString()}</td>
                        <td>
                          <button 
                            className="delete-btn"
                            onClick={() => handleDeletePrice(price.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'comments' && (
              <div className="comments-tab">
                <h2>Manage Comments</h2>
                
                {/* Add filter controls */}
                <div className="filter-controls">
                  <button
                    onClick={checkCommentsForProfanity}
                    disabled={isCheckingComments}
                    className="filter-btn"
                  >
                    {isCheckingComments ? 'Checking...' : 'Check for Profanity'}
                  </button>
                  
                  {filteredComments.length > 0 && (
                    <label className="filter-toggle">
                      <input
                        type="checkbox"
                        checked={showFilteredOnly}
                        onChange={() => setShowFilteredOnly(!showFilteredOnly)}
                      />
                      Show only comments with profanity ({filteredComments.length})
                    </label>
                  )}
                </div>
                
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Location</th>
                      <th>User</th>
                      <th>Comment</th>
                      <th>Rating</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(showFilteredOnly ? filteredComments : comments).map(comment => (
                      <tr key={comment.id} className={comment.hasProfanity ? 'profanity-row' : ''}>
                        <td>{comment.id}</td>
                        <td>{comment.location?.name || 'Unknown'}</td>
                        <td>{comment.user?.username || 'Unknown'}</td>
                        <td className="comment-text-cell">
                          {comment.text}
                          {comment.hasProfanity && (
                            <div className="profanity-badge" title={`Bad words: ${comment.badWords?.join(', ')}`}>
                              {comment.profanityCount} bad word(s)
                            </div>
                          )}
                        </td>
                        <td className="rating-cell">
                          <StarDisplay rating={comment.rating} />
                        </td>
                        <td>{new Date(comment.created_at).toLocaleDateString()}</td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="delete-btn"
                              onClick={() => handleDeleteComment(comment.id)}
                            >
                              Delete
                            </button>
                            
                            {comment.hasProfanity && (
                              <button 
                                className="censor-btn"
                                onClick={() => handleCensorComment(comment.id)}
                              >
                                Censor
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPage; 