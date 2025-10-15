const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Utilisateur } = require('../models');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { Op } = require('sequelize');
const SibApiV3Sdk = require('@getbrevo/brevo');

// Génère l'access token (court terme - 15m)
function generateAccessToken(user) {
  return jwt.sign(
    {
      userId: user.idUtilisateur,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion
    },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
}

// Génère le refresh token (long terme - 7 jours)
function generateRefreshToken(user) {
  return jwt.sign(
    {
      userId: user.idUtilisateur,
      tokenVersion: user.tokenVersion
    },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
}

class AuthController {
  
  // ============ INSCRIPTION ============
  async register(req, res, next) {
    try {
      const { prenom, nom, email, motDePasse, telephone, role = 'client' } = req.body;

      // Validation
      if (!prenom || !nom || !email || !motDePasse || !telephone) {
        const error = new Error('Tous les champs sont requis');
        error.code = "VALIDATION_ERROR";
        return next(error);
      }

      if (!validator.isEmail(email)) {
        const error = new Error('Email invalide');
        error.code = "VALIDATION_ERROR";
        return next(error);
      }

      if (motDePasse.length < 6) {
        const error = new Error('Le mot de passe doit contenir au moins 6 caractères');
        error.code = "VALIDATION_ERROR";
        return next(error);
      }

      // Vérifie si l'utilisateur existe déjà
      const existingUser = await Utilisateur.findOne({ where: { email } });
      if (existingUser) {
        const error = new Error('Un utilisateur avec cet email existe déjà');
        error.code = "VALIDATION_ERROR";
        return next(error);
      }

      // Hash du mot de passe
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(motDePasse, saltRounds);

      // Crée l'utilisateur
      const newUser = await Utilisateur.create({
        prenom: validator.escape(prenom.trim()),
        nom: validator.escape(nom.trim()),
        email: validator.normalizeEmail(email),
        motDePasse: hashedPassword,
        telephone: validator.escape(telephone.trim()),
        role,
        isGoogleUser: false,
        isFacebookUser: false
      });

      const userResponse = {
        idUtilisateur: newUser.idUtilisateur,
        prenom: newUser.prenom,
        nom: newUser.nom,
        email: newUser.email,
        telephone: newUser.telephone,
        role: newUser.role
      };

      res.status(201).json({
        message: 'Inscription réussie',
        user: userResponse
      });

    } catch (error) {
      console.error("Erreur dans register:", error);
      next(error);
    }
  }

  // ============ LOGIN ============
  async login(req, res, next) {
    try {
      const { emailOrPhone, motDePasse } = req.body;

      if (!emailOrPhone || !motDePasse) {
        const error = new Error('Email/téléphone et mot de passe sont requis');
        error.code = "VALIDATION_ERROR";
        return next(error);
      }

      const user = await Utilisateur.findOne({
        where: {
          [Op.or]: [
            { email: emailOrPhone },
            { telephone: emailOrPhone }
          ]
        }
      });

      if (!user) {
        const error = new Error('Email/téléphone ou mot de passe incorrect');
        error.code = "AUTH_ERROR";
        return next(error);
      }

      // Vérifie si c'est un compte Google/Facebook sans password
      if ((user.isGoogleUser || user.isFacebookUser) && !user.motDePasse) {
        const error = new Error('Ce compte utilise une authentification sociale. Veuillez vous connecter avec Google ou Facebook.');
        error.code = "AUTH_ERROR";
        error.isSocialUser = true;
        return next(error);
      }

      if (!user.motDePasse) {
        const error = new Error('Aucun mot de passe défini pour ce compte');
        error.code = "AUTH_ERROR";
        return next(error);
      }

      // Vérifie le mot de passe
      const isValidPassword = await bcrypt.compare(motDePasse, user.motDePasse);
      if (!isValidPassword) {
        const error = new Error('Email/téléphone ou mot de passe incorrect');
        error.code = "AUTH_ERROR";
        return next(error);
      }

      // Génère les tokens
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      // Définit le refresh token dans un cookie sécurisé
      const isProduction = process.env.NODE_ENV === "production";
      
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
      });

      const userResponse = {
        idUtilisateur: user.idUtilisateur,
        prenom: user.prenom,
        nom: user.nom,
        email: user.email,
        telephone: user.telephone,
        adresseRue: user.adresseRue,
        adresseVille: user.adresseVille,
        adresseCodePostal: user.adresseCodePostal,
        adressePays: user.adressePays,
        role: user.role
      };

      res.status(200).json({
        message: 'Connexion réussie',
        token: accessToken,
        user: userResponse
      });

    } catch (error) {
      console.error("Erreur dans login:", error);
      next(error);
    }
  }

  // ============ REFRESH TOKEN ============
  async refreshToken(req, res, next) {
    try {
      const token = req.cookies.refreshToken;
      
      if (!token) {
        return res.status(401).json({ message: "Refresh token manquant" });
      }

      let payload;
      try {
        payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      } catch (e) {
        return res.status(401).json({ message: "Refresh token invalide ou expiré" });
      }

      const user = await Utilisateur.findByPk(payload.userId);
      if (!user) {
        return res.status(401).json({ message: "Utilisateur non trouvé" });
      }

      if (user.tokenVersion !== payload.tokenVersion) {
        return res.status(401).json({ message: "Token invalidé" });
      }

      const newAccessToken = generateAccessToken(user);

      res.status(200).json({ token: newAccessToken });

    } catch (error) {
      console.error("Erreur dans refreshToken:", error);
      next(error);
    }
  }

  // ============ LOGOUT ============
  async logout(req, res, next) {
    try {
      const isProduction = process.env.NODE_ENV === "production";
      
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        path: "/"
      });
      
      res.status(200).json({ message: "Déconnexion réussie" });
    } catch (error) {
      next(error);
    }
  }

  // ============ FORGOT PASSWORD ============
  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;

      if (!email || !validator.isEmail(email)) {
        const error = new Error('Email invalide');
        error.code = "VALIDATION_ERROR";
        return next(error);
      }

      const user = await Utilisateur.findOne({ where: { email } });
      if (!user) {
        // Ne révèle pas si l'email existe (sécurité)
        return res.status(200).json({
          message: 'Si cet email existe, un code a été envoyé'
        });
      }

      // Génère un code de réinitialisation (6 chiffres)
      const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
      const resetCodeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await user.update({
        resetCode,
        resetCodeExpiry
      });

      // Configure l'API Brevo
      let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
      let apiKey = apiInstance.authentications['apiKey'];
      apiKey.apiKey = process.env.BREVO_API_KEY;

      // Prépare l'email
      let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
      
      sendSmtpEmail.subject = "Code de récupération - Bamby Joy";
      
      sendSmtpEmail.htmlContent = `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #9333ea;">Bamby Joy</h1>
          </div>
          <div style="background: #f8fafc; padding: 30px; border-radius: 10px; border-left: 4px solid #9333ea;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Réinitialisation de mot de passe</h2>
            <p style="color: #4b5563; margin-bottom: 20px;">Bonjour ${user.prenom},</p>
            <p style="color: #4b5563; margin-bottom: 20px;">Vous avez demandé la réinitialisation de votre mot de passe. Voici votre code de vérification :</p>
            <div style="text-align: center; margin: 30px 0;">
              <div style="background: #9333ea; color: white; padding: 15px 25px; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 3px; display: inline-block;">
                ${resetCode}
              </div>
            </div>
            <p style="color: #4b5563; margin-bottom: 10px;"><strong>Ce code expire dans 10 minutes.</strong></p>
            <p style="color: #6b7280; font-size: 14px;">Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
          </div>
          <div style="text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px;">
            <p>© 2024 Bamby Joy. Tous droits réservés.</p>
          </div>
        </div>
      `;
      
      sendSmtpEmail.sender = { 
        name: process.env.BREVO_SENDER_NAME || "Bamby Joy", 
        email: process.env.BREVO_SENDER_EMAIL 
      };
      
      sendSmtpEmail.to = [
        { email: email, name: user.prenom }
      ];

      // Envoie l'email
      await apiInstance.sendTransacEmail(sendSmtpEmail);

      res.status(200).json({
        message: 'Code de vérification envoyé par email'
      });

    } catch (error) {
      console.error("Erreur Brevo:", error);
      next(error);
    }
  }

  // ============ RESET PASSWORD ============
  async resetPassword(req, res, next) {
    try {
      const { email, code, newPassword } = req.body;

      if (!email || !code || !newPassword) {
        const error = new Error('Email, code et nouveau mot de passe sont requis');
        error.code = "VALIDATION_ERROR";
        return next(error);
      }

      if (newPassword.length < 6) {
        const error = new Error('Le mot de passe doit contenir au moins 6 caractères');
        error.code = "VALIDATION_ERROR";
        return next(error);
      }

      const user = await Utilisateur.findOne({ where: { email } });
      if (!user) {
        const error = new Error('Utilisateur non trouvé');
        error.code = "AUTH_ERROR";
        return next(error);
      }

      if (!user.resetCode || user.resetCode !== code) {
        const error = new Error('Code de vérification invalide');
        error.code = "VALIDATION_ERROR";
        return next(error);
      }

      if (!user.resetCodeExpiry || new Date() > user.resetCodeExpiry) {
        const error = new Error('Code de vérification expiré');
        error.code = "VALIDATION_ERROR";
        return next(error);
      }

      // Hash le nouveau mot de passe
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Met à jour le mot de passe et invalide les anciens tokens
      await user.update({
        motDePasse: hashedPassword,
        resetCode: null,
        resetCodeExpiry: null,
        tokenVersion: user.tokenVersion + 1
      });

      res.status(200).json({
        message: 'Mot de passe réinitialisé avec succès'
      });

    } catch (error) {
      console.error("Erreur dans resetPassword:", error);
      next(error);
    }
  }

  // ============ CHANGE PASSWORD ============
  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        const error = new Error('Mot de passe actuel et nouveau sont requis');
        error.code = "VALIDATION_ERROR";
        return next(error);
      }

      if (newPassword.length < 6) {
        const error = new Error('Le mot de passe doit contenir au moins 6 caractères');
        error.code = "VALIDATION_ERROR";
        return next(error);
      }

      const user = await Utilisateur.findByPk(req.user.userId);
      if (!user) {
        const error = new Error('Utilisateur non trouvé');
        error.code = "AUTH_ERROR";
        return next(error);
      }

      if (!user.motDePasse) {
        const error = new Error('Vous devez avoir un mot de passe pour le changer');
        error.code = "AUTH_ERROR";
        return next(error);
      }

      const isValidPassword = await bcrypt.compare(currentPassword, user.motDePasse);
      if (!isValidPassword) {
        const error = new Error('Mot de passe actuel incorrect');
        error.code = "AUTH_ERROR";
        return next(error);
      }

      const saltRounds = 12;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      await user.update({
        motDePasse: hashedNewPassword,
        tokenVersion: user.tokenVersion + 1
      });

      res.status(200).json({
        message: 'Mot de passe changé avec succès'
      });

    } catch (error) {
      console.error("Erreur dans changePassword:", error);
      next(error);
    }
  }

  // ============ GOOGLE AUTH ============
  async googleAuth(req, res, next) {
    try {
      const { email, name, googleId, image } = req.body;

      if (!email || !name || !googleId) {
        const error = new Error('Données Google incomplètes');
        error.code = "VALIDATION_ERROR";
        return next(error);
      }

      const nameParts = name.split(' ');
      const prenom = nameParts[0] || '';
      const nom = nameParts.slice(1).join(' ') || name;

      let user = await Utilisateur.findOne({
        where: {
          [Op.or]: [
            { email: email },
            { googleId: googleId }
          ]
        }
      });

      if (user) {
        if (!user.googleId) {
          await user.update({
            googleId,
            profileImage: image || user.profileImage,
            isGoogleUser: true
          });
        }
      } else {
        user = await Utilisateur.create({
          prenom,
          nom,
          email,
          googleId,
          profileImage: image,
          telephone: '',
          motDePasse: null,
          role: 'client',
          isGoogleUser: true,
          isFacebookUser: false
        });
      }

      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      const isProduction = process.env.NODE_ENV === "production";

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      const userResponse = {
        idUtilisateur: user.idUtilisateur,
        prenom: user.prenom,
        nom: user.nom,
        email: user.email,
        telephone: user.telephone,
        role: user.role,
        profileImage: user.profileImage,
        isGoogleUser: user.isGoogleUser,
        adresseCodePostal: user.adresseCodePostal,
        adressePays: user.adressePays,
        adresseRue: user.adresseRue,
        adresseVille: user.adresseVille
      };

      res.status(200).json({
        message: 'Authentification Google réussie',
        token: accessToken,
        user: userResponse
      });

    } catch (error) {
      console.error("Erreur Google Auth:", error);
      next(error);
    }
  }

  // ============ FACEBOOK AUTH ============
  async facebookAuth(req, res, next) {
    try {
      const { email, name, facebookId, image } = req.body;

      if (!email || !name || !facebookId) {
        const error = new Error('Données Facebook incomplètes');
        error.code = "VALIDATION_ERROR";
        return next(error);
      }

      const nameParts = name.split(' ');
      const prenom = nameParts[0] || '';
      const nom = nameParts.slice(1).join(' ') || name;

      let user = await Utilisateur.findOne({
        where: {
          [Op.or]: [
            { email: email },
            { facebookId: facebookId }
          ]
        }
      });

      if (user) {
        if (!user.facebookId) {
          await user.update({
            facebookId,
            profileImage: image || user.profileImage,
            isFacebookUser: true
          });
        }
      } else {
        user = await Utilisateur.create({
          prenom,
          nom,
          email,
          facebookId,
          profileImage: image,
          telephone: '',
          motDePasse: null,
          role: 'client',
          isFacebookUser: true,
          isGoogleUser: false
        });
      }

      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      const isProduction = process.env.NODE_ENV === "production";

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      const userResponse = {
        idUtilisateur: user.idUtilisateur,
        prenom: user.prenom,
        nom: user.nom,
        email: user.email,
        telephone: user.telephone,
        role: user.role,
        profileImage: user.profileImage,
        isFacebookUser: user.isFacebookUser,
        adresseCodePostal: user.adresseCodePostal,
        adressePays: user.adressePays,
        adresseRue: user.adresseRue,
        adresseVille: user.adresseVille
      };

      res.status(200).json({
        message: 'Authentification Facebook réussie',
        token: accessToken,
        user: userResponse
      });

    } catch (error) {
      console.error("Erreur Facebook Auth:", error);
      next(error);
    }
  }

  // ============ GET PROFILE ============
  async getProfile(req, res, next) {
    try {
      const user = await Utilisateur.findByPk(req.user.userId, {
        attributes: { exclude: ['motDePasse', 'resetCode', 'resetCodeExpiry'] }
      });
      
      if (!user) {
        const error = new Error("Utilisateur non trouvé");
        error.code = "AUTH_ERROR";
        return next(error);
      }
      
      res.status(200).json({ user });
    } catch (error) {
      next(error);
    }
  }

  // ============ UPDATE PROFILE ============
  async updateProfile(req, res, next) {
    try {
      let { prenom, nom, telephone, adresseRue, adresseVille, adresseCodePostal, adressePays } = req.body;

      prenom = prenom ? validator.escape(prenom.trim()) : "";
      nom = nom ? validator.escape(nom.trim()) : "";
      telephone = telephone ? validator.escape(telephone.trim()) : "";
      adresseRue = adresseRue ? validator.escape(adresseRue.trim()) : "";
      adresseVille = adresseVille ? validator.escape(adresseVille.trim()) : "";
      adresseCodePostal = adresseCodePostal ? validator.escape(adresseCodePostal.trim()) : "";
      adressePays = adressePays ? validator.escape(adressePays.trim()) : "";

      if (prenom && (!validator.isLength(prenom, { min: 2, max: 50 }) || !validator.matches(prenom, /^[A-Za-zÀ-ÿ\s\-]+$/))) {
        const error = new Error("Prénom invalide");
        error.code = "VALIDATION_ERROR";
        return next(error);
      }

      if (nom && (!validator.isLength(nom, { min: 2, max: 50 }) || !validator.matches(nom, /^[A-Za-zÀ-ÿ\s\-]+$/))) {
        const error = new Error("Nom invalide");
        error.code = "VALIDATION_ERROR";
        return next(error);
      }

      const user = await Utilisateur.findByPk(req.user.userId);
      if (!user) {
        const error = new Error('Utilisateur non trouvé');
        error.code = "AUTH_ERROR";
        return next(error);
      }

      await user.update({
        prenom: prenom || user.prenom,
        nom: nom || user.nom,
        telephone: telephone || user.telephone,
        adresseRue,
        adresseVille,
        adresseCodePostal,
        adressePays
      });

      const updatedUser = await Utilisateur.findByPk(req.user.userId, {
        attributes: { exclude: ['motDePasse', 'resetCode', 'resetCodeExpiry'] }
      });

      res.status(200).json({
        message: 'Profil mis à jour avec succès',
        user: updatedUser
      });

    } catch (error) {
      next(error);
    }
  }

  // ============ REFRESH TOKEN FROM SESSION ============
async refreshTokenFromSession(req, res, next) {
  try {
    const { userId } = req.body;

    if (!userId) {
      const error = new Error('User ID requis');
      error.code = "VALIDATION_ERROR";
      return next(error);
    }

    const user = await Utilisateur.findByPk(userId);
    if (!user) {
      return res.status(401).json({ message: "Utilisateur non trouvé" });
    }

    // Génère un nouveau access token
    const newAccessToken = generateAccessToken(user);

    res.status(200).json({ token: newAccessToken });

  } catch (error) {
    console.error("Erreur dans refreshTokenFromSession:", error);
    next(error);
  }
}
}

module.exports = new AuthController();