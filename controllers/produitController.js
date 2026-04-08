const { Produit, Categorie, Marque, Type, Image, Fournisseur, LigneCommande, Avis, Utilisateur, Commentaire, ProduitVariation, Couleur, Taille, Age } = require('../models');
const upload = require('../multerConfig');
const { cloudinary } = require('../config/cloudinary');
const { Sequelize, Op } = require('sequelize');

class ProduitController {
  static uploadImages = upload.array('images', 10);

  async createProduit(req, res, next) {
    ProduitController.uploadImages(req, res, async (err) => {
      if (err) {
        const error = new Error('Erreur lors du téléchargement des images');
        error.code = "VALIDATION_ERROR";
        return next(error);
      }

      try {
        const {
          nom,
          description,
          prix,
          quantiteStock,
          idCategorie,
          idMarque,
          idFournisseur,
          idType,
          idAge,
          genre,
          isActive,
          livraisonGratuite,
          variants,
          imageColors
        } = req.body;

        const produit = await Produit.create({
          nom,
          description,
          prix: parseFloat(prix),
          quantiteStock: parseInt(quantiteStock),
          idCategorie: parseInt(idCategorie),
          idMarque: parseInt(idMarque),
          idType: idType ? parseInt(idType) : null,
          idFournisseur: parseInt(idFournisseur),
          idAge: idAge ? parseInt(idAge) : null,
          genre,
          isActive: isActive !== undefined
            ? (isActive === 'true' || isActive === true)
            : true,
          livraisonGratuite: livraisonGratuite === 'true' || livraisonGratuite === true,
        });

        if (req.files && Array.isArray(req.files)) {
          const colorsArray = imageColors
            ? (typeof imageColors === 'string' ? JSON.parse(imageColors) : imageColors)
            : [];

          const images = req.files.map((file, i) => ({
            url: file.path,
            publicId: file.filename,
            rang: i + 1,
            idProduit: produit.idProduit,
            idCouleur: colorsArray[i] || null,
          }));

          await Image.bulkCreate(images);
        }

        let variantsArray = [];
        if (variants) {
          variantsArray = typeof variants === "string" ? JSON.parse(variants) : variants;
          for (const v of variantsArray) {
            await ProduitVariation.create({
              idProduit: produit.idProduit,
              idCouleur: v.idCouleur,
              idTaille: v.idTaille || null,
              idAge: v.idAge || null,
              quantiteStock: v.quantiteStock,
            });
          }
        }

        const createdProduit = await Produit.findByPk(produit.idProduit, {
          include: [
            { model: Categorie, as: 'categorie' },
            { model: Marque, as: 'marque' },
            { model: Type, as: 'type' },
            { model: Fournisseur, as: 'fournisseur' },
            { model: Age, as: 'age' },
            {
              model: Image,
              as: 'images',
              include: [{ model: Couleur, as: 'couleur' }],
              order: [['rang', 'ASC']]
            },
            {
              model: ProduitVariation, as: 'variations',
              include: [
                { model: Couleur, as: 'couleur' },
                { model: Taille, as: 'taille' },
                { model: Age, as: 'age' }
              ]
            }
          ]
        });

        res.status(201).json({ message: 'Produit créé avec succès', data: createdProduit });
      } catch (error) {
        if (req.files && req.files.length > 0) {
          for (const file of req.files) {
            try {
              await cloudinary.uploader.destroy(file.filename);
            } catch (deleteErr) {
              console.error('Erreur suppression image Cloudinary:', deleteErr);
            }
          }
        }
        next(error);
      }
    });
  }

  async getAllProduits(req, res, next) {
    try {
      const produits = await Produit.findAll({
        include: [
          { model: Categorie, as: 'categorie' },
          { model: Marque, as: 'marque' },
          { model: Type, as: 'type' },
          { model: Fournisseur, as: 'fournisseur' },
          { model: Age, as: 'age' },
          {
            model: Image,
            as: 'images',
            include: [{ model: Couleur, as: 'couleur' }],
            order: [['rang', 'ASC']]
          },
          {
            model: ProduitVariation, as: 'variations',
            include: [
              { model: Couleur, as: 'couleur' },
              { model: Taille, as: 'taille' },
              { model: Age, as: 'age' }
            ]
          }
        ],
        order: [['createdAt', 'DESC']]
      });
      res.status(200).json(produits);
    } catch (error) {
      next(error);
    }
  }

