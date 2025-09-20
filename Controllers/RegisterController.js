const Register = require("../Model/RegisterModel");
const bcrypt = require("bcryptjs");


exports.registerUser = async (req, res) => {
  try {
    const { fullname, email, password, comPassword } = req.body;

    if (!fullname || !email || !password || !comPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== comPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const existUser = await Register.findOne({ email });
    if (existUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new Register({
      fullname,
      email,
      password: hashedPassword,
      comPassword: hashedPassword // storing hashed confirm password
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
