const express = require("express");
const router = express.Router();
const HBBookingControllers = require("../controllers/HBBookingControllers");



// CRUD Routes
router.post("/", HBBookingControllers.createBooking);
router.get("/", HBBookingControllers.getAllBookings);
router.get("/:id", HBBookingControllers.getBookingById);
router.put("/:id", HBBookingControllers.updateBooking);
router.delete("/:id", HBBookingControllers.deleteBooking);

module.exports = router;
 