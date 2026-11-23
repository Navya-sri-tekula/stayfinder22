const { DataTypes } = require('sequelize');

module.exports = (sequelize) => sequelize.define('Booking', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  property_id: { type: DataTypes.INTEGER, allowNull: false },
  room_id: { type: DataTypes.INTEGER, allowNull: false },
  check_in: { type: DataTypes.DATEONLY, allowNull: false },
  check_out: { type: DataTypes.DATEONLY, allowNull: false },
  beds_requested: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1, validate: { min: 1 } },
  message: { type: DataTypes.TEXT, allowNull: true },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending',
  },
  owner_response: { type: DataTypes.TEXT, allowNull: true },
}, {
  tableName: 'bookings',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  validate: {
    validStayDates() {
      if (this.check_in && this.check_out && this.check_out <= this.check_in) {
        throw new Error('Check-out must be after check-in.');
      }
    },
  },
});
