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
        allowNull: true, // ✅ IMPORTANT: Nullable pour guest checkout
        references: {
            model: 'utilisateurs',
            key: 'idUtilisateur',
        },
    },
    // 🆕 NOUVEAU CHAMP
    guestToken: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
        comment: 'Token unique pour les commandes guest (sans compte)'
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
        allowNull: true,
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
        comment: 'Montant total final après toutes réductions'
    },
    montantOriginal: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        comment: 'Montant total original avant réductions'
    },
    montantReduction: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        defaultValue: 0,
        comment: 'Montant total de réduction (montantOriginal - montantTotal)'
    },
    fraisLivraison: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        defaultValue: 0,
        comment: 'Frais de livraison appliqués'
    },
    notesLivraison: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    idPromotionUtilisee: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'promotions',
            key: 'idPromotion',
        },
        comment: 'Promotion globale appliquée à la commande (ex: code promo)'
    },
    codePromoGlobal: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Code promo global appliqué à la commande entière'
    },
    reductionCodePromo: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        defaultValue: 0
    }, 
}, {
    timestamps: true,
    tableName: 'commandes',
    indexes: [
        {
            // ✅ Index pour optimiser les requêtes par guestToken
            fields: ['guestToken']
        }
    ]
});

module.exports = Commande;