  async getProduitById(req, res, next) {
    try {
      const produit = await Produit.findByPk(req.params.id, {
        include: [
          { model: Categorie, as: 'categorie' },
          { model: Marque, as: 'marque' },
          { model: Type, as: 'type' },
          { model: Fournisseur, as: 'fournisseur' },
          { model: Age, as: 'age' },
          {
            model: Image,
            as: 'images',
            include: [{ model: Couleur, as: 'couleur' }],
            order: [['rang', 'ASC']]
          },
          {
            model: ProduitVariation, as: 'variations',
            include: [
              { model: Couleur, as: 'couleur' },
              { model: Taille, as: 'taille' },
              { model: Age, as: 'age' }
            ]
          },
          { model: Avis, as: 'avis', include: [{ model: Utilisateur, as: 'utilisateur' }] },
          {
            model: Commentaire, as: 'commentaires',
            include: [{ model: Utilisateur, as: 'utilisateur' }],
            limit: 5,
            order: [['createdAt', 'DESC']]
          }
        ]
      });
      if (!produit) {
        const error = new Error('Produit non trouvé');
        error.code = "NOT_FOUND";
        return next(error);
      }
      res.status(200).json(produit);
    } catch (error) {
      next(error);
    }
  }

  async getTop10BestSellingProduits(req, res, next) {
    try {
      const topProduits = await LigneCommande.findAll({
        attributes: [
          'idProduit',
          [Sequelize.fn('SUM', Sequelize.col('quantite')), 'totalVendu']
        ],
        group: ['idProduit'],
        order: [[Sequelize.literal('totalVendu'), 'DESC']],
        limit: 10,
        raw: true
      });

      if (!topProduits.length) {
        return res.status(200).json({ message: 'Aucun produit vendu', data: [] });
      }

      const produitIds = topProduits.map(p => p.idProduit);

      const produits = await Produit.findAll({
        where: { idProduit: produitIds,isActive: true },
        include: [
          { model: Categorie, as: 'categorie', attributes: ['idCategorie', 'nom'] },
          { model: Marque, as: 'marque', attributes: ['idMarque', 'nom'] },
          { model: Type, as: 'type', attributes: ['idType', 'nom'] },
          { model: Fournisseur, as: 'fournisseur', attributes: ['idFournisseur', 'nom'] },
          { model: Age, as: 'age', attributes: ['idAge', 'label', 'minAge', 'maxAge', 'minTypeAge', 'maxTypeAge'] },
          {
            model: Image,
            as: 'images',
            attributes: ['idImage', 'url', 'rang'],
            include: [{ model: Couleur, as: 'couleur' }],
            separate: true,
            order: [['rang', 'ASC']]
          },
          {
            model: ProduitVariation, as: 'variations',
            include: [
              { model: Couleur, as: 'couleur' },
              { model: Taille, as: 'taille' },
              { model: Age, as: 'age' }
            ]
          }
        ]
      });

      const mapTotal = {};
      topProduits.forEach(p => mapTotal[p.idProduit] = Number(p.totalVendu));

      const produitsOrdonnes = produitIds
        .map(id => produits.find(p => p.idProduit === id))
        .filter(Boolean);

      const result = produitsOrdonnes.map(p => ({
        ...p.toJSON(),
        totalVendu: mapTotal[p.idProduit] || 0
      }));

      res.status(200).json({
        message: 'Top 10 des produits les plus vendus récupérés avec succès',
        data: result
      });
    } catch (error) {
      console.error('Get top 10 best-selling products error:', error);
      next(error);
    }
  }

