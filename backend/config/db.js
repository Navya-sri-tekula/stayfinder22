const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

let sequelize;

const dbDialect = process.env.DB_DIALECT || 'mysql';
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = process.env.DB_PORT || 3306;
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || '';
const dbName = process.env.DB_NAME || 'stayfinder_db';

const initSequelize = async () => {
  if (dbDialect === 'mysql') {
    try {
      // Attempt to ensure database exists in MySQL
      const mysql = require('mysql2/promise');
      const connection = await mysql.createConnection({
        host: dbHost,
        port: dbPort,
        user: dbUser,
        password: dbPassword,
      });
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
      await connection.end();

      sequelize = new Sequelize(dbName, dbUser, dbPassword, {
        host: dbHost,
        port: dbPort,
        dialect: 'mysql',
        logging: false,
        define: {
          timestamps: true,
          underscored: true,
        },
      });

      await sequelize.authenticate();
      console.log(`[Database] Connected to MySQL database "${dbName}" successfully on ${dbHost}:${dbPort}.`);
      return sequelize;
    } catch (mysqlError) {
      console.warn(`[Database] Warning: MySQL connection failed (${mysqlError.message}).`);
      console.warn(`[Database] Falling back to SQLite local storage for seamless zero-setup execution.`);
    }
  }

  // SQLite fallback
  const sqliteStoragePath = path.resolve(__dirname, '..', 'stayfinder.sqlite');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: sqliteStoragePath,
    logging: false,
    define: {
      timestamps: true,
      underscored: true,
    },
  });

  await sequelize.authenticate();
  console.log(`[Database] Connected to SQLite database (${sqliteStoragePath}).`);
  return sequelize;
};

// Default export placeholder until init runs
const placeholderSequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.resolve(__dirname, '..', 'stayfinder.sqlite'),
  logging: false,
  define: {
    timestamps: true,
    underscored: true,
  },
});

module.exports = {
  sequelize: placeholderSequelize,
  initSequelize,
};
