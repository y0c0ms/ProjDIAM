import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/components/Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-row">
          <div className="footer-section about-section">
            <h3>About PriceMap</h3>
            <p>
              PriceMap is a community-driven platform that helps users find and share 
              information about product prices across different locations, making it 
              easier to find the best deals nearby.
            </p>
          </div>

          <div className="footer-section team-section">
            <h3>Development Team</h3>
            <div className="team-compact">
              <span>Manuel Santos</span>
              <span className="separator">|</span>
              <span>Alexandre Mendes</span>
              <span className="separator">|</span>
              <span>Vlad Ganta</span>
            </div>
            <p className="project-info">DIAM Project - Telecommunications and Informatics Engineering</p>
          </div>

          <div className="footer-section help-section">
            <h3>Help & Resources</h3>
            <Link to="/how-to-use" className="how-to-use-button">
              How to Use PriceMap
            </Link>
            <p className="help-text">
              Learn how to effectively use PriceMap to find, add, and validate 
              prices in your area.
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="copyright">
            &copy; {currentYear} PriceMap. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 