  async updateProduit(req, res, next) {
    ProduitController.uploadImages(req, res, async (err) => {
      if (err) {
        const error = new Error('Erreur upload');
        error.code = "VALIDATION_ERROR";
        return next(error);
      }

      try {
        const produit = await Produit.findByPk(req.params.id, {
          include: [{
            model: Image,
            as: 'images',
            include: [{ model: Couleur, as: 'couleur' }]
          }]
        });

        if (!produit) {
          const error = new Error('Produit non trouvé');
          error.code = "NOT_FOUND";
          return next(error);
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
          idAge,
          genre,
          isActive,
          livraisonGratuite,
          imagesToDelete,
          imageRangs,
          existingImageColors,
          newImageColors,
          variants,
        } = req.body;

        await produit.update({
          nom,
          description,
          prix: parseFloat(prix),
          quantiteStock: parseInt(quantiteStock),
          idCategorie: parseInt(idCategorie),
          idMarque: parseInt(idMarque),
          idType: idType ? parseInt(idType) : null,
          idFournisseur: parseInt(idFournisseur),
          idAge: idAge ? parseInt(idAge) : null,
          genre,
          isActive: isActive !== undefined
            ? (isActive === 'true' || isActive === true)
            : produit.isActive,
          livraisonGratuite: livraisonGratuite === 'true' || livraisonGratuite === true,
        });

        if (imagesToDelete) {
          const idsToDelete = Array.isArray(imagesToDelete)
            ? imagesToDelete
            : JSON.parse(imagesToDelete);

          for (const idImage of idsToDelete) {
            const image = await Image.findByPk(idImage);
            if (image && image.publicId) {
              try {
                await cloudinary.uploader.destroy(image.publicId);
              } catch (deleteErr) {
                console.error('Erreur suppression Cloudinary:', deleteErr);
              }
            }
            await Image.destroy({ where: { idImage } });
          }
        }

        if (existingImageColors) {
          const colorsMap = typeof existingImageColors === 'string'
            ? JSON.parse(existingImageColors)
            : existingImageColors;

          for (const [idImage, idCouleur] of Object.entries(colorsMap)) {
            await Image.update(
              { idCouleur: idCouleur || null },
              { where: { idImage: parseInt(idImage) } }
            );
          }
        }

        if (imageRangs) {
          const rangs = JSON.parse(imageRangs);
          for (const [idImage, rang] of Object.entries(rangs)) {
            await Image.update(
              { rang: parseInt(rang) },
              { where: { idImage: parseInt(idImage) } }
            );
          }
        }

        if (req.files && req.files.length > 0) {
          const existingImages = await Image.findAll({ where: { idProduit: produit.idProduit } });
          const maxRang = existingImages.length > 0
            ? Math.max(...existingImages.map(img => img.rang))
            : 0;

          const colorsArray = newImageColors
            ? (typeof newImageColors === 'string' ? JSON.parse(newImageColors) : newImageColors)
            : [];

          const images = req.files.map((file, i) => ({
            url: file.path,
            publicId: file.filename,
            rang: maxRang + i + 1,
            idProduit: produit.idProduit,
            idCouleur: colorsArray[i] || null,
          }));

          await Image.bulkCreate(images);
        }

        if (variants) {
          const variantsArray = typeof variants === 'string' ? JSON.parse(variants) : variants;
          await ProduitVariation.destroy({ where: { idProduit: produit.idProduit } });
          for (const v of variantsArray) {
            await ProduitVariation.create({
              idProduit: produit.idProduit,
              idCouleur: v.idCouleur,
              idTaille: v.idTaille || null,
              idAge: v.idAge || null,
              quantiteStock: v.quantiteStock,
            });
          }
        }

        const updatedProduit = await Produit.findByPk(produit.idProduit, {
          include: [
            { model: Categorie, as: 'categorie' },
            { model: Marque, as: 'marque' },
            { model: Type, as: 'type' },
            { model: Fournisseur, as: 'fournisseur' },
            { model: Age, as: 'age' },
            {
              model: Image,
              as: 'images',
              include: [{ model: Couleur, as: 'couleur' }],
              order: [['rang', 'ASC']]
            },
            {
              model: ProduitVariation, as: 'variations',
              include: [
                { model: Couleur, as: 'couleur' },
                { model: Taille, as: 'taille' },
                { model: Age, as: 'age' }
              ]
            }
          ]
        });

        res.status(200).json({ message: 'Produit mis à jour avec succès', data: updatedProduit });
      } catch (error) {
        next(error);
      }
    });
  }

