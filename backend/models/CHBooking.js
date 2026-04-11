const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const chBookingSchema = new Schema(
  {
    // User Information
    userId: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    
    // Shipping/Billing Information
    fullName: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    
    // Product Information
    accessoryId: {
      type: Schema.Types.ObjectId,
      ref: "Accessory",
      required: true,
    },
    itemName: {
      type: String,
      required: true,
    },
    itemPrice: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
    },
    imagePath: {
      type: String,
    },
    
    // Payment Information
    totalAmount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "USD",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      default: "Stripe",
    },
    stripePaymentId: {
      type: String,
    },
    stripeSessionId: {
      type: String,
    },
    
    // Order Information
    orderStatus: {
      type: String,
      enum: ["processing", "shipped", "delivered", "cancelled"],
      default: "processing",
    },
    orderNumber: {
      type: String,
      unique: true,
    },
    
    // Additional Notes
    specialInstructions: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Generate unique order number before validation
chBookingSchema.pre("validate", function (next) {
  if (!this.orderNumber) {
    this.orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
  next();
});

module.exports = mongoose.model("CHBooking", chBookingSchema);

