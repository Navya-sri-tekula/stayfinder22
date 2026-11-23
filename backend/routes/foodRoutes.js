const express = require('express');
const router = express.Router();
const {
  getFoodByPropertyId,
  createFood,
  updateFood,
  deleteFood,
} = require('../controllers/foodController');
const { verifyToken, requireOwner } = require('../middleware/authMiddleware');

// Get food menu for a property
router.get('/property/:propertyId', getFoodByPropertyId);

// Food menu CRUD (Owner only)
router.post('/', verifyToken, requireOwner, createFood);
router.put('/:id', verifyToken, requireOwner, updateFood);
router.delete('/:id', verifyToken, requireOwner, deleteFood);

module.exports = router;
