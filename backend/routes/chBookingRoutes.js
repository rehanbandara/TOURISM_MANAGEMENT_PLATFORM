const express = require("express");
const router = express.Router();
const chBookingController = require("../controllers/chBookingController");

// Create a new booking
router.post("/create", chBookingController.createBooking);

// Get all bookings for a specific user
router.get("/user/:userId", chBookingController.getUserBookings);

// Get all bookings (admin)
router.get("/all", chBookingController.getAllBookings);

// Get single booking by ID
router.get("/:id", chBookingController.getBookingById);

// Generate PDF receipt
router.get("/:id/pdf", chBookingController.generatePDFReceipt);

// Send receipt via email
router.post("/:id/email", chBookingController.sendReceiptEmail);

// Update order status (admin)
router.put("/:id/status", chBookingController.updateOrderStatus);

// Generate comprehensive sales report PDF
router.get("/report/sales-pdf", chBookingController.generateSalesReport);

module.exports = router;

