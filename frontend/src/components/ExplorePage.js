import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ExplorePage.css';

const ExplorePage = () => {
  const navigate = useNavigate();

  const handleDestinationsClick = () => {
    navigate('/destinations');
  };

  const handleAdventuresClick = () => {
    navigate('/adventures');
  };

  return (
    <div className="explore-page">
      <div className="explore-container">
        {/* Header Section */}
        <div className="explore-header">
          <h1 className="explore-title">What Would You Like to Explore?</h1>
          <p className="explore-subtitle">
            Choose your adventure and discover the beauty of Sri Lanka
          </p>
        </div>

        {/* Cards Section */}
        <div className="explore-cards">
          {/* Destinations Card */}
          <div className="explore-card destinations-card" onClick={handleDestinationsClick}>
            <div className="card-background">
              <img 
                src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80" 
                alt="Beautiful destinations in Sri Lanka" 
                className="card-image"
                loading="lazy"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/1200x600/1e3c72/ffffff?text=Destinations";
                }}
              />
              <div className="card-overlay"></div>
            </div>
            <div className="card-content">
              <div className="card-icon">
                <svg width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
                </svg>
              </div>
              <h2 className="card-title">Destinations</h2>
              <p className="card-description">
                Discover amazing places, ancient temples, beautiful beaches, and breathtaking landscapes across Sri Lanka
              </p>
              <div className="card-features">
                <span className="feature">🏛️ Historical Sites</span>
                <span className="feature">🏖️ Beautiful Beaches</span>
                <span className="feature">🌄 Mountain Views</span>
                <span className="feature">🎯 Cultural Heritage</span>
              </div>
              {/* <button className="card-button">
                Explore Destinations
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/>
                </svg>
              </button> */}
            </div>
          </div>

          {/* Adventures Card */}
          <div className="explore-card adventures-card" onClick={handleAdventuresClick}>
            <div className="card-background">
              <img 
                src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80" 
                alt="Adventure activities in Sri Lanka" 
                className="card-image"
                loading="lazy"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/1200x600/e74c3c/ffffff?text=Adventures";
                }}
              />
              <div className="card-overlay"></div>
            </div>
            <div className="card-content">
              <div className="card-icon">
                <svg width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                  <path d="M9.283 4.002V12H7.971V5.338h-.065L6.072 6.656V5.385l1.899-1.383h1.312z"/>
                </svg>
              </div>
              <h2 className="card-title">Adventures</h2>
              <p className="card-description">
                Experience thrilling activities, water sports, hiking trails, and adrenaline-pumping adventures
              </p>
              <div className="card-features">
                <span className="feature">🚣 Water Sports</span>
                <span className="feature">🥾 Hiking Trails</span>
                <span className="feature">🏄 Surfing</span>
                <span className="feature">🧗 Rock Climbing</span>
              </div>
              {/* <button className="card-button">
                Explore Adventures
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/>
                </svg>
              </button> */}
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="explore-footer">
          <button className="back-button" onClick={() => navigate('/')}>
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
            </svg>
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExplorePage;