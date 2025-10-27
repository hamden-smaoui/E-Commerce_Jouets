const express = require('express');
const http = require('http');
const sequelize = require('./config/database'); 
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const jouetsRoutes = require('./routes/jouetsRoutes');
const authRoutes = require('./routes/auth');
const panierRoutes = require('./routes/panier');
const favoriRoutes = require('./routes/favori');
const reclamationRoutes = require('./routes/reclamation');
const storeInfoRoutes = require('./routes/storeInfo');
const avisRoutes = require('./routes/avis');
const commentaireRoutes = require('./routes/commentaire');
const factureRoutes = require('./routes/facture');
const fournisseurRoutes = require('./routes/fournisseur');
const codePromoRoutes = require('./routes/code-promo');
const ageRoutes = require('./routes/age');
const tailleRoutes = require('./routes/taille');
const couleurRoutes = require('./routes/couleur');
const typeRoutes = require('./routes/type');
const marqueRoutes = require('./routes/marque');
const categorieRoutes = require('./routes/categorie');
const produitRoutes = require('./routes/produit');
const commandeRoutes = require('./routes/commande');
const promotionRoutes = require('./routes/promotion');
const newsletterRoutes = require('./routes/newsletter');
const utilisateurRoutes = require('./routes/utilisateur');      

const errorHandler = require('./middlewares/errorHandler');
const syncDatabase = require('./syncDatabase');

const app = express();
const server = http.createServer(app);

// Trust proxy (important pour les cookies sécurisés derrière un proxy)
app.set('trust proxy', 1);

// Cookie parser AVANT les routes
app.use(cookieParser());

// ✅ CORS avec configuration complète pour les cookies cross-origin
const isProduction = process.env.NODE_ENV === 'production';
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  process.env.FRONTEND_URL_PROD || 'https://bambyjoy.com',
  process.env.FRONTEND_URL_PROD_WWW || 'https://www.bambyjoy.com',

].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Permet les requêtes sans origin (comme les apps mobiles ou Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Non autorisé par CORS'));
    }
  },
  credentials: true, // ✅ ESSENTIEL pour les cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 204
}));

// Body parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));


// **Accueil**
app.get('/', (req, res) => {
  res.send('🚀 Bienvenue dans le backend E-Commerce Jouets');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/panier', panierRoutes);
app.use('/api/favoris', favoriRoutes);
app.use('/api/reclamations', reclamationRoutes);
app.use('/api/store-info', storeInfoRoutes);
app.use('/api/avis', avisRoutes);
app.use('/api/commentaires', commentaireRoutes);
app.use('/api/factures', factureRoutes);
app.use('/api/ages', ageRoutes);
app.use('/api/tailles', tailleRoutes);
app.use('/api/couleurs', couleurRoutes);
app.use('/api/types', typeRoutes);
app.use('/api/marques', marqueRoutes);
app.use('/api/categories', categorieRoutes);
app.use('/api/produits', produitRoutes);
app.use('/api/commandes', commandeRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/utilisateurs', utilisateurRoutes);
app.use('/api/fournisseurs', fournisseurRoutes);
app.use('/api/codes-promo', codePromoRoutes);

// Handler 404
app.use((req, res, next) => {
  const error = new Error('Route non trouvée');
  error.code = "NOT_FOUND";
  next(error);
});

// Handler d'erreur centralisé
app.use(errorHandler);

const waitForDatabase = async (maxRetries = 30, delay = 3000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await sequelize.authenticate();
      console.log('✅ Connexion réussie à la base de données');
      return true;
    } catch (err) {
      console.log(`Tentative ${i + 1}/${maxRetries} : Base de données non prête, nouvelle tentative dans ${delay/1000} secondes...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Impossible de se connecter à la base de données après plusieurs tentatives');
};

const startServer = async () => {
  try {
    await waitForDatabase();
    await syncDatabase();
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Backend E-Commerce Jouets running on port ${PORT}`);
      console.log(`   Mode: ${process.env.NODE_ENV || 'development'}`);
      console.log(`   CORS: ${allowedOrigins.join(', ')}`);
    });
  } catch (err) {
    console.error('❌ Erreur lors du démarrage du serveur:', err);
    process.exit(1);
  }
};

startServer();