const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Commentaire = sequelize.define('Commentaire', {
    idCommentaire: {
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
    contenu: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            len: [1, 500],
        },
    },
}, {
    timestamps: true,
    tableName: 'commentaires',
    indexes: [
        {
            fields: ['idProduit']
        },
        {
            fields: ['idUtilisateur']
        }
    ]
});

module.exports = Commentaire;