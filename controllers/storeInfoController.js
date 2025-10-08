const { StoreInfo, Image } = require('../models');
const upload = require('../multerConfig');
const path = require('path');
const fs = require('fs').promises;

class StoreInfoController {
  static uploadFiles = upload.fields([
    { name: 'heroImages', maxCount: 10 },
    { name: 'promotionImages', maxCount: 10 },
    { name: 'logo1', maxCount: 1 },
    { name: 'logo2', maxCount: 1 }
  ]);

  async createStoreInfo(req, res, next) {
    StoreInfoController.uploadFiles(req, res, async (err) => {
      if (err) {
        const error = new Error('Erreur lors du téléchargement des fichiers');
        error.code = "VALIDATION_ERROR";
        return next(error);
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

        let logo1Path = null;
        let logo2Path = null;

        if (req.files?.logo1 && req.files.logo1[0]) {
          logo1Path = `/Uploads/${req.files.logo1[0].filename}`;
        }
        if (req.files?.logo2 && req.files.logo2[0]) {
          logo2Path = `/Uploads/${req.files.logo2[0].filename}`;
        }

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

        if (req.files?.heroImages && Array.isArray(req.files.heroImages)) {
          const images = req.files.heroImages.map((file, index) => ({
            url: `/Uploads/${file.filename}`,
            rang: index + 1,
            type: 'hero',
            idStoreInfo: storeInfo.idStoreInfo,
          }));
          await Image.bulkCreate(images);
        }

        if (req.files?.promotionImages && Array.isArray(req.files.promotionImages)) {
          const promotionImages = req.files.promotionImages.map((file, index) => ({
            url: `/Uploads/${file.filename}`,
            rang: index + 1,
            type: 'promotion',
            idStoreInfo: storeInfo.idStoreInfo,
          }));
          await Image.bulkCreate(promotionImages);
        }

        const createdStoreInfo = await StoreInfo.findByPk(storeInfo.idStoreInfo, {
          include: [
            { model: Image, as: 'heroImages', where: { type: 'hero' }, attributes: ['idImage', 'url', 'rang', 'type'], order: [['rang', 'ASC']], required: false },
            { model: Image, as: 'promotionImages', where: { type: 'promotion' }, attributes: ['idImage', 'url', 'rang', 'type'], order: [['rang', 'ASC']], required: false }
          ],
        });

        res.status(201).json({
          message: 'Informations du magasin créées avec succès',
          data: createdStoreInfo,
        });
      } catch (error) {
        next(error);
      }
    });
  }

