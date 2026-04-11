const Staff = require("../models/staffModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

// Email setup
const from_email = "chamodabayawardana2003@gmail.com";
const App_pass = "cmnc amdw brhl vkzw";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: from_email, pass: App_pass },
});

// Temporary store for reset codes
let resetCodes = {};

// Add staff
exports.addStaff = async (req, res) => {
  try {
    const { username, name, email, password, type } = req.body;

    if (!username || !name || !email || !password || !type)
      return res.status(400).json({ message: "All fields are required" });

    const exists = await Staff.findOne({ email });
    if (exists) return res.status(400).json({ message: "Staff already exists" });

    const staff = new Staff({ username, name, email, password, type });
    await staff.save();
    res.status(201).json({ message: "Staff added successfully", staff });
  } catch (err) {
    console.error("❌ Error adding staff:", err.message);
    res.status(500).json({ message: "Failed to add staff" });
  }
};

// Get all staff
exports.getAllStaff = async (req, res) => {
  try {
    const staff = await Staff.find();
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch staff" });
  }
};

// Delete staff
exports.deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;
    await Staff.findByIdAndDelete(id);
    res.json({ message: "Staff deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete staff" });
  }
};



// ✅ Staff Login (Fixed)
exports.loginStaff = async (req, res) => {
  try {
    const { email, password, type } = req.body;

    if (!email || !password || !type)
      return res.status(400).json({ message: "All fields are required" });

    // Find staff by email + type
    const staff = await Staff.findOne({ email, type });
    if (!staff)
      return res.status(400).json({ message: "No staff found with this role" });

    // Compare password with hashed one
    const isMatch = await bcrypt.compare(password, staff.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    res.json({
      message: "Login successful",
      staff: {
        id: staff._id,
        username: staff.username,
        name: staff.name,
        type: staff.type,
        email: staff.email
      }
    });

  } catch (err) {
    console.error("❌ Error logging in staff:", err);
    res.status(500).json({ message: "Login failed" });
  }
};


// Send reset code
exports.sendResetCode = async (req, res) => {
  try {
    const { email } = req.body;
    const staff = await Staff.findOne({ email });
    if (!staff) return res.status(404).json({ message: "Staff not found" });

    const code = Math.floor(100000 + Math.random() * 900000);
    resetCodes[email] = code;

    await transporter.sendMail({
      from: from_email,
      to: email,
      subject: "Staff Password Reset Code",
      text: `Your reset code is: ${code}`,
    });

    res.json({ message: "Code sent successfully" });
  } catch (err) {
    console.error("❌ Error sending reset code:", err.message);
    res.status(500).json({ message: "Failed to send code" });
  }
};

// Verify reset code
exports.verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (resetCodes[email] && resetCodes[email] == code) {
      return res.json({ message: "Code verified" });
    }
    res.status(400).json({ message: "Invalid code" });
  } catch (err) {
    res.status(500).json({ message: "Verification failed" });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword)
      return res.status(400).json({ message: "Email and new password are required" });

    const staff = await Staff.findOne({ email });
    if (!staff) return res.status(404).json({ message: "Staff not found" });

    staff.password = newPassword; // assign plain password
    await staff.save(); // pre-save middleware hashes automatically

    delete resetCodes[email];

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("❌ Error changing staff password:", err.message);
    res.status(500).json({ message: "Failed to update password" });
  }
};

