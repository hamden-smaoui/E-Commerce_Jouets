const Newsletter = require('../models/NewsLetter');
const NewsletterCampaign = require('../models/NewsletterCampaign');
const nodemailer = require('nodemailer');
const upload = require('../newsletterMulter');
const path = require('path');
const fs = require('fs').promises;

class NewsletterController {
  constructor() {
    this.subscribe = this.subscribe.bind(this);
    this.getAll = this.getAll.bind(this);
    this.unsubscribe = this.unsubscribe.bind(this);
    this.getCampaigns = this.getCampaigns.bind(this);
    this.sendCampaign = this.sendCampaign.bind(this);
    this.generateEmailTemplate = this.generateEmailTemplate.bind(this);
    this.deleteCampaign = this.deleteCampaign.bind(this);
    this.uploadImage = upload.single('image');
  }
  // Middleware pour upload d'image (comme dans MarqueController)
  static uploadImage = upload.single('image');

  // Inscription à la newsletter
  async subscribe(req, res) {
    try {
      const { email } = req.body;
      const exists = await Newsletter.findOne({ where: { email } });
      if (exists) {
        return res.status(409).json({ message: "Cet email est déjà inscrit." });
      }
      const entry = await Newsletter.create({ email });
      res.status(201).json(entry);
    } catch (err) {
      res.status(500).json({ message: "Erreur lors de l'inscription à la newsletter", error: err.message });
    }
  }

  // Récupérer toutes les inscriptions
  async getAll(req, res) {
    try {
      const entries = await Newsletter.findAll({ order: [['dateInscription', 'DESC']] });
      res.status(200).json(entries);
    } catch (err) {
      res.status(500).json({ message: "Erreur lors de la récupération des inscriptions", error: err.message });
    }
  }

  // Désinscription
  async unsubscribe(req, res) {
    try {
      const { email } = req.body;
      const entry = await Newsletter.findOne({ where: { email } });
      if (!entry) {
        return res.status(404).json({ message: "Email non trouvé." });
      }
      await entry.destroy();
      res.status(200).json({ message: "Désinscrit avec succès." });
    } catch (err) {
      res.status(500).json({ message: "Erreur lors de la désinscription", error: err.message });
    }
  }

  // Créer une campagne (avec gestion d'image comme MarqueController)
    async createCampaign(req, res) {
        console.log('Requête reçue pour créer une campagne:', req.body, req.file);
    NewsletterController.uploadImage(req, res, async (err) => {
      if (err) {
        console.error('Upload error:', err);
        return res.status(400).json({
          message: 'Erreur lors du téléchargement de l\'image',
          error: err.message,
        });
      }

      try {
        const { subject, content, htmlContent, scheduledDate } = req.body;
        const imageUrl = req.file ? `/uploads/newsletter/${req.file.filename}` : null;
        
        console.log('Données reçues:', { subject, content, htmlContent, scheduledDate });
        console.log('Fichier uploadé:', req.file);

        const campaign = await NewsletterCampaign.create({
          subject,
          content,
          htmlContent,
          imageUrl,
          scheduledDate: scheduledDate || null,
          status: scheduledDate ? 'scheduled' : 'draft'
        });

        console.log('Campagne créée:', campaign);

        res.status(201).json({
          message: 'Campagne créée avec succès',
          campaign
        });
      } catch (error) {
        console.error('Create campaign error:', error);
        res.status(500).json({
          message: 'Erreur lors de la création de la campagne',
          error: error.message
        });
      }
    });
  }

  // Récupérer toutes les campagnes
  async getCampaigns(req, res) {
    try {
      const campaigns = await NewsletterCampaign.findAll({
        order: [['createdAt', 'DESC']]
      });
      res.status(200).json(campaigns);
    } catch (error) {
      res.status(500).json({
        message: 'Erreur lors de la récupération des campagnes',
        error: error.message
      });
    }
  }

