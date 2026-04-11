const Wishlist = require('../models/wishlistModel');

// Add to wishlist
exports.addToWishlist = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const { itemId, itemType } = req.body; // itemType: 'activity' | 'destination'

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    if (!itemId || !itemType) {
      return res.status(400).json({ success: false, message: 'itemId and itemType are required.' });
    }

    if (!itemId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid item ID format.' });
    }

    const itemModel = itemType === 'activity' ? 'AdventureActivity' : itemType === 'destination' ? 'Destination' : null;
    if (!itemModel) {
      return res.status(400).json({ success: false, message: 'Invalid itemType. Use activity or destination.' });
    }

    const existing = await Wishlist.findOne({ user: userId, item: itemId, itemModel });
    if (existing) {
      return res.status(200).json({ success: true, message: 'Already in wishlist.', data: existing });
    }

    const entry = await Wishlist.create({ user: userId, item: itemId, itemModel });
    return res.status(201).json({ success: true, message: 'Added to wishlist.', data: entry });
  } catch (err) {
    next(err);
  }
};

// Remove from wishlist
exports.removeFromWishlist = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const { itemId, itemType } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const itemModel = itemType === 'activity' ? 'AdventureActivity' : itemType === 'destination' ? 'Destination' : null;
    if (!itemModel || !itemId?.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid item or type.' });
    }

    const removed = await Wishlist.findOneAndDelete({ user: userId, item: itemId, itemModel });
    if (!removed) {
      return res.status(404).json({ success: false, message: 'Item not found in wishlist.' });
    }

    return res.status(200).json({ success: true, message: 'Removed from wishlist.' });
  } catch (err) {
    next(err);
  }
};

// Get user wishlist
exports.getMyWishlist = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const wishlist = await Wishlist.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate({ path: 'item', select: 'name title location images price entryFee difficulty', options: { lean: true } });

    return res.status(200).json({ success: true, data: wishlist });
  } catch (err) {
    next(err);
  }
};

// Check if item is in wishlist
exports.isInWishlist = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const { itemId, itemType } = req.query;
    if (!userId) return res.status(200).json({ success: true, data: { inWishlist: false } });

    const itemModel = itemType === 'activity' ? 'AdventureActivity' : itemType === 'destination' ? 'Destination' : null;
    if (!itemModel || !itemId?.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid item or type.' });
    }
    const existing = await Wishlist.findOne({ user: userId, item: itemId, itemModel });
    return res.status(200).json({ success: true, data: { inWishlist: !!existing } });
  } catch (err) {
    next(err);
  }
};
