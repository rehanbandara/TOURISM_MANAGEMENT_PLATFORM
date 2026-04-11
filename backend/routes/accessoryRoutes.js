// const express = require('express');
// const router = express.Router();
// const multer = require('multer');
// const path = require('path');
// const { addAccessory } = require('../Controllers/accessoryController');
// const { getAllAccessories } = require('../Controllers/accessoryController');
// const { deleteAccessory } = require('../Controllers/accessoryController');
// const { getAllAccessories1 } = require('../Controllers/accessoryController');
// const { updateAccessoryWithImages } = require('../Controllers/accessoryController');
// const { getAccessoryById } = require('../Controllers/accessoryController');
// const {  updateAccessory } = require('../Controllers/accessoryController');


// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'uploads/');
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + '-' + file.originalname);
//   },
// });

// const upload = multer({ storage });

// router.post('/', upload.array('images', 5), addAccessory);

// router.get('/accessories', getAllAccessories);
// router.get('/accessories1', getAllAccessories1);

// router.delete('/:id', deleteAccessory);
// router.put("/:id", updateAccessoryWithImages);
// router.get("/:id", getAccessoryById);

// router.put('/:id', upload.array('images', 3), updateAccessory);



// module.exports = router;


const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const {
  addAccessory,
  getAllAccessories,
  getAllAccessories1,
  deleteAccessory,
  getAccessoryById,
  updateAccessory, // ✅ Use only one update function
} = require('../controllers/accessoryController');

// ✅ Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Make sure uploads folder exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });

// ✅ Routes
// Note: These are mounted at /api/accessories in app.js
router.post('/', upload.array('images', 5), addAccessory);        // POST /api/accessories - Create Accessory
router.get('/', getAllAccessories);                               // GET /api/accessories - Get All Accessories (with filters)
router.get('/all', getAllAccessories1);                           // GET /api/accessories/all - Alternative get all
router.get('/:id', getAccessoryById);                             // GET /api/accessories/:id - Get by ID
router.delete('/:id', deleteAccessory);                           // DELETE /api/accessories/:id - Delete Accessory
router.put('/:id', upload.array('images', 3), updateAccessory);   // PUT /api/accessories/:id - Update Accessory

module.exports = router;
