const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Categorie = require('./Categorie');
const Type = require('./Type');

const CategorieType = sequelize.define('CategorieType', {
    idCategorie: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: 'categories',
            key: 'idCategorie',
        },
    },
    idType: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: 'types',
            key: 'idType',
        },
    },
}, {
    timestamps: true,
    tableName: 'categorie_type',
});

module.exports = CategorieType;