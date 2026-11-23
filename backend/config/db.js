const { Sequelize } = require('sequelize');
// Explicit import ensures Vercel's function tracer bundles the PostgreSQL driver.
const pg = require('pg');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config();
let sequelizeInstance;
const commonOptions = {
  logging: false,
  define: { timestamps: true, underscored: true },
  pool: { max: 2, min: 0, acquire: 30000, idle: 10000 },
};
const initSequelize = async () => {
  if (sequelizeInstance) {
    await sequelizeInstance.authenticate();
    return sequelizeInstance;
  }
  if (process.env.DATABASE_URL) {
    sequelizeInstance = new Sequelize(process.env.DATABASE_URL, {
      ...commonOptions,
      dialect: 'postgres',
      dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
    });
  } else if (process.env.NODE_ENV === 'production') {
    throw new Error('DATABASE_URL is required in production. Configure your Neon PostgreSQL connection string in Vercel.');
  } else if ((process.env.DB_DIALECT || '').toLowerCase() === 'mysql') {
    sequelizeInstance = new Sequelize(
      process.env.DB_NAME || 'stayfinder_db',
      process.env.DB_USER || 'root',
      process.env.DB_PASSWORD || '',
      { ...commonOptions, dialect: 'mysql', host: process.env.DB_HOST || 'localhost', port: Number(process.env.DB_PORT || 3306) }
    );
  } else {
    sequelizeInstance = new Sequelize({
      ...commonOptions,
      dialect: 'sqlite',
      storage: path.resolve(__dirname, '..', 'stayfinder.sqlite'),
    });
  }
  try {
    await sequelizeInstance.authenticate();
    console.log('[Database] Connection established.');
    return sequelizeInstance;
  } catch (error) {
    sequelizeInstance = null;
    throw error;
  }
};
module.exports = { initSequelize };
