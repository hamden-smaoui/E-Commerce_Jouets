const sequelize = require('../config/database');
const Utilisateur = require('./Utilisateur');
const Categorie = require('./Categorie');
const Produit = require('./Produit');
const Commande = require('./Commande');
const LigneCommande = require('./LigneCommande');
const Facture = require('./Facture');
const Image = require('./Image');
const Panier = require('./Panier');
const PanierProduit = require('./PanierProduit');
const Favori = require('./Favori');
const Type = require('./Type'); // Add Type model
const Marque = require('./Marque'); // Add Marque model
const CategorieType = require('./CategorieType'); // Add CategorieType model
const Fournisseur = require('./Fournisseur'); // Add Fournisseur model
const CodePromo = require('./CodePromo'); // Add CodePromo model
const PromotionProduit = require('./PromotionProduit'); // Add PromotionProduit model
const PromotionCategorie = require('./PromotionCategorie'); // Add PromotionCategorie model
const PromotionMarque = require('./PromotionMarque'); // Add PromotionMarque model
const PromotionType = require('./PromotionType'); // Add PromotionType model
const PromotionUtilisation = require('./PromotionUtilisation'); // Add PromotionUtilisation model
const Promotion = require('./promotion');

// Existing associations (unchanged)
Utilisateur.hasMany(Commande, { foreignKey: 'idClient', as: 'commandes' });
Commande.belongsTo(Utilisateur, { foreignKey: 'idClient', as: 'client' });

Categorie.hasMany(Produit, { foreignKey: 'idCategorie', as: 'produits' });
Produit.belongsTo(Categorie, { foreignKey: 'idCategorie', as: 'categorie' });

Type.hasMany(Produit, { foreignKey: 'idType', as: 'produits' });
Produit.belongsTo(Type, { foreignKey: 'idType', as: 'type' });

Commande.hasMany(LigneCommande, { foreignKey: 'idCommande', as: 'lignesCommandes' });
LigneCommande.belongsTo(Commande, { foreignKey: 'idCommande', as: 'commande' });

Produit.hasMany(LigneCommande, { foreignKey: 'idProduit', as: 'lignesCommandes' });
LigneCommande.belongsTo(Produit, { foreignKey: 'idProduit', as: 'produit' });

Commande.hasOne(Facture, { foreignKey: 'idCommande', as: 'facture' });
Facture.belongsTo(Commande, { foreignKey: 'idCommande', as: 'commande' });

Produit.hasMany(Image, { foreignKey: 'idProduit', as: 'images' });
Image.belongsTo(Produit, { foreignKey: 'idProduit', as: 'produit' });

Utilisateur.hasOne(Panier, { foreignKey: 'idUtilisateur', as: 'panier' });
Panier.belongsTo(Utilisateur, { foreignKey: 'idUtilisateur', as: 'utilisateur' });

Panier.hasMany(PanierProduit, { foreignKey: 'idPanier', as: 'produits' });
PanierProduit.belongsTo(Panier, { foreignKey: 'idPanier', as: 'panier' });

Produit.hasMany(PanierProduit, { foreignKey: 'idProduit', as: 'paniersProduits' });
PanierProduit.belongsTo(Produit, { foreignKey: 'idProduit', as: 'produit' });

Utilisateur.belongsToMany(Produit, {
    through: Favori,
    as: 'favoris',
    foreignKey: 'idUtilisateur',
    otherKey: 'idProduit',
});
Produit.belongsToMany(Utilisateur, {
    through: Favori,
    as: 'utilisateursFavoris',
    foreignKey: 'idProduit',
    otherKey: 'idUtilisateur',
});

Categorie.belongsToMany(Type, {
    through: CategorieType,
    foreignKey: 'idCategorie',
    otherKey: 'idType',
    as: 'types',
});

Type.belongsToMany(Categorie, {
    through: CategorieType,
    foreignKey: 'idType',
    otherKey: 'idCategorie',
    as: 'categories',
});

// New associations for Marque
Marque.hasMany(Produit, { foreignKey: 'idMarque', as: 'produits' });
Produit.belongsTo(Marque, { foreignKey: 'idMarque', as: 'marque' });

Fournisseur.hasMany(Produit, { foreignKey: 'idFournisseur', as: 'produits' });
Produit.belongsTo(Fournisseur, { foreignKey: 'idFournisseur', as: 'fournisseur' });




Promotion.hasMany(CodePromo, { foreignKey: 'idPromotion', as: 'codesPromo' });
CodePromo.belongsTo(Promotion, { foreignKey: 'idPromotion', as: 'promotion' });

// Many-to-many associations
Promotion.belongsToMany(Produit, {
    through: PromotionProduit,
    foreignKey: 'idPromotion',
    otherKey: 'idProduit',
    as: 'produits'
});

Promotion.belongsToMany(Categorie, {
    through: PromotionCategorie,
    foreignKey: 'idPromotion',
    otherKey: 'idCategorie',
    as: 'categories'
});

Promotion.belongsToMany(Marque, {
    through: PromotionMarque,
    foreignKey: 'idPromotion',
    otherKey: 'idMarque',
    as: 'marques'
});

Promotion.belongsToMany(Type, {
    through: PromotionType,
    foreignKey: 'idPromotion',
    otherKey: 'idType',
    as: 'types'
});

// Utilisation associations
Promotion.hasMany(PromotionUtilisation, { foreignKey: 'idPromotion', as: 'utilisations' });
PromotionUtilisation.belongsTo(Promotion, { foreignKey: 'idPromotion', as: 'promotion' });

module.exports = {
    sequelize,
    Utilisateur,
    Categorie,
    Produit,
    Commande,
    LigneCommande,
    Facture,
    Image,
    Panier,
    PanierProduit,
    Favori,
    Type,
    Marque,
    CategorieType,
    Fournisseur,
    Promotion,
    CodePromo,
    PromotionProduit,
    PromotionCategorie,
    PromotionMarque,
    PromotionType,
    PromotionUtilisation,
};