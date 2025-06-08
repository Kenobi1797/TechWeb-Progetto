import type { Router } from 'express';
import express = require('express');
import auth from '../middleware/authMiddleware';
const commentsController = require('../controllers/commentsController');

const router: Router = express.Router();

router.post('/:cat_id/comments', auth, commentsController.addComment);
router.get('/:cat_id/comments', commentsController.getComments);

export = router;
