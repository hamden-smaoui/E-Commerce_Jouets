// services/CommandeService.js
const { Commande, Utilisateur, LigneCommande, Facture, Produit, StoreInfo , ProduitVariation, Couleur, Taille, Age } = require('../models');
const PromotionService = require('./PromotionService');
const sequelize = require('../config/database');
const { v4: uuidv4 } = require('uuid');
class CommandeService {
    
    async creerCommande(donneesCommande, transaction) {
        const { lignesCommandes, codePromo, fraisLivraison = 0, ...commandeData } = donneesCommande;
        // 1. Traiter les produits et promotions (modifie ici)
        const lignesAvecPromotions = await this.traiterProduitsEtPromotions(
            lignesCommandes, 
            commandeData.idClient, 
            transaction
        );
        // 2. Calcul montants
        const montants = this.calculerMontants(lignesAvecPromotions, fraisLivraison);
        // 3. Appliquer code promo global
        const resultatsPromo = await this.appliquerCodePromoGlobal(
            codePromo, 
            commandeData, 
            lignesAvecPromotions, 
            montants, 
            fraisLivraison, 
            transaction
        );
        // 4. Mettre à jour profil utilisateur
        if (commandeData.idClient) {
            await this.mettreAJourProfilUtilisateur(commandeData, transaction);
        }
        // 5. Créer la commande
        const commande = await this.creerEntiteCommande(
            commandeData, 
            montants, 
            resultatsPromo, 
            fraisLivraison, 
            transaction
        );
        // 6. Créer lignes de commande (modifie ici)
        await this.creerLignesCommande(commande.idCommande, lignesAvecPromotions, transaction);

        return {
            commande,
            montants,
            resultatsPromo,
            lignesAvecPromotions
        };
    }
    
 
 async traiterProduitsEtPromotions(lignesCommandes, idClient, transaction) {
        return await Promise.all(
            lignesCommandes.map(async (ligne) => {
                // On attend idProduitVariation dans chaque ligne
                const variation = await ProduitVariation.findByPk(ligne.idProduitVariation, { transaction });
                if (!variation) throw new Error(`Variation ${ligne.idProduitVariation} non trouvée`);
                if (variation.quantiteStock < ligne.quantite) throw new Error(`Stock insuffisant pour la variation`);

                // Décrémenter le stock de la variation (PAS du produit)
                variation.quantiteStock -= ligne.quantite;
                await variation.save({ transaction });

                // On peut aller chercher le produit lié si besoin
                const produit = await Produit.findByPk(variation.idProduit, { transaction });

                // Calculer la promo éventuellement (à adapter selon ta logique)
                const promotionResult = await PromotionService.calculerPrixProduit(
                    produit.idProduit,
                    produit.prix,
                    ligne.quantite,
                    idClient
                );

                return {
                    ...ligne,
                    idProduit: produit.idProduit, // utile pour stat ou affichage
                    idProduitVariation: variation.idProduitVariation,
                    prixUnitaireOriginal: produit.prix,
                    prixUnitaireFinal: promotionResult.prixFinal,
                    reductionUnitaire: produit.prix - promotionResult.prixFinal,
                    idPromotionAppliquee: promotionResult.idPromotion || null,
                    sousTotal: promotionResult.prixFinal * ligne.quantite
                };
            })
        );
    }
    
    calculerMontants(lignesAvecPromotions, fraisLivraison) {
        const montantOriginal = lignesAvecPromotions.reduce((total, ligne) => {
            return total + (ligne.prixUnitaireOriginal * ligne.quantite);
        }, 0);

        const montantProduits = lignesAvecPromotions.reduce((total, ligne) => {
            return total + ligne.sousTotal;
        }, 0);
        
        const fraisLivraisonFinal = parseFloat(fraisLivraison) || 0;
        
        return {
            montantOriginal,
            montantProduits,
            fraisLivraisonFinal,
            montantTotalAvecLivraison: montantProduits + fraisLivraisonFinal
        };
    }
    
