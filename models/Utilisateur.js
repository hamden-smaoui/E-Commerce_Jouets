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
        allowNull: true,
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
    googleId: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    profileImage: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    isGoogleUser: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
    },
    facebookId: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: false
},
isFacebookUser: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
},
    tokenVersion: {
  type: DataTypes.INTEGER,
  allowNull: false,
  defaultValue: 0
},
}, {
    timestamps: true,
    tableName: 'utilisateurs',
});

module.exports = Utilisateur;