const { CreditAccount, DebitAccount } = require('../utils/helpers')
const { validateUser, validateAmount } = require('../utils/validations')
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

/**
 * @description - Deposit money to a user's wallet
 * 
 * @param {Object} req - request object
 * 
 * @param {Object} res - response object
 * 
 * @returns {Object} - Object with success value (boolean) and message
 */

export const deposit = async (req, res) => {
  validateAmount(req.body.accountId, req.body.amount)
  const t = await model.sequelize.transaction()
  try {
    const credit = await CreditAccount({
      accountId: req.body.accountId,
      amount: req.body.amount,
      reference: v4(),
      purpose: 'deposit',
      t,
      res,
      meta: {}
    })

    await t.commit()
    return res.status(200).json({
      success: true,
      message: 'deposit successful'
    })
  } catch (error) {
    await t.rollback()
    return res.status(400).json({
      success: false,
      message: error.message
    })
  }
}


/**
 * @description - Withdraw money from wallet
 * 
 * @param {Object} req - request object
 * 
 * @param {Object} res - response object
 * 
 * @returns {Object} - Object with success value (boolean) and message
 */

export const withdraw = async (req, res) => {
  validateAmount(req.body.accountId, req.body.amount)
  const t = await model.sequelize.transaction()
  try {
    const result = await DebitAccount({
      accountId: req.body.accountId,
      amount: req.body.amount,
      reference: v4(),
      purpose: 'withdraw',
      t,
      res,
      meta: {}
    })

    await t.commit()
    return res.status(200).json({
      success: true,
      message: 'withdraw successful'
    })
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    })
  }
}