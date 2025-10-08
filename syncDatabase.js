const sequelize = require('./config/database');
const models = require('./models');
require('dotenv').config();

const syncDatabase = async () => {
  try {
    // Vérifie la connexion à la base de données
    await sequelize.authenticate();
    console.log('Connexion réussie à la base de données');

    // Synchronise les tables
    await sequelize.sync({ alter: true, force: false });
    console.log('Base de données synchronisée avec succès');

    // Ferme la connexion
    await sequelize.close();
    console.log('Connexion à la base de données fermée');
  } catch (err) {
    console.error('Erreur lors de la synchronisation de la base de données :', err);
    process.exit(1);
  }
};

module.exports = syncDatabase;