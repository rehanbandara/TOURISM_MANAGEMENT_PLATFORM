const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const VBookController = require("../Controllers/VBookController");

// Storage engine for license image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // save files in uploads folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // unique name
  },
});

const upload = multer({ storage: storage });

// Routes
router.get("/", VBookController.getAllBookings);

// Insert booking with license image
router.post("/", upload.single("License"), VBookController.addBooking);

// Get booking by ID
router.get("/:id", VBookController.getById);

// Update booking (with optional new license image)
router.put("/:id", upload.single("License"), VBookController.updateBooking);

// Delete booking
router.delete("/:id", VBookController.deleteBooking);

module.exports = router;
