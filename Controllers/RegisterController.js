const Register = require("../Model/RegisterModel");

// GET all registered users
const getAllRegisters = async (req, res, next) => {
    let registers;
    try {
        registers = await Register.find();
    } catch (err) {
        console.log(err);
    }

    if (!registers) {
        return res.status(500).json({ message: "Error fetching registered users" });
    }

    return res.status(200).json({ registers });
};

// ADD a new user
const addRegister = async (req, res, next) => {
    const { F_name, email, password, ComPassword } = req.body;

    // simple password confirmation check
    if (password !== ComPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
    }

    let register;
    try {
        register = new Register({ F_name, email, password, ComPassword });
        await register.save();
    } catch (err) {
        console.log(err);
    }

    if (!register) {
        return res.status(404).json({ message: "Unable to register user" });
    }

    return res.status(200).json({ register });
};

// GET user by ID
const getById = async (req, res, next) => {
    const id = req.params.id;
    let register;

    try {
        register = await Register.findById(id);
    } catch (err) {
        console.log(err);
    }

    if (!register) {
        return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ register });
};

// UPDATE user details
const updateRegister = async (req, res, next) => {
    const id = req.params.id;
    const { F_name, email, password, ComPassword } = req.body;

    let register;

    try {
        register = await Register.findByIdAndUpdate(
            id,
            { F_name, email, password, ComPassword },
            { new: true }
        );
    } catch (err) {
        console.log(err);
    }

    if (!register) {
        return res.status(404).json({ message: "Unable to update user details" });
    }

    return res.status(200).json({ register });
};

// DELETE user
const deleteRegister = async (req, res, next) => {
    const id = req.params.id;

    let register;
    try {
        register = await Register.findByIdAndDelete(id);
    } catch (err) {
        console.log(err);
    }

    if (!register) {
        return res.status(404).json({ message: "Unable to delete user" });
    }

    return res.status(200).json({ register });
};

exports.getAllRegisters = getAllRegisters;
exports.addRegister = addRegister;
exports.getById = getById;
exports.updateRegister = updateRegister;
exports.deleteRegister = deleteRegister;