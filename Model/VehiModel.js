const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const vehiSchema = new Schema({


    vehicleImage: { 

        type: [String],  
         },

    vehicleType: {   
        
         type: String, 
        required: true

     },
    vehicleName: { 
        
        type: String, 
        required: true

    },
    seat: { 

        type: Number, 
        required: true ,
        

    },

});


module.exports = mongoose.model("VehiModel",vehiSchema)