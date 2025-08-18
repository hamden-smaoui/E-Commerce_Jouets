const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const PromotionCategorie = sequelize.define('PromotionCategorie', {
    idPromotion: {
        type: DataTypes.INTEGER,
        references: {
            model: 'promotions',
            key: 'idPromotion',
        },
    },
    idCategorie: {
        type: DataTypes.INTEGER,
        references: {
            model: 'categories',
            key: 'idCategorie',
        },
    },
}, {
    timestamps: false,
    tableName: 'promotion_categories',
});

module.exports = PromotionCategorie;