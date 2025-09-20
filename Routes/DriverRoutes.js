const express = require("express");
const router = express.Router();

const DriverController = require("../Controllers/DriverController");

router.get("/", DriverController.getAllDrivers);
router.post("/", DriverController.addDriver);
router.get("/:id", DriverController.getById);
router.put("/:id", DriverController.updateDriver);
router.delete("/:id", DriverController.deleteDriver);

module.exports = router;
