//6VCjMDjNMfyocrhK

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");


const vehicleRoutes = require("./Routes/VehiRoutes");
const driverRoutes = require("./Routes/DriverRoutes");
const VehiBooking_Routes=require("./Routes/VehiBooking_Routes");
const VBookRoutes = require("./Routes/VBookRoutes");
const RegisterRoutes = require("./Routes/RegisterRoutes");
const LoginRoutes = require("./Routes/LoginRoutes");
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Route middlewares
app.use("/vehicles", vehicleRoutes);
app.use("/drivers", driverRoutes);
app.use("/bookings", VehiBooking_Routes);  
app.use("/Vbook", VBookRoutes);
app.use("/Regi",RegisterRoutes);
app.use("/Log",LoginRoutes);

app.use("/uploads", express.static("uploads"));

//mongodb+srv://Admin:sebbPhEUGEwJdsYg@cluster0.cmszeyj.mongodb.net/TransportDB
// Connect to MongoDB
mongoose.connect("mongodb+srv://Admin:sebbPhEUGEwJdsYg@cluster0.cmszeyj.mongodb.net/TransportDB")

  .then(() => {
      console.log("Connected to MongoDB");
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
  })
  .catch((err) => console.log(err));

  
