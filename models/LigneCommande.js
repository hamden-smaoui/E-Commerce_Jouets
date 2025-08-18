const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LigneCommande = sequelize.define('LigneCommande', {
    idLigneCommande: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    idCommande: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'commandes',
            key: 'idCommande',
        },
    },
    idProduit: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'produits',
            key: 'idProduit',
        },
    },
    quantite: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    prixUnitaire: {
        type: DataTypes.DOUBLE,
        allowNull: false,
    },
    sousTotal: {
        type: DataTypes.DOUBLE,
        allowNull: false,
    },
}, {
    timestamps: true,
    tableName: 'lignes_commandes',
});

module.exports = LigneCommande;