   async sendCampaign(req, res) {
    try {
      const { campaignId } = req.params;
      const campaign = await NewsletterCampaign.findByPk(campaignId);
      if (!campaign) return res.status(404).json({ message: 'Campagne non trouvée' });
      if (campaign.status === 'sent')
        return res.status(400).json({ message: 'Campagne déjà envoyée' });

      const subscribers = await Newsletter.findAll();
      if (subscribers.length === 0)
        return res.status(400).json({ message: 'Aucun abonné trouvé' });

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
          // Prepare attachment if image exists
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
          // Build the HTML (no base64 needed)
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
                    .image-container img { max-width: 100%; height: auto; border-radius: 8px; display: block; margin: 0 auto; }
                    .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
                    .unsubscribe { margin-top: 20px; }
                    .unsubscribe a { color: #9333ea; text-decoration: none; }
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
                        <div class="unsubscribe">
                            <a href="${process.env.BASE_URL || 'http://localhost:3001'}/api/jouets/newsletter/unsubscribe?email={{UNSUBSCRIBE_EMAIL}}">
                                Se désabonner
                            </a>
                        </div>
                    </div>
                </div>
            </body>
            </html>
          `;

          await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: subscriber.email,
            subject: campaign.subject,
            html: emailHtml.replace('{{UNSUBSCRIBE_EMAIL}}', subscriber.email),
            attachments
          });
          successCount++;
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (emailError) {
          console.error(`Erreur envoi à ${subscriber.email}:`, emailError);
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
      res.status(500).json({
        message: 'Erreur lors de l\'envoi de la campagne',
        error: error.message
      });
    }
  }
async convertImageToBase64(imagePath) {
  try {
    const fullPath = path.join(__dirname, '..', imagePath);
    const imageBuffer = await fs.readFile(fullPath);
    const ext = path.extname(imagePath).substring(1);
    const mimeType = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
    const base64Image = imageBuffer.toString('base64');
    return `data:${mimeType};base64,${base64Image}`;
  } catch (error) {
    console.error('Erreur conversion base64:', error);
    return null;
  }
}
  // Générer le template HTML
  async generateEmailTemplate(campaign) {
  let imageData = null;
  
  if (campaign.imageUrl) {
    imageData = await this.convertImageToBase64(campaign.imageUrl);
  }
  console.log('imageData:', imageData);  
  return `
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
          .image-container img { max-width: 100%; height: auto; border-radius: 8px; display: block; margin: 0 auto; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
          .unsubscribe { margin-top: 20px; }
          .unsubscribe a { color: #9333ea; text-decoration: none; }
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
              ${imageData ? `
              <div class="image-container">
                  <img src="${imageData}" 
                       alt="Newsletter Image" 
                       style="max-width: 100%; height: auto; border-radius: 8px;">
              </div>` : ''}
              
              ${campaign.htmlContent || campaign.content.replace(/\n/g, '<br>')}
              
          </div>
          <div class="footer">
              <p>© 2024 Bamby Joy. Tous droits réservés.</p>
              <div class="unsubscribe">
                  <a href="${process.env.FRONTEND_URL || 'http://localhost:3001'}/site}">
                      Visiter notre site
                  </a>
              </div>
          </div>
      </div>
  </body>
  </html>
  `;
}

  // Supprimer une campagne
  async deleteCampaign(req, res) {
    try {
      const { campaignId } = req.params;
      
      const campaign = await NewsletterCampaign.findByPk(campaignId);
      if (!campaign) {
        return res.status(404).json({ message: 'Campagne non trouvée' });
      }

      // Supprimer le fichier image s'il existe
      if (campaign.imageUrl) {
        const imagePath = path.join(__dirname, '..', campaign.imageUrl);
        try {
          await fs.unlink(imagePath);
          console.log('Image supprimée:', imagePath);
        } catch (err) {
          console.error('Erreur suppression image:', err);
        }
      }

      await campaign.destroy();
      res.status(200).json({ message: 'Campagne supprimée avec succès' });
    } catch (error) {
      res.status(500).json({
        message: 'Erreur lors de la suppression de la campagne',
        error: error.message
      });
    }
  }
  // Mettre à jour une campagne
async updateCampaign(req, res) {
  NewsletterController.uploadImage(req, res, async (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({
        message: 'Erreur lors du téléchargement de l\'image',
        error: err.message,
      });
    }

    try {
      const { campaignId } = req.params;
      const { subject, content, htmlContent, scheduledDate } = req.body;
      
      const campaign = await NewsletterCampaign.findByPk(campaignId);
      if (!campaign) {
        return res.status(404).json({ message: 'Campagne non trouvée' });
      }

      // Vérifier si la campagne a déjà été envoyée
      if (campaign.status === 'sent') {
        return res.status(400).json({ 
          message: 'Impossible de modifier une campagne déjà envoyée' 
        });
      }

      // Gérer la nouvelle image
      let imageUrl = campaign.imageUrl; // Garder l'ancienne par défaut
      
      if (req.file) {
        // Supprimer l'ancienne image si elle existe
        if (campaign.imageUrl) {
          const oldImagePath = path.join(__dirname, '..', campaign.imageUrl);
          try {
            await fs.unlink(oldImagePath);
            console.log('Ancienne image supprimée:', oldImagePath);
          } catch (err) {
            console.error('Erreur suppression ancienne image:', err);
          }
        }
        // Utiliser la nouvelle image
        imageUrl = `/uploads/newsletter/${req.file.filename}`;
      }

      // Déterminer le nouveau statut
      const newStatus = scheduledDate ? 'scheduled' : 'draft';

      await campaign.update({
        subject,
        content,
        htmlContent,
        imageUrl,
        scheduledDate: scheduledDate || null,
        status: newStatus
      });

      console.log('Campagne mise à jour:', campaign);

      res.status(200).json({
        message: 'Campagne mise à jour avec succès',
        campaign
      });
    } catch (error) {
      console.error('Update campaign error:', error);
      res.status(500).json({
        message: 'Erreur lors de la mise à jour de la campagne',
        error: error.message
      });
    }
  });
}
}

module.exports = new NewsletterController();