// Model Associations
// Define relationships between all models

const User = require('./User');
const ServiceRequest = require('./ServiceRequest');
const Industry = require('./Industry');
const Category = require('./Category');
const FormField = require('./FormField');
const RequestResponse = require('./RequestResponse');
const Review = require('./Review');
const Subscription = require('./Subscription');
const File = require('./File');

// User associations
User.hasMany(ServiceRequest, {
  foreignKey: 'created_by',
  as: 'serviceRequests'
});

User.hasMany(RequestResponse, {
  foreignKey: 'responder_id',
  as: 'responses'
});

User.hasMany(Review, {
  foreignKey: 'reviewer_id',
  as: 'givenReviews'
});

User.hasMany(Review, {
  foreignKey: 'reviewed_id',
  as: 'receivedReviews'
});

User.hasMany(Subscription, {
  foreignKey: 'user_id',
  as: 'subscriptions'
});

User.hasMany(File, {
  foreignKey: 'user_id',
  as: 'files'
});

// ServiceRequest associations
ServiceRequest.belongsTo(User, {
  foreignKey: 'created_by',
  as: 'creator'
});

ServiceRequest.belongsTo(Industry, {
  foreignKey: 'industry_id',
  as: 'industry'
});

ServiceRequest.belongsTo(Category, {
  foreignKey: 'category_id',
  as: 'category'
});

ServiceRequest.hasMany(RequestResponse, {
  foreignKey: 'request_id',
  as: 'responses'
});

ServiceRequest.hasMany(Review, {
  foreignKey: 'request_id',
  as: 'reviews'
});

// Industry associations
Industry.hasMany(Category, {
  foreignKey: 'industry_id',
  as: 'categories'
});

Industry.hasMany(ServiceRequest, {
  foreignKey: 'industry_id',
  as: 'serviceRequests'
});

// Category associations
Category.belongsTo(Industry, {
  foreignKey: 'industry_id',
  as: 'industry'
});

Category.hasMany(FormField, {
  foreignKey: 'category_id',
  as: 'formFields'
});

Category.hasMany(ServiceRequest, {
  foreignKey: 'category_id',
  as: 'serviceRequests'
});

// FormField associations
FormField.belongsTo(Category, {
  foreignKey: 'category_id',
  as: 'category'
});

// RequestResponse associations
RequestResponse.belongsTo(ServiceRequest, {
  foreignKey: 'request_id',
  as: 'serviceRequest'
});

RequestResponse.belongsTo(User, {
  foreignKey: 'responder_id',
  as: 'responder'
});

// Review associations
Review.belongsTo(ServiceRequest, {
  foreignKey: 'request_id',
  as: 'serviceRequest'
});

Review.belongsTo(User, {
  foreignKey: 'reviewer_id',
  as: 'reviewer'
});

Review.belongsTo(User, {
  foreignKey: 'reviewed_id',
  as: 'reviewed'
});

// Subscription associations
Subscription.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

// File associations
File.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

module.exports = {
  User,
  ServiceRequest,
  Industry,
  Category,
  FormField,
  RequestResponse,
  Review,
  Subscription,
  File
};