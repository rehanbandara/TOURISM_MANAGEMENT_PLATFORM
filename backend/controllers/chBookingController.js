const CHBooking = require("../models/CHBooking");
const Accessory = require("../models/Accessory");
const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

// Create a new booking (called after successful payment)
exports.createBooking = async (req, res) => {
  try {
    console.log("📝 Creating new booking...");
    console.log("📦 Request body:", req.body);
    
    const {
      userId,
      userEmail,
      fullName,
      phoneNumber,
      address,
      accessoryId,
      itemName,
      itemPrice,
      quantity,
      imagePath,
      totalAmount,
      currency,
      stripePaymentId,
      stripeSessionId,
      specialInstructions,
    } = req.body;

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    console.log("🔢 Generated order number:", orderNumber);

    const newBooking = new CHBooking({
      userId,
      userEmail,
      fullName,
      phoneNumber,
      address,
      accessoryId,
      itemName,
      itemPrice,
      quantity,
      imagePath,
      totalAmount,
      currency,
      stripePaymentId,
      stripeSessionId,
      specialInstructions,
      paymentStatus: "completed",
      orderNumber, // Explicitly set order number
    });

    console.log("💾 Saving booking to database...");
    await newBooking.save();
    console.log("✅ Booking saved successfully:", newBooking._id);

    res.status(201).json({
      message: "Booking created successfully",
      booking: newBooking,
    });
  } catch (error) {
    console.error("❌ Error creating booking:", error);
    console.error("Error details:", error.message);
    if (error.errors) {
      console.error("Validation errors:", error.errors);
    }
    res.status(500).json({ 
      message: "Failed to create booking", 
      error: error.message,
      validationErrors: error.errors
    });
  }
};

// Get all bookings for a specific user
exports.getUserBookings = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const bookings = await CHBooking.find({ userId })
      .populate("accessoryId")
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    res.status(500).json({ message: "Failed to fetch bookings", error: error.message });
  }
};

// Get all bookings (admin)
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await CHBooking.find()
      .populate("accessoryId")
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    console.error("Error fetching all bookings:", error);
    res.status(500).json({ message: "Failed to fetch bookings", error: error.message });
  }
};

// Get single booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await CHBooking.findById(id).populate("accessoryId");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json(booking);
  } catch (error) {
    console.error("Error fetching booking:", error);
    res.status(500).json({ message: "Failed to fetch booking", error: error.message });
  }
};

// Generate PDF Receipt
exports.generatePDFReceipt = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await CHBooking.findById(id).populate("accessoryId");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });
    const filename = `receipt-${booking.orderNumber}.pdf`;
    const filepath = path.join(__dirname, "../receipts", filename);

    // Create receipts folder if it doesn't exist
    if (!fs.existsSync(path.join(__dirname, "../receipts"))) {
      fs.mkdirSync(path.join(__dirname, "../receipts"));
    }

    const writeStream = fs.createWriteStream(filepath);
    doc.pipe(writeStream);

    // Header
    doc.fontSize(24).fillColor("#667eea").text("PURCHASE RECEIPT", { align: "center" });
    doc.moveDown();
    doc.fontSize(10).fillColor("#64748b").text(`Order Number: ${booking.orderNumber}`, { align: "center" });
    doc.text(`Date: ${new Date(booking.createdAt).toLocaleDateString()}`, { align: "center" });
    doc.moveDown(2);

    // Customer Information
    doc.fontSize(14).fillColor("#2d3748").text("Customer Information:", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11).fillColor("#4a5568");
    doc.text(`Name: ${booking.fullName}`);
    doc.text(`Email: ${booking.userEmail}`);
    doc.text(`Phone: ${booking.phoneNumber}`);
    doc.text(`Address: ${booking.address.street}, ${booking.address.city}`);
    doc.text(`${booking.address.state}, ${booking.address.zipCode}, ${booking.address.country}`);
    doc.moveDown(2);

    // Order Details
    doc.fontSize(14).fillColor("#2d3748").text("Order Details:", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11).fillColor("#4a5568");
    doc.text(`Item: ${booking.itemName}`);
    doc.text(`Quantity: ${booking.quantity}`);
    doc.text(`Unit Price: ${booking.currency === "USD" ? "$" : "Rs. "}${booking.itemPrice.toFixed(2)}`);
    doc.moveDown(1);

    // Line
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(1);

    // Total
    doc.fontSize(14).fillColor("#2d3748").text(`Total Amount: ${booking.currency === "USD" ? "$" : "Rs. "}${booking.totalAmount.toFixed(2)}`, { align: "right" });
    doc.moveDown(0.5);
    doc.fontSize(11).fillColor("#16a34a").text(`Payment Status: ${booking.paymentStatus.toUpperCase()}`, { align: "right" });
    doc.text(`Order Status: ${booking.orderStatus.toUpperCase()}`, { align: "right" });
    doc.moveDown(2);

    // Footer
    doc.fontSize(10).fillColor("#64748b").text("Thank you for your purchase!", { align: "center" });
    doc.text("For support, contact us at support@travelagency.com", { align: "center" });

    doc.end();

    writeStream.on("finish", () => {
      res.download(filepath, filename, (err) => {
        if (err) {
          console.error("Error sending file:", err);
        }
        // Delete file after download
        fs.unlinkSync(filepath);
      });
    });

    writeStream.on("error", (err) => {
      console.error("Error writing PDF:", err);
      res.status(500).json({ message: "Failed to generate PDF" });
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({ message: "Failed to generate PDF", error: error.message });
  }
};

