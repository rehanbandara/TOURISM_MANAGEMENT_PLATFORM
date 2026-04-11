const mongoose = require("mongoose");
const cabinClasses = ["Economy","Business","First"];

const FlightSchema = new mongoose.Schema({
    airlineCoverImage:{ type: String },
    departure: { type: String, required: true },
    destination:{ type: String, required: true },
    description:{ type: String },
    date:{ type: Date }
}, { timestamps: true });
const ClientVisitSchema = new mongoose.Schema({
    flight: { type: mongoose.Schema.Types.ObjectId, ref: "Flight", required: true },
    name:{ type: String, required: true },
    phone: { type: String },
    bookedAt:{ type: Date, default: Date.now },
    promoCode: { type: String },
    selectedDate:{ type: Date },
    cabinClass: { type: String },
    numberOfAdults: { type: Number },
    locale: { type: String },
    currency: { type: String }
});
const UserInfoSchema = new mongoose.Schema({
    name:{ type: String, required: true },
    phone:{ type: String, required: true },
    date:{ type: Date, default: Date.now }
});

const Flight = mongoose.model("Flight", FlightSchema);
const ClientVisit = mongoose.model("ClientVisit", ClientVisitSchema);
const UserInfo = mongoose.model("UserInfo", UserInfoSchema);
module.exports = { Flight, ClientVisit, cabinClasses, UserInfo };











