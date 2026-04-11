import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ReviewSection.css';

const ReviewSection = ({ itemId, itemType, itemName }) => {
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({ averageRating: 0, totalReviews: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    clientName: '',
    clientEmail: '',
    rating: 5,
    comment: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (itemId) {
      fetchReviews();
    }
  }, [itemId, itemType]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const endpoint = itemType === 'activity' 
        ? `http://localhost:5000/api/reviews/activity/${itemId}`
        : `http://localhost:5000/api/reviews/destination/${itemId}`;
      
      const response = await axios.get(endpoint);
      
      if (response.data.success) {
        setReviews(response.data.data);
        setReviewStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewReview(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!newReview.clientName.trim() || !newReview.clientEmail.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      
      const reviewData = {
        ...newReview,
        reviewType: itemType,
        [itemType]: itemId
      };

      const response = await axios.post('http://localhost:5000/api/reviews', reviewData);
      
      if (response.data.success) {
        alert('Review submitted successfully!');
        setNewReview({
          clientName: '',
          clientEmail: '',
          rating: 5,
          comment: ''
        });
        setShowReviewForm(false);
        fetchReviews(); // Refresh reviews
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert('Failed to submit review. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating, interactive = false, onStarClick = null) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`star ${i <= rating ? 'filled' : 'empty'} ${interactive ? 'interactive' : ''}`}
          onClick={interactive ? () => onStarClick(i) : undefined}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="review-section">
      <div className="review-header">
        <h3>Reviews & Ratings</h3>
        <div className="rating-summary">
          <div className="average-rating">
            <span className="rating-number">{reviewStats.averageRating}</span>
            <div className="stars">
              {renderStars(reviewStats.averageRating)}
            </div>
            <span className="review-count">({reviewStats.totalReviews} reviews)</span>
          </div>
          <button 
            className="add-review-btn"
            onClick={() => setShowReviewForm(!showReviewForm)}
          >
            {showReviewForm ? 'Cancel' : 'Write a Review'}
          </button>
        </div>
      </div>

      {showReviewForm && (
        <div className="review-form-container">
          <form onSubmit={handleSubmitReview} className="review-form">
            <h4>Share Your Experience</h4>
            
            <div className="form-group">
              <label htmlFor="clientName">Your Name *</label>
              <input
                type="text"
                id="clientName"
                name="clientName"
                value={newReview.clientName}
                onChange={handleInputChange}
                required
                placeholder="Enter your name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="clientEmail">Your Email *</label>
              <input
                type="email"
                id="clientEmail"
                name="clientEmail"
                value={newReview.clientEmail}
                onChange={handleInputChange}
                required
                placeholder="Enter your email"
              />
            </div>

            <div className="form-group">
              <label>Rating *</label>
              <div className="rating-input">
                {renderStars(newReview.rating, true, (rating) => 
                  setNewReview(prev => ({ ...prev, rating }))
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="comment">Your Review</label>
              <textarea
                id="comment"
                name="comment"
                value={newReview.comment}
                onChange={handleInputChange}
                placeholder="Share your thoughts about this experience..."
                rows={4}
              />
            </div>

            <button 
              type="submit" 
              className="submit-review-btn"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>
      )}

      <div className="reviews-list">
        {loading ? (
          <div className="loading">Loading reviews...</div>
        ) : error ? (
          <div className="error">
            <p>{error}</p>
            <button onClick={fetchReviews}>Try Again</button>
          </div>
        ) : reviews.length === 0 ? (
          <div className="no-reviews">
            <p>No reviews yet. Be the first to share your experience!</p>
          </div>
        ) : (
          reviews.map((review, index) => (
            <div key={index} className="review-item">
              <div className="review-header-item">
                <div className="reviewer-info">
                  <span className="reviewer-name">{review.clientName}</span>
                  <span className="review-date">{formatDate(review.createdAt)}</span>
                </div>
                <div className="review-rating">
                  {renderStars(review.rating)}
                </div>
              </div>
              {review.comment && (
                <p className="review-comment">{review.comment}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewSection;