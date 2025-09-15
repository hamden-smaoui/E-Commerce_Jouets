const { Produit, Categorie, Marque, Type, Image, Fournisseur, LigneCommande, Avis, Utilisateur, Commentaire } = require('../models');
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
          { 
    model: Avis, 
    as: 'avis',
    include: [{ model: Utilisateur, as: 'utilisateur', attributes: ['prenom', 'nom'] }]
  },
  { 
    model: Commentaire, 
    as: 'commentaires',
    include: [{ model: Utilisateur, as: 'utilisateur', attributes: ['prenom', 'nom'] }],
    limit: 5, // Limiter à 5 commentaires récents
    order: [['createdAt', 'DESC']]
  }
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
searchProduits = async (req, res) => {
  try {
    const { q, category, marque, type, minPrice, maxPrice, page = 1, limit = 12 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        message: 'Le terme de recherche doit contenir au moins 2 caractères',
      });
    }

    const offset = (page - 1) * limit;
    const searchTerm = q.trim();

    // Construction des conditions de recherche améliorées
    const whereConditions = {
      [Op.or]: [
        // Recherche dans le nom et description du produit
        { nom: { [Op.like]: `%${searchTerm}%` } },
        { description: { [Op.like]: `%${searchTerm}%` } },
        // Recherche dans les catégories associées
        { '$categorie.nom$': { [Op.like]: `%${searchTerm}%` } },
        // Recherche dans les marques associées
        { '$marque.nom$': { [Op.like]: `%${searchTerm}%` } },
        // Recherche dans les types associés
        { '$type.nom$': { [Op.like]: `%${searchTerm}%` } },
      ],
    };

    // Filtres supplémentaires
    if (minPrice && maxPrice) {
      whereConditions.prix = { [Op.between]: [parseFloat(minPrice), parseFloat(maxPrice)] };
    }

    const includeConditions = [
      {
        model: Categorie,
        as: 'categorie',
        attributes: ['idCategorie', 'nom'],
        where: category ? { nom: { [Op.like]: `%${category}%` } } : undefined,
        required: false, // Important: permet de chercher même si pas de correspondance exacte
      },
      {
        model: Marque,
        as: 'marque',
        attributes: ['idMarque', 'nom'],
        where: marque ? { nom: { [Op.like]: `%${marque}%` } } : undefined,
        required: false,
      },
      {
        model: Type,
        as: 'type',
        attributes: ['idType', 'nom'],
        where: type ? { nom: { [Op.like]: `%${type}%` } } : undefined,
        required: false,
      },
      { 
        model: Fournisseur, 
        as: 'fournisseur', 
        attributes: ['idFournisseur', 'nom'],
        required: false 
      },
      {
        model: Image,
        as: 'images',
        attributes: ['idImage', 'url', 'rang'],
        separate: true,
        order: [['rang', 'ASC']],
      },
    ];

    const { count, rows: produits } = await Produit.findAndCountAll({
      where: whereConditions,
      include: includeConditions,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [
        // Priorité aux correspondances exactes dans le nom du produit
        [
          Sequelize.literal(`
            CASE 
              WHEN LOWER(Produit.nom) LIKE '${searchTerm.toLowerCase()}%' THEN 1
              WHEN LOWER(Produit.nom) LIKE '%${searchTerm.toLowerCase()}%' THEN 2
              WHEN LOWER(categorie.nom) LIKE '${searchTerm.toLowerCase()}%' THEN 3
              WHEN LOWER(marque.nom) LIKE '${searchTerm.toLowerCase()}%' THEN 4
              WHEN LOWER(type.nom) LIKE '${searchTerm.toLowerCase()}%' THEN 5
              ELSE 6
            END
          `),
          'ASC'
        ],
        ['nom', 'ASC'],
      ],
      distinct: true,
      subQuery: false,
      logging: console.log,
    });

    // Suggestions de recherche améliorées
    const suggestions = await this.generateAdvancedSearchSuggestions(searchTerm, produits);

    // Statistiques de recherche
    const searchStats = {
      byCategory: await this.getSearchStatsByCategory(searchTerm),
      byBrand: await this.getSearchStatsByBrand(searchTerm),
      byType: await this.getSearchStatsByType(searchTerm),
    };

    res.status(200).json({
      data: produits,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        hasNext: page * limit < count,
        hasPrev: page > 1,
      },
      suggestions,
      searchTerm,
      searchStats,
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      message: 'Erreur lors de la recherche',
      error: error.message,
    });
  }
};

// Méthode helper pour générer des suggestions avancées
async generateAdvancedSearchSuggestions(searchTerm, results) {
  const suggestions = [];

  // Suggestions basées sur les catégories des résultats
  const categories = [...new Set(results.map(p => p.categorie?.nom).filter(Boolean))];
  const marques = [...new Set(results.map(p => p.marque?.nom).filter(Boolean))];
  const types = [...new Set(results.map(p => p.type?.nom).filter(Boolean))];

  // Suggestions de catégories
  categories.slice(0, 3).forEach(cat => {
    suggestions.push({
      type: 'category',
      text: `${searchTerm} dans ${cat}`,
      query: searchTerm,
      filter: { category: cat },
      count: results.filter(p => p.categorie?.nom === cat).length
    });
  });

  // Suggestions de marques
  marques.slice(0, 3).forEach(marque => {
    suggestions.push({
      type: 'brand',
      text: `${searchTerm} ${marque}`,
      query: searchTerm,
      filter: { marque },
      count: results.filter(p => p.marque?.nom === marque).length
    });
  });

  // Suggestions de types
  types.slice(0, 2).forEach(type => {
    suggestions.push({
      type: 'type',
      text: `${searchTerm} ${type}`,
      query: searchTerm,
      filter: { type },
      count: results.filter(p => p.type?.nom === type).length
    });
  });

  return suggestions;
}

