const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Favori = sequelize.define('Favori', {
    idFavori: {
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
    idProduit: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'produits',
            key: 'idProduit',
        },
        onDelete: 'CASCADE',
    },
}, {
    timestamps: true,
    tableName: 'favoris',
});

module.exports = Favori;
