const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const adventureActivitySchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    durationHours: {
        type: Number,
        required: true,
        min: 1
    },
    difficulty: {
        type: String,
        enum: ["Easy", "Medium", "Hard"]
    },
    images: [
        {
            type: String,
        }
    ],
    rating: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

const AdventureActivity = mongoose.model("AdventureActivity", adventureActivitySchema);
module.exports = AdventureActivity;