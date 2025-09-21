const { Couleur } = require('../models');
class CouleurController {
  // CREATE
  async create(req, res) {
    try {
      const { nom } = req.body;
      const couleur = await Couleur.create({ nom });
      res.status(201).json(couleur);
    } catch (err) {
      res.status(500).json({ message: "Erreur création couleur", error: err.message });
    }
  }
  // GET ALL
  async getAll(req, res) {
    try {
      const couleurs = await Couleur.findAll();
      res.status(200).json(couleurs);
    } catch (err) {
      res.status(500).json({ message: "Erreur récupération couleurs", error: err.message });
    }
  }
  // GET BY ID
  async getById(req, res) {
    try {
      const couleur = await Couleur.findByPk(req.params.id);
      if (!couleur) return res.status(404).json({ message: "Couleur non trouvée" });
      res.status(200).json(couleur);
    } catch (err) {
      res.status(500).json({ message: "Erreur récupération couleur", error: err.message });
    }
  }
  // UPDATE
  async edit(req, res) {
    try {
      const couleur = await Couleur.findByPk(req.params.id);
      if (!couleur) return res.status(404).json({ message: "Couleur non trouvée" });
      await couleur.update({ nom: req.body.nom });
      res.status(200).json(couleur);
    } catch (err) {
      res.status(500).json({ message: "Erreur modification couleur", error: err.message });
    }
  }
  // DELETE
  async delete(req, res) {
    try {
      const couleur = await Couleur.findByPk(req.params.id);
      if (!couleur) return res.status(404).json({ message: "Couleur non trouvée" });
      await couleur.destroy();
      res.status(200).json({ message: "Couleur supprimée" });
    } catch (err) {
      res.status(500).json({ message: "Erreur suppression couleur", error: err.message });
    }
  }
}
module.exports = new CouleurController();