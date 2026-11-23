const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Room = sequelize.define('Room', {
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
    room_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sharing_type: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'e.g. single, 2 sharing, 3 sharing, 4 sharing',
    },
    total_beds: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
      },
    },
    occupied_beds: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    ac: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    attached_bathroom: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    amenities: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    available_beds: {
      type: DataTypes.VIRTUAL,
      get() {
        const total = this.getDataValue('total_beds') || 0;
        const occupied = this.getDataValue('occupied_beds') || 0;
        return Math.max(0, total - occupied);
      },
    },
  }, {
    tableName: 'rooms',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    validate: {
      occupiedNotExceedTotal() {
        if (this.occupied_beds > this.total_beds) {
          throw new Error('Occupied beds cannot exceed total beds.');
        }
      },
    },
  });

  return Room;
};
