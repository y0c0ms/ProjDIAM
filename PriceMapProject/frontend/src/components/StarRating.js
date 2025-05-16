/**
 * Code made by:
 * - Manuel Santos nº 111087
 * - Alexandre Mendes nº 111026
 * - Vlad Ganta nº 110672
 */

import React from 'react';
import '../styles/components/StarRating.css';

/**
 * StarRating component for selecting a rating from 1-5 stars
 * Provides a reusable interface for star ratings across the application
 * 
 * @param {number} value - Current rating value
 * @param {Function} onChange - Handler for when rating changes
 */
const StarRating = ({ value, onChange }) => {
  const stars = [5, 4, 3, 2, 1]; // Reverse order for CSS display
  
  return (
    <div className="star-rating">
      {stars.map(star => (
        <React.Fragment key={star}>
          <input 
            type="radio" 
            id={`star${star}`} 
            name="rating" 
            value={star} 
            checked={value === star} 
            onChange={onChange} 
          />
          <label htmlFor={`star${star}`} title={`${star} star${star !== 1 ? 's' : ''}`}></label>
        </React.Fragment>
      ))}
    </div>
  );
};

export default StarRating; 