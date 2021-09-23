const { creditAccount, debitAccount, getUserByEmail, createUser, getAllUsers, transfer, getBankById, getBankByUserId } = require('../utils/helpers')
const { validateUser, validateAmount } = require('../utils/validations')
const { v4: uuidv4 } = require('uuid')
const bcrypt = require('bcrypt')
const model = require('../models')
const jwt = require('jsonwebtoken')
const { createPaystackCustomer, withdraw, initiateTransfer, finalizeTransfer } = require('../utils/paystack')
require('dotenv').config();


exports.createUser = async (req, res) => {
  // create user to dB
  // create paystack customer
  try {
    let { password, email, username } = req.body
    const validated = validateUser(email, username, password)
    if (!validated.success || validated.error) { 
      return res.status(400).json({ 
        success: false,
        error: validated.error
      }) 
    }
    existingUser = await getUserByEmail(email)
    console.log(existingUser)
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'user already exists',
      })
    }
    const customer = await createPaystackCustomer(email)
    console.log(customer);
    if (!customer) {
      return res.status(400).json({
        success: false,
        message: 'account creation failed',
      })
    }
    password = await bcrypt.hash(password, 10)
    let user = await createUser({email, username, password, paystack_customer_id: customer.data.customer_code})
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'account creation failed',
      })
    }
    delete user.password
    return res.status(200).json({
      success: true,
      message: 'account successfully created',
      data: user
    })
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    })
  }
}

exports.loginUser = async (req, res) => {
  try {
    const { email, username,  password } = req.body
    const validated = validateUser(email, username, password)
    if (!validated.success || validated.error) { 
      return res.status(400).json({ 
        success: false,
        error: validated.error
      }) 
    }
    const user = await getUserByEmail(email)
    // password_hash = bcrypt.compare()
    if (user && await bcrypt.compare(req.body.password, user.password)) {
      const token = jwt.sign(user.id, process.env.SECRET_KEY)
      delete user.password
      return res.status(200).json({
        success: true,
        message: 'logged In successfully',
        data: {...user, token}
      })
    }
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    })
  }
}


exports.profile = (req, res) => {
  const user = req.user
  return res.status(200).json({
    success: true,
    message: 'Fetched User Data',
    data: user
  })
}

// get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await getAllUsers()
    if (!users) {
      res.status(400).json({
        success: falreq, resse,
        message: 'Users not found'
      })
    }
    return res.status(200).json({
      success: true,
      message: 'Fetched all users',
      data: users
    })
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    })
  }
}

// FUND ACCOUNT BY BANK IN PAYSTACK
exports.initiateTransfer = async (req, res) => {
  try {
    const { amount, bankId } = req.body
    const validated = validateAmount(amount)
    if (!validated.success || validated.error) {
      return res.status(400).json({
        success: false,
        error: validated.error
      })
    }
    const user = await getUserByEmail(req.user.email)
    const bank = await getBankById(bankId)
    if (!bank) {
      return res.status(400).json({
        success: false,
        message: 'bank does not exist'
      })
    }
    const initiatedTransfer = await initiateTransfer(amount*100, bank.recipient_code)
    if (!initiatedTransfer) {
      return res.status(400).json({
        success: false,
        message: 'Funding failed'
      })
    }
    return res.status(200).json({
      success: true,
      message: 'Funding initiated',
      data: initiatedTransfer
    })
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    })
  }
}

exports.fundAccount = async (req, res) => {
  try {
    const { transferCode, otp } = req.body
    const finishedTransfer = await finalizeTransfer(transferCode, otp)
    const updatedUser = await creditAccount(finishedTransfer.data.amount/100, user, metadata={})
    if (!updatedUser) {
      return res.status(400).json({
        success: false,
        message: 'Funding failed'
      })
    }
    return res.status(200).json({
      success: true,
      message: 'Funding successful',
      data: updatedUser
    })
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    })
  }
}

// WITHDRAW TO BANK ACCOUNT
exports.withdraw = async (req, res) => {
  if (!req.body.amount  || typeof req.body.amount !== 'number' || req.body.amount < 10) {
    return res.status(400).json({
      success: false,
      message: 'amount is required and must be a number and should be greater than #10'
    })
  }
  try {
    const { bankId, amount, reason } = req.body

    if (req.user.balance < amount) {
      return res.status(400).json({
        success: false,
        message: 'insufficient funds'
      })
    }
    const bank = await getBankById(bankId)
    if (!bank) {
      return res.status(400).json({ 
        success: false, 
        message: 'bank does not exist'
      })
    }
    const withdraw = await withdraw(amount*100, bank.dataValues.recipient_code, reason)
    const result = await debitAccount({
      amount: req.body.amount,
      user
    })
    return {
      success: true,
      message: 'withdraw successful'
    }
  } catch (error) {
    return {
      success: false,
      message: error.message
    }
  }
}


// TRANSFER TO OTHER USERS
exports.transfer = async (req, res) => {
  try {
    const { amount, email } = req.body
    const validated = validateAmount(amount)
    if (!validated.success || validated.error) {
      return res.status(400).json({
        success: false,
        error: validated.error
      })
    }
    const user = req.user
    if (user.balance < amount) {
      return res.status(400).json({
        success: false,
        message: 'insufficient funds'
      })
    }
    const recipient = await getUserByEmail(email)
    const transferMoney = await transfer(amount, user, recipient)
    if (!transferMoney) {
      return res.status(400).json({
        success: false,
        message: 'transfer failed'
      })
    }
    return res.status(200).json({
      success: true,
      message: 'transfer successful',
      data: transferMoney
    })
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    })
  }
}
