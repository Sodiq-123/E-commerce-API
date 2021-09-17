const { Model } = require('sequelize')
const { sequelize } = require('../../database/db')

module.exports = (sequelize, DataTypes) => {

    class Users extends Model {
        static associate(models) {
            Users.hasOne(models.account)
        }
    }
    Users.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            username: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false,
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
            modelName: 'users',
        }
    )
    return Users
}