const { Model } = require('sequelize')
const { sequelize } = require('../../database/db')

module.exports = (sequelize, DataTypes) => {
  class CardTransactions extends Model {
    static associate(models) {
      CardTransactions.belongsTo(models.account)
    }
  }
  CardTransactions.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      accountId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'account',
          key: 'id'
        }
      },
      externalReference: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      amount: {
        allowNull: false,
        type: DataTypes.DECIMAL(20, 4),
      },
      last_response: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      created_at: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    }
  )
}