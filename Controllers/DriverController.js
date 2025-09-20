const Driver = require("../Model/DriverModel");

// GET all drivers
const getAllDrivers = async (req, res, next) => {
    let drivers;
    try {
        drivers = await Driver.find();
    } catch (err) {
        console.log(err);
    }

    if (!drivers) {
        return res.status(500).json({ message: "Error fetching drivers" });
    }

    return res.status(200).json({ drivers });
};

// ADD a driver
const addDriver = async (req, res, next) => {
    const { fullname, licence, dob, phone, email, vehicle, vehiNumber, language } = req.body;

    let driver;
    try {
        driver = new Driver({ fullname, licence, dob, phone, email, vehicle, vehiNumber, language });
        await driver.save();
    } catch (err) {
        console.log(err);
    }

    if (!driver) {
        return res.status(404).json({ message: "Unable to add driver" });
    }

    return res.status(200).json({ driver });
};

// GET driver by ID
const getById = async (req, res, next) => {
    const id = req.params.id;
    let driver;

    try {
        driver = await Driver.findById(id);
    } catch (err) {
        console.log(err);
    }

    if (!driver) {
        return res.status(404).json({ message: "Driver not found" });
    }

    return res.status(200).json({ driver });
};

// UPDATE driver
const updateDriver = async (req, res, next) => {
    const id = req.params.id;
    const { fullname, licence, dob, phone, email, vehicle, vehiNumber, language } = req.body;

    let driver;

    try {
        driver = await Driver.findByIdAndUpdate(
            id,
            { fullname, licence, dob, phone, email, vehicle, vehiNumber, language },
            { new: true }
        );
    } catch (err) {
        console.log(err);
    }

    if (!driver) {
        return res.status(404).json({ message: "Unable to update driver details" });
    }

    return res.status(200).json({ driver });
};

// DELETE driver
const deleteDriver = async (req, res, next) => {
    const id = req.params.id;

    let driver;
    try {
        driver = await Driver.findByIdAndDelete(id);
    } catch (err) {
        console.log(err);
    }

    if (!driver) {
        return res.status(404).json({ message: "Unable to delete driver" });
    }

    return res.status(200).json({ driver });
};

exports.getAllDrivers = getAllDrivers;
exports.addDriver = addDriver;
exports.getById = getById;
exports.updateDriver = updateDriver;
exports.deleteDriver = deleteDriver;
