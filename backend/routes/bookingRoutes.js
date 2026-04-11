const express = require('express');
const router = express.Router();
const {
  createBooking,
  getAllBookings,
  getBookingById,
  getBookingByReference,
  updateBookingStatus,
  cancelBooking,
  getBookingsByEmail
} = require('../controllers/bookingController');

// Create a new booking
router.post('/', createBooking);

// Get all bookings
router.get('/', getAllBookings);

// Get booking by ID
router.get('/:id', getBookingById);

// Get booking by reference number
router.get('/reference/:reference', getBookingByReference);

// Get bookings by customer email
router.get('/customer/:email', getBookingsByEmail);

// Update booking status
router.patch('/:id', updateBookingStatus);

// Cancel booking
router.patch('/:id/cancel', cancelBooking);

module.exports = router;