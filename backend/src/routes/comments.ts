import express, { RequestHandler } from 'express';
import auth from '../middleware/authMiddleware';
import { addComment, getComments } from '../controllers/commentsController';

const router = express.Router();

router.post('/:cat_id/comments', auth, addComment as RequestHandler);
router.get('/:cat_id/comments', getComments);

export default router;
