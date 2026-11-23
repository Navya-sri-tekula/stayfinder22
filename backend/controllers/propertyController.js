const { getModels } = require('../models');
const PropertyService = require('../services/propertyService');
const { uploadImageBuffer } = require('../config/cloudinary');

// @desc    Get all properties with filtering, search, map radius & pagination
// @route   GET /api/properties
const getAllProperties = async (req, res, next) => {
  try {
    const currentUserId = req.user ? req.user.id : null;
    const result = await PropertyService.searchProperties(req.query, currentUserId);
    res.json({
      success: true,
      data: result.properties,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single property by ID
// @route   GET /api/properties/:id
const getPropertyById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { Property, PropertyImage, Room, Facility, FoodMenu, PropertyRule, Review, User, Wishlist } = getModels();

    const property = await Property.findByPk(id, {
      include: [
        { model: PropertyImage, as: 'images' },
        { model: Room, as: 'rooms' },
        { model: Facility, as: 'facilities' },
        { model: FoodMenu, as: 'food_menus' },
        { model: PropertyRule, as: 'rules' },
        {
          model: Review,
          as: 'reviews',
          include: [{ model: User, as: 'user', attributes: ['id', 'name'] }],
        },
        { model: User, as: 'owner', attributes: ['id', 'name', 'phone', 'email'] },
      ],
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found.',
      });
    }

    const propData = property.toJSON();

    // Calculate beds summary
    let totalBeds = 0;
    let occupiedBeds = 0;
    const rooms = (propData.rooms || []).map((room) => {
      const avail = Math.max(0, room.total_beds - room.occupied_beds);
      totalBeds += room.total_beds;
      occupiedBeds += room.occupied_beds;
      return {
        ...room,
        available_beds: avail,
      };
    });

    const availableBeds = Math.max(0, totalBeds - occupiedBeds);

    // Calculate rating
    const reviews = propData.reviews || [];
    const reviewCount = reviews.length;
    const avgRating =
      reviewCount > 0
        ? Math.round((reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviewCount) * 10) / 10
        : 0;

    // Check wishlist
    let isWishlisted = false;
    if (req.user) {
      const count = await Wishlist.count({
        where: { user_id: req.user.id, property_id: property.id },
      });
      isWishlisted = count > 0;
    }

    res.json({
      success: true,
      data: {
        ...propData,
        rooms,
        total_beds: totalBeds,
        occupied_beds: occupiedBeds,
        available_beds: availableBeds,
        average_rating: avgRating,
        review_count: reviewCount,
        is_wishlisted: isWishlisted,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new property listing (Owner only)
// @route   POST /api/properties
const createProperty = async (req, res, next) => {
  try {
    const {
      name,
      type,
      description,
      address,
      city,
      state,
      pincode,
      latitude,
      longitude,
      starting_price,
      status,
      facilities,
      rules,
      images,
    } = req.body;

    if (!name || !type || !address || !city || latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, type, address, city, latitude, and longitude.',
      });
    }

    const { Property, Facility, PropertyRule, PropertyImage } = getModels();

    const property = await Property.create({
      owner_id: req.user.id,
      name: name.trim(),
      type: type.toLowerCase(),
      description: description ? description.trim() : null,
      address: address.trim(),
      city: city.trim(),
      state: state ? state.trim() : null,
      pincode: pincode ? pincode.trim() : null,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      starting_price: starting_price ? parseFloat(starting_price) : 0,
      status: status || 'available',
    });

    // Add initial facilities if provided
    if (facilities && Array.isArray(facilities)) {
      const facilityRows = facilities
        .filter((f) => f && f.trim())
        .map((f) => ({ property_id: property.id, facility_name: f.trim() }));
      if (facilityRows.length > 0) {
        await Facility.bulkCreate(facilityRows);
      }
    }

    // Add initial rules if provided
    if (rules && Array.isArray(rules)) {
      const ruleRows = rules
        .filter((r) => r.rule_name && r.rule_value)
        .map((r) => ({
          property_id: property.id,
          rule_name: r.rule_name.trim(),
          rule_value: r.rule_value.trim(),
        }));
      if (ruleRows.length > 0) {
        await PropertyRule.bulkCreate(ruleRows);
      }
    }

    // Add initial image URLs if provided as array of strings
    if (images && Array.isArray(images)) {
      const imageRows = images
        .filter((img) => img && typeof img === 'string')
        .map((url) => ({ property_id: property.id, image_url: url.trim() }));
      if (imageRows.length > 0) {
        await PropertyImage.bulkCreate(imageRows);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Property listing created successfully.',
      data: property,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update property listing (Owner only)
// @route   PUT /api/properties/:id
const updateProperty = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { Property } = getModels();

    const property = await Property.findByPk(id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found.' });
    }

    // Check ownership
    if (property.owner_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: you can only update properties that belong to you.',
      });
    }

    const {
      name,
      type,
      description,
      address,
      city,
      state,
      pincode,
      latitude,
      longitude,
      starting_price,
      status,
    } = req.body;

    if (name) property.name = name.trim();
    if (type) property.type = type.toLowerCase();
    if (description !== undefined) property.description = description;
    if (address) property.address = address.trim();
    if (city) property.city = city.trim();
    if (state !== undefined) property.state = state;
    if (pincode !== undefined) property.pincode = pincode;
    if (latitude !== undefined) property.latitude = parseFloat(latitude);
    if (longitude !== undefined) property.longitude = parseFloat(longitude);
    if (starting_price !== undefined) property.starting_price = parseFloat(starting_price);
    if (status) property.status = status;

    await property.save();

    res.json({
      success: true,
      message: 'Property updated successfully.',
      data: property,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete property (Owner only)
// @route   DELETE /api/properties/:id
const deleteProperty = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { Property } = getModels();

    const property = await Property.findByPk(id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found.' });
    }

    if (property.owner_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: you can only delete properties that belong to you.',
      });
    }

    await property.destroy();

    res.json({
      success: true,
      message: 'Property deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload images for a property (Owner only)
// @route   POST /api/properties/:id/images
const uploadPropertyImages = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { Property, PropertyImage } = getModels();

    const property = await Property.findByPk(id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found.' });
    }

    if (property.owner_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: you can only upload images for your own properties.',
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No image files provided.',
      });
    }

    const createdImages = [];
    for (const file of req.files) {
      const imageUrl = await uploadImageBuffer(file.buffer, file.originalname);
      const imgRecord = await PropertyImage.create({
        property_id: property.id,
        image_url: imageUrl,
      });
      createdImages.push(imgRecord);
    }

    res.status(201).json({
      success: true,
      message: `${createdImages.length} image(s) uploaded successfully.`,
      data: createdImages,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a property image (Owner only)
// @route   DELETE /api/properties/:id/images/:imageId
const deletePropertyImage = async (req, res, next) => {
  try {
    const { id, imageId } = req.params;
    const { Property, PropertyImage } = getModels();

    const property = await Property.findByPk(id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found.' });
    }

    if (property.owner_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    const image = await PropertyImage.findOne({
      where: { id: imageId, property_id: id },
    });

    if (!image) {
      return res.status(404).json({ success: false, message: 'Image not found.' });
    }

    await image.destroy();

    res.json({
      success: true,
      message: 'Image removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all properties owned by current user
// @route   GET /api/properties/owner/my-properties
const getOwnerProperties = async (req, res, next) => {
  try {
    const { Property, PropertyImage, Room, Review } = getModels();

    const properties = await Property.findAll({
      where: { owner_id: req.user.id },
      include: [
        { model: PropertyImage, as: 'images' },
        { model: Room, as: 'rooms' },
        { model: Review, as: 'reviews', attributes: ['rating'] },
      ],
      order: [['created_at', 'DESC']],
    });

    const formatted = properties.map((p) => {
      const data = p.toJSON();
      const rooms = data.rooms || [];
      let totalBeds = 0;
      let occupiedBeds = 0;

      rooms.forEach((r) => {
        totalBeds += r.total_beds;
        occupiedBeds += r.occupied_beds;
      });

      const reviews = data.reviews || [];
      const reviewCount = reviews.length;
      const avgRating =
        reviewCount > 0
          ? Math.round((reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviewCount) * 10) / 10
          : 0;

      return {
        ...data,
        total_rooms: rooms.length,
        total_beds: totalBeds,
        occupied_beds: occupiedBeds,
        available_beds: Math.max(0, totalBeds - occupiedBeds),
        average_rating: avgRating,
        review_count: reviewCount,
      };
    });

    res.json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get owner dashboard aggregate stats
// @route   GET /api/properties/owner/dashboard-stats
const getOwnerDashboardStats = async (req, res, next) => {
  try {
    const { Property, Room, Review } = getModels();

    const properties = await Property.findAll({
      where: { owner_id: req.user.id },
      include: [
        { model: Room, as: 'rooms' },
        { model: Review, as: 'reviews' },
      ],
    });

    let totalProperties = properties.length;
    let totalRooms = 0;
    let totalBeds = 0;
    let occupiedBeds = 0;
    let totalReviews = 0;

    properties.forEach((p) => {
      const rooms = p.rooms || [];
      totalRooms += rooms.length;
      rooms.forEach((r) => {
        totalBeds += r.total_beds;
        occupiedBeds += r.occupied_beds;
      });
      totalReviews += (p.reviews || []).length;
    });

    res.json({
      success: true,
      data: {
        totalProperties,
        totalRooms,
        totalBeds,
        occupiedBeds,
        availableBeds: Math.max(0, totalBeds - occupiedBeds),
        totalReviews,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  uploadPropertyImages,
  deletePropertyImage,
  getOwnerProperties,
  getOwnerDashboardStats,
};
