const { 
  creditAccount, debitAccount,
  getUserByEmail, createUser, getAllUsers,
  transfer, getBankById
} = require('../utils/helpers')
const { validateUser, validateAmount } = require('../utils/validations')
const { v4: uuidv4 } = require('uuid')
const bcrypt = require('bcrypt')
const model = require('../models')
const jwt = require('jsonwebtoken')
const { 
  createPaystackCustomer, withdraw,
  initiateTransfer, finalizeTransfer, initializeTransaction, verifyTransaction
} = require('../utils/paystack')
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

// WITHDRAW MONEY FROM YOUR WALLET TO BANK
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
    const withdraw_ = await withdraw(amount*100, bank.recipient_code, reason)
    if (!withdraw_) {
      res.status(400).json({
        message: 'Could not finalize withdraw',
        success: false
      })
    }
    const result = await debitAccount({
      amount: req.body.amount,
      user
    })
    if (!result.success) {
      res.status(400).json({
        message: 'Could not finalize withdraw',
        success: false
      })
    }
    return res.json({
      success: true,
      message: 'withdraw successful',
      data: result.data
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// INITIALIZE DEPOSIT TO YOUR WALLET
exports.initializeDeposit = async (req, res) => {
  try {
    const { amount } = req.body
    const validated = validateAmount(amount)
    if (!validated.success || validated.error) {
      return res.status(400).json({
        success: false,
        error: validated.error
      })
    }
    const initTRansaction = await initializeTransaction(amount, req.user.email)
    if (!initTRansaction || !initTRansaction.status) {
      return res.status(400).json({
        status: false, 
        message: 'Could not initialize transaction'
      })
    }
    return res.json({
        status: true, 
        message: 'transacton initialized successfully',
        data: initTRansaction
      })
  } catch (error) {
    return res.status(400).json({
        status: false, 
        message: error.message
      })
  }
}

// VERIFY DEPOSIT TO YOUR WALLET
exports.verifyDeposit = async (req, res) => {
  try {
    const { reference } = req.params
    const sent = await verifyTransaction(reference)
    if (!sent || !sent.status) {
      return res.status(400).json({
        status: false, 
        message: 'Could not verify transaction'
      })
    }
    console.log(sent.data.amount)
    const { amount } = sent.data

    const creditData = await creditAccount(amount/100, req.user)
    if (!creditData.success) {
      return res.json({
        status: true, 
        message: 'transacton could not be completed, reach out to us'
      })
    }
    return res.json({
        status: true, 
        message: 'transacton initialized successfully',
        data: creditData
      })
  } catch (error) {
    return res.status(400).json({
        status: false, 
        message: error.message
      })
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
