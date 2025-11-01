const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Produit = sequelize.define('Produit', {
    idProduit: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    nom: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    prix: {
        type: DataTypes.DOUBLE,
        allowNull: false,
    },
    quantiteStock: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    livraisonGratuite: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Si true, la livraison est gratuite pour ce produit'
    },
    idCategorie: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'categories',
            key: 'idCategorie',
        },
    },
    idMarque: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'marques',
            key: 'idMarque',
        },
    },
    idFournisseur: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'fournisseurs',
            key: 'idFournisseur',
        },
    },
    idType: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'types',
            key: 'idType',
        },
    },
     idAge: {
        type: DataTypes.INTEGER,
        allowNull: true, 
        references: {
            model: 'ages',
            key: 'idAge',
        },
    },
    genre: {
        type: DataTypes.ENUM('fille', 'garçon', 'enfant'),
        allowNull: false,
        defaultValue: 'enfant',
    },
     
}, {
    timestamps: true,
    tableName: 'produits',
});

module.exports = Produit;