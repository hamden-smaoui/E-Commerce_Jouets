const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Couleur = sequelize.define('Couleur', {
  idCouleur: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ref: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'couleurs',
  timestamps: false,
});

module.exports = Couleur;