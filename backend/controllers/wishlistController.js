const { getModels } = require('../models');

// @desc    Get user's wishlist
// @route   GET /api/wishlist
const getWishlist = async (req, res, next) => {
  try {
    const { Wishlist, Property, PropertyImage, Room, Review } = getModels();

    const wishlistItems = await Wishlist.findAll({
      where: { user_id: req.user.id },
      include: [
        {
          model: Property,
          as: 'property',
          include: [
            { model: PropertyImage, as: 'images' },
            { model: Room, as: 'rooms' },
            { model: Review, as: 'reviews', attributes: ['rating'] },
          ],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    const formatted = wishlistItems
      .filter((item) => item.property !== null)
      .map((item) => {
        const prop = item.property.toJSON();
        const rooms = prop.rooms || [];
        let totalBeds = 0;
        let occupiedBeds = 0;
        rooms.forEach((r) => {
          totalBeds += r.total_beds;
          occupiedBeds += r.occupied_beds;
        });

        const reviews = prop.reviews || [];
        const avgRating =
          reviews.length > 0
            ? Math.round((reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length) * 10) / 10
            : 0;

        return {
          wishlist_id: item.id,
          saved_at: item.created_at,
          ...prop,
          total_beds: totalBeds,
          occupied_beds: occupiedBeds,
          available_beds: Math.max(0, totalBeds - occupiedBeds),
          average_rating: avgRating,
          review_count: reviews.length,
          is_wishlisted: true,
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

// @desc    Add property to wishlist
// @route   POST /api/wishlist
const addToWishlist = async (req, res, next) => {
  try {
    const { property_id } = req.body;

    if (!property_id) {
      return res.status(400).json({
        success: false,
        message: 'Please provide property_id.',
      });
    }

    const { Wishlist, Property } = getModels();

    // Verify property exists
    const property = await Property.findByPk(property_id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found.' });
    }

    // Check if already in wishlist to prevent duplicate entries
    const existing = await Wishlist.findOne({
      where: { user_id: req.user.id, property_id },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Property is already in your wishlist.',
      });
    }

    const item = await Wishlist.create({
      user_id: req.user.id,
      property_id,
    });

    res.status(201).json({
      success: true,
      message: 'Added to wishlist.',
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove property from wishlist
// @route   DELETE /api/wishlist/:propertyId
const removeFromWishlist = async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    const { Wishlist } = getModels();

    const item = await Wishlist.findOne({
      where: { user_id: req.user.id, property_id: propertyId },
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Property not found in wishlist.',
      });
    }

    await item.destroy();

    res.json({
      success: true,
      message: 'Removed from wishlist.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};
