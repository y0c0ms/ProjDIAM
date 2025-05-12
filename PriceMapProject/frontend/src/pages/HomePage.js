import React, { useState } from 'react';
import Map from '../components/Map';
import LocationForm from '../components/LocationForm';
import authService from '../services/authService';

const HomePage = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [locations, setLocations] = useState([]);

  const isLoggedIn = authService.isLoggedIn();

  const handleLocationAdded = (newLocation) => {
    setLocations(prevLocations => [...prevLocations, newLocation]);
    setShowAddForm(false);
  };

  return (
    <div className="home-page">
      <h1>Price Map - Lisboa</h1>
      <p>Find the best prices for products in different locations around Lisboa</p>

      <div className="map-section">
        <Map locations={locations} />
      </div>

      {isLoggedIn ? (
        <div className="action-section">
          <button 
            className="toggle-form-btn"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? 'Hide Form' : 'Add New Location'}
          </button>

          {showAddForm && (
            <LocationForm onLocationAdded={handleLocationAdded} />
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