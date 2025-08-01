// Models Index
// Export all models and associations

const { sequelize } = require('../config/database');

// Import all models
const User = require('./User');
const ServiceRequest = require('./ServiceRequest');
const Industry = require('./Industry');
const Category = require('./Category');
const FormField = require('./FormField');
const RequestResponse = require('./RequestResponse');
const Review = require('./Review');
const Subscription = require('./Subscription');
const File = require('./File');

// Import associations
require('./associations');

// Create models object
const models = {
  User,
  ServiceRequest,
  Industry,
  Category,
  FormField,
  RequestResponse,
  Review,
  Subscription,
  File,
  sequelize
};

// Add sequelize instance to each model
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

module.exports = models;