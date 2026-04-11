// psw = xS3LBsRT0zoGDGx7
// tourismplatform
// backend/app.js

require('dotenv').config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require('morgan');

const app = express();

//chamod
const bodyParser = require("body-parser");
const userRoutes = require("./routes/userRoutes");
app.use(express.json());
app.use(bodyParser.json());
app.use(morgan('dev'));
//end

const flightRoutes = require("./routes/Flight_routes");



const PORT = process.env.PORT || 5000;
const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://admin:xS3LBsRT0zoGDGx7@tourismplatform.insljjg.mongodb.net/";
  //"mongodb+srv://admin:dwtELFg0Fxz2iGIu@cluster0.dag8aa0.mongodb.net/test"
app.use(express.json());

app.use(
  cors({
    // origin: ["http://localhost:3000"],
    // methods: ["GET", "POST", "PUT", "DELETE"],
    // credentials: false,
     origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Health check/Welcome
app.get("/", (req, res) => {
  res.json({ message: "Tourism Management Platform API is running" });
});

// Register the flights API
app.use("/api/flights", flightRoutes);

/* cd backend 
npm start  */
/* cd frontend
npm start  */
/*
http://localhost:5000/api/flights →  Get all flights, create flight, etc.
https://localhost:5000/api/flights/book  →  Endpoint for booking a flight.
https://localhost:5000/api/flights/promo/send  →  Endpoint to send promo via WhatsApp.
*/

//chamod
const multer = require("multer");

const storage = multer.diskStorage({
    destination: function(req, file,cb){
        cb(null,"../frontend/src/Components/ImageUploder/files")
    },
    filename:function (req,file,cb){
        const uniqueSuffix = Date.now();
        cb(null, uniqueSuffix +file.originalname);
    }
});

const upload = multer({storage: storage});

app.post("/uplodeImg",upload.single("image"),async(req,res)=>{

    if (!req.file) {
        return res.status(400).json({ status: "error", message: "No file uploaded" });
    }

    console.log(req.body);
    const imageName = req.file.filename;

    try{
        await itemSchema.create({Image:imageName});
        res.json({status: "ok"});
    }catch (error){
        res.json({status:error});
    }
});

//display img
app.get("/getImage",async(req, res) =>{
    try{
        itemSchema.find({}).then((data) =>{
           res.send({status: "ok", data:data}); 
        })
    }catch(error){
        res.json({status:error});
    }
});




const accessoryRoutes = require('./routes/accessoryRoutes');
const path = require('path');

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



app.use('/api/accessories', accessoryRoutes);


//show item
// Note: This is commented out because it conflicts with other routes
// app.use('/api', accessoryRoutes) // This catches ALL /api/* routes!


app.use("/api/users", userRoutes);

const staffRoutes = require("./routes/staffRoutes");
app.use("/api/staff", staffRoutes);

// CH Booking and Payment Routes (for accessories)
const chBookingRoutes = require("./routes/chBookingRoutes");
const chStripeRoutes = require("./routes/chStripeRoutes");
app.use("/api/bookings", chBookingRoutes);
app.use("/api/stripe", chStripeRoutes);

// Destination & Adventure Booking Routes (for destinations/activities)
const destinationBookingRoutes = require("./routes/bookingRoutes");
app.use("/api/trip-bookings", destinationBookingRoutes);

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Simple health check
app.get('/health', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// API Routes - Naily's routes (for destinations/activities)
// Note: userRoutes1 is commented out to avoid duplicate with line 125
app.use('/api/destinations', require('./routes/destinationRoutes'));
app.use('/api/activities', require('./routes/activityRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));

//Ashani - Transport routes (MUST be before 404 handler)
const vehicleRoutes = require("./routes/VehiRoutes");
const driverRoutes = require("./routes/DriverRoutes");
const VBookRoutes = require("./routes/VBookRoutes");

app.use("/vehicles", vehicleRoutes);
app.use("/drivers", driverRoutes);
app.use("/Vbook", VBookRoutes);

//Maneesha - Hotel routes (MUST be before 404 handler)
const HBHotelRoutes = require("./routes/HBHotelRoutes");
const HBRoomRoutes = require("./routes/HBRoomRoutes");
const HBReviewRoutes = require("./routes/HBReviewRoutes");
const HBBookingRoutes = require("./routes/HBBookingRoutes");
const HBPaymentRoutes = require("./routes/HBPaymentRoutes");
const HBPhotoRoutes = require("./routes/HBPhotoRoutes");

app.use("/hotels", HBHotelRoutes); 
app.use("/rooms", HBRoomRoutes);
app.use("/reviews", HBReviewRoutes);
app.use("/bookings", HBBookingRoutes);
app.use("/payments", HBPaymentRoutes);
app.use("/photos", HBPhotoRoutes);

app.use("/uploads", express.static("uploads"));

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ error: "Route not found." });
});

// Error handler (must be last)
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
    success: false
  });
});

// Connect to MongoDB and start server
const HOST = '0.0.0.0'; // Bind to all addresses

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    const server = app.listen(PORT, HOST, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`Flights API: http://localhost:${PORT}/api/flights`);
      console.log(`Users API: http://localhost:${PORT}/api/users`);
      console.log(`Staff API: http://localhost:${PORT}/api/staff`);
      console.log(`Accessories API: http://localhost:${PORT}/api/accessories`);
      console.log(`Bookings API: http://localhost:${PORT}/api/bookings`);
      console.log(`Destinations API: http://localhost:${PORT}/api/destinations`);
      console.log(`Activities API: http://localhost:${PORT}/api/activities`);
      console.log(`Reviews API: http://localhost:${PORT}/api/reviews`);
      console.log(`Wishlist API: http://localhost:${PORT}/api/wishlist`);
    });

    // Handle server errors
    server.on('error', (err) => {
      console.error('Server error:', err);
      if (err.code === 'EADDRINUSE') {
        console.log(`Port ${PORT} is busy. Please stop the other process or use a different port.`);
        process.exit(1);
      }
    });

    // Handle process termination
    process.on('SIGTERM', () => {
      console.log('SIGTERM received');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});