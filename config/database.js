const { Sequelize } = require('sequelize');
require('dotenv').config();

// Vérification des variables d'environnement
const requiredEnvVars = ['DB_NAME', 'DB_USER', 'DB_PASSWORD', 'DB_HOST'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('❌ Variables d\'environnement manquantes:', missingEnvVars.join(', '));
  throw new Error(`Variables d'environnement manquantes: ${missingEnvVars.join(', ')}`);
}

console.log('🔍 Configuration de connexion MySQL:');
console.log('  DB_HOST:', process.env.DB_HOST);
console.log('  DB_PORT:', process.env.DB_PORT || 3306);
console.log('  DB_NAME:', process.env.DB_NAME);
console.log('  DB_USER:', process.env.DB_USER);
console.log('  DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : 'NOT SET');

const sequelize = new Sequelize(
  process.env.DB_NAME,     
  process.env.DB_USER,     
  process.env.DB_PASSWORD, 
  {
    host: process.env.DB_HOST, 
    port: parseInt(process.env.DB_PORT) || 3306,  
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 60000,
      idle: 10000
    },
    dialectOptions: {
      connectTimeout: 60000,
    },
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