const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Utilisateur } = require('../models');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { Op } = require('sequelize');
function generateAccessToken(user) {
  return jwt.sign(
    {
      userId: user.idUtilisateur,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '30m' }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    {
      userId: user.idUtilisateur,
      tokenVersion: user.tokenVersion
    },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
}
class AuthController {
 // Inscription - VERSION SIMPLIFIÉE
async register(req, res, next) {
  try {
    const { prenom, nom, email, motDePasse, telephone, role = 'client' } = req.body;

    const existingUser = await Utilisateur.findOne({ where: { email } });
    if (existingUser) {
      const error = new Error('Un utilisateur avec cet email existe déjà');
      error.code = "VALIDATION_ERROR";
      return next(error);
    }

    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(motDePasse, saltRounds);

    const newUser = await Utilisateur.create({
      prenom,
      nom,
      email,
      motDePasse: hashedPassword,
      telephone,
      role
    });

    // ✅ Prépare la réponse utilisateur (SANS tokens ni cookies)
    const userResponse = {
      idUtilisateur: newUser.idUtilisateur,
      prenom: newUser.prenom,
      nom: newUser.nom,
      email: newUser.email,
      telephone: newUser.telephone,
      adresseRue: newUser.adresseRue,
      adresseVille: newUser.adresseVille,
      adresseCodePostal: newUser.adresseCodePostal,
      adressePays: newUser.adressePays,
      role: newUser.role
    };

    // ✅ Retourne seulement les infos de l'utilisateur créé
    res.status(201).json({
      message: 'Inscription réussie',
      user: userResponse
    });

  } catch (error) {
    console.log("Erreur dans register:", error);
    next(error);
  }
}

  // Connexion
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
        const error = new Error('Identifiant ou mot de passe incorrect');
        error.code = "AUTH_ERROR";
        return next(error);
      }

      if (user.isGoogleUser && !user.motDePasse) {
        const error = new Error('Ce compte utilise l\'authentification Google. Veuillez vous connecter avec Google.');
        error.code = "AUTH_ERROR";
        error.isGoogleUser = true;
        return next(error);
      }

      if (!user.motDePasse) {
        const error = new Error('Aucun mot de passe défini pour ce compte');
        error.code = "AUTH_ERROR";
        return next(error);
      }

      const isValidPassword = await bcrypt.compare(motDePasse, user.motDePasse);
      if (!isValidPassword) {
        const error = new Error('Email ou mot de passe incorrect');
        error.code = "AUTH_ERROR";
        return next(error);
      }

      // Generate tokens
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);
console.log("✅ Cookie refreshToken créé lors du login1");

  res.cookie("refreshToken", refreshToken, {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000
  // pas de domain
});
 console.log("🍪 Cookie refreshToken configuré !");
    console.log("   Token value:", refreshToken.substring(0, 20) + "...");
    console.log("   Headers Set-Cookie:", res.getHeaders()['set-cookie']);
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
console.log("✅ Cookie refreshToken créé lors du login2");

      res.status(200).json({
        message: 'Connexion réussie',
        token: accessToken,
        user: userResponse
      });

    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req, res, next) {
  try {
    console.log("[refreshToken] Début - Requête reçue");
    console.log("[refreshToken] Tous les cookies reçus:", req.cookies);
    console.log("[refreshToken] Headers:", req.headers.cookie);
    
    const token = req.cookies.refreshToken;
    if (!token) {
      console.log("[refreshToken] ❌ Échec : Aucun refresh token trouvé");
      return res.status(401).json({ message: "No refresh token" });
    }


    console.log("[refreshToken] Refresh token présent :", token);
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      console.log("[refreshToken] Payload du refresh token :", payload);
    } catch (e) {
      console.log("[refreshToken] Échec : Refresh token invalide ou expiré", e);
      return res.status(401).json({ message: "Refresh token invalid" });
    }

    const user = await Utilisateur.findByPk(payload.userId);
    if (!user) {
      console.log("[refreshToken] Échec : Utilisateur non trouvé avec l'id", payload.userId);
      return res.status(401).json({ message: "User not found" });
    }
    if (user.tokenVersion !== payload.tokenVersion) {
      console.log("[refreshToken] Échec : tokenVersion mismatch (user:", user.tokenVersion, "payload:", payload.tokenVersion, ")");
      return res.status(401).json({ message: "Token version mismatch" });
    }

    const newAccessToken = generateAccessToken(user);
    console.log("[refreshToken] Succès : Nouveau access token généré", newAccessToken);

    res.status(200).json({ token: newAccessToken });
    console.log("[refreshToken] Fin - Token envoyé au client");
  } catch (error) {
     console.log("[refreshToken] Exception:", error);
    next(error);
  }
}

  // Logout: clear refresh token
  async logout(req, res, next) {
    try {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
      res.status(200).json({ message: "Déconnexion réussie" });
    } catch (error) {
      next(error);
    }
  }

    // Profil utilisateur
    async getProfile(req, res, next) {
        try {
            const user = await Utilisateur.findByPk(req.user.idUtilisateur, {
                attributes: { exclude: ['motDePasse'] }
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

            if (!prenom || !validator.isLength(prenom, { min: 2, max: 50 }) || !validator.matches(prenom, /^[A-Za-zÀ-ÿ\s\-]+$/)) {
                const error = new Error("Prénom invalide");
                error.code = "VALIDATION_ERROR";
                return next(error);
            }
            if (!nom || !validator.isLength(nom, { min: 2, max: 50 }) || !validator.matches(nom, /^[A-Za-zÀ-ÿ\s\-]+$/)) {
                const error = new Error("Nom invalide");
                error.code = "VALIDATION_ERROR";
                return next(error);
            }
            if (!telephone || !validator.isLength(telephone, { min: 6, max: 20 })) {
                const error = new Error("Téléphone invalide");
                error.code = "VALIDATION_ERROR";
                return next(error);
            }
            if (adresseRue && !validator.isLength(adresseRue, { max: 100 })) {
                const error = new Error("Adresse rue trop longue");
                error.code = "VALIDATION_ERROR";
                return next(error);
            }
            if (adresseVille && !validator.isLength(adresseVille, { max: 50 })) {
                const error = new Error("Adresse ville trop longue");
                error.code = "VALIDATION_ERROR";
                return next(error);
            }
            if (adresseCodePostal && !validator.isLength(adresseCodePostal, { max: 12 })) {
                const error = new Error("Code postal trop long");
                error.code = "VALIDATION_ERROR";
                return next(error);
            }
            if (adressePays && !validator.isLength(adressePays, { max: 50 })) {
                const error = new Error("Pays trop long");
                error.code = "VALIDATION_ERROR";
                return next(error);
            }

            const user = await Utilisateur.findByPk(req.user.idUtilisateur);
            if (!user) {
                const error = new Error('Utilisateur non trouvé');
                error.code = "AUTH_ERROR";
                return next(error);
            }

            await user.update({
                prenom,
                nom,
                telephone,
                adresseRue,
                adresseVille,
                adresseCodePostal,
                adressePays
            });

            const updatedUser = await Utilisateur.findByPk(req.user.idUtilisateur, {
                attributes: { exclude: ['motDePasse'] }
            });

            res.status(200).json({
                message: 'Profil mis à jour avec succès',
                user: updatedUser
            });

        } catch (error) {
            next(error);
        }
    }

    // Changement de mot de passe
    async changePassword(req, res, next) {
        try {
            const { currentPassword, newPassword } = req.body;
            const user = await Utilisateur.findByPk(req.user.userId);
            if (!user) {
                const error = new Error('Utilisateur non trouvé');
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

              await user.update({ motDePasse: hashedNewPassword, tokenVersion: user.tokenVersion + 1 });
            res.status(200).json({
                message: 'Mot de passe modifié avec succès'
            });

        } catch (error) {
            next(error);
        }
    }

    async forgotPassword(req, res, next) {
        try {
            const { email } = req.body;
            const user = await Utilisateur.findOne({ where: { email } });
            if (!user) {
                const error = new Error('Aucun compte associé à cet email');
                error.code = "AUTH_ERROR";
                return next(error);
            }

            const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
            const resetCodeExpiry = new Date(Date.now() + 10 * 60 * 1000);

            await user.update({
                resetCode,
                resetCodeExpiry
            });

            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: process.env.SMTP_PORT,
                secure: false,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                }
            });

            const mailOptions = {
                from: process.env.SMTP_FROM,
                to: email,
                subject: 'Code de récupération - Toy Universe',
                html: `<div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <h1 style="color: #9333ea;">Toy Universe</h1>
                        </div>
                        <div style="background: #f8fafc; padding: 30px; border-radius: 10px; border-left: 4px solid #9333ea;">
                            <h2 style="color: #1f2937; margin-bottom: 20px;">Récupération de mot de passe</h2>
                            <p style="color: #4b5563; margin-bottom: 20px;">Bonjour ${user.prenom},</p>
                            <p style="color: #4b5563; margin-bottom: 20px;">Vous avez demandé la réinitialisation de votre mot de passe. Voici votre code de vérification :</p>
                            <div style="text-align: center; margin: 30px 0;">
                                <div style="background: #9333ea; color: white; padding: 15px 25px; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 3px; display: inline-block;">
                                    ${resetCode}
                                </div>
                            </div>
                            <p style="color: #4b5563; margin-bottom: 10px;"><strong>Ce code expire dans 10 minutes.</strong></p>
                            <p style="color: #6b7280; font-size: 14px;">Si vous n'avez pas demandé cette réinitialisation, ignorez cet email. Votre mot de passe restera inchangé.</p>
                        </div>
                        <div style="text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px;">
                            <p>© 2024 Toy Universe. Tous droits réservés.</p>
                        </div>
                    </div>`
            };

            await transporter.sendMail(mailOptions);

            res.status(200).json({
                message: 'Code de vérification envoyé par email'
            });

        } catch (error) {
          console.log("Erreur dans forgotPassword:", error);
            next(error);
        }
    }

    async resetPassword(req, res, next) {
        try {
            const { email, code, newPassword } = req.body;
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

            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

            await user.update({
                motDePasse: hashedPassword,
                resetCode: null,
                resetCodeExpiry: null, tokenVersion: user.tokenVersion + 1
            });

            res.status(200).json({
                message: 'Mot de passe réinitialisé avec succès'
            });

        } catch (error) {
            next(error);
        }
    }

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
            const nom = nameParts.slice(1).join(' ') || '';

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
                        profileImage: image 
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
                    isGoogleUser: true
                });
            }

            const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
            // Met le refresh token dans un cookie sécurisé
  res.cookie("refreshToken", refreshToken, {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000
  // pas de domain
});

        // Prépare la réponse utilisateur
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
        next(error);
    }
}
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
        const nom = nameParts.slice(1).join(' ') || '';

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
                    profileImage: image 
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
                isFacebookUser: true
            });
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

     res.cookie("refreshToken", refreshToken, {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000
  // pas de domain
});

        // Prépare la réponse utilisateur
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
        next(error);
    }
}
}

module.exports = new AuthController();