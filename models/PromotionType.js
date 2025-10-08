const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const PromotionType = sequelize.define('PromotionType', {
    idPromotion: {
        type: DataTypes.INTEGER,
        references: {
            model: 'promotions',
            key: 'idPromotion',
        },
    },
    idType: {
        type: DataTypes.INTEGER,
        references: {
            model: 'types',
            key: 'idType',
        },
    },
}, {
    timestamps: false,
    tableName: 'promotion_types',
});

module.exports = PromotionType;