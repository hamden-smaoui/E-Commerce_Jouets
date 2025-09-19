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
    
    // Dans PromotionService.js

static async appliquerPromotionCommande(commandeData, codePromo = null, transaction = null) {
    try {
        const promotion = await this.trouverPromotionApplicable(commandeData, codePromo, transaction);
        
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
            promotion.codePromoObjet,
            transaction
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

        const montantReduction = await this.calculerReductionComplete(promotion.promotion, commandeData, transaction);
        
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

// Modifier aussi cette méthode
static async enregistrerUtilisation(idPromotion, idCommande, idUtilisateur, montantReduction, idCodePromo = null, transaction = null) {
    try {
        await PromotionUtilisation.create({
            idPromotion,
            idCodePromo,
            idCommande,
            idUtilisateur,
            montantReduction
        }, { transaction }); // Utiliser la transaction ici

        await Promotion.increment('utilisationActuelle', {
            where: { idPromotion },
            transaction // Utiliser la transaction ici
        });

        if (idCodePromo) {
            await CodePromo.increment('utilisationActuelle', {
                where: { idCodePromo },
                transaction // Utiliser la transaction ici
            });
        }

    } catch (error) {
        console.error('Erreur enregistrement utilisation:', error);
        throw error;
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

    

   static async getPromotionsActives(idProduit = null) {
        try {
            const now = new Date();
            
            // Si un idProduit est fourni, récupérer les infos du produit
            let produit = null;
            if (idProduit) {
                produit = await Produit.findByPk(idProduit, {
                    include: [
                        { model: Categorie, as: 'categorie' },
                        { model: Marque, as: 'marque' },
                        { model: Type, as: 'type' }
                    ]
                });
                
                if (!produit) {
                    throw new Error('Produit non trouvé');
                }
            }

            const promotionsApplicables = [];

            // 1. Promotions globales
            const promotionsGlobales = await Promotion.findAll({
                where: {
                    typeApplication: 'global',
                    actif: true,
                    dateDebut: { [Op.lte]: now },
                    dateFin: { [Op.gte]: now }
                }
            });
            promotionsApplicables.push(...promotionsGlobales);

            // 2. Promotions panier (s'appliquent à tous les produits)
            const promotionsPanier = await Promotion.findAll({
                where: {
                    typeApplication: 'panier',
                    actif: true,
                    dateDebut: { [Op.lte]: now },
                    dateFin: { [Op.gte]: now }
                }
            });
            promotionsApplicables.push(...promotionsPanier);

            if (produit) {
                // 3. Promotions spécifiques au produit
                const promotionsProduit = await Promotion.findAll({
                    where: {
                        typeApplication: 'produit',
                        actif: true,
                        dateDebut: { [Op.lte]: now },
                        dateFin: { [Op.gte]: now }
                    },
                    include: [{
                        model: Produit,
                        as: 'produits',
                        where: { idProduit: produit.idProduit },
                        through: { attributes: [] }
                    }]
                });
                promotionsApplicables.push(...promotionsProduit);

                // 4. Promotions par catégorie
                if (produit.idCategorie) {
                    const promotionsCategorie = await Promotion.findAll({
                        where: {
                            typeApplication: 'categorie',
                            actif: true,
                            dateDebut: { [Op.lte]: now },
                            dateFin: { [Op.gte]: now }
                        },
                        include: [{
                            model: Categorie,
                            as: 'categories',
                            where: { idCategorie: produit.idCategorie },
                            through: { attributes: [] }
                        }]
                    });
                    promotionsApplicables.push(...promotionsCategorie);
                }

                // 5. Promotions par marque
                if (produit.idMarque) {
                    const promotionsMarque = await Promotion.findAll({
                        where: {
                            typeApplication: 'marque',
                            actif: true,
                            dateDebut: { [Op.lte]: now },
                            dateFin: { [Op.gte]: now }
                        },
                        include: [{
                            model: Marque,
                            as: 'marques',
                            where: { idMarque: produit.idMarque },
                            through: { attributes: [] }
                        }]
                    });
                    promotionsApplicables.push(...promotionsMarque);
                }

                // 6. Promotions par type
                if (produit.idType) {
                    const promotionsType = await Promotion.findAll({
                        where: {
                            typeApplication: 'type',
                            actif: true,
                            dateDebut: { [Op.lte]: now },
                            dateFin: { [Op.gte]: now }
                        },
                        include: [{
                            model: Type,
                            as: 'types',
                            where: { idType: produit.idType },
                            through: { attributes: [] }
                        }]
                    });
                    promotionsApplicables.push(...promotionsType);
                }
            }

            // Éliminer les doublons et formater la réponse
            const promotionsUniques = promotionsApplicables.reduce((acc, promo) => {
                if (!acc.find(p => p.idPromotion === promo.idPromotion)) {
                    acc.push({
                        idPromotion: promo.idPromotion,
                        nom: promo.nom,
                        description: promo.description,
                        typePromotion: promo.typePromotion,
                        valeurPromotion: promo.valeurPromotion,
                        typeApplication: promo.typeApplication
                    });
                }
                return acc;
            }, []);

            return promotionsUniques;

        } catch (error) {
            console.error('Erreur récupération promotions actives:', error);
            throw error;
        }
    }

    // Méthode pour calculer le prix avec promotions
    static async calculerPrixAvecPromotions(idProduit, prixOriginal, quantite = 1) {
        try {
            const promotions = await this.getPromotionsActives(idProduit);
            
            if (promotions.length === 0) {
                return {
                    prixFinal: prixOriginal,
                    reduction: 0,
                    pourcentageReduction: 0,
                    promotionAppliquee: null
                };
            }

            let meilleurReduction = 0;
            let promotionAppliquee = null;

            promotions.forEach(promo => {
                let reduction = 0;
                
                if (promo.typePromotion === 'pourcentage') {
                    reduction = prixOriginal * (promo.valeurPromotion / 100);
                } else if (promo.typePromotion === 'montant_fixe') {
                    reduction = Math.min(promo.valeurPromotion, prixOriginal);
                }
                
                if (reduction > meilleurReduction) {
                    meilleurReduction = reduction;
                    promotionAppliquee = promo;
                }
            });

            const prixFinal = Math.max(0, prixOriginal - meilleurReduction);
            const pourcentageReduction = prixOriginal > 0 ? (meilleurReduction / prixOriginal) * 100 : 0;

            return {
                prixFinal,
                reduction: meilleurReduction,
                pourcentageReduction,
                promotionAppliquee,
                promotionsDisponibles: promotions
            };

        } catch (error) {
            console.error('Erreur calcul prix avec promotions:', error);
            throw error;
        }
    }

static async calculerPrixProduit(idProduit, prixOriginal, quantite = 1, idUtilisateur = null, transaction = null) {
    try {
        const maintenant = new Date();

        // Récupérer le produit avec ses attributs
        const produit = await Produit.findByPk(idProduit, {
            include: [
                { model: Categorie, as: 'categorie' },
                { model: Marque, as: 'marque' },
                { model: Type, as: 'type' }
            ],
            transaction
        });

        if (!produit) {
            throw new Error('Produit non trouvé');
        }

        // Récupérer toutes les promotions applicables
        const promotions = await Promotion.findAll({
            where: {
                actif: true,
                dateDebut: { [Op.lte]: maintenant },
                dateFin: { [Op.gte]: maintenant }
            },
            include: [
                {
                    model: Produit,
                    as: 'produits',
                    where: { idProduit },
                    required: false,
                    through: { attributes: [] }
                },
                {
                    model: Categorie,
                    as: 'categories',
                    where: { idCategorie: produit.idCategorie },
                    required: false,
                    through: { attributes: [] }
                },
                {
                    model: Marque,
                    as: 'marques',
                    where: { idMarque: produit.idMarque },
                    required: false,
                    through: { attributes: [] }
                },
                {
                    model: Type,
                    as: 'types',
                    where: { idType: produit.idType },
                    required: false,
                    through: { attributes: [] }
                }
            ],
            transaction
        });

        // Si aucune promotion, retourner le prix original
        if (!promotions || promotions.length === 0) {
            return {
                prixFinal: prixOriginal,
                idPromotion: null,
                reduction: 0,
                pourcentageReduction: 0
            };
        }

        let meilleurReduction = 0;
        let meilleurePromotion = null;

        // Vérifier l'éligibilité et calculer la meilleure réduction
        for (const promotion of promotions) {
            // Vérifier l'éligibilité de l'utilisateur
            if (idUtilisateur && promotion.utilisationParClient) {
                const utilisations = await PromotionUtilisation.count({
                    where: {
                        idPromotion: promotion.idPromotion,
                        idUtilisateur
                    },
                    transaction
                });
                if (utilisations >= promotion.utilisationParClient) {
                    continue;
                }
            }

            // Vérifier si la promotion est épuisée
            if (promotion.utilisationMax && promotion.utilisationActuelle >= promotion.utilisationMax) {
                continue;
            }

            // Vérifier si le produit est éligible
            let produitEligible = false;
            if (promotion.typeApplication === 'produit') {
                produitEligible = promotion.produits.some(p => p.idProduit === idProduit);
            } else if (promotion.typeApplication === 'categorie') {
                produitEligible = promotion.categories.some(c => c.idCategorie === produit.idCategorie);
            } else if (promotion.typeApplication === 'marque') {
                produitEligible = promotion.marques.some(m => m.idMarque === produit.idMarque);
            } else if (promotion.typeApplication === 'type') {
                produitEligible = promotion.types.some(t => t.idType === produit.idType);
            }

            if (!produitEligible) {
                continue;
            }

            // Calculer la réduction
            let reduction = 0;
            if (promotion.typePromotion === 'pourcentage') {
                reduction = prixOriginal * (promotion.valeurPromotion / 100);
            } else if (promotion.typePromotion === 'montant_fixe') {
                reduction = Math.min(promotion.valeurPromotion, prixOriginal);
            }

            if (reduction > meilleurReduction) {
                meilleurReduction = reduction;
                meilleurePromotion = promotion;
            }
        }

        const prixFinal = Math.max(0, prixOriginal - meilleurReduction);
        const pourcentageReduction = prixOriginal > 0 ? (meilleurReduction / prixOriginal) * 100 : 0;

        return {
            prixFinal,
            idPromotion: meilleurePromotion ? meilleurePromotion.idPromotion : null,
            reduction: meilleurReduction,
            pourcentageReduction
        };

    } catch (error) {
        console.error('Erreur calcul prix produit:', error);
        throw error;
    }
}


static async appliquerCodePromo(commandeData, codePromo, transaction = null) {
    try {
        const maintenant = new Date();

        // 1. Vérifier l'existence et la validité du code promo
        const codePromoObjet = await CodePromo.findOne({
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
            }],
            transaction
        });

        if (!codePromoObjet || !codePromoObjet.promotion) {
            return {
                montantReduction: 0,
                promotion: null,
                montantFinal: commandeData.montantTotal,
                codePromo: null,
                error: 'Code promo invalide ou promotion expirée'
            };
        }

        const promotion = codePromoObjet.promotion;

        // 2. Vérifier l'éligibilité de la promotion
        const eligibilite = await this.verifierEligibiliteComplete(
            promotion,
            commandeData,
            commandeData.idClient,
            codePromoObjet,
            transaction
        );

        if (!eligibilite.eligible) {
            return {
                montantReduction: 0,
                promotion: null,
                montantFinal: commandeData.montantTotal,
                codePromo: null,
                error: eligibilite.message
            };
        }

        // 3. Calculer la réduction
        const montantReduction = await this.calculerReductionComplete(promotion, commandeData, transaction);

        // 4. Retourner le résultat
        return {
            montantReduction,
            promotion,
            codePromo: codePromoObjet,
            montantFinal: Math.max(0, commandeData.montantTotal - montantReduction)
        };

    } catch (error) {
        console.error('Erreur application code promo:', error);
        return {
            montantReduction: 0,
            promotion: null,
            montantFinal: commandeData.montantTotal,
            codePromo: null,
            error: error.message
        };
    }
}
}

module.exports = PromotionService;