const Newsletter = require('../models/NewsLetter');
const NewsletterCampaign = require('../models/NewsletterCampaign');
const nodemailer = require('nodemailer');
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
          let attachments = [];
          let imgTag = '';
          if (campaign.imageUrl) {
            attachments.push({
              filename: path.basename(campaign.imageUrl),
              path: path.join(__dirname, '..', campaign.imageUrl),
              cid: 'newsletter-image'
            });
            imgTag = `<div class="image-container">
              <img src="cid:newsletter-image" alt="Newsletter Image" style="max-width: 100%; height: auto; border-radius: 8px;">
            </div>`;
          }
          const emailHtml = `
            <!DOCTYPE html>
            <html lang="fr">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${campaign.subject}</title>
            </head>
            <body>
                <div>
                    <h1>${campaign.subject}</h1>
                    ${imgTag}
                    ${campaign.htmlContent || campaign.content.replace(/\n/g, '<br>')}
                </div>
                <div>
                    <a href="${process.env.BASE_URL || 'http://localhost:3001'}/api/jouets/newsletter/unsubscribe?email=${subscriber.email}">
                        Se désabonner
                    </a>
                </div>
            </body>
            </html>
          `;
          await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: subscriber.email,
            subject: campaign.subject,
            html: emailHtml,
            attachments
          });
          successCount++;
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (emailError) {
          errorCount++;
        }
      }
      await campaign.update({
        status: 'sent',
        sentDate: new Date(),
        recipientCount: successCount
      });
      res.status(200).json({
        message: 'Campagne envoyée avec succès',
        successCount,
        errorCount,
        totalSubscribers: subscribers.length
      });
    } catch (error) {
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