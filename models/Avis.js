const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Avis = sequelize.define('Avis', {
    idAvis: {
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
    },
    idProduit: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'produits',
            key: 'idProduit',
        },
    },
    note: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5,
        },
    },
}, {
    timestamps: true,
    tableName: 'avis',
    indexes: [
        {
            unique: true,
            fields: ['idUtilisateur', 'idProduit']
        },
        {
            fields: ['idProduit']
        }
    ]
});

module.exports = Avis;