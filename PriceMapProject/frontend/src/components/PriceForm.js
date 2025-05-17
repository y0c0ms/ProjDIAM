/**
 * Code made by:
 * - Manuel Santos nº 111087
 * - Alexandre Mendes nº 111026
 * - Vlad Ganta nº 110672
 */

import React, { useState } from 'react';
import axios from 'axios';
import authService from '../services/authService';
import config from '../services/config';
import '../styles/components/PriceForm.css';

/**
 * PriceForm component for adding or updating product prices at a location
 * Features:
 * - Simple form for product name and price entry
 * - Handles authentication requirements
 * - Automatically replaces existing prices for the same product
 *
 * @param {number} locationId - The ID of the location to add prices to
 * @param {Function} onPriceAdded - Callback function triggered after successful submission
 */
const PriceForm = ({ locationId, onPriceAdded }) => {
  const [formData, setFormData] = useState({
    product_name: '',
    price: '',
  });
  const [status, setStatus] = useState({
    error: '',
    success: '',
    isSubmitting: false
  });

  /**
   * Handle form input changes
   * Updates the formData state with new values
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Handle form submission
   * Validates user authentication and submits price data to the API
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset status
    setStatus({
      error: '',
      success: '',
      isSubmitting: true
    });

    try {
      // Check login status
      if (!authService.isLoggedIn()) {
        setStatus({
          error: 'You must be logged in to add a price',
          success: '',
          isSubmitting: false
        });
        return;
      }

      // Ensure price is a number
      const priceData = {
        ...formData,
        price: parseFloat(formData.price),
        location: locationId
      };

      // Submit the new price
      const response = await axios.post(
        `${config.apiUrl}/locations/${locationId}/add_price/`, 
        priceData,
        {
          headers: {
            'Authorization': `Token ${authService.getToken()}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Reset form and show success message
      setFormData({
        product_name: '',
        price: '',
      });
      
      setStatus({
        error: '',
        success: 'Price added successfully!',
        isSubmitting: false
      });

      // Notify parent component to refresh data
      if (onPriceAdded) {
        onPriceAdded();
      }
    } catch (err) {
      console.error('Error adding price:', err);
      
      // Extract error message from response if available
      let errorMessage = 'Failed to add price';
      if (err.response && err.response.data) {
        if (err.response.data.message) {
          errorMessage = err.response.data.message;
        }
        
        // Handle field-specific errors
        if (err.response.data.errors) {
          const errors = err.response.data.errors;
          const fieldErrors = Object.keys(errors)
            .map(field => `${field}: ${errors[field].join(', ')}`)
            .join('; ');
            
          if (fieldErrors) {
            errorMessage += ` - ${fieldErrors}`;
          }
        }
      }
      
      setStatus({
        error: errorMessage,
        success: '',
        isSubmitting: false
      });
    }
  };

  return (
    <div className="price-form">
      <h3>Add New Price</h3>
      {status.error && <div className="error-message">{status.error}</div>}
      {status.success && <div className="success-message">{status.success}</div>}
      
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
            disabled={status.isSubmitting}
            placeholder="e.g., Milk, Bread, Coffee..."
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
            disabled={status.isSubmitting}
            placeholder="0.00"
            min="0.01"
          />
        </div>
        
        <button 
          type="submit" 
          disabled={status.isSubmitting}
          className={status.isSubmitting ? 'submitting' : ''}
        >
          {status.isSubmitting ? 'Adding...' : 'Add Price'}
        </button>
        <p className="form-help">
          Adding a new price for an existing product will replace the old price.
        </p>
      </form>
    </div>
  );
};

export default PriceForm; 