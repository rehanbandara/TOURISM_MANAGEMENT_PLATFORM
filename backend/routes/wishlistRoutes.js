const express = require('express');
const router = express.Router();
const { verifyToken, optionalAuth } = require('../middleware/authMiddleware');
const { addToWishlist, removeFromWishlist, getMyWishlist, isInWishlist } = require('../controllers/wishlistController');

// Check if an item is in wishlist (works with optional auth)
router.get('/check', optionalAuth, isInWishlist);

// Get current user's wishlist
router.get('/me', verifyToken, getMyWishlist);

// Add to wishlist
router.post('/', verifyToken, addToWishlist);

// Remove from wishlist
router.delete('/', verifyToken, removeFromWishlist);

module.exports = router;