  async updateStoreInfo(req, res, next) {
    StoreInfoController.uploadFiles(req, res, async (err) => {
      if (err) {
        const error = new Error('Erreur lors du téléchargement des fichiers');
        error.code = "VALIDATION_ERROR";
        return next(error);
      }
      try {
        const storeInfo = await StoreInfo.findByPk(req.params.id, {
          include: [
            { model: Image, as: 'heroImages', where: { type: 'hero' }, required: false },
            { model: Image, as: 'promotionImages', where: { type: 'promotion' }, required: false }
          ],
        });
        if (!storeInfo) {
          const error = new Error('Informations du magasin non trouvées');
          error.code = "NOT_FOUND";
          return next(error);
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
          promotionImagesToDelete,
          imageRangs,
          promotionImageRangs,
          tauxTVA,
          seuilLivraisonGratuite,
          fraisLivraison,
          entrepriseSiret,
        } = req.body;

        let parsedImagesToDelete = [];
        let parsedPromotionImagesToDelete = [];
        let parsedImageRangs = {};
        let parsedPromotionImageRangs = {};

        if (imagesToDelete) {
          try { parsedImagesToDelete = typeof imagesToDelete === 'string' ? JSON.parse(imagesToDelete) : imagesToDelete; } catch { parsedImagesToDelete = []; }
        }
        if (promotionImagesToDelete) {
          try { parsedPromotionImagesToDelete = typeof promotionImagesToDelete === 'string' ? JSON.parse(promotionImagesToDelete) : promotionImagesToDelete; } catch { parsedPromotionImagesToDelete = []; }
        }
        if (imageRangs) {
          try { parsedImageRangs = typeof imageRangs === 'string' ? JSON.parse(imageRangs) : imageRangs; } catch { parsedImageRangs = {}; }
        }
        if (promotionImageRangs) {
          try { parsedPromotionImageRangs = typeof promotionImageRangs === 'string' ? JSON.parse(promotionImageRangs) : promotionImageRangs; } catch { parsedPromotionImageRangs = {}; }
        }

        let logo1Path = storeInfo.logo1; 
        let logo2Path = storeInfo.logo2;

        if (req.files?.logo1 && req.files.logo1[0]) {
          if (storeInfo.logo1) {
            const oldLogo1Path = path.join(__dirname, '..', storeInfo.logo1);
            try { await fs.unlink(oldLogo1Path); } catch {}
          }
          logo1Path = `/Uploads/${req.files.logo1[0].filename}`;
        }
        if (req.files?.logo2 && req.files.logo2[0]) {
          if (storeInfo.logo2) {
            const oldLogo2Path = path.join(__dirname, '..', storeInfo.logo2);
            try { await fs.unlink(oldLogo2Path); } catch {}
          }
          logo2Path = `/Uploads/${req.files.logo2[0].filename}`;
        }

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

        // Hero image deletions
        if (parsedImagesToDelete && Array.isArray(parsedImagesToDelete) && parsedImagesToDelete.length > 0) {
          const imagesToDeleteParsed = parsedImagesToDelete.map(id => parseInt(id));
          const imagesToDeleteFromDb = await Image.findAll({
            where: { idImage: imagesToDeleteParsed, idStoreInfo: storeInfo.idStoreInfo, type: 'hero' },
          });
          for (const image of imagesToDeleteFromDb) {
            const imagePath = path.join(__dirname, '..', image.url);
            try { await fs.unlink(imagePath); } catch {}
          }
          await Image.destroy({ where: { idImage: imagesToDeleteParsed, idStoreInfo: storeInfo.idStoreInfo, type: 'hero' } });
        }

        // Promotion image deletions
        if (parsedPromotionImagesToDelete && Array.isArray(parsedPromotionImagesToDelete) && parsedPromotionImagesToDelete.length > 0) {
          const promotionImagesToDeleteParsed = parsedPromotionImagesToDelete.map(id => parseInt(id));
          const promotionImagesToDeleteFromDb = await Image.findAll({
            where: { idImage: promotionImagesToDeleteParsed, idStoreInfo: storeInfo.idStoreInfo, type: 'promotion' },
          });
          for (const image of promotionImagesToDeleteFromDb) {
            const imagePath = path.join(__dirname, '..', image.url);
            try { await fs.unlink(imagePath); } catch {}
          }
          await Image.destroy({ where: { idImage: promotionImagesToDeleteParsed, idStoreInfo: storeInfo.idStoreInfo, type: 'promotion' } });
        }

        if (parsedImageRangs && typeof parsedImageRangs === 'object') {
          for (const [imageId, newRang] of Object.entries(parsedImageRangs)) {
            await Image.update(
              { rang: parseInt(newRang) },
              { where: { idImage: parseInt(imageId), idStoreInfo: storeInfo.idStoreInfo, type: 'hero' } }
            );
          }
        }

        if (parsedPromotionImageRangs && typeof parsedPromotionImageRangs === 'object') {
          for (const [imageId, newRang] of Object.entries(parsedPromotionImageRangs)) {
            await Image.update(
              { rang: parseInt(newRang) },
              { where: { idImage: parseInt(imageId), idStoreInfo: storeInfo.idStoreInfo, type: 'promotion' } }
            );
          }
        }

        if (req.files?.heroImages && Array.isArray(req.files.heroImages) && req.files.heroImages.length > 0) {
          const existingHeroImages = await Image.findAll({ where: { idStoreInfo: storeInfo.idStoreInfo, type: 'hero' }, order: [['rang', 'DESC']], limit: 1 });
          const maxHeroRang = existingHeroImages.length > 0 ? existingHeroImages[0].rang : 0;
          const newHeroImages = req.files.heroImages.map((file, index) => ({
            url: `/Uploads/${file.filename}`,
            rang: maxHeroRang + index + 1,
            type: 'hero',
            idStoreInfo: storeInfo.idStoreInfo,
          }));
          await Image.bulkCreate(newHeroImages);
        }

        if (req.files?.promotionImages && Array.isArray(req.files.promotionImages) && req.files.promotionImages.length > 0) {
          const existingPromotionImages = await Image.findAll({ where: { idStoreInfo: storeInfo.idStoreInfo, type: 'promotion' }, order: [['rang', 'DESC']], limit: 1 });
          const maxPromotionRang = existingPromotionImages.length > 0 ? existingPromotionImages[0].rang : 0;
          const newPromotionImages = req.files.promotionImages.map((file, index) => ({
            url: `/Uploads/${file.filename}`,
            rang: maxPromotionRang + index + 1,
            type: 'promotion',
            idStoreInfo: storeInfo.idStoreInfo,
          }));
          await Image.bulkCreate(newPromotionImages);
        }

        const updatedStoreInfo = await StoreInfo.findByPk(storeInfo.idStoreInfo, {
          include: [
            { model: Image, as: 'heroImages', where: { type: 'hero' }, attributes: ['idImage', 'url', 'rang', 'type'], order: [['rang', 'ASC']], required: false },
            { model: Image, as: 'promotionImages', where: { type: 'promotion' }, attributes: ['idImage', 'url', 'rang', 'type'], order: [['rang', 'ASC']], required: false },
          ],
        });

        res.status(200).json({
          message: 'Informations du magasin mises à jour avec succès',
          data: updatedStoreInfo,
        });
      } catch (error) {
        next(error);
      }
    });
  }

