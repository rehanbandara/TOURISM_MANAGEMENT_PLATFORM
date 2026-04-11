const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY || "sk_test_your_stripe_secret_key");

// Create Stripe Checkout Session
exports.createCheckoutSession = async (req, res) => {
  try {
    const {
      itemName,
      itemPrice,
      quantity,
      currency,
      userId,
      userEmail,
      fullName,
      phoneNumber,
      address,
      accessoryId,
      imagePath,
      specialInstructions,
    } = req.body;

    const totalAmount = itemPrice * quantity;

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: itemName,
              description: `Purchase of ${quantity} x ${itemName}`,
            },
            unit_amount: Math.round(itemPrice * 100), // Stripe expects amount in cents
          },
          quantity: quantity,
        },
      ],
      mode: "payment",
      success_url: `${process.env.CLIENT_URL || "http://localhost:3000"}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL || "http://localhost:3000"}/payment-cancelled`,
      customer_email: userEmail,
      metadata: {
        userId,
        userEmail,
        fullName,
        phoneNumber,
        addressStreet: address.street,
        addressCity: address.city,
        addressState: address.state,
        addressZipCode: address.zipCode,
        addressCountry: address.country,
        accessoryId,
        itemName,
        itemPrice: itemPrice.toString(),
        quantity: quantity.toString(),
        imagePath: imagePath || "",
        specialInstructions: specialInstructions || "",
      },
    });

    res.status(200).json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("Stripe error:", error);
    res.status(500).json({
      message: "Failed to create checkout session",
      error: error.message,
    });
  }
};

// Verify payment and get session details
exports.verifyPayment = async (req, res) => {
  try {
    const { sessionId } = req.params;

    console.log("🔍 Verifying payment for session:", sessionId);
    console.log("🔑 Using Stripe key:", process.env.STRIPE_SECRET_KEY ? "✅ Loaded" : "❌ Missing");

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    console.log("💳 Stripe session status:", session.payment_status);
    console.log("📦 Session metadata:", session.metadata);

    if (session.payment_status === "paid") {
      console.log("✅ Payment verified successfully!");
      res.status(200).json({
        success: true,
        session: session,
        metadata: session.metadata,
      });
    } else {
      console.log("❌ Payment not completed. Status:", session.payment_status);
      res.status(400).json({
        success: false,
        message: `Payment not completed. Status: ${session.payment_status}`,
        paymentStatus: session.payment_status,
      });
    }
  } catch (error) {
    console.error("❌ Error verifying payment:", error);
    console.error("Error details:", error.message);
    console.error("Error type:", error.type);
    res.status(500).json({
      message: "Failed to verify payment",
      error: error.message,
      errorType: error.type,
    });
  }
};

// Webhook handler for Stripe events (optional but recommended for production)
exports.stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object;
      console.log("Payment succeeded:", session.id);
      // Here you could automatically create the booking in your database
      break;

    case "payment_intent.payment_failed":
      const paymentIntent = event.data.object;
      console.log("Payment failed:", paymentIntent.id);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};

