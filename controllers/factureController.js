const { Facture, Commande, Utilisateur, LigneCommande, Produit , StoreInfo, ProduitVariation, Couleur, Taille, Age } = require('../models');
const PDFDocument = require('pdfkit');
const fs = require('fs');
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
                    attributes: ['idCommande', 'dateCommande', 'montantTotal', 'codePromoGlobal', 'reductionCodePromo'],
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

    // En-tête avec logo et informations entreprise
    const headerHeight = 120;
    
    // Logo et informations entreprise (côté gauche)
    if (storeInfo.logo1) {
        try {
            const logoPath = path.join(__dirname, '..', storeInfo.logo1.replace(/^\//, ''));
            console.log('Tentative de chargement du logo depuis:', logoPath);
            
            if (fs.existsSync(logoPath)) {
                doc.image(logoPath, margin, yPosition, { 
                    width: 60, 
                    height: 60,
                    fit: [60, 60]
                });
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

    // Section "FACTURER À" avec fond gris
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#000000')
       .text('FACTURER À:', margin, yPosition);

    yPosition += 20;

    // Boîte client avec fond gris clair
    const clientBoxHeight = 80;
    doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, clientBoxHeight, 8)
       .fill('#f9fafb');
    
    doc.lineWidth(1)
       .stroke('#e5e7eb');

    // Contenu client
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

    // Section "DÉTAILS:" 
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#000000')
       .text('DÉTAILS:', margin, yPosition);

    yPosition += 20;

    // Tableau avec alignement parfait des colonnes
    const tableHeaders = ['Description', 'Qté', 'Prix unit.', 'Total'];
    
    // Calcul précis des positions des colonnes
    const descriptionWidth = pageWidth - 2 * margin - 230;
    const qteWidth = 40;
    const prixUnitWidth = 80;
    const totalWidth = 80;
    
    const descriptionX = margin;
    const qteX = descriptionX + descriptionWidth;
    const prixUnitX = qteX + qteWidth;
    const totalX = prixUnitX + prixUnitWidth;
    
    const rowHeight = 35;

    // En-tête du tableau
    doc.rect(margin, yPosition, pageWidth - 2 * margin, rowHeight)
       .fill('#f3f4f6')
       .stroke('#d1d5db');

    doc.fontSize(11)
       .font('Helvetica-Bold')
       .fillColor('#374151');

    // Headers alignés exactement avec les colonnes
    doc.text('Description', descriptionX + 10, yPosition + 12);
    doc.text('Qté', qteX + (qteWidth/2), yPosition + 12, { width: qteWidth, align: 'center' });
    doc.text('Prix unit.', prixUnitX + (prixUnitWidth/2), yPosition + 12, { width: prixUnitWidth, align: 'center' });
    doc.text('Total', totalX + (totalWidth/2), yPosition + 12, { width: totalWidth, align: 'center' });

    yPosition += rowHeight;

    // Lignes du tableau
    if (facture.commande?.lignesCommandes?.length > 0) {
        facture.commande.lignesCommandes.forEach((ligne, index) => {
            const total = ligne.prixUnitaireFinal * ligne.quantite;
            const bgColor = index % 2 === 0 ? '#ffffff' : '#f9fafb';
            
            // Ligne du tableau
            doc.rect(margin, yPosition, pageWidth - 2 * margin, rowHeight)
               .fill(bgColor);
            
            doc.lineWidth(0.5)
               .stroke('#e5e7eb');

            // Description (avec nom et description)
                           doc.fontSize(10)
                   .font('Helvetica-Bold')
                   .fillColor('#111827')
                   .text(ligne.produit?.nom || 'Produit', descriptionX + 10, yPosition + 8, {
                       width: descriptionWidth - 20
                   });

                // Variation
                if (ligne.variation && formatVariation(ligne.variation)) {
                    doc.fontSize(9)
                       .font('Helvetica-Oblique')
                       .fillColor('#555')
                       .text(formatVariation(ligne.variation), descriptionX + 10, yPosition + 19, {
                           width: descriptionWidth - 20
                       });
                    var descY = yPosition + 31;
                } else {
                    var descY = yPosition + 19;
                }

                // Description (optionnelle)
               if (ligne.produit?.description) {
    const descAffichee = truncate(ligne.produit.description, 50);
    doc.fontSize(8)
       .font('Helvetica')
       .fillColor('#6b7280')
       .text(descAffichee, descriptionX + 10, descY, {
           width: descriptionWidth - 20
       });
}

            // Quantité - alignée exactement sous "Qté"
            doc.fontSize(10)
               .font('Helvetica')
               .fillColor('#374151')
               .text(ligne.quantite.toString(), qteX + (qteWidth/2), yPosition + 12, {
                   width: qteWidth,
                   align: 'center'
               });

            // Prix unitaire - aligné exactement sous "Prix unit."
            doc.text(`${ligne.prixUnitaireFinal.toFixed(2)} TND`, prixUnitX + (prixUnitWidth/2), yPosition + 12, {
                width: prixUnitWidth,
                align: 'center'
            });

            // Total - aligné exactement sous "Total"
            doc.font('Helvetica-Bold')
               .text(`${total.toFixed(2)} TND`, totalX + (totalWidth/2), yPosition + 12, {
                   width: totalWidth,
                   align: 'center'
               });

            yPosition += rowHeight;
        });
    }

    yPosition += 20;

    // SECTION CODE PROMO (simple)
    if (facture.commande && (facture.commande.codePromoGlobal || (facture.commande.reductionCodePromo && facture.commande.reductionCodePromo > 0))) {
        // Boîte code promo avec fond vert clair
        const promoBoxHeight = 40;
        doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, promoBoxHeight, 5)
           .fill('#f0fdf4')
           .stroke('#22c55e');

        // Contenu du code promo
        const promoPadding = 12;
        let promoText = '';
        
        if (facture.commande.codePromoGlobal && facture.commande.reductionCodePromo > 0) {
            promoText = `Code promo "${facture.commande.codePromoGlobal}" appliqué - Économie: ${facture.commande.reductionCodePromo.toFixed(2)} TND`;
        } else if (facture.commande.codePromoGlobal) {
            promoText = `Code promo "${facture.commande.codePromoGlobal}" appliqué`;
        } else if (facture.commande.reductionCodePromo > 0) {
            promoText = `Réduction appliquée: ${facture.commande.reductionCodePromo.toFixed(2)} TND`;
        }

        doc.fontSize(10)
           .font('Helvetica-Bold')
           .fillColor('#15803d')
           .text(promoText, margin + promoPadding, yPosition + (promoBoxHeight/2) - 5);

        yPosition += promoBoxHeight + 20;
    }

    // Section totaux (alignée à droite)
    const totalsWidth = 250;
    const totalsX = pageWidth - totalsWidth - margin;

    // Sous-total HT
    doc.fontSize(11)
       .font('Helvetica')
       .fillColor('#374151')
       .text('Sous-total HT:', totalsX, yPosition)
       .text(`${facture.montantHT.toFixed(2)} TND`, totalsX + 120, yPosition);

    yPosition += 20;

    // Ligne réduction code promo dans les totaux
    if (facture.commande?.reductionCodePromo && facture.commande.reductionCodePromo > 0) {
        doc.fillColor('#22c55e')
           .text('Réduction code promo:', totalsX, yPosition)
           .text(`-${facture.commande.reductionCodePromo.toFixed(2)} TND`, totalsX + 120, yPosition);
        
        yPosition += 20;
    }

    // TVA
    doc.fillColor('#374151')
       .text(`TVA (${facture.tauxTVA}%):`, totalsX, yPosition)
       .text(`${facture.montantTVA.toFixed(2)} TND`, totalsX + 120, yPosition);

    yPosition += 25;

    // Ligne de séparation
    doc.strokeColor('#d1d5db')
       .lineWidth(1)
       .moveTo(totalsX, yPosition)
       .lineTo(pageWidth - margin, yPosition)
       .stroke();

    yPosition += 15;

    // Total TTC (en gras et plus grand)
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .fillColor('#111827')
       .text('TOTAL TTC:', totalsX, yPosition)
       .text(`${facture.montantTotal.toFixed(2)} TND`, totalsX + 120, yPosition);

    yPosition += 40;

    // Notes (si présentes)
    if (facture.notes) {
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .fillColor('#000000')
           .text('NOTES:', margin, yPosition);

        yPosition += 20;

        // Boîte des notes avec fond gris clair
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

    // Pied de page avec ligne de séparation
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