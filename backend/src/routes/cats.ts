import type { Router } from 'express';
import express = require('express');
import multer, { StorageEngine, FileFilterCallback } from 'multer';
import auth from '../middleware/authMiddleware';
const catsController = require('../controllers/catsController');

const router: Router = express.Router();

// Multer config
const storage: StorageEngine = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const name = `${Date.now()}-${file.originalname}`;
    cb(null, name);
  }
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb: FileFilterCallback) => {
    // Accetta solo immagini
    if (!file.mimetype.startsWith('image/')) {
      return cb(null, false);
    }
    cb(null, true);
  }
});

// Rimuovi il wrap, ora i controller sono compatibili
router.post('/', auth, upload.single('image'), catsController.createCat);
router.get('/', catsController.getAllCats);
router.get('/:id', catsController.getCatById);

export = router;
