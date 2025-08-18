const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Facture = sequelize.define('Facture', {
    idFacture: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    idCommande: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'commandes',
            key: 'idCommande',
        },
    },
    dateFacture: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    montantTotal: {
        type: DataTypes.DOUBLE,
        allowNull: false,
    },
    statut: {
        type: DataTypes.ENUM('non payée', 'payée', 'annulée'),
        allowNull: false,
        defaultValue: 'non payée',
    },
}, {
    timestamps: true,
    tableName: 'factures',
});

module.exports = Facture;