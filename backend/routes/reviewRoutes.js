const express = require('express');
const router = express.Router();
const {
  getPropertyReviews,
  createReview,
  deleteReview,
} = require('../controllers/reviewController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/property/:propertyId', getPropertyReviews);
router.post('/', verifyToken, createReview);
router.delete('/:id', verifyToken, deleteReview);

module.exports = router;
