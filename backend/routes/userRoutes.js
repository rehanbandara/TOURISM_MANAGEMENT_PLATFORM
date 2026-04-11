// const express = require("express");
// const { registerUser, verifyEmail, resendVerificationCode } = require("../Controllers/userControllers");
// const router = express.Router();

// router.post("/register", registerUser);
// router.post("/verify", verifyEmail);
// router.post("/resend-code", resendVerificationCode);

// module.exports = router;

const express = require("express");
const { registerUser, verifyEmail, resendVerificationCode, loginUser, getAllUsers  } = require("../controllers/userControllers");
const { sendResetCode, verifyResetCode, changePassword } = require("../controllers/userControllers");
const router = express.Router();

router.post("/register", registerUser);
router.post("/verify", verifyEmail);
router.post("/resend-code", resendVerificationCode);
router.post("/login", loginUser);
router.post("/send-code", sendResetCode);
router.post("/verify-code", verifyResetCode);
router.post("/change-password", changePassword);

// Admin route to get all users
router.get("/all", getAllUsers);


module.exports = router;
