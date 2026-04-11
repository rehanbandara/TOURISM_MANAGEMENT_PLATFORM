const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // Polymorphic reference using refPath
    item: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'itemModel',
    },
    itemModel: {
      type: String,
      required: true,
      enum: ['AdventureActivity', 'Destination'],
    },
  },
  { timestamps: true }
);

// Ensure one unique wishlist entry per user per item
wishlistSchema.index({ user: 1, item: 1, itemModel: 1 }, { unique: true });

module.exports = mongoose.model('Wishlist', wishlistSchema);
