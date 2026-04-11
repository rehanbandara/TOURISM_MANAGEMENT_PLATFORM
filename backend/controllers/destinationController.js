const Destination = require('../models/destinationModel');
const { deleteFile, getFileUrl } = require('../middleware/uploadMiddleware');
const path = require('path');

// Create Destination (Admin only)
exports.createDestination = async (req, res, next) => {
  try {
    const { name, location, description, entryFee, bestTimeToVisit, activities } = req.body;

    if (!name || !location) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name and location are required.' 
      });
    }

    // Check if destination already exists
    const existing = await Destination.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      location: { $regex: new RegExp(`^${location}$`, 'i') }
    });

    if (existing) {
      return res.status(409).json({ 
        success: false, 
        message: 'Destination with this name and location already exists.' 
      });
    }

    // Handle uploaded images
    let imagePaths = [];
    if (req.files && req.files.length > 0) {
      imagePaths = req.files.map(file => {
        // Return relative path for storing in database
        return `destinations/${file.filename}`;
      });
    }

    // Parse activities from JSON string if needed
    let activitiesArray = [];
    if (activities) {
      try {
        // If activities is a JSON string, parse it
        if (typeof activities === 'string' && activities.startsWith('[')) {
          activitiesArray = JSON.parse(activities);
        } else if (Array.isArray(activities)) {
          activitiesArray = activities;
        } else {
          // If it's a comma-separated string
          activitiesArray = activities.split(',').map(a => a.trim());
        }
      } catch (error) {
        // Fallback to comma-separated string parsing
        activitiesArray = activities.split(',').map(a => a.trim());
      }
    }

    const destination = new Destination({
      name: name.trim(),
      location: location.trim(),
      description: description?.trim(),
      images: imagePaths,
      entryFee: entryFee || 0,
      bestTimeToVisit: bestTimeToVisit?.trim(),
      activities: activitiesArray
    });

    await destination.save();

    // Convert image paths to full URLs for response
    const destinationResponse = destination.toObject();
    destinationResponse.images = destinationResponse.images.map(imagePath => 
      getFileUrl(req, imagePath)
    );

    return res.status(201).json({
      success: true,
      message: 'Destination created successfully',
      data: destinationResponse
    });
  } catch (err) {
    // Clean up uploaded files if destination creation fails
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        deleteFile(file.path);
      });
    }
    next(err);
  }
};

// Get All Destinations (Public)
exports.getAllDestinations = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build search query
    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { location: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { activities: { $in: [new RegExp(search, 'i')] } }
        ]
      };
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const destinations = await Destination.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    // Convert image paths to full URLs
    const destinationsWithUrls = destinations.map(dest => {
      const destObj = dest.toObject();
      destObj.images = destObj.images.map(imagePath => 
        getFileUrl(req, imagePath)
      );
      return destObj;
    });

    const total = await Destination.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: destinationsWithUrls,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        itemsPerPage: limitNum
      }
    });
  } catch (err) {
    next(err);
  }
};

// Get Destination by ID (Public)
exports.getDestinationById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid destination ID format.' 
      });
    }

    const destination = await Destination.findById(id);

    if (!destination) {
      return res.status(404).json({ 
        success: false, 
        message: 'Destination not found.' 
      });
    }

    // Convert image paths to full URLs
    const destinationResponse = destination.toObject();
    destinationResponse.images = destinationResponse.images.map(imagePath => 
      getFileUrl(req, imagePath)
    );

    return res.status(200).json({
      success: true,
      data: destinationResponse
    });
  } catch (err) {
    next(err);
  }
};

// Update Destination (Admin only)
exports.updateDestination = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid destination ID format.' 
      });
    }

    // Get existing destination to handle image updates
    const existingDestination = await Destination.findById(id);
    if (!existingDestination) {
      return res.status(404).json({ 
        success: false, 
        message: 'Destination not found.' 
      });
    }

    // Remove fields that shouldn't be updated
    delete updates._id;
    delete updates.createdAt;
    delete updates.updatedAt;

    // Trim string fields
    if (updates.name) updates.name = updates.name.trim();
    if (updates.location) updates.location = updates.location.trim();
    if (updates.description) updates.description = updates.description.trim();
    if (updates.bestTimeToVisit) updates.bestTimeToVisit = updates.bestTimeToVisit.trim();

    // Handle activities array
    if (updates.activities) {
      try {
        // If activities is a JSON string, parse it
        if (typeof updates.activities === 'string' && updates.activities.startsWith('[')) {
          updates.activities = JSON.parse(updates.activities);
        } else if (Array.isArray(updates.activities)) {
          updates.activities = updates.activities;
        } else {
          // If it's a comma-separated string
          updates.activities = updates.activities.split(',').map(a => a.trim());
        }
      } catch (error) {
        // Fallback to comma-separated string parsing
        updates.activities = updates.activities.split(',').map(a => a.trim());
      }
    }

    // Handle uploaded images
    if (req.files && req.files.length > 0) {
      // Delete old images if replacing
      if (updates.replaceImages === 'true') {
        existingDestination.images.forEach(imagePath => {
          const fullPath = path.join(__dirname, '../uploads', imagePath);
          deleteFile(fullPath);
        });
        // Replace with new images
        updates.images = req.files.map(file => `destinations/${file.filename}`);
      } else {
        // Add new images to existing ones
        const newImages = req.files.map(file => `destinations/${file.filename}`);
        updates.images = [...existingDestination.images, ...newImages];
      }
    }

    // Validate rating if provided
    if (updates.rating !== undefined) {
      if (updates.rating < 0 || updates.rating > 5) {
        return res.status(400).json({ 
          success: false, 
          message: 'Rating must be between 0 and 5.' 
        });
      }
    }

    const destination = await Destination.findByIdAndUpdate(
      id, 
      updates, 
      { new: true, runValidators: true }
    );

    // Convert image paths to full URLs for response
    const destinationResponse = destination.toObject();
    destinationResponse.images = destinationResponse.images.map(imagePath => 
      getFileUrl(req, imagePath)
    );

    return res.status(200).json({
      success: true,
      message: 'Destination updated successfully',
      data: destinationResponse
    });
  } catch (err) {
    // Clean up uploaded files if update fails
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        deleteFile(file.path);
      });
    }
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false, 
        message: err.message 
      });
    }
    next(err);
  }
};

// Delete Destination (Admin only)
exports.deleteDestination = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid destination ID format.' 
      });
    }

    const destination = await Destination.findByIdAndDelete(id);

    if (!destination) {
      return res.status(404).json({ 
        success: false, 
        message: 'Destination not found.' 
      });
    }

    // Delete associated image files
    if (destination.images && destination.images.length > 0) {
      destination.images.forEach(imagePath => {
        const fullPath = path.join(__dirname, '../uploads', imagePath);
        deleteFile(fullPath);
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Destination deleted successfully',
      data: destination
    });
  } catch (err) {
    next(err);
  }
};

// Get Destinations Stats (Admin only)
exports.getDestinationStats = async (req, res, next) => {
  try {
    const total = await Destination.countDocuments();
    const avgRating = await Destination.aggregate([
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);
    
    const topRated = await Destination.find()
      .sort({ rating: -1 })
      .limit(5)
      .select('name location rating');

    const recentlyAdded = await Destination.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name location createdAt');

    return res.status(200).json({
      success: true,
      data: {
        totalDestinations: total,
        averageRating: avgRating[0]?.avgRating || 0,
        topRatedDestinations: topRated,
        recentlyAddedDestinations: recentlyAdded
      }
    });
  } catch (err) {
    next(err);
  }
};