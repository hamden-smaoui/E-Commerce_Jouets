const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PanierProduit = sequelize.define('PanierProduit', {
    idPanierProduit: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    idPanier: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'paniers',
            key: 'idPanier',
        },
        onDelete: 'CASCADE',
    },
    idProduit: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'produits',
            key: 'idProduit',
        },
        onDelete: 'CASCADE',
    },
    quantite: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
}, {
    timestamps: true,
    tableName: 'paniers_produits',
});

module.exports = PanierProduit;