 async appliquerCodePromoGlobal(codePromo, commandeData, lignesAvecPromotions, montants, fraisLivraison, transaction) {
    let montantFinal = montants.montantProduits;
    let reductionCodePromo = 0;
    let codePromoResult = null; // <-- always defined

    if (codePromo) {
        const donneesCommande = {
            ...commandeData,
            montantTotal: montants.montantProduits,
            lignesCommandes: lignesAvecPromotions,
            fraisLivraison: parseFloat(fraisLivraison) || 0
        };

        // APPELER LE NOUVEAU SERVICE
        codePromoResult = await PromotionService.appliquerCodePromo(
            donneesCommande, 
            codePromo,
            transaction
        );

        if (codePromoResult && !codePromoResult.error) {
            reductionCodePromo = codePromoResult.montantReduction;
            montantFinal = codePromoResult.montantFinal;
        }
    }
    console.log('Montants après code promo:', { montantFinal, reductionCodePromo, montants ,reductionTotale: montants.montantOriginal - montantFinal });
    return {
        montantFinal,
        reductionCodePromo,
        reductionTotale: montants.montantOriginal - montantFinal,
        codePromoResult 
    };
}
    
    async mettreAJourProfilUtilisateur(commandeData, transaction) {
        const utilisateur = await Utilisateur.findByPk(commandeData.idClient, { transaction });
        
        if (!utilisateur) return;
        
        const updateData = {};
        let shouldUpdate = false;

        const champsAMettre = [
            { champ: 'telephone', source: 'clientTelephone' },
            { champ: 'adresseRue', source: 'clientAdresseRue' },
            { champ: 'adresseVille', source: 'clientAdresseVille' },
            { champ: 'adresseCodePostal', source: 'clientAdresseCodePostal' },
            { champ: 'adressePays', source: 'clientAdressePays' }
        ];

        champsAMettre.forEach(({ champ, source }) => {
            if (!utilisateur[champ] && commandeData[source]) {
                updateData[champ] = commandeData[source];
                shouldUpdate = true;
            }
        });

        if (shouldUpdate) {
            await utilisateur.update(updateData, { transaction });
            console.log('Profil utilisateur mis à jour');
        }
    }
    
async creerEntiteCommande(commandeData, montants, resultatsPromo, fraisLivraison, transaction) {
  return await Commande.create({
    ...commandeData,
    montantTotal: resultatsPromo.montantFinal + montants.fraisLivraisonFinal,
    montantOriginal: montants.montantOriginal + montants.fraisLivraisonFinal,
    montantReduction: resultatsPromo.reductionTotale,
    fraisLivraison: montants.fraisLivraisonFinal,
    codePromoGlobal: resultatsPromo.codePromoResult?.codePromo?.code || null,
    reductionCodePromo: resultatsPromo.reductionCodePromo || 0
  }, { transaction });
}
    
   async creerLignesCommande(idCommande, lignesAvecPromotions, transaction) {
        if (!lignesAvecPromotions || lignesAvecPromotions.length === 0) return;
        const lignes = lignesAvecPromotions.map(ligne => ({
            idCommande,
            idProduit: ligne.idProduit,
            idProduitVariation: ligne.idProduitVariation,
            quantite: ligne.quantite,
            prixUnitaireOriginal: ligne.prixUnitaireOriginal,
            prixUnitaireFinal: ligne.prixUnitaireFinal,
            prixUnitaire: ligne.prixUnitaireFinal,
            sousTotal: ligne.sousTotal,
            reductionUnitaire: ligne.reductionUnitaire,
            idPromotionAppliquee: ligne.idPromotionAppliquee
        }));
        return await LigneCommande.bulkCreate(lignes, { transaction });
    }
    
