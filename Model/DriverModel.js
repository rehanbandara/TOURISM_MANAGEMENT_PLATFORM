const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const driverSchema = new Schema({
    fullname: {
        type: String,
        required: true
    },
    licence: {
        type: String,
    
    },
    dob: {
        type: Date,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    vehicle: {
        type: String,
    },
    vehiNumber: {
        type: String,
    },
    language: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("DriverModel", driverSchema);



