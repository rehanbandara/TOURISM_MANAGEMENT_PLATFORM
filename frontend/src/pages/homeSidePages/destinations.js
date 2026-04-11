import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PostCard from '../../components/PostCard';
import './destinations.css';

const Destinations = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredDestinations, setFilteredDestinations] = useState([]);

  useEffect(() => {
    fetchDestinations();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = destinations.filter(destination =>
        destination.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        destination.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        destination.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredDestinations(filtered);
    } else {
      setFilteredDestinations(destinations);
    }
  }, [searchTerm, destinations]);

  const fetchDestinations = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/destinations');
      console.log('API Response:', response.data);
      console.log('Destinations data:', response.data.data);
      setDestinations(response.data.data || response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching destinations:', err);
      setError('Failed to load destinations. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const handleRetry = () => {
    fetchDestinations();
  };

  if (loading) {
    return (
      <div className="destinations-page">
        <div className="destinations-header">
          <div className="container">
            <h1 className="page-title">Discover Amazing Destinations</h1>
            <p className="page-subtitle">Explore breathtaking places across Sri Lanka</p>
          </div>
        </div>
        
        <div className="container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading amazing destinations...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="destinations-page">
        <div className="destinations-header">
          <div className="container">
            <h1 className="page-title">Destinations</h1>
          </div>
        </div>
        
        <div className="container">
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <h3 className="error-title">Oops! Something went wrong</h3>
            <p className="error-message">{error}</p>
            <button className="retry-btn" onClick={handleRetry}>
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
                <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
              </svg>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="destinations-page-aa">
      {/* Hero Section */}
      <div className="destinations-header">
        <div className="container">
          <h1 className="page-title">Discover Amazing Destinations</h1>
          <p className="page-subtitle">
            Explore {destinations.length} breathtaking places across Sri Lanka
          </p>
          
          {/* Search Bar */}
          <div className="search-container">
            <div className="search-input-wrapper">
              <svg className="search-icon" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
              </svg>
              <input
                type="text"
                placeholder="Search destinations by name, location, or activities..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="search-input"
              />
              {searchTerm && (
                <button className="clear-search" onClick={clearSearch}>
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container">
        {/* Results Info */}
        <div className="results-info">
          <div className="results-count">
            {searchTerm ? (
              <>
                <span className="count-number">{filteredDestinations.length}</span>
                <span className="count-text">
                  {filteredDestinations.length === 1 ? 'destination' : 'destinations'} found for "{searchTerm}"
                </span>
              </>
            ) : (
              <>
                <span className="count-number">{destinations.length}</span>
                <span className="count-text">amazing destinations</span>
              </>
            )}
          </div>
          
          {searchTerm && (
            <button className="clear-filters" onClick={clearSearch}>
              Clear search
            </button>
          )}
        </div>

        {/* Destinations Grid */}
        {filteredDestinations.length > 0 ? (
          <div className="destinations-grid">
            {filteredDestinations.map((destination, index) => (
              <div 
                key={destination._id} 
                className="destination-card-wrapper"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <PostCard item={destination} type="destination" />
              </div>
            ))}
          </div>
        ) : (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h3 className="no-results-title">No destinations found</h3>
            <p className="no-results-message">
              {searchTerm 
                ? `We couldn't find any destinations matching "${searchTerm}". Try a different search term.`
                : "No destinations available at the moment."
              }
            </p>
            {searchTerm && (
              <button className="clear-search-btn" onClick={clearSearch}>
                Show all destinations
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Destinations;
