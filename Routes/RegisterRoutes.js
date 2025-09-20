const express = require("express");
const router = express.Router();

const RegisterController = require("../Controllers/RegisterController");

router.get("/", RegisterController.getAllRegisters);
router.post("/", RegisterController.addRegister);
router.get("/:id", RegisterController.getById);
router.put("/:id", RegisterController.updateRegister);
router.delete("/:id", RegisterController.deleteRegister);

module.exports = router;
