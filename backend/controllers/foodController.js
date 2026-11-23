const { getModels } = require('../models');

// @desc    Get all food menu items for a property
// @route   GET /api/properties/:propertyId/food
const getFoodByPropertyId = async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    const { FoodMenu } = getModels();

    const items = await FoodMenu.findAll({
      where: { property_id: propertyId },
      order: [
        ['day', 'ASC'],
        ['meal_type', 'ASC'],
      ],
    });

    res.json({
      success: true,
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a food menu item (Owner only)
// @route   POST /api/food
const createFood = async (req, res, next) => {
  try {
    const { property_id, day, meal_type, menu, start_time, end_time } = req.body;

    if (!property_id || !day || !meal_type || !menu) {
      return res.status(400).json({
        success: false,
        message: 'Please provide property_id, day, meal_type, and menu.',
      });
    }

    const { Property, FoodMenu } = getModels();

    const property = await Property.findByPk(property_id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found.' });
    }

    if (property.owner_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: you can only add food menus to your own properties.',
      });
    }

    const item = await FoodMenu.create({
      property_id,
      day: day.trim(),
      meal_type: meal_type.trim(),
      menu: menu.trim(),
      start_time: start_time ? start_time.trim() : null,
      end_time: end_time ? end_time.trim() : null,
    });

    res.status(201).json({
      success: true,
      message: 'Food menu item added successfully.',
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a food menu item (Owner only)
// @route   PUT /api/food/:id
const updateFood = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { day, meal_type, menu, start_time, end_time } = req.body;

    const { FoodMenu, Property } = getModels();

    const item = await FoodMenu.findByPk(id, {
      include: [{ model: Property, as: 'property' }],
    });

    if (!item) {
      return res.status(404).json({ success: false, message: 'Food menu item not found.' });
    }

    if (item.property.owner_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: you can only update food menus for your own properties.',
      });
    }

    if (day) item.day = day.trim();
    if (meal_type) item.meal_type = meal_type.trim();
    if (menu) item.menu = menu.trim();
    if (start_time !== undefined) item.start_time = start_time;
    if (end_time !== undefined) item.end_time = end_time;

    await item.save();

    res.json({
      success: true,
      message: 'Food menu item updated successfully.',
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a food menu item (Owner only)
// @route   DELETE /api/food/:id
const deleteFood = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { FoodMenu, Property } = getModels();

    const item = await FoodMenu.findByPk(id, {
      include: [{ model: Property, as: 'property' }],
    });

    if (!item) {
      return res.status(404).json({ success: false, message: 'Food menu item not found.' });
    }

    if (item.property.owner_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: you can only delete food menus from your own properties.',
      });
    }

    await item.destroy();

    res.json({
      success: true,
      message: 'Food menu item deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFoodByPropertyId,
  createFood,
  updateFood,
  deleteFood,
};
