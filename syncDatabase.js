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

    // NE PAS FERMER LA CONNEXION ICI !
    // await sequelize.close(); // ⛔ SUPPRIMER OU COMMENTER

  } catch (err) {
    console.error('Erreur lors de la synchronisation de la base de données :', err);
    process.exit(1);
  }
};

module.exports = syncDatabase;