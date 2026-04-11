 const express = require("express");
 const router = express.Router();

 //Insert Model
 const Review = require("../models/HBReviewModel");

 //Insert Review Controller
 const HBReviewControllers = require("../controllers/HBReviewControllers");

router.get("/", HBReviewControllers.getAllReviews);
router.post("/", HBReviewControllers.addReviews);
router.get("/:id", HBReviewControllers.getById);
router.put("/:id", HBReviewControllers.updateReview);
router.delete("/:id", HBReviewControllers.deleteReview);

 //export
 module.exports = router;
