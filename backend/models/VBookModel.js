const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const vbookSchema = new Schema({

    Name: { 
        type: String,
        required: true
    },


    License: {   // License image(s)
        type: [String],
    },

    Sdate: {   // Start date
        type: Date,
        required: true
    },

    Edate: {   // End date
        type: Date,
        required: true
    },

    Rtime: {   // Return time
        type: String,
        required: true
    },

    Features: {   // Additional features
        type: String,
    },

    PaymentMethod: {   // Payment method (Cash/Online)
        type: String,
        enum: ['Cash', 'Online'],
        required: true,
        default: 'Cash'
    },

    PaymentStatus: {   // Payment status
        type: String,
        enum: ['Pending', 'Completed', 'Failed'],
        default: 'Pending'
    },

    PaymentGateway: {   // Payment gateway used (Stripe, PayPal, etc.)
        type: String,
        enum: ['Stripe', 'PayPal', 'Razorpay', 'None'],
        default: 'None'
    },

    TransactionId: {   // Transaction ID from payment gateway
        type: String,
    },

    Amount: {   // Booking amount
        type: Number,
        required: true
    }

}); 

module.exports = mongoose.model("VBookModel", vbookSchema);