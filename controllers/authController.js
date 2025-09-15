// controllers/AuthController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Utilisateur } = require('../models');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { Op } = require('sequelize');
class AuthController {
    // Inscription
    async register(req, res) {
        try {
            const { prenom, nom, email, motDePasse, telephone, role = 'client' } = req.body;

            // Vérification si l'email existe déjà
            const existingUser = await Utilisateur.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({
                    message: 'Un utilisateur avec cet email existe déjà'
                });
            }

            // Hashage du mot de passe
            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash(motDePasse, saltRounds);

            // Création de l'utilisateur
            const newUser = await Utilisateur.create({
                prenom,
                nom,
                email,
                motDePasse: hashedPassword,
                telephone,
                role
            });

            // Génération du token JWT
            const token = jwt.sign(
                { 
                    userId: newUser.idUtilisateur,
                    email: newUser.email,
                    role: newUser.role
                },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN }
            );

            // Retourner les données sans le mot de passe
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

            res.status(201).json({
                message: 'Inscription réussie',
                token,
                user: userResponse
            });

        } catch (error) {
            res.status(500).json({
                message: 'Erreur lors de l\'inscription',
                error: error.message
            });
        }
    }

    // Connexion
    async login(req, res) {
        try {
            const { email, motDePasse } = req.body;

            // Vérification si l'utilisateur existe
            const user = await Utilisateur.findOne({ where: { email } });
            if (!user) {
                return res.status(400).json({
                    message: 'Email ou mot de passe incorrect'
                });
            }

            // Vérification du mot de passe
            const isValidPassword = await bcrypt.compare(motDePasse, user.motDePasse);
            if (!isValidPassword) {
                return res.status(400).json({
                    message: 'Email ou mot de passe incorrect'
                });
            }

            // Génération du token JWT
            const token = jwt.sign(
                {
                    userId: user.idUtilisateur,
                    email: user.email,
                    role: user.role
                },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN }
            );

            // Retourner les données sans le mot de passe
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

            res.status(200).json({
                message: 'Connexion réussie',
                token,
                user: userResponse
            });

        } catch (error) {
            res.status(500).json({
                message: 'Erreur lors de la connexion',
                error: error.message
            });
        }
    }

    // Profil utilisateur (nécessite authentification)
    async getProfile(req, res) {
        try {
            const user = await Utilisateur.findByPk(req.user.userId, {
                attributes: { exclude: ['motDePasse'] }
            });

            if (!user) {
                return res.status(404).json({
                    message: 'Utilisateur non trouvé'
                });
            }

            res.status(200).json({
                user
            });

        } catch (error) {
            res.status(500).json({
                message: 'Erreur lors de la récupération du profil',
                error: error.message
            });
        }
    }

    // Mise à jour du profil
    async updateProfile(req, res) {
       
        try {
            const { prenom, nom, telephone, adresseRue, adresseVille, adresseCodePostal, adressePays } = req.body;
            
            const user = await Utilisateur.findByPk(req.user.idUtilisateur);
            if (!user) {
                return res.status(404).json({
                    message: 'Utilisateur non trouvé'
                });
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
            res.status(500).json({
                message: 'Erreur lors de la mise à jour du profil',
                error: error.message
            });
        }
    }

    // Changement de mot de passe
    async changePassword(req, res) {
        try {
            const { currentPassword, newPassword } = req.body;
            
            const user = await Utilisateur.findByPk(req.user.userId);
            if (!user) {
                return res.status(404).json({
                    message: 'Utilisateur non trouvé'
                });
            }

            // Vérification de l'ancien mot de passe
            const isValidPassword = await bcrypt.compare(currentPassword, user.motDePasse);
            if (!isValidPassword) {
                return res.status(400).json({
                    message: 'Mot de passe actuel incorrect'
                });
            }

            // Hashage du nouveau mot de passe
            const saltRounds = 12;
            const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

            await user.update({ motDePasse: hashedNewPassword });

            res.status(200).json({
                message: 'Mot de passe modifié avec succès'
            });

        } catch (error) {
            res.status(500).json({
                message: 'Erreur lors du changement de mot de passe',
                error: error.message
            });
        }
    }

     async forgotPassword(req, res) {
        try {
            const { email } = req.body;

            // Vérifier si l'utilisateur existe
            const user = await Utilisateur.findOne({ where: { email } });
            if (!user) {
                return res.status(404).json({
                    message: 'Aucun compte associé à cet email'
                });
            }

            // Générer un code de vérification à 6 chiffres
            const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
            const resetCodeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

            // Sauvegarder le code dans la base de données
            await user.update({
                resetCode,
                resetCodeExpiry
            });

            // Configuration de l'email
            const transporter = nodemailer.createTransport({
                service: 'gmail', // ou votre service email
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD
                }
            });

            const mailOptions = {
                from: process.env.EMAIL_FROM,
                to: email,
                subject: 'Code de récupération - Toy Universe',
                html: `
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <h1 style="color: #9333ea;">Toy Universe</h1>
                        </div>
                        <div style="background: #f8fafc; padding: 30px; border-radius: 10px; border-left: 4px solid #9333ea;">
                            <h2 style="color: #1f2937; margin-bottom: 20px;">Récupération de mot de passe</h2>
                            <p style="color: #4b5563; margin-bottom: 20px;">
                                Bonjour ${user.prenom},
                            </p>
                            <p style="color: #4b5563; margin-bottom: 20px;">
                                Vous avez demandé la réinitialisation de votre mot de passe. 
                                Voici votre code de vérification :
                            </p>
                            <div style="text-align: center; margin: 30px 0;">
                                <div style="background: #9333ea; color: white; padding: 15px 25px; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 3px; display: inline-block;">
                                    ${resetCode}
                                </div>
                            </div>
                            <p style="color: #4b5563; margin-bottom: 10px;">
                                <strong>Ce code expire dans 10 minutes.</strong>
                            </p>
                            <p style="color: #6b7280; font-size: 14px;">
                                Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
                                Votre mot de passe restera inchangé.
                            </p>
                        </div>
                        <div style="text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px;">
                            <p>© 2024 Toy Universe. Tous droits réservés.</p>
                        </div>
                    </div>
                `
            };

            await transporter.sendMail(mailOptions);

            res.status(200).json({
                message: 'Code de vérification envoyé par email'
            });

        } catch (error) {
            console.error('Erreur lors de l\'envoi de l\'email:', error);
            res.status(500).json({
                message: 'Erreur lors de l\'envoi du code de récupération',
                error: error.message
            });
        }
    }

    // Réinitialisation du mot de passe
    async resetPassword(req, res) {
        try {
            const { email, code, newPassword } = req.body;

            // Trouver l'utilisateur
            const user = await Utilisateur.findOne({ where: { email } });
            if (!user) {
                return res.status(404).json({
                    message: 'Utilisateur non trouvé'
                });
            }

            // Vérifier le code et son expiration
            if (!user.resetCode || user.resetCode !== code) {
                return res.status(400).json({
                    message: 'Code de vérification invalide'
                });
            }

            if (!user.resetCodeExpiry || new Date() > user.resetCodeExpiry) {
                return res.status(400).json({
                    message: 'Code de vérification expiré'
                });
            }

            // Hasher le nouveau mot de passe
            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

            // Mettre à jour le mot de passe et supprimer le code de réinitialisation
            await user.update({
                motDePasse: hashedPassword,
                resetCode: null,
                resetCodeExpiry: null
            });

            res.status(200).json({
                message: 'Mot de passe réinitialisé avec succès'
            });

        } catch (error) {
            res.status(500).json({
                message: 'Erreur lors de la réinitialisation du mot de passe',
                error: error.message
            });
        }
    }

