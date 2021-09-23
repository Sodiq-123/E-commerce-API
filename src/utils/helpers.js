const model = require('../models')
const bcrypt = require('bcrypt')
const { v4: uuidv4 } = require('uuid')
const banks = require('../banks.json')
const { default: axios } = require('axios')
require('dotenv').config()


const transaction =  async () => await model.sequelize.transaction()

exports.getBankCodeFromSlug = (bankSlug) => {
  const bank = banks.find(bank => bank.slug === bankSlug)
  return bank.code
}

exports.getBankNameFromSlug = (bankSlug) => {
  const bank = banks.find(bank => bank.slug === bankSlug)
  return bank.name
}

exports.getBankNameFromCode = (bankCode) => {
  const bank = banks.find(bank => bank.code === bankCode)
  return bank.name
}

exports.createUser = async ({ email, password, username, paystack_customer_id }) => {

  try{
      const user = await model.users.create(
      {
        email,
        username,
        password,
        paystack_customer_id
      },
    )
    return user?.dataValues
  } catch (err) {
    console.log(err)
  }
}

exports.getUserByEmail = async (email) => {
  const user = await model.users.findOne(
    { where: {
        email
      },}
    )
  return user?.dataValues
}

exports.getUserById = async (id) => {
  const user = await model.users.findByPk(id)
  return user?.dataValues
}

exports.getBankById = async (id) => {
  const bank = await model.banks.findByPk(id)
  return bank?.dataValues
}

exports.getBankByUserId = async (id) => {
  const bank = await model.users.findByPk(id)
  return banks.dataValues
}

exports.getAllUsers = async () => {
  const users = await model.users.findAll({
    where: {}
  })
  return users
}


exports.creditAccount = async (
  amount,
  user,
  metadata
  ) => {
  try {
      await model.users.increment(
        { balance: user.amount },
        { 
          where: { email },
          transaction: await transaction()
        }
      )

    const newTransaction = await model.transactions.create(
      {
        transactionType: 'credit',
        amount,
        userId: user.id,
        reference: uuidv4(),
        purpose: 'deposit',
        metadata,
        balanceBefore: Number(user.balance),
        balanceAfter: Number(user.balance) + Number(amount)
      }
    )
    await (await transaction()).commit()
    return {
        success: true,
        message: 'Successfully updated user account',
        data: newTransaction.dataValues
      }
    } catch (error) {
      await (await transaction()).rollback()
      return {
        success: false,
        message: error.message,
        data: null
      }
  }
}


exports.debitAccount = async (
  amount,
  user,
  metadata
  ) => {
  try {
    await model.users.decrement(
      { balance: amount },
      { 
        where: { email: user.email },
        transaction: await transaction()
      }
    )

    const newTransaction = await model.transactions.create(
      {
        transactionType: 'debit',
        amount,
        userId: user.id,
        reference: uuidv4(),
        purpose: 'withdraw',
        metadata: JSON.stringify(metadata || {
          reason: 'withdrawal'
        }),
        balanceBefore: Number(user.balance),
        balanceAfter: Number(user.balance) - Number(amount)
      }
    )
    await (await transaction()).commit()
    return {
        success: true,
        message: 'Successfully updated user account',
        data: newTransaction.dataValues
      }
    } catch (error) {
      await (await transaction()).rollback()
      return {
        success: false,
        message: error.message,
        data: null
      }
  }
}


exports.transfer = async (
  amount,
  sender,
  recipient,
  ) => {
  try {
    // remove money from sender's account
    await model.users.decrement(
      { balance: amount },
      { 
        where: { email: sender.email }
      }
    )
    console.log('decrementing...');
    // create transaction for sender
    const debitTransaction = await model.transactions.create(
      {
        transactionType: 'debit',
        amount,
        userId: sender.id,
        reference: uuidv4(),
        purpose: 'transfer',
        metadata: JSON.stringify({
          recipient: recipient.email
        }),
        balanceBefore: Number(sender.balance),
        balanceAfter: Number(sender.balance) - Number(amount)
      }
    )
    console.log('debit', debitTransaction)

    await model.users.increment(
      { balance: amount },
      { 
        where: { email: recipient.email }
      }
    )

    const creditTransaction = await model.transactions.create(
      {
        transactionType: 'credit',
        amount,
        userId: recipient.id,
        reference: uuidv4(),
        purpose: 'transfer',
        metadata: {
          recipient: sender.email
        },
        balanceBefore: Number(recipient.balance),
        balanceAfter: Number(recipient.balance) + Number(amount)
      }
    )
    return {
        credit: creditTransaction.dataValues,
        debit: debitTransaction.dataValues
      }
    } catch (error) {
      await (await transaction()).rollback()
      console.log(error.message)
  }
}

exports.fundWallet = async (amount, user) => {
  try {
    await model.users.increment(
      { balance: amount },
      {
        where: { email: user.email }
      }
    )
    const newTransaction = await model.transactions.create(
      {
        transactionType: 'credit',
        amount,
        userId: user.id,
        reference: uuidv4(),
        purpose: 'deposit',
        metadata: {
          reason: 'fund wallet'
        },
        balanceBefore: Number(user.balance),
        balanceAfter: Number(user.balance) + Number(amount)
      }
    )
    return {
      success: true,
      message: 'Successfully updated user account',
      data: newTransaction.dataValues
    }
  } catch (error) {
    return {
      success: false,
      message: error.message,
      data: null
    }
  }
}

exports.addCard = async (
  cardNumber,
  expiryMonth,
  expiryYear,
  cvv,
  email,
  paystack_customer_id
  ) => {
  try {
    const card = await model.cards.create(
      {
        cardNumber,
        expiryMonth,
        expiryYear,
        cvv,
        email,
        paystack_customer_id
      }
    )
    return card
  } catch (error) {
    console.log(error)
  }
}

exports.editCard = async (
  cardNumber,
  expiryMonth,
  expiryYear,
  cvv,
  email,
  paystack_customer_id
  ) => {
  try {
    const card = await model.cards.update(
      {
        cardNumber,
        expiryMonth,
        expiryYear,
        cvv,
        email,
        paystack_customer_id
      },
      { where: {
        emailgetAll
      }, transaction: await transaction() }
    )
    await (await transaction()).commit()
    return card
  } catch (error) {
    await (await transaction()).rollback()
  }
}


exports.deleteCard = async (
  email
  ) => {
  try {
    const card = await model.cards.destroy(
      { where: {
        email
      } }
    )
    return card
  } catch (error) {
    console.log(error)
  }
}

exports.addBank = async (
  accountNumber,
  bankCode,
  accountName,
  userId,
  recipient_code
) => {
  try {
    const bank = await model.banks.create(
      {
        accountNumber,
        bankCode,
        accountName,
        userId,
        recipient_code,
        bankName: this.getBankNameFromCode(bankCode)
      }
    )
    return bank
  } catch (error) {
    console.log(error)
  }
}

exports.deleteBank = async id => {
  try {
    const bank = await model.banks.destroy(
      { where: {
        id
      } }
    )
    return bank
  } catch (error) {
    console.log(error)
  }
}

exports.getAllBanks = async id => {
  try {
    const bank = await model.banks.findAll({ where: {userId: id}})
    return bank
  } catch (error) {
    console.log(error)
  }
}

exports.getNameAndSlug = async () => {
  return banks.map(bank => ({name: bank.name, slug: bank.slug}))
}
