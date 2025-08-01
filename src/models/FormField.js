// FormField Model
// Sequelize model for form_fields table

const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class FormField extends Model {
  // Helper methods can be added here
}

FormField.init({
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  category_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
    references: {
      model: 'categories',
      key: 'id'
    }
  },
  field_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  field_label: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  field_type: {
    type: DataTypes.ENUM('text', 'textarea', 'select', 'radio', 'checkbox', 'number', 'date', 'file'),
    allowNull: false
  },
  placeholder: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  is_required: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  validation_rules: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  options: {
    type: DataTypes.JSON,
    allowNull: true
  },
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  sequelize,
  modelName: 'FormField',
  tableName: 'form_fields',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = FormField;