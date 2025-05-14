import React, { useState, useEffect } from 'react';
import Map from '../components/Map';
import authService from '../services/authService';
import axios from 'axios';

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
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isLoggedIn = authService.isLoggedIn();

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

  const handleLocationSelect = async (lat, lng) => {
    setSelectedPosition({ lat, lng });
    setNewLocationData({
      ...newLocationData,
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
    setNewLocationData({
      ...newLocationData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (!isLoggedIn) {
        setError('You must be logged in to add a location');
        return;
      }

      const token = localStorage.getItem('token');
      
      const config = {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      };

      const response = await axios.post(
        'http://localhost:8000/api/locations/', 
        newLocationData,
        config
      );

      setSuccess('Location added successfully!');
      setNewLocationData({
        name: '',
        address: '',
        latitude: '',
        longitude: ''
      });
      setSelectedPosition(null);
      setShowAddForm(false);
      
      // Refresh locations
      fetchLocations();
    } catch (err) {
      console.error('Error adding location:', err);
      setError(err.response?.data?.message || 'Failed to add location');
    }
  };

  return (
    <div className="home-page">
      <h1>Price Map - Lisboa</h1>
      <p>Find the best prices for products in different locations around Lisboa</p>

      <div className="map-section">
        <Map 
          locations={showAddForm ? [] : locations} 
          onLocationSelect={showAddForm ? handleLocationSelect : null}
          selectedPosition={selectedPosition}
        />
      </div>

      {isLoggedIn ? (
        <div className="action-section">
          <button 
            className="toggle-form-btn"
            onClick={() => {
              setShowAddForm(!showAddForm);
              if (!showAddForm) {
                setSelectedPosition(null);
                setNewLocationData({
                  name: '',
                  address: '',
                  latitude: '',
                  longitude: ''
                });
              }
            }}
          >
            {showAddForm ? 'Cancel' : 'Add New Location'}
          </button>

          {showAddForm && (
            <div className="location-form">
              <h3>Add New Location</h3>
              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}
              
              <p className="instruction-text">
                Click on the map to select a location
              </p>
              
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
                    className="form-control"
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
                    className="form-control"
                    disabled={isLoadingAddress}
                  />
                  {isLoadingAddress && <div className="loading-indicator">Fetching address...</div>}
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Coordinates:</label>
                    <p>
                      {selectedPosition 
                        ? `Lat: ${selectedPosition.lat.toFixed(6)}, Lng: ${selectedPosition.lng.toFixed(6)}` 
                        : 'No location selected'}
                    </p>
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={!selectedPosition}
                >
                  Add Location
                </button>
              </form>
            </div>
          )}
        </div>
      ) : (
        <div className="login-prompt">
          <p>Please login to add new locations or prices</p>
        </div>
      )}
    </div>
  );
};

export default HomePage; 