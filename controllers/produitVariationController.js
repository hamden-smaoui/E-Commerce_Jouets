const { ProduitVariation, Couleur, Taille, Age } = require('../models');

class ProduitVariationController {
  // CREATE
  async create(req, res) {
    try {
      const { idProduit, idCouleur, idTaille, idAge, quantiteStock } = req.body;
      const variant = await ProduitVariation.create({
        idProduit, idCouleur, idTaille: idTaille || null, idAge: idAge || null, quantiteStock
      });
      res.status(201).json(variant);
    } catch (err) {
      res.status(500).json({ message: "Erreur création variation", error: err.message });
    }
  }

  // GET ALL
  async getAll(req, res) {
    try {
      const variants = await ProduitVariation.findAll({
        include: [
          { model: Couleur, as: 'couleur' },
          { model: Taille, as: 'taille' },
          { model: Age, as: 'age' }
        ]
      });
      res.status(200).json(variants);
    } catch (err) {
      res.status(500).json({ message: "Erreur récupération variations", error: err.message });
    }
  }

  // GET BY ID
  async getById(req, res) {
    try {
      const variant = await ProduitVariation.findByPk(req.params.id, {
        include: [
          { model: Couleur, as: 'couleur' },
          { model: Taille, as: 'taille' },
          { model: Age, as: 'age' }
        ]
      });
      if (!variant) return res.status(404).json({ message: "Variation non trouvée" });
      res.status(200).json(variant);
    } catch (err) {
      res.status(500).json({ message: "Erreur récupération variation", error: err.message });
    }
  }

  // UPDATE
  async edit(req, res) {
    try {
      const variant = await ProduitVariation.findByPk(req.params.id);
      if (!variant) return res.status(404).json({ message: "Variation non trouvée" });
      const { idCouleur, idTaille, idAge, quantiteStock } = req.body;
      await variant.update({ idCouleur, idTaille, idAge, quantiteStock });
      res.status(200).json(variant);
    } catch (err) {
      res.status(500).json({ message: "Erreur modification variation", error: err.message });
    }
  }

  // DELETE
  async delete(req, res) {
    try {
      const variant = await ProduitVariation.findByPk(req.params.id);
      if (!variant) return res.status(404).json({ message: "Variation non trouvée" });
      await variant.destroy();
      res.status(200).json({ message: "Variation supprimée" });
    } catch (err) {
      res.status(500).json({ message: "Erreur suppression variation", error: err.message });
    }
  }
}
module.exports = new ProduitVariationController();