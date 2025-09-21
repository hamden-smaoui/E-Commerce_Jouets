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
    valeurPourcentage: { // Nouveau champ pour la réduction en pourcentage
        type: DataTypes.DECIMAL(5, 2), // ex: 20.00 pour 20%
        allowNull: false,
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