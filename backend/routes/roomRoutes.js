const express = require('express');
const router = express.Router();
const {
  getRoomsByPropertyId,
  createRoom,
  updateRoom,
  deleteRoom,
} = require('../controllers/roomController');
const { verifyToken, requireOwner } = require('../middleware/authMiddleware');

// Get rooms for a property
router.get('/property/:propertyId', getRoomsByPropertyId);

// Room CRUD (Owner only)
router.post('/', verifyToken, requireOwner, createRoom);
router.put('/:id', verifyToken, requireOwner, updateRoom);
router.delete('/:id', verifyToken, requireOwner, deleteRoom);

module.exports = router;
