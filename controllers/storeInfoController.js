const { StoreInfo, Image } = require('../models');
const upload = require('../multerConfig');
const path = require('path');
const fs = require('fs').promises;

class StoreInfoController {
  // Modifiez la configuration multer pour accepter les logos aussi
  static uploadFiles = upload.fields([
  { name: 'heroImages', maxCount: 10 },
  { name: 'promotionImages', maxCount: 10 }, // Nouvelle ligne
  { name: 'logo1', maxCount: 1 },
  { name: 'logo2', maxCount: 1 }
]);

  async createStoreInfo(req, res) {
    StoreInfoController.uploadFiles(req, res, async (err) => {
      if (err) {
        console.error('Upload error:', err);
        return res.status(400).json({
          message: 'Erreur lors du téléchargement des fichiers',
          error: err.message,
        });
      }
      try {
        const {
          nom,
          adresse,
          ville,
          codePostal,
          pays,
          emailPrincipal,
          emailSecondaire,
          telephonePrincipal,
          telephoneSecondaire,
          heuresOuverture,
          latitude,
          longitude,
          descriptionHero,
          urlFacebook,
          urlInstagram,
          urlTiktok,
          urlYoutube,
          topDescription,
          tauxTVA,
          fraisLivraison,
          seuilLivraisonGratuite,
          entrepriseSiret,
        } = req.body;

        // Gérer les uploads des logos
        let logo1Path = null;
        let logo2Path = null;

        if (req.files?.logo1 && req.files.logo1[0]) {
          logo1Path = `/Uploads/${req.files.logo1[0].filename}`;
        }

        if (req.files?.logo2 && req.files.logo2[0]) {
          logo2Path = `/Uploads/${req.files.logo2[0].filename}`;
        }

        // Create store info avec les chemins des logos
        const storeInfo = await StoreInfo.create({
          nom,
          adresse,
          ville,
          codePostal,
          pays,
          emailPrincipal,
          emailSecondaire,
          telephonePrincipal,
          telephoneSecondaire,
          heuresOuverture,
          latitude: parseFloat(latitude) || null,
          longitude: parseFloat(longitude) || null,
          logo1: logo1Path,
          logo2: logo2Path,
          descriptionHero,
          urlFacebook,
          urlInstagram,
          urlTiktok,
          urlYoutube,
          topDescription,
          tauxTVA: parseFloat(tauxTVA) || 19,
          fraisLivraison: parseFloat(fraisLivraison) || 7,
          seuilLivraisonGratuite: parseFloat(seuilLivraisonGratuite) || 100,
          entrepriseSiret
        });

        // Save hero images to Image model
        if (req.files?.heroImages && Array.isArray(req.files.heroImages)) {
          const images = req.files.heroImages.map((file, index) => ({
            url: `/Uploads/${file.filename}`,
            rang: index + 1,
            type: 'hero',
            idStoreInfo: storeInfo.idStoreInfo,
          }));
          await Image.bulkCreate(images);
        }

        // Save promotion images to Image model - NOUVEAU
        if (req.files?.promotionImages && Array.isArray(req.files.promotionImages)) {
          const promotionImages = req.files.promotionImages.map((file, index) => ({
            url: `/Uploads/${file.filename}`,
            rang: index + 1,
            type: 'promotion',
            idStoreInfo: storeInfo.idStoreInfo,
          }));
          await Image.bulkCreate(promotionImages);
        }

        // Fetch the created store info with all images
        const createdStoreInfo = await StoreInfo.findByPk(storeInfo.idStoreInfo, {
          include: [
            {
              model: Image,
              as: 'heroImages',
              where: { type: 'hero' },
              attributes: ['idImage', 'url', 'rang', 'type'],
              order: [['rang', 'ASC']],
              required: false,
            },
            {
              model: Image,
              as: 'promotionImages',
              where: { type: 'promotion' },
              attributes: ['idImage', 'url', 'rang', 'type'],
              order: [['rang', 'ASC']],
              required: false,
            },
          ],
        });

        res.status(201).json({
          message: 'Informations du magasin créées avec succès',
          data: createdStoreInfo,
        });
      } catch (error) {
        console.error('Create store info error:', error);
        res.status(500).json({
          message: 'Erreur lors de la création des informations du magasin',
          error: error.message,
        });
      }
    });
  }

