// models/NewsletterCampaign.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const NewsletterCampaign = sequelize.define('NewsletterCampaign', {
  idCampaign: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  htmlContent: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('draft', 'sent', 'scheduled'),
    defaultValue: 'draft',
  },
  scheduledDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  sentDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  recipientCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: 'newsletter_campaigns',
  timestamps: true,
});

module.exports = NewsletterCampaign;