const express = require('express');
const router = express.Router();

const {
  createActivity,
  getAllActivities,
  getActivityById,
  updateActivity,
  deleteActivity,
  getActivitiesByDifficulty,
  getActivityStats
} = require('../controllers/activityController');

const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');
const { uploadActivityImages } = require('../middleware/uploadMiddleware');

// Public routes (no authentication required)
// GET /api/activities - Get all activities with pagination and search
router.get('/', getAllActivities);

// GET /api/activities/:id - Get activity by ID
router.get('/:id', getActivityById);

// GET /api/activities/difficulty/:difficulty - Get activities by difficulty
router.get('/difficulty/:difficulty', getActivitiesByDifficulty);

// Protected admin routes (require authentication + admin role)
// POST /api/activities - Create new activity with image upload
router.post('/', /* verifyToken, requireAdmin, */ uploadActivityImages, createActivity);

// PUT /api/activities/:id - Update activity with optional image upload
router.put('/:id', /* verifyToken, requireAdmin, */ uploadActivityImages, updateActivity);

// DELETE /api/activities/:id - Delete activity
router.delete('/:id', /* verifyToken, requireAdmin, */ deleteActivity);

// GET /api/activities/admin/stats - Get activity statistics
router.get('/admin/stats', verifyToken, requireAdmin, getActivityStats);

module.exports = router;