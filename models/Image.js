const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Image = sequelize.define('Image', {
    idImage: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    url: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    rang: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    idProduit: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'produits',
            key: 'idProduit',
        },
    },
}, {
    timestamps: true,
    tableName: 'images',
});
module.exports = Image;