// services/PromotionService.js
const { 
    Promotion, 
    CodePromo, 
    PromotionProduit, 
    PromotionCategorie,
    PromotionMarque,
    PromotionType,
    PromotionUtilisation,
    Produit,
    Categorie,
    Marque,
    Type 
} = require('../models');
const { Op } = require('sequelize');

class PromotionService {
    
    // Méthode principale pour appliquer une promotion lors d'une commande
    static async appliquerPromotionCommande(commandeData, codePromo = null) {
        try {
            const promotion = await this.trouverPromotionApplicable(commandeData, codePromo);
            
            if (!promotion.promotion) {
                return { 
                    montantReduction: 0, 
                    promotion: null,
                    montantFinal: commandeData.montantTotal,
                    codePromo: null
                };
            }

            const eligibilite = await this.verifierEligibiliteComplete(
                promotion.promotion, 
                commandeData, 
                commandeData.idClient,
                promotion.codePromoObjet
            );

            if (!eligibilite.eligible) {
                return { 
                    montantReduction: 0, 
                    promotion: null,
                    montantFinal: commandeData.montantTotal,
                    error: eligibilite.message,
                    codePromo: null
                };
            }

            const montantReduction = await this.calculerReductionComplete(promotion.promotion, commandeData);
            
            return {
                montantReduction,
                promotion: promotion.promotion,
                codePromo: promotion.codePromoObjet,
                montantFinal: Math.max(0, commandeData.montantTotal - montantReduction)
            };

        } catch (error) {
            console.error('Erreur service promotion:', error);
            return { 
                montantReduction: 0, 
                promotion: null,
                montantFinal: commandeData.montantTotal,
                error: error.message,
                codePromo: null
            };
        }
    }

    // Trouver une promotion applicable avec vérification des produits
    static async trouverPromotionApplicable(commandeData, codePromo = null) {
        const maintenant = new Date();
        let promotion = null;
        let codePromoObjet = null;

        // Si code promo fourni, le vérifier
        if (codePromo) {
            codePromoObjet = await CodePromo.findOne({
                where: { 
                    code: codePromo, 
                    actif: true 
                },
                include: [{
                    model: Promotion,
                    as: 'promotion',
                    where: {
                        actif: true,
                        dateDebut: { [Op.lte]: maintenant },
                        dateFin: { [Op.gte]: maintenant }
                    }
                }]
            });

            if (codePromoObjet) {
                promotion = codePromoObjet.promotion;
            }
        } else {
            // Chercher des promotions automatiques
            promotion = await this.trouverPromotionAutomatique(commandeData);
        }

        return { promotion, codePromoObjet };
    }

    // Trouver promotion automatique avec vérification des produits du panier
    static async trouverPromotionAutomatique(commandeData) {
        const maintenant = new Date();
        const montantTotal = commandeData.montantTotal;
        const lignesCommandes = commandeData.lignesCommandes || [];

        // 1. Vérifier promotions de panier
        const promotionPanier = await Promotion.findOne({
            where: {
                typeApplication: 'panier',
                actif: true,
                dateDebut: { [Op.lte]: maintenant },
                dateFin: { [Op.gte]: maintenant },
                conditionMinimum: { [Op.lte]: montantTotal }
            },
            order: [['conditionMinimum', 'DESC']]
        });

        if (promotionPanier) return promotionPanier;

        // 2. Vérifier promotions sur produits spécifiques
        if (lignesCommandes.length > 0) {
            const produitsIds = lignesCommandes.map(ligne => ligne.idProduit);
            
            const promotionProduit = await Promotion.findOne({
                where: {
                    typeApplication: 'produit',
                    actif: true,
                    dateDebut: { [Op.lte]: maintenant },
                    dateFin: { [Op.gte]: maintenant }
                },
                include: [{
                    model: Produit,
                    as: 'produits',
                    where: {
                        idProduit: { [Op.in]: produitsIds }
                    },
                    through: { attributes: [] }
                }]
            });

            if (promotionProduit) return promotionProduit;

            // 3. Vérifier promotions sur catégories, marques, types
            const promotions = await this.verifierPromotionsParAttributs(lignesCommandes, maintenant);
            if (promotions) return promotions;
        }

        // 4. Promotions globales
        const promotionGlobale = await Promotion.findOne({
            where: {
                typeApplication: 'global',
                actif: true,
                dateDebut: { [Op.lte]: maintenant },
                dateFin: { [Op.gte]: maintenant }
            }
        });

        return promotionGlobale;
    }

