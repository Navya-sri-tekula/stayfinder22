const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PropertyImage = sequelize.define('PropertyImage', {
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
    image_url: {
      type: DataTypes.STRING(1000),
      allowNull: false,
    },
  }, {
    tableName: 'property_images',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  });

  return PropertyImage;
};
