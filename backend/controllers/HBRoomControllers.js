const Room = require("../models/HBRoomModel");
const Hotel = require("../models/HBHotelModel");

// Get all rooms
const getAllRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find().populate("hotelId", "name _id");
    // Return empty array instead of 404 when no rooms found
    return res.status(200).json({ rooms: rooms || [] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error fetching rooms" });
  }
};

// Get room by ID
const getById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const room = await Room.findById(id).populate("hotelId", "name _id");

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }
    return res.status(200).json({ room });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error fetching room" });
  }
};

// Create new room (Admin)
const addRoom = async (req, res, next) => {
  try {
    const {
      hotelId,
      roomType,
      roomNumber,
      bedType,
    
      maxOccupancy,
      pricePerNight,
      photos,
      amenities,
      description,
      view,
      size,
      extraBedAvailable,
    } = req.body;

    // Handle uploaded files
    let roomPhotos = [];
    if (req.files && req.files.length > 0) {
      roomPhotos = req.files.map((file) => `uploads/${file.filename}`);
    }

    const newRoom = new Room({
      hotelId,
      roomType,
      roomNumber,
      bedType,
      
      maxOccupancy,
      pricePerNight,
      photos: roomPhotos.length > 0 ? roomPhotos : photos,
      amenities,
      description,
      view,
      size,
      extraBedAvailable,
    });

    await newRoom.save();

    const populatedRoom = await newRoom.populate("hotelId", "name _id");

    return res
      .status(201)
      .json({ message: "Room created successfully", room: populatedRoom });
  } catch (err) {
    console.error("Error adding room:", err);
    return res
      .status(400)
      .json({ message: "Unable to add room", error: err.message });
  }
};

// Update existing room
// const updateRoom = async (req, res, next) => {
//   try {
//     const id = req.params.id;

//     let room = await Room.findById(id);
//     if (!room) {
//       return res.status(404).json({ message: "Room not found" });
//     }

//     const oldHotelId = room.hotelId;
//     const newHotelId = req.body.hotelId || oldHotelId;

//     // Update fields dynamically
//     Object.keys(req.body).forEach((key) => {
//       if (req.body[key] !== undefined) {
//         room[key] = req.body[key];
//       }
//     });

//     // Handle new photos if provided
//     if (req.files && req.files.length > 0) {
//       room.images = req.files.map((file) => `uploads/${file.originalname}`);
//     }

//     const updatedRoom = await room.save();

//     // Sync hotel relationship if hotel changed
//     if (String(oldHotelId) !== String(newHotelId)) {
//       await Hotel.findByIdAndUpdate(oldHotelId, { $pull: { rooms: room._id } });
//       await Hotel.findByIdAndUpdate(newHotelId, {
//         $addToSet: { rooms: room._id },
//       });
//     }

//     return res.status(200).json({ room: updatedRoom });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: "Unable to update room" });
//   }
// };

// Update existing room
const updateRoom = async (req, res, next) => {
  try {
    const id = req.params.id;

    let room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Handle amenities (since it’s JSON string from FormData)
    if (req.body.amenities && typeof req.body.amenities === "string") {
      req.body.amenities = JSON.parse(req.body.amenities);
    }

    const oldHotelId = room.hotelId;
    const newHotelId = req.body.hotelId || oldHotelId;

    // Dynamically update fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        room[key] = req.body[key];
      }
    });

    // Handle new photo uploads
    if (req.files && req.files.length > 0) {
      room.photos = req.files.map(file => `uploads/${file.filename}`);
    }

    const updatedRoom = await room.save();

    // Update hotel-room relation if hotel changed
    if (String(oldHotelId) !== String(newHotelId)) {
      await Hotel.findByIdAndUpdate(oldHotelId, { $pull: { rooms: room._id } });
      await Hotel.findByIdAndUpdate(newHotelId, { $addToSet: { rooms: room._id } });
    }

    const populatedRoom = await updatedRoom.populate("hotelId", "name _id");

    return res.status(200).json({ message: "Room updated successfully", room: populatedRoom });
  } catch (err) {
    console.error("Error updating room:", err);
    return res.status(500).json({ message: "Unable to update room", error: err.message });
  }
};


// Delete room
const deleteRoom = async (req, res, next) => {
  try {
    const id = req.params.id;

    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    await Room.findByIdAndDelete(id);

    // Remove from hotel.rooms[]
    if (room.hotel) {
      await Hotel.findByIdAndUpdate(room.hotel, { $pull: { rooms: room._id } });
    }

    return res.status(200).json({ message: "Room deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to delete room" });
  }
};

// ✅ Get all rooms for a specific hotel
const getRoomsByHotel = async (req, res, next) => {
  try {
    const { hotelId } = req.params;
    const rooms = await Room.find({ hotelId: hotelId });

    if (!rooms || rooms.length === 0) {
      return res.status(404).json({ message: "No rooms found for this hotel" });
    }

    return res.status(200).json({ rooms });
  } catch (err) {
    console.error("Error fetching rooms by hotel:", err);
    return res.status(500).json({ message: "Error fetching rooms by hotel" });
  }
};

//  Export all functions
exports.getAllRooms = getAllRooms;
exports.addRoom = addRoom;
exports.getById = getById;
exports.updateRoom = updateRoom;
exports.deleteRoom = deleteRoom;
exports.getRoomsByHotel = getRoomsByHotel;
