const dotenv = require('dotenv');
dotenv.config();

const app = require('./app');
const { initSequelize } = require('./config/db');
const { initModels } = require('./models');
const { runSeed } = require('./utils/seed');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    const sequelize = await initSequelize();
    const models = initModels(sequelize);

    // Sync database models
    await sequelize.sync();
    console.log('[Database] Schema synchronized successfully.');

    // Auto-seed if database is currently empty
    const propertyCount = await models.Property.count();
    if (propertyCount === 0) {
      console.log('[Database] No existing property listings found. Seeding initial demo data...');
      await runSeed();
    }

    app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(` StayFinder Server is running on port ${PORT} `);
      console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(` API Base URL: http://localhost:${PORT}/api    `);
      console.log(`===============================================`);
    });
  } catch (error) {
    console.error('Fatal error starting StayFinder server:', error);
    process.exit(1);
  }
};

startServer();
