const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CodePromo = sequelize.define('CodePromo', {
    idCodePromo: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    idPromotion: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'promotions',
            key: 'idPromotion',
        },
    },
    actif: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    utilisationMax: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    utilisationActuelle: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
}, {
    timestamps: true,
    tableName: 'codes_promo',
});

module.exports = CodePromo;