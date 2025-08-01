// RequestResponse Model
// Sequelize model for request_responses table

const { DataTypes, Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const { sequelize } = require('../config/database');

class RequestResponse extends Model {
  // Helper methods can be added here
}

RequestResponse.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  request_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'service_requests',
      key: 'id'
    }
  },
  responder_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  contact_info: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  timeline: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  attachments: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  is_selected: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  sequelize,
  modelName: 'RequestResponse',
  tableName: 'request_responses',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['request_id'] },
    { fields: ['responder_id'] },
    { fields: ['is_selected'] }
  ]
});

module.exports = RequestResponse;