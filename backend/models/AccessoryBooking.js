const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AccessoryBookingSchema = new Schema({

    quantity:{
        type:String,
        required:true,
    },
    price:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
    },
    buyerEmail:{
        type:String,
        required:true,
    },
    phoneNo:{
        type:String,
        required:true,
    },
});

module.exports = mongoose.model(
    "AccessoryBooking",  
    AccessoryBookingSchema 
)

