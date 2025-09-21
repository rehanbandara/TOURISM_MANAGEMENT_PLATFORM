 const express = require("express");
 const router = express.Router();
 const multer = require("multer");


 // Configure multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  }
})

// Configure multer
const upload = multer({ dest: "uploads/" });


 //Insert Model
 const Hotel = require("../Model/HotelModel") 

 //Insert Hotel Controller
 const HotelControllers = require("../Controllers/HotelControllers");

 router.get("/", HotelControllers.getAllHotels);
//  router.post("/", upload.single("photos"), HotelControllers.addHotels);
 router.get("/:id", HotelControllers.getById);
router.put("/:id", upload.array("photos", 10), HotelControllers.updateHotel);
 router.delete("/:id", HotelControllers.deleteHotel);
 // Use multer for file upload
//router.post("/", upload.single("photos"), HotelControllers.addHotels);
router.post("/", upload.array("photos", 10), HotelControllers.addHotels);
 //export
 module.exports = router;