/**
 * Code made by:
 * - Manuel Santos nº 111087
 * - Alexandre Mendes nº 111026
 * - Vlad Ganta nº 110672
 */

import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/pages/HowToUsePage.css';
import mapImage from '../assets/images/mapa.png';
import addLocationImage from '../assets/images/addNewLocation.png';
import addPriceImage from '../assets/images/addPrice.png';
import commentImage from '../assets/images/comment.png';
import registerImage from '../assets/images/register.png';
import searchBarImage from '../assets/images/searchBar.png';

const HowToUsePage = () => {
  return (
    <div className="how-to-use-page">
      <div className="how-to-use-container">
        <header>
          <h1>How to Use PriceMap</h1>
          <p className="subtitle">A simple guide to get the most out of PriceMap</p>
        </header>

        <section className="section">
          <h2>
            <span className="section-number">01</span>
            Create an Account
          </h2>
          <div className="section-content">
            <div className="section-text">
              <p>To fully use PriceMap, start by creating an account or logging in:</p>
              <ol>
                <li>Click on the "Register" button in the navigation bar</li>
                <li>Fill in your details and create your account</li>
                <li>Once registered, log in using your credentials</li>
              </ol>
              <p>With an account, you can add locations, report prices, and leave comments.</p>
            </div>
            <div className="section-image-container register-image-container">
              <img src={registerImage} alt="Registration interface" className="section-img register-img" />
            </div>
          </div>
        </section>

        <section className="section">
          <h2>
            <span className="section-number">02</span>
            Explore the Map
          </h2>
          <div className="section-content">
            <div className="section-text">
              <p>The interactive map shows all reported locations:</p>
              <ul>
                <li>Pan and zoom to navigate the map</li>
                <li>Click on markers to see location details</li>
                <li>View product prices and comments for each location</li>
              </ul>
              <p>Use the map to discover affordable products near you!</p>
            </div>
            <div className="section-image-container">
              <img src={mapImage} alt="Map interface" className="section-img" />
            </div>
          </div>
        </section>

        <section className="section">
          <h2>
            <span className="section-number">03</span>
            Add New Locations
          </h2>
          <div className="section-content">
            <div className="section-text">
              <p>Help the community by adding new locations:</p>
              <ol>
                <li>Click the "Add New Location" button on the homepage</li>
                <li>Click on the map to select the location</li>
                <li>Fill in the location name and other details</li>
                <li>Submit the form to add the location to the database</li>
              </ol>
            </div>
            <div className="section-image-container">
              <img src={addLocationImage} alt="Adding a new location" className="section-img" />
            </div>
          </div>
        </section>

        <section className="section">
          <h2>
            <span className="section-number">04</span>
            Report Prices
          </h2>
          <div className="section-content">
            <div className="section-text">
              <p>Keep price information up to date:</p>
              <ol>
                <li>Navigate to a location's detail page</li>
                <li>Use the price form to add a new product and its price</li>
                <li>For existing products, adding a new price will update it</li>
              </ol>
              <p>You can also validate prices reported by others.</p>
            </div>
            <div className="section-image-container">
              <img src={addPriceImage} alt="Reporting prices" className="section-img" />
            </div>
          </div>
        </section>

        <section className="section">
          <h2>
            <span className="section-number">05</span>
            Leave Comments
          </h2>
          <div className="section-content">
            <div className="section-text">
              <p>Share your experience at different locations:</p>
              <ol>
                <li>Go to a location's detail page</li>
                <li>Use the comment form at the bottom of the page</li>
                <li>Add your rating and feedback about the location</li>
              </ol>
              <p>Comments help others make informed decisions!</p>
            </div>
            <div className="section-image-container">
              <img src={commentImage} alt="Adding comments" className="section-img" />
            </div>
          </div>
        </section>

        <section className="section">
          <h2>
            <span className="section-number">06</span>
            Search for Products
          </h2>
          <div className="section-content">
            <div className="section-text">
              <p>Quickly find products across all locations:</p>
              <ol>
                <li>Use the search bar in the navigation menu</li>
                <li>Type the name of the product you're looking for</li>
                <li>Select a product from the dropdown suggestions</li>
                <li>You'll be taken directly to the location with the cheapest price for that product</li>
              </ol>
              <p>The search feature helps you find the best prices without browsing through all locations!</p>
            </div>
            <div className="section-image-container">
              <img src={searchBarImage} alt="Using the search bar" className="section-img" />
            </div>
          </div>
        </section>

        <div className="return-home">
          <Link to="/" className="back-button">Return to Homepage</Link>
        </div>
      </div>
    </div>
  );
};

export default HowToUsePage; 