// services/CommandeService.js
const { Commande, Utilisateur, LigneCommande, Facture, Produit, StoreInfo } = require('../models');
const PromotionService = require('./PromotionService');
const sequelize = require('../config/database');

class CommandeService {
    
    async creerCommande(donneesCommande, transaction) {
        const { lignesCommandes, codePromo, fraisLivraison = 0, ...commandeData } = donneesCommande;
        
        // 1. Traiter les produits et promotions
        const lignesAvecPromotions = await this.traiterProduitsEtPromotions(
            lignesCommandes, 
            commandeData.idClient, 
            transaction
        );
        
        // 2. Calculer les montants
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
        console.log('Commande créée avec ID:', commande.idCommande ,lignesAvecPromotions);
        // 6. Créer lignes de commande
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
            const produit = await Produit.findByPk(ligne.idProduit, { transaction });
            if (!produit) {
                throw new Error(`Produit ${ligne.idProduit} non trouvé`);
            }

            // Vérifier la disponibilité du stock
            if (produit.quantiteStock < ligne.quantite) {
                throw new Error(`Stock insuffisant pour le produit "${produit.nom}". Stock disponible: ${produit.quantiteStock}, demandé: ${ligne.quantite}`);
            }

            // Décrémenter le stock
            produit.quantiteStock -= ligne.quantite;
            await produit.save({ transaction });

            // Calculer la promotion éventuelle
            const promotionResult = await PromotionService.calculerPrixProduit(
                ligne.idProduit,
                produit.prix,
                ligne.quantite,
                idClient
            );
            console.log('Ligne avec promotion:', {...ligne , prixUnitaireOriginal: produit.prix, prixUnitaireFinal: promotionResult.prixFinal, reductionUnitaire: produit.prix - promotionResult.prixFinal, idPromotionAppliquee: promotionResult.idPromotion || null, sousTotal: promotionResult.prixFinal * ligne.quantite});

            return {
                ...ligne,
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
            montantTotal: resultatsPromo.montantFinal,
            montantOriginal: montants.montantOriginal + montants.fraisLivraisonFinal,
            montantReduction: resultatsPromo.reductionTotale ,
            fraisLivraison: montants.fraisLivraisonFinal,
            codePromoGlobal:resultatsPromo.codePromoResult.codePromo.code,
            reductionCodePromo: resultatsPromo.reductionCodePromo || 0
        }, { transaction });
    }
    
    async creerLignesCommande(idCommande, lignesAvecPromotions, transaction) {
        if (!lignesAvecPromotions || lignesAvecPromotions.length === 0) return;
        
        const lignes = lignesAvecPromotions.map(ligne => ({
            idCommande,
            idProduit: ligne.idProduit,
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
                    include: [{
                        model: Produit,
                        as: 'produit',
                        attributes: ['idProduit', 'nom', 'prix']
                    }]
                },
                {
                    model: Facture,
                    as: 'facture',
                    attributes: ['idFacture', 'numeroFacture', 'dateFacture', 'statut']
                }
            ]
        });
    }
}

module.exports = new CommandeService();