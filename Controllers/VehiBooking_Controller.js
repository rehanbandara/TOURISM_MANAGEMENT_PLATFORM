const VehiBooking = require("../Model/VehiBooking_Model");

//GET all bookings
const getAllBookings = async (req, res, next) => {
    let bookings;
    try {
        bookings = await VehiBooking.find();
    } catch (err) {
        console.log(err);
    }

    if (!bookings) {
        return res.status(500).json({ message: "Error fetching bookings" });
    }

    return res.status(200).json({ bookings });
};






// ADD a booking
const addBooking = async (req, res, next) => {
    const { Pic_Location, Drop_Location, Pic_Date, Drop_Date, Addi_Features, Driver_Language } = req.body;

    let booking;
    try {
        booking = new VehiBooking({ Pic_Location, Drop_Location, Pic_Date, Drop_Date, Addi_Features, Driver_Language });
        await booking.save();
    } catch (err) {
        console.log(err);
    }

    if (!booking) {
        return res.status(404).json({ message: "Unable to add booking" });
    }

    return res.status(200).json({ booking });
};

// GET booking by ID
const getById = async (req, res, next) => {
    const id = req.params.id;
    let booking;

    try {
        booking = await VehiBooking.findById(id);
    } catch (err) {
        console.log(err);
    }

    if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
    }

    return res.status(200).json({ booking });
};

// UPDATE booking
const updateBooking = async (req, res, next) => {
    const id = req.params.id;
    const { Pic_Location, Drop_Location, Pic_Date, Drop_Date, Addi_Features, Driver_Language } = req.body;

    let booking;

    try {
        booking = await VehiBooking.findByIdAndUpdate(
            id,
            { Pic_Location, Drop_Location, Pic_Date, Drop_Date, Addi_Features, Driver_Language },
            { new: true }
        );
    } catch (err) {
        console.log(err);
    }

    if (!booking) {
        return res.status(404).json({ message: "Unable to update booking details" });
    }

    return res.status(200).json({ booking });
};

// DELETE booking
const deleteBooking = async (req, res, next) => {
    const id = req.params.id;

    let booking;
    try {
        booking = await VehiBooking.findByIdAndDelete(id);
    } catch (err) {
        console.log(err);
    }

    if (!booking) {
        return res.status(404).json({ message: "Unable to delete booking" });
    }

    return res.status(200).json({ booking });
};

exports.getAllBookings = getAllBookings;
exports.addBooking = addBooking;
exports.getById = getById;
exports.updateBooking = updateBooking;
exports.deleteBooking = deleteBooking;
