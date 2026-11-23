const { getModels } = require('../models');

// @desc    Get all rooms for a property
// @route   GET /api/properties/:propertyId/rooms
const getRoomsByPropertyId = async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    const { Room } = getModels();

    const rooms = await Room.findAll({
      where: { property_id: propertyId },
      order: [['room_number', 'ASC']],
    });

    const formattedRooms = rooms.map((r) => {
      const room = r.toJSON();
      return {
        ...room,
        available_beds: Math.max(0, room.total_beds - room.occupied_beds),
      };
    });

    res.json({
      success: true,
      data: formattedRooms,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a room for a property (Owner only)
// @route   POST /api/rooms
const createRoom = async (req, res, next) => {
  try {
    const {
      property_id,
      room_number,
      sharing_type,
      total_beds,
      occupied_beds = 0,
      price,
      ac,
      attached_bathroom,
      description,
      amenities = [],
    } = req.body;

    if (!property_id || !room_number || !sharing_type || !price || total_beds === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide property_id, room_number, sharing_type, total_beds, and price.',
      });
    }

    const totalBedsNum = parseInt(total_beds, 10);
    const occupiedBedsNum = parseInt(occupied_beds, 10) || 0;

    if (totalBedsNum <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Total beds must be at least 1.',
      });
    }

    if (occupiedBedsNum > totalBedsNum) {
      return res.status(400).json({
        success: false,
        message: 'Occupied beds cannot exceed total beds.',
      });
    }

    const { Property, Room } = getModels();

    // Verify property exists and belongs to current owner
    const property = await Property.findByPk(property_id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found.' });
    }

    if (property.owner_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: you can only add rooms to your own properties.',
      });
    }

    const room = await Room.create({
      property_id,
      room_number: room_number.trim(),
      sharing_type: sharing_type.trim(),
      total_beds: totalBedsNum,
      occupied_beds: occupiedBedsNum,
      price: parseFloat(price),
      ac: Boolean(ac),
      attached_bathroom: attached_bathroom !== undefined ? Boolean(attached_bathroom) : true,
      description: description ? description.trim() : null,
      amenities: Array.isArray(amenities) ? amenities.filter((item) => typeof item === 'string').map((item) => item.trim()).filter(Boolean).slice(0, 30) : [],
    });

    const roomData = room.toJSON();
    roomData.available_beds = Math.max(0, room.total_beds - room.occupied_beds);

    res.status(201).json({
      success: true,
      message: 'Room created successfully.',
      data: roomData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a room (Owner only)
// @route   PUT /api/rooms/:id
const updateRoom = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      room_number,
      sharing_type,
      total_beds,
      occupied_beds,
      price,
      ac,
      attached_bathroom,
      description,
      amenities,
    } = req.body;

    const { Room, Property } = getModels();

    const room = await Room.findByPk(id, {
      include: [{ model: Property, as: 'property' }],
    });

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found.' });
    }

    // Verify ownership
    if (room.property.owner_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: you can only update rooms in your own properties.',
      });
    }

    const newTotal = total_beds !== undefined ? parseInt(total_beds, 10) : room.total_beds;
    const newOccupied = occupied_beds !== undefined ? parseInt(occupied_beds, 10) : room.occupied_beds;

    if (newOccupied > newTotal) {
      return res.status(400).json({
        success: false,
        message: 'Occupied beds cannot exceed total beds.',
      });
    }

    if (room_number) room.room_number = room_number.trim();
    if (sharing_type) room.sharing_type = sharing_type.trim();
    room.total_beds = newTotal;
    room.occupied_beds = newOccupied;
    if (price !== undefined) room.price = parseFloat(price);
    if (ac !== undefined) room.ac = Boolean(ac);
    if (attached_bathroom !== undefined) room.attached_bathroom = Boolean(attached_bathroom);
    if (description !== undefined) room.description = description ? description.trim() : null;
    if (amenities !== undefined) room.amenities = Array.isArray(amenities) ? amenities.filter((item) => typeof item === 'string').map((item) => item.trim()).filter(Boolean).slice(0, 30) : [];

    await room.save();

    const roomData = room.toJSON();
    roomData.available_beds = Math.max(0, room.total_beds - room.occupied_beds);

    res.json({
      success: true,
      message: 'Room updated successfully.',
      data: roomData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a room (Owner only)
// @route   DELETE /api/rooms/:id
const deleteRoom = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { Room, Property } = getModels();

    const room = await Room.findByPk(id, {
      include: [{ model: Property, as: 'property' }],
    });

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found.' });
    }

    if (room.property.owner_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: you can only delete rooms from your own properties.',
      });
    }

    await room.destroy();

    res.json({
      success: true,
      message: 'Room deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRoomsByPropertyId,
  createRoom,
  updateRoom,
  deleteRoom,
};
