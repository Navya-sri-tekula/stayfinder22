const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const FoodMenu = sequelize.define('FoodMenu', {
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
    day: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'e.g. Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday',
    },
    meal_type: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'e.g. Breakfast, Lunch, Snacks, Dinner',
    },
    menu: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    start_time: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'e.g. 7:30 AM',
    },
    end_time: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'e.g. 9:30 AM',
    },
  }, {
    tableName: 'food_menu',
    timestamps: false,
  });

  return FoodMenu;
};
