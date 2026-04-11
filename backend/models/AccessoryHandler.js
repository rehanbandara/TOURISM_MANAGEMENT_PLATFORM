const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AccessoryHandlerSchema = new Schema({

    f_name:{
        type:String,
        required:true,
    },
    l_name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true,
        minlength:6,
    },
    phoneNo:{
        type:String,
        required:true,
    },
});

module.exports = mongoose.model(
    "AccessoryHandler",  
    AccessoryHandlerSchema 
)

