const { axiox } = require('axios')
const { v4: uuidv4 } = require('axios')
const { model } = require('../models')
const { creditAccount } = require('../utils/helpers')
const {  } = require('../utils/paystack')
require('dotenv').config()



exports.chargeBank = async (req, res) => {
  const {
    userId,
    cardNumber,
    amount,
    description,
    reference, 
    token,
  } = req.body

  const creditAccount = await CreditAccount.findOne({
    where: {
      userId: userId,
    },
  })

  if (!creditAccount) {
    return res.status(401).json({
      success: false,
      message: 'Credit account not found',
    })
  }

  const tokenPayload = await axios.get(`${process.env.API_URL}/api/v1/tokens/${token}`)
  const tokenUserId = tokenPayload.data.userId

  if (userId !== tokenUserId) {
    return res.status(401).json({
      success: false,
      message: 'User not found',
    })
  }

  const transaction = await model.Transaction.create({
    userId: userId,
    cardNumber,
    amount,
    description,
    reference,
    status: 'pending',
  })
  
  const transactionId = transaction.id

  const transactionPayload = await axios.post(`${process.env.API_URL}/api/v1/transactions/${transactionId}/charge`, {
    userId: userId,
    cardNumber,
    amount,
    description,
    reference,
  })

  if (transactionPayload.status === 200) {
    return res.status(200).json({
      success: true,
      message: 'Transaction successful',
    })
  }

  return res.status(401).json({
    success: false,
    message: 'Transaction failed',
  })
}


exports.chargeCard = async (req, res) => {
  const {
    userId,
    cardNumber,
    amount,
    description,
    reference,
  } = req.body

  const user = await model.User.findOne({
    where: {
      id: userId,
    },
  })

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'User not found',
    })
  }

  const creditAccount = await CreditAccount.findOne({
    where: {
      userId: userId,
    },
  })

  if (!creditAccount) {
    return res.status(401).json({
      success: false,
      message: 'Credit account not found',
    })
  }

  const transaction = await model.Transaction.create({
    userId: userId,
    cardNumber,
    amount,
    description,
    reference,
    status: 'pending',
  })
  
  const transactionId = transaction.id

  const transactionPayload = await axios.post(`${process.env.API_URL}/api/v1/transactions/${transactionId}/charge`, {
    userId: userId,
    cardNumber,
    amount,
    description,
    reference,
  })

  if (transactionPayload.status === 200) {
    return res.status(200).json({
      success: true,
      message: 'Transaction successful',
    })
  }

  return res.status(401).json({
    success: false,
    message: 'Transaction failed',
  })
}



exports.addCard = async (req, res) => {
  const {
    cardNumber,
    expiryMonth, 
    expiryYear,
    cvv,
    pin
  } = req.body
  try {
    const card = await createPaystackCard(req.user.email, cardNumber, expiryDate=`${expiryMonth}+/${expiryYear}`, cvv, pin)
    if (!card) {
      return res.status(400).json({
        success: false,
        message: 'Card not succesfully aded',
      })
    }
    return res.status(200).json({
      success: true,
      message: 'Card successfully added',
      data: card
    })
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message,
    })
  }
}

exports.chargeCard = async (req, res) => {
  const payload = {
    card: {
      number: req.body.number,
      cvv: req.body.cvv,
      expDate: req.body.expDate,
    },
    email: req.user.email,
    amount: req.body.amount,
  };

  const headers = {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json',
  };

  const transaction = await model.sequelize.transaction();

  try {
    const { data } = await axios.post(
      'https://api.paystack.co/charge',
      payload,
      { headers }
    );

    if (data.status === true) {
      if (data.data.status === 'send_pin') {
        await model.cardTransaction.create(
          {
            externalReference: data.data.reference,
            amount: req.body.amount,
            userId: req.body.userId,
            lastResponse: 'true',
          },
          { transaction: t }
        );
        await transaction.commit();

        return res.status(200).json({
          success: true,
          message: 'please send pin',
        });
      }
      await CreditAccount({
        amount: data.data.amount,
        userID: req.body.userID,
        reference: uuidv4(),
        res,
        t,
        purpose: 'card-funding',
        meta: {
          externalReference: data.data.reference,
        },
      });
      await model.cardTransaction.create(
        {
          externalReference: data.data.reference,
          amount: data.data.amount,
          userId: req.body.userId,
          lastResponse: 'true',
        },
        { transaction }
      );
      await transaction.commit();
      res.status(200).json({
        success: true,
        message: 'card charged successfully',
      });
    }
  } catch (error) {
    await transaction.rollback();
    res.status(400).json({
      success: false,
      message: error.response.data,
    });
  }
};

exports.submitCardPin = async (req, res) => {
  const t = await model.sequelize.transaction();

  const payload = await model.cardTransaction.findOne(
    { where: { externalReference: req.body.reference } },
    { transaction: t }
  );

  const sendData = {
    reference: payload.externalReference,
    pin: req.body.pin,
    amount: payload.amount,
  };
  const headers = {
    Authorization: `Bearer ${process.env.PAYSTACK_API_KEY}`,
    'Content-Type': 'application/json',
  };
  try {
    const { data } = await axios.post(
      'https://api.paystack.co/charge/submit_pin',
      sendData,
      { headers }
    );

    if (data.data.status === 'success') {
      await CreditAccount({
        amount: payload.amount,
        userId: payload.userId,
        reference: uuidv4(),
        res,
        t,
        purpose: 'card-funding',
        meta: {
          externalReference: data.data.reference,
        },
      });
      await t.commit();
      res.status(200).json({
        success: true,
        msg: 'card charged successfully',
      });
    }
  } catch (err) {
    await t.rollback();
    res.status(400).json({
      success: false,
      msg: err.response.data,
    });
  }
};