  // ✅ CORRIGÉ : newStatus calculé avant l'update pour éviter l'inversion
  async toggleActive(req, res, next) {
    try {
      const produit = await Produit.findByPk(req.params.id);
      if (!produit) {
        const error = new Error('Produit non trouvé');
        error.code = "NOT_FOUND";
        return next(error);
      }

      const newStatus = !produit.isActive;
      await produit.update({ isActive: newStatus });

      res.status(200).json({
        message: `Produit ${newStatus ? 'activé' : 'désactivé'} avec succès`,
        isActive: newStatus
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteProduit(req, res, next) {
    try {
      const produit = await Produit.findByPk(req.params.id, {
        include: [{ model: Image, as: 'images' }]
      });
      if (!produit) {
        const error = new Error('Produit non trouvé');
        error.code = "NOT_FOUND";
        return next(error);
      }

      if (produit.images && produit.images.length > 0) {
        for (const image of produit.images) {
          if (image.publicId) {
            try {
              await cloudinary.uploader.destroy(image.publicId);
            } catch (deleteErr) {
              console.error('Erreur suppression Cloudinary:', deleteErr);
            }
          }
        }
      }

      await produit.destroy();
      res.status(200).json({ message: 'Produit supprimé avec succès' });
    } catch (error) {
      next(error);
    }
  }

  async searchProduits(req, res, next) {
    try {
      const {
        q = '',
        category,
        marque,
        minPrice,
        maxPrice,
        inStock,
        livraisonGratuite,
        genre,
        type,
        age,
        sortBy = 'nom',
        order = 'ASC',
        page = 1,
        limit = 12,
        showAll // ✅ NOUVEAU : permet à l'admin de voir tous les produits
      } = req.query;

      const whereClause = {};

      // ✅ Les clients ne voient que les produits actifs
      // L'admin peut passer ?showAll=true pour voir tous les produits
      if (!showAll) {
        whereClause.isActive = true;
      }

      if (q.trim()) {
        whereClause[Op.or] = [
          { nom: { [Op.like]: `%${q}%` } },
          { description: { [Op.like]: `%${q}%` } },
          { '$categorie.nom$': { [Op.like]: `%${q}%` } },
          { '$marque.nom$': { [Op.like]: `%${q}%` } },
          { '$type.nom$': { [Op.like]: `%${q}%` } },
        ];
      }

      if (category) whereClause.idCategorie = category;
      if (marque) whereClause.idMarque = marque;
      if (type) whereClause.idType = type;
      if (genre) whereClause.genre = genre;
      if (age) whereClause.idAge = age;
      if (inStock === 'true') whereClause.quantiteStock = { [Op.gt]: 0 };
      if (livraisonGratuite === 'true') whereClause.livraisonGratuite = true;

      if (minPrice || maxPrice) {
        whereClause.prix = {};
        if (minPrice) whereClause.prix[Op.gte] = parseFloat(minPrice);
        if (maxPrice) whereClause.prix[Op.lte] = parseFloat(maxPrice);
      }

      const includeClause = [
        { model: Categorie, as: 'categorie', attributes: ['idCategorie', 'nom'] },
        { model: Marque, as: 'marque', attributes: ['idMarque', 'nom'] },
        { model: Type, as: 'type', attributes: ['idType', 'nom'] },
        { model: Fournisseur, as: 'fournisseur', attributes: ['idFournisseur', 'nom'] },
        { model: Age, as: 'age', attributes: ['idAge', 'label', 'minAge', 'maxAge', 'minTypeAge', 'maxTypeAge'] },
        {
          model: Image,
          as: 'images',
          include: [{ model: Couleur, as: 'couleur' }],
          attributes: ['idImage', 'url', 'rang'],
          separate: true,
          order: [['rang', 'ASC']],
        },
        {
          model: ProduitVariation,
          as: 'variations',
          include: [
            { model: Couleur, as: 'couleur' },
            { model: Taille, as: 'taille' },
            { model: Age, as: 'age' }
          ]
        },
      ];

      const validSortFields = ['nom', 'prix', 'quantiteStock', 'createdAt'];
      const sortField = validSortFields.includes(sortBy) ? sortBy : 'nom';
      const sortOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      const offset = (parseInt(page) - 1) * parseInt(limit);

      const { count, rows: produits } = await Produit.findAndCountAll({
        where: whereClause,
        include: includeClause,
        limit: parseInt(limit),
        offset: offset,
        order: [
          [sortField, sortOrder],
          ['nom', 'ASC'],
        ],
        distinct: true,
        subQuery: false,
      });

      res.status(200).json({
        data: produits,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          hasNext: page * limit < count,
          hasPrev: page > 1,
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async generateAdvancedSearchSuggestions(searchTerm, results) {
    const suggestions = [];

    const categories = [...new Set(results.map(p => p.categorie?.nom).filter(Boolean))];
    const marques = [...new Set(results.map(p => p.marque?.nom).filter(Boolean))];
    const types = [...new Set(results.map(p => p.type?.nom).filter(Boolean))];
    const ages = [...new Set(results.map(p => p.age?.label).filter(Boolean))];

    categories.slice(0, 3).forEach(cat => {
      suggestions.push({
        type: 'category',
        text: `${searchTerm} dans ${cat}`,
        query: searchTerm,
        filter: { category: cat },
        count: results.filter(p => p.categorie?.nom === cat).length
      });
    });

    marques.slice(0, 3).forEach(marque => {
      suggestions.push({
        type: 'brand',
        text: `${searchTerm} ${marque}`,
        query: searchTerm,
        filter: { marque },
        count: results.filter(p => p.marque?.nom === marque).length
      });
    });

    types.slice(0, 2).forEach(type => {
      suggestions.push({
        type: 'type',
        text: `${searchTerm} ${type}`,
        query: searchTerm,
        filter: { type },
        count: results.filter(p => p.type?.nom === type).length
      });
    });

    ages.slice(0, 2).forEach(age => {
      suggestions.push({
        type: 'age',
        text: `${searchTerm} pour ${age}`,
        query: searchTerm,
        filter: { age },
        count: results.filter(p => p.age?.label === age).length
      });
    });

    return suggestions;
  }

  async getSearchStatsByCategory(searchTerm) {
    const stats = await Produit.findAll({
      attributes: [
        [Sequelize.fn('COUNT', Sequelize.col('Produit.idProduit')), 'count']
      ],
      include: [{
        model: Categorie,
        as: 'categorie',
        attributes: ['idCategorie', 'nom'],
        required: true
      }],
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
      include: [{
        model: Marque,
        as: 'marque',
        attributes: ['idMarque', 'nom'],
        required: true
      }],
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
      include: [{
        model: Type,
        as: 'type',
        attributes: ['idType', 'nom'],
        required: true
      }],
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

  async getSearchStatsByAge(searchTerm) {
    const stats = await Produit.findAll({
      attributes: [
        [Sequelize.fn('COUNT', Sequelize.col('Produit.idProduit')), 'count']
      ],
      include: [{
        model: Age,
        as: 'age',
        attributes: ['idAge', 'label'],
        required: true
      }],
      where: {
        [Op.or]: [
          { nom: { [Op.like]: `%${searchTerm}%` } },
          { description: { [Op.like]: `%${searchTerm}%` } },
        ]
      },
      group: ['age.idAge', 'age.label'],
      order: [[Sequelize.literal('count'), 'DESC']],
      limit: 5
    });

    return stats.map(stat => ({
      age: stat.age.label,
      count: parseInt(stat.dataValues.count)
    }));
  }

  async getSearchSuggestions(req, res, next) {
    try {
      const { q } = req.query;

      if (!q || q.trim().length < 2) {
        return res.status(200).json([]);
      }

      const searchTerm = q.trim();

      const produits = await Produit.findAll({
        where: {
          isActive: true, // ✅ Suggestions uniquement sur produits actifs
          [Op.or]: [
            { nom: { [Op.like]: `%${searchTerm}%` } },
            { description: { [Op.like]: `%${searchTerm}%` } },
            { '$categorie.nom$': { [Op.like]: `%${searchTerm}%` } },
            { '$marque.nom$': { [Op.like]: `%${searchTerm}%` } },
            { '$type.nom$': { [Op.like]: `%${searchTerm}%` } },
            { '$age.label$': { [Op.like]: `%${searchTerm}%` } },
          ]
        },
        include: [
          { model: Categorie, as: 'categorie', attributes: ['nom'], required: false },
          { model: Marque, as: 'marque', attributes: ['nom'], required: false },
          { model: Type, as: 'type', attributes: ['nom'], required: false },
          { model: Age, as: 'age', attributes: ['label'], required: false },
        ],
        limit: 15,
        attributes: ['nom']
      });

      const suggestions = [];
      const categories = new Set();
      const marques = new Set();
      const types = new Set();
      const ages = new Set();

      produits.slice(0, 4).forEach(produit => {
        suggestions.push({ type: 'product', text: produit.nom, query: produit.nom });
      });

      produits.forEach(produit => {
        if (produit.categorie?.nom) categories.add(produit.categorie.nom);
        if (produit.marque?.nom) marques.add(produit.marque.nom);
        if (produit.type?.nom) types.add(produit.type.nom);
        if (produit.age?.label) ages.add(produit.age.label);
      });

      Array.from(categories).slice(0, 3).forEach(category => {
        suggestions.push({ type: 'category', text: `${searchTerm} dans ${category}`, query: searchTerm, filter: { category } });
      });

      Array.from(marques).slice(0, 2).forEach(marque => {
        suggestions.push({ type: 'brand', text: `${searchTerm} ${marque}`, query: searchTerm, filter: { marque } });
      });

      Array.from(types).slice(0, 2).forEach(type => {
        suggestions.push({ type: 'type', text: `${searchTerm} ${type}`, query: searchTerm, filter: { type } });
      });

      Array.from(ages).slice(0, 2).forEach(age => {
        suggestions.push({ type: 'age', text: `${searchTerm} pour ${age}`, query: searchTerm, filter: { age } });
      });

      res.status(200).json(suggestions);
    } catch (error) {
      next(error);
    }
  }

  async deleteImage(req, res, next) {
    try {
      const { imageId } = req.params;

      const image = await Image.findByPk(imageId);
      if (!image) {
        const error = new Error('Image non trouvée');
        error.code = "NOT_FOUND";
        return next(error);
      }

      if (image.publicId) {
        try {
          await cloudinary.uploader.destroy(image.publicId);
        } catch (cloudErr) {
          console.error('Erreur suppression Cloudinary:', cloudErr);
        }
      }

      await image.destroy();
      res.status(200).json({ success: true, message: 'Image supprimée avec succès' });
    } catch (error) {
      next(error);
    }
  }

  async getProduitsByAge(req, res, next) {
    try {
      const { ageId } = req.params;
      const { page = 1, limit = 12 } = req.query;

      const age = await Age.findByPk(ageId);
      if (!age) {
        const error = new Error("Tranche d'âge non trouvée");
        error.code = "NOT_FOUND";
        return next(error);
      }

      const offset = (parseInt(page) - 1) * parseInt(limit);

      const { count, rows: produits } = await Produit.findAndCountAll({
        where: {
          idAge: ageId,
          isActive: true // ✅ Clients voient uniquement les produits actifs
        },
        include: [
          { model: Categorie, as: 'categorie' },
          { model: Marque, as: 'marque' },
          { model: Type, as: 'type' },
          { model: Fournisseur, as: 'fournisseur' },
          { model: Age, as: 'age' },
          {
            model: Image,
            as: 'images',
            include: [{ model: Couleur, as: 'couleur' }],
            separate: true,
            order: [['rang', 'ASC']],
          },
          {
            model: ProduitVariation,
            as: 'variations',
            include: [
              { model: Couleur, as: 'couleur' },
              { model: Taille, as: 'taille' },
              { model: Age, as: 'age' }
            ]
          }
        ],
        limit: parseInt(limit),
        offset: offset,
        order: [['nom', 'ASC']],
      });

      res.status(200).json({
        age: age,
        produits: produits,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          hasNext: page * limit < count,
          hasPrev: page > 1,
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProduitController();