const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload folder exists
const uploadDir = "./uploads/gallery";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Import Controller
const HBPhotoControllers = require("../controllers/HBPhotoControllers");

// ----------------- Multer Configuration -----------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "photo-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Only image files are allowed!"), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// ----------------- Routes -----------------
router.get("/", HBPhotoControllers.getAllPhotos);
router.get("/pending", HBPhotoControllers.getPendingPhotos);
router.get("/hotel/:hotelId", HBPhotoControllers.getPhotosByHotel);
router.get("/user/:userId", HBPhotoControllers.getPhotosByUser);

router.post("/upload", upload.array("photos", 5), HBPhotoControllers.uploadPhotos);
router.put("/approve/:photoId", HBPhotoControllers.approvePhoto);
router.delete("/:photoId", HBPhotoControllers.deletePhoto);
router.get("/stats/:hotelId", HBPhotoControllers.getPhotoStats);

module.exports = router;
