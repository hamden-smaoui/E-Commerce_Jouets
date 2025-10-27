const Newsletter = require('../models/NewsLetter');
const NewsletterCampaign = require('../models/NewsletterCampaign');
const SibApiV3Sdk = require('@getbrevo/brevo');
const upload = require('../newsletterMulter');
const { cloudinary } = require('../config/cloudinary'); // ✅ NOUVEAU
const axios = require('axios'); // ✅ NOUVEAU : Pour télécharger les images Cloudinary

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
      const { email } = req.query;
      
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
        
        // ✅ MODIFIÉ : Utiliser Cloudinary URL
        const imageUrl = req.file ? req.file.path : null;
        const imagePublicId = req.file ? req.file.filename : null;
        
        const campaign = await NewsletterCampaign.create({
          subject,
          content,
          htmlContent,
          imageUrl,
          imagePublicId, // ✅ NOUVEAU
          scheduledDate: scheduledDate || null,
          status: scheduledDate ? 'scheduled' : 'draft'
        });
        
        res.status(201).json({ message: 'Campagne créée avec succès', campaign });
      } catch (error) {
        // ✅ NOUVEAU : En cas d'erreur, supprimer l'image de Cloudinary
        if (req.file) {
          try {
            await cloudinary.uploader.destroy(req.file.filename);
          } catch (deleteErr) {
            console.error('Erreur suppression image Cloudinary:', deleteErr);
          }
        }
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

      // ✅ MODIFIÉ : TÉLÉCHARGER L'IMAGE DEPUIS CLOUDINARY
      let imageBase64 = null;
      let imageExtension = null;
      if (campaign.imageUrl) {
        try {
          // Télécharger l'image depuis Cloudinary
          const response = await axios.get(campaign.imageUrl, {
            responseType: 'arraybuffer'
          });
          const imageBuffer = Buffer.from(response.data, 'binary');
          imageBase64 = imageBuffer.toString('base64');
          
          // Déterminer l'extension à partir de l'URL Cloudinary
          const urlParts = campaign.imageUrl.split('.');
          imageExtension = urlParts[urlParts.length - 1].toLowerCase();
          
        } catch (err) {
          console.error("Erreur téléchargement image Cloudinary:", err);
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
      
      // ✅ MODIFIÉ : Supprimer l'image de Cloudinary
      if (campaign.imagePublicId) {
        try {
          await cloudinary.uploader.destroy(campaign.imagePublicId);
        } catch (err) {
          console.error('Erreur suppression image Cloudinary:', err);
        }
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
        let imagePublicId = campaign.imagePublicId;
        
        if (req.file) {
          // ✅ MODIFIÉ : Supprimer l'ancienne image de Cloudinary
          if (campaign.imagePublicId) {
            try {
              await cloudinary.uploader.destroy(campaign.imagePublicId);
            } catch (err) {
              console.error('Erreur suppression ancienne image:', err);
            }
          }
          imageUrl = req.file.path;
          imagePublicId = req.file.filename;
        }
        
        const newStatus = scheduledDate ? 'scheduled' : 'draft';
        await campaign.update({
          subject,
          content,
          htmlContent,
          imageUrl,
          imagePublicId,
          scheduledDate: scheduledDate || null,
          status: newStatus
        });
        
        res.status(200).json({
          message: 'Campagne mise à jour avec succès',
          campaign
        });
      } catch (error) {
        // ✅ NOUVEAU : En cas d'erreur, supprimer la nouvelle image uploadée
        if (req.file) {
          try {
            await cloudinary.uploader.destroy(req.file.filename);
          } catch (deleteErr) {
            console.error('Erreur suppression image Cloudinary:', deleteErr);
          }
        }
        next(error);
      }
    });
  }
}

module.exports = new NewsletterController();