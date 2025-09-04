const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StoreInfo = sequelize.define('StoreInfo', {
    idStoreInfo: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    nom: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    adresse: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    ville: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    codePostal: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    pays: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    emailPrincipal: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true,
        },
    },
    emailSecondaire: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isEmail: true,
        },
    },
    telephonePrincipal: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    telephoneSecondaire: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    heuresOuverture: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    latitude: {
        type: DataTypes.DOUBLE,
        allowNull: true,
    },
    longitude: {
        type: DataTypes.DOUBLE,
        allowNull: true,
    },
    logo1: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    logo2: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    descriptionHero: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    urlFacebook: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
            isUrl: true,
        },
    },
    urlInstagram: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
            isUrl: true,
        },
    },
    urlTiktok: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
            isUrl: true,
        },
    },
    urlYoutube: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
            isUrl: true,
        },
    },
    topDescription: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    timestamps: true,
    tableName: 'store_infos',
});

module.exports = StoreInfo;