const { initSequelize } = require('../config/db');
const { initModels } = require('../models');
const { getSeedData } = require('./seedData');

const runSeed = async () => {
  try {
    console.log('[Seed] Connecting to database...');
    const sequelize = await initSequelize();
    const models = initModels(sequelize);

    console.log('[Seed] Synchronizing database tables...');
    await sequelize.sync();

    // Never reset a database as part of seeding. Keep existing users and listings.
    if (await models.User.count()) {
      console.log('[Seed] Existing users found; demo seed skipped to protect existing data.');
      return;
    }

    const seedData = await getSeedData();

    console.log('[Seed] Seeding users...');
    await models.User.bulkCreate(seedData.users);

    console.log('[Seed] Seeding properties...');
    await models.Property.bulkCreate(seedData.properties);

    console.log('[Seed] Seeding property images...');
    await models.PropertyImage.bulkCreate(seedData.images);

    console.log('[Seed] Seeding rooms...');
    await models.Room.bulkCreate(seedData.rooms);

    console.log('[Seed] Seeding facilities...');
    await models.Facility.bulkCreate(seedData.facilities);

    console.log('[Seed] Seeding food menu...');
    await models.FoodMenu.bulkCreate(seedData.foodMenus);

    console.log('[Seed] Seeding property rules...');
    await models.PropertyRule.bulkCreate(seedData.rules);

    console.log('[Seed] Seeding reviews...');
    await models.Review.bulkCreate(seedData.reviews);

    console.log('[Seed] Seeding wishlists...');
    await models.Wishlist.bulkCreate(seedData.wishlists);

    console.log('[Seed] Demo database seeding completed successfully!');
  } catch (error) {
    console.error('[Seed Error]:', error);
  }
};

if (require.main === module) {
  runSeed().then(() => process.exit(0));
}

module.exports = { runSeed };
