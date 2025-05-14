import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
import { Link } from 'react-router-dom';
import authService from '../services/authService';

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// API URL
const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Custom dark style for Leaflet popups
const addCustomPopupStyles = () => {
  // Add custom popup styles
  const style = document.createElement('style');
  style.textContent = `
    .leaflet-popup-content-wrapper {
      background: rgba(0, 0, 0, 0.8);
      color: #fff;
      border-radius: 8px;
    }
    .leaflet-popup-tip {
      background: rgba(0, 0, 0, 0.8);
    }
    .leaflet-popup-content a {
      color: #2196f3;
    }
    .leaflet-popup-content h3, .leaflet-popup-content h4 {
      color: #ecf0f1;
    }
  `;
  document.head.appendChild(style);
};

// Component to handle map clicks
function MapClickHandler({ onLocationSelect }) {
  const map = useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onLocationSelect(lat, lng);
    }
  });
  return null;
}

const Map = ({ locations: propLocations, onLocationAdded, onLocationSelect, selectedPosition }) => {
  const [locations, setLocations] = useState(propLocations || []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    // Add custom styles for popups
    addCustomPopupStyles();
    
    // If locations are passed as props and are not empty, use those instead of fetching
    if (propLocations && propLocations.length > 0) {
      setLocations(propLocations);
      setLoading(false);
      return;
    }

    const fetchLocations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Use axios with explicit configurations
        const response = await axios({
          method: 'get',
          url: `${API_BASE_URL}/locations/`,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          timeout: 10000, // 10 seconds timeout
        });
        
        console.log('Locations fetched:', response.data);
        
        if (Array.isArray(response.data)) {
          setLocations(response.data);
        } else {
          console.error('Unexpected response format:', response.data);
          setError('Unexpected response format from server');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching locations:', err);
        setError(`Failed to fetch location data: ${err.message}`);
        setLoading(false);
        
        // Add test location data for development
        if (process.env.NODE_ENV === 'development') {
          console.log('Using test data for development');
          const testLocations = [
            {
              id: 1,
              name: "Café Central (Test)",
              latitude: 38.736946,
              longitude: -9.142685,
              address: "Praça do Comércio, Lisboa",
              prices: [
                { id: 1, product_name: "Coffee", price: 1.20 },
                { id: 2, product_name: "Pastel de Nata", price: 1.50 }
              ],
              comments: [
                { id: 1, user: { username: "testuser" }, text: "Great place with friendly staff and reasonable prices!" }
              ]
            }
          ];
          setLocations(testLocations);
        }
      }
    };

    fetchLocations();
  }, [propLocations]);

  if (loading) return <div className="map-loading">Loading map...</div>;
  if (error) return <div className="map-error">Error: {error}</div>;

  return (
    <div className="map-container">
      <MapContainer 
        center={[38.736946, -9.142685]} // Lisbon coordinates
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Handler for map clicks */}
        {onLocationSelect && <MapClickHandler onLocationSelect={onLocationSelect} />}
        
        {/* Show temporary marker for selected position */}
        {selectedPosition && (
          <Marker position={[selectedPosition.lat, selectedPosition.lng]}>
            <Popup>
              <div>
                <p>Selected Location</p>
                <p>Latitude: {selectedPosition.lat.toFixed(6)}</p>
                <p>Longitude: {selectedPosition.lng.toFixed(6)}</p>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Show existing locations */}
        {locations.map(location => (
          <Marker 
            key={location.id} 
            position={[location.latitude, location.longitude]}
          >
            <Popup>
              <div>
                <h3>{location.name}</h3>
                <p>{location.address}</p>
                <h4>Products:</h4>
                {location.prices && location.prices.length > 0 ? (
                  <ul>
                    {location.prices.map(price => (
                      <li key={price.id}>
                        {price.product_name}: €{price.price}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No price information available</p>
                )}
                <h4>Comments:</h4>
                {location.comments && location.comments.length > 0 ? (
                  <ul>
                    {location.comments.map(comment => (
                      <li key={comment.id}>
                        <strong>{comment.user.username}:</strong> {comment.text}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No comments yet</p>
                )}
                <Link to={`/locations/${location.id}`}>View Details</Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default Map; 