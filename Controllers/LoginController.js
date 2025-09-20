const Login = require("../Model/LoginModel");
const Register = require("../Model/RegisterModel");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const SECRET_KEY = "mysecret"; //

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const user = await Register.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: "1h" });

    res.json({
      message: "Login successful",
      token,
      user: { id: user._id, fullname: user.fullname, email: user.email }
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};