  async updateStoreInfo(req, res) {
    StoreInfoController.uploadFiles(req, res, async (err) => {
      if (err) {
        console.error('Upload error:', err);
        return res.status(400).json({
          message: 'Erreur lors du téléchargement des fichiers',
          error: err.message,
        });
      }
      try {
        const storeInfo = await StoreInfo.findByPk(req.params.id, {
          include: [
            { model: Image, as: 'heroImages', where: { type: 'hero' }, required: false },
            { model: Image, as: 'promotionImages', where: { type: 'promotion' }, required: false }
          ],
        });
        if (!storeInfo) {
          return res.status(404).json({ message: 'Informations du magasin non trouvées' });
        }

        const {
          nom,
          adresse,
          ville,
          codePostal,
          pays,
          emailPrincipal,
          emailSecondaire,
          telephonePrincipal,
          telephoneSecondaire,
          heuresOuverture,
          latitude,
          longitude,
          descriptionHero,
          urlFacebook,
          urlInstagram,
          urlTiktok,
          urlYoutube,
          topDescription,
          imagesToDelete,
          promotionImagesToDelete, // NOUVEAU
          imageRangs,
          promotionImageRangs, // NOUVEAU
          tauxTVA,
          seuilLivraisonGratuite,
          fraisLivraison,
          entrepriseSiret,
        } = req.body;

        // Parser les données JSON
        let parsedImagesToDelete = [];
        let parsedPromotionImagesToDelete = []; // NOUVEAU
        let parsedImageRangs = {};
        let parsedPromotionImageRangs = {}; // NOUVEAU

        if (imagesToDelete) {
          try {
            parsedImagesToDelete = typeof imagesToDelete === 'string' 
              ? JSON.parse(imagesToDelete) 
              : imagesToDelete;
          } catch (e) {
            console.error('Error parsing imagesToDelete:', e);
            parsedImagesToDelete = [];
          }
        }

        // NOUVEAU - Parser promotion images to delete
        if (promotionImagesToDelete) {
          try {
            parsedPromotionImagesToDelete = typeof promotionImagesToDelete === 'string' 
              ? JSON.parse(promotionImagesToDelete) 
              : promotionImagesToDelete;
          } catch (e) {
            console.error('Error parsing promotionImagesToDelete:', e);
            parsedPromotionImagesToDelete = [];
          }
        }

        if (imageRangs) {
          try {
            parsedImageRangs = typeof imageRangs === 'string' 
              ? JSON.parse(imageRangs) 
              : imageRangs;
          } catch (e) {
            console.error('Error parsing imageRangs:', e);
            parsedImageRangs = {};
          }
        }

        // NOUVEAU - Parser promotion image ranks
        if (promotionImageRangs) {
          try {
            parsedPromotionImageRangs = typeof promotionImageRangs === 'string' 
              ? JSON.parse(promotionImageRangs) 
              : promotionImageRangs;
          } catch (e) {
            console.error('Error parsing promotionImageRangs:', e);
            parsedPromotionImageRangs = {};
          }
        }

        // Gérer les nouveaux logos
        let logo1Path = storeInfo.logo1; 
        let logo2Path = storeInfo.logo2;

        if (req.files?.logo1 && req.files.logo1[0]) {
          if (storeInfo.logo1) {
            const oldLogo1Path = path.join(__dirname, '..', storeInfo.logo1);
            try {
              await fs.unlink(oldLogo1Path);
              console.log('Old logo1 deleted:', oldLogo1Path);
            } catch (err) {
              console.error('Failed to delete old logo1:', err);
            }
          }
          logo1Path = `/Uploads/${req.files.logo1[0].filename}`;
        }

        if (req.files?.logo2 && req.files.logo2[0]) {
          if (storeInfo.logo2) {
            const oldLogo2Path = path.join(__dirname, '..', storeInfo.logo2);
            try {
              await fs.unlink(oldLogo2Path);
              console.log('Old logo2 deleted:', oldLogo2Path);
            } catch (err) {
              console.error('Failed to delete old logo2:', err);
            }
          }
          logo2Path = `/Uploads/${req.files.logo2[0].filename}`;
        }

        // Update store info data
        await storeInfo.update({
          nom,
          adresse,
          ville,
          codePostal,
          pays,
          emailPrincipal,
          emailSecondaire,
          telephonePrincipal,
          telephoneSecondaire,
          heuresOuverture,
          latitude: parseFloat(latitude) || null,
          longitude: parseFloat(longitude) || null,
          logo1: logo1Path,
          logo2: logo2Path,
          descriptionHero,
          urlFacebook,
          urlInstagram,
          urlTiktok,
          urlYoutube,
          topDescription,
          tauxTVA: parseFloat(tauxTVA) || 19,
          fraisLivraison: parseFloat(fraisLivraison) || 7,
          seuilLivraisonGratuite: parseFloat(seuilLivraisonGratuite) || 100,
          entrepriseSiret
        });

        // Handle hero image deletions
        if (parsedImagesToDelete && Array.isArray(parsedImagesToDelete) && parsedImagesToDelete.length > 0) {
          const imagesToDeleteParsed = parsedImagesToDelete.map(id => parseInt(id));
          
          const imagesToDeleteFromDb = await Image.findAll({
            where: {
              idImage: imagesToDeleteParsed,
              idStoreInfo: storeInfo.idStoreInfo,
              type: 'hero'
            },
          });

          // Delete images from disk
          for (const image of imagesToDeleteFromDb) {
            const imagePath = path.join(__dirname, '..', image.url);
            try {
              await fs.unlink(imagePath);
              console.log('Hero image deleted from disk:', imagePath);
            } catch (err) {
              console.error('Failed to delete hero image from disk:', err);
            }
          }

          // Delete images from database
          await Image.destroy({
            where: {
              idImage: imagesToDeleteParsed,
              idStoreInfo: storeInfo.idStoreInfo,
              type: 'hero'
            },
          });
        }

        // NOUVEAU - Handle promotion image deletions
        if (parsedPromotionImagesToDelete && Array.isArray(parsedPromotionImagesToDelete) && parsedPromotionImagesToDelete.length > 0) {
          const promotionImagesToDeleteParsed = parsedPromotionImagesToDelete.map(id => parseInt(id));
          
          const promotionImagesToDeleteFromDb = await Image.findAll({
            where: {
              idImage: promotionImagesToDeleteParsed,
              idStoreInfo: storeInfo.idStoreInfo,
              type: 'promotion'
            },
          });

          // Delete promotion images from disk
          for (const image of promotionImagesToDeleteFromDb) {
            const imagePath = path.join(__dirname, '..', image.url);
            try {
              await fs.unlink(imagePath);
              console.log('Promotion image deleted from disk:', imagePath);
            } catch (err) {
              console.error('Failed to delete promotion image from disk:', err);
            }
          }

          // Delete promotion images from database
          await Image.destroy({
            where: {
              idImage: promotionImagesToDeleteParsed,
              idStoreInfo: storeInfo.idStoreInfo,
              type: 'promotion'
            },
          });
        }

        // Update existing hero image ranks
        if (parsedImageRangs && typeof parsedImageRangs === 'object') {
          for (const [imageId, newRang] of Object.entries(parsedImageRangs)) {
            await Image.update(
              { rang: parseInt(newRang) },
              {
                where: {
                  idImage: parseInt(imageId),
                  idStoreInfo: storeInfo.idStoreInfo,
                  type: 'hero'
                },
              }
            );
          }
        }

        // NOUVEAU - Update existing promotion image ranks
        if (parsedPromotionImageRangs && typeof parsedPromotionImageRangs === 'object') {
          for (const [imageId, newRang] of Object.entries(parsedPromotionImageRangs)) {
            await Image.update(
              { rang: parseInt(newRang) },
              {
                where: {
                  idImage: parseInt(imageId),
                  idStoreInfo: storeInfo.idStoreInfo,
                  type: 'promotion'
                },
              }
            );
          }
        }

        // Add new hero images if provided
        if (req.files?.heroImages && Array.isArray(req.files.heroImages) && req.files.heroImages.length > 0) {
          const existingHeroImages = await Image.findAll({
            where: { 
              idStoreInfo: storeInfo.idStoreInfo,
              type: 'hero'
            },
            order: [['rang', 'DESC']],
            limit: 1,
          });

          const maxHeroRang = existingHeroImages.length > 0 ? existingHeroImages[0].rang : 0;

          const newHeroImages = req.files.heroImages.map((file, index) => ({
            url: `/Uploads/${file.filename}`,
            rang: maxHeroRang + index + 1,
            type: 'hero',
            idStoreInfo: storeInfo.idStoreInfo,
          }));

          await Image.bulkCreate(newHeroImages);
        }

        // NOUVEAU - Add new promotion images if provided
        if (req.files?.promotionImages && Array.isArray(req.files.promotionImages) && req.files.promotionImages.length > 0) {
          const existingPromotionImages = await Image.findAll({
            where: { 
              idStoreInfo: storeInfo.idStoreInfo,
              type: 'promotion'
            },
            order: [['rang', 'DESC']],
            limit: 1,
          });

          const maxPromotionRang = existingPromotionImages.length > 0 ? existingPromotionImages[0].rang : 0;

          const newPromotionImages = req.files.promotionImages.map((file, index) => ({
            url: `/Uploads/${file.filename}`,
            rang: maxPromotionRang + index + 1,
            type: 'promotion',
            idStoreInfo: storeInfo.idStoreInfo,
          }));

          await Image.bulkCreate(newPromotionImages);
        }

        // Fetch updated store info with all images
        const updatedStoreInfo = await StoreInfo.findByPk(storeInfo.idStoreInfo, {
          include: [
            {
              model: Image,
              as: 'heroImages',
              where: { type: 'hero' },
              attributes: ['idImage', 'url', 'rang', 'type'],
              order: [['rang', 'ASC']],
              required: false,
            },
            {
              model: Image,
              as: 'promotionImages',
              where: { type: 'promotion' },
              attributes: ['idImage', 'url', 'rang', 'type'],
              order: [['rang', 'ASC']],
              required: false,
            },
          ],
        });

        res.status(200).json({
          message: 'Informations du magasin mises à jour avec succès',
          data: updatedStoreInfo,
        });
      } catch (error) {
        console.error('Update store info error:', error);
        res.status(500).json({
          message: 'Erreur lors de la mise à jour des informations du magasin',
          error: error.message,
        });
      }
    });
  }
 async getStoreInfo(req, res) {
    try {
      const storeInfo = await StoreInfo.findOne({
        include: [
          {
            model: Image,
            as: 'heroImages',
            where: { type: 'hero' },
            attributes: ['idImage', 'url', 'rang', 'type'],
            order: [['rang', 'ASC']],
            required: false,
          },
          {
            model: Image,
            as: 'promotionImages',
            where: { type: 'promotion' },
            attributes: ['idImage', 'url', 'rang', 'type'],
            order: [['rang', 'ASC']],
            required: false,
          },
        ],
      });
      if (!storeInfo) {
        return res.status(404).json({ message: 'Informations du magasin non trouvées' });
      }
      res.status(200).json(storeInfo);
    } catch (error) {
      console.error('Get store info error:', error);
      res.status(500).json({
        message: 'Erreur lors de la récupération des informations du magasin',
        error: error.message,
      });
    }
  }

