const express = require('express');
const router = express.Router();
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} = require('../controllers/wishlistController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', verifyToken, getWishlist);
router.post('/', verifyToken, addToWishlist);
router.delete('/:propertyId', verifyToken, removeFromWishlist);

module.exports = router;