// controllers/AuthController.js - Corriger la méthode googleAuth

async googleAuth(req, res) {
  try {
    console.log('Données reçues pour Google Auth:', req.body);
    
    const { email, name, googleId, image } = req.body;
    
    if (!email || !name || !googleId) {
      return res.status(400).json({
        message: 'Données Google incomplètes'
      });
    }

    // Diviser le nom complet en prénom et nom
    const nameParts = name.split(' ');
    const prenom = nameParts[0] || '';
    const nom = nameParts.slice(1).join(' ') || '';

    // Vérifier si l'utilisateur existe déjà (syntaxe Sequelize correcte)
    let user = await Utilisateur.findOne({ 
      where: { 
        [Op.or]: [
          { email: email },
          { googleId: googleId }
        ]
      }
    });

    if (user) {
      console.log('Utilisateur existant trouvé:', user.email);
      // Utilisateur existant - mettre à jour le googleId si nécessaire
      if (!user.googleId) {
        await user.update({ 
          googleId, 
          profileImage: image 
        });
      }
    } else {
      console.log('Création d\'un nouvel utilisateur Google');
      // Nouvel utilisateur - créer le compte
      user = await Utilisateur.create({
        prenom,
        nom,
        email,
        googleId,
        profileImage: image,
        telephone: '', // Peut être rempli plus tard
        motDePasse: null, // Null pour Google Auth
        role: 'client',
        isGoogleUser: true
      });
    }

    // Générer le token JWT
    const token = jwt.sign(
      {
        userId: user.idUtilisateur,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Retourner les données utilisateur
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

    console.log('Authentification Google réussie pour:', user.email);

    res.status(200).json({
      message: 'Authentification Google réussie',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Erreur Google Auth détaillée:', error);
    res.status(500).json({
      message: 'Erreur lors de l\'authentification Google',
      error: error.message
    });
  }
}
}

module.exports = new AuthController();