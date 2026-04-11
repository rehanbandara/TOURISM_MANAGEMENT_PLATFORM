const express = require('express');
const router = express.Router();

const { registerUser, loginUser, getProfile } = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');

// POST /api/users/register
router.post('/register', registerUser);

// POST /api/users/login
router.post('/login', loginUser);

// GET /api/users/me - Get current user profile (protected)
router.get('/me', verifyToken, getProfile);

module.exports = router;

