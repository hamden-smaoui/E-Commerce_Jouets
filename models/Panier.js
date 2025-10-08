const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Panier = sequelize.define('Panier', {
    idPanier: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    idUtilisateur: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'utilisateurs',
            key: 'idUtilisateur',
        },
        onDelete: 'CASCADE',
    },
}, {
    timestamps: true,
    tableName: 'paniers',
});

module.exports = Panier;
