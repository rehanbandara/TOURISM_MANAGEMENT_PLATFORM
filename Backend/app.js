//password = iSNXOPOliVg48E4e

const express = require("express");
const mongoose = require("mongoose");
const HotelRoutes = require("./Routes/HotelRoutes");
// const UserRoutes = require("./Routes/UserRoutes");
const RoomRoutes = require("./Routes/RoomRoutes");
const ReviewRoutes = require("./Routes/ReviewRoutes");
const BookingRoutes = require("./Routes/BookingRoutes");

const app = express();
const cors = require("cors")
const multer = require("multer");
const PORT = process.env.PORT || 5000;


//Middleware 
app.use(express.json());
app.use(cors());

app.use("/hotels",HotelRoutes); 
// app.use("/users",UserRoutes);
app.use("/rooms",RoomRoutes);
app.use("/reviews",ReviewRoutes);
app.use("/bookings",BookingRoutes);

app.use("/uploads", express.static("uploads"));



mongoose.connect("mongodb+srv://admin:iSNXOPOliVg48E4e@cluster0.bxmpvdk.mongodb.net/")
.then(() => {
      console.log("Connected to MongoDB");
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
  })
  .catch((err) => console.log(err));

