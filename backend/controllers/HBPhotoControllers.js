const fs = require("fs");
const mongoose = require("mongoose");
const HBPhotoModel = require("../models/HBPhotoModel");

// ---------------- Upload Guest Photos ----------------
exports.uploadPhotos = async (req, res) => {
  try {
    const { hotelId, userId, guestName, category, caption } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No photos uploaded" });
    }

    const photos = req.files.map((file) => ({
      hotelId,
      userId: userId || null,
      userName: guestName,
      category: category || "other",
      caption: caption || "",
      photoPath: file.path,
      verified: false
    }));

    const savedPhotos = await HBPhotoModel.insertMany(photos);

    res.status(201).json({
      message: "Photos uploaded successfully",
      photos: savedPhotos,
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Failed to upload photos", error: err.message });
  }
};

// ---------------- Get All Verified Photos ----------------
exports.getAllPhotos = async (req, res) => {
  try {
    const photos = await HBPhotoModel.find({ verified: true })
      .populate("hotelId", "name city")
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ photos });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch photos", error: err.message });
  }
};

// ---------------- Get Pending Photos (Admin) ----------------
exports.getPendingPhotos = async (req, res) => {
  try {
    const photos = await HBPhotoModel.find({ verified: false })
      .populate("hotelId", "name city")
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ photos });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch pending photos", error: err.message });
  }
};

// ---------------- Get Photos by Hotel ----------------
exports.getPhotosByHotel = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const photos = await HBPhotoModel.find({ hotelId, verified: true })
      .populate("userId", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({ photos });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch hotel photos", error: err.message });
  }
};

// ---------------- Get Photos by User ----------------
exports.getPhotosByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const photos = await HBPhotoModel.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ photos });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user photos", error: err.message });
  }
};

// ---------------- Approve / Verify Photo ----------------
exports.approvePhoto = async (req, res) => {
  try {
    const { photoId } = req.params;

    const photo = await HBPhotoModel.findByIdAndUpdate(
      photoId,
      { verified: true },
      { new: true }
    );

    if (!photo) return res.status(404).json({ message: "Photo not found" });

    res.status(200).json({ message: "Photo approved successfully", photo });
  } catch (err) {
    res.status(500).json({ message: "Failed to approve photo", error: err.message });
  }
};

// ---------------- Delete / Reject Photo ----------------
exports.deletePhoto = async (req, res) => {
  try {
    const { photoId } = req.params;
    const photo = await HBPhotoModel.findById(photoId);

    if (!photo) return res.status(404).json({ message: "Photo not found" });

    if (fs.existsSync(photo.photoPath)) {
      fs.unlinkSync(photo.photoPath);
    }

    await HBPhotoModel.findByIdAndDelete(photoId);
    res.status(200).json({ message: "Photo deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete photo", error: err.message });
  }
};

// ---------------- Get Photo Stats per Hotel ----------------
exports.getPhotoStats = async (req, res) => {
  try {
    const { hotelId } = req.params;

    const stats = await HBPhotoModel.aggregate([
      { $match: { hotelId: new mongoose.Types.ObjectId(hotelId), verified: true } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
    ]);

    const totalPhotos = await HBPhotoModel.countDocuments({ hotelId, verified: true });

    res.status(200).json({ stats, totalPhotos });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch photo stats", error: err.message });
  }
};
