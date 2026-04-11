const express = require("express");
const router = express.Router();
const staffController = require("../controllers/staffController");

// Staff management
router.post("/add", staffController.addStaff);
router.get("/", staffController.getAllStaff);
router.delete("/:id", staffController.deleteStaff);

// Staff authentication & password reset
router.post("/login", staffController.loginStaff);
router.post("/send-code", staffController.sendResetCode);
router.post("/verify-code", staffController.verifyResetCode);
router.post("/change-password", staffController.changePassword);

module.exports = router;
