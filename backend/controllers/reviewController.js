const Review = require('../models/reviewModel');
const AdventureActivity = require('../models/activityModel');
const Destination = require('../models/destinationModel');

// Create Review (Public - anyone can review)
exports.createReview = async (req, res, next) => {
  try {
    const { clientName, clientEmail, activity, destination, rating, comment, reviewType } = req.body;

    // Validate required fields
    if (!clientName || !clientEmail || !rating || !reviewType) {
      return res.status(400).json({
        success: false,
        message: 'Client name, email, rating, and review type are required.'
      });
    }

    // Validate review type
    if (!['activity', 'destination'].includes(reviewType)) {
      return res.status(400).json({
        success: false,
        message: 'Review type must be either "activity" or "destination".'
      });
    }

    // Validate that either activity or destination is provided based on type
    if (reviewType === 'activity' && !activity) {
      return res.status(400).json({
        success: false,
        message: 'Activity ID is required for activity reviews.'
      });
    }

    if (reviewType === 'destination' && !destination) {
      return res.status(400).json({
        success: false,
        message: 'Destination ID is required for destination reviews.'
      });
    }

    const targetId = reviewType === 'activity' ? activity : destination;

    // Validate ID format
    if (!targetId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: `Invalid ${reviewType} ID format.`
      });
    }

    // Check if target exists
    let existingTarget;
    if (reviewType === 'activity') {
      existingTarget = await AdventureActivity.findById(activity);
      if (!existingTarget) {
        return res.status(404).json({
          success: false,
          message: 'Activity not found.'
        });
      }
    } else {
      existingTarget = await Destination.findById(destination);
      if (!existingTarget) {
        return res.status(404).json({
          success: false,
          message: 'Destination not found.'
        });
      }
    }

    // Check if client already reviewed this item
    const existingReview = await Review.findOne({
      clientEmail: clientEmail.toLowerCase(),
      [reviewType]: targetId
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: `You have already reviewed this ${reviewType}.`
      });
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5.'
      });
    }

    // Create new review
    const reviewData = {
      clientName: clientName.trim(),
      clientEmail: clientEmail.toLowerCase().trim(),
      reviewType,
      rating: Number(rating),
      comment: comment?.trim()
    };

    // Add the appropriate reference
    if (reviewType === 'activity') {
      reviewData.activity = activity;
    } else {
      reviewData.destination = destination;
    }

    const review = new Review(reviewData);
    await review.save();

    // Update rating for the target item
    if (reviewType === 'activity') {
      await updateActivityRating(activity);
    } else {
      await updateDestinationRating(destination);
    }

    // Populate details for response
    const populateField = reviewType === 'activity' ? 'activity' : 'destination';
    const selectFields = reviewType === 'activity' ? 'title location category' : 'name location description';
    
    await review.populate(populateField, selectFields);

    return res.status(201).json({
      success: true,
      message: 'Review added successfully',
      data: review
    });
  } catch (err) {
    next(err);
  }
};

// Get All Reviews (Public)
exports.getAllReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, activity, rating, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    let query = {};
    
    if (activity) {
      if (!activity.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid activity ID format.'
        });
      }
      query.activity = activity;
    }

    if (rating) {
      query.rating = Number(rating);
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const reviews = await Review.find(query)
      .populate('activity', 'title location category price difficulty')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    const total = await Review.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: reviews,
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

// Get Review by ID (Public)
exports.getReviewById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid review ID format.'
      });
    }

    const review = await Review.findById(id).populate('activity', 'title location category price difficulty');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found.'
      });
    }

    return res.status(200).json({
      success: true,
      data: review
    });
  } catch (err) {
    next(err);
  }
};

