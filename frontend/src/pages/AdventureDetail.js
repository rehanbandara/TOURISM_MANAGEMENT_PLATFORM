import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReviewSection from '../components/ReviewSection';
import './AdventureDetail.css';

const AdventureDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [adventure, setAdventure] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    fetchAdventure();
  }, [id]);

  const fetchAdventure = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/activities/${id}`);
      if (response.data.success) {
        setAdventure(response.data.data);
      } else {
        setError('Adventure not found');
      }
    } catch (error) {
      console.error('Error fetching adventure:', error);
      setError('Failed to load adventure details');
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
    return `LKR:${price}`;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return '#27ae60';
      case 'moderate': return '#f39c12';
      case 'hard': return '#e74c3c';
      default: return '#7f8c8d';
    }
  };

  if (loading) {
    return (
      <div className="adventure-detail-loading">
        <div className="spinner"></div>
        <p>Loading adventure details...</p>
      </div>
    );
  }

  if (error || !adventure) {
    return (
      <div className="adventure-detail-error">
        <h2>Oops! Something went wrong</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/adventures')} className="back-btn">
          Back to Adventures
        </button>
      </div>
    );
  }

  // Get appropriate fallback images based on adventure title
  const getAdventureImages = () => {
    if (adventure.images && adventure.images.length > 0 && adventure.images[0]) {
      return adventure.images;
    }
    
    const title = adventure.title?.toLowerCase() || '';
    if (title.includes('trekking') || title.includes('hiking')) {
      return ['https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&h=400&fit=crop&auto=format'];
    } else if (title.includes('diving') || title.includes('water')) {
      return ['https://images.unsplash.com/photo-1554629947-334ff61d85dc?w=600&h=400&fit=crop&auto=format'];
    } else if (title.includes('safari') || title.includes('wildlife')) {
      return ['https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600&h=400&fit=crop&auto=format'];
    } else {
      return ['https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&h=400&fit=crop&auto=format'];
    }
  };

  const images = getAdventureImages();

  return (
    <div className="adventure-detail">
      {/* Header with back button */}
      <div className="detail-header">
        <button onClick={() => navigate('/adventures')} className="back-button">
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
          </svg>
          Back to Adventures
        </button>
      </div>

      {/* Main Content */}
      <div className="detail-content">
        {/* Left Side - Images */}
        <div className="detail-images">
          <div className="main-image">
            <img 
              src={images[selectedImage]} 
              alt={adventure.title}
              loading="lazy"
            />
            <div className="image-badge adventure-badge">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                <path d="M9.283 4.002V12H7.971V5.338h-.065L6.072 6.656V5.385l1.899-1.383h1.312z"/>
              </svg>
              Adventure
            </div>
            <div 
              className="difficulty-badge-large"
              style={{ backgroundColor: getDifficultyColor(adventure.difficulty) }}
            >
              {adventure.difficulty}
            </div>
          </div>
          
          {images.length > 1 && (
            <div className="image-thumbnails">
              {images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${adventure.title} ${index + 1}`}
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
            <h1 className="adventure-title">{adventure.title}</h1>
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
            <span>{adventure.location}</span>
          </div>

          <div className="price-section">
            <span className="price-label">Price:</span>
            <span className="price-value">{formatPrice(adventure.price)}</span>
          </div>

          <div className="description-section">
            <h3>About This Adventure</h3>
            <p>{adventure.description}</p>
          </div>

          <div className="details-grid">
            <div className="detail-card">
              <h4>Duration</h4>
              <p>{adventure.durationHours} hours</p>
            </div>
            
            <div className="detail-card">
              <h4>Category</h4>
              <p>{adventure.category}</p>
            </div>
            
            <div className="detail-card">
              <h4>Difficulty Level</h4>
              <p className="difficulty-text" style={{ color: getDifficultyColor(adventure.difficulty) }}>
                {adventure.difficulty}
              </p>
            </div>
            
            <div className="detail-card">
              <h4>Group Size</h4>
              <p>{adventure.maxGroupSize ? `Up to ${adventure.maxGroupSize} people` : 'Contact for details'}</p>
            </div>
          </div>

          {adventure.included && adventure.included.length > 0 && (
            <div className="included-section">
              <h3>What's Included</h3>
              <div className="included-grid">
                {(() => {
                  let includedArray = adventure.included;
                  
                  // Handle case where included might be a string
                  if (typeof includedArray === 'string') {
                    try {
                      includedArray = JSON.parse(includedArray);
                    } catch (e) {
                      includedArray = includedArray.split(',').map(item => item.trim());
                    }
                  }
                  
                  if (!Array.isArray(includedArray)) {
                    includedArray = [];
                  }
                  
                  includedArray = includedArray.filter(item => item && item.trim());
                  
                  return includedArray.map((item, index) => (
                    <div key={index} className="included-item">
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z"/>
                      </svg>
                      {item}
                    </div>
                  ));
                })()}
              </div>
            </div>
          )}

          {adventure.requirements && adventure.requirements.length > 0 && (
            <div className="requirements-section">
              <h3>Requirements</h3>
              <div className="requirements-grid">
                {(() => {
                  let requirementsArray = adventure.requirements;
                  
                  // Handle case where requirements might be a string
                  if (typeof requirementsArray === 'string') {
                    try {
                      requirementsArray = JSON.parse(requirementsArray);
                    } catch (e) {
                      requirementsArray = requirementsArray.split(',').map(req => req.trim());
                    }
                  }
                  
                  if (!Array.isArray(requirementsArray)) {
                    requirementsArray = [];
                  }
                  
                  requirementsArray = requirementsArray.filter(req => req && req.trim());
                  
                  return requirementsArray.map((requirement, index) => (
                    <div key={index} className="requirement-item">
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                        <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z"/>
                      </svg>
                      {requirement}
                    </div>
                  ));
                })()}
              </div>
            </div>
          )}

          <div className="book-section">
            <button 
              className="book-now-btn"
              onClick={() => navigate(`/payment/adventure/${adventure._id}`)}
            >
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M1.92.506a.5.5 0 0 1 .434.14L3 1.293l.646-.647a.5.5 0 0 1 .708 0L5 1.293l.646-.647a.5.5 0 0 1 .708 0L7 1.293l.646-.647a.5.5 0 0 1 .708 0L9 1.293l.646-.647a.5.5 0 0 1 .708 0l.646.647.646-.647a.5.5 0 0 1 .708 0l.646.647.646-.647a.5.5 0 0 1 .801.13l.5 1A.5.5 0 0 1 15 2v12a.5.5 0 0 1-.053.224l-.5 1a.5.5 0 0 1-.8.13L13 14.707l-.646.647a.5.5 0 0 1-.708 0L11 14.707l-.646.647a.5.5 0 0 1-.708 0L9 14.707l-.646.647a.5.5 0 0 1-.708 0L7 14.707l-.646.647a.5.5 0 0 1-.708 0L5 14.707l-.646.647a.5.5 0 0 1-.708 0L3 14.707l-.646.647a.5.5 0 0 1-.801-.13l-.5-1A.5.5 0 0 1 1 14V2a.5.5 0 0 1 .053-.224l.5-1a.5.5 0 0 1 .367-.27zm.217 1.338L2 2.118v11.764l.137.274.51-.51a.5.5 0 0 1 .707 0l.646.647.646-.646a.5.5 0 0 1 .708 0l.646.646.646-.646a.5.5 0 0 1 .708 0l.646.646.646-.646a.5.5 0 0 1 .708 0l.646.646.646-.646a.5.5 0 0 1 .708 0l.646.646.646-.646a.5.5 0 0 1 .708 0l.509.509.137-.274V2.118l-.137-.274-.51.51a.5.5 0 0 1-.707 0L12 1.707l-.646.647a.5.5 0 0 1-.708 0L10 1.707l-.646.647a.5.5 0 0 1-.708 0L8 1.707l-.646.647a.5.5 0 0 1-.708 0L6 1.707l-.646.647a.5.5 0 0 1-.708 0L4 1.707l-.646.647a.5.5 0 0 1-.708 0l-.509-.51z"/>
                <path d="M3 4.5a.5.5 0 0 1 .5-.5h6a.5.5 0 1 1 0 1h-6a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h6a.5.5 0 1 1 0 1h-6a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h6a.5.5 0 1 1 0 1h-6a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5zm8-6a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h1a.5.5 0 1 1 0 1h-1a.5.5 0 0 1-.5-.5z"/>
              </svg>
              Book This Adventure
            </button>
            <p className="book-note">Reserve your spot for an unforgettable experience</p>
          </div>
        </div>
      </div>
      
      {/* Reviews Section */}
      <ReviewSection 
        itemId={adventure._id}
        itemType="activity"
        itemName={adventure.title}
      />
    </div>
  );
};

export default AdventureDetail;