const { Produit, Categorie, Marque, Type, Image, Fournisseur, LigneCommande } = require('../models');
const upload = require('../multerConfig');
const path = require('path');
const fs = require('fs').promises;
const { Sequelize, Op } = require('sequelize');

class ProduitController {
  static uploadImages = upload.array('images', 10); // 'images' field name, max 10 files

  async createProduit(req, res) {
    ProduitController.uploadImages(req, res, async (err) => {
      if (err) {
        console.error('Upload error:', err);
        return res.status(400).json({
          message: 'Erreur lors du téléchargement des images',
          error: err.message,
        });
      }
      try {
        const { nom, description, prix, quantiteStock, idCategorie, idMarque, idFournisseur, idType, minAge, maxAge, typeAge, genre } = req.body;

        // Create product without images
        const produit = await Produit.create({
          nom,
          description,
          prix: nom ? parseFloat(prix) : null,
          quantiteStock: parseInt(quantiteStock),
          idCategorie: parseInt(idCategorie),
          idMarque: parseInt(idMarque),
          idType: idType ? parseInt(idType) : null,
          idFournisseur: parseInt(idFournisseur),
          minAge,
          maxAge,
          typeAge,
          genre,
        });

        // Save images to Image model
        if (req.files && Array.isArray(req.files)) {
          const images = req.files.map((file, index) => ({
            url: `/Uploads/${file.filename}`,
            rang: index + 1,
            idProduit: produit.idProduit,
          }));
          await Image.bulkCreate(images);
        }

        // Fetch the created product with associations
        const createdProduit = await Produit.findByPk(produit.idProduit, {
          include: [
            { model: Categorie, as: 'categorie', attributes: ['idCategorie', 'nom'] },
            { model: Marque, as: 'marque', attributes: ['idMarque', 'nom'] },
            { model: Type, as: 'type', attributes: ['idType', 'nom'] },
            { model: Fournisseur, as: 'fournisseur', attributes: ['idFournisseur', 'nom'] },
            { model: Image, as: 'images', attributes: ['idImage', 'url', 'rang'], order: [['rang', 'ASC']] },
          ],
        });

        res.status(201).json({
          message: 'Produit créé avec succès',
          data: createdProduit,
        });
      } catch (error) {
        console.error('Create produit error:', error);
        res.status(500).json({
          message: 'Erreur lors de la création du produit',
          error: error.message,
        });
      }
    });
  }

  async getAllProduits(req, res) {
    try {
      const produits = await Produit.findAll({
        include: [
          { model: Categorie, as: 'categorie', attributes: ['idCategorie', 'nom'] },
          { model: Marque, as: 'marque', attributes: ['idMarque', 'nom'] },
          { model: Type, as: 'type', attributes: ['idType', 'nom'] },
          { model: Fournisseur, as: 'fournisseur', attributes: ['idFournisseur', 'nom'] },
          { 
            model: Image, 
            as: 'images', 
            attributes: ['idImage', 'url', 'rang'],
            order: [['rang', 'ASC']]
          },
        ],
      });
      res.status(200).json(produits);
    } catch (error) {
      console.error('Get all produits error:', error);
      res.status(500).json({
        message: 'Erreur lors de la récupération des produits',
        error: error.message,
      });
    }
  }

  async getProduitById(req, res) {
    try {
      const produit = await Produit.findByPk(req.params.id, {
        include: [
          { model: Categorie, as: 'categorie', attributes: ['idCategorie', 'nom'] },
          { model: Marque, as: 'marque', attributes: ['idMarque', 'nom'] },
          { model: Type, as: 'type', attributes: ['idType', 'nom'] },
          { model: Fournisseur, as: 'fournisseur', attributes: ['idFournisseur', 'nom'] },
          { 
            model: Image, 
            as: 'images', 
            attributes: ['idImage', 'url', 'rang'],
            order: [['rang', 'ASC']]
          },
        ],
      });
      if (!produit) {
        return res.status(404).json({ message: 'Produit non trouvé' });
      }
      res.status(200).json(produit);
    } catch (error) {
      console.error('Get produit by ID error:', error);
      res.status(500).json({
        message: 'Erreur lors de la récupération du produit',
        error: error.message,
      });
    }
  }

