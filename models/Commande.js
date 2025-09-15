const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Commande = sequelize.define('Commande', {
    idCommande: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    idClient: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'utilisateurs',
            key: 'idUtilisateur',
        },
    },
    clientPrenom: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    clientNom: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    clientEmail: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    clientTelephone: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    clientAdresseRue: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    clientAdresseVille: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    clientAdresseCodePostal: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    clientAdressePays: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Tunisie',
    },
    dateCommande: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    statut: {
        type: DataTypes.ENUM('en attente', 'en traitement', 'expédiée', 'livrée', 'annulée'),
        allowNull: false,
        defaultValue: 'en attente',
    },
    montantTotal: {
        type: DataTypes.DOUBLE,
        allowNull: false,
    },
    notesLivraison: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    montantOriginal: {
        type: DataTypes.DOUBLE,
        allowNull: true,
    },
    montantReduction: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        defaultValue: 0,
    },
    idPromotionUtilisee: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'promotions',
            key: 'idPromotion',
        },
    },
    codePromoUtilise: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    timestamps: true,
    tableName: 'commandes',
});

module.exports = Commande;