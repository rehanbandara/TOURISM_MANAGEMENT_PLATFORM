const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

// Helper: generate JWT (requires JWT_SECRET in environment)
const generateToken = (user) => {
	if (!process.env.JWT_SECRET) {
		throw new Error('JWT_SECRET not configured');
	}
	return jwt.sign(
		{ id: user._id, role: user.role },
		process.env.JWT_SECRET,
		{ expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
	);
};

// Register / Create User
// Required fields: firstName, lastName, email, password
exports.registerUser = async (req, res, next) => {
	try {
		const { firstName, lastName, email, password, phone, dateOfBirth, gender, address, role } = req.body;

		if (!firstName || !lastName || !email || !password) {
			return res.status(400).json({ success: false, message: 'firstName, lastName, email and password are required.' });
		}

		const existing = await User.findOne({ email: email.toLowerCase() });
		if (existing) {
			return res.status(409).json({ success: false, message: 'Email already registered.' });
		}

		const user = new User({
			firstName,
			lastName,
			email: email.toLowerCase(),
			password, // Will be hashed by pre-save hook
			phone,
			dateOfBirth,
			gender,
			address,
			role // will default to 'user' if not provided
		});

		await user.save();

		const token = generateToken(user);
		return res.status(201).json({
			success: true,
			message: 'User registered successfully',
			data: user, // toJSON hook removes password
			token
		});
	} catch (err) {
		// Duplicate key safety (in case race condition)
		if (err.code === 11000) {
			return res.status(409).json({ success: false, message: 'Email already registered.' });
		}
		next(err);
	}
};

// Login User
exports.loginUser = async (req, res, next) => {
	try {
		const { email, password } = req.body;
		if (!email || !password) {
			return res.status(400).json({ success: false, message: 'Email and password are required.' });
		}

		const user = await User.findOne({ email: email.toLowerCase() });
		if (!user) {
			return res.status(401).json({ success: false, message: 'Invalid credentials.' });
		}

		if (!user.isActive) {
			return res.status(403).json({ success: false, message: 'Account is inactive.' });
		}

		const match = await user.comparePassword(password);
		if (!match) {
			return res.status(401).json({ success: false, message: 'Invalid credentials.' });
		}

		user.lastLogin = new Date();
		await user.save();

		const token = generateToken(user);
		return res.status(200).json({
			success: true,
			message: 'Login successful',
			data: user,
			token
		});
	} catch (err) {
		next(err);
	}
};

// Get current user profile via auth
exports.getProfile = async (req, res) => {
  return res.json({ success: true, data: req.user });
};