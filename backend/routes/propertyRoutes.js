const express = require('express');
const router = express.Router();
const {
  getAllProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  uploadPropertyImages,
  deletePropertyImage,
  getOwnerProperties,
  getOwnerDashboardStats,
} = require('../controllers/propertyController');
const {
  addFacility,
  deleteFacility,
  addRule,
  deleteRule,
} = require('../controllers/facilityRuleController');
const { verifyToken, optionalToken, requireOwner } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Owner specific routes (must be defined before /:id)
router.get('/owner/my-properties', verifyToken, requireOwner, getOwnerProperties);
router.get('/owner/dashboard-stats', verifyToken, requireOwner, getOwnerDashboardStats);

// Public / User routes
router.get('/', optionalToken, getAllProperties);
router.get('/:id', optionalToken, getPropertyById);

// Owner property CRUD
router.post('/', verifyToken, requireOwner, createProperty);
router.put('/:id', verifyToken, requireOwner, updateProperty);
router.delete('/:id', verifyToken, requireOwner, deleteProperty);

// Image management
router.post('/:id/images', verifyToken, requireOwner, upload.array('images', 10), uploadPropertyImages);
router.delete('/:id/images/:imageId', verifyToken, requireOwner, deletePropertyImage);

// Facilities management
router.post('/:propertyId/facilities', verifyToken, requireOwner, addFacility);
router.delete('/:propertyId/facilities/:id', verifyToken, requireOwner, deleteFacility);

// Rules management
router.post('/:propertyId/rules', verifyToken, requireOwner, addRule);
router.delete('/:propertyId/rules/:id', verifyToken, requireOwner, deleteRule);

module.exports = router;
