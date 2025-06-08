const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { addComment, getComments } = require('../controllers/commentsController');

router.post('/:id/comments', auth, addComment);
router.get('/:id/comments', getComments);

module.exports = router;
