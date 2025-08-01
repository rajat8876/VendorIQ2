'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('form_fields', {
      id: {
        type: Sequelize.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
      },
      category_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: true,
        references: {
          model: 'categories',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      field_name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      field_label: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      field_type: {
        type: Sequelize.ENUM('text', 'number', 'date', 'select', 'textarea', 'checkbox', 'radio'),
        defaultValue: 'text'
      },
      placeholder: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      is_required: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      validation_rules: {
        type: Sequelize.JSON,
        allowNull: true
      },
      options: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'For select/radio fields'
      },
      sort_order: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
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
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('form_fields');
  }
};
