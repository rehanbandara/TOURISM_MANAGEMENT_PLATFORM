const Booking = require("../models/HBBookingModel");
const Room = require("../models/HBRoomModel");

// Create Booking
const createBooking = async (req, res) => {
  try {
    const {
      userId,
      hotelId,
      name,
      email,
      phone,
      roomType,
      checkIn,
      checkOut,
      numberOfRooms,
      adults,
      children,
      additionalInfo,
      totalPrice,
      priceBreakdown,
      paymentMethod,
      status,
    } = req.body;

    // Validate required fields
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    if (!hotelId) {
      return res.status(400).json({ message: "Hotel ID is required" });
    }

    // Create booking
    const booking = new Booking({
      userId,
      hotelId,
      name,
      email,
      phone,
      roomType,
      checkIn: new Date(checkIn),
      checkOut: new Date(checkOut),
      numberOfRooms,
      adults,
      children,
      additionalInfo,
      totalPrice,
      priceBreakdown,
      paymentMethod: paymentMethod || 'debit_card',
      status: status || 'pending',
      paymentStatus: 'unpaid'
    });

    await booking.save();

    return res.status(201).json({ booking });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to create booking" });
  }
};

// Get all bookings (with optional filtering)
const getAllBookings = async (req, res) => {
  try {
    const { userId, hotelId } = req.query;
    
    let query = {};
    if (userId) {
      query.userId = userId;
    }
    if (hotelId) {
      query.hotelId = hotelId;
    }
    
    const bookings = await Booking.find(query).populate('hotelId').sort({ createdAt: -1 });
    // Return empty array instead of 404 when no bookings found
    return res.status(200).json({ bookings: bookings || [] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

// Get booking by ID
const getBookingById = async (req, res) => {
  const id = req.params.id;
  try {
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    return res.status(200).json({ booking });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error fetching booking" });
  }
};

// Update booking (e.g., status or details)
const updateBooking = async (req, res) => {
  const id = req.params.id;
  try {
    let booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Update only provided fields
    Object.keys(req.body).forEach((key) => {
      if (req.body[key] !== undefined) {
        booking[key] = req.body[key];
      }
    });

    const updatedBooking = await booking.save();
    return res.status(200).json({ booking: updatedBooking });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to update booking" });
  }
};

// Delete (Cancel) booking
const deleteBooking = async (req, res) => {
  const id = req.params.id;
  try {
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    await Booking.findByIdAndDelete(id);
    return res.status(200).json({ message: "Booking cancelled and deleted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to delete booking" });
  }
};

// Export all controller methods
exports.createBooking = createBooking;
exports.getAllBookings = getAllBookings;
exports.getBookingById = getBookingById;
exports.updateBooking = updateBooking;
exports.deleteBooking = deleteBooking;
