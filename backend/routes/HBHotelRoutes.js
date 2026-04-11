 const express = require("express");
 const router = express.Router();
 const multer = require("multer");


 // Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  }
});

// Use the storage configuration
const upload = multer({ storage: storage });


 //Insert Model
 const Hotel = require("../models/HBHotelModel") 

 //Insert Hotel Controller
 const HBHotelControllers = require("../controllers/HBHotelControllers");

 
 router.get("/", HBHotelControllers.getAllHotels);
//  router.post("/", upload.single("photos"), HotelControllers.addHotels);
 router.get("/:id", HBHotelControllers.getById);
router.put("/:id", upload.array("photos", 10), HBHotelControllers.updateHotel);
 router.delete("/:id", HBHotelControllers.deleteHotel);
 // Use multer for file upload
//router.post("/", upload.single("photos"), HotelControllers.addHotels);
router.post("/", upload.array("photos", 10), HBHotelControllers.addHotels);
 //export
 module.exports = router;