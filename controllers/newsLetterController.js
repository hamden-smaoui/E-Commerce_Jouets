const Newsletter = require('../models/NewsLetter');
const NewsletterCampaign = require('../models/NewsletterCampaign');
const SibApiV3Sdk = require('@getbrevo/brevo');
const upload = require('../newsletterMulter');
const path = require('path');
const fs = require('fs').promises;

class NewsletterController {
  static uploadImage = upload.single('image');

  async subscribe(req, res, next) {
    try {
      const { email } = req.body;
      const exists = await Newsletter.findOne({ where: { email } });
      if (exists) {
        const error = new Error("Cet email est déjà inscrit.");
        error.code = "VALIDATION_ERROR";
        return next(error);
      }
      const entry = await Newsletter.create({ email });
      res.status(201).json(entry);
    } catch (err) {
      next(err);
    }
  }

  async getAll(req, res, next) {
    try {
      const entries = await Newsletter.findAll({ order: [['dateInscription', 'DESC']] });
      res.status(200).json(entries);
    } catch (err) {
      next(err);
    }
  }
async unsubscribeByEmail(req, res, next) {
  try {
    const { email } = req.query; // Récupère depuis l'URL (?email=...)
    
    if (!email) {
      const error = new Error("Email requis");
      error.code = "VALIDATION_ERROR";
      return next(error);
    }

    const entry = await Newsletter.findOne({ where: { email } });
    
    if (!entry) {
      const error = new Error("Email non trouvé dans notre liste d'abonnés");
      error.code = "NOT_FOUND";
      return next(error);
    }

    await entry.destroy();
    
    res.status(200).json({ 
      message: "Désinscription réussie",
      email: email 
    });
    
  } catch (err) {
    next(err);
  }
}
  async unsubscribe(req, res, next) {
    try {
      const { email } = req.body;
      const entry = await Newsletter.findOne({ where: { email } });
      if (!entry) {
        const error = new Error("Email non trouvé.");
        error.code = "NOT_FOUND";
        return next(error);
      }
      await entry.destroy();
      res.status(200).json({ message: "Désinscrit avec succès." });
    } catch (err) {
      next(err);
    }
  }

  async createCampaign(req, res, next) {
    NewsletterController.uploadImage(req, res, async (err) => {
      if (err) {
        const error = new Error("Erreur lors du téléchargement de l'image");
        error.code = "VALIDATION_ERROR";
        return next(error);
      }
      try {
        const { subject, content, htmlContent, scheduledDate } = req.body;
        const imageUrl = req.file ? `/uploads/newsletter/${req.file.filename}` : null;
        const campaign = await NewsletterCampaign.create({
          subject,
          content,
          htmlContent,
          imageUrl,
          scheduledDate: scheduledDate || null,
          status: scheduledDate ? 'scheduled' : 'draft'
        });
        res.status(201).json({ message: 'Campagne créée avec succès', campaign });
      } catch (error) {
        next(error);
      }
    });
  }

  async getCampaigns(req, res, next) {
    try {
      const campaigns = await NewsletterCampaign.findAll({
        order: [['createdAt', 'DESC']]
      });
      res.status(200).json(campaigns);
    } catch (error) {
      next(error);
    }
  }

  async sendCampaign(req, res, next) {
    try {
      const { campaignId } = req.params;
      const campaign = await NewsletterCampaign.findByPk(campaignId);
      
      if (!campaign) {
        const error = new Error('Campagne non trouvée');
        error.code = "NOT_FOUND";
        return next(error);
      }
      
      if (campaign.status === 'sent') {
        const error = new Error('Campagne déjà envoyée');
        error.code = "VALIDATION_ERROR";
        return next(error);
      }
      
      const subscribers = await Newsletter.findAll();
      if (subscribers.length === 0) {
        const error = new Error('Aucun abonné trouvé');
        error.code = "NOT_FOUND";
        return next(error);
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
          const unsubscribeUrl = `${process.env.FRONTEND_URL_PROD}/unsubscribe?email=${encodeURIComponent(subscriber.email)}`;

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
                        <h2>${campaign.subject}</h2>
                    </div>
                    <div class="content">
                        ${imgTag}
                        ${campaign.htmlContent || campaign.content.replace(/\n/g, '<br>')}
                    </div>
                    <div class="footer">
                        <p>© 2024 Bamby Joy. Tous droits réservés.</p>
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

      console.log(`✅ Campagne "${campaign.subject}" envoyée:`, {
        succès: successCount,
        erreurs: errorCount,
        total: subscribers.length
      });

      res.status(200).json({
        message: 'Campagne envoyée avec succès',
        successCount,
        errorCount,
        totalSubscribers: subscribers.length
      });

    } catch (error) {
      console.error("❌ Erreur sendCampaign:", error);
      next(error);
    }
  }

  async deleteCampaign(req, res, next) {
    try {
      const { campaignId } = req.params;
      const campaign = await NewsletterCampaign.findByPk(campaignId);
      if (!campaign) {
        const error = new Error('Campagne non trouvée');
        error.code = "NOT_FOUND";
        return next(error);
      }
      if (campaign.imageUrl) {
        const imagePath = path.join(__dirname, '..', campaign.imageUrl);
        try {
          await fs.unlink(imagePath);
        } catch (err) {}
      }
      await campaign.destroy();
      res.status(200).json({ message: 'Campagne supprimée avec succès' });
    } catch (error) {
      next(error);
    }
  }

  async updateCampaign(req, res, next) {
    NewsletterController.uploadImage(req, res, async (err) => {
      if (err) {
        const error = new Error("Erreur lors du téléchargement de l'image");
        error.code = "VALIDATION_ERROR";
        return next(error);
      }
      try {
        const { campaignId } = req.params;
        const { subject, content, htmlContent, scheduledDate } = req.body;
        const campaign = await NewsletterCampaign.findByPk(campaignId);
        if (!campaign) {
          const error = new Error('Campagne non trouvée');
          error.code = "NOT_FOUND";
          return next(error);
        }
        if (campaign.status === 'sent') {
          const error = new Error('Impossible de modifier une campagne déjà envoyée');
          error.code = "VALIDATION_ERROR";
          return next(error);
        }
        let imageUrl = campaign.imageUrl;
        if (req.file) {
          if (campaign.imageUrl) {
            const oldImagePath = path.join(__dirname, '..', campaign.imageUrl);
            try {
              await fs.unlink(oldImagePath);
            } catch (err) {}
          }
          imageUrl = `/uploads/newsletter/${req.file.filename}`;
        }
        const newStatus = scheduledDate ? 'scheduled' : 'draft';
        await campaign.update({
          subject,
          content,
          htmlContent,
          imageUrl,
          scheduledDate: scheduledDate || null,
          status: newStatus
        });
        res.status(200).json({
          message: 'Campagne mise à jour avec succès',
          campaign
        });
      } catch (error) {
        next(error);
      }
    });
  }
}

module.exports = new NewsletterController();