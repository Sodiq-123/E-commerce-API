const { addCard, deleteCard } = require('../utils/helpers')
const { createCharge ,resolveCard, submitPin } = require('../utils/paystack')
const { encryptString, decryptString } = require('../../encrypt')
require('dotenv').config();

// Add card
exports.addCard = async (req, res) => {
  try {
    let {cardNumber, expiryMonth, expiryYear, cvv } = req.body
    const expDate = `${expiryMonth}/${expiryYear}`
    const userId = req.user.id
    const bin = cardNumber.substring(0, 6)
    cardNumber = await (await encryptString(cardNumber, process.env.ENCRYPTION_KEY)).data.encryptedData
    cvv = await (await encryptString(cvv, process.env.ENCRYPTION_KEY)).data.encryptedData

    // Resolve card in paystack
    const cardData = await resolveCard(bin)
    if (!cardData) {
      return res.status(400).json({
        success: false,
        message: 'card details are invalid'
      })
    }
    const newCard = await addCard(cardNumber, expDate, cvv, userId)
    if (!newCard) {
      return res.status(400).json({
        success: false,
        message: 'could not add card',
        data: null
      })
    }
    return res.status(201).json({
      success: true,
      message: 'card added successfully',
      data: newCard
    })
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    })
  }
}

// Delete card
exports.deleteCard = async (req, res) => {
  try {
    const { cardId } = req.params
    const card = await deleteCard(cardId)
    if (!card) {
      return res.status(400).json({
        success: false,
        message: 'could not delete card'
      })
    }
    return res.status(201).json({
      success: true,
      message: 'card deleted successfully',
      data: card
    })
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    })
  }
}

exports.createCharge = async (req, res) => {
  try {
    const { amount } = req.body
    // const card = 
    const charge = await createCharge(amount, req.user.email, card)
    if (!charge) {
      return res.status(400).json({
        success: false,
        message: 'could not create charge'
      })
    }

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    })
  }
}

exports.submitPin = async (req, res) => {
  try {
    const { reference, pin } = req.body
    const submit = await submitPin()
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    })
  }
}