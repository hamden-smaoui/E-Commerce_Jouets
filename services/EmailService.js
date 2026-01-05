const SibApiV3Sdk = require('@getbrevo/brevo');

class EmailService {
  constructor() {
    this.apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    let apiKey = this.apiInstance.authentications['apiKey'];
    apiKey.apiKey = process.env.BREVO_API_KEY;
  }

  /**
   * Envoyer email de notification de nouvelle commande à l'admin
   */
  async envoyerNotificationNouvelleCommande(commande, lignesCommandes) {
    try {
      // Construire le HTML de l'email
      const lignesHTML = lignesCommandes.map(ligne => {
        const variation = ligne.variation;
        const variationText = variation ? 
          `${variation.couleur?.nom || ''} ${variation.taille?.nom || ''} ${variation.age?.nom || ''}`.trim() : 
          '';
        
        return `
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 12px 8px;">
              <strong>${ligne.produit?.nom || 'Produit'}</strong>
              ${variationText ? `<br><small style="color: #666;">${variationText}</small>` : ''}
            </td>
            <td style="padding: 12px 8px; text-align: center;">${ligne.quantite}</td>
            <td style="padding: 12px 8px; text-align: right;">${ligne.prixUnitaire.toFixed(2)} TND</td>
            <td style="padding: 12px 8px; text-align: right;"><strong>${ligne.sousTotal.toFixed(2)} TND</strong></td>
          </tr>
        `;
      }).join('');

      const emailHtml = `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Nouvelle Commande #${commande.idCommande}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { max-width: 700px; margin: 20px auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #9333ea 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .section { margin-bottom: 25px; }
            .section-title { font-size: 18px; font-weight: bold; color: #9333ea; margin-bottom: 15px; border-bottom: 2px solid #9333ea; padding-bottom: 8px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
            .info-item { padding: 10px; background-color: #f8f9fa; border-radius: 6px; }
            .info-label { font-weight: bold; color: #666; font-size: 13px; margin-bottom: 5px; }
            .info-value { color: #333; font-size: 15px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th { background-color: #f8f9fa; padding: 12px 8px; text-align: left; font-weight: bold; color: #666; font-size: 14px; }
            .totals { margin-top: 20px; padding: 20px; background-color: #f8f9fa; border-radius: 8px; }
            .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 15px; }
            .total-final { font-size: 20px; font-weight: bold; color: #9333ea; border-top: 2px solid #9333ea; padding-top: 12px; margin-top: 12px; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
            .badge { display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: bold; }
            .badge-warning { background-color: #fef3c7; color: #92400e; }
            .badge-success { background-color: #d1fae5; color: #065f46; }
          </style>
        </head>
        <body>
          <div class="container">
            <!-- Header -->
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">🧸 Bamby Joy</h1>
              <h2 style="margin: 10px 0 0 0; font-size: 20px;">Nouvelle Commande Reçue</h2>
              <p style="margin: 10px 0 0 0; font-size: 16px;">Commande #${commande.idCommande}</p>
            </div>

            <!-- Content -->
            <div class="content">
              <!-- Statut -->
              <div style="text-align: center; margin-bottom: 25px;">
                <span class="badge ${commande.statut === 'en attente' ? 'badge-warning' : 'badge-success'}">
                  ${commande.statut.toUpperCase()}
                </span>
              </div>

              <!-- Informations Client -->
              <div class="section">
                <div class="section-title">👤 Informations Client</div>
                <div class="info-grid">
                  <div class="info-item">
                    <div class="info-label">Nom complet</div>
                    <div class="info-value">${commande.clientPrenom} ${commande.clientNom}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Téléphone</div>
                    <div class="info-value">${commande.clientTelephone}</div>
                  </div>
                  ${commande.clientEmail ? `
                  <div class="info-item">
                    <div class="info-label">Email</div>
                    <div class="info-value">${commande.clientEmail}</div>
                  </div>
                  ` : ''}
                  <div class="info-item">
                    <div class="info-label">Type</div>
                    <div class="info-value">${commande.idClient ? '✅ Client authentifié' : '👤 Client invité'}</div>
                  </div>
                </div>
              </div>

              <!-- Adresse de Livraison -->
              <div class="section">
                <div class="section-title">📦 Adresse de Livraison</div>
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; line-height: 1.6;">
                  ${commande.clientAdresseRue}<br>
                  ${commande.clientAdresseCodePostal} ${commande.clientAdresseVille}<br>
                  ${commande.clientAdressePays}
                </div>
                ${commande.notesLivraison ? `
                <div style="margin-top: 10px; padding: 12px; background-color: #fef3c7; border-left: 3px solid #f59e0b; border-radius: 4px;">
                  <strong>📝 Notes:</strong> ${commande.notesLivraison}
                </div>
                ` : ''}
              </div>

              <!-- Produits Commandés -->
              <div class="section">
                <div class="section-title">🛍️ Produits Commandés</div>
                <table>
                  <thead>
                    <tr>
                      <th>Produit</th>
                      <th style="text-align: center;">Qté</th>
                      <th style="text-align: right;">Prix Unit.</th>
                      <th style="text-align: right;">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${lignesHTML}
                  </tbody>
                </table>
              </div>

              <!-- Totaux -->
              <div class="totals">
                <div class="total-row">
                  <span>Sous-total produits:</span>
                  <span>${(commande.montantTotal - commande.fraisLivraison).toFixed(2)} TND</span>
                </div>
                ${commande.montantReduction > 0 ? `
                <div class="total-row" style="color: #059669;">
                  <span>💰 Réduction appliquée:</span>
                  <span>-${commande.montantReduction.toFixed(2)} TND</span>
                </div>
                ` : ''}
                ${commande.codePromoGlobal ? `
                <div class="total-row" style="color: #9333ea;">
                  <span>🎫 Code promo (${commande.codePromoGlobal}):</span>
                  <span>-${commande.reductionCodePromo.toFixed(2)} TND</span>
                </div>
                ` : ''}
                <div class="total-row">
                  <span>Frais de livraison:</span>
                  <span>${commande.fraisLivraison > 0 ? commande.fraisLivraison.toFixed(2) + ' TND' : 'Gratuit ✨'}</span>
                </div>
                <div class="total-row total-final">
                  <span>TOTAL À PAYER:</span>
                  <span>${commande.montantTotal.toFixed(2)} TND</span>
                </div>
              </div>

              <!-- Date -->
              <div style="margin-top: 20px; text-align: center; color: #666; font-size: 14px;">
                📅 Commande passée le ${new Date(commande.dateCommande).toLocaleString('fr-FR')}
              </div>
            </div>

            <!-- Footer -->
            <div class="footer">
              <p style="margin: 0 0 10px 0;">🎯 <strong>Action requise:</strong> Vérifiez et traitez cette commande</p>
              <p style="margin: 0; font-size: 13px; color: #999;">
                Cet email a été généré automatiquement par Bamby Joy
              </p>
            </div>
          </div>
        </body>
        </html>
      `;

      // Envoyer l'email via Brevo
      let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
      sendSmtpEmail.subject = `🎉 Nouvelle Commande #${commande.idCommande} - ${commande.clientPrenom} ${commande.clientNom}`;
      sendSmtpEmail.htmlContent = emailHtml;
      sendSmtpEmail.sender = { 
        name: process.env.BREVO_SENDER_NAME || "Bamby Joy", 
        email: process.env.BREVO_SENDER_EMAIL 
      };
      sendSmtpEmail.to = [{ 
        email: process.env.EMAIL_USER || "hamdensmaoui25@gmail.com",
        name: "Admin Bamby Joy"
      }];

      await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      
      console.log(`✅ Email de notification envoyé pour commande #${commande.idCommande}`);
      return { success: true };

    } catch (error) {
      console.error('❌ Erreur envoi email notification commande:', error);
      // Ne pas bloquer la création de commande si l'email échoue
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();