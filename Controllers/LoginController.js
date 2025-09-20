const Login = require("../Model/LoginModel");
const Register = require("../Model/RegisterModel");

// Helper function to validate email format
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// GET all logins (for testing/admin)
const getAllLogins = async (req, res, next) => {
    let logins;
    try {
        logins = await Login.find();
    } catch (err) {
        console.log(err);
    }

    if (!logins) {
        return res.status(500).json({ message: "Error fetching logins" });
    }

    return res.status(200).json({ logins });
};

// ADD login (create new login entry) with validation
const addLogin = async (req, res, next) => {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    if (!isValidEmail(email)) {
        return res.status(400).json({ message: "Invalid email format" });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    let existingUser;
    try {
        existingUser = await Login.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const login = new Login({ email, password });
        await login.save();

        return res.status(201).json({ message: "User registered successfully", login });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Error creating login" });
    }
};

// LOGIN authentication (email + password check) with basic validation
const loginUser = async (req, res, next) => {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
    }

    try {
        // Find user in registered users
        const registeredUser = await Register.findOne({ email });

        if (!registeredUser) {
            return res.status(404).json({ message: "User not registered" });
        }

        // Check password match
        if (registeredUser.password !== password) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        return res.status(200).json({
            message: "Login successful",
            user: {
                id: registeredUser._id,
                name: registeredUser.F_name,
                email: registeredUser.email
            }
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Error during login" });
    }
};


// Other CRUD operations remain unchanged
const getById = async (req, res, next) => {
    const id = req.params.id;
    let login;

    try {
        login = await Login.findById(id);
    } catch (err) {
        console.log(err);
    }

    if (!login) {
        return res.status(404).json({ message: "Login not found" });
    }

    return res.status(200).json({ login });
};

const updateLogin = async (req, res, next) => {
    const id = req.params.id;
    const { email, password } = req.body;

    let login;
    try {
        login = await Login.findByIdAndUpdate(
            id,
            { email, password },
            { new: true }
        );
    } catch (err) {
        console.log(err);
    }

    if (!login) {
        return res.status(404).json({ message: "Unable to update login details" });
    }

    return res.status(200).json({ login });
};

const deleteLogin = async (req, res, next) => {
    const id = req.params.id;

    let login;
    try {
        login = await Login.findByIdAndDelete(id);
    } catch (err) {
        console.log(err);
    }

    if (!login) {
        return res.status(404).json({ message: "Unable to delete login" });
    }

    return res.status(200).json({ login });
};

exports.getAllLogins = getAllLogins;
exports.addLogin = addLogin;
exports.getById = getById;
exports.updateLogin = updateLogin;
exports.deleteLogin = deleteLogin;
exports.loginUser = loginUser;
