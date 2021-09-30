const { addCard, deleteCard, getCard } = require('../utils/helpers')
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
    cardNumber = await (await encryptString(cardNumber)).data.encryptedData
    cvv = await (await encryptString(cvv)).data.encryptedData

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


exports.getCard = async (req, res) => {
  try {
    const { cardId } = req.params
    const card = await getCard(cardId)
    const cardObj = {}
    cardNo = await decryptString(card.dataValues.cardNumber)
    cvv = await decryptString(card.dataValues.CVV)
    cardObj.cardNumber = cardNo.data.decryptedData
    cardObj.CVV = cvv.data.decryptedData
    cardObj.expiryMonth = card.dataValues.expDate.split('/')[0]
    cardObj.expiryYear = card.dataValues.expDate.split('/')[1]
    if (!cardObj) {
      return res.status(400).json({
        success: false,
        message: 'could not get card'
      })
    }
    return res.status(201).json({
      success: true,
      message: 'card retrieved successfully',
      data: cardObj
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
    const { id } = req.params
    let myCard = await getCard(id)
    const card = {}
    let cardNo = await decryptString(myCard.dataValues.cardNumber)
    let cvv = await decryptString(myCard.dataValues.CVV)
    card.cvv = cvv.data.decryptedData
    card.number = cardNo.data.decryptedData
    card.expiry_month = myCard.dataValues.expDate.split('/')[0]
    card.expiry_year = myCard.dataValues.expDate.split('/')[1]
    const charge = await createCharge(amount, req.user.email, card)
    if (!charge) {
      return res.status(400).json({
        success: false,
        message: 'could not create charge'
      })
    }
    return res.status(201).json({
      success: true,
      message: 'charge created successfully',
      data: charge
    })

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
    const submit = await submitPin(reference, pin)
    console.log('Submit: ', submit)
    if (!submit) {
      return res.status(400).json({
        success: false,
        message: 'could not create charge'
      })
    }
    return res.status(201).json({
      success: true,
      message: 'card transaction successful',
      data: submit
    })
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    })
  }
}