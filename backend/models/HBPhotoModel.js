const mongoose = require('mongoose');

const guestPhotoSchema = new mongoose.Schema({
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['room', 'food', 'view', 'amenities'],
    required: true
  },
  photoPath: {
    type: String,
    required: true
  },
  caption: {
    type: String,
    maxlength: 200
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  verified: {
    type: Boolean,
    default: true // Set to false if you want admin approval
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('HBPhotoModel', guestPhotoSchema);