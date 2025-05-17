/**
 * Code made by:
 * - Manuel Santos nº 111087
 * - Alexandre Mendes nº 111026
 * - Vlad Ganta nº 110672
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/components/SearchBar.css';

/**
 * SearchBar component for searching products with autocomplete suggestions
 * Features:
 * - Autocomplete dropdown with product suggestions
 * - Navigates to location detail page when item selected
 * - Only displays products with non-outdated prices
 * - Results are sorted by price (lowest first)
 * 
 * @returns {JSX.Element} The search bar component
 */
const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const wrapperRef = useRef(null);

  // Fetch suggestions when query changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        setIsLoading(true);
        const response = await axios.get(
          `http://localhost:8000/api/prices/search/?q=${encodeURIComponent(query)}&limit=5`,
          { timeout: 3000 } // Add timeout to prevent long hanging requests
        );
        setSuggestions(response.data);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        // Don't show error to user, just provide empty results
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle suggestion selection
  const handleSelect = (price) => {
    try {
      setQuery('');
      setSuggestions([]);
      setShowSuggestions(false);
      navigate(`/locations/${price.location}`);
    } catch (error) {
      console.error('Error navigating to location:', error);
      // Fallback if navigation fails
      window.location.href = `/locations/${price.location}`;
    }
  };

  // Handle search form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (suggestions.length > 0) {
      handleSelect(suggestions[0]);
    }
  };

  return (
    <div className="search-bar-container" ref={wrapperRef}>
      <form onSubmit={handleSubmit} className="search-form">
        <input
          type="text"
          className="search-input"
          placeholder="Search for products..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          style={{
            backgroundColor: 'transparent',
            background: 'none',
            border: 'none',
            boxShadow: 'none'
          }}
        />
        <button type="submit" className="search-button" aria-label="Search">
          <i className="fas fa-search"></i>
        </button>
      </form>
      
      {showSuggestions && query.length >= 2 && (
        <div className="suggestions-container">
          {isLoading ? (
            <div className="suggestion-loading">Loading...</div>
          ) : suggestions.length > 0 ? (
            <ul className="suggestions-list">
              {suggestions.map((price) => (
                <li
                  key={price.id}
                  className="suggestion-item"
                  onClick={() => handleSelect(price)}
                >
                  <div className="suggestion-product">{price.product_name}</div>
                  <div className="suggestion-price">€{price.price}</div>
                  <div className="suggestion-location">At {price.location_name}</div>
                </li>
              ))}
            </ul>
          ) : query.length >= 2 ? (
            <div className="no-suggestions">No products found</div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default SearchBar; 