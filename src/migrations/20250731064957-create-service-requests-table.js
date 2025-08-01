'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('service_requests', {
      id: {
        type: Sequelize.CHAR(36),
        primaryKey: true,
        allowNull: false
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      industry_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: true,
        references: {
          model: 'industries',
          key: 'id'
        }
      },
      category_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: true,
        references: {
          model: 'categories',
          key: 'id'
        }
      },
      location: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      budget: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      deadline: {
        type: Sequelize.DATE,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('open', 'fulfilled', 'closed'),
        defaultValue: 'open'
      },
      created_by: {
        type: Sequelize.CHAR(36),
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      custom_fields: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Dynamic field values'
      },
      attachments: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Array of file URLs'
      },
      response_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      view_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      is_featured: {
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
    await queryInterface.addIndex('service_requests', ['status'], { name: 'idx_status' });
    await queryInterface.addIndex('service_requests', ['industry_id'], { name: 'idx_industry' });
    await queryInterface.addIndex('service_requests', ['category_id'], { name: 'idx_category' });
    await queryInterface.addIndex('service_requests', ['location'], { name: 'idx_location' });
    await queryInterface.addIndex('service_requests', ['created_by'], { name: 'idx_created_by' });
    await queryInterface.addIndex('service_requests', ['created_at'], { name: 'idx_created_at' });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('service_requests');
  }
};