// Nouvelles méthodes pour les statistiques
async getSearchStatsByCategory(searchTerm) {
  const stats = await Produit.findAll({
    attributes: [
      [Sequelize.fn('COUNT', Sequelize.col('Produit.idProduit')), 'count']
    ],
    include: [
      {
        model: Categorie,
        as: 'categorie',
        attributes: ['idCategorie', 'nom'],
        required: true
      }
    ],
    where: {
      [Op.or]: [
        { nom: { [Op.like]: `%${searchTerm}%` } },
        { description: { [Op.like]: `%${searchTerm}%` } },
        { '$categorie.nom$': { [Op.like]: `%${searchTerm}%` } },
      ]
    },
    group: ['categorie.idCategorie', 'categorie.nom'],
    order: [[Sequelize.literal('count'), 'DESC']],
    limit: 5
  });

  return stats.map(stat => ({
    category: stat.categorie.nom,
    count: parseInt(stat.dataValues.count)
  }));
}

async getSearchStatsByBrand(searchTerm) {
  const stats = await Produit.findAll({
    attributes: [
      [Sequelize.fn('COUNT', Sequelize.col('Produit.idProduit')), 'count']
    ],
    include: [
      {
        model: Marque,
        as: 'marque',
        attributes: ['idMarque', 'nom'],
        required: true
      }
    ],
    where: {
      [Op.or]: [
        { nom: { [Op.like]: `%${searchTerm}%` } },
        { description: { [Op.like]: `%${searchTerm}%` } },
        { '$marque.nom$': { [Op.like]: `%${searchTerm}%` } },
      ]
    },
    group: ['marque.idMarque', 'marque.nom'],
    order: [[Sequelize.literal('count'), 'DESC']],
    limit: 5
  });

  return stats.map(stat => ({
    brand: stat.marque.nom,
    count: parseInt(stat.dataValues.count)
  }));
}

async getSearchStatsByType(searchTerm) {
  const stats = await Produit.findAll({
    attributes: [
      [Sequelize.fn('COUNT', Sequelize.col('Produit.idProduit')), 'count']
    ],
    include: [
      {
        model: Type,
        as: 'type',
        attributes: ['idType', 'nom'],
        required: true
      }
    ],
    where: {
      [Op.or]: [
        { nom: { [Op.like]: `%${searchTerm}%` } },
        { description: { [Op.like]: `%${searchTerm}%` } },
        { '$type.nom$': { [Op.like]: `%${searchTerm}%` } },
      ]
    },
    group: ['type.idType', 'type.nom'],
    order: [[Sequelize.literal('count'), 'DESC']],
    limit: 5
  });

  return stats.map(stat => ({
    type: stat.type.nom,
    count: parseInt(stat.dataValues.count)
  }));
}

// Mise à jour de getSearchSuggestions pour inclure catégories, marques et types
async getSearchSuggestions(req, res) {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(200).json([]);
    }

    const searchTerm = q.trim();
    
    // Recherche rapide pour les suggestions (limite à 10 résultats)
    const produits = await Produit.findAll({
      where: {
        [Op.or]: [
          { nom: { [Op.like]: `%${searchTerm}%` } },
          { description: { [Op.like]: `%${searchTerm}%` } },
          { '$categorie.nom$': { [Op.like]: `%${searchTerm}%` } },
          { '$marque.nom$': { [Op.like]: `%${searchTerm}%` } },
          { '$type.nom$': { [Op.like]: `%${searchTerm}%` } },
        ]
      },
      include: [
        { model: Categorie, as: 'categorie', attributes: ['nom'], required: false },
        { model: Marque, as: 'marque', attributes: ['nom'], required: false },
        { model: Type, as: 'type', attributes: ['nom'], required: false }
      ],
      limit: 15,
      attributes: ['nom']
    });

    const suggestions = [];
    const categories = new Set();
    const marques = new Set();
    const types = new Set();

    // Suggestions basées sur les noms de produits
    produits.slice(0, 4).forEach(produit => {
      suggestions.push({
        type: 'product',
        text: produit.nom,
        query: produit.nom
      });
    });

    // Collecter les catégories, marques et types uniques
    produits.forEach(produit => {
      if (produit.categorie && produit.categorie.nom) {
        categories.add(produit.categorie.nom);
      }
      if (produit.marque && produit.marque.nom) {
        marques.add(produit.marque.nom);
      }
      if (produit.type && produit.type.nom) {
        types.add(produit.type.nom);
      }
    });

    // Suggestions de catégories
    Array.from(categories).slice(0, 3).forEach(category => {
      suggestions.push({
        type: 'category',
        text: `${searchTerm} dans ${category}`,
        query: searchTerm,
        filter: { category }
      });
    });

    // Suggestions de marques
    Array.from(marques).slice(0, 2).forEach(marque => {
      suggestions.push({
        type: 'brand',
        text: `${searchTerm} ${marque}`,
        query: searchTerm,
        filter: { marque }
      });
    });

    // Suggestions de types
    Array.from(types).slice(0, 2).forEach(type => {
      suggestions.push({
        type: 'type',
        text: `${searchTerm} ${type}`,
        query: searchTerm,
        filter: { type }
      });
    });

    res.status(200).json(suggestions);
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json([]);
  }
}
}
module.exports = new ProduitController();