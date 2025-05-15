import React from 'react';
import scrollArrow from '../assets/images/scroll.png';
import './ScrollIndicator.css';

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