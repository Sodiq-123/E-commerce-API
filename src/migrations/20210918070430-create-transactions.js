'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Transactions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      transactionType: {
        type: Sequelize.ENUM
      },
      purpose: {
        type: Sequelize.ENUM
      },
      amount: {
        type: Sequelize.DECIMAL
      },
      accountId: {
        type: Sequelize.INTEGER
      },
      reference: {
        type: Sequelize.UUID
      },
      balanceBefore: {
        type: Sequelize.DECIMAL
      },
      balanceAfter: {
        type: Sequelize.DECIMAL
      },
      metadata: {
        type: Sequelize.JSON
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Transactions');
  }
};