/**
 * Code made by:
 * - Manuel Santos nº 111087
 * - Alexandre Mendes nº 111026
 * - Vlad Ganta nº 110672
 */

import React from 'react';
import scrollArrow from '../assets/images/scroll.png';
import '../styles/components/ScrollIndicator.css';

/**
 * ScrollIndicator component displays visual arrows to indicate scrollable content
 * Used to help users recognize that they need to scroll to see more content
 * 
 * @param {boolean} show - Whether the indicators should be displayed
 * @returns {JSX.Element|null} - The scroll indicators or null if show is false
 */
const ScrollIndicator = ({ show }) => {
  if (!show) return null;

  return (
    <div className="scroll-indicators">
      <div className="scroll-indicator left">
        <img src={scrollArrow} alt="Scroll down" className="floating-arrow" />
      </div>
      <div className="scroll-indicator right">
        <img src={scrollArrow} alt="Scroll down" className="floating-arrow" />
      </div>
    </div>
  );
};

export default ScrollIndicator; 