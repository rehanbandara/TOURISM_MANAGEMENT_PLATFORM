const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    clientName: {
        type: String,
        required: true,
    },
    clientEmail: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    // Support for both activities and destinations
    activity: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AdventureActivity",
        required: function() {
            return !this.destination;
        },
    },
    destination: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Destination",
        required: function() {
            return !this.activity;
        },
    },
    // Type field to distinguish between activity and destination reviews
    reviewType: {
        type: String,
        enum: ['activity', 'destination'],
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    comment: {
        type: String,
        trim: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

// Index for efficient queries
reviewSchema.index({ activity: 1 });
reviewSchema.index({ destination: 1 });
reviewSchema.index({ reviewType: 1 });
reviewSchema.index({ createdAt: -1 });

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;