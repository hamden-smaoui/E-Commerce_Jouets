const cron = require('node-cron');
const NewsletterCampaign = require('../models/NewsletterCampaign');
const Newsletter = require('../models/NewsLetter');
const SibApiV3Sdk = require('@getbrevo/brevo');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs').promises;

class SchedulerService {
  constructor() {
    this.isRunning = false;
    this.init();
  }

  init() {
    // Vérifier toutes les 5 minutes
    cron.schedule('*/5 * * * *', () => {
      this.checkScheduledCampaigns();
    });
    
    console.log('✅ Scheduler de newsletter démarré - vérification toutes les 5 minutes');
  }

  async checkScheduledCampaigns() {
    if (this.isRunning) {
      console.log('Scheduler déjà en cours, passage ignoré');
      return;
    }

    try {
      this.isRunning = true;
      const now = new Date();
      
      // Chercher les campagnes programmées dont la date est dépassée
      const campaignsToSend = await NewsletterCampaign.findAll({
        where: {
          status: 'scheduled',
          scheduledDate: {
            [Op.lte]: now
          }
        }
      });

      console.log(`🔍 ${campaignsToSend.length} campagne(s) programmée(s) à envoyer`);

      for (const campaign of campaignsToSend) {
        try {
          await this.sendScheduledCampaign(campaign);
        } catch (error) {
          console.error(`❌ Erreur envoi campagne ${campaign.idCampaign}:`, error);
        }
      }
    } catch (error) {
      console.error('❌ Erreur dans le scheduler:', error);
    } finally {
      this.isRunning = false;
    }
  }

  async sendScheduledCampaign(campaign) {
    console.log(`📧 Envoi automatique de la campagne: ${campaign.subject}`);

    const subscribers = await Newsletter.findAll();
    if (subscribers.length === 0) {
      console.log('⚠️ Aucun abonné trouvé');
      return;
    }

    // ✅ CONFIGURATION API BREVO
    let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    let apiKey = apiInstance.authentications['apiKey'];
    apiKey.apiKey = process.env.BREVO_API_KEY;

    let successCount = 0;
    let errorCount = 0;

    // ✅ PRÉPARER L'IMAGE (SI EXISTE)
    let imageBase64 = null;
    let imageExtension = null;
    if (campaign.imageUrl) {
      try {
        const imagePath = path.join(__dirname, '..', campaign.imageUrl);
        const imageBuffer = await fs.readFile(imagePath);
        imageBase64 = imageBuffer.toString('base64');
        imageExtension = path.extname(campaign.imageUrl).substring(1);
      } catch (err) {
        console.error("Erreur lecture image:", err);
      }
    }

    // ✅ ENVOI À CHAQUE ABONNÉ
    for (const subscriber of subscribers) {
      try {
        // Construction du HTML avec l'image inline
        let imgTag = '';
        if (imageBase64 && imageExtension) {
          imgTag = `
            <div style="text-align: center; margin: 20px 0;">
              <img src="data:image/${imageExtension};base64,${imageBase64}" 
                   alt="Newsletter Image" 
                   style="max-width: 100%; height: auto; border-radius: 8px;">
            </div>
          `;
        }

        // URL de désinscription
        const unsubscribeUrl = `${process.env.BASE_URL_Email}/unsubscribe?email=${encodeURIComponent(subscriber.email)}`;

        const emailHtml = `
          <!DOCTYPE html>
          <html lang="fr">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>${campaign.subject}</title>
              <style>
                  body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
                  .container { max-width: 600px; margin: 0 auto; background-color: white; }
                  .header { background: linear-gradient(135deg, #9333ea 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                  .content { padding: 30px 20px; }
                  .content p { line-height: 1.6; color: #333; }
                  .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
                  .badge { 
                      display: inline-block; 
                      background-color: #fbbf24; 
                      color: #78350f; 
                      padding: 4px 12px; 
                      border-radius: 12px; 
                      font-size: 12px; 
                      font-weight: bold; 
                      margin-bottom: 10px;
                  }
                  .unsubscribe-btn { 
                      display: inline-block; 
                      padding: 10px 20px; 
                      background-color: #e5e7eb; 
                      color: #374151; 
                      text-decoration: none; 
                      border-radius: 6px; 
                      margin-top: 15px;
                      font-size: 13px;
                  }
                  .unsubscribe-btn:hover { background-color: #d1d5db; }
              </style>
          </head>
          <body>
              <div class="container">
                  <div class="header">
                      <h1>🧸 Bamby Joy</h1>
                      <span class="badge">📅 Envoi automatique programmé</span>
                      <h2>${campaign.subject}</h2>
                  </div>
                  <div class="content">
                      ${imgTag}
                      ${campaign.htmlContent || campaign.content.replace(/\n/g, '<br>')}
                  </div>
                  <div class="footer">
                      <p>© 2024 Bamby Joy. Tous droits réservés.</p>
                      <p><small>Cette newsletter a été envoyée automatiquement selon le planning défini.</small></p>
                      <a href="${unsubscribeUrl}" class="unsubscribe-btn">
                          Se désabonner de la newsletter
                      </a>
                  </div>
              </div>
          </body>
          </html>
        `;

        // ✅ ENVOI VIA API BREVO
        let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
        sendSmtpEmail.subject = campaign.subject;
        sendSmtpEmail.htmlContent = emailHtml;
        sendSmtpEmail.sender = { 
          name: process.env.BREVO_SENDER_NAME || "Bamby Joy", 
          email: process.env.BREVO_SENDER_EMAIL 
        };
        sendSmtpEmail.to = [{ email: subscriber.email }];

        await apiInstance.sendTransacEmail(sendSmtpEmail);
        successCount++;
        
        // Petit délai pour éviter le rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (emailError) {
        console.error(`❌ Erreur envoi à ${subscriber.email}:`, emailError);
        errorCount++;
      }
    }

    // ✅ MISE À JOUR DE LA CAMPAGNE
    await campaign.update({
      status: 'sent',
      sentDate: new Date(),
      recipientCount: successCount
    });

    console.log(`✅ Campagne "${campaign.subject}" envoyée automatiquement:`, {
      succès: successCount,
      erreurs: errorCount,
      total: subscribers.length
    });
  }

  // Méthode pour arrêter le scheduler (utile pour les tests)
  stop() {
    cron.getTasks().forEach(task => task.stop());
    console.log('🛑 Scheduler arrêté');
  }
}

module.exports = new SchedulerService();