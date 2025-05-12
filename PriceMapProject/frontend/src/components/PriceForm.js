import React, { useState } from 'react';
import axios from 'axios';
import authService from '../services/authService';

const PriceForm = ({ locationId, onPriceAdded }) => {
  const [formData, setFormData] = useState({
    product_name: '',
    price: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (!authService.isLoggedIn()) {
        setError('You must be logged in to add a price');
        return;
      }

      const response = await axios.post(
        `http://localhost:8000/api/locations/${locationId}/add_price/`, 
        formData
      );

      setSuccess('Price added successfully!');
      setFormData({
        product_name: '',
        price: '',
      });

      // Call the callback to update the parent component
      if (onPriceAdded) {
        onPriceAdded(response.data);
      }
    } catch (err) {
      console.error('Error adding price:', err);
      setError(err.response?.data?.message || 'Failed to add price');
    }
  };

  return (
    <div className="price-form">
      <h3>Add New Price</h3>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="product_name">Product Name:</label>
          <input
            type="text"
            id="product_name"
            name="product_name"
            value={formData.product_name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="price">Price (€):</label>
          <input
            type="number"
            id="price"
            name="price"
            step="0.01"
            value={formData.price}
            onChange={handleChange}
            required
          />
        </div>
        
        <button type="submit">Add Price</button>
      </form>
    </div>
  );
};

export default PriceForm; 