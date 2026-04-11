// const mongoose = require("mongoose");
// const bcrypt = require("bcrypt");

// const staffSchema = new mongoose.Schema({
//   username: { type: String, required: true, unique: true },
//   name: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   type: {
//     type: String,
//     enum: [
//       "Administer",
//       "Hotel Owner",
//       "Accessory Handler",
//       "Flight Manager",
//       "Transport Manager",
//       "Driver",
//     ],
//     required: true,
//   },
//   createdAt: { type: Date, default: Date.now },
// });

// // ✅ Hash password before saving
// staffSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   this.password = await bcrypt.hash(this.password, 10);
//   next();
// });

// module.exports = mongoose.model("Staff", staffSchema);


const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const staffSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  type: {
    type: String,
    enum: [
      "Administer",
      "Hotel Owner",
      "Accessory Handler",
      "Flight Manager",
      "Transport Manager",
      "Driver",
    ],
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

// Hash password before saving
staffSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model("Staff", staffSchema);
