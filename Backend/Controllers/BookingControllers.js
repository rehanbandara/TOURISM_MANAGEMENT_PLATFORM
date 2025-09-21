// const Booking = require("../Model/BookingModel");

// // ✅ Create Booking
// exports.createBooking = async (req, res) => {
//   try {
//     const booking = new Booking(req.body);
//     await booking.save();
//     res.status(201).json({booking});
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// };

// // ✅ Get All Bookings
// exports.getAllBookings = async (req, res) => {
//   try {
//     const bookings = await Booking.find()
//       .populate("user", "name email") // show user details
//       .populate("hotel", "name city cheapestPrice"); // show hotel details
//     res.status(200).json({bookings});
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // ✅ Get Booking by ID
// exports.getBookingById = async (req, res) => {
//   try {
//     const booking = await Booking.findById(req.params.id)
//       .populate("user", "name email")
//       .populate("hotel", "name city cheapestPrice");

//     if (!booking) return res.status(404).json({ message: "Booking not found" });

//     res.status(200).json(booking);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // ✅ Update Booking
// exports.updateBooking = async (req, res) => {
//   try {
//     const booking = await Booking.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true }
//     );

//     if (!booking) return res.status(404).json({ message: "Booking not found" });

//     res.status(200).json(booking);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// };

// // ✅ Delete Booking
// exports.deleteBooking = async (req, res) => {
//   try {
//     const booking = await Booking.findByIdAndDelete(req.params.id);

//     if (!booking) return res.status(404).json({ message: "Booking not found" });

//     res.status(200).json({ message: "Booking deleted successfully" });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };
const Booking = require("../Model/BookingModel");
const Hotel = require("../Model/HotelModel"); 

// ✅ Create Booking
const createBooking = async (req, res) => {
  const { name, hotelName, roomNumber, checkInDate, checkOutDate, guests, price, status } = req.body;

  let booking;
  try {
    booking = new Booking({
      name,
      hotelName,
      roomNumber,
      checkInDate,
      checkOutDate,
      guests,
      status
    });

    await booking.save();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to create booking" });
  }

  if (!booking) {
    return res.status(400).json({ message: "Booking not created" });
  }

  return res.status(201).json({ booking });
};

// ✅ Get All Bookings
// const getAllBookings = async (req, res) => {
//   try {
//     const bookings = await Booking.find().populate("hotel"); 

//     if (!bookings || bookings.length === 0) {
//       return res.status(404).json({ message: "No bookings found" });
//     }

//     return res.status(200).json({ bookings });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: err.message });
//   }
// };

// Get all bookings without populate
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find(); // remove populate
    if (!bookings || bookings.length === 0) {
      return res.status(404).json({ message: "No bookings found" });
    }
    return res.status(200).json({ bookings });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

// ✅ Get Booking by Id
const getBookingById = async (req, res) => {
  const id = req.params.id;
  let booking;

  try {
    booking = await Booking.findById(id).populate("hotel");
  } catch (err) {
    console.error(err);
  }

  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  return res.status(200).json({ booking });
};

// ✅ Update Booking
const updateBooking = async (req, res) => {
  const id = req.params.id;

  try {
    let booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Update fields
    booking.name = req.body.name || booking.name;
    booking.hotelName = req.body.hotel || booking.hotel;
    booking.roomNumber = req.body.roomNumber || booking.roomNumber;
    booking.checkInDate = req.body.checkInDate || booking.checkInDate;
    booking.checkOutDate = req.body.checkOutDate || booking.checkOutDate;
    booking.guests = req.body.guests || booking.guests;
    booking.status = req.body.status || booking.status;

    const updatedBooking = await booking.save();
    return res.status(200).json({ booking: updatedBooking });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to update booking" });
  }
};

// ✅ Delete Booking
const deleteBooking = async (req, res) => {
  const id = req.params.id;

  let booking;
  try {
    booking = await Booking.findByIdAndDelete(id);
  } catch (err) {
    console.error(err);
  }

  if (!booking) {
    return res.status(404).json({ message: "Unable to delete booking" });
  }

  return res.status(200).json({ message: "Booking deleted", booking });
};

exports.createBooking = createBooking;
exports.getAllBookings = getAllBookings;
exports.getBookingById = getBookingById;
exports.updateBooking = updateBooking;
exports.deleteBooking = deleteBooking;
