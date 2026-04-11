

const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");



// Insert Controllers
const HBRoomControllers = require("../controllers/HBRoomControllers");

// Configure Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // folder to save uploaded images
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // e.g., 1234567890.jpg
  }
});

const upload = multer({ storage: storage });

// Routes
router.get("/", HBRoomControllers.getAllRooms);
router.get("/hotel/:hotelId", HBRoomControllers.getRoomsByHotel);
router.get("/:id", HBRoomControllers.getById);

// Use multer middleware for file upload
router.post("/", upload.array("photos", 10), HBRoomControllers.addRoom);
router.put("/:id", upload.array("photos", 10), HBRoomControllers.updateRoom);


router.delete("/:id", HBRoomControllers.deleteRoom);

module.exports = router;