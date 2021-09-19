const { CreditAccount, DebitAccount } = require('../utils/helpers')
const { validateUser, validateAmount, transferAmount } = require('../utils/validations')
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

/**
 * @description - Transfer money from wallet to another user's wallet
 * 
 * @param {Object} req - request object
 * 
 * @param {Object} res - response object
 * 
 * @returns {Object} - Object with success value (boolean) and message
 */

export const transfer = async (req, res) => {
  transferAmount(req.body.senderId, req.body.receiverId, req.body.amount)
  const t = await model.sequelize.transaction()
  try {
    await Promise.all([
      DebitAccount({
        amount: req.body.amount,
        accountId: req.body.senderId,
        reference: v4(),
        purpose: 'transfer',
        res,
        t,
        meta: {
          recipient: req.body.recipientId,
        },
      }),
      CreditAccount({
        amount: req.body.amount,
        accountId: req.body.recipientId,
        reference: v4(),
        res,
        t,
        purpose: 'deposit',
        meta: {
          sender: req.body.senderId,
        },
      }),
    ])

    await t.commit()
    return res.status(200).json({
      success: true,
      message: 'transfer successful'
    })
  } catch (error) {
    await t.rollback()
    res.status(400).json({
      success: false,
      message: error.message
    })
  }
}

/**
 * @description - Reverse a transaction
 * 
 * @param {Object} req - request object
 * 
 * @param {Object} res - response object
 * 
 * @returns {Object} - Object with success value (boolean) and message
 */

export const reversal = async (req, res) => {
  const t = await model.sequelize.transaction()
  try {
    const transactions = await model.transactions.findAll(
      { where: { 
        reference: req.body.reference
       } },
       { transaction: t }
    )

    if (transactions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reference id'
      })
    }

    const transactionList = transactions.map((transaction) => {
      if (transaction.transactionType === 'debit') {
        return CreditAccount({
          amount: transaction.amount,
          accountId: transaction.accountId,
          reference: v4(),
          res,
          t,
          purpose: 'reversal',
          meta: {
            originalReference: transaction.reference
          }
        })
      }

      return DebitAccount({
        amount: transaction.amount,
        accountId: transaction.accountId,
        reference: v4(),
        purpose: 'debit',
        res,
        t,
        meta: {
          originalReference: transaction.reference
        },
      })
    })

    await Promise.all(transactionList)
    await t.commit()
    return res.status(200).json({
      success: true,
      message: 'reversal successful'
    })
  } catch (error) {
    await t.rollback()
    res.status(400).json({
      success: false,
      message: error.message
    })
  }
}