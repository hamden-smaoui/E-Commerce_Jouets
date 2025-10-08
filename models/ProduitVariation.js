const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProduitVariation = sequelize.define('ProduitVariation', {
  idProduitVariation: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  idProduit: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'produits', key: 'idProduit' },
  },
  idCouleur: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'couleurs', key: 'idCouleur' },
  },
  idTaille: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'tailles', key: 'idTaille' },
  },
  idAge: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'ages', key: 'idAge' },
  },
  quantiteStock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
}, {
  tableName: 'produit_variations',
  timestamps: false,
});

module.exports = ProduitVariation;