  async getTop10BestSellingProduits(req, res) {
    try {
      const produits = await Produit.findAll({
        attributes: [
          'idProduit',
          'nom',
          'description',
          'prix',
          'quantiteStock',
          'idCategorie',
          'idMarque',
          'idType',
          'idFournisseur',
          'minAge',
          'maxAge',
          'typeAge',
          'genre',
          [Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.col('lignesCommandes.quantite')), 0), 'totalVendu'],
        ],
        include: [
          {
            model: LigneCommande,
            as: 'lignesCommandes',
            attributes: [],
            required: false,
          },
          { model: Categorie, as: 'categorie', attributes: ['idCategorie', 'nom'] },
          { model: Marque, as: 'marque', attributes: ['idMarque', 'nom'] },
          { model: Type, as: 'type', attributes: ['idType', 'nom'] },
          { model: Fournisseur, as: 'fournisseur', attributes: ['idFournisseur', 'nom'] },
          { 
            model: Image, 
            as: 'images', 
            attributes: ['idImage', 'url', 'rang'],
            separate: true,
            order: [['rang', 'ASC']],
          },
        ],
        group: [
          'Produit.idProduit',
          'categorie.idCategorie',
          'marque.idMarque',
          'type.idType', 
          'fournisseur.idFournisseur'
        ],
        order: [[Sequelize.literal('totalVendu'), 'DESC']],
        limit: 10,
        subQuery: false,
      });

