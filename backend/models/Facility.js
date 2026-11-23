const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Facility = sequelize.define('Facility', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    property_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'properties',
        key: 'id',
      },
    },
    facility_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    tableName: 'facilities',
    timestamps: false,
  });

  return Facility;
};
