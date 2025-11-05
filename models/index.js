const sequelize = require('../config/database');

// ✅ IMPORTANT : Importer TOUS les modèles AVANT de créer les associations
const Utilisateur = require('./Utilisateur');
const Categorie = require('./Categorie');
const Produit = require('./Produit');
const Commande = require('./Commande');
const LigneCommande = require('./LigneCommande');
const Facture = require('./Facture');
const Image = require('./Image'); // ✅ Vérifier que ce fichier exporte bien le modèle
const Panier = require('./Panier');
const PanierProduit = require('./PanierProduit');
const Favori = require('./Favori');
const Type = require('./Type');
const Marque = require('./Marque');
const CategorieType = require('./CategorieType');
const Fournisseur = require('./Fournisseur');
const CodePromo = require('./CodePromo');
const PromotionProduit = require('./PromotionProduit');
const PromotionCategorie = require('./PromotionCategorie');
const PromotionMarque = require('./PromotionMarque');
const PromotionType = require('./PromotionType');
const PromotionUtilisation = require('./PromotionUtilisation');
const Promotion = require('./Promotion');
const Reclamation = require('./Reclamation');
const StoreInfo = require('./StoreInfo');
const Avis = require('./Avis');
const Commentaire = require('./Commentaire');
const ProduitVariation = require('./ProduitVariation');
const Couleur = require('./Couleur');
const Taille = require('./Taille');
const Age = require('./Age');
const NewsLetter = require('./NewsLetter');
const NewsletterCampaign = require('./NewsletterCampaign');

// ✅ DEBUG : Vérifier que Image est bien défini
console.log('🔍 Type de Image:', typeof Image);
console.log('🔍 Image est un modèle Sequelize?', Image.prototype instanceof sequelize.Sequelize.Model);

// Existing associations
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
Facture.belongsTo(Commande, { foreignKey: 'idCommande', as: 'facture' });

// ✅ Cette ligne pose problème (ligne 54 probablement)
Produit.hasMany(Image, { foreignKey: 'idProduit', as: 'images' });
Image.belongsTo(Produit, { foreignKey: 'idProduit', as: 'produit' });

StoreInfo.hasMany(Image, { foreignKey: 'idStoreInfo', as: 'heroImages' });
StoreInfo.hasMany(Image, { foreignKey: 'idStoreInfo', as: 'promotionImages' });
Image.belongsTo(StoreInfo, { foreignKey: 'idStoreInfo', as: 'storeInfo' });

// ✅ NOUVEAU : Association Image → Couleur
Image.belongsTo(Couleur, { 
    foreignKey: 'idCouleur', 
    as: 'couleur' 
});
Couleur.hasMany(Image, { 
    foreignKey: 'idCouleur', 
    as: 'images' 
});
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

Favori.belongsTo(Produit, { foreignKey: 'idProduit', as: 'produit' });
Favori.belongsTo(Utilisateur, { foreignKey: 'idUtilisateur', as: 'utilisateur' });

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

Marque.hasMany(Produit, { foreignKey: 'idMarque', as: 'produits' });
Produit.belongsTo(Marque, { foreignKey: 'idMarque', as: 'marque' });

Fournisseur.hasMany(Produit, { foreignKey: 'idFournisseur', as: 'produits' });
Produit.belongsTo(Fournisseur, { foreignKey: 'idFournisseur', as: 'fournisseur' });

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

Promotion.hasMany(PromotionUtilisation, { foreignKey: 'idPromotion', as: 'utilisations' });
PromotionUtilisation.belongsTo(Promotion, { foreignKey: 'idPromotion', as: 'promotion' });

Reclamation.belongsTo(Utilisateur, { 
    foreignKey: 'idUtilisateur', 
    as: 'utilisateur' 
});

Utilisateur.hasMany(Reclamation, { 
    foreignKey: 'idUtilisateur', 
    as: 'reclamations' 
});


// Associations pour les Avis
Utilisateur.hasMany(Avis, { foreignKey: 'idUtilisateur', as: 'avis' });
Avis.belongsTo(Utilisateur, { foreignKey: 'idUtilisateur', as: 'utilisateur' });

Produit.hasMany(Avis, { foreignKey: 'idProduit', as: 'avis' });
Avis.belongsTo(Produit, { foreignKey: 'idProduit', as: 'produit' });

// Associations pour les Commentaires
Utilisateur.hasMany(Commentaire, { foreignKey: 'idUtilisateur', as: 'commentaires' });
Commentaire.belongsTo(Utilisateur, { foreignKey: 'idUtilisateur', as: 'utilisateur' });

Produit.hasMany(Commentaire, { foreignKey: 'idProduit', as: 'commentaires' });
Commentaire.belongsTo(Produit, { foreignKey: 'idProduit', as: 'produit' });

// Nouvelles associations pour les promotions
LigneCommande.belongsTo(Promotion, { 
    foreignKey: 'idPromotionAppliquee', 
    as: 'promotionAppliquee',
    constraints: false // Pour permettre NULL
});
Promotion.hasMany(LigneCommande, { 
    foreignKey: 'idPromotionAppliquee', 
    as: 'lignesCommandesAppliquees' 
});

// Renommer l'association existante pour plus de clarté
Commande.belongsTo(Promotion, { 
    foreignKey: 'idPromotionGlobale', // Ancien: idPromotionUtilisee
    as: 'promotionGlobale',
    constraints: false
});
Promotion.hasMany(Commande, { 
    foreignKey: 'idPromotionGlobale',
    as: 'commandesGlobales' 
});

Produit.hasMany(ProduitVariation, { as: 'variations', foreignKey: 'idProduit' });
ProduitVariation.belongsTo(Produit, { foreignKey: 'idProduit' });

// ProduitVariation → Couleur/Taille/Age
ProduitVariation.belongsTo(Couleur, { as: 'couleur', foreignKey: 'idCouleur' });
ProduitVariation.belongsTo(Taille, { as: 'taille', foreignKey: 'idTaille' });
ProduitVariation.belongsTo(Age, { as: 'age', foreignKey: 'idAge' });



// Dans votre fichier models/index.js ou associations.js
PanierProduit.belongsTo(ProduitVariation, {
    foreignKey: 'idProduitVariation',
    as: 'variation'
});

ProduitVariation.hasMany(PanierProduit, {
    foreignKey: 'idProduitVariation',
    as: 'paniersProduits'
});

LigneCommande.belongsTo(ProduitVariation, { as: 'variation', foreignKey: 'idProduitVariation' });
ProduitVariation.hasMany(LigneCommande, { as: 'lignesCommandes', foreignKey: 'idProduitVariation' });

Age.hasMany(Produit, { foreignKey: 'idAge', as: 'produits' });
Produit.belongsTo(Age, { foreignKey: 'idAge', as: 'age' });


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
    Reclamation,
    StoreInfo,
    Avis,
    Commentaire,
    ProduitVariation,
    Couleur,
    Taille,
    Age,
    NewsLetter,
    NewsletterCampaign,
};