const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Promotion = sequelize.define('Promotion', {
    idPromotion: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    nom: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    typePromotion: {
        type: DataTypes.ENUM('pourcentage', 'montant_fixe', 'livraison_gratuite'),
        allowNull: false,
    },
    valeurPromotion: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    typeApplication: {
        type: DataTypes.ENUM('produit', 'categorie', 'type', 'marque', 'panier', 'global'),
        allowNull: false,
    },
    conditionMinimum: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true, // Pour conditions comme "panier > 200dt"
    },
    quantiteMinimum: {
        type: DataTypes.INTEGER,
        allowNull: true, // Pour conditions comme "acheter 3 produits"
    },
    dateDebut: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    dateFin: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    actif: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    utilisationMax: {
        type: DataTypes.INTEGER,
        allowNull: true, // Limite d'utilisation globale
    },
    utilisationParClient: {
        type: DataTypes.INTEGER,
        allowNull: true, // Limite par client
    },
    utilisationActuelle: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
}, {
    timestamps: true,
    tableName: 'promotions',
});

module.exports = Promotion;