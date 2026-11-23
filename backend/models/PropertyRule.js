const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PropertyRule = sequelize.define('PropertyRule', {
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
    rule_name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'e.g. Entry Time, Curfew, Visitor Timings, Weekend Rules',
    },
    rule_value: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    tableName: 'property_rules',
    timestamps: false,
  });

  return PropertyRule;
};
