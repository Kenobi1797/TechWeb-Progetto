const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { addComment, getComments } = require('../controllers/commentsController');

router.post('/:cat_id/comments', auth, addComment);
router.get('/:cat_id/comments', getComments);

module.exports = router;
