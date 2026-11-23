const { getModels } = require('../models');

// @desc    Get all reviews for a property
// @route   GET /api/properties/:propertyId/reviews
const getPropertyReviews = async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    const { Review, User } = getModels();

    const reviews = await Review.findAll({
      where: { property_id: propertyId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name'],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    const count = reviews.length;
    const average =
      count > 0
        ? Math.round((reviews.reduce((acc, curr) => acc + curr.rating, 0) / count) * 10) / 10
        : 0;

    res.json({
      success: true,
      data: {
        reviews,
        total: count,
        average_rating: average,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit a review for a property
// @route   POST /api/reviews
const createReview = async (req, res, next) => {
  try {
    const { property_id, rating, comment } = req.body;

    if (!property_id || rating === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide property_id and rating.',
      });
    }

    const ratingNum = parseInt(rating, 10);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be an integer between 1 and 5.',
      });
    }

    const { Review, Property, User } = getModels();

    // Verify property exists
    const property = await Property.findByPk(property_id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found.' });
    }

    // Optional check: if user already reviewed this property, update it or allow multiple
    let review = await Review.findOne({
      where: { user_id: req.user.id, property_id },
    });

    if (review) {
      // Update existing review
      review.rating = ratingNum;
      review.comment = comment ? comment.trim() : null;
      await review.save();
    } else {
      // Create new review
      review = await Review.create({
        user_id: req.user.id,
        property_id,
        rating: ratingNum,
        comment: comment ? comment.trim() : null,
      });
    }

    // Fetch with user info
    const fullReview = await Review.findByPk(review.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'name'] }],
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully.',
      data: fullReview,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { Review } = getModels();

    const review = await Review.findByPk(id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    // Only owner of review can delete
    if (review.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: you can only delete your own reviews.',
      });
    }

    await review.destroy();

    res.json({
      success: true,
      message: 'Review deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPropertyReviews,
  createReview,
  deleteReview,
};
