import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import PriceForm from '../components/PriceForm';
import CommentForm from '../components/CommentForm';
import authService from '../services/authService';
import './LocationDetailPage.css';

const LocationDetailPage = () => {
  const { id } = useParams();
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const isLoggedIn = authService.isLoggedIn();

  useEffect(() => {
    const fetchLocationDetails = async () => {
      try {
        setLoading(true);
        
        // Check if we have an auth token
        const token = localStorage.getItem('token');
        const config = token 
          ? { headers: { 'Authorization': `Token ${token}` } } 
          : {};
          
        const response = await axios.get(`http://localhost:8000/api/locations/${id}/`, config);
        console.log('Location details fetched:', response.data);
        setLocation(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch location details');
        setLoading(false);
        console.error('Error fetching location:', err);
      }
    };

    fetchLocationDetails();
  }, [id]);

  const handlePriceAdded = (newPrice) => {
    setLocation({
      ...location,
      prices: [...location.prices, newPrice]
    });
  };

  const handleCommentAdded = (newComment) => {
    setLocation({
      ...location,
      comments: [...location.comments, newComment]
    });
  };
  
  const openInGoogleMaps = () => {
    if (location) {
      const googleMapsUrl = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
      window.open(googleMapsUrl, '_blank');
    }
  };

  if (loading) return <div>Loading location details...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!location) return <div>Location not found</div>;

  return (
    <div className="location-detail-page">
      <Link to="/" className="back-link">← Back to Map</Link>
      
      <h1>{location.name}</h1>
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
          {location.prices && location.prices.length > 0 ? (
            <ul className="price-list">
              {location.prices.map(price => (
                <li key={price.id} className="price-item">
                  <span className="product-name">{price.product_name}</span>
                  <span className="price-value">€{price.price}</span>
                  <span className="price-date">
                    Reported on {new Date(price.date_reported).toLocaleDateString()} 
                    by {price.reported_by.username}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No price information available for this location.</p>
          )}
          
          {isLoggedIn && (
            <div className="add-price-section">
              <PriceForm locationId={id} onPriceAdded={handlePriceAdded} />
            </div>
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