const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const hotelSchema = new Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  city: { type: String, required: true },
  photos: [String], 
  desc: { type: String },
  // rooms: [{ type: mongoose.Schema.Types.ObjectId, ref: "Room" }],
  rooms: [{ type: mongoose.Schema.Types.ObjectId, ref: "RoomModel" }],
});

module.exports = mongoose.model("HotelModel", hotelSchema);