    async getStoreInfo(transaction = null) {
        try {
            const storeInfo = await StoreInfo.findOne({
                transaction,
                order: [['createdAt', 'DESC']]
            });
            
            return storeInfo || {
                nom: 'Jouets Paradise',
                adresse: 'Adresse non définie',
                ville: '',
                codePostal: '',
                pays: '',
                telephonePrincipal: 'Téléphone non défini',
                emailPrincipal: 'email@exemple.com',
                entrepriseSiret: '',
                tauxTVA: 19
            };
        } catch (error) {
            console.error('Erreur lors de la récupération des informations du magasin:', error);
            return {
                nom: 'Jouets Paradise',
                adresse: 'Adresse non définie',
                ville: '',
                codePostal: '',
                pays: '',
                telephonePrincipal: 'Téléphone non défini',
                emailPrincipal: 'email@exemple.com',
                entrepriseSiret: '',
                tauxTVA: 19
            };
        }
    }
    
    async creerFacture(commande, commandeData, montantTotal, transaction) {
    const utilisateur = commandeData.idClient ? 
        await Utilisateur.findByPk(commandeData.idClient, { transaction }) : null;

    // Récupérer les informations du magasin
    const storeInfo = await this.getStoreInfo(transaction);
    
    const tauxTVA = storeInfo.tauxTVA || 19;
    const montantHT = montantTotal / (1 + tauxTVA / 100);
    const montantTVA = montantTotal - montantHT;

    // Construire l'adresse complète de l'entreprise
    const adresseComplete = [
        storeInfo.adresse,
        storeInfo.ville,
        storeInfo.codePostal,
        storeInfo.pays
    ].filter(Boolean).join(', ');

    return await Facture.create({
        idCommande: commande.idCommande,
        montantHT,
        montantTVA,
        montantTotal,
        tauxTVA,
        clientNom: utilisateur ? 
            `${utilisateur.prenom} ${utilisateur.nom}` : 
            `${commandeData.clientPrenom || ''} ${commandeData.clientNom || ''}`.trim(),
        clientEmail: utilisateur?.email || commandeData.clientEmail || '',
        clientTelephone: commandeData.clientTelephone || utilisateur?.telephone || '',
        clientAdresse: [
            commandeData.clientAdresseRue,
            commandeData.clientAdresseCodePostal,
            commandeData.clientAdresseVille,
            commandeData.clientAdressePays
        ].filter(Boolean).join(', '),
        entrepriseNom: storeInfo.nom,
        entrepriseAdresse: adresseComplete,
        entrepriseTelephone: storeInfo.telephonePrincipal,
        entrepriseEmail: storeInfo.emailPrincipal,
        entrepriseSiret: storeInfo.entrepriseSiret,
        statut: 'envoyée'
    }, { transaction });
}
    
