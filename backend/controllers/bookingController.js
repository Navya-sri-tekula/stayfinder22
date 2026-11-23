const { Op } = require('sequelize');
const { getModels } = require('../models');
const validateStayDates = (checkIn, checkOut) => {
  if (!checkIn || !checkOut || !/^\d{4}-\d{2}-\d{2}$/.test(checkIn) || !/^\d{4}-\d{2}-\d{2}$/.test(checkOut)) {
    return 'Valid check-in and check-out dates are required.';
  }
  if (checkOut <= checkIn) return 'Check-out must be after check-in.';
  return null;
};
const getApprovedBeds = async (Booking, roomId, checkIn, checkOut, transaction) => {
  const rows = await Booking.findAll({
    where: { room_id: roomId, status: 'approved', check_in: { [Op.lt]: checkOut }, check_out: { [Op.gt]: checkIn } },
    attributes: ['beds_requested'],
    ...(transaction ? { transaction } : {}),
  });
  return rows.reduce((total, row) => total + Number(row.beds_requested), 0);
};
const createBookingRequest = async (req, res, next) => {
  try {
    const { property_id, room_id, check_in, check_out, beds_requested = 1, message } = req.body;
    const dateError = validateStayDates(check_in, check_out);
    if (dateError) return res.status(400).json({ success: false, message: dateError });
    const requestedBeds = Number(beds_requested);
    if (!Number.isInteger(requestedBeds) || requestedBeds < 1 || requestedBeds > 20) {
      return res.status(400).json({ success: false, message: 'Request between 1 and 20 beds.' });
    }
    const { Booking, Property, Room } = getModels();
    const room = await Room.findOne({ where: { id: room_id, property_id } });
    if (!room) return res.status(404).json({ success: false, message: 'Selected room was not found for this property.' });
    const property = await Property.findByPk(property_id);
    if (!property || property.status !== 'available') {
      return res.status(409).json({ success: false, message: 'This property is not currently accepting booking requests.' });
    }
    const approvedBeds = await getApprovedBeds(Booking, room.id, check_in, check_out);
    const available = Math.max(0, Number(room.total_beds) - Number(room.occupied_beds) - approvedBeds);
    if (requestedBeds > available) {
      return res.status(409).json({ success: false, message: 'Only ' + available + ' bed(s) are available for those dates.' });
    }
    const booking = await Booking.create({
      user_id: req.user.id, property_id: property.id, room_id: room.id,
      check_in, check_out, beds_requested: requestedBeds,
      message: typeof message === 'string' ? message.trim().slice(0, 1000) : null,
      status: 'pending',
    });
    res.status(201).json({ success: true, message: 'Booking request sent to the property owner.', data: booking });
  } catch (error) { next(error); }
};
const getMyBookings = async (req, res, next) => {
  try {
    const { Booking, Property, Room } = getModels();
    const bookings = await Booking.findAll({
      where: { user_id: req.user.id },
      include: [
        { model: Property, as: 'property', attributes: ['id', 'name', 'city', 'address', 'type'] },
        { model: Room, as: 'room', attributes: ['id', 'room_number', 'sharing_type', 'price'] },
      ],
      order: [['created_at', 'DESC']],
    });
    res.json({ success: true, data: bookings });
  } catch (error) { next(error); }
};
const getOwnerBookings = async (req, res, next) => {
  try {
    const { Booking, Property, Room, User } = getModels();
    const bookings = await Booking.findAll({
      include: [
        { model: Property, as: 'property', where: { owner_id: req.user.id }, attributes: ['id', 'name', 'city'] },
        { model: Room, as: 'room', attributes: ['id', 'room_number', 'sharing_type', 'price'] },
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] },
      ],
      order: [['created_at', 'DESC']],
    });
    res.json({ success: true, data: bookings });
  } catch (error) { next(error); }
};
const updateBookingStatus = async (req, res, next) => {
  const status = req.body.status;
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Status must be approved or rejected.' });
  }
  const { Booking, Property, Room, sequelize } = getModels();
  const transaction = await sequelize.transaction();
  try {
    const booking = await Booking.findByPk(req.params.id, { transaction, lock: transaction.LOCK.UPDATE });
    if (!booking) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Booking request not found.' });
    }
    const property = await Property.findByPk(booking.property_id, { transaction });
    if (!property || property.owner_id !== req.user.id) {
      await transaction.rollback();
      return res.status(403).json({ success: false, message: 'You can only manage requests for your own properties.' });
    }
    if (booking.status !== 'pending') {
      await transaction.rollback();
      return res.status(409).json({ success: false, message: 'Only pending requests can be approved or rejected.' });
    }
    if (status === 'approved') {
      const room = await Room.findByPk(booking.room_id, { transaction, lock: transaction.LOCK.UPDATE });
      const approvedBeds = await getApprovedBeds(Booking, room.id, booking.check_in, booking.check_out, transaction);
      const available = Math.max(0, Number(room.total_beds) - Number(room.occupied_beds) - approvedBeds);
      if (Number(booking.beds_requested) > available) {
        await transaction.rollback();
        return res.status(409).json({ success: false, message: 'There are no longer enough beds available for these dates.' });
      }
    }
    booking.status = status;
    booking.owner_response = typeof req.body.owner_response === 'string' ? req.body.owner_response.trim().slice(0, 1000) : null;
    await booking.save({ transaction });
    await transaction.commit();
    res.json({ success: true, message: 'Booking request ' + status + '.', data: booking });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};
const cancelMyBooking = async (req, res, next) => {
  try {
    const { Booking } = getModels();
    const booking = await Booking.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking request not found.' });
    if (!['pending', 'approved'].includes(booking.status)) {
      return res.status(409).json({ success: false, message: 'This booking cannot be cancelled.' });
    }
    booking.status = 'cancelled';
    await booking.save();
    res.json({ success: true, message: 'Booking cancelled.', data: booking });
  } catch (error) { next(error); }
};
module.exports = { createBookingRequest, getMyBookings, getOwnerBookings, updateBookingStatus, cancelMyBooking };
