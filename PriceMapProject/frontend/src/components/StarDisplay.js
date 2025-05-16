/**
 * Code made by:
 * - Manuel Santos nº 111087
 * - Alexandre Mendes nº 111026
 * - Vlad Ganta nº 110672
 */

import React from 'react';
import '../styles/components/StarRating.css';

/**
 * StarDisplay component for showing static star ratings
 * Used to display ratings in comments and location details
 * 
 * @param {number} rating - Rating value (1-5)
 */
const StarDisplay = ({ rating }) => {
  // Default to 1 if rating is not available or invalid
  const starRating = rating && rating >= 1 && rating <= 5 ? rating : 1;
  
  return (
    <div className="star-display">
      {[...Array(5)].map((_, index) => (
        <div key={index} className={`star ${index < starRating ? 'filled' : ''}`}></div>
      ))}
    </div>
  );
};

export default StarDisplay; 