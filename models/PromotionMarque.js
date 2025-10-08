const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const PromotionMarque = sequelize.define('PromotionMarque', {
    idPromotion: {
        type: DataTypes.INTEGER,
        references: {
            model: 'promotions',
            key: 'idPromotion',
        },
    },
    idMarque: {
        type: DataTypes.INTEGER,
        references: {
            model: 'marques',
            key: 'idMarque',
        },
    },
}, {
    timestamps: false,
    tableName: 'promotion_marques',
});

module.exports = PromotionMarque;