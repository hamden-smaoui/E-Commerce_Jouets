const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,     
  process.env.DB_USER,     
  process.env.DB_PASSWORD, 
  {
    host: process.env.DB_HOST, 
    port: process.env.DB_PORT || 3306,  
    dialect: 'mysql',
    logging: console.log,  
    retry: {
      match: [
        /ETIMEDOUT/,
        /EHOSTUNREACH/,
        /ECONNREFUSED/,
        /ESOCKETTIMEDOUT/,
        /EAI_AGAIN/,
      ],
      max: 5,  
      backoffBase: 1000, 
      backoffExponent: 1.5, 
    },
  }
);

module.exports = sequelize;