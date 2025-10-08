const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Utilisateur = require('./Utilisateur');

const Reclamation = sequelize.define('Reclamation', {
    idReclamation: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    sujet: {
        type: DataTypes.STRING,
        allowNull: false,
        maxLength: 100,
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false,
        maxLength: 1000,
    },
    statut: {
        type: DataTypes.ENUM('en_attente', 'en_cours', 'resolue', 'fermee'),
        allowNull: false,
        defaultValue: 'en_attente',
    },
    idUtilisateur: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Utilisateur,
            key: 'idUtilisateur',
        },
        onDelete: 'CASCADE',
    },
}, {
    timestamps: true,
    tableName: 'reclamations',
});


module.exports = Reclamation;