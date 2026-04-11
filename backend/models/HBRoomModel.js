const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const roomSchema = new Schema({
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "HBHotelModel",
    required: true
  },
  roomType: {
    type: String,
    required: true,
    enum: ["Double Room with Lake View", "Deluxe Triple Room", "Standard Room", "Suite", "Family Room"]
  },
  roomNumber: {
    type: String,
    required: true
  },
  bedType: {
    type: String,
    required: true
  },

  maxOccupancy: {
    type: Number,
    required: true
  },
  pricePerNight: {
    type: Number,
    required: true
  },
  photos: [String], // Array of image paths
  amenities: {
    parking: { type: Boolean, default: false },
    airportShuttle: { type: Boolean, default: false },
    restaurant: { type: Boolean, default: false },
    swimmingPool: { type: Boolean, default: false },
    bar: { type: Boolean, default: false },
    banquetFacilities: { type: Boolean, default: false },
    laundry: { type: Boolean, default: false },
    wifi: { type: Boolean, default: false },
    tv: { type: Boolean, default: false },
    airConditioning: { type: Boolean, default: false },
    minibar: { type: Boolean, default: false },
    bathtub: { type: Boolean, default: false },
    balcony: { type: Boolean, default: false }
  },
  description: {
    type: String
  },
  view: {
    type: String,
    enum: ["Lake View", "Garden View", "Pool View", "Mountain View", "City View", "No View"]
  },
  size: {
    type: Number // in square meters
  },
  extraBedAvailable: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  bookedDates: [
    {
      checkIn: Date,
      checkOut: Date,
      guestName: String,
      guestEmail: String
    }
  ]
}, {
  timestamps: true
});

module.exports = mongoose.model("HBRoomModel", roomSchema);