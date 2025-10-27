const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Image = sequelize.define('Image', {
    idImage: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    url: {
    type: DataTypes.STRING(500), 
    allowNull: false
  },
  public_id: { // ✅ NOUVEAU CHAMP
    type: DataTypes.STRING(255),
    allowNull: true
  },
    rang: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    idProduit: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'produits',
            key: 'idProduit',
        },
    },
    idStoreInfo: {
        type: DataTypes.INTEGER,
        allowNull: true, 
        references: {
            model: 'store_infos',
            key: 'idStoreInfo',
        },
    },
    type: {
        type: DataTypes.ENUM('hero', 'promotion'),
        allowNull: true,
        defaultValue: 'hero'
    }
}, {
    timestamps: true,
    tableName: 'images',
});
module.exports = Image;