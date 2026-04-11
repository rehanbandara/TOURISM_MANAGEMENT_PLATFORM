
// const User = require("../Model/userModel");
// const nodemailer = require("nodemailer");
// const bcrypt = require("bcrypt");


// const from_email = 'chamodabayawardana2003@gmail.com';
// const App_pass = 'cmnc amdw brhl vkzw';

// const transporter = nodemailer.createTransport({
// service: 'gmail',
// auth:
// {
// user:from_email,
// pass: App_pass
// }
// });



// exports.registerUser = async (req, res) => {
//   try {
//     const { f_name, l_name, username, email, password, phone } = req.body;

//     console.log("📥 Register request received:", req.body);

//     // hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

//     const newUser = new User({
//       f_name,
//       l_name,
//       username,
//       email,
//       password: hashedPassword,
//       phone,
//       verificationCode,
//       verificationCodeExpires: Date.now() + 5 * 60 * 1000
//     });

//     await newUser.save();
//     console.log("✅ User saved to DB");

//     const mailInfo = await transporter.sendMail({
//       //from: '"Registration System" <no-reply@example.com>',
//       from: from_email,
//       to: email,
//       subject: "Verify your email",
//       text: `Your verification code is ${verificationCode}`
//     });

//     console.log("📧 Verification email sent!");
//     console.log("🔗 Preview URL:", nodemailer.getTestMessageUrl(mailInfo));

//     res.status(201).json({ message: "User registered. Check console for email preview URL." });

//   } catch (err) {
//     console.error("❌ Error in registerUser:", err.message);
//     res.status(400).json({ message: err.message });
//   }
// };

// exports.verifyEmail = async (req, res) => {
//   try {
//     const { email, code } = req.body;
//     console.log("📥 Verify request for:", email, "Code:", code);

//     const user = await User.findOne({ email });

//     if (!user) return res.status(404).json({ message: "User not found" });
//     if (user.isVerified) return res.status(400).json({ message: "User already verified" });

//     if (user.verificationCode !== code || user.verificationCodeExpires < Date.now()) {
//       return res.status(400).json({ message: "Invalid or expired code" });
//     }

//     user.isVerified = true;
//     user.verificationCode = undefined;
//     user.verificationCodeExpires = undefined;
//     await user.save();

//     console.log("✅ Email verified successfully");
//     res.json({ message: "Email verified successfully" });

//   } catch (err) {
//     console.error("❌ Error in verifyEmail:", err.message);
//     res.status(400).json({ message: err.message });
//   }
// };

// exports.resendVerificationCode = async (req, res) => {
//   try {
//     const { email } = req.body;
//     console.log("📥 Resend code request for:", email);

//     const user = await User.findOne({ email });
//     if (!user) return res.status(404).json({ message: "User not found" });

//     const newCode = Math.floor(100000 + Math.random() * 900000).toString();
//     user.verificationCode = newCode;
//     user.verificationCodeExpires = Date.now() + 5 * 60 * 1000;
//     await user.save();

//     const mailInfo = await transporter.sendMail({
//       from: '"Registration System" <no-reply@example.com>',
//       to: email,
//       subject: "New Verification Code",
//       text: `Your new verification code is ${newCode}`
//     });

//     console.log("📧 New verification email sent!");
//     console.log("🔗 Preview URL:", nodemailer.getTestMessageUrl(mailInfo));

//     res.json({ message: "New code sent. Check console for preview URL." });

//   } catch (err) {
//     console.error("❌ Error in resendVerificationCode:", err.message);
//     res.status(400).json({ message: err.message });
//   }
// };


// // ✅ New login function
// exports.loginUser = async (req, res) => {
//   try {

    
//     const { email, password } = req.body;

//     if (!email || !password) return res.status(400).json({ message: "Please enter email and password" });

//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ message: "Wrong username or password" });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(400).json({ message: "Wrong username or password" });

//     //if (!user.isVerified) return res.status(400).json({ message: "Please verify your email first" });

//     res.json({ message: "Login successful", user: { f_name: user.f_name, l_name: user.l_name, email: user.email } });

//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };



// let resetCodes = {}; // Temporary in-memory store for reset codes

// // 📩 Send Reset Code
// exports.sendResetCode = async (req, res) => {
//   try {

//     const { email } = req.body;
//     const user = await User.findOne({ email });

//     if (!user) return res.status(404).json({ message: "User not found" });

//     const code = Math.floor(100000 + Math.random() * 900000); // 6-digit code
//     resetCodes[email] = code;

//     // ✅ Send email
//     const transporter = nodemailer.createTransport({
//         service: 'gmail',
//         auth:
//         {
//         user:from_email,
//         pass: App_pass
//         }
//       });

//     const mailOptions = {
//       from: from_email,
//       to: email,
//       subject: "Password Reset Code",
//       text: `Your password reset code is: ${code}`,
//     };

