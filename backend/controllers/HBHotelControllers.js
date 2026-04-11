const Hotel = require("../models/HBHotelModel");
const Room = require("../models/HBRoomModel");


//Fetch Hotel with Rooms
const getHotelWithRooms = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id).populate("rooms");
    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }
    res.json({ hotel });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};


const getHotelById = async (req, res) => {
  const hotelId = req.params.id;

  try {
    const hotel = await Hotel.findById(hotelId).populate("rooms"); // populate rooms with full room objects
    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }
    res.status(200).json(hotel);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

//data display
const getAllHotels = async (req, res, next) => {

    let Hotels;
    //Get all hotels
    try{
        hotels = await Hotel.find();
    }catch (err) {
        console.log(err);
    }
    //not found
    if(!hotels){
         return res.status(404).json({message:"Hotels not found"})
    }
    //Display all hotels
    return res.status(200).json({ hotels })

};


//data insert
const addHotels = async (req, res, next) => {

    const { name, type, city, desc } = req.body;

      // Handle uploaded file(s)
  let photos = [];
  if (req.file) {
    // Single file upload
    photos.push(`uploads/${req.file.filename}`);
  } 
  if (req.files && req.files.length > 0) {
    // Multiple files upload
    photos = req.files.map(file => `uploads/${file.filename}`);
  }


    let hotels;

    try{
        hotels = new Hotel({name,type,city,photos,desc});
        await hotels.save();
    }catch (err) {
        console.log(err); 
    }

    //not insert hotels
    if(!hotels) {
        return res.status(404).json({ message: "unable to add hotels"});
    }
    return res.status(200).json({ hotels });
};


const getById = async(req, res, next) => {
    const id = req.params.id;

    let hotel;

    try {
        // Populate rooms
        hotel = await Hotel.findById(id).populate("rooms"); 
    } catch (err) {
        console.log(err);
    }

    if(!hotel) {
        return res.status(404).json({ message: "Hotel not found" });
    }
    return res.status(200).json({ hotel });
};

//Update Hotel Details
const updateHotel = async (req, res, next) => {
  const id = req.params.id;

  try {
    let hotel = await Hotel.findById(id);
    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    // Update text fields
    hotel.name = req.body.name || hotel.name;
    hotel.type = req.body.type || hotel.type;
    hotel.city = req.body.city || hotel.city;
    hotel.desc = req.body.desc || hotel.desc;

    // Handle uploaded file(s)
    if (req.file) {
      // single file upload
      hotel.photos = [`uploads/${req.file.filename}`];
    } else if (req.files && req.files.length > 0) {
      // multiple file upload
      hotel.photos = req.files.map(file => `uploads/${file.filename}`);
    }
    // If no new image → keep old hotel.photos

    const updatedHotel = await hotel.save();
    return res.status(200).json({ hotels: updatedHotel });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to update Hotel Details" });
  }
};



//Delete Hotel Details
const deleteHotel = async (req, res, next) => {

    const id = req.params.id;

    let hotel;

    try {
        hotel = await Hotel.findByIdAndDelete(id)
    }catch(err) {
        console.log(err);
    }
    if(!hotel) {
        return res.status(404).json({ message: "Unable to Delete hotel Details"});
    }
    return res.status(200).json({ hotel });
};





exports.getAllHotels = getAllHotels;
exports.addHotels = addHotels;
exports.getById = getById
exports.updateHotel = updateHotel;
exports.deleteHotel = deleteHotel;
exports.getHotelById  = getHotelById ;