    // Vérifier promotions par catégories, marques, types
    static async verifierPromotionsParAttributs(lignesCommandes, maintenant) {
        // Récupérer tous les produits avec leurs attributs
        const produitsIds = lignesCommandes.map(ligne => ligne.idProduit);
        const produits = await Produit.findAll({
            where: { idProduit: { [Op.in]: produitsIds } },
            include: [
                { model: Categorie, as: 'categorie' },
                { model: Marque, as: 'marque' },
                { model: Type, as: 'type' }
            ]
        });

        const categoriesIds = [...new Set(produits.map(p => p.idCategorie))];
        const marquesIds = [...new Set(produits.map(p => p.idMarque))];
        const typesIds = [...new Set(produits.map(p => p.idType).filter(Boolean))];

        // Vérifier promotions par catégorie
        if (categoriesIds.length > 0) {
            const promotionCategorie = await Promotion.findOne({
                where: {
                    typeApplication: 'categorie',
                    actif: true,
                    dateDebut: { [Op.lte]: maintenant },
                    dateFin: { [Op.gte]: maintenant }
                },
                include: [{
                    model: Categorie,
                    as: 'categories',
                    where: { idCategorie: { [Op.in]: categoriesIds } },
                    through: { attributes: [] }
                }]
            });

            if (promotionCategorie) return promotionCategorie;
        }

        // Vérifier promotions par marque
        if (marquesIds.length > 0) {
            const promotionMarque = await Promotion.findOne({
                where: {
                    typeApplication: 'marque',
                    actif: true,
                    dateDebut: { [Op.lte]: maintenant },
                    dateFin: { [Op.gte]: maintenant }
                },
                include: [{
                    model: Marque,
                    as: 'marques',
                    where: { idMarque: { [Op.in]: marquesIds } },
                    through: { attributes: [] }
                }]
            });

            if (promotionMarque) return promotionMarque;
        }

        // Vérifier promotions par type
        if (typesIds.length > 0) {
            const promotionType = await Promotion.findOne({
                where: {
                    typeApplication: 'type',
                    actif: true,
                    dateDebut: { [Op.lte]: maintenant },
                    dateFin: { [Op.gte]: maintenant }
                },
                include: [{
                    model: Type,
                    as: 'types',
                    where: { idType: { [Op.in]: typesIds } },
                    through: { attributes: [] }
                }]
            });

            if (promotionType) return promotionType;
        }

        return null;
    }

    // Vérifier éligibilité complète
    static async verifierEligibiliteComplete(promotion, commandeData, idUtilisateur, codePromo = null) {
        // Vérifications de base
        if (promotion.utilisationMax && promotion.utilisationActuelle >= promotion.utilisationMax) {
            return { eligible: false, message: 'Promotion épuisée' };
        }

        if (codePromo && codePromo.utilisationMax && codePromo.utilisationActuelle >= codePromo.utilisationMax) {
            return { eligible: false, message: 'Code promo épuisé' };
        }

        if (promotion.utilisationParClient && idUtilisateur) {
            const utilisationsUtilisateur = await PromotionUtilisation.count({
                where: {
                    idPromotion: promotion.idPromotion,
                    idUtilisateur: idUtilisateur
                }
            });

            if (utilisationsUtilisateur >= promotion.utilisationParClient) {
                return { eligible: false, message: 'Limite d\'utilisation atteinte pour ce client' };
            }
        }

        // Vérifications spécifiques selon le type d'application
        const verificationsSpecifiques = await this.verifierConditionsSpecifiques(promotion, commandeData);
        if (!verificationsSpecifiques.eligible) {
            return verificationsSpecifiques;
        }

        return { eligible: true };
    }

    // Vérifier conditions spécifiques selon le type de promotion
    static async verifierConditionsSpecifiques(promotion, commandeData) {
        const lignesCommandes = commandeData.lignesCommandes || [];

        switch (promotion.typeApplication) {
            case 'panier':
                if (promotion.conditionMinimum && commandeData.montantTotal < promotion.conditionMinimum) {
                    return { 
                        eligible: false, 
                        message: `Montant minimum requis: ${promotion.conditionMinimum}dt` 
                    };
                }
                if (promotion.quantiteMinimum) {
                    const quantiteTotal = lignesCommandes.reduce((total, ligne) => total + ligne.quantite, 0);
                    if (quantiteTotal < promotion.quantiteMinimum) {
                        return { 
                            eligible: false, 
                            message: `Quantité minimum requise: ${promotion.quantiteMinimum} articles` 
                        };
                    }
                }
                break;

            case 'produit':
                // Vérifier que les produits concernés sont dans le panier
                const produitsPromotion = await PromotionProduit.findAll({
                    where: { idPromotion: promotion.idPromotion }
                });
                const produitsPromotionIds = produitsPromotion.map(pp => pp.idProduit);
                const produitsCommandeIds = lignesCommandes.map(ligne => ligne.idProduit);
                
                const hasProduitsEligibles = produitsPromotionIds.some(id => 
                    produitsCommandeIds.includes(id)
                );

                if (!hasProduitsEligibles) {
                    return { 
                        eligible: false, 
                        message: 'Aucun produit éligible dans le panier' 
                    };
                }
                break;

            // Ajouter d'autres cas selon les besoins
        }

        return { eligible: true };
    }