    async obtenirCommandeComplete(idCommande) {
        // Ajoute l'include variation/couleur/age/taille pour chaque ligne de commande
        return await Commande.findByPk(idCommande, {
            include: [
                {
                    model: Utilisateur,
                    as: 'client',
                    attributes: ['idUtilisateur', 'prenom', 'nom']
                },
                {
                    model: LigneCommande,
                    as: 'lignesCommandes',
                    include: [
                        {
                            model: Produit,
                            as: 'produit',
                            attributes: ['idProduit', 'nom', 'prix']
                        },
                        {
                            model: ProduitVariation,
                            as: 'variation',
                            include: [
                                { model: Couleur, as: 'couleur' },
                                { model: Taille, as: 'taille' },
                                { model: Age, as: 'age' }
                            ]
                        }
                    ]
                },
                {
                    model: Facture,
                    as: 'facture',
                    attributes: ['idFacture', 'numeroFacture', 'dateFacture', 'statut']
                }
            ]
        });
    }
async creerCommandeGuest(donneesCommande, transaction) {
    const { lignesCommandes, codePromo, fraisLivraison = 0, ...commandeData } = donneesCommande;
    
    // 1. Générer un token unique pour cette commande
    const guestToken = uuidv4();
    
    // 2. Traiter les produits et promotions (sans idClient)
    const lignesAvecPromotions = await this.traiterProduitsEtPromotions(
        lignesCommandes, 
        null, // ✅ Pas d'idClient pour guest
        transaction
    );
    
    // 3. Calcul montants
    const montants = this.calculerMontants(lignesAvecPromotions, fraisLivraison);
    
    // 4. Appliquer code promo global
    const resultatsPromo = await this.appliquerCodePromoGlobal(
        codePromo, 
        { ...commandeData, idClient: null }, // ✅ idClient = null
        lignesAvecPromotions, 
        montants, 
        fraisLivraison, 
        transaction
    );
    
    // 5. Créer la commande avec guestToken
    const commande = await this.creerEntiteCommandeGuest(
        commandeData, 
        montants, 
        resultatsPromo, 
        fraisLivraison,
        guestToken, // ✅ Token unique
        transaction
    );
    
    // 6. Créer lignes de commande
    await this.creerLignesCommande(commande.idCommande, lignesAvecPromotions, transaction);

    return {
        commande,
        guestToken, // ✅ Retourner le token pour le frontend
        montants,
        resultatsPromo,
        lignesAvecPromotions
    };
}

// 🆕 NOUVELLE MÉTHODE: Créer l'entité commande guest
async creerEntiteCommandeGuest(commandeData, montants, resultatsPromo, fraisLivraison, guestToken, transaction) {
    return await Commande.create({
        ...commandeData,
        idClient: null, // ✅ Pas de client authentifié
        guestToken: guestToken, // ✅ Token unique
        montantTotal: resultatsPromo.montantFinal + montants.fraisLivraisonFinal,
        montantOriginal: montants.montantOriginal + montants.fraisLivraisonFinal,
        montantReduction: resultatsPromo.reductionTotale,
        fraisLivraison: montants.fraisLivraisonFinal,
        codePromoGlobal: resultatsPromo.codePromoResult?.codePromo?.code || null,
        reductionCodePromo: resultatsPromo.reductionCodePromo || 0
    }, { transaction });
}

// 🆕 NOUVELLE MÉTHODE: Obtenir une commande guest avec validation du token
async obtenirCommandeGuestComplete(idCommande, guestToken) {
    // 1. Récupérer la commande
    const commande = await Commande.findByPk(idCommande, {
        include: [
            {
                model: LigneCommande,
                as: 'lignesCommandes',
                include: [
                    {
                        model: Produit,
                        as: 'produit',
                        attributes: ['idProduit', 'nom', 'prix']
                    },
                    {
                        model: ProduitVariation,
                        as: 'variation',
                        include: [
                            { model: Couleur, as: 'couleur' },
                            { model: Taille, as: 'taille' },
                            { model: Age, as: 'age' }
                        ]
                    }
                ]
            },
            {
                model: Facture,
                as: 'facture',
                attributes: ['idFacture', 'numeroFacture', 'dateFacture', 'statut']
            }
        ]
    });
    
    if (!commande) {
        throw new Error('Commande introuvable');
    }
    
    // 2. ✅ SÉCURITÉ: Vérifier que le token correspond
    if (commande.guestToken !== guestToken) {
        throw new Error('Accès non autorisé à cette commande');
    }
    
    // 3. ✅ SÉCURITÉ: Vérifier que c'est bien une commande guest
    if (commande.idClient !== null) {
        throw new Error('Cette commande nécessite une authentification');
    }
    
    return commande;
}

// 🆕 NOUVELLE MÉTHODE: Vérifier si un produit a la livraison gratuite
async verifierLivraisonGratuiteProduit(idProduit, transaction) {
    const produit = await Produit.findByPk(idProduit, { 
        attributes: ['idProduit', 'livraisonGratuite'],
        transaction 
    });
    
    return produit?.livraisonGratuite || false;
}
}

module.exports = new CommandeService();