  async getStoreInfo(req, res, next) {
    try {
      const storeInfo = await StoreInfo.findOne({
        include: [
          { model: Image, as: 'heroImages', where: { type: 'hero' }, attributes: ['idImage', 'url', 'rang', 'type'], order: [['rang', 'ASC']], required: false },
          { model: Image, as: 'promotionImages', where: { type: 'promotion' }, attributes: ['idImage', 'url', 'rang', 'type'], order: [['rang', 'ASC']], required: false },
        ],
      });
      if (!storeInfo) {
        const error = new Error('Informations du magasin non trouvées');
        error.code = "NOT_FOUND";
        return next(error);
      }
      res.status(200).json(storeInfo);
    } catch (error) {
      next(error);
    }
  }

  async deleteStoreInfo(req, res, next) {
    try {
      const storeInfo = await StoreInfo.findByPk(req.params.id, {
        include: [
          { model: Image, as: 'heroImages', where: { type: 'hero' }, required: false },
          { model: Image, as: 'promotionImages', where: { type: 'promotion' }, required: false }
        ],
      });
      if (!storeInfo) {
        const error = new Error('Informations du magasin non trouvées');
        error.code = "NOT_FOUND";
        return next(error);
      }

      if (storeInfo.logo1) {
        const logo1Path = path.join(__dirname, '..', storeInfo.logo1);
        try { await fs.unlink(logo1Path); } catch {}
      }
      if (storeInfo.logo2) {
        const logo2Path = path.join(__dirname, '..', storeInfo.logo2);
        try { await fs.unlink(logo2Path); } catch {}
      }
      if (storeInfo.heroImages && storeInfo.heroImages.length > 0) {
        for (const image of storeInfo.heroImages) {
          const imagePath = path.join(__dirname, '..', image.url);
          try { await fs.unlink(imagePath); } catch {}
        }
      }
      if (storeInfo.promotionImages && storeInfo.promotionImages.length > 0) {
        for (const image of storeInfo.promotionImages) {
          const imagePath = path.join(__dirname, '..', image.url);
          try { await fs.unlink(imagePath); } catch {}
        }
      }
      await Image.destroy({ where: { idStoreInfo: storeInfo.idStoreInfo } });
      await storeInfo.destroy();
      res.status(200).json({ message: 'Informations du magasin supprimées avec succès' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new StoreInfoController();