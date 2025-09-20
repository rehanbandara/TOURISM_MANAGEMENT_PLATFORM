const express = require("express");
const router = express.Router();
const multer = require("multer");


const Vehicle = require("../Model/VehiModel");

const VehiController = require("../Controllers/VehiController");

const path = require("path");



// Storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // files will be saved in "uploads" folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // unique name
  },
});

const upload = multer({ storage: storage });






router.get("/",VehiController.getAllVehicles);

//router.post("/",VehiController.addVehicles);

router.post("/", upload.single("vehicleImage"), VehiController.addVehicles);


router.get("/:id",VehiController.getById);

//router.put("/:id",VehiController.updateVehicle);

router.put("/:id", upload.single("vehicleImage"), VehiController.updateVehicle);


router.delete("/:id",VehiController.deleteVehicle);








module.exports = router;
