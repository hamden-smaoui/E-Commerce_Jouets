const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Marque = sequelize.define('Marque', {
    idMarque: {
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
    logoUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    timestamps: true,
    tableName: 'marques',
});

module.exports = Marque;