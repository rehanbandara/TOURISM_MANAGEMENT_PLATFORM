const express= require("express");
const mongoose= require("mongoose");
const cors= require("cors");

// const flightRoutes=require("./routes/Flight_routes");

const app= express();

const PORT= process.env.PORT || 5000;

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://askme/tourism_platform";

app.use(express.json());

app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: false,
  })
);

app.get("/", (req, res) => {
  res.json({ message: "Tourism Management Platform API is running" });
});


//app.use("/api/flights", flightRoutes);

app.use((req, res, next) => {
  res.status(404).json({ error: "Route not found.. Let me cook!, rehan" });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});


mongoose
  .connect(MONGO_URI, {
  })
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

