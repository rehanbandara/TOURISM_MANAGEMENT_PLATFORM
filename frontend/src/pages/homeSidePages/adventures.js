import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import PostCard from '../../components/PostCard';
import './adventures.css';

const Adventures = () => {
  const [adventures, setAdventures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredAdventures, setFilteredAdventures] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  const categories = ['all', 'water sports', 'adventure', 'wildlife', 'cultural', 'hiking'];
  const difficulties = ['all', 'easy', 'moderate', 'hard', 'extreme'];

  const filterAdventures = useCallback(() => {
    let filtered = adventures;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(adventure =>
        adventure.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        adventure.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        adventure.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        adventure.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(adventure =>
        adventure.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Filter by difficulty
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(adventure =>
        adventure.difficulty.toLowerCase() === selectedDifficulty.toLowerCase()
      );
    }

    setFilteredAdventures(filtered);
  }, [adventures, searchTerm, selectedCategory, selectedDifficulty]);

  useEffect(() => {
    fetchAdventures();
  }, []);

  useEffect(() => {
    filterAdventures();
  }, [filterAdventures]);

  const fetchAdventures = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/activities');
      setAdventures(response.data.data || response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching adventures:', err);
      setError('Failed to load adventures. Please try again later.');
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

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedDifficulty('all');
  };

  const handleRetry = () => {
    fetchAdventures();
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return '#27ae60';
      case 'moderate': return '#f39c12';
      case 'hard': return '#e74c3c';
      case 'extreme': return '#9b59b6';
      default: return '#95a5a6';
    }
  };

  if (loading) {
    return (
      <div className="adventures-page">
        <div className="adventures-header">
          <div className="container">
            <h1 className="page-title">Thrilling Adventures Await</h1>
            <p className="page-subtitle">Discover exciting activities and experiences</p>
          </div>
        </div>
        
        <div className="container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading exciting adventures...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="adventures-page">
        <div className="adventures-header">
          <div className="container">
            <h1 className="page-title">Adventures</h1>
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
    <div className="adventures-pagee">
      {/* Hero Section */}
      <div className="adventures-header">
        <div className="container">
          <h1 className="page-title">Thrilling Adventures Await</h1>
          <p className="page-subtitle">
            Discover {adventures.length} exciting activities and experiences across Sri Lanka
          </p>
          
          {/* Search Bar */}
          <div className="search-container">
            <div className="search-input-wrapper">
              <svg className="search-icon" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
              </svg>
              <input
                type="text"
                placeholder="Search adventures by name, location, or category..."
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
            <span className="count-number">{filteredAdventures.length}</span>
            <span className="count-text">
              {filteredAdventures.length === 1 ? 'adventure' : 'adventures'} found
            </span>
          </div>
          
          {/* Active Filters */}
          <div className="active-filters">
            {searchTerm && (
              <span className="filter-tag">
                Search: "{searchTerm}"
                <button onClick={clearSearch}>×</button>
              </span>
            )}
            {selectedCategory !== 'all' && (
              <span className="filter-tag">
                Category: {selectedCategory}
                <button onClick={() => setSelectedCategory('all')}>×</button>
              </span>
            )}
            {selectedDifficulty !== 'all' && (
              <span className="filter-tag" style={{color: getDifficultyColor(selectedDifficulty)}}>
                Difficulty: {selectedDifficulty}
                <button onClick={() => setSelectedDifficulty('all')}>×</button>
              </span>
            )}
          </div>
        </div>

        {/* Adventures Grid */}
        {filteredAdventures.length > 0 ? (
          <div className="adventures-grid">
            {filteredAdventures.map((adventure, index) => (
              <div 
                key={adventure._id} 
                className="adventure-card-wrapper"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <PostCard item={adventure} type="adventure" />
              </div>
            ))}
          </div>
        ) : (
          <div className="no-results">
            <div className="no-results-icon">🏃‍♂️</div>
            <h3 className="no-results-title">No adventures found</h3>
            <p className="no-results-message">
              {searchTerm || selectedCategory !== 'all' || selectedDifficulty !== 'all'
                ? "We couldn't find any adventures matching your criteria. Try adjusting your filters."
                : "No adventures available at the moment."
              }
            </p>
            {(searchTerm || selectedCategory !== 'all' || selectedDifficulty !== 'all') && (
              <button className="clear-filters-btn" onClick={clearAllFilters}>
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Adventures;
