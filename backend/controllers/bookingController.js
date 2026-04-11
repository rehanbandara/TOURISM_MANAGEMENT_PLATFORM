const Booking = require('../models/bookingModel');
const Destination = require('../models/destinationModel');
const AdventureActivity = require('../models/activityModel');
const mongoose = require('mongoose');

// Create a new booking
const createBooking = async (req, res) => {
  try {
    const {
      bookingType,
      itemId,
      customerInfo,
      bookingDetails,
      paymentInfo,
      totalAmount
    } = req.body;

    // Validate required fields
    if (!bookingType || !itemId || !customerInfo || !bookingDetails || !paymentInfo || !totalAmount) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    // Validate booking type and get item model
    let itemModel;
    if (bookingType === 'destination') {
      itemModel = 'Destination';
      // Verify destination exists
      const destination = await Destination.findById(itemId);
      if (!destination) {
        return res.status(404).json({
          success: false,
          message: 'Destination not found'
        });
      }
    } else if (bookingType === 'adventure') {
      itemModel = 'AdventureActivity';
      // Verify adventure exists
      const adventure = await AdventureActivity.findById(itemId);
      if (!adventure) {
        return res.status(404).json({
          success: false,
          message: 'Adventure not found'
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking type'
      });
    }

    // Generate booking reference
    const prefix = bookingType === 'destination' ? 'DEST' : 'ADV';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    const bookingReference = `${prefix}-${timestamp}-${random}`;

    // Create new booking
    const newBooking = new Booking({
      bookingType,
      itemId,
      itemModel,
      customerInfo,
      bookingDetails,
      paymentInfo,
      totalAmount,
      bookingReference,
      bookingStatus: 'confirmed',
      paymentStatus: 'paid' // In a real app, this would be set after payment processing
    });

    console.log('Creating booking with data:', {
      bookingType,
      itemId,
      itemModel,
      customerInfo: customerInfo.firstName + ' ' + customerInfo.lastName,
      totalAmount,
      bookingReference
    });

    const savedBooking = await newBooking.save();

    console.log('Booking saved successfully:', savedBooking.bookingReference);

    // Populate the booked item details
    await savedBooking.populate('itemId');

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: savedBooking
    });

  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all bookings
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('itemId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: bookings
    });

  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get booking by ID
const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID'
      });
    }

    const booking = await Booking.findById(id).populate('itemId');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.status(200).json({
      success: true,
      data: booking
    });

  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get booking by reference number
const getBookingByReference = async (req, res) => {
  try {
    const { reference } = req.params;

    const booking = await Booking.findOne({ bookingReference: reference })
      .populate('itemId');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.status(200).json({
      success: true,
      data: booking
    });

  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update booking status
const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { bookingStatus, paymentStatus } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID'
      });
    }

    const updateData = {};
    if (bookingStatus) updateData.bookingStatus = bookingStatus;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    updateData.updatedAt = new Date();

    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('itemId');

    if (!updatedBooking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Booking updated successfully',
      data: updatedBooking
    });

  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Cancel booking
const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID'
      });
    }

    const cancelledBooking = await Booking.findByIdAndUpdate(
      id,
      { 
        bookingStatus: 'cancelled',
        updatedAt: new Date()
      },
      { new: true }
    ).populate('itemId');

    if (!cancelledBooking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: cancelledBooking
    });

  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get bookings by customer email
const getBookingsByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    const bookings = await Booking.find({ 'customerInfo.email': email.toLowerCase() })
      .populate('itemId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: bookings
    });

  } catch (error) {
    console.error('Error fetching customer bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  createBooking,
  getAllBookings,
  getBookingById,
  getBookingByReference,
  updateBookingStatus,
  cancelBooking,
  getBookingsByEmail
};