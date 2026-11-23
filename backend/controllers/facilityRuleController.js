const { getModels } = require('../models');

// @desc    Add facility to a property (Owner only)
// @route   POST /api/properties/:propertyId/facilities
const addFacility = async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    const { facility_name } = req.body;

    if (!facility_name) {
      return res.status(400).json({ success: false, message: 'Facility name is required.' });
    }

    const { Property, Facility } = getModels();
    const property = await Property.findByPk(propertyId);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found.' });
    }

    if (property.owner_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }

    const facility = await Facility.create({
      property_id: propertyId,
      facility_name: facility_name.trim(),
    });

    res.status(201).json({
      success: true,
      message: 'Facility added successfully.',
      data: facility,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove facility from property (Owner only)
// @route   DELETE /api/properties/:propertyId/facilities/:id
const deleteFacility = async (req, res, next) => {
  try {
    const { propertyId, id } = req.params;
    const { Property, Facility } = getModels();

    const property = await Property.findByPk(propertyId);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found.' });
    }

    if (property.owner_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }

    const facility = await Facility.findOne({ where: { id, property_id: propertyId } });
    if (!facility) {
      return res.status(404).json({ success: false, message: 'Facility not found.' });
    }

    await facility.destroy();

    res.json({
      success: true,
      message: 'Facility removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add rule to a property (Owner only)
// @route   POST /api/properties/:propertyId/rules
const addRule = async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    const { rule_name, rule_value } = req.body;

    if (!rule_name || !rule_value) {
      return res.status(400).json({ success: false, message: 'Rule name and value are required.' });
    }

    const { Property, PropertyRule } = getModels();
    const property = await Property.findByPk(propertyId);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found.' });
    }

    if (property.owner_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }

    const rule = await PropertyRule.create({
      property_id: propertyId,
      rule_name: rule_name.trim(),
      rule_value: rule_value.trim(),
    });

    res.status(201).json({
      success: true,
      message: 'Rule added successfully.',
      data: rule,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove rule from property (Owner only)
// @route   DELETE /api/properties/:propertyId/rules/:id
const deleteRule = async (req, res, next) => {
  try {
    const { propertyId, id } = req.params;
    const { Property, PropertyRule } = getModels();

    const property = await Property.findByPk(propertyId);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found.' });
    }

    if (property.owner_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }

    const rule = await PropertyRule.findOne({ where: { id, property_id: propertyId } });
    if (!rule) {
      return res.status(404).json({ success: false, message: 'Rule not found.' });
    }

    await rule.destroy();

    res.json({
      success: true,
      message: 'Rule removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addFacility,
  deleteFacility,
  addRule,
  deleteRule,
};
