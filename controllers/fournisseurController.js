const { Fournisseur } = require('../models');

class FournisseurController {
  static async createFournisseur(req, res) {
    try {
      const { prenom, nom, email, telephone } = req.body;
      console.log('Request body:', req.body);

      const fournisseur = await Fournisseur.create({
        prenom,
        nom,
        email,
        telephone,
      });

      console.log('Fournisseur créé:', fournisseur);

      res.status(201).json({
        message: 'Fournisseur créé avec succès',
        data: fournisseur,
      });
    } catch (error) {
      console.error('Create fournisseur error:', error);
      res.status(500).json({
        message: 'Erreur lors de la création du fournisseur',
        error: error.message,
      });
    }
  }

  static async getAllFournisseurs(req, res) {
    try {
      const fournisseurs = await Fournisseur.findAll();
      console.log('Fournisseurs récupérés:', fournisseurs.length);
      res.status(200).json(fournisseurs);
    } catch (error) {
      console.error('Get all fournisseurs error:', error);
      res.status(500).json({
        message: 'Erreur lors de la récupération des fournisseurs',
        error: error.message,
      });
    }
  }

  static async getFournisseurById(req, res) {
    try {
      const fournisseur = await Fournisseur.findByPk(req.params.id);
      if (!fournisseur) {
        return res.status(404).json({ message: 'Fournisseur non trouvé' });
      }
      console.log('Fournisseur récupéré par ID:', fournisseur);
      res.status(200).json(fournisseur);
    } catch (error) {
      console.error('Get fournisseur by ID error:', error);
      res.status(500).json({
        message: 'Erreur lors de la récupération du fournisseur',
        error: error.message,
      });
    }
  }

  static async updateFournisseur(req, res) {
    try {
      const fournisseur = await Fournisseur.findByPk(req.params.id);
      if (!fournisseur) {
        return res.status(404).json({ message: 'Fournisseur non trouvé' });
      }

      const { prenom, nom, email, telephone } = req.body;
      console.log('Update data:', { prenom, nom, email, telephone });

      const updatedFournisseur = await fournisseur.update({ prenom, nom, email, telephone });

      console.log('Fournisseur mis à jour:', updatedFournisseur);

      res.status(200).json({ 
        message: 'Fournisseur mis à jour avec succès', 
        data: updatedFournisseur 
      });
    } catch (error) {
      console.error('Update fournisseur error:', error);
      res.status(500).json({ 
        message: 'Erreur lors de la mise à jour du fournisseur', 
        error: error.message 
      });
    }
  }

  static async deleteFournisseur(req, res) {
    try {
      const fournisseur = await Fournisseur.findByPk(req.params.id);
      if (!fournisseur) {
        return res.status(404).json({ message: 'Fournisseur non trouvé' });
      }

      await fournisseur.destroy();

      console.log('Fournisseur supprimé:', req.params.id);

      res.status(200).json({ message: 'Fournisseur supprimé avec succès' });
    } catch (error) {
      console.error('Delete fournisseur error:', error);
      res.status(500).json({ 
        message: 'Erreur lors de la suppression du fournisseur', 
        error: error.message 
      });
    }
  }
}

module.exports = FournisseurController;