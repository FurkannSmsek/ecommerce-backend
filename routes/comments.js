const express = require('express');
const router = express.Router();
const {
  addComment,
  getCommentsByProduct,
  getCommentsBySeller,
  getCommentsByUser,
  deleteComment,
} = require('../controllers/commentController');

router.post('/', addComment); // POST /api/comments
router.get('/product/:productId', getCommentsByProduct); // GET /api/comments/product/:productId
router.get('/seller/:sellerId', getCommentsBySeller); // GET /api/comments/seller/:sellerId
router.get('/user/:userId', getCommentsByUser);
router.delete('/:commentId', deleteComment);



module.exports = router;
