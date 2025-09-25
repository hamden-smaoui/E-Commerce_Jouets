const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PanierProduit = sequelize.define('PaniersProduit', {
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
    idProduitVariation: {  // Nouveau champ
        type: DataTypes.INTEGER,
        allowNull: true, // Peut être null pour les anciens produits sans variation
        references: {
            model: 'produit_variations',
            key: 'idProduitVariation',
        },
        onDelete: 'CASCADE',
    },
    quantite: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
            min: 1,
        },
    },
    prixUnitaire: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
}, {
    timestamps: true,
    tableName: 'paniers_produits',
});

module.exports = PanierProduit;