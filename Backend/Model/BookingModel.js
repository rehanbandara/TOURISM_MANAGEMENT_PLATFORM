const mongoose = require("mongoose");
const BookingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
     
    },
     hotelName: {
      type: String,
      required: true,
    },
    roomNumber: {
      type: String,
      required: true,
    },
    checkInDate: {
      type: Date,
      required: true,
    },
    checkOutDate: {
      type: Date,
      required: true,
    },
    guests: {
      type: Number,
      required: true,
      min: 1,
    },
   
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Booking", BookingSchema);
