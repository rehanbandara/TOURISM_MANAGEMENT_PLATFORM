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
    }

}); // auto adds createdAt & updatedAt

module.exports = mongoose.model("VBookModel", vbookSchema);
