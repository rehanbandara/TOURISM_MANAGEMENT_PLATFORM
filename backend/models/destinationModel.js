const mongoose = require("mongoose");

const destinationSchema = new mongoose.Schema(
  {

    name: {
      type: String,
      required: true,
      trim: true,
    },

  
    location: {
      type: String,
      required: true,
      trim: true,
    },

   
    description: {
      type: String,
      trim: true,
    },

    images: [
      {
        type: String,
      },
    ],


    entryFee: {
      type: Number,
      default: 0, 
    },

    bestTimeToVisit: {
      type: String,
      trim: true,
    },

  
    activities: [
      {
        type: String,
        trim: true,
      },
    ],


    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
  },
  {
    timestamps: true, 
  }
);
module.exports = mongoose.model("Destination", destinationSchema);
