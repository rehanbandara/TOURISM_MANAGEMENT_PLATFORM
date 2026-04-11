const express = require('express');
const router = express.Router();

const {
  createDestination,
  getAllDestinations,
  getDestinationById,
  updateDestination,
  deleteDestination,
  getDestinationStats
} = require('../controllers/destinationController');

const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');
const { uploadDestinationImages } = require('../middleware/uploadMiddleware');

// Public routes (no authentication required)
// GET /api/destinations - Get all destinations with pagination and search
router.get('/', getAllDestinations);

// GET /api/destinations/:id - Get destination by ID
router.get('/:id', getDestinationById);

// Protected admin routes (require authentication + admin role)
// POST /api/destinations - Create new destination with image upload
router.post('/', /* verifyToken, requireAdmin, */ uploadDestinationImages, createDestination);

// PUT /api/destinations/:id - Update destination with optional image upload
router.put('/:id', /* verifyToken, requireAdmin, */ uploadDestinationImages, updateDestination);

// DELETE /api/destinations/:id - Delete destination
router.delete('/:id', /* verifyToken, requireAdmin, */ deleteDestination);

// GET /api/destinations/admin/stats - Get destination statistics
router.get('/admin/stats', verifyToken, requireAdmin, getDestinationStats);

module.exports = router;