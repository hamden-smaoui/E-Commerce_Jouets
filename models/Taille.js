const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Taille = sequelize.define('Taille', {
  idTaille: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'tailles',
  timestamps: false,
});

module.exports = Taille;