// Send Receipt via Email
exports.sendReceiptEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await CHBooking.findById(id).populate("accessoryId");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Create PDF in memory
    const doc = new PDFDocument({ margin: 50 });
    const filename = `receipt-${booking.orderNumber}.pdf`;
    const filepath = path.join(__dirname, "../receipts", filename);

    // Create receipts folder if it doesn't exist
    if (!fs.existsSync(path.join(__dirname, "../receipts"))) {
      fs.mkdirSync(path.join(__dirname, "../receipts"));
    }

    const writeStream = fs.createWriteStream(filepath);
    doc.pipe(writeStream);

    // Same PDF content as above
    doc.fontSize(24).fillColor("#667eea").text("PURCHASE RECEIPT", { align: "center" });
    doc.moveDown();
    doc.fontSize(10).fillColor("#64748b").text(`Order Number: ${booking.orderNumber}`, { align: "center" });
    doc.text(`Date: ${new Date(booking.createdAt).toLocaleDateString()}`, { align: "center" });
    doc.moveDown(2);

    doc.fontSize(14).fillColor("#2d3748").text("Customer Information:", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11).fillColor("#4a5568");
    doc.text(`Name: ${booking.fullName}`);
    doc.text(`Email: ${booking.userEmail}`);
    doc.text(`Phone: ${booking.phoneNumber}`);
    doc.text(`Address: ${booking.address.street}, ${booking.address.city}`);
    doc.text(`${booking.address.state}, ${booking.address.zipCode}, ${booking.address.country}`);
    doc.moveDown(2);

    doc.fontSize(14).fillColor("#2d3748").text("Order Details:", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11).fillColor("#4a5568");
    doc.text(`Item: ${booking.itemName}`);
    doc.text(`Quantity: ${booking.quantity}`);
    doc.text(`Unit Price: ${booking.currency === "USD" ? "$" : "Rs. "}${booking.itemPrice.toFixed(2)}`);
    doc.moveDown(1);

    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(1);

    doc.fontSize(14).fillColor("#2d3748").text(`Total Amount: ${booking.currency === "USD" ? "$" : "Rs. "}${booking.totalAmount.toFixed(2)}`, { align: "right" });
    doc.moveDown(0.5);
    doc.fontSize(11).fillColor("#16a34a").text(`Payment Status: ${booking.paymentStatus.toUpperCase()}`, { align: "right" });
    doc.text(`Order Status: ${booking.orderStatus.toUpperCase()}`, { align: "right" });
    doc.moveDown(2);

    doc.fontSize(10).fillColor("#64748b").text("Thank you for your purchase!", { align: "center" });
    doc.text("For support, contact us at support@travelagency.com", { align: "center" });

    doc.end();

    writeStream.on("finish", async () => {
      // Setup email transporter
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER || "your-email@gmail.com",
          pass: process.env.EMAIL_PASS || "your-app-password",
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER || "your-email@gmail.com",
        to: booking.userEmail,
        subject: `Purchase Receipt - Order ${booking.orderNumber}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
            <h2>Thank You for Your Purchase!</h2>
            <p>Dear ${booking.fullName},</p>
            <p>Your order has been confirmed. Please find your receipt attached.</p>
            <div style="background: white; color: #2d3748; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h3>Order Summary:</h3>
              <p><strong>Order Number:</strong> ${booking.orderNumber}</p>
              <p><strong>Item:</strong> ${booking.itemName}</p>
              <p><strong>Quantity:</strong> ${booking.quantity}</p>
              <p><strong>Total:</strong> ${booking.currency === "USD" ? "$" : "Rs. "}${booking.totalAmount.toFixed(2)}</p>
              <p><strong>Status:</strong> ${booking.paymentStatus.toUpperCase()}</p>
            </div>
            <p>If you have any questions, please contact our support team.</p>
            <p>Best regards,<br/>Travel Agency Team</p>
          </div>
        `,
        attachments: [
          {
            filename: filename,
            path: filepath,
          },
        ],
      };

      transporter.sendMail(mailOptions, (error, info) => {
        // Delete file after sending
        fs.unlinkSync(filepath);

        if (error) {
          console.error("Error sending email:", error);
          return res.status(500).json({ message: "Failed to send email", error: error.message });
        }

        res.status(200).json({ message: "Receipt sent successfully to your email!" });
      });
    });

    writeStream.on("error", (err) => {
      console.error("Error writing PDF:", err);
      res.status(500).json({ message: "Failed to generate PDF for email" });
    });
  } catch (error) {
    console.error("Error sending receipt email:", error);
    res.status(500).json({ message: "Failed to send receipt email", error: error.message });
  }
};

