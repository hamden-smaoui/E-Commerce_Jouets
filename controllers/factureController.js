const { Facture, Commande, Utilisateur, LigneCommande, Produit , StoreInfo, ProduitVariation, Couleur, Taille, Age } = require('../models');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const axios = require('axios');
const path = require('path');
function formatVariation(variation) {
  if (!variation) return '';
  const parts = [];
  if (variation.couleur) parts.push(variation.couleur.nom);
  if (variation.taille) parts.push(variation.taille.nom);
  if (variation.age) parts.push(variation.age.label);
  return parts.length > 0 ? parts.join(' / ') : '';
}
function truncate(text, maxLength = 50) {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}
class FactureController {
    constructor() {
        this.generatePDF = this.generatePDF.bind(this);
        this.generateSimpleFacturePDF = this.generateSimpleFacturePDF.bind(this);
    }
    async getStoreInfo(transaction = null) {
        try {
            const storeInfo = await StoreInfo.findOne({
                transaction,
                order: [['createdAt', 'DESC']]
            });
            if (!storeInfo) {
                return {
                    nom: 'Jouets Paradise',
                    adresse: 'Adresse non définie',
                    telephonePrincipal: 'Téléphone non défini',
                    emailPrincipal: 'email@exemple.com',
                    entrepriseSiret: '',
                    tauxTVA: 19,
                    logo1: null
                };
            }
            return storeInfo;
        } catch (error) {
            return {
                nom: 'Jouets Paradise',
                adresse: 'Adresse non définie',
                telephonePrincipal: 'Téléphone non défini',
                emailPrincipal: 'email@exemple.com',
                entrepriseSiret: '',
                tauxTVA: 19,
                logo1: null
            };
        }
    }
    async createFacture(req, res, next) {
        try {
            const factureData = {...req.body };
            const facture = await Facture.create(factureData);
            res.status(201).json({
                message: 'Facture créée avec succès',
                data: facture
            });
        } catch (error) {
            next(error);
        }
    }
    async createFactureFromCommande(req, res, next) {
        try {
            const { idCommande } = req.params;
            const commande = await Commande.findByPk(idCommande, {
                include: [
                    { model: Utilisateur, as: 'client' },
                    { model: LigneCommande, as: 'lignesCommandes', include: [{ model: Produit, as: 'produit' }] }
                ]
            });
            if (!commande) {
                const error = new Error("Commande non trouvée");
                error.code = "NOT_FOUND";
                return next(error);
            }
            const storeInfo = await this.getStoreInfo();
            const tauxTVA = storeInfo.tauxTVA || 19;
            const montantTotal = commande.montantTotal;
            const montantHT = montantTotal / (1 + tauxTVA / 100);
            const montantTVA = montantTotal - montantHT;
            const factureData = {
                idCommande: commande.idCommande,
                montantHT,
                montantTVA,
                montantTotal,
                tauxTVA,
                clientNom: commande.clientPrenom + ' ' + commande.clientNom,
                clientEmail: commande.clientEmail,
                clientTelephone: commande.clientTelephone,
                clientAdresse: [
                    commande.clientAdresseRue,
                    commande.clientAdresseCodePostal,
                    commande.clientAdresseVille,
                    commande.clientAdressePays
                ].filter(Boolean).join(', '),
                entrepriseNom: storeInfo.nom,
                entrepriseAdresse: [
                    storeInfo.adresse,
                    storeInfo.ville,
                    storeInfo.codePostal,
                    storeInfo.pays
                ].filter(Boolean).join(', '),
                entrepriseTelephone: storeInfo.telephonePrincipal,
                entrepriseEmail: storeInfo.emailPrincipal,
                entrepriseSiret: storeInfo.entrepriseSiret,
                statut: 'envoyée'
            };
            const facture = await Facture.create(factureData);
            res.status(201).json({ message: 'Facture créée avec succès', data: facture });
        } catch (error) {
            next(error);
        }
    }
    async getAllFactures(req, res, next) {
        try {
            const factures = await Facture.findAll({
                include: [{
                    model: Commande,
                    as: 'commande',
                    include: [{
                        model: Utilisateur,
                        as: 'client',
                        attributes: ['idUtilisateur', 'prenom', 'nom', 'email', 'telephone']
                    }]
                }],
                order: [['createdAt', 'DESC']]
            });
            res.status(200).json(factures);
        } catch (error) {
            next(error);
        }
    }
    async getFactureById(req, res, next) {
        try {
            const facture = await Facture.findByPk(req.params.id, {
                include: [{
                    model: Commande,
                    as: 'commande',
                    include: [
                        {
                            model: Utilisateur,
                            as: 'client',
                            attributes: ['idUtilisateur', 'prenom', 'nom', 'email', 'telephone', 'adresseRue', 'adresseVille', 'adresseCodePostal']
                        },
                        {
                            model: LigneCommande,
                            as: 'lignesCommandes',
                            include: [{
                                model: Produit,
                                as: 'produit',
                                attributes: ['idProduit', 'nom', 'description']
                            },
                            {
                                model: ProduitVariation,
                                as: 'variation',
                                include: [
                                    { model: Couleur, as: 'couleur' },
                                    { model: Taille, as: 'taille' },
                                    { model: Age, as: 'age' }
                                ]
                            }]
                        },
                    ]
                }]
            });
            if (!facture) {
                const error = new Error('Facture non trouvée');
                error.code = "NOT_FOUND";
                return next(error);
            }
            res.status(200).json(facture);
        } catch (error) {
            next(error);
        }
    }
    async updateFacture(req, res, next) {
        try {
            const facture = await Facture.findByPk(req.params.id);
            if (!facture) {
                const error = new Error('Facture non trouvée');
                error.code = "NOT_FOUND";
                return next(error);
            }
            await facture.update(req.body);
            res.status(200).json({
                message: 'Facture mise à jour avec succès',
                data: facture
            });
        } catch (error) {
            next(error);
        }
    }
    async deleteFacture(req, res, next) {
        try {
            const facture = await Facture.findByPk(req.params.id);
            if (!facture) {
                const error = new Error('Facture non trouvée');
                error.code = "NOT_FOUND";
                return next(error);
            }
            await facture.destroy();
            res.status(200).json({ message: 'Facture supprimée avec succès' });
        } catch (error) {
            next(error);
        }
    }
    async generatePDF(req, res, next) {
        let doc;
        try {
            const facture = await Facture.findByPk(req.params.id, {
                include: [{
                    model: Commande,
                    as: 'commande',
                    attributes: ['idCommande', 'dateCommande', 'montantTotal', 'codePromoGlobal', 'reductionCodePromo','fraisLivraison'],
                    include: [
                        {
                            model: Utilisateur,
                            as: 'client',
                            attributes: ['idUtilisateur', 'prenom', 'nom', 'email', 'telephone']
                        },
                        {
                            model: LigneCommande,
                            as: 'lignesCommandes',
                            include: [{
                                model: Produit,
                                as: 'produit',
                                attributes: ['idProduit', 'nom', 'description']
                            },
                            {
                                model: ProduitVariation,
                                as: 'variation',
                                include: [
                                    { model: Couleur, as: 'couleur' },
                                    { model: Taille, as: 'taille' },
                                    { model: Age, as: 'age' }
                                ]
                            }]
                        }
                    ]
                }]
            });
            if (!facture) {
                const error = new Error('Facture non trouvée');
                error.code = "NOT_FOUND";
                return next(error);
            }
            const tempDir = path.join(__dirname, '../temp');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }
            const tempFilename = `facture_${facture.idFacture}_${Date.now()}.pdf`;
            const tempPath = path.join(tempDir, tempFilename);
            doc = new PDFDocument({ size: 'A4', margins: { top: 50, bottom: 50, left: 50, right: 50 } });
            const stream = fs.createWriteStream(tempPath);
            doc.pipe(stream);
            await this.generateSimpleFacturePDF(doc, facture);
            doc.end();
            await new Promise((resolve, reject) => {
                stream.on('finish', resolve);
                stream.on('error', reject);
            });
            const fileBuffer = fs.readFileSync(tempPath);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="Facture-${facture.numeroFacture}.pdf"`);
            res.setHeader('Content-Length', fileBuffer.length);
            res.send(fileBuffer);
            setTimeout(() => {
                try { fs.unlinkSync(tempPath); } catch (err) {}
            }, 5000);
        } catch (error) {
            if (doc && doc.destroy) doc.destroy();
            if (!res.headersSent) next(error);
        }
    }


async generateSimpleFacturePDF(doc, facture) {
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const margin = 50;
    let yPosition = 50;

    // Récupérer les informations du magasin
    const storeInfo = await this.getStoreInfo();

    // ============================
    // EN-TÊTE AVEC LOGO
    // ============================
    const headerHeight = 120;
    
    // Charger le logo depuis Cloudinary
    if (storeInfo.logo1) {
        try {
            if (storeInfo.logo1.startsWith('http')) {
                console.log('Chargement du logo depuis Cloudinary:', storeInfo.logo1);
                const response = await axios.get(storeInfo.logo1, {
                    responseType: 'arraybuffer'
                });
                const imageBuffer = Buffer.from(response.data, 'binary');
                doc.image(imageBuffer, margin, yPosition, { 
                    width: 60, 
                    height: 60,
                    fit: [60, 60]
                });
            } else {
                const logoPath = path.join(__dirname, '..', storeInfo.logo1.replace(/^\//, ''));
                if (fs.existsSync(logoPath)) {
                    doc.image(logoPath, margin, yPosition, { 
                        width: 60, 
                        height: 60,
                        fit: [60, 60]
                    });
                }
            }
        } catch (logoError) {
            console.log('Erreur lors du chargement du logo:', logoError.message);
        }
    }

    // Informations entreprise à côté du logo
    const entrepriseX = margin + (storeInfo.logo1 ? 80 : 0);
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#000000')
       .text(facture.entrepriseNom || storeInfo.nom, entrepriseX, yPosition);

    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#666666')
       .text(facture.entrepriseAdresse || `${storeInfo.adresse}, ${storeInfo.ville} ${storeInfo.codePostal}`, 
             entrepriseX, yPosition + 18, { width: 300 });

    if (facture.entrepriseTelephone || storeInfo.telephonePrincipal) {
        doc.text(`Tél: ${facture.entrepriseTelephone || storeInfo.telephonePrincipal}`, 
                 entrepriseX, yPosition + 35);
    }

    if (facture.entrepriseEmail || storeInfo.emailPrincipal) {
        doc.text(`Email: ${facture.entrepriseEmail || storeInfo.emailPrincipal}`, 
                 entrepriseX, yPosition + 50);
    }

    // Informations facture (côté droit)
    const rightColumnX = pageWidth - 200;
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#000000')
       .text(`N° ${facture.numeroFacture}`, rightColumnX, yPosition);

    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#666666')
       .text(`Date: ${new Date(facture.dateFacture).toLocaleDateString('fr-FR')}`, 
             rightColumnX, yPosition + 20);

    if (facture.dateEcheance) {
        doc.text(`Échéance: ${new Date(facture.dateEcheance).toLocaleDateString('fr-FR')}`, 
                 rightColumnX, yPosition + 35);
    }

    yPosition += headerHeight + 5;

    // ============================
    // SECTION "FACTURER À"
    // ============================
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#000000')
       .text('FACTURER À:', margin, yPosition);

    yPosition += 20;

    const clientBoxHeight = 80;
    doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, clientBoxHeight, 8)
       .fill('#f9fafb');
    
    doc.lineWidth(1)
       .stroke('#e5e7eb');

    const clientPadding = 15;
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#000000')
       .text(facture.clientNom || 'Client', margin + clientPadding, yPosition + clientPadding);

    let clientY = yPosition + clientPadding + 18;
    
    if (facture.clientEmail) {
        doc.fontSize(10)
           .font('Helvetica')
           .fillColor('#666666')
           .text(facture.clientEmail, margin + clientPadding, clientY);
        clientY += 15;
    }

    if (facture.clientTelephone) {
        doc.text(facture.clientTelephone, margin + clientPadding, clientY);
        clientY += 15;
    }

    if (facture.clientAdresse && clientY < yPosition + clientBoxHeight - 10) {
        doc.text(facture.clientAdresse, margin + clientPadding, clientY, {
            width: pageWidth - 2 * margin - 2 * clientPadding,
            align: 'left'
        });
    }

    yPosition += clientBoxHeight + 30;

    // ============================
    // SECTION "DÉTAILS:" - TABLEAU COMPLET
    // ============================
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#000000')
       .text('DÉTAILS:', margin, yPosition);

    yPosition += 20;

    // Colonnes du tableau (6 colonnes comme dans votre frontend)
    const descriptionWidth = 180;
    const qteWidth = 40;
    const prixUnitHTWidth = 70;
    const prixHTWidth = 70;
    const tvaWidth = 50;
    const prixTTCWidth = 80;
    
    const descriptionX = margin;
    const qteX = descriptionX + descriptionWidth;
    const prixUnitHTX = qteX + qteWidth;
    const prixHTX = prixUnitHTX + prixUnitHTWidth;
    const tvaX = prixHTX + prixHTWidth;
    const prixTTCX = tvaX + tvaWidth;
    
    const rowHeight = 40;

    // En-tête du tableau
    doc.rect(margin, yPosition, pageWidth - 2 * margin, 30)
       .fill('#f3f4f6')
       .stroke('#d1d5db');

    doc.fontSize(10)
       .font('Helvetica-Bold')
       .fillColor('#374151');

    doc.text('Description', descriptionX + 10, yPosition + 10, { width: descriptionWidth - 20 });
    doc.text('Qté', qteX + 5, yPosition + 10, { width: qteWidth - 10, align: 'center' });
    doc.text('Prix unit. HT', prixUnitHTX + 5, yPosition + 10, { width: prixUnitHTWidth - 10, align: 'right' });
    doc.text('Prix HT', prixHTX + 5, yPosition + 10, { width: prixHTWidth - 10, align: 'right' });
    doc.text('TVA', tvaX + 5, yPosition + 10, { width: tvaWidth - 10, align: 'right' });
    doc.text('Prix TTC', prixTTCX + 5, yPosition + 10, { width: prixTTCWidth - 10, align: 'right' });

    yPosition += 30;

    // ============================
    // LIGNES DES PRODUITS
    // ============================
    const tauxTVADecimal = 1 + facture.tauxTVA / 100;

    if (facture.commande?.lignesCommandes?.length > 0) {
        facture.commande.lignesCommandes.forEach((ligne, index) => {
            const prixUnitaireTTC = ligne.prixUnitaireFinal || 0;
            const prixUnitaireHT = prixUnitaireTTC / tauxTVADecimal;
            const totalLigneHT = prixUnitaireHT * ligne.quantite;
            const totalLigneTTC = prixUnitaireTTC * ligne.quantite;

            const bgColor = index % 2 === 0 ? '#ffffff' : '#f9fafb';
            
            doc.rect(margin, yPosition, pageWidth - 2 * margin, rowHeight)
               .fill(bgColor)
               .stroke('#e5e7eb');

            // Description
            doc.fontSize(10)
               .font('Helvetica-Bold')
               .fillColor('#111827')
               .text(ligne.produit?.nom || 'Produit', descriptionX + 10, yPosition + 8, {
                   width: descriptionWidth - 20
               });

            let descY = yPosition + 20;

            // Variation
            if (ligne.variation && formatVariation(ligne.variation)) {
                doc.fontSize(8)
                   .font('Helvetica-Oblique')
                   .fillColor('#555')
                   .text(formatVariation(ligne.variation), descriptionX + 10, descY, {
                       width: descriptionWidth - 20
                   });
                descY += 12;
            }

            // Description produit
            if (ligne.produit?.description) {
                doc.fontSize(8)
                   .font('Helvetica')
                   .fillColor('#6b7280')
                   .text(truncate(ligne.produit.description, 35), descriptionX + 10, descY, {
                       width: descriptionWidth - 20
                   });
            }

            // Quantité
            doc.fontSize(10)
               .font('Helvetica')
               .fillColor('#374151')
               .text(ligne.quantite.toString(), qteX + 5, yPosition + 15, {
                   width: qteWidth - 10,
                   align: 'center'
               });

            // Prix unitaire HT
            doc.text(`${prixUnitaireHT.toFixed(2)} TND`, prixUnitHTX + 5, yPosition + 15, {
                width: prixUnitHTWidth - 10,
                align: 'right'
            });

            // Prix HT
            doc.text(`${totalLigneHT.toFixed(2)} TND`, prixHTX + 5, yPosition + 15, {
                width: prixHTWidth - 10,
                align: 'right'
            });

            // TVA
            doc.text(`${facture.tauxTVA}%`, tvaX + 5, yPosition + 15, {
                width: tvaWidth - 10,
                align: 'right'
            });

            // Prix TTC
            doc.font('Helvetica-Bold')
               .text(`${totalLigneTTC.toFixed(2)} TND`, prixTTCX + 5, yPosition + 15, {
                   width: prixTTCWidth - 10,
                   align: 'right'
               });

            yPosition += rowHeight;
        });
    }

    // ============================
    // LIGNE FRAIS DE LIVRAISON
    // ============================
    if (facture.commande?.fraisLivraison !== undefined && facture.commande.fraisLivraison !== null) {
        const fraisLivraisonTTC = facture.commande.fraisLivraison;
        const fraisLivraisonHT = fraisLivraisonTTC / tauxTVADecimal;

        // Ligne de séparation
        doc.strokeColor('#999')
           .lineWidth(2)
           .moveTo(margin, yPosition)
           .lineTo(pageWidth - margin, yPosition)
           .stroke();

        yPosition += 2;

        doc.rect(margin, yPosition, pageWidth - 2 * margin, rowHeight)
           .fill('#ffffff')
           .stroke('#e5e7eb');

        // Description "Frais de livraison"
        doc.fontSize(10)
           .font('Helvetica-Bold')
           .fillColor('#111827')
           .text('Frais de livraison', descriptionX + 10, yPosition + 15, {
               width: descriptionWidth - 20
           });

        if (fraisLivraisonTTC === 0) { 
            doc.fontSize(8)
               .font('Helvetica-Oblique')
               .fillColor('#22c55e')
               .text('Livraison gratuite 🎉', descriptionX + 10, yPosition + 28);
        }

        // Quantité: -
        doc.fontSize(10)
           .font('Helvetica')
           .fillColor('#374151')
           .text('-', qteX + 5, yPosition + 15, {
               width: qteWidth - 10,
               align: 'center'
           });

        // Prix unitaire HT
        doc.text(fraisLivraisonTTC === 0 ? '0.000 TND' : `${fraisLivraisonHT.toFixed(3)} TND`, 
                 prixUnitHTX + 5, yPosition + 15, {
            width: prixUnitHTWidth - 10,
            align: 'right'
        });

        // Prix HT
        doc.text(fraisLivraisonTTC === 0 ? '0.000 TND' : `${fraisLivraisonHT.toFixed(3)} TND`, 
                 prixHTX + 5, yPosition + 15, {
            width: prixHTWidth - 10,
            align: 'right'
        });

        // TVA
        doc.text(`${facture.tauxTVA}%`, tvaX + 5, yPosition + 15, {
            width: tvaWidth - 10,
            align: 'right'
        });

        // Prix TTC
        doc.font('Helvetica-Bold')
           .text(`${fraisLivraisonTTC.toFixed(3)} TND`, prixTTCX + 5, yPosition + 15, {
               width: prixTTCWidth - 10,
               align: 'right'
           });

        yPosition += rowHeight;
    }

    yPosition += 20;

    // ============================
    // SECTION CODE PROMO
    // ============================
    if (facture.commande && (facture.commande.codePromoGlobal || (facture.commande.reductionCodePromo && facture.commande.reductionCodePromo > 0))) {
        const promoBoxHeight = 60;
        
        doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, promoBoxHeight, 8)
           .fill('#f0fdf4')
           .stroke('#22c55e');

        const promoPadding = 15;

        doc.fontSize(12)
           .font('Helvetica-Bold')
           .fillColor('#15803d')
           .text('Code Promo Appliqué', margin + promoPadding, yPosition + promoPadding);

        let promoY = yPosition + promoPadding + 18;

        if (facture.commande.codePromoGlobal) {
            doc.fontSize(10)
               .font('Helvetica')
               .fillColor('#16a34a')
               .text(`Code utilisé: `, margin + promoPadding, promoY, { continued: true })
               .font('Helvetica-Bold')
               .text(facture.commande.codePromoGlobal);
            
            promoY += 15;
        }

        yPosition += promoBoxHeight + 25;
    }

    // ============================
    // CALCULS DES TOTAUX
    // ============================
    const produitsHT = facture.commande?.lignesCommandes?.reduce((acc, ligne) => {
        const prixUnitaireTTC = ligne.prixUnitaireFinal || 0;
        const prixUnitaireHT = prixUnitaireTTC / tauxTVADecimal;
        return acc + (prixUnitaireHT * ligne.quantite);
    }, 0) || 0;

    const fraisLivraisonTTC = facture.commande?.fraisLivraison || 0;
    const fraisLivraisonHT = fraisLivraisonTTC / tauxTVADecimal;

    const sousTotalHTAvantReduction = produitsHT + fraisLivraisonHT;

    const reductionTTC = facture.commande?.reductionCodePromo || 0;
    const reductionHT = reductionTTC / tauxTVADecimal;

    const totalHTApresReduction = sousTotalHTAvantReduction - reductionHT;
    const montantTVA = (totalHTApresReduction * facture.tauxTVA) / 100;
    const totalTTC = totalHTApresReduction + montantTVA;

    // ============================
    // SECTION TOTAUX
    // ============================
    const totalsWidth = 280;
    const totalsX = pageWidth - totalsWidth - margin;
    const labelX = totalsX;
    const valueX = totalsX + 180;

    // Sous-total HT
    doc.fontSize(11)
       .font('Helvetica')
       .fillColor('#374151')
       .text('Sous-total HT:', labelX, yPosition)
       .text(`${sousTotalHTAvantReduction.toFixed(2)} TND`, valueX, yPosition, { align: 'right', width: 100 });

    yPosition += 20;

    // Réduction code promo
    if (reductionTTC > 0) {
        doc.fillColor('#22c55e')
           .text('Réduction code promo:', labelX, yPosition)
           .text(`-${reductionHT.toFixed(2)} TND`, valueX, yPosition, { align: 'right', width: 100 });

        yPosition += 25;

        // Ligne séparatrice
        doc.strokeColor('#d1d5db')
           .lineWidth(1)
           .moveTo(totalsX, yPosition)
           .lineTo(pageWidth - margin, yPosition)
           .stroke();

        yPosition += 15;

        // Total HT après réduction
        doc.font('Helvetica-Bold')
           .fillColor('#374151')
           .text('Total HT après réduction:', labelX, yPosition)
           .text(`${totalHTApresReduction.toFixed(2)} TND`, valueX, yPosition, { align: 'right', width: 100 });

        yPosition += 20;
    }

    // TVA
    doc.font('Helvetica')
       .fillColor('#374151')
       .text(`TVA (${facture.tauxTVA}%):`, labelX, yPosition)
       .text(`${montantTVA.toFixed(2)} TND`, valueX, yPosition, { align: 'right', width: 100 });

    yPosition += 25;

    // Ligne de séparation finale
    doc.strokeColor('#d1d5db')
       .lineWidth(1)
       .moveTo(totalsX, yPosition)
       .lineTo(pageWidth - margin, yPosition)
       .stroke();

    yPosition += 15;

    // Total TTC
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .fillColor('#111827')
       .text('TOTAL TTC:', labelX, yPosition)
       .text(`${totalTTC.toFixed(2)} TND`, valueX, yPosition, { align: 'right', width: 100 });

    yPosition += 40;

    // ============================
    // NOTES
    // ============================
    if (facture.notes) {
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .fillColor('#000000')
           .text('NOTES:', margin, yPosition);

        yPosition += 20;

        const notesHeight = 60;
        doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, notesHeight, 8)
           .fill('#f9fafb')
           .stroke('#e5e7eb');

        doc.fontSize(10)
           .font('Helvetica')
           .fillColor('#374151')
           .text(facture.notes, margin + 15, yPosition + 15, {
               width: pageWidth - 2 * margin - 30,
               height: notesHeight - 30,
               align: 'left'
           });

        yPosition += notesHeight + 20;
    }

    // ============================
    // PIED DE PAGE
    // ============================
    const footerY = Math.max(yPosition + 40, pageHeight - 100);
    
    doc.strokeColor('#d1d5db')
       .lineWidth(1)
       .moveTo(margin, footerY)
       .lineTo(pageWidth - margin, footerY)
       .stroke();

    doc.fontSize(11)
       .font('Helvetica-Bold')
       .fillColor('#374151')
       .text('Conditions de paiement:', margin, footerY + 12);

    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#6b7280')
       .text('Paiement à réception de facture', margin, footerY + 24);

    if (facture.entrepriseSiret || storeInfo.entrepriseSiret) {
        doc.text(`SIRET: ${facture.entrepriseSiret || storeInfo.entrepriseSiret}`, 
                margin, footerY + 36);
    }
}

    async getFactureStats(req, res) {
        try {

            const totalFactures = await Facture.count();
            const facturesPayees = await Facture.count({ where: { statut: 'payée' } });
            const facturesEnRetard = await Facture.count({ where: { statut: 'en_retard' } });
            const montantTotal = await Facture.sum('montantTotal', { where: { statut: 'payée' } });

            res.status(200).json({
                totalFactures,
                facturesPayees,
                facturesEnRetard,
                montantTotal: montantTotal || 0,
                tauxPaiement: totalFactures > 0 ? ((facturesPayees / totalFactures) * 100).toFixed(2) : 0
            });
        } catch (error) {
    const err = new Error('Erreur lors de la récupération des statistiques');
    err.code = "SERVER_ERROR";
    return next(err);
}
    }
}

module.exports = new FactureController();