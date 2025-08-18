const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const PromotionUtilisation = sequelize.define('PromotionUtilisation', {
    idUtilisation: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    idPromotion: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'promotions',
            key: 'idPromotion',
        },
    },
    idCodePromo: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'codes_promo',
            key: 'idCodePromo',
        },
    },
    idCommande: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'commandes',
            key: 'idCommande',
        },
    },
    idUtilisateur: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'utilisateurs',
            key: 'idUtilisateur',
        },
    },
    montantReduction: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
}, {
    timestamps: true,
    tableName: 'promotion_utilisations',
});

module.exports = PromotionUtilisation;