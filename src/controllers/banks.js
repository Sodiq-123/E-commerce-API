const { addBank, getAllBanks, deleteBank, getBankById, getBankCodeFromSlug, getNameAndSlug } = require('../utils/helpers')
const { validateUser, validateAmount, transferAmount } = require('../utils/validations')
const model = require('../models')
const { 
  addBank: addPaystackBank,
  deleteBank: deletePaystackBank,
  resolveBank
} = require('../utils/paystack')
require('dotenv').config();

exports.addBank = async (req, res) => {
  try {
    const { accountNumber, bankSlug } = req.body
    const bankCode = getBankCodeFromSlug(bankSlug)
    if (!bankCode) {
      return res.status(400).json({
        sucess: 'false',
        message: 'Invalid bank details',
      })
    }
    bankData = await resolveBank(accountNumber, bankCode)
    if (!bankData.status || !bankData.data) {
      return res.status(400).json({
        sucess: 'false',
        message: 'Invalid bank details',
      })
    }
    const bank = await addPaystackBank(accountNumber, bankCode, bankData.data.account_name)
    if (!bank.status || !bank.data) {
      return res.status(400).json({
        success: false,
        message: 'failed to add bank',
        data: null
      })
    }
    const newBank = await addBank(
      accountNumber, bankCode, bankData.data.account_name, req.user.id, bank.data.recipient_code
    )
    if (!newBank) {
      return res.status(400).json({
        success: false,
        message: 'failed to add bank',
        data: null
      })
    }
    return res.status(201).json({
      success: true,
      message: 'bank added successfully',
      data: newBank
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    })
  }
}

exports.deleteBank = async (req, res) => {
  try {
    const { bankId } = req.params
    let bank = await getBankById(bankId)
    if (!bank) {
      return res.status(404).json({
        status: false,
        message: 'Bank not found',
        data: null
      })
    }
    deletePaystackBank(bank.dataValues.recipient_code)
    bank = await deleteBank(bankId)
    if (!bank) {
      return res.status(400).json({
        status: false,
        message: 'failed to delete bank',
        data: null
      })
    }
    return res.status(200).json({
      status: true,
      message: 'bank deleted successfully',
      data: bank
    })
  } catch (error) {
    res.status(400).json({
      status: 400,
      message: error.message
    })
  }
}

exports.getAllBanks = async (req, res) => {
  try {
    let banks = await getAllBanks(req.user.id)
    return res.status(200).json({
      status: true,
      message: 'banks fetched successfully',
      data: banks
    })
  } catch (error) {
    res.status(400).json({
      status: 400,
      message: error.message
    })
  }
}


exports.getNameAndSlug = async (req, res) => {
  try {
    let banks = await getNameAndSlug()
    return res.status(200).json({
      status: true,
      message: 'Names and slugs fetched',
      data: banks
    })
  } catch (error) {
    res.status(200).json({
      success: false,
      message: 'Not found'
    })
  }
}
