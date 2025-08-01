// User Model
// Sequelize model for users table

const { DataTypes, Model } = require('sequelize');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { sequelize } = require('../config/database');

class User extends Model {
  // Helper methods
  async validatePassword(password) {
    return bcrypt.compare(password, this.password);
  }

  isTrialActive() {
    return this.subscription_status === 'trial' && 
           this.trial_ends_at && 
           new Date(this.trial_ends_at) > new Date();
  }

  canPostRequests() {
    return this.subscription_status === 'active' || this.isTrialActive();
  }

  toJSON() {
    const values = Object.assign({}, this.get());
    delete values.password;
    delete values.remember_token;
    return values;
  }
}

User.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  business_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  contact_person: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  email_verified_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  phone_verified_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  industries: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  verification_documents: {
    type: DataTypes.JSON,
    defaultValue: null
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0.00
  },
  total_reviews: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  subscription_status: {
    type: DataTypes.ENUM('trial', 'active', 'expired'),
    defaultValue: 'trial'
  },
  trial_ends_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  last_payment_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  remember_token: {
    type: DataTypes.STRING(100),
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'User',
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    }
  },
  indexes: [
    { fields: ['phone'] },
    { fields: ['email'] },
    { fields: ['subscription_status'] },
    { fields: ['location'] }
  ]
});

module.exports = User;