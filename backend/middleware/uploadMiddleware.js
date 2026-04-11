const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
const destinationsDir = path.join(uploadsDir, 'destinations');
const activitiesDir = path.join(uploadsDir, 'activities');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(destinationsDir)) {
  fs.mkdirSync(destinationsDir, { recursive: true });
}
if (!fs.existsSync(activitiesDir)) {
  fs.mkdirSync(activitiesDir, { recursive: true });
}

// Storage configuration for destinations
const destinationStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, destinationsDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: destination_timestamp_originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'destination_' + uniqueSuffix + ext);
  }
});

// Storage configuration for activities
const activityStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, activitiesDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: activity_timestamp_originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'activity_' + uniqueSuffix + ext);
  }
});

// File filter for images only
const imageFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Upload configurations
const uploadDestinationImages = multer({
  storage: destinationStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10 // Maximum 10 files
  }
});

const uploadActivityImages = multer({
  storage: activityStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10 // Maximum 10 files
  }
});

// Middleware functions
exports.uploadDestinationImages = uploadDestinationImages.array('images', 10);
exports.uploadActivityImages = uploadActivityImages.array('images', 10);

// Single image upload for profile pictures, etc.
exports.uploadSingleImage = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, 'single_' + uniqueSuffix + ext);
    }
  }),
  fileFilter: imageFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit for single images
  }
}).single('image');

// Helper function to delete files
exports.deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

// Helper function to get file URL
exports.getFileUrl = (req, filename) => {
  if (!filename) return null;
  return `${req.protocol}://${req.get('host')}/uploads/${filename}`;
};