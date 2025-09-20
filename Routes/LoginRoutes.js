const express = require("express");
const router = express.Router();

const LoginController = require("../Controllers/LoginController");

// router.get("/", LoginController.getAllLogins);
router.post("/", LoginController.loginUser);
// router.get("/:id", LoginController.getById);
// router.put("/:id", LoginController.updateLogin);
// router.delete("/:id", LoginController.deleteLogin);

// // login route
// router.post("/auth", LoginController.loginUser);

module.exports = router;