      res.status(200).json({
        message: 'Top 10 des produits les plus vendus récupérés avec succès',
        data: produits,
      });
    } catch (error) {
      console.error('Get top 10 best selling produits error:', error);
      res.status(500).json({
        message: 'Erreur lors de la récupération des produits les plus vendus',
        error: error.message,
      });
    }
  }

  async updateProduit(req, res) {
    ProduitController.uploadImages(req, res, async (err) => {
      if (err) {
        console.error('Upload error:', err);
        return res.status(400).json({
          message: 'Erreur lors du téléchargement des images',
          error: err.message,
        });
      }
      try {
        const produit = await Produit.findByPk(req.params.id, {
          include: [{ model: Image, as: 'images' }],
        });
        if (!produit) {
          return res.status(404).json({ message: 'Produit non trouvé' });
        }

        const { 
          nom, 
          description, 
          prix, 
          quantiteStock, 
          idCategorie, 
          idMarque, 
          idType, 
          idFournisseur,
          minAge,
          maxAge,
          typeAge,
          genre,
          imagesToDelete,
          imageRangs
        } = req.body;

        // Update product data
        await produit.update({
          nom,
          description,
          prix: parseFloat(prix),
          quantiteStock: parseInt(quantiteStock),
          idCategorie: parseInt(idCategorie),
          idMarque: parseInt(idMarque),
          idType: idType ? parseInt(idType) : null,
          idFournisseur: parseInt(idFournisseur),
          minAge,
          maxAge,
          typeAge,
          genre,
        });

        // Handle image deletions if specified
        if (imagesToDelete && Array.isArray(imagesToDelete) && imagesToDelete.length > 0) {
          const imagesToDeleteParsed = imagesToDelete.map(id => parseInt(id));
          const imagesToDeleteFromDb = await Image.findAll({
            where: { 
              idImage: imagesToDeleteParsed,
              idProduit: produit.idProduit 
            }
          });

          // Delete images from disk
          for (const image of imagesToDeleteFromDb) {
            const imagePath = path.join(__dirname, '..', image.url);
            try {
              await fs.unlink(imagePath);
              console.log('Image deleted from disk:', imagePath);
            } catch (err) {
              console.error('Failed to delete image from disk:', err);
            }
          }

          // Delete images from database
          await Image.destroy({
            where: { 
              idImage: imagesToDeleteParsed,
              idProduit: produit.idProduit 
            }
          });
        }

        // Update existing image ranks if provided
        if (imageRangs && typeof imageRangs === 'object') {
          for (const [imageId, newRang] of Object.entries(imageRangs)) {
            await Image.update(
              { rang: parseInt(newRang) },
              { 
                where: { 
                  idImage: parseInt(imageId),
                  idProduit: produit.idProduit 
                }
              }
            );
          }
        }

        // Add new images if provided
        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
          // Get the highest existing rang
          const existingImages = await Image.findAll({
            where: { idProduit: produit.idProduit },
            order: [['rang', 'DESC']],
            limit: 1
          });
          
          const maxRang = existingImages.length > 0 ? existingImages[0].rang : 0;

          // Create new images with incremental rang
          const newImages = req.files.map((file, index) => ({
            url: `/Uploads/${file.filename}`,
            rang: maxRang + index + 1,
            idProduit: produit.idProduit,
          }));
          
          await Image.bulkCreate(newImages);
        }

        // Fetch updated product with associations
        const updatedProduit = await Produit.findByPk(produit.idProduit, {
          include: [
            { model: Categorie, as: 'categorie', attributes: ['idCategorie', 'nom'] },
            { model: Marque, as: 'marque', attributes: ['idMarque', 'nom'] },
            { model: Type, as: 'type', attributes: ['idType', 'nom'] },
            { model: Fournisseur, as: 'fournisseur', attributes: ['idFournisseur', 'nom'] },
            { 
              model: Image, 
              as: 'images', 
              attributes: ['idImage', 'url', 'rang'],
              order: [['rang', 'ASC']]
            },
          ],
        });

        res.status(200).json({
          message: 'Produit mis à jour avec succès',
          data: updatedProduit,
        });
      } catch (error) {
        console.error('Update produit error:', error);
        res.status(500).json({
          message: 'Erreur lors de la mise à jour du produit',
          error: error.message,
        });
      }
    });
  }

  async deleteImage(req, res) {
    try {
      const { imageId } = req.params;
      const image = await Image.findByPk(imageId);
      
      if (!image) {
        return res.status(404).json({ message: 'Image non trouvée' });
      }

      // Delete image from disk
      const imagePath = path.join(__dirname, '..', image.url);
      try {
        await fs.unlink(imagePath);
        console.log('Image deleted from disk:', imagePath);
      } catch (err) {
        console.error('Failed to delete image from disk:', err);
      }

      // Delete image from database
      await image.destroy();

      res.status(200).json({ message: 'Image supprimée avec succès' });
    } catch (error) {
      console.error('Delete image error:', error);
      res.status(500).json({
        message: 'Erreur lors de la suppression de l\'image',
        error: error.message,
      });
    }
  }

  async deleteProduit(req, res) {
    try {
      const produit = await Produit.findByPk(req.params.id, {
        include: [{ model: Image, as: 'images' }],
      });
      if (!produit) {
        return res.status(404).json({ message: 'Produit non trouvé' });
      }

      // Delete associated images from disk
      if (produit.images && produit.images.length > 0) {
        for (const image of produit.images) {
          const imagePath = path.join(__dirname, '..', image.url);
          try {
            await fs.unlink(imagePath);
            console.log('Image deleted:', imagePath);
          } catch (err) {
            console.error('Failed to delete image:', err);
          }
        }
      }

      await produit.destroy();
      res.status(200).json({ message: 'Produit supprimé avec succès' });
    } catch (error) {
      console.error('Delete produit error:', error);
      res.status(500).json({
        message: 'Erreur lors de la suppression du produit',
        error: error.message,
      });
    }
  }
}

module.exports = new ProduitController();