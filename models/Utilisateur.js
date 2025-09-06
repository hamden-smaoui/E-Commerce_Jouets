const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Utilisateur = sequelize.define('Utilisateur', {
    idUtilisateur: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    prenom: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    nom: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: false,
    },
    motDePasse: {
        type: DataTypes.STRING,
        allowNull: true, 
    },
    telephone: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    adresseRue: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    adresseVille: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    adresseCodePostal: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    adressePays: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'Tunisie',
    },
    role: {
        type: DataTypes.ENUM('admin', 'client'),
        allowNull: true,
        defaultValue: 'client',
    },
    resetCode : {
        type: DataTypes.STRING,
        allowNull: true,
    },
    resetCodeExpiry : {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    timestamps: true,
    tableName: 'utilisateurs',
});

module.exports = Utilisateur;