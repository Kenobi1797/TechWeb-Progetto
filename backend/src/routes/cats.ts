import express, { RequestHandler } from 'express';
import multer from 'multer';
import auth from '../middleware/authMiddleware';
import { createCat, getAllCats, getCatById, getUserCats, updateCatStatus, updateCat } from '../controllers/catsController';

const router = express.Router();

// Configurazione multer per gestire FormData
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { 
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Middleware per parsing JSON con limite più alto per le immagini Base64
router.use(express.json({ limit: '10mb' }));

router.post('/', auth, upload.single('image'), createCat as RequestHandler);
router.get('/', getAllCats);
router.get('/my-cats', auth, getUserCats as RequestHandler);
router.get('/:id', getCatById);
router.put('/:id', auth, upload.single('image'), updateCat as RequestHandler);
router.patch('/:id/status', auth, updateCatStatus as RequestHandler);

export default router;
