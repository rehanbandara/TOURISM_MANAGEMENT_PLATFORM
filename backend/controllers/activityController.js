const AdventureActivity = require('../models/activityModel');
const { deleteFile, getFileUrl } = require('../middleware/uploadMiddleware');
const path = require('path');

// Create Activity (Admin only)
exports.createActivity = async (req, res, next) => {
  try {
    const { title, category, location, description, price, durationHours, difficulty } = req.body;

    if (!title || !category || !location || !description || !price || !durationHours) {
      return res.status(400).json({
        success: false,
        message: 'Title, category, location, description, price, and durationHours are required.'
      });
    }

    // Check if activity already exists
    const existing = await AdventureActivity.findOne({
      title: { $regex: new RegExp(`^${title}$`, 'i') },
      location: { $regex: new RegExp(`^${location}$`, 'i') }
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Activity with this title and location already exists.'
      });
    }

    // Handle uploaded images
    let imagePaths = [];
    if (req.files && req.files.length > 0) {
      imagePaths = req.files.map(file => `activities/${file.filename}`);
    }

    const activity = new AdventureActivity({
      title: title.trim(),
      category: category.trim(),
      location: location.trim(),
      description: description.trim(),
      price: Number(price),
      durationHours: Number(durationHours),
      difficulty: difficulty || 'Easy',
      images: imagePaths
    });

    await activity.save();

    // Convert image paths to full URLs for response
    const activityResponse = activity.toObject();
    activityResponse.images = activityResponse.images.map(imagePath =>
      getFileUrl(req, imagePath)
    );

    return res.status(201).json({
      success: true,
      message: 'Adventure activity created successfully',
      data: activityResponse
    });
  } catch (err) {
    // Clean up uploaded files if activity creation fails
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        deleteFile(file.path);
      });
    }
    next(err);
  }
};

// Get All Activities (Public)
exports.getAllActivities = async (req, res, next) => {
  try {
    const {
      page = 1, limit = 10, search, difficulty, category, minPrice, maxPrice,
      sortBy = 'createdAt', sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build search query
    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    if (difficulty) {
      query.difficulty = difficulty;
    }

    if (category) {
      query.category = { $regex: new RegExp(category, 'i') };
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const activities = await AdventureActivity.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    // Convert image paths to full URLs
    const activitiesWithUrls = activities.map(activity => {
      const activityObj = activity.toObject();
      activityObj.images = activityObj.images.map(imagePath =>
        getFileUrl(req, imagePath)
      );
      return activityObj;
    });

    const total = await AdventureActivity.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: activitiesWithUrls,
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

// Get Activity by ID (Public)
exports.getActivityById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid activity ID format.'
      });
    }

    const activity = await AdventureActivity.findById(id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found.'
      });
    }

    // Convert image paths to full URLs
    const activityResponse = activity.toObject();
    activityResponse.images = activityResponse.images.map(imagePath =>
      getFileUrl(req, imagePath)
    );

    return res.status(200).json({
      success: true,
      data: activityResponse
    });
  } catch (err) {
    next(err);
  }
};

// Update Activity (Admin only)
exports.updateActivity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid activity ID format.'
      });
    }

    // Get existing activity to handle image updates
    const existingActivity = await AdventureActivity.findById(id);
    if (!existingActivity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found.'
      });
    }

    // Remove fields that shouldn't be updated
    delete updates._id;
    delete updates.createdAt;

    // Trim string fields
    if (updates.title) updates.title = updates.title.trim();
    if (updates.category) updates.category = updates.category.trim();
    if (updates.location) updates.location = updates.location.trim();
    if (updates.description) updates.description = updates.description.trim();

    // Handle uploaded images
    if (req.files && req.files.length > 0) {
      if (updates.replaceImages === 'true') {
        // Delete old images if replacing
        existingActivity.images.forEach(imagePath => {
          const fullPath = path.join(__dirname, '../uploads', imagePath);
          deleteFile(fullPath);
        });
        updates.images = req.files.map(file => `activities/${file.filename}`);
      } else {
        // Add new images to existing ones
        const newImages = req.files.map(file => `activities/${file.filename}`);
        updates.images = [...existingActivity.images, ...newImages];
      }
    }

    // Convert numeric fields
    if (updates.price !== undefined) updates.price = Number(updates.price);
    if (updates.durationHours !== undefined) updates.durationHours = Number(updates.durationHours);
    if (updates.rating !== undefined) updates.rating = Number(updates.rating);

    const activity = await AdventureActivity.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    // Convert image paths to full URLs for response
    const activityResponse = activity.toObject();
    activityResponse.images = activityResponse.images.map(imagePath =>
      getFileUrl(req, imagePath)
    );

    return res.status(200).json({
      success: true,
      message: 'Activity updated successfully',
      data: activityResponse
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

// Delete Activity (Admin only)
exports.deleteActivity = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid activity ID format.'
      });
    }

    const activity = await AdventureActivity.findByIdAndDelete(id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found.'
      });
    }

    // Delete associated image files
    if (activity.images && activity.images.length > 0) {
      activity.images.forEach(imagePath => {
        const fullPath = path.join(__dirname, '../uploads', imagePath);
        deleteFile(fullPath);
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Activity deleted successfully',
      data: activity
    });
  } catch (err) {
    next(err);
  }
};

// Get Activities by Difficulty (Public)
exports.getActivitiesByDifficulty = async (req, res, next) => {
  try {
    const { difficulty } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const validDifficulties = ['Easy', 'Medium', 'Hard'];
    if (!validDifficulties.includes(difficulty)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid difficulty level. Must be: Easy, Medium, or Hard.'
      });
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const activities = await AdventureActivity.find({ difficulty })
      .sort({ rating: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Convert image paths to full URLs
    const activitiesWithUrls = activities.map(activity => {
      const activityObj = activity.toObject();
      activityObj.images = activityObj.images.map(imagePath =>
        getFileUrl(req, imagePath)
      );
      return activityObj;
    });

    const total = await AdventureActivity.countDocuments({ difficulty });

    return res.status(200).json({
      success: true,
      data: activitiesWithUrls,
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

// Get Activities Stats (Admin only)
exports.getActivityStats = async (req, res, next) => {
  try {
    const total = await AdventureActivity.countDocuments();
    
    const avgRating = await AdventureActivity.aggregate([
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);

    const avgPrice = await AdventureActivity.aggregate([
      { $group: { _id: null, avgPrice: { $avg: '$price' } } }
    ]);

    const categoryStats = await AdventureActivity.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const difficultyStats = await AdventureActivity.aggregate([
      { $group: { _id: '$difficulty', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const topRated = await AdventureActivity.find()
      .sort({ rating: -1 })
      .limit(5)
      .select('title location rating difficulty category price');

    const recentlyAdded = await AdventureActivity.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title location createdAt difficulty category price');

    return res.status(200).json({
      success: true,
      data: {
        totalActivities: total,
        averageRating: avgRating[0]?.avgRating || 0,
        averagePrice: avgPrice[0]?.avgPrice || 0,
        categoryBreakdown: categoryStats,
        difficultyBreakdown: difficultyStats,
        topRatedActivities: topRated,
        recentlyAddedActivities: recentlyAdded
      }
    });
  } catch (err) {
    next(err);
  }
};