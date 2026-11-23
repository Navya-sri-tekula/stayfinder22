const createUserModel = require('./User');
const createPropertyModel = require('./Property');
const createPropertyImageModel = require('./PropertyImage');
const createRoomModel = require('./Room');
const createFacilityModel = require('./Facility');
const createFoodMenuModel = require('./FoodMenu');
const createPropertyRuleModel = require('./PropertyRule');
const createWishlistModel = require('./Wishlist');
const createReviewModel = require('./Review');

let db = {};

const initModels = (sequelize) => {
  const User = createUserModel(sequelize);
  const Property = createPropertyModel(sequelize);
  const PropertyImage = createPropertyImageModel(sequelize);
  const Room = createRoomModel(sequelize);
  const Facility = createFacilityModel(sequelize);
  const FoodMenu = createFoodMenuModel(sequelize);
  const PropertyRule = createPropertyRuleModel(sequelize);
  const Wishlist = createWishlistModel(sequelize);
  const Review = createReviewModel(sequelize);

  // Associations
  // Owner -> Properties
  User.hasMany(Property, { foreignKey: 'owner_id', as: 'properties', onDelete: 'CASCADE' });
  Property.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });

  // Property -> Images
  Property.hasMany(PropertyImage, { foreignKey: 'property_id', as: 'images', onDelete: 'CASCADE' });
  PropertyImage.belongsTo(Property, { foreignKey: 'property_id', as: 'property' });

  // Property -> Rooms
  Property.hasMany(Room, { foreignKey: 'property_id', as: 'rooms', onDelete: 'CASCADE' });
  Room.belongsTo(Property, { foreignKey: 'property_id', as: 'property' });

  // Property -> Facilities
  Property.hasMany(Facility, { foreignKey: 'property_id', as: 'facilities', onDelete: 'CASCADE' });
  Facility.belongsTo(Property, { foreignKey: 'property_id', as: 'property' });

  // Property -> FoodMenu
  Property.hasMany(FoodMenu, { foreignKey: 'property_id', as: 'food_menus', onDelete: 'CASCADE' });
  FoodMenu.belongsTo(Property, { foreignKey: 'property_id', as: 'property' });

  // Property -> Rules
  Property.hasMany(PropertyRule, { foreignKey: 'property_id', as: 'rules', onDelete: 'CASCADE' });
  PropertyRule.belongsTo(Property, { foreignKey: 'property_id', as: 'property' });

  // User & Property -> Wishlist
  User.hasMany(Wishlist, { foreignKey: 'user_id', as: 'wishlists', onDelete: 'CASCADE' });
  Wishlist.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  Property.hasMany(Wishlist, { foreignKey: 'property_id', as: 'wishlist_entries', onDelete: 'CASCADE' });
  Wishlist.belongsTo(Property, { foreignKey: 'property_id', as: 'property' });

  // User & Property -> Reviews
  User.hasMany(Review, { foreignKey: 'user_id', as: 'reviews', onDelete: 'CASCADE' });
  Review.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  Property.hasMany(Review, { foreignKey: 'property_id', as: 'reviews', onDelete: 'CASCADE' });
  Review.belongsTo(Property, { foreignKey: 'property_id', as: 'property' });

  db = {
    sequelize,
    User,
    Property,
    PropertyImage,
    Room,
    Facility,
    FoodMenu,
    PropertyRule,
    Wishlist,
    Review,
  };

  return db;
};

module.exports = {
  initModels,
  getModels: () => db,
};
