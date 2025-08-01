'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.CHAR(36),
        primaryKey: true,
        allowNull: false
      },
      business_name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      contact_person: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      email_verified_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      phone_verified_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      location: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      industries: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Array of industry names'
      },
      is_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      verification_documents: {
        type: Sequelize.JSON,
        allowNull: true
      },
      rating: {
        type: Sequelize.DECIMAL(3,2),
        defaultValue: 0.00
      },
      total_reviews: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      subscription_status: {
        type: Sequelize.ENUM('trial', 'active', 'expired'),
        defaultValue: 'trial'
      },
      trial_ends_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      last_payment_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      remember_token: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('users', ['phone'], { name: 'idx_phone' });
    await queryInterface.addIndex('users', ['email'], { name: 'idx_email' });
    await queryInterface.addIndex('users', ['subscription_status'], { name: 'idx_subscription' });
    await queryInterface.addIndex('users', ['location'], { name: 'idx_location' });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  }
};
