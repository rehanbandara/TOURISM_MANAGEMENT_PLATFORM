const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const registerSchema = new Schema({
    F_name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true // email should be unique
    },
    password: {
        type: String,
        required: true
    },
    ComPassword: {
        type: String,
        required: true
    }
}

);

module.exports = mongoose.model("RegisterModel", registerSchema);
