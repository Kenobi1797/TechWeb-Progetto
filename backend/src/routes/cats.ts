import express, { RequestHandler } from 'express';
import multer from 'multer';
import auth from '../middleware/authMiddleware';
import { createCat, getAllCats, getCatById } from '../controllers/catsController';

const router = express.Router();

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (_req, file, cb) => {
    // Genera un nome file sicuro
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${timestamp}-${safeName}`);
  },
});

// Configurazione multer con validazione
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1
  },
  fileFilter: (_req, file, cb) => {
    // Controlla il tipo MIME
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Formato file non supportato. Usa JPG, PNG o WebP'));
    }
  }
});

router.post('/', auth, upload.single('image'), createCat as RequestHandler);
router.get('/', getAllCats);
router.get('/:id', getCatById);

export default router;