// Update order status (admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    const booking = await CHBooking.findByIdAndUpdate(
      id,
      { orderStatus },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json({ message: "Order status updated", booking });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: "Failed to update order status", error: error.message });
  }
};

// Generate Comprehensive Sales Report PDF
exports.generateSalesReport = async (req, res) => {
  try {
    const bookings = await CHBooking.find().populate("accessoryId").sort({ createdAt: -1 });

    if (bookings.length === 0) {
      return res.status(404).json({ message: "No bookings found" });
    }

    // Create PDF
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const filename = `sales-report-${Date.now()}.pdf`;
    const filepath = path.join(__dirname, "../receipts", filename);

    // Create receipts folder if it doesn't exist
    if (!fs.existsSync(path.join(__dirname, "../receipts"))) {
      fs.mkdirSync(path.join(__dirname, "../receipts"));
    }

    const writeStream = fs.createWriteStream(filepath);
    doc.pipe(writeStream);

    // Header
    doc.fontSize(24).fillColor("#0fc2c0").text("ACCESSORY SALES REPORT", { align: "center" });
    doc.moveDown();
    doc.fontSize(10).fillColor("#64748b").text(`Generated: ${new Date().toLocaleString()}`, { align: "center" });
    doc.moveDown(2);

    // Summary Statistics
    const totalSales = bookings.reduce((sum, b) => sum + b.totalAmount, 0);
    const completedOrders = bookings.filter(b => b.paymentStatus === "completed").length;
    const pendingOrders = bookings.filter(b => b.paymentStatus === "pending").length;

    doc.fontSize(14).fillColor("#2d3748").text("Summary Statistics", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11).fillColor("#4a5568");
    doc.text(`Total Orders: ${bookings.length}`);
    doc.text(`Completed Orders: ${completedOrders}`);
    doc.text(`Pending Orders: ${pendingOrders}`);
    doc.text(`Total Sales: $${totalSales.toFixed(2)}`);
    doc.moveDown(2);

    // Orders Table Header
    doc.fontSize(12).fillColor("#2d3748").text("Order Details", { underline: true });
    doc.moveDown(1);

    // Table
    const tableTop = doc.y;
    const itemHeight = 20;
    let currentY = tableTop;

    // Draw table headers
    doc.fontSize(9).fillColor("#ffffff");
    doc.rect(50, currentY, 500, 20).fill("#0fc2c0");
    doc.fillColor("#ffffff");
    doc.text("Order #", 55, currentY + 5, { width: 80 });
    doc.text("Customer", 135, currentY + 5, { width: 100 });
    doc.text("Item", 235, currentY + 5, { width: 100 });
    doc.text("Amount", 335, currentY + 5, { width: 70 });
    doc.text("Status", 405, currentY + 5, { width: 70 });
    doc.text("Date", 475, currentY + 5, { width: 70 });

    currentY += itemHeight;

    // Draw table rows
    doc.fillColor("#4a5568").fontSize(8);
    bookings.forEach((booking, index) => {
      if (currentY > 700) {
        doc.addPage();
        currentY = 50;
      }

      const bgColor = index % 2 === 0 ? "#f8fafc" : "#ffffff";
      doc.rect(50, currentY, 500, itemHeight).fill(bgColor);
      doc.fillColor("#4a5568");

      doc.text(booking.orderNumber, 55, currentY + 5, { width: 80 });
      doc.text(booking.fullName.substring(0, 15), 135, currentY + 5, { width: 100 });
      doc.text(booking.itemName.substring(0, 15), 235, currentY + 5, { width: 100 });
      doc.text(`$${booking.totalAmount.toFixed(2)}`, 335, currentY + 5, { width: 70 });
      doc.text(booking.paymentStatus, 405, currentY + 5, { width: 70 });
      doc.text(new Date(booking.createdAt).toLocaleDateString(), 475, currentY + 5, { width: 70 });

      currentY += itemHeight;
    });

    // Footer
    doc.moveDown(2);
    doc.fontSize(10).fillColor("#64748b").text("End of Report", { align: "center" });

    doc.end();

    writeStream.on("finish", () => {
      res.download(filepath, filename, (err) => {
        if (err) {
          console.error("Error sending file:", err);
        }
        // Delete file after download
        fs.unlinkSync(filepath);
      });
    });

    writeStream.on("error", (err) => {
      console.error("Error writing PDF:", err);
      res.status(500).json({ message: "Failed to generate sales report" });
    });
  } catch (error) {
    console.error("Error generating sales report:", error);
    res.status(500).json({ message: "Failed to generate sales report", error: error.message });
  }
};

