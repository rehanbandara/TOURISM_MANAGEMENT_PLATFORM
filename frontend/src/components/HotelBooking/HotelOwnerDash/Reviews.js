import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Reviews.css';


const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/reviews");
      setReviews(response.data.reviews || response.data);
      setError(null);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setError("Failed to fetch reviews.");
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      await axios.delete(`http://localhost:5000/reviews/${id}`);
      setReviews(reviews.filter(r => r._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete review.");
    }
  };

  if (loading) return <div className="page"><h1>Loading reviews...</h1></div>;
  if (error) return <div className="page"><h1>Error: {error}</h1></div>;

  return (
    <div className="page">
     
      <h1>Guest Reviews</h1>
      
      <div className="card">
        <h2>Recent Reviews ({reviews.length})</h2>
        {reviews.length === 0 ? (
          <p>No reviews yet.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Guest Name</th>
                <th>Rating</th>
                <th>Comment</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map(review => (
                <tr key={review._id}>
                  <td>{review.name || review.guest || 'Anonymous'}</td>
                  <td>{'★'.repeat(review.rating || 0)}{'☆'.repeat(5 - (review.rating || 0))}</td>
                  <td>{review.comment || review.review || 'No comment'}</td>
                  <td>{review.date ? new Date(review.date).toLocaleDateString() : new Date(review.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button className="btn-respond" onClick={() => handleDelete(review._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Reviews;