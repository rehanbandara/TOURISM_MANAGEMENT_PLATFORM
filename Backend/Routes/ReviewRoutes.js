 const express = require("express");
 const router = express.Router();

 //Insert Model
 const Review = require("../Model/ReviewModel");

 //Insert Review Controller
 const ReviewControllers = require("../Controllers/ReviewControllers");

router.get("/", ReviewControllers.getAllReviews);
router.post("/", ReviewControllers.addReviews);
router.get("/:id", ReviewControllers.getById);
router.put("/:id", ReviewControllers.updateReview);
router.delete("/:id", ReviewControllers.deleteReview);

 //export
 module.exports = router;
