// models/RegisterModel.js
const mongoose = require("mongoose");

const RegisterSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  comPassword: { type: String, required: true }  // confirm password (not recommended to store)
});

module.exports = mongoose.model("Register", RegisterSchema);
