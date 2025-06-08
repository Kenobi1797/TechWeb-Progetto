const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/authMiddleware');
const { createCat, getAllCats, getCatById } = require('../controllers/catsController');

// Multer config
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const name = `${Date.now()}-${file.originalname}`;
    cb(null, name);
  }
});
const upload = multer({ storage });

router.post('/', auth, upload.single('image'), createCat);
router.get('/', getAllCats);
router.get('/:id', getCatById);

module.exports = router;
