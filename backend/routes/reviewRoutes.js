const express = require('express');
const router = express.Router();
const {
  createReview,
  getAllReviews,
  getReviewById,
  getActivityReviews,
  getDestinationReviews,
  updateReview,
  deleteReview,
  getReviewStats
} = require('../controllers/reviewController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

// Public Routes

// Create a new review (anyone can review)
router.post('/', createReview);

// Get all reviews with pagination and filtering
router.get('/', getAllReviews);

// Get all reviews for a specific activity
router.get('/activity/:activityId', getActivityReviews);

// Get all reviews for a specific destination
router.get('/destination/:destinationId', getDestinationReviews);

// Protected Routes (Admin Only)

// Get review statistics (admin only) - must come before /:id route
router.get('/admin/stats', verifyToken, requireAdmin, getReviewStats);

// Get specific review by ID
router.get('/:id', getReviewById);

// Update review (admin only)
router.put('/:id', verifyToken, requireAdmin, updateReview);

// Delete review (admin only)
router.delete('/:id', verifyToken, requireAdmin, deleteReview);

module.exports = router;