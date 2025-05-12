import React, { useState } from 'react';
import axios from 'axios';
import authService from '../services/authService';
import Map from './Map';
import './LocationForm.css';

const LocationForm = ({ onLocationAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    latitude: '',
    longitude: '',
    address: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [showCoordinatesForm, setShowCoordinatesForm] = useState(false);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleMapClick = async (lat, lng) => {
    setSelectedPosition({ lat, lng });
    setFormData({
      ...formData,
      latitude: lat,
      longitude: lng
    });
    
    // Get address from coordinates
    try {
      setIsLoadingAddress(true);
      const response = await axios.post(
        'http://localhost:8000/api/locations/get_address/',
        { latitude: lat, longitude: lng }
      );
      
      if (response.data && response.data.address) {
        setFormData(prev => ({
          ...prev,
          latitude: lat,
          longitude: lng,
          address: response.data.address
        }));
      }
    } catch (err) {
      console.error('Error getting address:', err);
    } finally {
      setIsLoadingAddress(false);
    }
  };

  const toggleCoordinatesForm = () => {
    setShowCoordinatesForm(!showCoordinatesForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (!authService.isLoggedIn()) {
        setError('You must be logged in to add a location');
        return;
      }

      // Create a copy of form data to send
      const dataToSend = { ...formData };
      
      // Get token from local storage
      const token = localStorage.getItem('token');
      
      const config = {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      };

      const response = await axios.post(
        'http://localhost:8000/api/locations/', 
        dataToSend,
        config
      );

      setSuccess('Location added successfully!');
      setFormData({
        name: '',
        latitude: '',
        longitude: '',
        address: '',
      });
      setSelectedPosition(null);

      // Call the callback to update the parent component
      if (onLocationAdded) {
        onLocationAdded(response.data);
      }
    } catch (err) {
      console.error('Error adding location:', err);
      setError(err.response?.data?.message || 'Failed to add location');
    }
  };

  return (
    <div className="location-form-container">
      <h2>Add New Location</h2>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <div className="form-map-container">
        <div className="map-section">
          <p className="instruction-text">Click on the map to select a location or use the coordinates form.</p>
          <Map onLocationSelect={handleMapClick} selectedPosition={selectedPosition} />
        </div>
        
        <div className="form-section">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Location Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="form-control"
              />
            </div>
            
            <div className="coordinate-toggle">
              <button 
                type="button" 
                onClick={toggleCoordinatesForm} 
                className="toggle-button"
              >
                {showCoordinatesForm ? "Hide Coordinates Form" : "Adicionar com cordenadas"}
              </button>
            </div>
            
            {showCoordinatesForm && (
              <>
                <div className="form-group">
                  <label htmlFor="latitude">Latitude:</label>
                  <input
                    type="number"
                    id="latitude"
                    name="latitude"
                    step="any"
                    value={formData.latitude}
                    onChange={handleChange}
                    required
                    className="form-control"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="longitude">Longitude:</label>
                  <input
                    type="number"
                    id="longitude"
                    name="longitude"
                    step="any"
                    value={formData.longitude}
                    onChange={handleChange}
                    required
                    className="form-control"
                  />
                </div>
              </>
            )}
            
            <div className="form-group">
              <label htmlFor="address">Address:</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="form-control"
                disabled={isLoadingAddress}
              />
              {isLoadingAddress && <div className="loading-indicator">Fetching address...</div>}
            </div>
            
            <button type="submit" className="submit-button">Add Location</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LocationForm; 