const express = require("express");
const router = express.Router();
const FlightControllers = require("../controllers/Flight_controllers");

//Flights CRUD
router.get("/", FlightControllers.getAllFlights);
router.get("/cabin-classes", FlightControllers.getCabinClasses);
router.get("/:id", FlightControllers.getFlightById);
router.post("/", FlightControllers.createFlight);
router.put("/:id", FlightControllers.updateFlight);
router.delete("/:id", FlightControllers.deleteFlight);

//Booking/visits create
router.post("/book", FlightControllers.bookFlight);
router.post("/request-promo", FlightControllers.requestPromo); // added
//visits/PDF create
router.get("/visits/all", FlightControllers.getAllVisits);
router.get("/visits/stats", FlightControllers.getVisitStats);
router.get("/promo/pdf", FlightControllers.downloadPromoPDF);

// User info create/read
router.post("/userinfo", FlightControllers.addUserInfo);
router.get("/userinfo", FlightControllers.getAllUsers);

module.exports = router;