//     const info = await transporter.sendMail(mailOptions);
//     console.log("Preview URL: " + nodemailer.getTestMessageUrl(info));

//     res.json({ message: "Code sent successfully" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Failed to send code" });
//   }
// };

// // ✅ Verify Reset Code
// exports.verifyResetCode = async (req, res) => {
//   try {
//     const { email, code } = req.body;
//     if (resetCodes[email] && resetCodes[email] == code) {
//       return res.json({ message: "Code verified" });
//     }
//     res.status(400).json({ message: "Invalid code" });
//   } catch (err) {
//     res.status(500).json({ message: "Verification failed" });
//   }
// };

// // ✅ Change Password
// exports.changePassword = async (req, res) => {
//   try {
//     const { email, newPassword } = req.body;
//     const user = await User.findOne({ email });

//     if (!user) return res.status(404).json({ message: "User not found" });

//     user.password = newPassword; // ⚠️ Make sure you hash it if hashing is used in register/login
//     await user.save();

//     delete resetCodes[email];

//     res.json({ message: "Password updated successfully" });
//   } catch (err) {
//     res.status(500).json({ message: "Failed to update password" });
//   }
// };


const User = require("../models/userModel");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");

const from_email = 'chamodabayawardana2003@gmail.com';
const App_pass = 'cmnc amdw brhl vkzw';

// Nodemailer transporter (for Gmail)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: from_email,
    pass: App_pass
  }
});

let resetCodes = {}; // In-memory store for password reset codes

// ✅ Register User
exports.registerUser = async (req, res) => {
  try {
    const { f_name, l_name, username, email, password, phone } = req.body;

    // ✅ No need to hash manually - the model's pre-save middleware will do it
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const newUser = new User({
      f_name,
      l_name,
      username,
      email,
      password: password,
      phone,
      verificationCode,
      verificationCodeExpires: Date.now() + 5 * 60 * 1000
    });

    await newUser.save();

    const mailInfo = await transporter.sendMail({
      from: from_email,
      to: email,
      subject: "Verify your email",
      text: `Your verification code is ${verificationCode}`
    });

    console.log("📧 Verification email sent!");
    console.log("🔗 Preview URL:", nodemailer.getTestMessageUrl(mailInfo));

    res.status(201).json({ message: "User registered. Check console for email preview URL." });

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ✅ Verify Email
exports.verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isVerified) return res.status(400).json({ message: "User already verified" });

    if (user.verificationCode !== code || user.verificationCodeExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    res.json({ message: "Email verified successfully" });

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ✅ Resend Verification Code
exports.resendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationCode = newCode;
    user.verificationCodeExpires = Date.now() + 5 * 60 * 1000;
    await user.save();

    const mailInfo = await transporter.sendMail({
      from: from_email,
      to: email,
      subject: "New Verification Code",
      text: `Your new verification code is ${newCode}`
    });

    console.log("📧 New verification email sent!");
    console.log("🔗 Preview URL:", nodemailer.getTestMessageUrl(mailInfo));

    res.json({ message: "New code sent. Check console for preview URL." });

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ✅ Login User
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Please enter email and password" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Wrong username or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Wrong username or password" });

    res.json({
      message: "Login successful",
      user: { 
        _id: user._id, // Include user ID for bookings
        f_name: user.f_name, 
        l_name: user.l_name, 
        email: user.email, 
        username: user.username,
        type: user.type || "student", // Include user type with default
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        address: user.address,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Send Reset Code
exports.sendResetCode = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    const code = Math.floor(100000 + Math.random() * 900000); // 6-digit code
    resetCodes[email] = code;

    const mailOptions = {
      from: from_email,
      to: email,
      subject: "Password Reset Code",
      text: `Your password reset code is: ${code}`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("📧 Password reset code sent:", code);
    console.log("🔗 Preview URL: " + nodemailer.getTestMessageUrl(info));

    res.json({ message: "Code sent successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to send code" });
  }
};

// ✅ Verify Reset Code
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

// ✅ Change Password (FIXED ✅ - pre-save middleware handles hashing)
exports.changePassword = async (req, res) => {
  try {
    const { email, password } = req.body; // ✅ match frontend key
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // ✅ No need to hash manually - the model's pre-save middleware will do it
    user.password = password;

    await user.save();
    delete resetCodes[email];

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("❌ Error in changePassword:", err.message);
    res.status(500).json({ message: "Failed to update password" });
  }
};

// ✅ Get All Users (for Admin)
exports.getAllUsers = async (req, res) => {
  try {
    // Fetch all users, excluding password field
    const users = await User.find({}, '-password -verificationCode -verificationCodeExpires')
      .sort({ createdAt: -1 }); // Sort by newest first
    
    console.log(`✅ Fetched ${users.length} users for admin`);
    res.json(users);
  } catch (err) {
    console.error("❌ Error fetching users:", err.message);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};