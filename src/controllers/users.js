const { validateUser } = require('../utils/validations')
const { v4 } = require('uuid')
const bcrypt = require('bcrypt')
const model = require('../models')


/**
 * @description - Adds a new user to the database
 * 
 * @param {object} req - request object
 * 
 * @param {object} res - response object
 * 
 * @returns {object} - Object with success value (boolean) and message
 */

export const createUser = async (req, res) => {
  const t = await model.sequelize.transaction()
  try {
    const newUser = {
      email: req.body.email,
      username: req.body.username,
      password: req.body.password
    }
    validateUser(newUser)
    const existingUser = await model.users.findOne(
      { where: {
        email: req.body.username
      } },
      { transaction: t }
    )
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'user already exists',
      })
    }
    
    const user = await model.users.create(
      {
      email: req.body.email,
      username: req.body.username,
      password: await bcrypt.hash(req.body.password, 10),
      },
      { transaction: t }
    )
    await model.account.create(
      {
        userId: user.id,
        balance: 0
      }
    )
    await t.commit()

    return res.status(200).json({
      success: true,
      message: 'account successfully created'
    })
  } catch (error) {
    await t.rollback()
    return res.status.json({
      success: false,
      message: error.message
    })
  }
}