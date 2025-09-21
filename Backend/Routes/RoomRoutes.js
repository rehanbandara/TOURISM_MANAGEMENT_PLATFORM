//  const express = require("express");
//  const router = express.Router();

//  //Insert Model
//  const Room = require("../Model/RoomModel") 

//  //Insert Hotel Controller
//  const RoomControllers = require("../Controllers/RoomControllers");

//  router.get("/", RoomControllers.getAllRooms);
//  router.post("/", RoomControllers.addRooms);
//  router.get("/:id", RoomControllers.getById);
//  router.put("/:id", RoomControllers.updateRoom);
//  router.delete("/:id", RoomControllers.deleteRoom);

//  //export
//  module.exports = router;

const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");



// Insert Controllers
const RoomControllers = require("../Controllers/RoomControllers");

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
router.get("/", RoomControllers.getAllRooms);
router.get("/:id", RoomControllers.getById);

// Use multer middleware for file upload
router.post("/", upload.array("photos", 10), RoomControllers.addRooms);
router.put("/:id", upload.array("photos", 10), RoomControllers.updateRoom);

router.delete("/:id", RoomControllers.deleteRoom);

module.exports = router;