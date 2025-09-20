const mongoose = require("mongoose");
const Schema = mongoose.Schema;







const vehiBookingSchema = new Schema({
    Pic_Location: {
        type: String,
        required: true
    },
    Drop_Location: {
        type: String,
        required: true
    },
    Pic_Date: {
        type: Date,
        required: true
    },
    Drop_Date: {
        type: Date,
        required: true
    },
    Addi_Features: {
        type: String, // Example: "Child Seat, Wheelchair Ramp"
        default: ""
    },
    Driver_Language: {
        type: String,
        required: true
    },
    
} ,
{timestamps:true});






module.exports = mongoose.model("VehiBooking", vehiBookingSchema);









