const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Age = sequelize.define('Age', {
  idAge: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  minAge: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  maxAge: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  typeAge: {
    type: DataTypes.ENUM('mois', 'ans'),
    allowNull: false,
    defaultValue: 'ans',
  },
  label: {
    type: DataTypes.STRING, 
    allowNull: false,
  },
}, {
  tableName: 'ages',
  timestamps: false,
});

module.exports = Age;