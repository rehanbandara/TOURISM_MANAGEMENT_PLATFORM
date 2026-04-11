const Accessory = require('../models/Accessory');
const path = require('path');
const fs = require('fs');

exports.addAccessory = async (req, res) => {
  try {
    const { itemName, smallIntro, description, price } = req.body;
    const imagePaths = req.files.map(file => `http://localhost:5000/uploads/${file.filename}`);

    const newAccessory = new Accessory({
      itemName,
      smallIntro,
      description,
      price,
      imagePaths,
    });

    await newAccessory.save();
    res.status(201).json({ message: 'Accessory added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};




exports.getAllAccessories = async (req, res) => {
  try {
    const { availability, minPrice, maxPrice, category, search } = req.query;
    let filter = {};

    if (availability) filter.availability = availability;
    if (category) filter.category = category;
    if (search) filter.itemName = { $regex: search, $options: 'i' };

    // Only add price filter if values are provided
    if (minPrice || maxPrice) {
      filter.price = {
        ...(minPrice && { $gte: Number(minPrice) }),
        ...(maxPrice && { $lte: Number(maxPrice) }),
      };
    }

    const accessories = await Accessory.find(filter);
    
    // Filter out any accessories with invalid data
    const validAccessories = accessories.filter(acc => {
      return acc.itemName && typeof acc.price === 'number' && !isNaN(acc.price);
    });
    
    res.json(validAccessories);
  } catch (error) {
    console.error('Error fetching accessories:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.getAllAccessories1 = async (req, res) => {
  try {
    const { availability, minPrice, maxPrice, category, search } = req.query;
    let filter = {};

    if (availability) filter.availability = availability;
    if (category) filter.category = category;
    if (search) filter.itemName = { $regex: search, $options: 'i' };

    // Only add price filter if one is provided
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    console.log("Final Filter:", filter);
    const accessories = await Accessory.find(filter);
    console.log("Accessories from DB:", accessories);

    // Filter out any accessories with invalid data
    const validAccessories = accessories.filter(acc => {
      return acc.itemName && typeof acc.price === 'number' && !isNaN(acc.price);
    });

    res.json({ status: "ok", data: validAccessories });
  } catch (error) {
    console.error("Error fetching accessories:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


exports.deleteAccessory = async (req, res) => {
  try {
    const { id } = req.params;
    await Accessory.findByIdAndDelete(id);
    res.json({ message: "Accessory deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};



const multer = require("multer");


// Multer setup (same as addAccessory)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

exports.updateAccessoryWithImages = [
  upload.array("images", 3), // max 3 images
  async (req, res) => {
    try {
      const { id } = req.params;
      const { itemName, smallIntro, description, price, availability } = req.body;

      let updateData = { itemName, smallIntro, description, price, availability };

      if (req.files && req.files.length > 0) {
        // Map file paths to be saved in DB
        updateData.imagePaths = req.files.map(
          (file) => `http://localhost:5000/uploads/${file.filename}`
        );
      }

      const updatedAccessory = await Accessory.findByIdAndUpdate(id, updateData, { new: true });

      if (!updatedAccessory) {
        return res.status(404).json({ message: "Accessory not found" });
      }

      res.json({ message: "Accessory updated successfully", data: updatedAccessory });
    } catch (error) {
      console.error("Error updating accessory:", error);
      res.status(500).json({ message: "Server Error", error });
    }
  },
];


exports.getAccessoryById = async (req, res) => {
  try {
    const accessory = await Accessory.findById(req.params.id);
    if (!accessory) {
      return res.status(404).json({ message: "Accessory not found" });
    }
    res.json(accessory); // just send the accessory
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error", error: err });
  }
};


// accessoryController.js (updateAccessory)


// exports.updateAccessory = async (req, res) => {
//   try {
//     const { itemName, smallIntro, description, price, availability } = req.body;

//     // ✅ Handle existing images from frontend
//     let imagePaths = [];
//     if (req.body.existingImages) {
//       imagePaths = Array.isArray(req.body.existingImages)
//         ? req.body.existingImages
//         : [req.body.existingImages];
//     }

//     // ✅ Handle newly uploaded images
//     if (req.files && req.files.length > 0) {
//       const newPaths = req.files.map(
//         (file) => `http://localhost:5000/uploads/${file.filename}`
//       );
//       imagePaths = [...imagePaths, ...newPaths];
//     }

//     // ✅ Enforce exactly 3 images
//     if (imagePaths.length !== 3) {
//       return res
//         .status(400)
//         .json({ message: `You must have exactly 3 images. Found ${imagePaths.length}` });
//     }

//     // ✅ Update the accessory
//     const updatedAccessory = await Accessory.findByIdAndUpdate(
//       req.params.id,
//       {
//         itemName,
//         smallIntro,
//         description,
//         price,
//         availability,
//         imagePaths,
//       },
//       { new: true } // Return the updated document
//     );

//     if (!updatedAccessory) {
//       return res.status(404).json({ message: "Accessory not found" });
//     }

//     res.json({
//       message: "Accessory updated successfully",
//       accessory: updatedAccessory,
//     });
//   } catch (err) {
//     console.error("Update error:", err);
//     res.status(500).json({ message: "Server Error", error: err });
//   }
// };



exports.updateAccessory = async (req, res) => {
  try {
    const { itemName, smallIntro, description, price, availability } = req.body;

    // ✅ Build imagePaths from existing + newly uploaded
    let imagePaths = [];
    if (req.body.existingImages) {
      imagePaths = Array.isArray(req.body.existingImages)
        ? req.body.existingImages
        : [req.body.existingImages]; // convert single value to array
    }

    if (req.files && req.files.length > 0) {
      const newPaths = req.files.map(
        (file) => `http://localhost:5000/uploads/${file.filename}`
      );
      imagePaths = [...imagePaths, ...newPaths];
    }

    // ✅ Enforce 1-3 images
    if (imagePaths.length < 1 || imagePaths.length > 3) {
      return res.status(400).json({
        message: `You must have between 1 and 3 images. Found ${imagePaths.length}`,
      });
    }

    console.log("Updating accessory:", req.params.id);
    console.log("Final imagePaths:", imagePaths);

    // ✅ Update in MongoDB
    const updatedAccessory = await Accessory.findByIdAndUpdate(
      req.params.id,
      {
        itemName,
        smallIntro,
        description,
        price,
        availability,
        imagePaths,
      },
      { new: true } // return updated document
    );

    if (!updatedAccessory) {
      return res.status(404).json({ message: "Accessory not found" });
    }

    res.status(200).json({
      message: "Accessory updated successfully",
      accessory: updatedAccessory, // send back updated data
    });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};
