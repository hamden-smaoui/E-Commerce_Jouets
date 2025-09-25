const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LigneCommande = sequelize.define('LigneCommande', {
    idLigneCommande: {
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
    idProduit: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'produits',
            key: 'idProduit',
        },
    },
    idProduitVariation: {
         type: DataTypes.INTEGER,
          allowNull: true,
           references: { model: 'produit_variations', key: 'idProduitVariation' }
         }, 

    quantite: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    prixUnitaireOriginal: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        comment: 'Prix unitaire original du produit au moment de la commande'
    },
    prixUnitaireFinal: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        comment: 'Prix unitaire final après application des promotions'
    },
    // Garder prixUnitaire pour la compatibilité, mais utiliser prixUnitaireFinal
    prixUnitaire: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        comment: 'Prix unitaire facturé (= prixUnitaireFinal pour compatibilité)'
    },
    sousTotal: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        comment: 'Sous-total de la ligne (prixUnitaireFinal * quantite)'
    },
    reductionUnitaire: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        defaultValue: 0,
        comment: 'Montant de réduction par unité'
    },
    idPromotionAppliquee: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'promotions',
            key: 'idPromotion',
        },
        comment: 'Promotion appliquée à cette ligne de commande'
    },
}, {
    timestamps: true,
    tableName: 'lignes_commandes',
    hooks: {
        beforeSave: (ligneCommande) => {
            // S'assurer que prixUnitaire = prixUnitaireFinal pour la compatibilité
            ligneCommande.prixUnitaire = ligneCommande.prixUnitaireFinal;
            // Calculer le sous-total
            ligneCommande.sousTotal = ligneCommande.prixUnitaireFinal * ligneCommande.quantite;
            // Calculer la réduction unitaire
            ligneCommande.reductionUnitaire = ligneCommande.prixUnitaireOriginal - ligneCommande.prixUnitaireFinal;
        }
    }
});

module.exports = LigneCommande;