    // Calculer réduction complète avec logique métier
    static async calculerReductionComplete(promotion, commandeData) {
        let montantReduction = 0;
        const lignesCommandes = commandeData.lignesCommandes || [];

        switch (promotion.typeApplication) {
            case 'panier':
            case 'global':
                montantReduction = await this.calculerReductionGlobale(promotion, commandeData.montantTotal, commandeData);
                break;

            case 'produit':
                montantReduction = await this.calculerReductionProduits(promotion, lignesCommandes);
                break;

            case 'categorie':
            case 'marque':
            case 'type':
                montantReduction = await this.calculerReductionParAttribut(promotion, lignesCommandes);
                break;
        }

        return Math.round(montantReduction * 100) / 100;
    }

    // Calculer réduction globale
    static async calculerReductionGlobale(promotion, montantTotal, commandeData) {
        switch (promotion.typePromotion) {
            case 'pourcentage':
                return (montantTotal * promotion.valeurPromotion) / 100;
            
            case 'montant_fixe':
                return Math.min(promotion.valeurPromotion, montantTotal);
            
            case 'livraison_gratuite':
                return commandeData.fraisLivraison || 0;
        }
        return 0;
    }

    // Calculer réduction pour produits spécifiques
    static async calculerReductionProduits(promotion, lignesCommandes) {
        const produitsPromotion = await PromotionProduit.findAll({
            where: { idPromotion: promotion.idPromotion }
        });
        const produitsPromotionIds = produitsPromotion.map(pp => pp.idProduit);

        const lignesEligibles = lignesCommandes.filter(ligne => 
            produitsPromotionIds.includes(ligne.idProduit)
        );

        const montantEligible = lignesEligibles.reduce((total, ligne) => 
            total + (ligne.quantite * ligne.prixUnitaire), 0
        );

        switch (promotion.typePromotion) {
            case 'pourcentage':
                return (montantEligible * promotion.valeurPromotion) / 100;
            case 'montant_fixe':
                return Math.min(promotion.valeurPromotion, montantEligible);
        }
        return 0;
    }

    // Calculer réduction par attribut (catégorie, marque, type)
    static async calculerReductionParAttribut(promotion, lignesCommandes) {
        const produitsIds = lignesCommandes.map(ligne => ligne.idProduit);
        const produits = await Produit.findAll({
            where: { idProduit: { [Op.in]: produitsIds } }
        });

        let produitsEligiblesIds = [];

        switch (promotion.typeApplication) {
            case 'categorie':
                const categoriesPromotion = await PromotionCategorie.findAll({
                    where: { idPromotion: promotion.idPromotion }
                });
                const categoriesIds = categoriesPromotion.map(cp => cp.idCategorie);
                produitsEligiblesIds = produits
                    .filter(p => categoriesIds.includes(p.idCategorie))
                    .map(p => p.idProduit);
                break;

            case 'marque':
                const marquesPromotion = await PromotionMarque.findAll({
                    where: { idPromotion: promotion.idPromotion }
                });
                const marquesIds = marquesPromotion.map(mp => mp.idMarque);
                produitsEligiblesIds = produits
                    .filter(p => marquesIds.includes(p.idMarque))
                    .map(p => p.idProduit);
                break;

            case 'type':
                const typesPromotion = await PromotionType.findAll({
                    where: { idPromotion: promotion.idPromotion }
                });
                const typesIds = typesPromotion.map(tp => tp.idType);
                produitsEligiblesIds = produits
                    .filter(p => typesIds.includes(p.idType))
                    .map(p => p.idProduit);
                break;
        }

        const lignesEligibles = lignesCommandes.filter(ligne => 
            produitsEligiblesIds.includes(ligne.idProduit)
        );

        const montantEligible = lignesEligibles.reduce((total, ligne) => 
            total + (ligne.quantite * ligne.prixUnitaire), 0
        );

        switch (promotion.typePromotion) {
            case 'pourcentage':
                return (montantEligible * promotion.valeurPromotion) / 100;
            case 'montant_fixe':
                return Math.min(promotion.valeurPromotion, montantEligible);
        }
        return 0;
    }

    // Enregistrer l'utilisation d'une promotion
    static async enregistrerUtilisation(idPromotion, idCommande, idUtilisateur, montantReduction, idCodePromo = null) {
        try {
            await PromotionUtilisation.create({
                idPromotion,
                idCodePromo,
                idCommande,
                idUtilisateur,
                montantReduction
            });

            await Promotion.increment('utilisationActuelle', {
                where: { idPromotion }
            });

            if (idCodePromo) {
                await CodePromo.increment('utilisationActuelle', {
                    where: { idCodePromo }
                });
            }

        } catch (error) {
            console.error('Erreur enregistrement utilisation:', error);
            throw error;
        }
    }

    // Obtenir les promotions actives pour un produit
    static async getPromotionsActives(idProduit = null) {
        const maintenant = new Date();
        const where = {
            actif: true,
            dateDebut: { [Op.lte]: maintenant },
            dateFin: { [Op.gte]: maintenant }
        };

        if (idProduit) {
            return await Promotion.findAll({
                where,
                include: [{
                    model: Produit,
                    as: 'produits',
                    where: { idProduit },
                    through: { attributes: [] }
                }]
            });
        }

        return await Promotion.findAll({ where });
    }
}

module.exports = PromotionService;