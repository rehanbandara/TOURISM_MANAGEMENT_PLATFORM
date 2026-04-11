const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  // User Information
  userId: {
    type: String,
    required: true
  },
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HBHotelModel',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  
  // Booking Details
  roomType: {
    type: String,
    required: true
  },
  checkIn: {
    type: Date,
    required: true
  },
  checkOut: {
    type: Date,
    required: true
  },
  numberOfRooms: {
    type: Number,
    required: true,
    min: 1
  },
  adults: {
    type: Number,
    required: true,
    min: 1
  },
  children: {
    type: Number,
    default: 0
  },
  additionalInfo: {
    type: String
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending'
  },
  
  // Price Details
  totalPrice: {
    type: Number,
    required: true
  },
  priceBreakdown: {
    pricePerNight: Number,
    numberOfNights: Number,
    subtotal: Number,
    tax: Number,
    serviceFee: Number
  },
  
  // Payment Information
  paymentMethod: {
    type: String,
    enum: ['debit_card', 'credit_card', 'stripe'],
    default: 'debit_card'
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid', 'refunded'],
    default: 'unpaid'
  },
  paymentDetails: {
    method: String,
    amount: Number,
    transactionId: String,
    status: String,
    timestamp: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('HBBookingModel', BookingSchema);