  async deleteStoreInfo(req, res) {
    try {
      const storeInfo = await StoreInfo.findByPk(req.params.id, {
        include: [
          { model: Image, as: 'heroImages', where: { type: 'hero' }, required: false },
          { model: Image, as: 'promotionImages', where: { type: 'promotion' }, required: false }
        ],
      });
      if (!storeInfo) {
        return res.status(404).json({ message: 'Informations du magasin non trouvées' });
      }

      // Delete logos from disk
      if (storeInfo.logo1) {
        const logo1Path = path.join(__dirname, '..', storeInfo.logo1);
        try {
          await fs.unlink(logo1Path);
          console.log('Logo1 deleted:', logo1Path);
        } catch (err) {
          console.error('Failed to delete logo1:', err);
        }
      }

      if (storeInfo.logo2) {
        const logo2Path = path.join(__dirname, '..', storeInfo.logo2);
        try {
          await fs.unlink(logo2Path);
          console.log('Logo2 deleted:', logo2Path);
        } catch (err) {
          console.error('Failed to delete logo2:', err);
        }
      }

      // Delete associated hero images from disk
      if (storeInfo.heroImages && storeInfo.heroImages.length > 0) {
        for (const image of storeInfo.heroImages) {
          const imagePath = path.join(__dirname, '..', image.url);
          try {
            await fs.unlink(imagePath);
            console.log('Hero image deleted:', imagePath);
          } catch (err) {
            console.error('Failed to delete hero image:', err);
          }
        }
      }

      // NOUVEAU - Delete associated promotion images from disk
      if (storeInfo.promotionImages && storeInfo.promotionImages.length > 0) {
        for (const image of storeInfo.promotionImages) {
          const imagePath = path.join(__dirname, '..', image.url);
          try {
            await fs.unlink(imagePath);
            console.log('Promotion image deleted:', imagePath);
          } catch (err) {
            console.error('Failed to delete promotion image:', err);
          }
        }
      }

      // Delete store info and associated images
      await Image.destroy({ where: { idStoreInfo: storeInfo.idStoreInfo } });
      await storeInfo.destroy();

      res.status(200).json({ message: 'Informations du magasin supprimées avec succès' });
    } catch (error) {
      console.error('Delete store info error:', error);
      res.status(500).json({
        message: 'Erreur lors de la suppression des informations du magasin',
        error: error.message,
      });
    }
  }

}

module.exports = new StoreInfoController();