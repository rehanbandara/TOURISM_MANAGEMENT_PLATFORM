const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  // Booking Type
  bookingType: {
    type: String,
    enum: ["destination", "adventure"],
    required: true
  },

  // Reference to the booked item
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'itemModel'
  },
  
  itemModel: {
    type: String,
    required: true,
    enum: ['Destination', 'AdventureActivity']
  },

  // Customer Information
  customerInfo: {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    nationality: {
      type: String,
      trim: true
    }
  },

  // Booking Details
  bookingDetails: {
    visitDate: {
      type: Date,
      required: true
    },
    numberOfPeople: {
      type: Number,
      required: true,
      min: 1
    },
    specialRequests: {
      type: String,
      trim: true
    }
  },

  // Payment Information
  paymentInfo: {
    cardNumber: {
      type: String,
      required: true
    },
    expiryDate: {
      type: String,
      required: true
    },
    cvv: {
      type: String,
      required: true
    },
    cardHolderName: {
      type: String,
      required: true,
      trim: true
    },
    billingAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    }
  },

  // Booking Status and Financial
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },

  bookingStatus: {
    type: String,
    enum: ["pending", "confirmed", "cancelled", "completed"],
    default: "pending"
  },

  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed", "refunded"],
    default: "pending"
  },

  // Booking Reference
  bookingReference: {
    type: String,
    unique: true,
    required: true
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Generate booking reference before saving
bookingSchema.pre('save', function(next) {
  if (!this.bookingReference) {
    const prefix = this.bookingType === 'destination' ? 'DEST' : 'ADV';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    this.bookingReference = `${prefix}-${timestamp}-${random}`;
  }
  next();
});

const Booking = mongoose.model("Booking", bookingSchema);
module.exports = Booking;