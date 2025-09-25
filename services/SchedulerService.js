const cron = require('node-cron');
const NewsletterCampaign = require('../models/NewsletterCampaign');
const Newsletter = require('../models/NewsLetter');
const nodemailer = require('nodemailer');
const { Op } = require('sequelize');

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

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    let successCount = 0;
    let errorCount = 0;

    for (const subscriber of subscribers) {
      try {
        // Préparer les pièces jointes si une image existe
        let attachments = [];
        let imgTag = '';
        
        if (campaign.imageUrl) {
          const path = require('path');
          attachments.push({
            filename: path.basename(campaign.imageUrl),
            path: path.join(__dirname, '..', campaign.imageUrl),
            cid: 'newsletter-image'
          });
          imgTag = `<div class="image-container">
            <img src="cid:newsletter-image" alt="Newsletter Image" style="max-width: 100%; height: auto; border-radius: 8px;">
          </div>`;
        }

        // Construire le HTML
        const emailHtml = `
          <!DOCTYPE html>
          <html lang="fr">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>${campaign.subject}</title>
              <style>
                  body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
                  .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; }
                  .header { background: linear-gradient(135deg, #9333ea 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                  .content { padding: 30px 20px; }
                  .image-container { text-align: center; margin: 20px 0; }
                  .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
                  .content p { line-height: 1.6; color: #333; }
              </style>
          </head>
          <body>
              <div class="container">
                  <div class="header">
                      <h1>🧸 Bamby Joy</h1>
                      <h2>${campaign.subject}</h2>
                  </div>
                  <div class="content">
                      ${imgTag}
                      ${campaign.htmlContent || campaign.content.replace(/\n/g, '<br>')}
                  </div>
                  <div class="footer">
                      <p>© 2024 Bamby Joy. Tous droits réservés.</p>
                      <p><small>Envoi automatique programmé</small></p>
                  </div>
              </div>
          </body>
          </html>
        `;

        await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: subscriber.email,
          subject: `${campaign.subject}`,
          html: emailHtml,
          attachments
        });

        successCount++;
        // Petit délai pour éviter le spam
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (emailError) {
        console.error(`❌ Erreur envoi à ${subscriber.email}:`, emailError);
        errorCount++;
      }
    }

    // Mettre à jour la campagne
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
    cron.destroy();
    console.log('🛑 Scheduler arrêté');
  }
}

module.exports = new SchedulerService();