const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const accessorySchema = new Schema({

  itemName: String,

  smallIntro: String,

  description: String,

  price: Number,

  imagePaths: [String],

  availability: {

    type: String,
    enum: ["In Stock", "Out of Stock"],
    default: "In Stock",
  
  },
});

module.exports = mongoose.model(
  
  "Accessory", 
  accessorySchema
  
);
