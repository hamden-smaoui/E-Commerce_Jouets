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
    type: DataTypes.STRING(500), // ⚠️ Augmente la taille
    allowNull: true
  },
  logo1PublicId: { // ✅ NOUVEAU CHAMP
    type: DataTypes.STRING(255),
    allowNull: true
  },
  logo2: {
    type: DataTypes.STRING(500), // ⚠️ Augmente la taille
    allowNull: true
  },
  logo2PublicId: { // ✅ NOUVEAU CHAMP
    type: DataTypes.STRING(255),
    allowNull: true
  },
    descriptionHero: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    urlFacebook: {
        type: DataTypes.TEXT,
        allowNull: true,
        
    },
    urlInstagram: {
        type: DataTypes.TEXT,
        allowNull: true,
        
    },
    urlTiktok: {
        type: DataTypes.TEXT,
        allowNull: true,
        
    },
    urlYoutube: {
        type: DataTypes.TEXT,
        allowNull: true,
        
    },
    topDescription: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    tauxTVA: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 19,
        },
    entrepriseSiret: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    fraisLivraison: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 7,
        },    
    seuilLivraisonGratuite: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 100,
        },
}, {
    timestamps: true,
    tableName: 'store_infos',
});

module.exports = StoreInfo;