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
    // If locations are passed as props and are not empty, use those instead of fetching
    if (propLocations && propLocations.length > 0) {
      setLocations(propLocations);
      setLoading(false);
      return;
    }

    const fetchLocations = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8000/api/locations/');
        console.log('Locations fetched:', response.data);
        setLocations(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch location data');
        setLoading(false);
        console.error('Error fetching locations:', err);
      }
    };

    fetchLocations();
  }, [propLocations]);

  if (loading) return <div>Loading map...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="map-container" style={{ height: '70vh', width: '100%' }}>
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