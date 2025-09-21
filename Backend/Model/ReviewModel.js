const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true },
    hotel: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Hotel', 
        required: true },
    rating: { 
        type: Number, 
        required: true, 
        min: 1, 
        max: 5 },
    comment: String,
    isDeleted: { 
        type: Boolean, 
        default: false }
},
{ timestamps: true }
);

module.exports = mongoose.model(
    "ReviewModel", //file name
    reviewSchema //function name
)