// Get Reviews for Specific Activity (Public)
exports.getActivityReviews = async (req, res, next) => {
  try {
    const { activityId } = req.params;
    const { page = 1, limit = 10, rating, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    if (!activityId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid activity ID format.'
      });
    }

    // Check if activity exists
    const activity = await AdventureActivity.findById(activityId);
    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found.'
      });
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    let query = { activity: activityId };
    
    if (rating) {
      query.rating = Number(rating);
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const reviews = await Review.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    const total = await Review.countDocuments(query);

    // Calculate rating statistics
    const ratingStats = await Review.aggregate([
      { $match: { activity: activity._id } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratings: {
            $push: '$rating'
          }
        }
      }
    ]);

    const stats = ratingStats[0] || { averageRating: 0, totalReviews: 0, ratings: [] };

    return res.status(200).json({
      success: true,
      data: reviews,
      activity: {
        id: activity._id,
        title: activity.title,
        location: activity.location,
        category: activity.category
      },
      stats: {
        averageRating: stats.averageRating ? Number(stats.averageRating.toFixed(1)) : 0,
        totalReviews: stats.totalReviews
      },
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

// Get Destination Reviews with Pagination and Filtering
exports.getDestinationReviews = async (req, res, next) => {
  try {
    const { destinationId } = req.params;
    const { page = 1, limit = 10, rating, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    if (!destinationId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid destination ID format.'
      });
    }

    // Check if destination exists
    const destination = await Destination.findById(destinationId);
    if (!destination) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found.'
      });
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    let query = { destination: destinationId };
    
    if (rating) {
      query.rating = Number(rating);
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const reviews = await Review.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    const total = await Review.countDocuments(query);

    // Calculate rating statistics
    const ratingStats = await Review.aggregate([
      { $match: { destination: destination._id } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratings: {
            $push: '$rating'
          }
        }
      }
    ]);

    const stats = ratingStats[0] || { averageRating: 0, totalReviews: 0, ratings: [] };

    return res.status(200).json({
      success: true,
      data: reviews,
      destination: {
        id: destination._id,
        name: destination.name,
        location: destination.location
      },
      stats: {
        averageRating: stats.averageRating ? Number(stats.averageRating.toFixed(1)) : 0,
        totalReviews: stats.totalReviews
      },
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

// Update Review (Admin only or review owner)
exports.updateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid review ID format.'
      });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found.'
      });
    }

    // Update fields
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5.'
        });
      }
      review.rating = Number(rating);
    }

    if (comment !== undefined) {
      review.comment = comment.trim();
    }

    await review.save();

    // Update activity's average rating if rating was changed
    if (rating !== undefined) {
      await updateActivityRating(review.activity);
    }

    await review.populate('activity', 'title location category');

    return res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: review
    });
  } catch (err) {
    next(err);
  }
};

// Delete Review (Admin only)
exports.deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid review ID format.'
      });
    }

    const review = await Review.findByIdAndDelete(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found.'
      });
    }

    // Update activity's average rating after deletion
    await updateActivityRating(review.activity);

    return res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
      data: review
    });
  } catch (err) {
    next(err);
  }
};

// Get Review Statistics (Admin only)
exports.getReviewStats = async (req, res, next) => {
  try {
    const totalReviews = await Review.countDocuments();

    const avgRating = await Review.aggregate([
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);

    const ratingDistribution = await Review.aggregate([
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const topRatedActivities = await Review.aggregate([
      {
        $group: {
          _id: '$activity',
          averageRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 }
        }
      },
      { $match: { reviewCount: { $gte: 2 } } },
      { $sort: { averageRating: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'adventureactivities',
          localField: '_id',
          foreignField: '_id',
          as: 'activity'
        }
      },
      { $unwind: '$activity' },
      {
        $project: {
          activityTitle: '$activity.title',
          activityLocation: '$activity.location',
          averageRating: 1,
          reviewCount: 1
        }
      }
    ]);

    const recentReviews = await Review.find()
      .populate('activity', 'title location')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('clientName rating comment createdAt');

    return res.status(200).json({
      success: true,
      data: {
        totalReviews,
        averageRating: avgRating[0]?.avgRating || 0,
        ratingDistribution,
        topRatedActivities,
        recentReviews
      }
    });
  } catch (err) {
    next(err);
  }
};

// Helper function to update activity rating
async function updateActivityRating(activityId) {
  try {
    const reviews = await Review.find({ activity: activityId });
    
    if (reviews.length === 0) {
      // No reviews, set rating to 0
      await AdventureActivity.findByIdAndUpdate(activityId, { rating: 0 });
    } else {
      // Calculate average rating
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / reviews.length;
      
      await AdventureActivity.findByIdAndUpdate(activityId, { 
        rating: Number(averageRating.toFixed(1))
      });
    }
  } catch (error) {
    console.error('Error updating activity rating:', error);
  }
}

// Helper function to update destination rating
async function updateDestinationRating(destinationId) {
  try {
    const reviews = await Review.find({ destination: destinationId });
    
    if (reviews.length === 0) {
      // No reviews, set rating to 0
      await Destination.findByIdAndUpdate(destinationId, { rating: 0 });
    } else {
      // Calculate average rating
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / reviews.length;
      
      await Destination.findByIdAndUpdate(destinationId, { 
        rating: Number(averageRating.toFixed(1))
      });
    }
  } catch (error) {
    console.error('Error updating destination rating:', error);
  }
}