const { Model } = require('sequelize')
const { sequelize } = require('../../database/db')

module.exports = (sequelize, DataTypes) => {

  class Transactions extends Model {
    static associate(models) {
      Transactions.belongsTo(models.account)
    }
  }
  Transactions.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      transactionType: {
        allowNull: false,
        type: DataTypes.ENUM('debit', 'credit'),
      },
      purpose: {
        type: DataTypes.ENUM('deposit', 'transfer', 'withdrawal', 'reversal'),
        allowNull: false,
      },
      amount: {
        allowNull: false,
        type: DataTypes.DECIMAL(20, 4),
      },
      accountId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      reference: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      balanceBefore: {
        allowNull: false,
        type: DataTypes.DECIMAL(20, 4),
      },
      balanceAfter: {
        allowNull: false,
        type: DataTypes.DECIMAL(20, 4),
      },
      metadata: {
        allowNull: false,
        type: DataTypes.JSON,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'Transactions',
    }
  )
  return Transactions
}