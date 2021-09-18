const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class Transactions extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Transactions.belongsTo(models.account)
    }
  }
  Transactions.init({
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
  }, {
    sequelize,
    modelName: 'transactions',
  })
  return Transactions
}