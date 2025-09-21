const express = require("express");
const router = express.Router();
const BookingControllers = require("../Controllers/BookingControllers");

// CRUD Routes
router.post("/", BookingControllers.createBooking);
router.get("/", BookingControllers.getAllBookings);
router.get("/:id", BookingControllers.getBookingById);
router.put("/:id", BookingControllers.updateBooking);
router.delete("/:id", BookingControllers.deleteBooking);

module.exports = router;
 