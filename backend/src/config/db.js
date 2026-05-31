const { Sequelize } = require('sequelize');
require('dotenv').config();

// Force Vercel to bundle mysql2 package since Sequelize loads it dynamically
try {
  require('mysql2');
} catch (e) {
  // Ignore
}

const dbHost = process.env.DB_HOST;
const dbPort = process.env.DB_PORT || 3306;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME || 'defaultdb';
const useSSL = process.env.DB_SSL === 'true';

const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: parseInt(dbPort, 10),
  dialect: 'mysql',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  dialectOptions: useSSL
    ? {
        ssl: {
          rejectUnauthorized: false,
        },
      }
    : {},
});

// Connects to the database and verifies connection
async function connectDB() {
  let retries = 5;
  while (retries > 0) {
    try {
      await sequelize.authenticate();
      console.log('Successfully connected to MySQL database via Sequelize.');
      return;
    } catch (error) {
      console.error(`Database connection failed. Retries remaining: ${retries - 1}`, error.message);
      retries -= 1;
      if (retries === 0) {
        throw new Error('Could not connect to the MySQL database after maximum retries.');
      }
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
}

module.exports = {
  sequelize,
  connectDB,
};
