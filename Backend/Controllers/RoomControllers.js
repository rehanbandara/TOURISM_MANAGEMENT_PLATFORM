const Room = require("../Model/RoomModel");
const Hotel = require("../Model/HotelModel");

//data display
const getAllRooms = async (req, res, next) => {

    let Rooms;
    //Get all rooms
    try{
        rooms = await Room.find();
    }catch (err) {
        console.log(err);
    }
    //not found
    if(!rooms){
         return res.status(404).json({message:"Rooms not found"})
    }
    //Display all Rooms
    return res.status(200).json({ rooms })

};


//data insert
// const addRooms = async (req, res, next) => {

//     const { title, price, maxPeople,photos, desc, hotel, roomNumbers } = req.body;

//     let rooms;

//     try{
//         rooms = new Room({ title, price, maxPeople,photos, desc,  roomNumbers });
//         await rooms.save();
//     }catch (err) {
//         console.log(err); 
//     }

//     //not insert rooms
//     if(!rooms) {
//         return res.status(404).json({ message: "unable to add rooms"});
//     }
//     return res.status(200).json({ rooms });
// };

const addRooms = async (req, res, next) => {
  try {
    const { title, price, maxPeople, desc, hotel, roomNumbers } = req.body;

    // Handle uploaded files
    let photos = [];
    if (req.files && req.files.length > 0) {
      photos = req.files.map(file => `uploads/${file.filename}`);
    }

    // 1. Create Room
    const newRoom = new Room({ title, price, maxPeople, desc, hotel, photos, roomNumbers });
    await newRoom.save();

    // 2. Push room ID into Hotel.rooms[]
    await Hotel.findByIdAndUpdate(hotel, { $push: { rooms: newRoom._id } });

    return res.status(200).json({ room: newRoom });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to add room" });
  }
};
//Get by Id
const getById = async(req, res, next) => {
    
    const id = req.params.id;

    let room;

    try{
        room = await Room.findById(id);
    }catch (err) {
        console.log(err);
    }
    //not available rooms
    if(!room) {
        return res.status(404).json({ message: "Room not found"});
    }
    return res.status(200).json({ room });
};

//Update Room Details
const updateRoom = async (req, res, next) => {
  try {
    const id = req.params.id;

    // 1. Find the existing room
    let room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const oldHotelId = room.hotel; // store current linked hotel
    const newHotelId = req.body.hotel || oldHotelId;

    // 2. Update fields
    room.title = req.body.title || room.title;
    room.price = req.body.price || room.price;
    room.maxPeople = req.body.maxPeople || room.maxPeople;
    room.desc = req.body.desc || room.desc;
    room.hotel = newHotelId; // update hotel link if changed

    // Handle photos
    if (req.file) {
      room.photos = [`uploads/${req.file.filename}`];
    } else if (req.files && req.files.length > 0) {
      room.photos = req.files.map(file => `uploads/${file.originalname}`);
    }

    // Handle roomNumbers (overwrite or keep old)
    if (req.body.roomNumbers) {
      room.roomNumbers = req.body.roomNumbers;
    }

    // 3. Save room
    const updatedRoom = await room.save();

    // 4. If hotel changed → sync relationships
    if (String(oldHotelId) !== String(newHotelId)) {
      // Remove from old hotel
      await Hotel.findByIdAndUpdate(oldHotelId, { $pull: { rooms: room._id } });
      // Add to new hotel
      await Hotel.findByIdAndUpdate(newHotelId, { $addToSet: { rooms: room._id } });
    }

    return res.status(200).json({ room: updatedRoom });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to update room" });
  }
};
// const updateRoom = async (req, res, next) => {

//     const id = req.params.id;

//     const {title, price, maxPeople, photos, desc, roomNumbers } = req.body;

//     let rooms;

//     try {
//         rooms = await Room.findByIdAndUpdate(id,
//              { title:title, price:price, maxPeople:maxPeople, desc:desc, roomNumbers:roomNumbers });
//              rooms = await rooms.save();
//     }catch(err) {
//         console.log(err);
//     }
//     if(!rooms) {
//         return res.status(404).json({ message: "Unable to update Room Details"});
//     }
//     return res.status(200).json({ rooms });
// };

//Delete Room Details
const deleteRoom = async (req, res, next) => {
  try {
    const id = req.params.id;

    // 1. Find the room first
    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // 2. Remove the room
    await Room.findByIdAndDelete(id);

    // 3. Remove reference from hotel.rooms[]
    if (room.hotel) {
      await Hotel.findByIdAndUpdate(room.hotel, { $pull: { rooms: room._id } });
    }

    return res.status(200).json({ message: "Room deleted successfully" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to delete room" });
  }
};
// const deleteRoom = async (req, res, next) => {

//     const id = req.params.id;

//     let room;

//     try {
//         room = await Room.findByIdAndDelete(id)
//     }catch(err) {
//         console.log(err);
//     }
//     if(!room) {
//         return res.status(404).json({ message: "Unable to Delete room Details"});
//     }
//     return res.status(200).json({ room });
// };


exports.getAllRooms = getAllRooms;
exports.addRooms = addRooms;
exports.getById = getById
exports.updateRoom = updateRoom;
exports.deleteRoom = deleteRoom;


