import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReviewSection from '../components/ReviewSection';
import './DestinationDetail.css';

const DestinationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    fetchDestination();
  }, [id]);

  const fetchDestination = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/destinations/${id}`);
      if (response.data.success) {
        setDestination(response.data.data);
      } else {
        setError('Destination not found');
      }
    } catch (error) {
      console.error('Error fetching destination:', error);
      setError('Failed to load destination details');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="star filled">★</span>);
    }
    
    if (hasHalfStar) {
      stars.push(<span key="half" className="star half">★</span>);
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="star empty">★</span>);
    }
    
    return stars;
  };

  const formatPrice = (price) => {
    return price === 0 ? 'Free' : `LKR:${price}`;
  };

  if (loading) {
    return (
      <div className="destination-detail-loading">
        <div className="spinner"></div>
        <p>Loading destination details...</p>
      </div>
    );
  }

  if (error || !destination) {
    return (
      <div className="destination-detail-error">
        <h2>Oops! Something went wrong</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/destinations')} className="back-btn">
          Back to Destinations
        </button>
      </div>
    );
  }

  // Get appropriate fallback images based on destination name
  const getDestinationImages = () => {
    if (destination.images && destination.images.length > 0 && destination.images[0]) {
      return destination.images;
    }
    
    const name = destination.name?.toLowerCase() || '';
    if (name.includes('bridge')) {
      return ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop&auto=format'];
    } else if (name.includes('fort') || name.includes('fortress')) {
      return ['https://images.unsplash.com/photo-1571055107559-3e67626fa8be?w=600&h=400&fit=crop&auto=format'];
    } else if (name.includes('temple') || name.includes('tooth')) {
      return ['https://images.unsplash.com/photo-1599582909646-bbfedc76f768?w=600&h=400&fit=crop&auto=format'];
    } else {
      return ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop&auto=format'];
    }
  };

  const images = getDestinationImages();

  return (
    <div className="destination-detail">
      {/* Header with back button */}
      <div className="detail-header">
        <button onClick={() => navigate('/destinations')} className="back-button">
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
          </svg>
          Back to Destinations
        </button>
      </div>

      {/* Main Content */}
      <div className="detail-content">
        {/* Left Side - Images */}
        <div className="detail-images">
          <div className="main-image">
            <img 
              src={images[selectedImage]} 
              alt={destination.name}
              loading="lazy"
            />
            <div className="image-badge destination-badge">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
              </svg>
              Destination
            </div>
            {destination.entryFee === 0 && (
              <div className="free-badge">FREE</div>
            )}
          </div>
          
          {images.length > 1 && (
            <div className="image-thumbnails">
              {images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${destination.name} ${index + 1}`}
                  className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                  onClick={() => setSelectedImage(index)}
                  loading="lazy"
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Side - Details */}
        <div className="detail-info">
          <div className="info-header">
            <h1 className="destination-title">{destination.name}</h1>
            <div className="rating-section">
              <div className="stars-large">
                {renderStars(4)}
              </div>
              <span className="rating-text">(4 out of 5)</span>
            </div>
          </div>

          <div className="location-section">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
            </svg>
            <span>{destination.location}</span>
          </div>

          <div className="price-section">
            <span className="price-label">Entry Fee:</span>
            <span className="price-value">{formatPrice(destination.entryFee)}</span>
          </div>

          <div className="description-section">
            <h3>About This Destination</h3>
            <p>{destination.description}</p>
          </div>

          <div className="details-grid">
            <div className="detail-card">
              <h4>Best Time to Visit</h4>
              <p>{destination.bestTimeToVisit}</p>
            </div>
            
            <div className="detail-card">
              <h4>Opening Hours</h4>
              <p>{destination.openingHours || 'Check locally for current hours'}</p>
            </div>
          </div>

          {destination.activities && destination.activities.length > 0 && (
            <div className="activities-section">
              <h3>Activities Available</h3>
              <div className="activities-grid">
                {(() => {
                  let activitiesArray = destination.activities;
                  
                  // Handle case where activities might be a string
                  if (typeof activitiesArray === 'string') {
                    try {
                      // Try to parse if it's a JSON string
                      activitiesArray = JSON.parse(activitiesArray);
                    } catch (e) {
                      // If not JSON, split by comma
                      activitiesArray = activitiesArray.split(',').map(activity => activity.trim());
                    }
                  }
                  
                  // Ensure it's an array and filter out empty values
                  if (!Array.isArray(activitiesArray)) {
                    activitiesArray = [];
                  }
                  
                  activitiesArray = activitiesArray.filter(activity => activity && activity.trim());
                  
                  return activitiesArray.map((activity, index) => (
                    <div key={index} className="activity-tag">
                      {activity}
                    </div>
                  ));
                })()}
              </div>
            </div>
          )}

          {destination.facilities && destination.facilities.length > 0 && (
            <div className="facilities-section">
              <h3>Facilities</h3>
              <div className="facilities-grid">
                {destination.facilities.map((facility, index) => (
                  <div key={index} className="facility-item">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z"/>
                    </svg>
                    {facility}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="book-section">
            <button 
              className="book-now-btn"
              onClick={() => navigate(`/payment/destination/${destination._id}`)}
            >
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M1.92.506a.5.5 0 0 1 .434.14L3 1.293l.646-.647a.5.5 0 0 1 .708 0L5 1.293l.646-.647a.5.5 0 0 1 .708 0L7 1.293l.646-.647a.5.5 0 0 1 .708 0L9 1.293l.646-.647a.5.5 0 0 1 .708 0l.646.647.646-.647a.5.5 0 0 1 .708 0l.646.647.646-.647a.5.5 0 0 1 .801.13l.5 1A.5.5 0 0 1 15 2v12a.5.5 0 0 1-.053.224l-.5 1a.5.5 0 0 1-.8.13L13 14.707l-.646.647a.5.5 0 0 1-.708 0L11 14.707l-.646.647a.5.5 0 0 1-.708 0L9 14.707l-.646.647a.5.5 0 0 1-.708 0L7 14.707l-.646.647a.5.5 0 0 1-.708 0L5 14.707l-.646.647a.5.5 0 0 1-.708 0L3 14.707l-.646.647a.5.5 0 0 1-.801-.13l-.5-1A.5.5 0 0 1 1 14V2a.5.5 0 0 1 .053-.224l.5-1a.5.5 0 0 1 .367-.27zm.217 1.338L2 2.118v11.764l.137.274.51-.51a.5.5 0 0 1 .707 0l.646.647.646-.646a.5.5 0 0 1 .708 0l.646.646.646-.646a.5.5 0 0 1 .708 0l.646.646.646-.646a.5.5 0 0 1 .708 0l.646.646.646-.646a.5.5 0 0 1 .708 0l.646.646.646-.646a.5.5 0 0 1 .708 0l.509.509.137-.274V2.118l-.137-.274-.51.51a.5.5 0 0 1-.707 0L12 1.707l-.646.647a.5.5 0 0 1-.708 0L10 1.707l-.646.647a.5.5 0 0 1-.708 0L8 1.707l-.646.647a.5.5 0 0 1-.708 0L6 1.707l-.646.647a.5.5 0 0 1-.708 0L4 1.707l-.646.647a.5.5 0 0 1-.708 0l-.509-.51z"/>
                <path d="M3 4.5a.5.5 0 0 1 .5-.5h6a.5.5 0 1 1 0 1h-6a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h6a.5.5 0 1 1 0 1h-6a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h6a.5.5 0 1 1 0 1h-6a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5zm8-6a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h1a.5.5 0 1 1 0 1h-1a.5.5 0 0 1-.5-.5z"/>
              </svg>
              Book Now
            </button>
            <p className="book-note">Reserve your spot for an unforgettable experience</p>
          </div>
        </div>
      </div>
      
      {/* Reviews Section */}
      <ReviewSection 
        itemId={destination._id}
        itemType="destination"
        itemName={destination.name}
      />
    </div>
  );
};

export default DestinationDetail;