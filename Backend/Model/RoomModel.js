const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const roomSchema = new Schema({
  title: { type: String, required: true },
  price: { type: Number, required: true },
  maxPeople: { type: Number, required: true },
  photos: [{ type: String }],
  desc: { type: String, required: true },
  // hotel: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel", required: true }, // reference hotel
  hotel: { type: mongoose.Schema.Types.ObjectId, ref: "HotelModel", required: true }, 
  roomNumbers: [
    { number: Number, unavailableDates: { type: [Date] } }
  ],
}, { timestamps: true });

module.exports = mongoose.model("RoomModel", roomSchema);
