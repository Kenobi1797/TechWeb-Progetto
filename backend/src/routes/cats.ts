import express, { RequestHandler } from 'express';
import multer from 'multer';
import auth from '../middleware/authMiddleware';
import { createCat, getAllCats, getCatById } from '../controllers/catsController';

const router = express.Router();

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

router.post('/', auth, upload.single('image'), createCat as RequestHandler);
router.get('/', getAllCats);
router.get('/:id', getCatById);

export default router;
