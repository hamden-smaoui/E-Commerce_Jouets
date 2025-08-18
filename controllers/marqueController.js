const { Marque, Produit } = require('../models');
const upload = require('../multerConfig');
const path = require('path');
const fs = require('fs').promises;

class MarqueController {
  // Middleware for single file upload
  static uploadLogo = upload.single('logo'); // 'logo' is the field name in the form

  static async createMarque(req, res) {
    MarqueController.uploadLogo(req, res, async (err) => {
      if (err) {
        console.error('Upload error:', err);
        return res.status(400).json({
          message: 'Erreur lors du téléchargement du logo',
          error: err.message,
        });
      }
      try {
        const { nom, description } = req.body;
        console.log('Request body:', req.body);
        console.log('Uploaded file:', req.file);
        
        const logoUrl = req.file ? `/uploads/${req.file.filename}` : null;

        const marque = await Marque.create({
          nom,
          description,
          logoUrl,
        });

        console.log('Marque créée:', marque);

        res.status(201).json({
          message: 'Marque créée avec succès',
          data: marque,
        });
      } catch (error) {
        console.error('Create marque error:', error);
        res.status(500).json({
          message: 'Erreur lors de la création de la marque',
          error: error.message,
        });
      }
    });
  }

  static async getAllMarques(req, res) {
    try {
      const marques = await Marque.findAll({
        include: [{
          model: Produit,
          as: 'produits',
          attributes: ['idProduit', 'nom', 'prix'],
        }],
      });
      console.log('Marques récupérées:', marques.length);
      res.status(200).json(marques);
    } catch (error) {
      console.error('Get all marques error:', error);
      res.status(500).json({
        message: 'Erreur lors de la récupération des marques',
        error: error.message,
      });
    }
  }

  static async getMarqueById(req, res) {
    try {
      const marque = await Marque.findByPk(req.params.id, {
        include: [{
          model: Produit,
          as: 'produits',
          attributes: ['idProduit', 'nom', 'prix'],
        }],
      });
      if (!marque) {
        return res.status(404).json({ message: 'Marque non trouvée' });
      }
      console.log('Marque récupérée par ID:', marque);
      res.status(200).json(marque);
    } catch (error) {
      console.error('Get marque by ID error:', error);
      res.status(500).json({
        message: 'Erreur lors de la récupération de la marque',
        error: error.message,
      });
    }
  }

  static async updateMarque(req, res) {
    MarqueController.uploadLogo(req, res, async (err) => {
      if (err) {
        console.error('Upload error:', err);
        return res.status(400).json({ 
          message: 'Erreur lors du téléchargement du logo', 
          error: err.message 
        });
      }
      try {
        const marque = await Marque.findByPk(req.params.id);
        if (!marque) {
          return res.status(404).json({ message: 'Marque non trouvée' });
        }

        const oldLogoUrl = marque.logoUrl;
        const { nom, description } = req.body;
        console.log('Update data:', { nom, description, file: req.file });
        
        const logoUrl = req.file ? `/uploads/${req.file.filename}` : marque.logoUrl;

        const updatedMarque = await marque.update({ nom, description, logoUrl });

        // Delete old logo file if a new one was uploaded
        if (req.file && oldLogoUrl) {
          const oldLogoPath = path.join(__dirname, '..', oldLogoUrl);
          try {
            await fs.unlink(oldLogoPath);
            console.log('Old logo deleted:', oldLogoPath);
          } catch (err) {
            console.error('Failed to delete old logo:', err);
          }
        }

        console.log('Marque mise à jour:', updatedMarque);

        res.status(200).json({ 
          message: 'Marque mise à jour avec succès', 
          data: updatedMarque 
        });
      } catch (error) {
        console.error('Update marque error:', error);
        res.status(500).json({ 
          message: 'Erreur lors de la mise à jour de la marque', 
          error: error.message 
        });
      }
    });
  }

  static async deleteMarque(req, res) {
    try {
      const marque = await Marque.findByPk(req.params.id);
      if (!marque) {
        return res.status(404).json({ message: 'Marque non trouvée' });
      }

      const logoUrl = marque.logoUrl;
      await marque.destroy();

      // Delete logo file if it exists
      if (logoUrl) {
        const logoPath = path.join(__dirname, '..', logoUrl);
        try {
          await fs.unlink(logoPath);
          console.log('Logo deleted:', logoPath);
        } catch (err) {
          console.error('Failed to delete logo:', err);
        }
      }

      console.log('Marque supprimée:', req.params.id);

      res.status(200).json({ message: 'Marque supprimée avec succès' });
    } catch (error) {
      console.error('Delete marque error:', error);
      res.status(500).json({ 
        message: 'Erreur lors de la suppression de la marque', 
        error: error.message 
      });
    }
  }
}

module.exports = MarqueController;