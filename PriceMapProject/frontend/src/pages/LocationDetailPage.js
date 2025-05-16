/**
 * Code made by:
 * - Manuel Santos nº 111087
 * - Alexandre Mendes nº 111026
 * - Vlad Ganta nº 110672
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import PriceForm from '../components/PriceForm';
import CommentForm from '../components/CommentForm';
import StarDisplay from '../components/StarDisplay';
import authService from '../services/authService';
import '../styles/pages/LocationDetailPage.css';

const LocationDetailPage = () => {
  // Get locationId from URL params
  const { id } = useParams();
  const [location, setLocation] = useState({});
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showPriceForm, setShowPriceForm] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  
  // Check authentication status
  useEffect(() => {
    setIsLoggedIn(authService.isLoggedIn());
  }, []);
  
  // Fetch location data
  useEffect(() => {
    const fetchLocationDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8000/api/locations/${id}/`);
        setLocation(response.data);
        
        // Calculate average rating
        if (response.data.comments && response.data.comments.length > 0) {
          const ratings = response.data.comments.map(comment => comment.rating);
          const sum = ratings.reduce((a, b) => a + b, 0);
          setAverageRating((sum / ratings.length).toFixed(1));
          setCommentCount(ratings.length);
        }
        
        // Fetch prices for this location
        const pricesResponse = await axios.get(`http://localhost:8000/api/prices/?location=${id}`);
        setPrices(pricesResponse.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching location details:', err);
        setError('Failed to load location details');
        setLoading(false);
      }
    };
    
    fetchLocationDetails();
  }, [id]);
  
  // Open location in Google Maps
  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`;
    window.open(url, '_blank');
  };
  
  // Handle new price added
  const handlePriceAdded = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/prices/?location=${id}`);
      setPrices(response.data);
      setShowPriceForm(false);
    } catch (err) {
      console.error('Error refreshing prices:', err);
    }
  };
  
  // Handle comment added
  const handleCommentAdded = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/locations/${id}/`);
      setLocation(response.data);
      
      // Recalculate average rating
      if (response.data.comments && response.data.comments.length > 0) {
        const ratings = response.data.comments.map(comment => comment.rating);
        const sum = ratings.reduce((a, b) => a + b, 0);
        setAverageRating((sum / ratings.length).toFixed(1));
        setCommentCount(ratings.length);
      }
    } catch (err) {
      console.error('Error refreshing comments:', err);
    }
  };
  
  if (loading) {
    return <div className="loading">Loading location details...</div>;
  }
  
  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="location-detail-page">
      <Link to="/" className="back-link">← Back to Map</Link>
      
      <div className="location-title-section">
        <h1>{location.name}</h1>
        
        {commentCount > 0 && (
          <div className="title-rating">
            <span className="average-rating">{averageRating}</span>
            <StarDisplay rating={Math.round(averageRating)} />
            <span className="comment-count">({commentCount})</span>
          </div>
        )}
      </div>
      
      {location.address && <p className="location-address">{location.address}</p>}
      
      <div className="location-meta">
        <p className="location-coordinates">
          Coordinates: {location.latitude}, {location.longitude}
        </p>
        <button 
          className="google-maps-button"
          onClick={openInGoogleMaps}
        >
          <i className="map-icon">🗺️</i> View on Google Maps
        </button>
      </div>
      
      <div className="location-details">
        <div className="prices-section">
          <h2>Prices</h2>
          
          {isLoggedIn && (
            <div className="add-price-section">
              {showPriceForm ? (
                <PriceForm locationId={id} onPriceAdded={handlePriceAdded} />
              ) : (
                <button 
                  className="toggle-form-btn"
                  onClick={() => setShowPriceForm(true)}
                >
                  Add Price
                </button>
              )}
            </div>
          )}
          
          {prices.length > 0 ? (
            <ul className="price-list">
              {prices.map(price => (
                <li key={price.id} className="price-item">
                  <span className="product-name">{price.product_name}</span>
                  <span className="price-value">€{typeof price.price === 'number' ? 
                    price.price.toFixed(2) : 
                    (parseFloat(price.price) || 0).toFixed(2)}
                  </span>
                  <span className="price-date">
                    Reported on {new Date(price.date_reported).toLocaleDateString()}
                  </span>
                  <span className="price-user">
                    by {price.reported_by?.username || 'Anonymous'}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No prices reported for this location yet.</p>
          )}
        </div>
        
        <div className="comments-section">
          <h2>Comments</h2>
          {location.comments && location.comments.length > 0 ? (
            <ul className="comment-list">
              {location.comments.map(comment => (
                <li key={comment.id} className="comment-item">
                  <div className="comment-header">
                    <span className="comment-author">{comment.user.username}</span>
                    <span className="comment-date">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <StarDisplay rating={comment.rating} />
                  <div className="comment-text">{comment.text}</div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No comments yet for this location.</p>
          )}
          
          {isLoggedIn && (
            <div className="add-comment-section">
              <CommentForm locationId={id} onCommentAdded={handleCommentAdded} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationDetailPage; 