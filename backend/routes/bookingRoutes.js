const express = require('express');
const router = express.Router();
const { verifyToken, requireOwner } = require('../middleware/authMiddleware');
const {
  createBookingRequest, getMyBookings, getOwnerBookings, updateBookingStatus, cancelMyBooking,
} = require('../controllers/bookingController');
router.post('/', verifyToken, createBookingRequest);
router.get('/my', verifyToken, getMyBookings);
router.get('/owner', verifyToken, requireOwner, getOwnerBookings);
router.patch('/:id/status', verifyToken, requireOwner, updateBookingStatus);
router.patch('/:id/cancel', verifyToken, cancelMyBooking);
module.exports = router;
