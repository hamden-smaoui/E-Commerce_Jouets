const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { Op } = require('sequelize');

const Facture = sequelize.define('Facture', {
    idFacture: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    numeroFacture: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        // Format: FAC-YYYY-NNNNNN
    },
    idCommande: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'commandes',
            key: 'idCommande',
        },
    },
    dateFacture: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    dateEcheance: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    montantHT: {
        type: DataTypes.DOUBLE,
        allowNull: false,
    },
    montantTVA: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0,
    },
    montantTotal: {
        type: DataTypes.DOUBLE,
        allowNull: false,
    },
    tauxTVA: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 19,
    },
    statut: {
        type: DataTypes.ENUM('brouillon', 'envoyée', 'payée', 'en_retard', 'annulée'),
        allowNull: false,
        defaultValue: 'brouillon',
    },
    clientNom: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    clientEmail: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    clientTelephone: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    clientAdresse: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    entrepriseNom: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Votre Entreprise',
    },
    entrepriseAdresse: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    entrepriseTelephone: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    entrepriseEmail: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    entrepriseSiret: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    timestamps: true,
    tableName: 'factures',
    hooks: {
        beforeValidate: async (facture, options) => {
            if (!facture.numeroFacture) {
                // Générer automatiquement le numéro de facture
                const year = new Date().getFullYear();
                
                // Use the same transaction if available
                const transaction = options.transaction;
                
                const lastFacture = await Facture.findOne({
                    where: {
                        numeroFacture: {
                            [Op.like]: `FAC-${year}-%`
                        }
                    },
                    order: [['createdAt', 'DESC']],
                    transaction: transaction
                });
                
                let nextNumber = 1;
                if (lastFacture) {
                    const lastNumber = parseInt(lastFacture.numeroFacture.split('-')[2]);
                    nextNumber = lastNumber + 1;
                }
                
                facture.numeroFacture = `FAC-${year}-${nextNumber.toString().padStart(6, '0')}`;
            }
        }
    }
});

module.exports = Facture;