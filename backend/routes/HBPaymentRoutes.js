const express = require("express");
const router = express.Router();
const PDFDocument = require("pdfkit");
const nodemailer = require("nodemailer");

// Lazy require to avoid crashing if key not set at import time
const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Missing STRIPE_SECRET_KEY env variable");
  }
  return require("stripe")(process.env.STRIPE_SECRET_KEY);
};

// Create PaymentIntent for a booking
router.post("/create-intent", async (req, res) => {
  try {
    const { amount, currency = "lkr", metadata = {} } = req.body;

    console.log("Creating payment intent with:", { amount, currency, metadata });

    if (!amount || amount <= 0) {
      console.error("Invalid amount:", amount);
      return res.status(400).json({ message: "Invalid amount" });
    }

    // Stripe uses ISO currency codes; LKR is supported
    console.log("Getting Stripe instance...");
    const stripe = getStripe();
    console.log("Stripe instance created");

    console.log("Creating PaymentIntent...");
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency: currency.toLowerCase(),
      automatic_payment_methods: { enabled: true },
      metadata,
    });

    console.log("PaymentIntent created successfully:", paymentIntent.id);
    return res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("Stripe create-intent error:", err.message);
    console.error("Full error:", err);
    return res.status(500).json({ 
      message: "Failed to create payment intent",
      error: err.message,
      type: err.type
    });
  }
});

module.exports = router;

// Generate PDF receipt and email it
router.post("/receipt", async (req, res) => {
  try {
    const { booking, payment, toEmail } = req.body || {};

    if (!booking || !payment || !toEmail) {
      return res.status(400).json({ message: "Missing booking, payment, or toEmail" });
    }

    const chunks = [];
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    doc.on("data", (d) => chunks.push(d));
    doc.on("error", (err) => {
      console.error("PDF error", err);
    });

    // Header
    doc
      .fontSize(20)
      .text("Hotel Booking - Payment Receipt", { align: "center" })
      .moveDown(0.5);

    // Receipt meta
    doc
      .fontSize(10)
      .text(`Receipt ID: ${payment.transactionId}`)
      .text(`Date: ${new Date().toLocaleString()}`)
      .moveDown();

    // Customer & Booking details
    doc
      .fontSize(12)
      .text("Customer Details", { underline: true })
      .moveDown(0.3)
      .fontSize(10)
      .text(`Name: ${booking.name}`)
      .text(`Email: ${booking.email}`)
      .text(`Phone: ${booking.phone}`)
      .moveDown()
      .fontSize(12)
      .text("Booking Details", { underline: true })
      .moveDown(0.3)
      .fontSize(10)
      .text(`Booking ID: ${booking.id || booking._id || "-"}`)
      .text(`Room Type: ${booking.roomType}`)
      .text(`Check-In: ${new Date(booking.checkIn).toLocaleDateString()}`)
      .text(`Check-Out: ${new Date(booking.checkOut).toLocaleDateString()}`)
      .text(`Rooms: ${booking.numberOfRooms}`)
      .text(`Guests: ${booking.adults} adults${booking.children ? ", " + booking.children + " children" : ""}`)
      .moveDown();

    // Price breakdown if provided
    if (booking.priceBreakdown) {
      const pb = booking.priceBreakdown;
      doc
        .fontSize(12)
        .text("Price Breakdown", { underline: true })
        .moveDown(0.3)
        .fontSize(10)
        .text(`Room Rate: LKR ${Number(pb.pricePerNight || 0).toLocaleString()}`)
        .text(`Nights: ${pb.numberOfNights || 0}`)
        .text(`Subtotal: LKR ${Number(pb.subtotal || 0).toFixed(2)}`)
        .text(`Tax (12%): LKR ${Number(pb.tax || 0).toFixed(2)}`)
        .text(`Service Fee (5%): LKR ${Number(pb.serviceFee || 0).toFixed(2)}`)
        .moveDown();
    }

    // Payment details
    doc
      .fontSize(12)
      .text("Payment Details", { underline: true })
      .moveDown(0.3)
      .fontSize(10)
      .text(`Method: Stripe`)
      .text(`Transaction ID: ${payment.transactionId}`)
      .text(`Status: ${payment.status}`)
      .text(`Amount Paid: LKR ${Number(payment.amount).toFixed(2)}`)
      .moveDown(2)
      .fontSize(10)
      .text("Thank you for your booking!", { align: "center" });

    doc.end();

    const pdfBuffer = await new Promise((resolve, reject) => {
      const bufs = [];
      doc.on("data", (d) => bufs.push(d));
      doc.on("end", () => resolve(Buffer.concat(bufs)));
      doc.on("error", reject);
    });

    // Email sending
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: !!(process.env.SMTP_SECURE === "true"),
        auth: process.env.SMTP_USER && process.env.SMTP_PASS ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        } : undefined,
      });

      await transporter.sendMail({
        from: process.env.FROM_EMAIL || "no-reply@example.com",
        to: toEmail,
        subject: `Your Receipt - Booking ${booking.id || booking._id || ""}`,
        text: "Please find your payment receipt attached.",
        attachments: [
          {
            filename: `receipt_${payment.transactionId}.pdf`,
            content: pdfBuffer,
          },
        ],
      });
    } catch (mailErr) {
      console.error("Email send error", mailErr);
      // continue to return PDF even if email fails
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=receipt_${payment.transactionId}.pdf`
    );
    return res.status(200).send(pdfBuffer);
  } catch (err) {
    console.error("Receipt generation error", err);
    return res.status(500).json({ message: "Failed to generate receipt" });
  }
});


