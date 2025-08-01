// ServiceRequest Model
// Sequelize model for service_requests table

const { DataTypes, Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const { sequelize } = require('../config/database');

class ServiceRequest extends Model {
  // Scopes
  static getOpen() {
    return this.findAll({ where: { status: 'open' } });
  }

  static getByIndustry(industryId) {
    return this.findAll({ where: { industry_id: industryId } });
  }

  static getByLocation(location) {
    return this.findAll({
      where: {
        location: {
          [sequelize.Op.like]: `%${location}%`
        }
      }
    });
  }
}

ServiceRequest.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  industry_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
    references: {
      model: 'industries',
      key: 'id'
    }
  },
  category_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
    references: {
      model: 'categories',
      key: 'id'
    }
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  budget: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  deadline: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('open', 'fulfilled', 'closed'),
    defaultValue: 'open'
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  custom_fields: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  attachments: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  response_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  view_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  is_featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  sequelize,
  modelName: 'ServiceRequest',
  tableName: 'service_requests',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['status'] },
    { fields: ['industry_id'] },
    { fields: ['category_id'] },
    { fields: ['location'] },
    { fields: ['created_by'] },
    { fields: ['created_at'] }
  ]
});

module.exports = ServiceRequest;