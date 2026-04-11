const express = require("express");
const router = express.Router();
const chStripeController = require("../controllers/chStripeController");

// Test endpoint to verify Stripe is working
router.get("/test", (req, res) => {
  const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
  res.json({
    message: "Stripe routes are working!",
    stripeKeyLoaded: !!process.env.STRIPE_SECRET_KEY,
    stripeKeyPrefix: process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.substring(0, 7) : "Not loaded"
  });
});

// Create Stripe checkout session
router.post("/create-checkout-session", chStripeController.createCheckoutSession);

// Verify payment
router.get("/verify-payment/:sessionId", chStripeController.verifyPayment);

// Stripe webhook (for production)
router.post("/webhook", express.raw({ type: "application/json" }), chStripeController.stripeWebhook);

module.exports = router;

