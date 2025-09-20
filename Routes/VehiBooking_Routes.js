const express = require("express");
const router = express.Router();

const VehiBookingController = require("../Controllers/VehiBooking_Controller");

router.get("/", VehiBookingController.getAllBookings);
router.post("/", VehiBookingController.addBooking);
router.get("/:id", VehiBookingController.getById);
router.put("/:id", VehiBookingController.updateBooking);
router.delete("/:id", VehiBookingController.deleteBooking);

module.exports = router;
