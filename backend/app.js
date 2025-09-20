// psw = xS3LBsRT0zoGDGx7
// tourismplatform
// backend/app.js

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const flightRoutes = require("./routes/Flight_routes");

const app = express();

const PORT = process.env.PORT || 5000;
const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://admin:xS3LBsRT0zoGDGx7@tourismplatform.insljjg.mongodb.net/";

app.use(express.json());

app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: false,
  })
);

// Health check/Welcome
app.get("/", (req, res) => {
  res.json({ message: "Tourism Management Platform API is running" });
});

// Register the flights API
app.use("/api/flights", flightRoutes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ error: "Route not found." });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

// Connect to MongoDB and start server
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Flights API: http://localhost:${PORT}/api/flights`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });


/* cd backend 
npm start  */
/* cd frontend
npm start  */
/*
http://localhost:5000/api/flights →  Get all flights, create flight, etc.
https://localhost:5000/api/flights/book  →  Endpoint for booking a flight.
https://localhost:5000/api/flights/promo/send  →  Endpoint to send promo via WhatsApp.
*/