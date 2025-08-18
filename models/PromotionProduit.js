const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PromotionProduit = sequelize.define('PromotionProduit', {
    idPromotion: {
        type: DataTypes.INTEGER,
        references: {
            model: 'promotions',
            key: 'idPromotion',
        },
    },
    idProduit: {
        type: DataTypes.INTEGER,
        references: {
            model: 'produits',
            key: 'idProduit',
        },
    },
}, {
    timestamps: false,
    tableName: 'promotion_produits',
});

module.exports = PromotionProduit;