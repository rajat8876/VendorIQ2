'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('request_responses', {
      id: {
        type: Sequelize.CHAR(36),
        primaryKey: true,
        allowNull: false
      },
      request_id: {
        type: Sequelize.CHAR(36),
        allowNull: true,
        references: {
          model: 'service_requests',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      responder_id: {
        type: Sequelize.CHAR(36),
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      contact_info: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      price: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      timeline: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      attachments: {
        type: Sequelize.JSON,
        allowNull: true
      },
      is_selected: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
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
    await queryInterface.addIndex('request_responses', ['request_id'], { name: 'idx_request' });
    await queryInterface.addIndex('request_responses', ['responder_id'], { name: 'idx_responder' });
    await queryInterface.addIndex('request_responses', ['is_selected'], { name: 'idx_selected' });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('request_responses');
  }
};
