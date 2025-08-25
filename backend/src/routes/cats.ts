import express, { RequestHandler } from 'express';
import auth from '../middleware/authMiddleware';
import { createCat, getAllCats, getCatById, getUserCats, updateCatStatus } from '../controllers/catsController';

const router = express.Router();

// Middleware per parsing JSON con limite più alto per le immagini Base64
router.use(express.json({ limit: '10mb' }));

router.post('/', auth, createCat as RequestHandler);
router.get('/', getAllCats);
router.get('/my-cats', auth, getUserCats as RequestHandler);
router.get('/:id', getCatById);
router.patch('/:id/status', auth, updateCatStatus as RequestHandler);

export default router;
