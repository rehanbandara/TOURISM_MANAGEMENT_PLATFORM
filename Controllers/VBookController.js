const VBook = require("../Model/VBookModel");

/// Get all bookings
const getAllBookings = async (req, res) => {
  let bookings;

  try {
    bookings = await VBook.find();
  } catch (err) {
    console.log(err);
  }

  if (!bookings) {
    return res.status(500).json({ message: "Error fetching bookings" });
  }

  return res.status(200).json({ bookings });
};

/// Add new booking
const addBooking = async (req, res) => {
  const { Name, Sdate, Edate, Rtime, Features } = req.body;
  const License = req.file ? [req.file.path] : [];

  let booking;

  try {
    booking = new VBook({ Name, License, Sdate, Edate, Rtime, Features });
    await booking.save();
  } catch (err) {
    console.log(err);
  }

  if (!booking) {
    return res.status(404).json({ message: "Unable to add booking" });
  }

  return res.status(200).json({ booking });
};

/// Get booking by ID
const getById = async (req, res) => {
  const id = req.params.id;
  let booking;

  try {
    booking = await VBook.findById(id);
  } catch (err) {
    console.log(err);
  }

  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  return res.status(200).json({ booking });
};

/// Update booking
const updateBooking = async (req, res) => {
  const id = req.params.id;
  const { Name, Sdate, Edate, Rtime, Features } = req.body;
  const License = req.file ? [req.file.path] : undefined;

  let booking;

  try {
    booking = await VBook.findByIdAndUpdate(
      id,
      {
        ...(License && { License }), // update if new license image uploaded
        Name,
        Sdate,
        Edate,
        Rtime,
        Features,
      },
      { new: true }
    );
  } catch (err) {
    console.log(err);
  }

  if (!booking) {
    return res.status(404).json({ message: "Unable to update booking" });
  }

  return res.status(200).json({ booking });
};

/// Delete booking
const deleteBooking = async (req, res) => {
  const id = req.params.id;
  let booking;

  try {
    booking = await VBook.findByIdAndDelete(id);
  } catch (err) {
    console.log(err);
  }

  if (!booking) {
    return res.status(404).json({ message: "Unable to delete booking" });
  }

  return res.status(200).json({ booking });
};

// Export functions
exports.getAllBookings = getAllBookings;
exports.addBooking = addBooking;
exports.getById = getById;
exports.updateBooking = updateBooking;
exports.deleteBooking = deleteBooking;
