import React, { useState, useEffect, useCallback } from 'react';
import Map from '../components/Map';
import ScrollIndicator from '../components/ScrollIndicator';
import authService from '../services/authService';
import axios from 'axios';
import '../styles/pages/HomePage.css';
import '../styles/mobile/HomePage.mobile.css';

const HomePage = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [locations, setLocations] = useState([]);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [newLocationData, setNewLocationData] = useState({
    name: '',
    address: '',
    latitude: '',
    longitude: ''
  });
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [formStatus, setFormStatus] = useState({
    error: '',
    success: '',
    isSubmitting: false
  });

  const isLoggedIn = authService.isLoggedIn();

  // Fetch locations on component mount
  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/locations/');
      setLocations(response.data);
    } catch (err) {
      console.error('Error fetching locations:', err);
    }
  };

  // Simple handle location select function that doesn't trigger rerenders
  const handleLocationSelect = useCallback((lat, lng) => {
    // Update coordinates in form data
    setNewLocationData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng
    }));
    
    // Set selected position for map marker
    setSelectedPosition({ lat, lng });
    
    // Get address from coordinates (in a separate function)
    fetchAddressForCoordinates(lat, lng);
  }, []);
  
  // Separate function to fetch address to reduce complexity
  const fetchAddressForCoordinates = async (lat, lng) => {
    try {
      setIsLoadingAddress(true);
      const response = await axios.post(
        'http://localhost:8000/api/locations/get_address/',
        { latitude: lat, longitude: lng }
      );
      
      if (response.data && response.data.address) {
        setNewLocationData(prev => ({
          ...prev,
          address: response.data.address
        }));
      }
    } catch (err) {
      console.error('Error getting address:', err);
    } finally {
      setIsLoadingAddress(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewLocationData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset status
    setFormStatus({
      error: '',
      success: '',
      isSubmitting: true
    });

    try {
      if (!isLoggedIn) {
        setFormStatus({
          error: 'You must be logged in to add a location',
          success: '',
          isSubmitting: false
        });
        return;
      }

      const token = localStorage.getItem('token');
      
      const config = {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      };

      await axios.post(
        'http://localhost:8000/api/locations/', 
        newLocationData,
        config
      );

      // Show success and reset form
      setFormStatus({
        error: '',
        success: 'Location added successfully!',
        isSubmitting: false
      });
      
      // Reset the form
      resetForm();
      
      // Refresh locations list
      fetchLocations();
    } catch (err) {
      console.error('Error adding location:', err);
      setFormStatus({
        error: err.response?.data?.message || 'Failed to add location',
        success: '',
        isSubmitting: false
      });
    }
  };
  
  // Separate function to reset form state
  const resetForm = () => {
    setNewLocationData({
      name: '',
      address: '',
      latitude: '',
      longitude: ''
    });
    setSelectedPosition(null);
  };

  const toggleAddLocationMode = () => {
    const newShowAddForm = !showAddForm;
    setShowAddForm(newShowAddForm);
    
    // Reset form when canceling
    if (!newShowAddForm) {
      resetForm();
      setFormStatus({
        error: '',
        success: '',
        isSubmitting: false
      });
    }
  };

  // Always display all locations even in add location mode
  const displayLocations = locations;

  // Determine if scroll arrows should be shown
  const shouldShowScrollArrows = showAddForm && selectedPosition;

  return (
    <div className="home-page">
      <div className="map-wrapper">
        <div className="map-section">
          <Map 
            locations={displayLocations}
            onLocationSelect={showAddForm ? handleLocationSelect : null}
            selectedPosition={selectedPosition}
          />
        </div>
        <ScrollIndicator show={shouldShowScrollArrows} />
      </div>

      {/* Always include the action section in DOM for consistent layout, just hide it when needed */}
      <div className={`action-section ${!isLoggedIn ? 'hidden' : ''}`}>
        {showAddForm ? (
          <>
            <button 
              className="toggle-form-btn active"
              onClick={toggleAddLocationMode}
            >
              Go back to full map
            </button>
            {formStatus.success && (
              <button
                className="toggle-form-btn"
                onClick={() => {
                  setFormStatus({ error: '', success: '', isSubmitting: false });
                  setShowAddForm(true);
                }}
              >
                Add New Location
              </button>
            )}
          </>
        ) : (
          <button 
            className="toggle-form-btn"
            onClick={toggleAddLocationMode}
          >
            Add New Location
          </button>
        )}
        </div>

      {/* Always include the form in DOM for consistent layout, just hide it when needed */}
      <div className={`location-form ${!showAddForm ? 'hidden' : ''}`}>
          <h3>Add New Location</h3>
          {formStatus.error && <div className="error-message">{formStatus.error}</div>}
          {formStatus.success && <div className="success-message">{formStatus.success}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Location Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={newLocationData.name}
                onChange={handleChange}
                required
                disabled={formStatus.isSubmitting}
                placeholder="e.g., Café Central"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="address">Address:</label>
              <input
                type="text"
                id="address"
                name="address"
                value={newLocationData.address}
                onChange={handleChange}
                disabled={isLoadingAddress || formStatus.isSubmitting}
                placeholder="Will be filled automatically when you select a location"
              />
              {isLoadingAddress && <div className="loading-indicator">Fetching address...</div>}
            </div>
            
            <div className="location-coordinates">
              <p>
                {selectedPosition 
                  ? `Coordinates: ${selectedPosition.lat.toFixed(6)}, ${selectedPosition.lng.toFixed(6)}` 
                  : 'Click on the map to select a location'}
              </p>
            </div>
            
            <button 
              type="submit" 
              className="submit-button"
              disabled={!selectedPosition || formStatus.isSubmitting}
            >
              {formStatus.isSubmitting ? 'Adding...' : 'Add Location'}
            </button>
          </form>
        </div>

      {/* Always include the login prompt in DOM for consistent layout, just hide it when needed */}
      <div className={`login-prompt ${isLoggedIn ? 'hidden' : ''}`}>
          <p>Please login to add new locations or prices</p>
        </div>
    </div>
  );
};

export default HomePage; 